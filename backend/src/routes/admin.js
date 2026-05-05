const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../database');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { encrypt, maskCPF, maskPhone } = require('../crypto-utils');

const router = express.Router();
router.use(verifyToken, requireAdmin);

// ── ALUNOS ────────────────────────────────────────────────────────────────────

router.get('/students', (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.name, u.email, u.photo, u.created_at,
           s.id as student_id, s.matricula, s.semester, s.cpf, s.phone
    FROM users u
    JOIN students s ON s.user_id = u.id
    ORDER BY u.name
  `).all();

  // Descriptografa para mascarar — nunca expõe dado em claro na listagem
  const safe = rows.map((r) => {
    const { cpf, phone, ...rest } = r;
    return {
      ...rest,
      cpf_masked:   maskCPF(db._decrypt(cpf)),
      phone_masked: maskPhone(db._decrypt(phone)),
    };
  });

  res.json(safe);
});

router.post('/students', (req, res) => {
  const { name, email, password, semester, cpf, phone } = req.body;
  if (!name || !email || !password || !semester) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const emailClean = email.toLowerCase().trim().slice(0, 254);
  const nameClean  = name.trim().slice(0, 120);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres.' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(emailClean);
  if (exists) return res.status(409).json({ error: 'E-mail já cadastrado.' });

  const hash = bcrypt.hashSync(password, 12); // rounds=12 em produção
  const year = new Date().getFullYear();
  const count = Number(db.prepare('SELECT COUNT(*) as c FROM students').get().c);
  const matricula = `MED${year}${String(count + 1).padStart(4, '0')}`;

  // Criptografa dados sensíveis antes de persistir
  const cpfRaw   = cpf  ? String(cpf).replace(/\D/g, '').slice(0, 11)  : null;
  const phoneRaw = phone ? String(phone).replace(/\D/g, '').slice(0, 11) : null;
  const cpfEnc   = encrypt(cpfRaw);
  const phoneEnc = encrypt(phoneRaw);

  let result;
  try {
    db.exec('BEGIN');

    const ur = db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run(nameClean, emailClean, hash, 'student');

    const userId = Number(ur.lastInsertRowid);
    const sr = db.prepare(
      'INSERT INTO students (user_id, matricula, semester, cpf, phone) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, matricula, Number(semester), cpfEnc, phoneEnc);

    const studentId = Number(sr.lastInsertRowid);
    const subjects  = db.prepare('SELECT id FROM subjects WHERE semester = ? ORDER BY code').all(Number(semester));
    const enrollStmt  = db.prepare('INSERT OR IGNORE INTO enrollments (student_id, subject_id) VALUES (?, ?)');
    const gradeStmt   = db.prepare('INSERT OR IGNORE INTO grades (enrollment_id) VALUES (?)');
    const attendStmt  = db.prepare('INSERT OR IGNORE INTO attendance (enrollment_id, total_classes, absences) VALUES (?, ?, ?)');

    for (const subj of subjects) {
      const er = enrollStmt.run(studentId, subj.id);
      const eid = Number(er.lastInsertRowid);
      if (eid) { gradeStmt.run(eid); attendStmt.run(eid, 0, 0); }
    }

    db.exec('COMMIT');
    result = { matricula };
  } catch (err) {
    db.exec('ROLLBACK');
    return res.status(500).json({ error: 'Erro ao criar aluno.' });
  }

  res.status(201).json({ message: 'Aluno criado.', matricula: result.matricula });
});

router.delete('/students/:id', (req, res) => {
  const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Aluno não encontrado.' });
  db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);
  res.json({ message: 'Aluno removido.' });
});

// ── DISCIPLINAS ───────────────────────────────────────────────────────────────

router.get('/subjects', (req, res) => {
  res.json(db.prepare('SELECT * FROM subjects ORDER BY semester, name').all());
});

router.post('/subjects', (req, res) => {
  const { code, name, semester, workload } = req.body;
  if (!code || !name || !semester || !workload) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  try {
    db.prepare('INSERT INTO subjects (code, name, semester, workload) VALUES (?, ?, ?, ?)').run(
      String(code).toUpperCase().trim().slice(0, 20),
      String(name).trim().slice(0, 100),
      Number(semester),
      Number(workload)
    );
    res.status(201).json({ message: 'Disciplina criada.' });
  } catch {
    res.status(409).json({ error: 'Código já existe.' });
  }
});

router.delete('/subjects/:id', (req, res) => {
  const r = db.prepare('DELETE FROM subjects WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Disciplina não encontrada.' });
  res.json({ message: 'Disciplina removida.' });
});

// ── MATRÍCULAS / NOTAS ────────────────────────────────────────────────────────

router.get('/students/:studentId/enrollments', (req, res) => {
  const rows = db.prepare(`
    SELECT e.id as enrollment_id, subj.id as subject_id,
           subj.code, subj.name, subj.semester, subj.workload,
           g.n1, g.n2, g.n3, g.final_exam,
           a.total_classes, a.absences
    FROM enrollments e
    JOIN subjects subj ON subj.id = e.subject_id
    LEFT JOIN grades     g ON g.enrollment_id = e.id
    LEFT JOIN attendance a ON a.enrollment_id = e.id
    WHERE e.student_id = ?
    ORDER BY subj.semester, subj.name
  `).all(req.params.studentId);
  res.json(rows);
});

router.put('/enrollments/:enrollmentId/grades', (req, res) => {
  const { n1, n2, n3, final_exam } = req.body;
  const id = Number(req.params.enrollmentId);
  if (!db.prepare('SELECT id FROM enrollments WHERE id = ?').get(id)) {
    return res.status(404).json({ error: 'Matrícula não encontrada.' });
  }
  const toNum = (v) => (v !== null && v !== undefined && String(v) !== '') ? Math.min(10, Math.max(0, Number(v))) : null;
  db.prepare(`
    INSERT INTO grades (enrollment_id, n1, n2, n3, final_exam, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(enrollment_id) DO UPDATE SET
      n1=excluded.n1, n2=excluded.n2, n3=excluded.n3,
      final_exam=excluded.final_exam, updated_at=CURRENT_TIMESTAMP
  `).run(id, toNum(n1), toNum(n2), toNum(n3), toNum(final_exam));
  res.json({ message: 'Notas atualizadas.' });
});

router.put('/enrollments/:enrollmentId/attendance', (req, res) => {
  const { total_classes, absences } = req.body;
  const id = Number(req.params.enrollmentId);
  const tc = Math.max(0, Number(total_classes) || 0);
  const ab = Math.max(0, Number(absences)      || 0);
  if (ab > tc) return res.status(400).json({ error: 'Faltas não podem exceder o total de aulas.' });
  if (!db.prepare('SELECT id FROM enrollments WHERE id = ?').get(id)) {
    return res.status(404).json({ error: 'Matrícula não encontrada.' });
  }
  db.prepare(`
    INSERT INTO attendance (enrollment_id, total_classes, absences, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(enrollment_id) DO UPDATE SET
      total_classes=excluded.total_classes, absences=excluded.absences, updated_at=CURRENT_TIMESTAMP
  `).run(id, tc, ab);
  res.json({ message: 'Frequência atualizada.' });
});

router.post('/enrollments', (req, res) => {
  const { student_id, subject_id } = req.body;
  if (!student_id || !subject_id) return res.status(400).json({ error: 'student_id e subject_id obrigatórios.' });
  try {
    const er = db.prepare('INSERT INTO enrollments (student_id, subject_id) VALUES (?, ?)').run(student_id, subject_id);
    const eid = Number(er.lastInsertRowid);
    db.prepare('INSERT INTO grades (enrollment_id) VALUES (?)').run(eid);
    db.prepare('INSERT INTO attendance (enrollment_id, total_classes, absences) VALUES (?, 0, 0)').run(eid);
    res.status(201).json({ message: 'Aluno matriculado.' });
  } catch {
    res.status(409).json({ error: 'Aluno já matriculado nessa disciplina.' });
  }
});

router.delete('/enrollments/:enrollmentId', (req, res) => {
  const r = db.prepare('DELETE FROM enrollments WHERE id = ?').run(req.params.enrollmentId);
  if (r.changes === 0) return res.status(404).json({ error: 'Matrícula não encontrada.' });
  res.json({ message: 'Matrícula removida.' });
});

module.exports = router;

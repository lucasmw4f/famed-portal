const express = require('express');
const db = require('../database');
const { verifyToken, requireStudent } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken, requireStudent);

router.get('/profile', (req, res) => {
  const user = db.prepare('SELECT id, name, email, photo, created_at FROM users WHERE id = ?').get(req.user.id);
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user.id);
  if (!user || !student) return res.status(404).json({ error: 'Perfil não encontrado.' });

  const { cpf, phone, ...rest } = student;
  res.json({
    ...user,
    ...rest,
    cpf:   db._decrypt(cpf),
    phone: db._decrypt(phone),
  });
});

router.put('/photo', (req, res) => {
  const { photo } = req.body;
  if (!photo || typeof photo !== 'string') {
    return res.status(400).json({ error: 'Foto inválida.' });
  }
  if (!photo.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Formato de imagem inválido.' });
  }
  // Limita tamanho da base64 (~1.5MB raw = ~2MB base64)
  if (photo.length > 2_000_000) {
    return res.status(400).json({ error: 'Imagem muito grande. Máximo 1.5MB.' });
  }
  db.prepare('UPDATE users SET photo = ? WHERE id = ?').run(photo, req.user.id);
  res.json({ message: 'Foto atualizada.' });
});

router.get('/enrollments', (req, res) => {
  const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id);
  if (!student) return res.status(404).json({ error: 'Aluno não encontrado.' });

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
  `).all(student.id);

  res.json(rows);
});

module.exports = router;

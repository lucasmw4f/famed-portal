const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path   = require('path');
const { encrypt, decrypt } = require('./crypto-utils');

const DB_FILE = process.env.DB_PATH || path.join(__dirname, '../../famed.db');
const db = new DatabaseSync(DB_FILE);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.exec(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matricula TEXT UNIQUE NOT NULL,
  semester INTEGER NOT NULL DEFAULT 1,
  cpf TEXT,
  phone TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  semester INTEGER NOT NULL,
  workload INTEGER NOT NULL DEFAULT 80
)`);

db.exec(`CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(student_id, subject_id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enrollment_id INTEGER NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
  n1 REAL, n2 REAL, n3 REAL, final_exam REAL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.exec(`CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enrollment_id INTEGER NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
  total_classes INTEGER NOT NULL DEFAULT 0,
  absences INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Migração segura para bases existentes
try { db.exec('ALTER TABLE students ADD COLUMN cpf TEXT'); } catch {}
try { db.exec('ALTER TABLE students ADD COLUMN phone TEXT'); } catch {}

// ── SEED: ADMIN ───────────────────────────────────────────────────────────────

const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('Admin@123', 10);
  db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
    'Administrador', 'admin@famed.edu.br', hash, 'admin'
  );
  console.log('Admin criado: admin@famed.edu.br / Admin@123');
}

// ── SEED: DISCIPLINAS ─────────────────────────────────────────────────────────

const allSubjects = [
  // 1º Semestre
  { code: 'MED101', name: 'Anatomia Humana',            semester: 1, workload: 120 },
  { code: 'MED102', name: 'Bioquímica Médica',           semester: 1, workload: 80  },
  { code: 'MED103', name: 'Histologia e Embriologia',    semester: 1, workload: 80  },
  { code: 'MED104', name: 'Biofísica Médica',            semester: 1, workload: 60  },
  // 2º Semestre
  { code: 'MED201', name: 'Fisiologia Humana',           semester: 2, workload: 100 },
  { code: 'MED202', name: 'Microbiologia Médica',        semester: 2, workload: 80  },
  { code: 'MED203', name: 'Parasitologia',               semester: 2, workload: 60  },
  { code: 'MED204', name: 'Imunologia Básica',           semester: 2, workload: 60  },
  // 3º Semestre
  { code: 'MED301', name: 'Farmacologia Geral',          semester: 3, workload: 80  },
  { code: 'MED302', name: 'Patologia Geral',             semester: 3, workload: 100 },
  { code: 'MED303', name: 'Genética Médica',             semester: 3, workload: 60  },
  { code: 'MED304', name: 'Saúde Coletiva I',            semester: 3, workload: 60  },
  // 4º Semestre
  { code: 'MED401', name: 'Semiologia Médica',           semester: 4, workload: 120 },
  { code: 'MED402', name: 'Saúde Mental',                semester: 4, workload: 80  },
  { code: 'MED403', name: 'Radiologia Básica',           semester: 4, workload: 60  },
  { code: 'MED404', name: 'Saúde Coletiva II',           semester: 4, workload: 60  },
  // 5º Semestre — 12 disciplinas
  { code: 'MED501', name: 'Clínica Médica I',            semester: 5, workload: 160 },
  { code: 'MED502', name: 'Cirurgia Geral I',            semester: 5, workload: 120 },
  { code: 'MED503', name: 'Ginecologia',                 semester: 5, workload: 80  },
  { code: 'MED504', name: 'Pediatria I',                 semester: 5, workload: 80  },
  { code: 'MED505', name: 'Neurologia Clínica',          semester: 5, workload: 80  },
  { code: 'MED506', name: 'Ortopedia e Traumatologia',   semester: 5, workload: 80  },
  { code: 'MED507', name: 'Dermatologia',                semester: 5, workload: 60  },
  { code: 'MED508', name: 'Urologia',                    semester: 5, workload: 60  },
  { code: 'MED509', name: 'Oftalmologia',                semester: 5, workload: 60  },
  { code: 'MED510', name: 'Otorrinolaringologia',        semester: 5, workload: 60  },
  { code: 'MED511', name: 'Ética Médica e Bioética',     semester: 5, workload: 40  },
  { code: 'MED512', name: 'Medicina de Urgência I',      semester: 5, workload: 80  },
  // 6º Semestre
  { code: 'MED601', name: 'Clínica Médica II',           semester: 6, workload: 160 },
  { code: 'MED602', name: 'Cirurgia Geral II',           semester: 6, workload: 120 },
  { code: 'MED603', name: 'Obstetrícia',                 semester: 6, workload: 100 },
  { code: 'MED604', name: 'Pediatria II',                semester: 6, workload: 80  },
];

{
  const stmt = db.prepare('INSERT OR IGNORE INTO subjects (code, name, semester, workload) VALUES (?, ?, ?, ?)');
  for (const s of allSubjects) stmt.run(s.code, s.name, s.semester, s.workload);
}

// ── SEED: ALUNOS DE TESTE ─────────────────────────────────────────────────────

function seedStudent({ name, email, cpf, phone, semester, grades }) {
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return;

  const hash = bcrypt.hashSync('Aluno@2024', 10);
  const year = new Date().getFullYear();
  const count = Number(db.prepare('SELECT COUNT(*) as c FROM students').get().c);
  const matricula = `MED${year}${String(count + 1).padStart(4, '0')}`;

  db.exec('BEGIN');
  try {
    const ur = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(name, email, hash, 'student');
    const userId = Number(ur.lastInsertRowid);

    const sr = db.prepare('INSERT INTO students (user_id, matricula, semester, cpf, phone) VALUES (?, ?, ?, ?, ?)').run(userId, matricula, semester, encrypt(cpf), encrypt(phone));
    const studentId = Number(sr.lastInsertRowid);

    const subjects = db.prepare('SELECT id FROM subjects WHERE semester = ? ORDER BY code').all(semester);

    for (let i = 0; i < subjects.length; i++) {
      const subj = subjects[i];
      const er = db.prepare('INSERT OR IGNORE INTO enrollments (student_id, subject_id) VALUES (?, ?)').run(studentId, subj.id);
      const enrollId = Number(er.lastInsertRowid);
      if (!enrollId) continue;

      const g = grades[i] || {};
      db.prepare('INSERT INTO grades (enrollment_id, n1, n2, n3, final_exam) VALUES (?, ?, ?, ?, ?)').run(
        enrollId, g.n1 ?? null, g.n2 ?? null, g.n3 ?? null, g.final ?? null
      );
      db.prepare('INSERT INTO attendance (enrollment_id, total_classes, absences) VALUES (?, ?, ?)').run(
        enrollId, g.total ?? 0, g.abs ?? 0
      );
    }

    db.exec('COMMIT');
    console.log(`Aluno criado: ${name} (${matricula}) — senha: Aluno@2024`);
  } catch (err) {
    db.exec('ROLLBACK');
    console.error(`Erro ao criar ${name}:`, err.message);
  }
}

// Lucas Maritan Whitaker — notas ótimas
seedStudent({
  name: 'Lucas Maritan Whitaker',
  email: 'lucas.whitaker@famed.edu.br',
  cpf: '47554406884',
  phone: '16993557170',
  semester: 5,
  grades: [
    // MED501 Clínica Médica I
    { n1: 9.5, n2: 9.2, n3: 9.4, total: 80, abs: 2 },
    // MED502 Cirurgia Geral I
    { n1: 9.0, n2: 9.5, n3: 9.1, total: 70, abs: 1 },
    // MED503 Ginecologia
    { n1: 9.8, n2: 9.3, n3: 9.6, total: 50, abs: 0 },
    // MED504 Pediatria I
    { n1: 9.2, n2: 9.7, n3: 9.3, total: 50, abs: 1 },
    // MED505 Neurologia Clínica
    { n1: 9.0, n2: 9.4, n3: 9.2, total: 50, abs: 2 },
    // MED506 Ortopedia e Traumatologia
    { n1: 9.5, n2: 9.1, n3: 9.3, total: 50, abs: 0 },
    // MED507 Dermatologia
    { n1: 9.3, n2: 9.8, n3: 9.5, total: 40, abs: 1 },
    // MED508 Urologia
    { n1: 9.1, n2: 9.2, n3: 9.4, total: 40, abs: 0 },
    // MED509 Oftalmologia
    { n1: 9.7, n2: 9.3, n3: 9.5, total: 40, abs: 1 },
    // MED510 Otorrinolaringologia
    { n1: 9.4, n2: 9.6, n3: 9.3, total: 40, abs: 0 },
    // MED511 Ética Médica e Bioética
    { n1: 9.8, n2: 9.9, n3: 9.7, total: 30, abs: 0 },
    // MED512 Medicina de Urgência I
    { n1: 9.2, n2: 9.5, n3: 9.0, total: 50, abs: 2 },
  ],
});

// Gabriel Luca Maritan — notas boas e médias
seedStudent({
  name: 'Gabriel Luca Maritan',
  email: 'gabriel.maritan@famed.edu.br',
  cpf: '46280467864',
  phone: '16991540115',
  semester: 5,
  grades: [
    { n1: 7.5, n2: 7.0, n3: 7.2, total: 80, abs: 8  },
    { n1: 8.0, n2: 7.5, n3: 7.8, total: 70, abs: 6  },
    { n1: 6.5, n2: 6.8, n3: 7.0, total: 50, abs: 7  },
    { n1: 7.8, n2: 8.0, n3: 7.5, total: 50, abs: 5  },
    { n1: 7.0, n2: 7.2, n3: 7.5, total: 50, abs: 10 },
    { n1: 8.5, n2: 8.0, n3: 8.2, total: 50, abs: 4  },
    { n1: 6.8, n2: 7.0, n3: 6.5, total: 40, abs: 8  },
    { n1: 7.2, n2: 7.5, n3: 7.0, total: 40, abs: 5  },
    { n1: 8.0, n2: 7.8, n3: 8.2, total: 40, abs: 3  },
    { n1: 7.5, n2: 7.0, n3: 7.2, total: 40, abs: 6  },
    { n1: 8.5, n2: 8.8, n3: 8.5, total: 30, abs: 2  },
    { n1: 7.0, n2: 7.5, n3: 7.2, total: 50, abs: 9  },
  ],
});

// Caio Faleiros Xavier — notas médias e boas (1 em exame final → aprovado)
seedStudent({
  name: 'Caio Faleiros Xavier',
  email: 'caio.xavier@famed.edu.br',
  cpf: '48248261875',
  phone: '16994269229',
  semester: 5,
  grades: [
    { n1: 6.0, n2: 5.8, n3: 6.2, total: 80, abs: 15 },
    { n1: 7.0, n2: 6.5, n3: 7.0, total: 70, abs: 10 },
    { n1: 5.5, n2: 6.0, n3: 5.8, total: 50, abs: 10 },
    { n1: 7.5, n2: 7.0, n3: 7.2, total: 50, abs: 8  },
    { n1: 5.2, n2: 5.5, n3: 5.3, total: 50, abs: 12 },
    { n1: 6.5, n2: 6.0, n3: 6.8, total: 50, abs: 9  },
    // Dermatologia: média 4.33 → exame final 7.0 → nova média 5.67 → Aprovado
    { n1: 4.0, n2: 4.5, n3: 4.5, final: 7.0, total: 40, abs: 8 },
    { n1: 6.0, n2: 5.5, n3: 6.2, total: 40, abs: 7  },
    { n1: 7.0, n2: 6.5, n3: 7.0, total: 40, abs: 5  },
    { n1: 5.5, n2: 5.8, n3: 5.5, total: 40, abs: 8  },
    { n1: 7.5, n2: 7.8, n3: 7.5, total: 30, abs: 3  },
    { n1: 5.5, n2: 5.0, n3: 5.5, total: 50, abs: 12 },
  ],
});

// Pedro Henrique de Sousa — notas médias e boas
seedStudent({
  name: 'Pedro Henrique de Sousa',
  email: 'pedro.sousa@famed.edu.br',
  cpf: '45322056890',
  phone: '16991666423',
  semester: 5,
  grades: [
    { n1: 6.5, n2: 6.0, n3: 6.8, total: 80, abs: 14 },  // MED501
    { n1: 7.5, n2: 7.0, n3: 7.2, total: 70, abs: 9  },  // MED502
    { n1: 5.8, n2: 6.2, n3: 6.0, total: 50, abs: 11 },  // MED503
    { n1: 8.0, n2: 7.5, n3: 7.8, total: 50, abs: 7  },  // MED504
    { n1: 5.5, n2: 6.0, n3: 5.8, total: 50, abs: 13 },  // MED505
    { n1: 7.0, n2: 6.5, n3: 7.2, total: 50, abs: 8  },  // MED506
    { n1: 6.2, n2: 6.8, n3: 6.5, total: 40, abs: 9  },  // MED507
    { n1: 5.5, n2: 5.8, n3: 6.0, total: 40, abs: 8  },  // MED508
    { n1: 7.2, n2: 6.8, n3: 7.0, total: 40, abs: 6  },  // MED509
    { n1: 6.0, n2: 6.5, n3: 6.2, total: 40, abs: 9  },  // MED510
    { n1: 8.0, n2: 7.5, n3: 7.8, total: 30, abs: 3  },  // MED511
    { n1: 6.5, n2: 6.0, n3: 6.5, total: 50, abs: 11 },  // MED512
  ],
});

// Expõe decrypt para as rotas descriptografarem dados sensíveis ao servir
db._decrypt = decrypt;

module.exports = db;

const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path   = require('path');
const { encrypt, decrypt } = require('./crypto-utils');

const DB_FILE = process.env.DB_PATH || path.join(__dirname, '../../fiap.db');
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

try { db.exec('ALTER TABLE students ADD COLUMN cpf TEXT'); } catch {}
try { db.exec('ALTER TABLE students ADD COLUMN phone TEXT'); } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN photo TEXT'); } catch {}

// ── SEED: ADMIN ───────────────────────────────────────────────────────────────

const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('Admin@123', 10);
  db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
    'Administrador', 'admin@fiap.com.br', hash, 'admin'
  );
  console.log('Admin criado: admin@fiap.com.br / Admin@123');
}

// ── SEED: DISCIPLINAS — ADS FIAP (4 semestres) ────────────────────────────────

const allSubjects = [
  // 1º Semestre
  { code: 'ADS1001', name: 'Lógica de Programação e Algoritmos',  semester: 1, workload: 80  },
  { code: 'ADS1002', name: 'Fundamentos de Banco de Dados',       semester: 1, workload: 60  },
  { code: 'ADS1003', name: 'Engenharia de Software',              semester: 1, workload: 60  },
  { code: 'ADS1004', name: 'Fundamentos em Computação em Nuvem',  semester: 1, workload: 60  },
  { code: 'ADS1005', name: 'Design Thinking',                     semester: 1, workload: 40  },
  { code: 'ADS1006', name: 'Comunicação e Expressão Digital',     semester: 1, workload: 40  },
  // 2º Semestre
  { code: 'ADS2001', name: 'Programação Orientada a Objetos',     semester: 2, workload: 80  },
  { code: 'ADS2002', name: 'Desenvolvimento Web com Java',        semester: 2, workload: 80  },
  { code: 'ADS2003', name: 'Banco de Dados Não-Relacional',       semester: 2, workload: 60  },
  { code: 'ADS2004', name: 'Gestão de Projetos Ágeis',            semester: 2, workload: 60  },
  { code: 'ADS2005', name: 'Arquitetura e Organização de Computadores', semester: 2, workload: 60  },
  // 3º Semestre
  { code: 'ADS3001', name: 'Desenvolvimento Mobile',              semester: 3, workload: 80  },
  { code: 'ADS3002', name: 'Inteligência Artificial',             semester: 3, workload: 80  },
  { code: 'ADS3003', name: 'DevOps & Continuous Delivery',        semester: 3, workload: 80  },
  { code: 'ADS3004', name: 'Segurança da Informação',             semester: 3, workload: 60  },
  { code: 'ADS3005', name: 'Qualidade e Testes de Software',      semester: 3, workload: 60  },
  // 4º Semestre
  { code: 'ADS4001', name: 'Projeto Integrado',                   semester: 4, workload: 120 },
  { code: 'ADS4002', name: 'Arquiteturas Disruptivas e Emergentes', semester: 4, workload: 80  },
  { code: 'ADS4003', name: 'Machine Learning e Big Data',         semester: 4, workload: 80  },
  { code: 'ADS4004', name: 'Startup e Empreendedorismo Tech',     semester: 4, workload: 40  },
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
  let matricula;
  do {
    const rand = crypto.randomInt(100000, 999999);
    matricula = `RM${rand}`;
  } while (db.prepare('SELECT 1 FROM students WHERE matricula = ?').get(matricula));

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

// Lucas Maritan Whitaker — 3º sem, notas excelentes
seedStudent({
  name: 'Lucas Maritan Whitaker',
  email: 'lucas.whitaker@fiap.com.br',
  cpf: '47554406884',
  phone: '16993557170',
  semester: 3,
  grades: [
    // ADS3001 Desenvolvimento Mobile
    { n1: 9.5, n2: 9.2, n3: 9.4, total: 80, abs: 2 },
    // ADS3002 Inteligência Artificial
    { n1: 9.0, n2: 9.5, n3: 9.1, total: 80, abs: 1 },
    // ADS3003 DevOps & Continuous Delivery
    { n1: 9.8, n2: 9.3, n3: 9.6, total: 80, abs: 0 },
    // ADS3004 Segurança da Informação
    { n1: 9.2, n2: 9.7, n3: 9.3, total: 80, abs: 1 },
    // ADS3005 Qualidade e Testes de Software
    { n1: 9.0, n2: 9.4, n3: 9.2, total: 80, abs: 2 },
  ],
});

// Gabriel Luca Maritan — 3º sem, notas boas
seedStudent({
  name: 'Gabriel Luca Maritan',
  email: 'gabriel.maritan@fiap.com.br',
  cpf: '46280467864',
  phone: '16991540115',
  semester: 3,
  grades: [
    { n1: 7.5, n2: 7.0, n3: 7.2, total: 80, abs: 8  },
    { n1: 8.0, n2: 7.5, n3: 7.8, total: 80, abs: 6  },
    { n1: 6.5, n2: 6.8, n3: 7.0, total: 80, abs: 7  },
    { n1: 7.8, n2: 8.0, n3: 7.5, total: 80, abs: 5  },
    { n1: 7.0, n2: 7.2, n3: 7.5, total: 80, abs: 10 },
  ],
});

// Caio Faleiros Xavier — 2º sem, um em prova sub (aprovado) e um aguardando sub
seedStudent({
  name: 'Caio Faleiros Xavier',
  email: 'caio.xavier@fiap.com.br',
  cpf: '48248261875',
  phone: '16994269229',
  semester: 2,
  grades: [
    // ADS2001 POO — aprovado
    { n1: 6.0, n2: 5.8, n3: 6.2, total: 80, abs: 15 },
    // ADS2002 Dev Web — aprovado
    { n1: 7.0, n2: 6.5, n3: 7.0, total: 80, abs: 10 },
    // ADS2003 BD NoSQL — média 4.33 → sub 7.0 → nova média 5.67 → aprovado
    { n1: 4.0, n2: 4.5, n3: 4.5, final: 7.0, total: 80, abs: 8 },
    // ADS2004 Gest. Proj. — aprovado
    { n1: 7.5, n2: 7.0, n3: 7.2, total: 80, abs: 8  },
    // ADS2005 Arq. Comp. — média 5.1, aguarda prova sub
    { n1: 5.0, n2: 5.2, n3: 5.1, total: 80, abs: 12 },
  ],
});

// Pedro Henrique de Sousa — 2º sem, notas médias
seedStudent({
  name: 'Pedro Henrique de Sousa',
  email: 'pedro.sousa@fiap.com.br',
  cpf: '45322056890',
  phone: '16991666423',
  semester: 2,
  grades: [
    { n1: 6.5, n2: 6.0, n3: 6.8, total: 80, abs: 14 },
    { n1: 7.5, n2: 7.0, n3: 7.2, total: 80, abs: 9  },
    { n1: 6.8, n2: 6.2, n3: 6.5, total: 80, abs: 11 },
    { n1: 8.0, n2: 7.5, n3: 7.8, total: 80, abs: 7  },
    { n1: 6.5, n2: 6.0, n3: 6.8, total: 80, abs: 13 },
  ],
});

db._decrypt = decrypt;
module.exports = db;

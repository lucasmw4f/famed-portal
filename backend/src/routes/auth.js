const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../database');
const { verifyToken, SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  // Sempre compara o hash mesmo se o usuário não existir — evita timing attack
  const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(
    email.toLowerCase().trim().slice(0, 254)
  );
  const hashToCompare = user ? user.password_hash : DUMMY_HASH;
  const valid = bcrypt.compareSync(password, hashToCompare);

  if (!user || !valid) {
    return res.status(401).json({ error: 'Email ou senha incorretos.' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    SECRET,
    { expiresIn: '8h' }
  );

  // Só retorna dados mínimos — sem hash, sem dados sensíveis
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.get('/me', verifyToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json(user);
});

module.exports = router;

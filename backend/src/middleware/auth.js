const jwt = require('jsonwebtoken');

// Em produção o JWT_SECRET deve ter pelo menos 32 caracteres.
// Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    console.error('ERRO FATAL: JWT_SECRET ausente ou fraco (mínimo 32 caracteres).');
    process.exit(1);
  } else {
    console.warn('AVISO: Usando JWT_SECRET inseguro (apenas para desenvolvimento).');
  }
}

const SECRET = JWT_SECRET || 'famed-dev-insecure-secret-min-32-chars!!';

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticação necessária.' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), SECRET);
    next();
  } catch {
    // Nunca revela o motivo específico (token expirado, inválido, etc.)
    res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Acesso não autorizado.' });
  next();
}

function requireStudent(req, res, next) {
  if (req.user?.role !== 'student') return res.status(403).json({ error: 'Acesso não autorizado.' });
  next();
}

module.exports = { verifyToken, requireAdmin, requireStudent, SECRET };

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
const path    = require('path');

const app = express();

// ── Segurança: headers HTTP ────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],  // necessário para Vite inline scripts
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }, // HTTPS obrigatório por 1 ano
}));

// ── CORS ───────────────────────────────────────────────────────────────────────
// Em produção: a UI é servida pelo próprio Express, então CORS externo não é necessário.
// Em desenvolvimento: permite o servidor Vite (localhost:5173).
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGIN || false
    : 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '50kb' })); // Limite no payload — evita ataques de body gigante

// ── Rate limiting: login ───────────────────────────────────────────────────────
// Máximo 10 tentativas por IP a cada 15 minutos — bloqueia força bruta.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' },
  skipSuccessfulRequests: true, // Só conta tentativas falhas
});

// Rate limiting geral: 200 req/min por IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em breve.' },
});

// ── Rotas ──────────────────────────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter);
app.use('/api', apiLimiter);

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/admin',   require('./routes/admin'));
app.use('/api/student', require('./routes/student'));

// ── Error handler ──────────────────────────────────────────────────────────────
// Nunca expõe stack trace ou detalhes internos ao cliente
app.use((err, req, res, _next) => {
  console.error('[ERROR]', req.method, req.path, err.message);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// ── Frontend estático (produção) ───────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const DIST = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(DIST));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`FAMED rodando na porta ${PORT} [${process.env.NODE_ENV || 'development'}]`));

const crypto = require('node:crypto');

// Em produção, ENCRYPTION_KEY deve ser uma string hex de 64 caracteres (32 bytes).
// Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const RAW = process.env.ENCRYPTION_KEY;

if (process.env.NODE_ENV === 'production' && !RAW) {
  console.error('ERRO FATAL: ENCRYPTION_KEY não definida. O servidor não pode iniciar.');
  process.exit(1);
}

// Em desenvolvimento usa uma chave derivada estável (não segura, apenas funcional).
const KEY = RAW
  ? Buffer.from(RAW.slice(0, 64).padEnd(64, '0'), 'hex')
  : crypto.scryptSync('famed-dev-only-not-for-production', 'famed-salt-v1', 32);

/**
 * Cifra um valor com AES-256-GCM.
 * Retorna: "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 */
function encrypt(text) {
  if (text === null || text === undefined || text === '') return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

/**
 * Decifra um valor produzido por encrypt().
 * Retorna null se o valor for inválido, null ou não criptografado.
 */
function decrypt(val) {
  if (!val || typeof val !== 'string') return null;
  const parts = val.split(':');
  if (parts.length !== 3) return null; // valor não criptografado
  try {
    const [ivH, tagH, encH] = parts;
    const iv  = Buffer.from(ivH,  'hex');
    const tag = Buffer.from(tagH, 'hex');
    const enc = Buffer.from(encH, 'hex');
    const d = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
  } catch {
    return null;
  }
}

// CPF: 47554406884 → ***.***.*68-84
function maskCPF(raw) {
  if (!raw) return null;
  const d = raw.replace(/\D/g, '');
  if (d.length !== 11) return '***';
  return `***.***.•${d.slice(6, 9)}-${d.slice(9)}`;
}

// Telefone: 16993557170 → (**) *****-7170
function maskPhone(raw) {
  if (!raw) return null;
  const d = raw.replace(/\D/g, '');
  if (d.length === 11) return `(**) *****-${d.slice(7)}`;
  if (d.length === 10) return `(**) ****-${d.slice(6)}`;
  return '***';
}

module.exports = { encrypt, decrypt, maskCPF, maskPhone };

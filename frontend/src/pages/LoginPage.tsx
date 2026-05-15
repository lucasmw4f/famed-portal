import { useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RED = '#F5004A';
const BG  = '#0A0A0A';

const DOTS = Array.from({ length: 130 }, (_, i) => ({
  x: ((Math.sin(i * 2.3999) * 0.5 + 0.5) * 100).toFixed(2),
  y: ((Math.cos(i * 5.0831) * 0.5 + 0.5) * 100).toFixed(2),
  r: (Math.abs(Math.sin(i * 1.618)) * 1.6 + 0.4).toFixed(2),
  o: (Math.abs(Math.sin(i * 0.713)) * 0.13 + 0.03).toFixed(3),
}));

export default function LoginPage() {
  const { login, user } = useAuth();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent]   = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/aluno'} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        html, body { background: ${BG}; }

        /* ── layout ── */
        .login-root {
          min-height: 100dvh;
          display: flex;
          background: ${BG};
          position: relative;
          overflow: hidden;
        }
        .login-left {
          display: none;
          flex: 1;
          align-items: center;
          justify-content: center;
          padding: 60px;
          position: relative;
          z-index: 1;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .login-divider {
          display: none;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
          width: 1px;
          height: 55%;
          background: rgba(255,255,255,0.1);
          z-index: 2;
          pointer-events: none;
        }
        .login-right {
          width: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
          box-sizing: border-box;
          padding: 0 24px;
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        .login-tagline-mobile { display: block; margin-bottom: 28px; }
        .login-logo { margin-bottom: 28px; }

        /* ── inputs e botões ── */
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
          padding: 13px 14px;
          font-size: 16px; /* 16px previne zoom automático no iOS */
          color: rgba(255,255,255,0.85);
          outline: none;
          color-scheme: dark;
          box-sizing: border-box;
          transition: border-color .15s;
          -webkit-appearance: none;
        }
        .login-input:focus { border-color: ${RED}; }
        .login-btn {
          width: 100%;
          background: ${RED};
          border: none;
          border-radius: 3px;
          padding: 14px;
          color: white;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 2.5px;
          cursor: pointer;
          transition: opacity .15s;
          -webkit-appearance: none;
          min-height: 48px;
        }
        .login-btn:hover:not(:disabled) { opacity: 0.82; }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── autofill dark ── */
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:hover,
        .login-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 60px #1a1a1a inset !important;
          -webkit-text-fill-color: rgba(255,255,255,0.85) !important;
          caret-color: white !important;
        }

        /* ── desktop ── */
        @media (min-width: 1024px) {
          .login-left    { display: flex; }
          .login-divider { display: block; }
          .login-right   { width: 50%; padding: 0 8%; }
          .login-tagline-mobile { display: none; }
          .login-logo    { margin-bottom: 40px; }
        }

        /* ── tablet ── */
        @media (min-width: 640px) and (max-width: 1023px) {
          .login-right { padding: 0 14%; }
        }
      `}</style>

      <div className="login-root">

        {/* Partículas */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
          {DOTS.map((d, i) => <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.r} fill="white" opacity={d.o} />)}
        </svg>

        {/* Brilho atmosférico */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 55% 60% at 28% 50%, rgba(245,0,74,0.07) 0%, transparent 70%)' }} />

        {/* Linha divisória desktop */}
        <div className="login-divider" />

        {/* Painel esquerdo — tagline desktop */}
        <div className="login-left">
          <h1 style={{ fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', lineHeight: 1.05, fontSize: 'clamp(42px, 4.5vw, 62px)', letterSpacing: 1, margin: 0, userSelect: 'none' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>CONECTE-SE COM</span><br />
            <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>SUA </span>
            <span style={{ color: RED, fontWeight: 900 }}>JORNADA</span><br />
            <span style={{ color: RED, fontWeight: 900 }}>ACADÊMICA</span>
          </h1>
        </div>

        {/* Painel direito — form */}
        <div className="login-right">

          {/* Área central com flex-grow para centrar verticalmente */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 40, paddingBottom: 20 }}>

            {/* Logo */}
            <div className="login-logo">
              <span style={{ color: RED, fontWeight: 900, fontSize: 26, letterSpacing: 3, fontFamily: 'Arial Black, Arial, sans-serif', userSelect: 'none' }}>FIAP</span>
            </div>

            {/* Tagline mobile */}
            <div className="login-tagline-mobile">
              <h1 style={{ fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', lineHeight: 1.08, fontSize: 'clamp(26px, 7vw, 34px)', letterSpacing: 1, margin: '0 0 28px', userSelect: 'none' }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>CONECTE-SE COM<br />SUA </span>
                <span style={{ color: RED, fontWeight: 900 }}>JORNADA<br />ACADÊMICA</span>
              </h1>
            </div>

            {/* Erro */}
            {error && (
              <div style={{ marginBottom: 16, padding: '11px 14px', borderRadius: 4, fontSize: 14, color: '#ff8aaa', background: 'rgba(245,0,74,0.1)', border: '1px solid rgba(245,0,74,0.25)' }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div>
                <label style={{ display: 'block', color: RED, fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', marginBottom: 8 }}>USUÁRIO *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="login-input" placeholder="usuario@fiap.com.br" autoComplete="email" />
              </div>

              <div>
                <label style={{ display: 'block', color: RED, fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', marginBottom: 8 }}>SENHA *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    className="login-input" placeholder="••••••••" style={{ paddingRight: 44 }} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 4, display: 'flex', alignItems: 'center', minWidth: 32, minHeight: 32, justifyContent: 'center' }}>
                    {showPass
                      ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                      : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? 'ENTRANDO...' : 'LOGAR'}
              </button>
            </form>

            <button onClick={() => { setResetModal(true); setResetSent(false); setResetEmail(''); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 16, cursor: 'pointer', padding: '8px 0', minHeight: 44, transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
              Esqueci minha senha
            </button>
          </div>

          {/* Rodapé */}
          <div style={{ textAlign: 'center', paddingBottom: 20 }}>
            <p style={{ color: 'rgba(255,255,255,0.13)', fontSize: 11 }}>© Ministério da Educação · {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Modal: esqueci minha senha */}
      {resetModal && (
        <div onClick={() => setResetModal(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: '100%', maxWidth: 380, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 14 }}>Redefinir senha</span>
              <button onClick={() => setResetModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 22, lineHeight: 1, padding: '0 4px', minWidth: 32, minHeight: 32 }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              {!resetSent ? (
                <>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
                    Informe seu e-mail cadastrado. Enviaremos um link para redefinição de senha.
                  </p>
                  <label style={{ display: 'block', color: RED, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', marginBottom: 8 }}>E-MAIL *</label>
                  <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                    placeholder="usuario@fiap.com.br" autoFocus
                    className="login-input" style={{ marginBottom: 16 }} />
                  <button onClick={() => resetEmail && setResetSent(true)} className="login-btn" style={{ opacity: resetEmail ? 1 : 0.45, cursor: resetEmail ? 'pointer' : 'not-allowed' }}>
                    ENVIAR LINK
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <p style={{ fontSize: 32, marginBottom: 12 }}>✉️</p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>E-mail enviado!</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>
                    Verifique sua caixa de entrada em<br />
                    <span style={{ color: RED }}>{resetEmail}</span>
                  </p>
                  <button onClick={() => setResetModal(false)}
                    style={{ marginTop: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '10px 28px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', minHeight: 44 }}>
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

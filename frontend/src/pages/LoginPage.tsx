import { useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FIAP_RED = '#F5004A';
const BG = '#0A0A0A';

// Partículas com posições determinísticas (parecem aleatórias)
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

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/aluno'} replace />;
  }

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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '3px',
    padding: '10px 14px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.85)',
    outline: 'none',
    colorScheme: 'dark',
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', overflow: 'hidden', position: 'relative' }}>

      {/* Partículas SVG — espalhadas aleatoriamente */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        {DOTS.map((d, i) => (
          <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.r} fill="white" opacity={d.o} />
        ))}
      </svg>

      {/* Brilho atmosférico sutil à esquerda */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 60% at 28% 50%, rgba(245,0,74,0.07) 0%, transparent 70%)',
      }} />

      {/* Linha divisória vertical centralizada (não ocupa a tela toda) */}
      <div className="lg-flex" style={{
        display: 'none',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '1px',
        height: '55%',
        background: 'rgba(255,255,255,0.1)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* ── Painel esquerdo — tagline ── */}
      <div style={{
        flex: 1,
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        zIndex: 1,
      }} className="lg-flex">
        <h1 style={{
          fontFamily: "'Arial', sans-serif",
          textTransform: 'uppercase',
          lineHeight: 1.05,
          fontSize: 'clamp(42px, 4.5vw, 62px)',
          letterSpacing: '1px',
          margin: 0,
          userSelect: 'none',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>CONECTE-SE COM</span><br />
          <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>SUA </span>
          <span style={{ color: FIAP_RED, fontWeight: 900 }}>JORNADA</span><br />
          <span style={{ color: FIAP_RED, fontWeight: 900 }}>ACADÊMICA</span>
        </h1>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div style={{
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        padding: '0 10%',
        boxSizing: 'border-box',
        minHeight: '100vh',
      }} className="form-panel">

        {/* Form — centro vertical */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 0' }}>

        {/* Logo FIAP — texto estilizado acima dos campos */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{
            color: FIAP_RED,
            fontWeight: 900,
            fontSize: '28px',
            letterSpacing: '3px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            userSelect: 'none',
          }}>FIAP</span>
        </div>

        {/* Tagline mobile */}
        <div style={{ marginBottom: '36px' }} className="tagline-mobile">
          <h1 style={{
            fontFamily: "'Arial', sans-serif",
            textTransform: 'uppercase',
            lineHeight: 1.05,
            fontSize: '36px',
            letterSpacing: '1px',
            margin: 0,
            userSelect: 'none',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>CONECTE-SE COM<br />SUA </span>
            <span style={{ color: FIAP_RED, fontWeight: 900 }}>JORNADA<br />ACADÊMICA</span>
          </h1>
        </div>

        {/* Erro */}
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '3px',
            fontSize: '13px',
            color: '#ff8aaa',
            background: 'rgba(245,0,74,0.1)',
            border: '1px solid rgba(245,0,74,0.25)',
          }}>
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Usuário */}
          <div>
            <label style={{
              display: 'block',
              color: FIAP_RED,
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.8px',
              marginBottom: '8px',
            }}>
              USUÁRIO *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = FIAP_RED)}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          {/* Senha */}
          <div>
            <label style={{
              display: 'block',
              color: FIAP_RED,
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.8px',
              marginBottom: '8px',
            }}>
              SENHA *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: '42px' }}
                onFocus={(e) => (e.target.style.borderColor = FIAP_RED)}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.25)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPass ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Botão LOGAR */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: FIAP_RED,
              border: 'none',
              borderRadius: '3px',
              padding: '11px',
              color: 'white',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '2.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              transition: 'opacity 0.15s',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.82'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = loading ? '0.65' : '1'; }}
          >
            {loading ? 'ENTRANDO...' : 'LOGAR'}
          </button>
        </form>

        {/* Esqueci minha senha */}
        <p
          onClick={() => { setResetModal(true); setResetSent(false); setResetEmail(''); }}
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px',
            marginTop: '16px',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        >
          Esqueci minha senha
        </p>

        </div>{/* fim do bloco central */}

        {/* Footer — rodapé fixo no fundo */}
        <div style={{ paddingBottom: '28px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.13)', fontSize: '10px' }}>
            © Ministério da Educação · {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* ── Modal: esqueci minha senha ── */}
      {resetModal && (
        <div
          onClick={() => setResetModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              width: '100%',
              maxWidth: '380px',
              margin: '0 16px',
              overflow: 'hidden',
            }}
          >
            {/* Header modal */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '14px' }}>Redefinir senha</span>
              <button
                onClick={() => setResetModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '18px', lineHeight: 1, padding: '0 2px' }}
              >×</button>
            </div>

            {/* Corpo */}
            <div style={{ padding: '20px' }}>
              {!resetSent ? (
                <>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '16px', lineHeight: 1.6 }}>
                    Informe seu e-mail cadastrado. Enviaremos um link para redefinição de senha.
                  </p>
                  <label style={{ display: 'block', color: FIAP_RED, fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '8px' }}>
                    E-MAIL *
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="usuario@fiap.com.br"
                    style={{ ...inputStyle, marginBottom: '16px' }}
                    onFocus={(e) => (e.target.style.borderColor = FIAP_RED)}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    autoFocus
                  />
                  <button
                    onClick={() => resetEmail && setResetSent(true)}
                    style={{
                      width: '100%', background: FIAP_RED, border: 'none',
                      borderRadius: '3px', padding: '10px', color: 'white',
                      fontWeight: 700, fontSize: '12px', letterSpacing: '2px',
                      cursor: resetEmail ? 'pointer' : 'not-allowed',
                      opacity: resetEmail ? 1 : 0.5,
                    }}
                  >
                    ENVIAR LINK
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>✉️</div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>E-mail enviado!</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: 1.6 }}>
                    Verifique sua caixa de entrada em<br />
                    <span style={{ color: FIAP_RED }}>{resetEmail}</span>
                  </p>
                  <button
                    onClick={() => setResetModal(false)}
                    style={{
                      marginTop: '20px', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px',
                      padding: '9px 24px', color: 'rgba(255,255,255,0.6)',
                      fontSize: '12px', cursor: 'pointer',
                    }}
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS responsividade + fix autofill branco */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
          .form-panel { width: 50% !important; max-width: 50% !important; }
          .tagline-mobile { display: none !important; }
        }
        @media (max-width: 1023px) {
          .lg-flex { display: none !important; }
          .form-panel { padding: 48px 32px 32px !important; }
          .tagline-mobile { display: block !important; }
        }
        @media (max-width: 480px) {
          .form-panel { padding: 40px 24px 28px !important; }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 60px #1a1a1a inset !important;
          -webkit-text-fill-color: rgba(255,255,255,0.85) !important;
          caret-color: white !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }
        input { color-scheme: dark; }
      `}</style>
    </div>
  );
}

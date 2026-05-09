import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate(user.role === 'admin' ? '/admin' : '/aluno', { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">

      {/* Barra gov.br */}
      <div className="bg-[#071D41] py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-white font-bold text-sm tracking-wide">gov.br</span>
          <div className="hidden sm:flex items-center gap-6 text-xs text-white/70">
            <span>ACESSO À INFORMAÇÃO</span>
            <span>PARTICIPE</span>
            <span>LEGISLAÇÃO</span>
            <span>ÓRGÃOS DO GOVERNO</span>
          </div>
        </div>
      </div>

      {/* Header laranja UFSCar */}
      <div className="bg-[#F26522] px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white font-black text-3xl leading-none tracking-tight">UFSCar</p>
              <p className="text-white/90 text-xs mt-0.5 leading-tight">Universidade Federal<br />de São Carlos</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/90">
            <span>A UFSCar</span>
            <span>Gestão</span>
            <span>Processos Seletivos</span>
            <span>Contatos</span>
          </div>
        </div>
      </div>

      {/* Barra de perfis */}
      <div className="bg-[#071D41] px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center gap-8">
          <span className="text-white text-sm font-semibold border-b-2 border-[#F26522] pb-1">Estudante</span>
          <span className="text-white/60 text-sm hidden sm:inline">Docente/Técnico-Administrativo</span>
          <span className="text-white/60 text-sm hidden md:inline">Pesquisador</span>
          <span className="text-white/60 text-sm hidden md:inline">Visitante</span>
        </div>
      </div>

      {/* Conteúdo central */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Topo do card */}
            <div className="bg-[#F26522] px-6 py-4">
              <h2 className="text-white font-bold text-base tracking-wide">SISTEMA ACADÊMICO</h2>
              <p className="text-white/80 text-xs mt-0.5">Portal do Aluno · Curso de Medicina</p>
            </div>

            <div className="px-6 py-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail institucional</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="usuario@ufscar.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <p className="text-xs text-slate-400 text-center mt-5">
                Em caso de problemas, entre em contato com a Secretaria Acadêmica.
              </p>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs mt-5">
            © {new Date().getFullYear()} UFSCar — Universidade Federal de São Carlos
          </p>
        </div>
      </main>
    </div>
  );
}

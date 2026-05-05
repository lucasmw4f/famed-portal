import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import type { Enrollment, User } from '../types';
import { calcMedia, calcStatus, fmtGrade, fmtFreq } from '../types';
import DeclaracaoMatricula from '../components/DeclaracaoMatricula';

type Tab = 'inicio' | 'boletim' | 'frequencia' | 'perfil' | 'declaracao';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('inicio');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/student/enrollments'), api.get('/student/profile')]).then(
      ([eRes, pRes]) => { setEnrollments(eRes.data); setProfile(pRes.data); setLoading(false); }
    );
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'inicio',     label: 'Início' },
    { key: 'boletim',    label: 'Boletim' },
    { key: 'frequencia', label: 'Frequência' },
    { key: 'perfil',     label: 'Perfil' },
    { key: 'declaracao', label: '📄 Declaração' },
  ] as { key: Tab; label: string }[];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-800 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="font-bold text-base sm:text-lg tracking-tight">FAMED</span>
              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full hidden sm:inline">Portal do Aluno</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm text-blue-200 hidden md:block truncate max-w-[160px]">{user?.name}</span>
            <button onClick={logout} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <div className="tab-bar">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`tab-btn ${tab === t.key ? 'tab-btn-active' : 'tab-btn-inactive'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'inicio'     && <InicioTab enrollments={enrollments} profile={profile} />}
        {tab === 'boletim'    && <BoletimTab enrollments={enrollments} />}
        {tab === 'frequencia' && <FrequenciaTab enrollments={enrollments} />}
        {tab === 'perfil'     && <PerfilTab profile={profile} onPhotoUpdate={(photo) => setProfile((p) => p ? { ...p, photo } : p)} />}
        {tab === 'declaracao' && <div className="card"><DeclaracaoMatricula profile={profile} /></div>}
      </main>
    </div>
  );
}

// ── INÍCIO ────────────────────────────────────────────────────────────────────

function InicioTab({ enrollments, profile }: { enrollments: Enrollment[]; profile: User | null }) {
  const p = profile as User & { matricula?: string; semester?: number };
  const withGrades = enrollments.filter((e) => e.n1 !== null && e.n2 !== null && e.n3 !== null);
  const medias = withGrades.map((e) => calcMedia(e.n1, e.n2, e.n3)).filter((m): m is number => m !== null);
  const mediaGeral = medias.length ? medias.reduce((a, b) => a + b, 0) / medias.length : null;
  const aprovados = withGrades.filter((e) => { const m = calcMedia(e.n1, e.n2, e.n3); return m !== null && m >= 5; }).length;
  const reprovados = withGrades.filter((e) => calcStatus(e).label.startsWith('Rep')).length;
  const emRisco = enrollments.filter((e) => {
    const max = Math.floor(e.workload * 0.25);
    return e.total_classes > 0 && e.absences > max * 0.7 && e.absences <= max;
  }).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-4 sm:p-6 text-white">
        <p className="text-blue-100 text-sm mb-1">Bem-vindo(a) de volta,</p>
        <h2 className="text-xl sm:text-2xl font-bold">{profile?.name}</h2>
        <div className="flex flex-wrap gap-2 mt-3 text-xs sm:text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">Matrícula: <strong>{p?.matricula ?? '—'}</strong></span>
          <span className="bg-white/20 px-3 py-1 rounded-full">{p?.semester ?? '—'}º Semestre</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">Medicina</span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Disciplinas"  value={String(enrollments.length)}        sub="matriculadas"        color="blue"  icon="📚" />
        <StatCard label="Média Geral"  value={mediaGeral !== null ? mediaGeral.toFixed(1) : '—'} sub={mediaGeral === null ? 'sem notas' : mediaGeral >= 5 ? 'regular' : 'atenção'} color={mediaGeral === null ? 'gray' : mediaGeral >= 5 ? 'green' : 'red'} icon="📊" />
        <StatCard label="Aprovado em"  value={String(aprovados)}                 sub={`de ${withGrades.length}`} color="green" icon="✅" />
        <StatCard label="Reprovações"  value={String(reprovados)}                sub="até o momento"       color={reprovados > 0 ? 'red' : 'green'} icon="⚠️" />
      </div>

      {/* Situação por disciplina */}
      <div className="card">
        <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3">Situação por Disciplina</h3>
        {enrollments.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">Nenhuma disciplina matriculada.</p>
        ) : (
          <div className="space-y-2">
            {enrollments.map((e) => {
              const s = calcStatus(e);
              const media = calcMedia(e.n1, e.n2, e.n3);
              const allN = [e.n1, e.n2, e.n3].filter((v) => v !== null).length === 3;
              const maxAbs = Math.floor(e.workload * 0.25);
              const freqPct = e.total_classes > 0 ? ((e.total_classes - e.absences) / e.total_classes) * 100 : null;
              const freqWarn = freqPct !== null && freqPct < 80;
              return (
                <div key={e.enrollment_id} className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg hover:bg-slate-50 border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{e.name}</p>
                    <div className="flex flex-wrap gap-x-3 mt-0.5 text-xs text-slate-500">
                      <span>Média: <strong className={allN && media !== null ? (media >= 5 ? 'text-green-700' : 'text-red-600') : 'text-slate-400'}>{allN && media !== null ? media.toFixed(1) : '—'}</strong></span>
                      <span className={freqWarn ? 'text-orange-600 font-semibold' : ''}>Freq: {freqPct !== null ? freqPct.toFixed(0) + '%' : '—'}{freqWarn && ' ⚠️'}</span>
                      <span className="hidden sm:inline">Faltas: {e.absences}/{maxAbs}</span>
                    </div>
                  </div>
                  <span className={s.cls}>{s.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {emRisco > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
          <span className="text-orange-500 text-lg mt-0.5 flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-orange-800">Atenção à frequência</p>
            <p className="text-xs sm:text-sm text-orange-700">
              Você tem {emRisco} disciplina(s) com frequência se aproximando do limite. Fique atento para não ser reprovado por falta.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: string }) {
  const colors: Record<string, string> = {
    blue:  'from-blue-50  to-blue-100  border-blue-200  text-blue-800',
    green: 'from-green-50 to-green-100 border-green-200 text-green-800',
    red:   'from-red-50   to-red-100   border-red-200   text-red-800',
    gray:  'from-slate-50 to-slate-100 border-slate-200 text-slate-600',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-3 sm:p-4`}>
      <div className="text-lg sm:text-xl mb-1">{icon}</div>
      <div className="text-xl sm:text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium mt-0.5">{label}</div>
      <div className="text-xs opacity-70 mt-0.5 hidden sm:block">{sub}</div>
    </div>
  );
}

// ── BOLETIM ───────────────────────────────────────────────────────────────────

function BoletimTab({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <div className="card">
      <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Boletim Acadêmico</h2>
      {enrollments.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">Nenhuma disciplina matriculada.</p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="block sm:hidden space-y-3">
            {enrollments.map((e) => {
              const media = calcMedia(e.n1, e.n2, e.n3);
              const allN = [e.n1, e.n2, e.n3].filter((v) => v !== null).length === 3;
              const status = calcStatus(e);
              return (
                <div key={e.enrollment_id} className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{e.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{e.code}</p>
                    </div>
                    <span className={status.cls}>{status.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {([['N1', e.n1], ['N2', e.n2], ['N3', e.n3]] as [string, number | null][]).map(([l, v]) => (
                      <div key={l} className="grade-cell">
                        <div className="grade-cell-label">{l}</div>
                        <div className="grade-cell-value">{fmtGrade(v)}</div>
                      </div>
                    ))}
                    <div className="grade-cell">
                      <div className="grade-cell-label">Média</div>
                      <div className={`grade-cell-value ${allN && media !== null ? (media >= 5 ? 'text-green-700' : 'text-red-600') : 'text-slate-400'}`}>
                        {allN && media !== null ? media.toFixed(1) : '—'}
                      </div>
                    </div>
                  </div>
                  {e.final_exam !== null && (
                    <p className="text-xs text-slate-500 mt-2">Exame Final: <strong>{fmtGrade(e.final_exam)}</strong></p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block table-wrap">
            <div className="table-inner">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Disciplina</th>
                    <th className="table-th text-center">N1</th>
                    <th className="table-th text-center">N2</th>
                    <th className="table-th text-center">N3</th>
                    <th className="table-th text-center">Média</th>
                    <th className="table-th text-center">Exame Final</th>
                    <th className="table-th text-center">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => {
                    const media = calcMedia(e.n1, e.n2, e.n3);
                    const allN = [e.n1, e.n2, e.n3].filter((v) => v !== null).length === 3;
                    const status = calcStatus(e);
                    return (
                      <tr key={e.enrollment_id} className="hover:bg-slate-50">
                        <td className="table-td">
                          <div className="font-medium">{e.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{e.code}</div>
                        </td>
                        <td className="table-td text-center">{fmtGrade(e.n1)}</td>
                        <td className="table-td text-center">{fmtGrade(e.n2)}</td>
                        <td className="table-td text-center">{fmtGrade(e.n3)}</td>
                        <td className="table-td text-center">
                          <span className={`font-semibold ${allN && media !== null ? (media >= 5 ? 'text-green-700' : media >= 3 ? 'text-orange-600' : 'text-red-600') : 'text-slate-400'}`}>
                            {allN && media !== null ? media.toFixed(1) : '—'}
                          </span>
                        </td>
                        <td className="table-td text-center">{fmtGrade(e.final_exam)}</td>
                        <td className="table-td text-center"><span className={status.cls}>{status.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Aprovado: ≥ 5.0 · Em Exame: 3.0–4.9 · Rep. Nota: &lt; 3.0</p>
        </>
      )}
    </div>
  );
}

// ── FREQUÊNCIA ────────────────────────────────────────────────────────────────

function FrequenciaTab({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <div className="card">
      <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Frequência Acadêmica</h2>
      {enrollments.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">Nenhuma disciplina matriculada.</p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="block sm:hidden space-y-3">
            {enrollments.map((e) => {
              const maxAbs = Math.floor(e.workload * 0.25);
              const freqNum = e.total_classes > 0 ? ((e.total_classes - e.absences) / e.total_classes) * 100 : null;
              const repFalta = e.total_classes > 0 && e.absences > maxAbs;
              const atRisk = !repFalta && freqNum !== null && freqNum < 80;
              return (
                <div key={e.enrollment_id} className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{e.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{e.code} · {e.workload}h</p>
                    </div>
                    {repFalta ? <span className="badge-reprovado">Rep. Falta</span>
                      : atRisk ? <span className="badge-risco">Risco</span>
                      : e.total_classes === 0 ? <span className="badge-cursando">Aguardando</span>
                      : <span className="badge-aprovado">Regular</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[['Aulas', e.total_classes || 0], ['Faltas', e.absences || 0], ['Máx. Falta', maxAbs]].map(([l, v]) => (
                      <div key={l as string} className="grade-cell">
                        <div className="grade-cell-label">{l}</div>
                        <div className={`grade-cell-value ${l === 'Faltas' && repFalta ? 'text-red-600' : ''}`}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {freqNum !== null && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Frequência</span>
                        <span className={`font-semibold ${freqNum >= 75 ? 'text-green-700' : freqNum >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                          {freqNum.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${freqNum >= 75 ? 'bg-green-500' : freqNum >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(freqNum, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block table-wrap">
            <div className="table-inner">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Disciplina</th>
                    <th className="table-th text-center">C.H.</th>
                    <th className="table-th text-center">Aulas</th>
                    <th className="table-th text-center">Faltas</th>
                    <th className="table-th text-center">Máx.</th>
                    <th className="table-th text-center">Frequência</th>
                    <th className="table-th text-center">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => {
                    const maxAbs = Math.floor(e.workload * 0.25);
                    const freqNum = e.total_classes > 0 ? ((e.total_classes - e.absences) / e.total_classes) * 100 : null;
                    const repFalta = e.total_classes > 0 && e.absences > maxAbs;
                    const atRisk = !repFalta && freqNum !== null && freqNum < 80;
                    return (
                      <tr key={e.enrollment_id} className="hover:bg-slate-50">
                        <td className="table-td">
                          <div className="font-medium">{e.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{e.code}</div>
                        </td>
                        <td className="table-td text-center text-slate-500">{e.workload}h</td>
                        <td className="table-td text-center">{e.total_classes || 0}</td>
                        <td className="table-td text-center">
                          <span className={repFalta ? 'text-red-600 font-bold' : atRisk ? 'text-orange-600 font-semibold' : ''}>{e.absences || 0}</span>
                        </td>
                        <td className="table-td text-center text-slate-500">{maxAbs}</td>
                        <td className="table-td text-center">
                          {freqNum !== null ? (
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${freqNum >= 75 ? 'bg-green-500' : freqNum >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
                                  style={{ width: `${Math.min(freqNum, 100)}%` }} />
                              </div>
                              <span className={`text-sm font-medium ${freqNum >= 75 ? 'text-green-700' : freqNum >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                                {freqNum.toFixed(1)}%
                              </span>
                            </div>
                          ) : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="table-td text-center">
                          {repFalta ? <span className="badge-reprovado">Rep. Falta</span>
                            : atRisk ? <span className="badge-risco">Risco</span>
                            : e.total_classes === 0 ? <span className="badge-cursando">Aguardando</span>
                            : <span className="badge-aprovado">Regular</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Mínimo obrigatório: 75% de frequência · Máximo: 25% de faltas</p>
        </>
      )}
    </div>
  );
}

// ── PERFIL ────────────────────────────────────────────────────────────────────

function Avatar({ photo, name, size = 'lg' }: { photo?: string | null; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-24 h-24 text-3xl' };
  if (photo) {
    return (
      <img src={photo} alt={name}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-md flex-shrink-0`} />
    );
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 300;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PerfilTab({ profile, onPhotoUpdate }: { profile: User | null; onPhotoUpdate: (photo: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!profile) return null;
  const p = profile as User & { matricula?: string; semester?: number; cpf?: string; phone?: string; created_at?: string };

  function fmtCPF(v?: string) {
    if (!v) return 'não informado';
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  function fmtPhone(v?: string) {
    if (!v) return 'não informado';
    const d = v.replace(/\D/g, '');
    if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    return v;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Selecione uma imagem válida.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Imagem muito grande. Máximo 10MB.'); return; }
    setError(''); setUploading(true);
    try {
      const compressed = await compressImage(file);
      await api.put('/student/photo', { photo: compressed });
      onPhotoUpdate(compressed);
    } catch {
      setError('Erro ao salvar foto. Tente novamente.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const items = [
    ['Nome completo', profile.name],
    ['E-mail', profile.email],
    ['CPF', fmtCPF(p.cpf)],
    ['Telefone', fmtPhone(p.phone)],
    ['Matrícula', p.matricula ?? '—'],
    ['Semestre', p.semester ? `${p.semester}º Semestre` : '—'],
    ['Curso', 'Medicina (Bacharelado)'],
    ['Turno', 'Integral'],
    ['Ingresso', p.created_at ? (() => { const d = new Date(p.created_at); return `${d.getFullYear()}.${d.getMonth() < 6 ? 1 : 2}`; })() : '—'],
  ];

  return (
    <div className="card max-w-xl">
      {/* Foto + identidade */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 pb-6 border-b border-slate-100">
        <div className="relative flex-shrink-0">
          <Avatar photo={profile.photo} name={profile.name} size="lg" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors disabled:opacity-50"
            title="Alterar foto"
          >
            {uploading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="text-center sm:text-left min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">{profile.name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">Aluno de Medicina · FAMED</p>
          <span className="inline-block mt-2 text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{p.matricula}</span>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          <p className="text-xs text-slate-400 mt-2">Clique na câmera para alterar a foto</p>
        </div>
      </div>

      {/* Dados */}
      <div className="space-y-1">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between items-start gap-2 py-2.5 border-b border-slate-50 last:border-0">
            <span className="text-sm text-slate-500 flex-shrink-0">{label}</span>
            <span className="text-sm font-medium text-slate-800 text-right break-all">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 p-3 sm:p-4 bg-blue-50 rounded-xl">
        <p className="text-xs text-blue-700">
          <strong>Precisa atualizar seus dados?</strong> Entre em contato com a Secretaria Acadêmica pelo e-mail{' '}
          <span className="font-mono">secretaria@famed.edu.br</span>.
        </p>
      </div>
    </div>
  );
}

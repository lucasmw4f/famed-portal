import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import type { Enrollment, User } from '../types';
import { calcMedia, calcStatus, fmtGrade } from '../types';
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-7 h-7 border-2 border-[#F26522] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Carregando dados acadêmicos...</p>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'inicio',     label: 'Início' },
    { key: 'boletim',    label: 'Boletim' },
    { key: 'frequencia', label: 'Frequência' },
    { key: 'perfil',     label: 'Perfil' },
    { key: 'declaracao', label: 'Declaração' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Barra gov.br */}
      <div className="bg-[#071D41]">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-9">
          <span className="text-white font-bold text-sm tracking-wide">gov.br</span>
          <div className="hidden sm:flex items-center gap-5 text-xs text-white/60">
            <span>ACESSO À INFORMAÇÃO</span>
            <span>PARTICIPE</span>
            <span>LEGISLAÇÃO</span>
          </div>
        </div>
      </div>

      {/* Header laranja UFSCar */}
      <div className="bg-[#F26522]">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between py-4">
          <div>
            <p className="text-white font-black text-2xl sm:text-3xl leading-none tracking-tight">UFSCar</p>
            <p className="text-white/90 text-xs mt-0.5">Universidade Federal de São Carlos</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="text-white/80 text-sm hidden md:block truncate max-w-[200px]">{user?.name}</span>
            <button onClick={logout} className="text-xs border border-white/50 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors">
              Sair
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-0 hidden md:flex items-center gap-7 text-sm text-white/80 border-t border-white/20">
          <span className="py-2 cursor-default">A UFSCar</span>
          <span className="py-2 cursor-default">Gestão</span>
          <span className="py-2 cursor-default">Processos Seletivos</span>
          <span className="py-2 cursor-default">Acesso à Informação</span>
          <span className="py-2 cursor-default">Contatos</span>
        </div>
      </div>

      {/* Barra de abas */}
      <div className="bg-[#071D41]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  tab === t.key ? 'text-white border-b-2 border-[#F26522]' : 'text-white/55 hover:text-white/85'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'inicio'     && <InicioTab enrollments={enrollments} profile={profile} />}
        {tab === 'boletim'    && <BoletimTab enrollments={enrollments} />}
        {tab === 'frequencia' && <FrequenciaTab enrollments={enrollments} />}
        {tab === 'perfil'     && <PerfilTab profile={profile} onPhotoUpdate={(photo) => setProfile((p) => p ? { ...p, photo } : p)} />}
        {tab === 'declaracao' && <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6"><DeclaracaoMatricula profile={profile} /></div>}
      </main>
    </div>
  );
}

// ── INÍCIO ────────────────────────────────────────────────────────────────────

function InicioTab({ enrollments, profile }: { enrollments: Enrollment[]; profile: User | null }) {
  const p = profile as User & { matricula?: string; semester?: number };

  const withGrades   = enrollments.filter((e) => e.n1 !== null && e.n2 !== null && e.n3 !== null);
  const medias       = withGrades.map((e) => calcMedia(e.n1, e.n2, e.n3)).filter((m): m is number => m !== null);
  const mediaGeral   = medias.length ? medias.reduce((a, b) => a + b, 0) / medias.length : null;
  const aprovados    = withGrades.filter((e) => { const m = calcMedia(e.n1, e.n2, e.n3); return m !== null && m >= 5; }).length;
  const emExame      = withGrades.filter((e) => { const m = calcMedia(e.n1, e.n2, e.n3); return m !== null && m >= 3 && m < 5; }).length;
  const reprovados   = withGrades.filter((e) => calcStatus(e).label.startsWith('Rep')).length;
  const emRisco      = enrollments.filter((e) => {
    const max = Math.floor(e.workload * 0.25);
    return e.total_classes > 0 && e.absences > max * 0.7 && e.absences <= max;
  }).length;

  return (
    <div className="space-y-5">

      {/* Cabeçalho do aluno */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-1 h-4 bg-[#F26522] rounded-full" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Dados do Discente</h2>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3">
          <InfoField label="Nome" value={profile?.name ?? '—'} wide />
          <InfoField label="Matrícula" value={p?.matricula ?? '—'} />
          <InfoField label="Curso" value="Medicina (Bacharelado)" />
          <InfoField label="Semestre" value={p?.semester ? `${p.semester}º Semestre` : '—'} />
        </div>
      </div>

      {/* Indicadores acadêmicos */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-1 h-4 bg-[#F26522] rounded-full" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Indicadores do Período</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-slate-100">
          <Metric label="Disciplinas" value={String(enrollments.length)} sub="matriculadas" />
          <Metric label="Média Geral" value={mediaGeral !== null ? mediaGeral.toFixed(2) : '—'}
            sub={mediaGeral === null ? 'sem notas lançadas' : mediaGeral >= 5 ? 'situação regular' : 'abaixo do mínimo'}
            alert={mediaGeral !== null && mediaGeral < 5} />
          <Metric label="Aprovações" value={String(aprovados)} sub={`de ${withGrades.length} avaliadas`} positive={aprovados > 0} />
          <Metric label="Em Exame" value={String(emExame)} sub="aguardando exame final" alert={emExame > 0} />
          <Metric label="Reprovações" value={String(reprovados)} sub="no período" alert={reprovados > 0} />
        </div>
      </div>

      {/* Alerta de frequência */}
      {emRisco > 0 && (
        <div className="border-l-4 border-amber-400 bg-amber-50 px-4 py-3 rounded-r-lg">
          <p className="text-sm font-semibold text-amber-800">Alerta de Frequência</p>
          <p className="text-sm text-amber-700 mt-0.5">
            {emRisco} disciplina(s) com frequência próxima ao limite mínimo de 75%. Risco de reprovação por falta.
          </p>
        </div>
      )}

      {/* Quadro geral de disciplinas */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-1 h-4 bg-[#F26522] rounded-full" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Quadro Geral de Disciplinas</h2>
        </div>
        {enrollments.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Nenhuma disciplina matriculada no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Disciplina</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Média</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Freq.</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e) => {
                  const s = calcStatus(e);
                  const media = calcMedia(e.n1, e.n2, e.n3);
                  const allN = [e.n1, e.n2, e.n3].every((v) => v !== null);
                  const maxAbs = Math.floor(e.workload * 0.25);
                  const freqPct = e.total_classes > 0 ? ((e.total_classes - e.absences) / e.total_classes) * 100 : null;
                  const freqWarn = freqPct !== null && freqPct < 80;
                  const repFalta = e.total_classes > 0 && e.absences > maxAbs;
                  return (
                    <tr key={e.enrollment_id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 text-xs font-mono text-slate-400">{e.code}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-800">{e.name}</td>
                      <td className="px-4 py-2.5 text-sm text-center font-semibold">
                        <span className={allN && media !== null ? (media >= 5 ? 'text-green-700' : media >= 3 ? 'text-amber-600' : 'text-red-600') : 'text-slate-300'}>
                          {allN && media !== null ? media.toFixed(1) : '—'}
                        </span>
                      </td>
                      <td className={`px-4 py-2.5 text-sm text-center ${repFalta ? 'text-red-600 font-semibold' : freqWarn ? 'text-amber-600 font-semibold' : 'text-slate-600'}`}>
                        {freqPct !== null ? freqPct.toFixed(0) + '%' : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center"><span className={s.cls}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2 sm:col-span-2' : ''}>
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function Metric({ label, value, sub, alert, positive }: { label: string; value: string; sub: string; alert?: boolean; positive?: boolean }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${alert ? 'text-red-600' : positive ? 'text-green-700' : 'text-slate-800'}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

// ── BOLETIM ───────────────────────────────────────────────────────────────────

function BoletimTab({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#F26522] rounded-full" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Boletim Acadêmico</h2>
        </div>
        <span className="text-xs text-slate-400">{enrollments.length} disciplina(s)</span>
      </div>

      {enrollments.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-10">Nenhuma disciplina matriculada no período.</p>
      ) : (
        <>
          {/* Mobile */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {enrollments.map((e) => {
              const media = calcMedia(e.n1, e.n2, e.n3);
              const allN = [e.n1, e.n2, e.n3].every((v) => v !== null);
              const status = calcStatus(e);
              return (
                <div key={e.enrollment_id} className="px-4 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{e.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{e.code}</p>
                    </div>
                    <span className={status.cls}>{status.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {(['N1', 'N2', 'N3'] as const).map((l, i) => (
                      <div key={l} className="bg-slate-50 rounded py-2">
                        <p className="text-xs text-slate-400">{l}</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{fmtGrade([e.n1, e.n2, e.n3][i])}</p>
                      </div>
                    ))}
                    <div className="bg-slate-50 rounded py-2">
                      <p className="text-xs text-slate-400">Média</p>
                      <p className={`text-sm font-bold mt-0.5 ${allN && media !== null ? (media >= 5 ? 'text-green-700' : 'text-red-600') : 'text-slate-300'}`}>
                        {allN && media !== null ? media.toFixed(1) : '—'}
                      </p>
                    </div>
                  </div>
                  {e.final_exam !== null && (
                    <p className="text-xs text-slate-500 mt-2">Exame Final: <strong>{fmtGrade(e.final_exam)}</strong></p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-100">
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Código</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Disciplina</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-16">N1</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-16">N2</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-16">N3</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-20">Média</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-24">Ex. Final</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-28">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e) => {
                  const media = calcMedia(e.n1, e.n2, e.n3);
                  const allN = [e.n1, e.n2, e.n3].every((v) => v !== null);
                  const status = calcStatus(e);
                  return (
                    <tr key={e.enrollment_id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-xs font-mono text-slate-400">{e.code}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{e.name}</td>
                      <td className="px-4 py-3 text-sm text-center text-slate-600">{fmtGrade(e.n1)}</td>
                      <td className="px-4 py-3 text-sm text-center text-slate-600">{fmtGrade(e.n2)}</td>
                      <td className="px-4 py-3 text-sm text-center text-slate-600">{fmtGrade(e.n3)}</td>
                      <td className="px-4 py-3 text-sm text-center font-bold">
                        <span className={allN && media !== null ? (media >= 5 ? 'text-green-700' : media >= 3 ? 'text-amber-600' : 'text-red-600') : 'text-slate-300'}>
                          {allN && media !== null ? media.toFixed(1) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-slate-600">{fmtGrade(e.final_exam)}</td>
                      <td className="px-4 py-3 text-center"><span className={status.cls}>{status.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 rounded-b-lg">
            <p className="text-xs text-slate-400">Aprovado: média ≥ 5,0 &nbsp;·&nbsp; Em Exame: 3,0 a 4,9 &nbsp;·&nbsp; Reprovado por Nota: média &lt; 3,0 ou pós-exame &lt; 5,0</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── FREQUÊNCIA ────────────────────────────────────────────────────────────────

function FrequenciaTab({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#F26522] rounded-full" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Controle de Frequência</h2>
        </div>
        <span className="text-xs text-slate-400">Mínimo obrigatório: 75%</span>
      </div>

      {enrollments.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-10">Nenhuma disciplina matriculada no período.</p>
      ) : (
        <>
          {/* Mobile */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {enrollments.map((e) => {
              const maxAbs = Math.floor(e.workload * 0.25);
              const freqNum = e.total_classes > 0 ? ((e.total_classes - e.absences) / e.total_classes) * 100 : null;
              const repFalta = e.total_classes > 0 && e.absences > maxAbs;
              const atRisk = !repFalta && freqNum !== null && freqNum < 80;
              return (
                <div key={e.enrollment_id} className="px-4 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{e.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{e.code} · {e.workload}h</p>
                    </div>
                    {repFalta ? <span className="badge-reprovado">Rep. Falta</span>
                      : atRisk   ? <span className="badge-risco">Em Risco</span>
                      : e.total_classes === 0 ? <span className="badge-cursando">Aguardando</span>
                      : <span className="badge-aprovado">Regular</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    {[['Aulas Dadas', e.total_classes || 0], ['Faltas', e.absences || 0], ['Máx. Faltas', maxAbs]].map(([l, v]) => (
                      <div key={String(l)} className="bg-slate-50 rounded py-2">
                        <p className="text-xs text-slate-400">{l}</p>
                        <p className={`text-sm font-semibold mt-0.5 ${l === 'Faltas' && repFalta ? 'text-red-600' : 'text-slate-700'}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {freqNum !== null && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Frequência acumulada</span>
                        <span className={`font-semibold ${freqNum >= 75 ? 'text-green-700' : freqNum >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                          {freqNum.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${freqNum >= 75 ? 'bg-green-500' : freqNum >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(freqNum, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-100">
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Código</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Disciplina</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-16">C.H.</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-20">Aulas</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-16">Faltas</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-16">Máx.</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-32">Frequência</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-28">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e) => {
                  const maxAbs = Math.floor(e.workload * 0.25);
                  const freqNum = e.total_classes > 0 ? ((e.total_classes - e.absences) / e.total_classes) * 100 : null;
                  const repFalta = e.total_classes > 0 && e.absences > maxAbs;
                  const atRisk = !repFalta && freqNum !== null && freqNum < 80;
                  return (
                    <tr key={e.enrollment_id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-xs font-mono text-slate-400">{e.code}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{e.name}</td>
                      <td className="px-4 py-3 text-sm text-center text-slate-500">{e.workload}h</td>
                      <td className="px-4 py-3 text-sm text-center text-slate-600">{e.total_classes || 0}</td>
                      <td className="px-4 py-3 text-sm text-center font-semibold">
                        <span className={repFalta ? 'text-red-600' : atRisk ? 'text-amber-600' : 'text-slate-600'}>
                          {e.absences || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-slate-400">{maxAbs}</td>
                      <td className="px-4 py-3">
                        {freqNum !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${freqNum >= 75 ? 'bg-green-500' : freqNum >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(freqNum, 100)}%` }} />
                            </div>
                            <span className={`text-xs font-semibold w-10 text-right ${freqNum >= 75 ? 'text-green-700' : freqNum >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {freqNum.toFixed(1)}%
                            </span>
                          </div>
                        ) : <span className="text-slate-300 text-sm block text-center">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {repFalta ? <span className="badge-reprovado">Rep. Falta</span>
                          : atRisk   ? <span className="badge-risco">Em Risco</span>
                          : e.total_classes === 0 ? <span className="badge-cursando">Aguardando</span>
                          : <span className="badge-aprovado">Regular</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 rounded-b-lg">
            <p className="text-xs text-slate-400">Reprovação por falta quando ausências ultrapassam 25% da carga horária total da disciplina.</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── PERFIL ────────────────────────────────────────────────────────────────────

function Avatar({ photo, name }: { photo?: string | null; name: string }) {
  if (photo) return <img src={photo} alt={name} className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 flex-shrink-0" />;
  return (
    <div className="w-20 h-20 rounded-full bg-[#F26522] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
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
  const p = profile as User & { matricula?: string; semester?: number; cpf?: string; phone?: string };

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
  function fmtIngresso() {
    if (!p.semester) return '—';
    const now = new Date();
    const cur = now.getFullYear() * 2 + (now.getMonth() < 6 ? 0 : 1);
    const ing = cur - (p.semester - 1);
    const y = Math.floor(ing / 2);
    const s = (ing % 2) + 1;
    return `${String(s).padStart(2, '0')}/${y}`;
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

  const rows = [
    ['Curso',      'Medicina (Bacharelado)'],
    ['Habilitação','Bacharelado'],
    ['Turno',      'Integral'],
    ['Ingresso',   fmtIngresso()],
    ['Semestre atual', p.semester ? `${p.semester}º Semestre` : '—'],
    ['Matrícula',  p.matricula ?? '—'],
    ['CPF',        fmtCPF(p.cpf)],
    ['Telefone',   fmtPhone(p.phone)],
    ['Situação',   'Ativo(a)'],
    ['Regime',     'Semestral Presencial'],
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Identificação */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-1 h-4 bg-[#F26522] rounded-full" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Identificação</h2>
        </div>
        <div className="px-4 py-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative flex-shrink-0">
            <Avatar photo={profile.photo} name={profile.name} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-7 h-7 bg-[#F26522] hover:bg-[#E05A15] rounded-full flex items-center justify-center text-white shadow transition-colors disabled:opacity-50"
            >
              {uploading
                ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Nome completo</p>
            <h3 className="text-lg font-semibold text-slate-800 mt-0.5">{profile.name}</h3>
            <p className="text-sm text-slate-500 mt-1">Discente · Medicina · UFSCar</p>
            <p className="text-xs font-mono text-slate-400 mt-1">{p.matricula}</p>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      </div>

      {/* Dados acadêmicos */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-1 h-4 bg-[#F26522] rounded-full" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Dados Acadêmicos e Pessoais</h2>
        </div>
        <table className="w-full">
          <tbody className="divide-y divide-slate-100">
            {rows.map(([label, value]) => (
              <tr key={label} className="hover:bg-slate-50/50">
                <td className="px-4 py-2.5 text-xs text-slate-400 uppercase tracking-wide w-40">{label}</td>
                <td className="px-4 py-2.5 text-sm text-slate-800 font-medium">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-l-4 border-slate-200 pl-4 py-1">
        <p className="text-xs text-slate-500">
          Para atualização de dados cadastrais, dirija-se à Secretaria Acadêmica ou envie solicitação para{' '}
          <span className="font-mono text-slate-600">secretaria@ufscar.br</span>.
        </p>
      </div>
    </div>
  );
}

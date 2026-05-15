import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import type { Student, Subject, Enrollment } from '../types';
import { calcMedia, calcStatus, fmtGrade, fmtFreq } from '../types';

type Tab = 'alunos' | 'disciplinas' | 'notas';

const RED = '#EC0000';
const DARK_BG = '#0D0D0D';
const CARD_BG = '#161616';
const BORDER = 'rgba(255,255,255,0.07)';

function DarkCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-xl ${className}`} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-0.5 h-4 rounded-full" style={{ background: RED }} />
      <p className="text-[11px] font-bold tracking-[0.12em] text-white/50 uppercase">{children}</p>
    </div>
  );
}

function StatusBadge({ s }: { s: { label: string } }) {
  const colors: Record<string, { bg: string; text: string }> = {
    'Aprovado':   { bg: 'rgba(34,197,94,0.1)',   text: '#4ade80' },
    'Rep. Nota':  { bg: 'rgba(239,68,68,0.1)',   text: '#f87171' },
    'Rep. Falta': { bg: 'rgba(239,68,68,0.1)',   text: '#f87171' },
    'Prova Sub.': { bg: 'rgba(251,191,36,0.1)',  text: '#fbbf24' },
    'Cursando':   { bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.4)' },
  };
  const c = colors[s.label] ?? { bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.4)' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ background: c.bg, color: c.text }}>
      {s.label}
    </span>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('alunos');

  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Header */}
      <div className="relative z-10 border-b" style={{ background: '#111111', borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <span className="text-white font-black text-2xl tracking-[0.2em] select-none">FIAP</span>
            <div className="hidden sm:block w-px h-5 bg-white/15" />
            <div className="hidden sm:block">
              <p className="text-white/70 text-xs font-medium leading-tight">Painel Administrativo</p>
              <p className="text-white/30 text-[10px] leading-tight">Análise e Desenvolvimento de Sistemas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-sm hidden md:block">{user?.name}</span>
            <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded hidden sm:inline"
              style={{ color: RED, border: `1px solid ${RED}33` }}>ADMIN</span>
            <button onClick={logout}
              className="text-xs border border-white/15 hover:border-white/30 text-white/50 hover:text-white/80 px-4 py-1.5 rounded transition-colors">
              Sair
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            {(['alunos', 'disciplinas', 'notas'] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-5 py-3 text-xs font-bold tracking-widest whitespace-nowrap transition-colors"
                style={{
                  color: tab === t ? RED : 'rgba(255,255,255,0.35)',
                  borderBottom: tab === t ? `2px solid ${RED}` : '2px solid transparent',
                }}>
                {t === 'alunos' ? 'ALUNOS' : t === 'disciplinas' ? 'DISCIPLINAS' : 'NOTAS & FALTAS'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-7">
        {tab === 'alunos'      && <AlunosTab />}
        {tab === 'disciplinas' && <DisciplinasTab />}
        {tab === 'notas'       && <NotasTab />}
      </main>
    </div>
  );
}

// ── ALUNOS ────────────────────────────────────────────────────────────────────

function AlunosTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await api.get('/admin/students');
    setStudents(data); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(id: number, name: string) {
    if (!confirm(`Remover o aluno "${name}"?`)) return;
    await api.delete(`/admin/students/${id}`);
    load();
  }

  return (
    <DarkCard className="!p-0 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div>
          <SectionLabel>Alunos Cadastrados</SectionLabel>
          <p className="text-xs text-white/25 -mt-3">{students.length} aluno(s)</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="text-xs font-bold tracking-widest px-4 py-2 rounded transition-opacity hover:opacity-80 text-white"
          style={{ background: RED }}>
          + NOVO ALUNO
        </button>
      </div>

      {loading ? <p className="text-white/30 text-sm text-center py-10">Carregando...</p>
        : students.length === 0 ? <p className="text-white/30 text-sm text-center py-10">Nenhum aluno cadastrado.</p>
        : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Nome', 'Matrícula', 'E-mail', 'Sem.', 'Ações'].map((h, i) => (
                    <th key={h} className={`px-5 py-2.5 text-left text-[10px] font-bold tracking-widest text-white/30 uppercase ${i === 2 ? 'hidden sm:table-cell' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                    onMouseEnter={(el) => (el.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(el) => (el.currentTarget.style.background = 'transparent')}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        {(s as Student & { photo?: string }).photo ? (
                          <img src={(s as Student & { photo?: string }).photo} alt={s.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0" style={{ border: `1px solid ${BORDER}` }} />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                            style={{ background: RED }}>
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-white/80">{s.name}</div>
                          <div className="text-xs text-white/25 sm:hidden">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-white/40 px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        {s.matricula}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-sm text-white/40">{s.email}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: RED, background: `${RED}15` }}>
                        {s.semester}º
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => remove(s.student_id!, s.name)}
                        className="text-xs font-bold tracking-wide px-3 py-1.5 rounded transition-opacity hover:opacity-70"
                        style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {showModal && <AddStudentModal onClose={() => setShowModal(false)} onSuccess={load} />}
    </DarkCard>
  );
}

function DarkModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col"
        style={{ background: '#1A1A1A', border: `1px solid ${BORDER}` }}>
        <div className="p-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <h3 className="text-sm font-bold text-white/80 tracking-wide">{title}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function DarkInput({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: RED }}>
        {label.toUpperCase()}{required ? ' *' : ''}
      </label>
      <input {...props} required={required}
        className="w-full rounded px-4 py-2.5 text-sm text-white/80 focus:outline-none transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}
        onFocus={(e) => { e.target.style.borderColor = RED; if (props.onFocus) props.onFocus(e); }}
        onBlur={(e) => { e.target.style.borderColor = BORDER; if (props.onBlur) props.onBlur(e); }} />
    </div>
  );
}

function DarkSelect({ label, required, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: RED }}>
        {label.toUpperCase()}{required ? ' *' : ''}
      </label>
      <select {...props} required={required}
        className="w-full rounded px-4 py-2.5 text-sm text-white/80 focus:outline-none"
        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
        {children}
      </select>
    </div>
  );
}

function AddStudentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: 'Aluno@2024', semester: '1', cpf: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/admin/students', {
        name: form.name, email: form.email, password: form.password,
        semester: Number(form.semester),
        cpf: form.cpf.replace(/\D/g, '') || undefined,
        phone: form.phone.replace(/\D/g, '') || undefined,
      });
      onSuccess(); onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Erro ao criar aluno.');
    } finally { setLoading(false); }
  }

  return (
    <DarkModal title="Novo Aluno" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && <div className="text-red-400 text-sm px-4 py-3 rounded" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
        <DarkInput label="Nome completo" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <DarkInput label="E-mail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <DarkInput label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
          <DarkInput label="Telefone" placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <DarkInput label="Senha inicial" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} />
        <DarkSelect label="Semestre" required value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
          {Array.from({ length: 4 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n} style={{ background: '#1A1A1A' }}>{n}º Semestre</option>
          ))}
        </DarkSelect>
        <p className="text-[11px] text-white/25 -mt-2">Aluno será matriculado nas disciplinas do semestre automaticamente.</p>
        <div className="flex gap-3 pt-1 pb-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded text-sm font-medium text-white/50 border border-white/10 hover:border-white/20 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded text-sm font-bold tracking-wide text-white disabled:opacity-50"
            style={{ background: RED }}>
            {loading ? 'Criando...' : 'Criar Aluno'}
          </button>
        </div>
      </form>
    </DarkModal>
  );
}

// ── DISCIPLINAS ───────────────────────────────────────────────────────────────

function DisciplinasTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await api.get('/admin/subjects');
    setSubjects(data); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(id: number, name: string) {
    if (!confirm(`Remover "${name}"? Isso removerá todas as notas associadas.`)) return;
    await api.delete(`/admin/subjects/${id}`);
    load();
  }

  const grouped = subjects.reduce((acc, s) => {
    if (!acc[s.semester]) acc[s.semester] = [];
    acc[s.semester].push(s);
    return acc;
  }, {} as Record<number, Subject[]>);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/25">{subjects.length} disciplina(s)</p>
        <button onClick={() => setShowModal(true)}
          className="text-xs font-bold tracking-widest px-4 py-2 rounded text-white"
          style={{ background: RED }}>
          + NOVA
        </button>
      </div>

      {loading ? <p className="text-white/30 text-sm text-center py-10">Carregando...</p> : (
        <div className="space-y-5">
          {Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map((sem) => (
            <div key={sem}>
              <p className="text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase mb-2">{sem}º Semestre</p>
              <DarkCard className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {['Código', 'Disciplina', 'C.H.', 'Ações'].map((h) => (
                          <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold tracking-widest text-white/30 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[Number(sem)].map((s, i) => (
                        <tr key={s.id} style={{ borderBottom: i < grouped[Number(sem)].length - 1 ? `1px solid ${BORDER}` : undefined }}
                          onMouseEnter={(el) => (el.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                          onMouseLeave={(el) => (el.currentTarget.style.background = 'transparent')}>
                          <td className="px-5 py-3">
                            <span className="font-mono text-xs text-white/35 px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>{s.code}</span>
                          </td>
                          <td className="px-5 py-3 text-sm font-medium text-white/70">{s.name}</td>
                          <td className="px-5 py-3 text-sm text-white/35">{s.workload}h</td>
                          <td className="px-5 py-3">
                            <button onClick={() => remove(s.id, s.name)}
                              className="text-xs font-bold px-3 py-1.5 rounded hover:opacity-70 transition-opacity"
                              style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DarkCard>
            </div>
          ))}
        </div>
      )}

      {showModal && <AddSubjectModal onClose={() => setShowModal(false)} onSuccess={load} />}
    </div>
  );
}

function AddSubjectModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ code: '', name: '', semester: '1', workload: '80' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/admin/subjects', {
        code: form.code, name: form.name,
        semester: Number(form.semester), workload: Number(form.workload),
      });
      onSuccess(); onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Erro ao criar disciplina.');
    } finally { setLoading(false); }
  }

  return (
    <DarkModal title="Nova Disciplina" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && <div className="text-red-400 text-sm px-4 py-3 rounded" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <DarkInput label="Código" required placeholder="ADS1001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <DarkSelect label="Semestre" required value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
            {Array.from({ length: 4 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n} style={{ background: '#1A1A1A' }}>{n}º</option>
            ))}
          </DarkSelect>
        </div>
        <DarkInput label="Nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <DarkInput label="Carga Horária (h)" type="number" required value={form.workload} min={10} max={400}
          onChange={(e) => setForm({ ...form, workload: e.target.value })} />
        <div className="flex gap-3 pt-1 pb-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded text-sm font-medium text-white/50 border border-white/10 hover:border-white/20 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded text-sm font-bold tracking-wide text-white disabled:opacity-50"
            style={{ background: RED }}>
            {loading ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </form>
    </DarkModal>
  );
}

// ── NOTAS & FALTAS ────────────────────────────────────────────────────────────

function NotasTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [editRow, setEditRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Enrollment>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/admin/students').then(({ data }) => setStudents(data)); }, []);

  useEffect(() => {
    if (!selected) { setEnrollments([]); return; }
    const s = students.find((s) => s.student_id === Number(selected));
    if (!s) return;
    api.get(`/admin/students/${s.student_id}/enrollments`).then(({ data }) => setEnrollments(data));
  }, [selected, students]);

  function startEdit(e: Enrollment) {
    setEditRow(e.enrollment_id);
    setEditData({ n1: e.n1, n2: e.n2, n3: e.n3, final_exam: e.final_exam, total_classes: e.total_classes, absences: e.absences });
  }

  async function saveEdit(enrollmentId: number) {
    setSaving(true);
    try {
      const toNum = (v: unknown) => (v !== null && v !== undefined && String(v) !== '') ? Number(v) : null;
      await Promise.all([
        api.put(`/admin/enrollments/${enrollmentId}/grades`, {
          n1: toNum(editData.n1), n2: toNum(editData.n2),
          n3: toNum(editData.n3), final_exam: toNum(editData.final_exam),
        }),
        api.put(`/admin/enrollments/${enrollmentId}/attendance`, {
          total_classes: Number(editData.total_classes) || 0,
          absences: Number(editData.absences) || 0,
        }),
      ]);
      const s = students.find((s) => s.student_id === Number(selected));
      if (s) { const { data } = await api.get(`/admin/students/${s.student_id}/enrollments`); setEnrollments(data); }
      setEditRow(null);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao salvar.');
    } finally { setSaving(false); }
  }

  const selectedStudent = students.find((s) => s.student_id === Number(selected));

  const editInput = (field: keyof Enrollment, nullable = true) => (
    <input type="number" min={0} max={10} step={0.1}
      className="w-14 text-center text-sm rounded px-1 py-0.5 text-white/80 focus:outline-none"
      style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}` }}
      value={editData[field] !== null && editData[field] !== undefined ? String(editData[field]) : ''}
      onChange={(ev) => setEditData({ ...editData, [field]: ev.target.value === '' ? (nullable ? null : 0) : Number(ev.target.value) })} />
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="flex-1 max-w-sm">
          <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: RED }}>SELECIONAR ALUNO</label>
          <select className="w-full rounded px-4 py-2.5 text-sm text-white/70 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}
            value={selected} onChange={(e) => { setSelected(e.target.value); setEditRow(null); }}>
            <option value="" style={{ background: '#1A1A1A' }}>— Selecione um aluno —</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id} style={{ background: '#1A1A1A' }}>
                {s.name} ({s.matricula})
              </option>
            ))}
          </select>
        </div>
        {selectedStudent && (
          <div className="self-end">
            <span className="text-xs font-bold px-3 py-2 rounded block" style={{ color: RED, background: `${RED}15` }}>
              {selectedStudent.semester}º Semestre
            </span>
          </div>
        )}
      </div>

      {!selected ? (
        <DarkCard className="p-10 text-center">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-sm text-white/30">Selecione um aluno para gerenciar.</p>
        </DarkCard>
      ) : enrollments.length === 0 ? (
        <DarkCard className="p-8 text-center">
          <p className="text-sm text-white/30">Nenhuma disciplina matriculada.</p>
        </DarkCard>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="block lg:hidden space-y-3">
            {enrollments.map((e) => {
              const isEditing = editRow === e.enrollment_id;
              const cur = isEditing ? ({ ...e, ...editData } as Enrollment) : e;
              const media = calcMedia(cur.n1, cur.n2, cur.n3);
              const allN = [cur.n1, cur.n2, cur.n3].filter((v) => v !== null).length === 3;
              const status = calcStatus(cur);
              const maxAbs = Math.floor(e.workload * 0.25);

              return (
                <DarkCard key={e.enrollment_id} className={`p-4 ${isEditing ? 'ring-1' : ''}`}
                  style={isEditing ? { '--tw-ring-color': RED } as React.CSSProperties : {}}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm text-white/80">{e.name}</p>
                      <p className="text-xs text-white/25 font-mono">{e.code}</p>
                    </div>
                    <StatusBadge s={status} />
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {(['n1', 'n2', 'n3'] as const).map((f) => (
                          <div key={f} className="text-center">
                            <p className="text-[10px] text-white/30 mb-1">{f.toUpperCase()}</p>
                            {editInput(f)}
                          </div>
                        ))}
                        <div className="text-center">
                          <p className="text-[10px] text-white/30 mb-1">Sub.</p>
                          {editInput('final_exam')}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-white/30 mb-1">Total Aulas</p>
                          <input type="number" min={0}
                            className="w-full text-sm rounded px-3 py-1.5 text-white/80 focus:outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}` }}
                            value={editData.total_classes ?? 0}
                            onChange={(ev) => setEditData({ ...editData, total_classes: Number(ev.target.value) })} />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/30 mb-1">Faltas</p>
                          <input type="number" min={0}
                            className="w-full text-sm rounded px-3 py-1.5 text-white/80 focus:outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}` }}
                            value={editData.absences ?? 0}
                            onChange={(ev) => setEditData({ ...editData, absences: Number(ev.target.value) })} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(e.enrollment_id)} disabled={saving}
                          className="flex-1 py-2 rounded text-sm font-bold text-white disabled:opacity-50"
                          style={{ background: '#22c55e' }}>
                          {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button onClick={() => setEditRow(null)}
                          className="flex-1 py-2 rounded text-sm font-medium text-white/50 border border-white/10">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                        {([['N1', e.n1], ['N2', e.n2], ['N3', e.n3], ['Sub.', e.final_exam]] as [string, number | null][]).map(([l, v]) => (
                          <div key={l} className="rounded py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <p className="text-[10px] text-white/30">{l}</p>
                            <p className="text-sm font-bold text-white/70">{fmtGrade(v)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-white/35 mb-3">
                        <span>Média: <strong className={allN && media !== null ? (media >= 6 ? 'text-green-400' : 'text-red-400') : 'text-white/25'}>
                          {allN && media !== null ? media.toFixed(1) : '—'}
                        </strong></span>
                        <span>Freq: {fmtFreq(e.total_classes, e.absences)}</span>
                        <span>Faltas: {e.absences}/{maxAbs}</span>
                      </div>
                      <button onClick={() => startEdit(e)}
                        className="w-full py-2 rounded text-sm font-bold transition-opacity hover:opacity-70"
                        style={{ color: RED, background: `${RED}15` }}>
                        Editar
                      </button>
                    </>
                  )}
                </DarkCard>
              );
            })}
          </div>

          {/* Desktop: tabela */}
          <DarkCard className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {['Disciplina', 'N1', 'N2', 'N3', 'Média', 'Sub.', 'Aulas', 'Faltas', 'Freq.', 'Situação', 'Ações'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-[10px] font-bold tracking-widest text-white/30 uppercase"
                        style={{ textAlign: h === 'Disciplina' ? 'left' : 'center' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => {
                    const isEditing = editRow === e.enrollment_id;
                    const cur = isEditing ? ({ ...e, ...editData } as Enrollment) : e;
                    const media = calcMedia(cur.n1, cur.n2, cur.n3);
                    const allN = [cur.n1, cur.n2, cur.n3].filter((v) => v !== null).length === 3;
                    const status = calcStatus(cur);

                    return (
                      <tr key={e.enrollment_id} style={{ borderBottom: `1px solid ${BORDER}`, background: isEditing ? `${RED}08` : undefined }}
                        onMouseEnter={(el) => { if (!isEditing) el.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={(el) => { if (!isEditing) el.currentTarget.style.background = 'transparent'; }}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm text-white/80">{e.name}</div>
                          <div className="text-xs text-white/25 font-mono">{e.code}</div>
                        </td>
                        {(['n1', 'n2', 'n3'] as const).map((f) => (
                          <td key={f} className="px-4 py-3 text-center">
                            {isEditing ? editInput(f) : <span className="text-sm text-white/50">{fmtGrade(e[f])}</span>}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-bold ${allN && media !== null ? (media >= 6 ? 'text-green-400' : media >= 4 ? 'text-amber-400' : 'text-red-400') : 'text-white/25'}`}>
                            {allN && media !== null ? media.toFixed(1) : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isEditing ? editInput('final_exam') : <span className="text-sm text-white/40">{fmtGrade(e.final_exam)}</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isEditing
                            ? <input type="number" min={0} className="w-14 text-center text-sm rounded px-1 py-0.5 text-white/80 focus:outline-none"
                                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}` }}
                                value={editData.total_classes ?? 0}
                                onChange={(ev) => setEditData({ ...editData, total_classes: Number(ev.target.value) })} />
                            : <span className="text-sm text-white/50">{e.total_classes || 0}</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isEditing
                            ? <input type="number" min={0} className="w-14 text-center text-sm rounded px-1 py-0.5 text-white/80 focus:outline-none"
                                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}` }}
                                value={editData.absences ?? 0}
                                onChange={(ev) => setEditData({ ...editData, absences: Number(ev.target.value) })} />
                            : <span className={`text-sm ${e.absences > Math.floor(e.workload * 0.25) ? 'text-red-400 font-bold' : 'text-white/50'}`}>{e.absences || 0}</span>}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-white/35">
                          {isEditing ? fmtFreq(editData.total_classes ?? 0, editData.absences ?? 0) : fmtFreq(e.total_classes, e.absences)}
                        </td>
                        <td className="px-4 py-3 text-center"><StatusBadge s={status} /></td>
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex gap-1 justify-center">
                              <button onClick={() => saveEdit(e.enrollment_id)} disabled={saving}
                                className="px-2 py-1 rounded text-xs font-bold text-white disabled:opacity-50" style={{ background: '#22c55e' }}>
                                {saving ? '...' : 'Salvar'}
                              </button>
                              <button onClick={() => setEditRow(null)}
                                className="px-2 py-1 rounded text-xs text-white/40 border border-white/10">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => startEdit(e)}
                              className="px-3 py-1 rounded text-xs font-bold hover:opacity-70 transition-opacity"
                              style={{ color: RED, background: `${RED}15` }}>
                              Editar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
              <p className="text-[11px] text-white/25">Aprovado: média ≥ 6.0 · Prova Sub.: 4.0 ≤ média &lt; 6.0 · Rep. Falta: &gt; 25% ausências</p>
            </div>
          </DarkCard>
        </>
      )}
    </div>
  );
}

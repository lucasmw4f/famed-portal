import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import type { Student, Subject, Enrollment } from '../types';
import { calcMedia, calcStatus, fmtGrade, fmtFreq } from '../types';

type Tab = 'alunos' | 'disciplinas' | 'notas';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('alunos');

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Barra gov.br */}
      <div className="bg-[#071D41]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
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
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
          <div>
            <p className="text-white font-black text-2xl sm:text-3xl leading-none tracking-tight">UFSCar</p>
            <p className="text-white/90 text-xs mt-0.5">Universidade Federal de São Carlos</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="text-white/80 text-sm hidden md:block">{user?.name}</span>
            <span className="text-white/70 text-xs hidden sm:inline bg-black/20 px-2 py-0.5 rounded">Administrador</span>
            <button onClick={logout} className="text-xs border border-white/50 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors whitespace-nowrap">
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Barra de abas admin */}
      <div className="bg-[#071D41]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            {(['alunos', 'disciplinas', 'notas'] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t ? 'text-white border-b-2 border-[#F26522]' : 'text-white/60 hover:text-white/90'
                }`}>
                {t === 'alunos' ? 'Alunos' : t === 'disciplinas' ? 'Disciplinas' : 'Notas & Faltas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-5 sm:py-7">
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
    <div className="card">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Alunos Cadastrados</h2>
          <p className="text-sm text-slate-500">{students.length} aluno(s)</p>
        </div>
        <button className="btn-primary whitespace-nowrap" onClick={() => setShowModal(true)}>+ Novo Aluno</button>
      </div>

      {loading ? <p className="text-slate-500 text-sm py-8 text-center">Carregando...</p>
        : students.length === 0 ? <p className="text-slate-500 text-sm py-8 text-center">Nenhum aluno cadastrado.</p>
        : (
          <div className="table-wrap">
            <div className="table-inner">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Nome</th>
                    <th className="table-th">Matrícula</th>
                    <th className="table-th hidden sm:table-cell">E-mail</th>
                    <th className="table-th">Sem.</th>
                    <th className="table-th">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          {(s as Student & { photo?: string }).photo ? (
                            <img src={(s as Student & { photo?: string }).photo} alt={s.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background:'#F26522'}}>
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium leading-tight">{s.name}</div>
                            <div className="text-xs text-slate-400 sm:hidden">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{s.matricula}</span>
                      </td>
                      <td className="table-td hidden sm:table-cell text-slate-500">{s.email}</td>
                      <td className="table-td">
                        <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap">
                          {s.semester}º
                        </span>
                      </td>
                      <td className="table-td">
                        <button className="btn-danger" onClick={() => remove(s.student_id!, s.name)}>Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {showModal && <AddStudentModal onClose={() => setShowModal(false)} onSuccess={load} />}
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-md rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">Novo Aluno</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
              <input className="input" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input className="input" placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha inicial *</label>
            <input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Semestre *</label>
            <select className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}º Semestre</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Aluno será matriculado nas disciplinas do semestre automaticamente.</p>
          </div>
          <div className="flex gap-3 pt-1 pb-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Criando...' : 'Criar Aluno'}</button>
          </div>
        </form>
      </div>
    </div>
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
    <div className="card">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Disciplinas</h2>
          <p className="text-sm text-slate-500">{subjects.length} disciplina(s)</p>
        </div>
        <button className="btn-primary whitespace-nowrap" onClick={() => setShowModal(true)}>+ Nova</button>
      </div>

      {loading ? <p className="text-slate-500 text-sm py-8 text-center">Carregando...</p>
        : (
          <div className="space-y-5">
            {Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map((sem) => (
              <div key={sem}>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{sem}º Semestre</h3>
                <div className="table-wrap">
                  <div className="table-inner">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="table-th">Código</th>
                          <th className="table-th">Disciplina</th>
                          <th className="table-th">C.H.</th>
                          <th className="table-th">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped[Number(sem)].map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="table-td"><span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{s.code}</span></td>
                            <td className="table-td font-medium">{s.name}</td>
                            <td className="table-td text-slate-500 whitespace-nowrap">{s.workload}h</td>
                            <td className="table-td"><button className="btn-danger" onClick={() => remove(s.id, s.name)}>Remover</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-md rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">Nova Disciplina</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
              <input className="input" placeholder="MED501" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semestre *</label>
              <select className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}º</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Carga Horária (h) *</label>
            <input type="number" className="input" min={10} max={400} value={form.workload}
              onChange={(e) => setForm({ ...form, workload: e.target.value })} required />
          </div>
          <div className="flex gap-3 pt-1 pb-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Criando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
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

  useEffect(() => {
    api.get('/admin/students').then(({ data }) => setStudents(data));
  }, []);

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
      if (s) {
        const { data } = await api.get(`/admin/students/${s.student_id}/enrollments`);
        setEnrollments(data);
      }
      setEditRow(null);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao salvar.');
    } finally { setSaving(false); }
  }

  const selectedStudent = students.find((s) => s.student_id === Number(selected));

  return (
    <div className="card">
      <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Notas e Faltas</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-sm">
          <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar Aluno</label>
          <select className="input" value={selected}
            onChange={(e) => { setSelected(e.target.value); setEditRow(null); }}>
            <option value="">— Selecione um aluno —</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.name} ({s.matricula})
              </option>
            ))}
          </select>
        </div>
        {selectedStudent && (
          <div className="self-end">
            <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-2 rounded-lg block sm:inline">
              {selectedStudent.semester}º Semestre
            </span>
          </div>
        )}
      </div>

      {!selected ? (
        <div className="text-center py-10 text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-sm">Selecione um aluno para gerenciar.</p>
        </div>
      ) : enrollments.length === 0 ? (
        <p className="text-slate-500 text-sm py-6 text-center">Nenhuma disciplina matriculada.</p>
      ) : (
        <>
          {/* ── Mobile: cards ── */}
          <div className="block lg:hidden space-y-3">
            {enrollments.map((e) => {
              const isEditing = editRow === e.enrollment_id;
              const cur = isEditing ? ({ ...e, ...editData } as Enrollment) : e;
              const media = calcMedia(cur.n1, cur.n2, cur.n3);
              const allN = [cur.n1, cur.n2, cur.n3].filter((v) => v !== null).length === 3;
              const status = calcStatus(cur);
              const maxAbs = Math.floor(e.workload * 0.25);

              return (
                <div key={e.enrollment_id}
                  className={`border rounded-xl p-4 ${isEditing ? 'border-orange-200 bg-orange-50/30' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{e.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{e.code}</p>
                    </div>
                    <span className={status.cls}>{status.label}</span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {(['n1', 'n2', 'n3'] as const).map((f) => (
                          <div key={f}>
                            <label className="block text-xs text-slate-500 mb-1 text-center">{f.toUpperCase()}</label>
                            <input type="number" min={0} max={10} step={0.1}
                              className="input text-center text-sm px-2 py-1.5"
                              value={editData[f] !== null && editData[f] !== undefined ? String(editData[f]) : ''}
                              onChange={(ev) => setEditData({ ...editData, [f]: ev.target.value === '' ? null : Number(ev.target.value) })} />
                          </div>
                        ))}
                        <div>
                          <label className="block text-xs text-slate-500 mb-1 text-center">EF</label>
                          <input type="number" min={0} max={10} step={0.1}
                            className="input text-center text-sm px-2 py-1.5"
                            value={editData.final_exam !== null && editData.final_exam !== undefined ? String(editData.final_exam) : ''}
                            onChange={(ev) => setEditData({ ...editData, final_exam: ev.target.value === '' ? null : Number(ev.target.value) })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Total de Aulas</label>
                          <input type="number" min={0} className="input text-sm py-1.5"
                            value={editData.total_classes ?? 0}
                            onChange={(ev) => setEditData({ ...editData, total_classes: Number(ev.target.value) })} />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Faltas</label>
                          <input type="number" min={0} className="input text-sm py-1.5"
                            value={editData.absences ?? 0}
                            onChange={(ev) => setEditData({ ...editData, absences: Number(ev.target.value) })} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          onClick={() => saveEdit(e.enrollment_id)} disabled={saving}>
                          {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button className="flex-1 btn-secondary py-2 text-sm" onClick={() => setEditRow(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {([['N1', e.n1], ['N2', e.n2], ['N3', e.n3], ['EF', e.final_exam]] as [string, number | null][]).map(([label, val]) => (
                          <div key={label} className="grade-cell">
                            <div className="grade-cell-label">{label}</div>
                            <div className="grade-cell-value">{fmtGrade(val)}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-slate-500">
                          Média: <strong className={allN && media !== null ? (media >= 5 ? 'text-green-700' : 'text-red-600') : 'text-slate-400'}>
                            {allN && media !== null ? media.toFixed(1) : '—'}
                          </strong>
                        </span>
                        <span className="text-slate-500">
                          Freq: <strong className={e.absences > maxAbs ? 'text-red-600' : ''}>{fmtFreq(e.total_classes, e.absences)}</strong>
                        </span>
                        <span className="text-slate-500">Faltas: {e.absences}/{maxAbs}</span>
                      </div>
                      <button className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 py-2 rounded-lg text-sm font-medium"
                        onClick={() => startEdit(e)}>Editar</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Desktop: table ── */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Disciplina</th>
                  <th className="table-th text-center">N1</th>
                  <th className="table-th text-center">N2</th>
                  <th className="table-th text-center">N3</th>
                  <th className="table-th text-center">Média</th>
                  <th className="table-th text-center">Exame</th>
                  <th className="table-th text-center">Aulas</th>
                  <th className="table-th text-center">Faltas</th>
                  <th className="table-th text-center">Freq.</th>
                  <th className="table-th text-center">Situação</th>
                  <th className="table-th text-center">Ações</th>
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
                    <tr key={e.enrollment_id} className={`hover:bg-slate-50 ${isEditing ? 'bg-orange-50/40' : ''}`}>
                      <td className="table-td">
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{e.code}</div>
                      </td>
                      {(['n1', 'n2', 'n3'] as const).map((f) => (
                        <td key={f} className="table-td text-center">
                          {isEditing ? (
                            <input type="number" min={0} max={10} step={0.1}
                              className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-sm"
                              value={editData[f] !== null && editData[f] !== undefined ? String(editData[f]) : ''}
                              onChange={(ev) => setEditData({ ...editData, [f]: ev.target.value === '' ? null : Number(ev.target.value) })} />
                          ) : <span>{fmtGrade(e[f])}</span>}
                        </td>
                      ))}
                      <td className="table-td text-center">
                        <span className={`font-semibold ${allN && media !== null ? (media >= 5 ? 'text-green-700' : media >= 3 ? 'text-orange-600' : 'text-red-600') : 'text-slate-400'}`}>
                          {allN && media !== null ? media.toFixed(1) : '—'}
                        </span>
                      </td>
                      <td className="table-td text-center">
                        {isEditing ? (
                          <input type="number" min={0} max={10} step={0.1}
                            className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-sm"
                            value={editData.final_exam !== null && editData.final_exam !== undefined ? String(editData.final_exam) : ''}
                            onChange={(ev) => setEditData({ ...editData, final_exam: ev.target.value === '' ? null : Number(ev.target.value) })} />
                        ) : <span className="text-slate-500">{fmtGrade(e.final_exam)}</span>}
                      </td>
                      <td className="table-td text-center">
                        {isEditing ? (
                          <input type="number" min={0} className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-sm"
                            value={editData.total_classes ?? 0}
                            onChange={(ev) => setEditData({ ...editData, total_classes: Number(ev.target.value) })} />
                        ) : <span>{e.total_classes || 0}</span>}
                      </td>
                      <td className="table-td text-center">
                        {isEditing ? (
                          <input type="number" min={0} className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-sm"
                            value={editData.absences ?? 0}
                            onChange={(ev) => setEditData({ ...editData, absences: Number(ev.target.value) })} />
                        ) : <span className={e.absences > Math.floor(e.workload * 0.25) ? 'text-red-600 font-semibold' : ''}>{e.absences || 0}</span>}
                      </td>
                      <td className="table-td text-center text-slate-500">
                        {isEditing
                          ? fmtFreq(editData.total_classes ?? 0, editData.absences ?? 0)
                          : fmtFreq(e.total_classes, e.absences)}
                      </td>
                      <td className="table-td text-center"><span className={status.cls}>{status.label}</span></td>
                      <td className="table-td text-center">
                        {isEditing ? (
                          <div className="flex gap-1 justify-center">
                            <button className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
                              onClick={() => saveEdit(e.enrollment_id)} disabled={saving}>{saving ? '...' : 'Salvar'}</button>
                            <button className="btn-secondary px-2 py-1 text-xs" onClick={() => setEditRow(null)}>✕</button>
                          </div>
                        ) : (
                          <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-medium"
                            onClick={() => startEdit(e)}>Editar</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-3">
              Aprovado: média ≥ 5.0 · Em Exame: 3.0 ≤ média &lt; 5.0 · Rep. Falta: &gt; 25% ausências
            </p>
          </div>
        </>
      )}
    </div>
  );
}

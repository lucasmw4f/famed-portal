import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import type { Enrollment, User } from '../types';
import { calcMedia, calcStatus, fmtGrade } from '../types';
import DeclaracaoMatricula from '../components/DeclaracaoMatricula';

type Tab = 'inicio' | 'boletim' | 'frequencia' | 'perfil' | 'declaracao';

const RED   = '#F5004A';
const BG    = '#0A0A0A';
const CARD  = '#111111';
const BORD  = 'rgba(255,255,255,0.07)';

/* ── utilidades ─────────────────────────────────────────────────────────── */

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 8, ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
      {children}
    </p>
  );
}

function Badge({ label }: { label: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Aprovado':   { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80' },
    'Rep. Nota':  { bg: 'rgba(245,0,74,0.12)',   color: '#f87171' },
    'Rep. Falta': { bg: 'rgba(245,0,74,0.12)',   color: '#f87171' },
    'Prova Sub.': { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
    'Cursando':   { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' },
    'Regular':    { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80' },
    'Em Risco':   { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
    'Rep. Falta (freq)': { bg: 'rgba(245,0,74,0.12)', color: '#f87171' },
    'Aguardando': { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
  };
  const c = map[label] ?? map['Cursando'];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
      background: c.bg, color: c.color,
    }}>{label}</span>
  );
}

/* ── dashboard ──────────────────────────────────────────────────────────── */

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]             = useState<Tab>('inicio');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [profile, setProfile]     = useState<User | null>(null);
  const [loading, setLoading]     = useState(true);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    Promise.all([api.get('/student/enrollments'), api.get('/student/profile')])
      .then(([eRes, pRes]) => { setEnrollments(eRes.data); setProfile(pRes.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ width: 28, height: 28, border: `2px solid ${RED}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'inicio',     label: 'Início' },
    { key: 'boletim',   label: 'Boletim' },
    { key: 'frequencia', label: 'Frequência' },
    { key: 'perfil',    label: 'Perfil' },
    { key: 'declaracao', label: 'Declaração' },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: BG, fontFamily: 'Inter, Arial, sans-serif' }}>

      {/* ── Header ── */}
      <header style={{ background: '#0D0D0D', borderBottom: `1px solid ${BORD}`, position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

          {/* Logo */}
          <span style={{ color: RED, fontWeight: 900, fontSize: 20, letterSpacing: 3, userSelect: 'none' }}>FIAP</span>

          {/* Nav desktop */}
          <nav style={{ display: 'flex', gap: 0 }} className="dash-nav-desktop">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 16px', height: 56, fontSize: 13, fontWeight: 500,
                color: tab === t.key ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                borderBottom: tab === t.key ? `2px solid ${RED}` : '2px solid transparent',
                transition: 'color .15s, border-color .15s',
                whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
              >{t.label}</button>
            ))}
          </nav>

          {/* Direita */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              className="dash-username">{user?.name}</span>
            <button onClick={logout} style={{
              background: 'none', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 4,
              color: 'rgba(255,255,255,0.45)', fontSize: 12, padding: '5px 12px', cursor: 'pointer',
              transition: 'border-color .15s, color .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
            >Sair</button>

            {/* Hamburguer mobile */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="dash-hamburger" style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              display: 'none', flexDirection: 'column', gap: 5,
            }}>
              {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 2, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />)}
            </button>
          </div>
        </div>

        {/* Menu mobile dropdown */}
        {menuOpen && (
          <div className="dash-menu-mobile" style={{ borderTop: `1px solid ${BORD}`, background: '#0D0D0D' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setMenuOpen(false); }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: tab === t.key ? 'rgba(245,0,74,0.08)' : 'none',
                border: 'none', borderLeft: tab === t.key ? `3px solid ${RED}` : '3px solid transparent',
                color: tab === t.key ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                padding: '13px 24px', fontSize: 14, cursor: 'pointer',
              }}>{t.label}</button>
            ))}
          </div>
        )}
      </header>

      {/* ── Conteúdo ── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        {tab === 'inicio'     && <InicioTab enrollments={enrollments} profile={profile} />}
        {tab === 'boletim'   && <BoletimTab enrollments={enrollments} />}
        {tab === 'frequencia' && <FrequenciaTab enrollments={enrollments} />}
        {tab === 'perfil'    && <PerfilTab profile={profile} onPhotoUpdate={photo => setProfile(p => p ? { ...p, photo } : p)} />}
        {tab === 'declaracao' && <Card style={{ padding: '24px' }}><DeclaracaoMatricula profile={profile} /></Card>}
      </main>

      <style>{`
        @media(max-width:768px){
          .dash-nav-desktop{ display:none !important; }
          .dash-hamburger{ display:flex !important; }
          .dash-username{ display:none !important; }
        }
        @media(min-width:769px){
          .dash-menu-mobile{ display:none !important; }
          .metrics-grid{ grid-template-columns: repeat(5,1fr) !important; gap: 12px !important; }
        }
        @media(min-width:480px) and (max-width:768px){
          .metrics-grid{ grid-template-columns: repeat(3,1fr) !important; }
        }
      `}</style>
    </div>
  );
}

/* ── INÍCIO ─────────────────────────────────────────────────────────────── */

function InicioTab({ enrollments, profile }: { enrollments: Enrollment[]; profile: User | null }) {
  const p = profile as User & { matricula?: string; semester?: number };

  const withGrades = enrollments.filter(e => e.n1 !== null && e.n2 !== null && e.n3 !== null);
  const medias     = withGrades.map(e => calcMedia(e.n1, e.n2, e.n3)).filter((m): m is number => m !== null);
  const mediaGeral = medias.length ? medias.reduce((a, b) => a + b, 0) / medias.length : null;
  const aprovados  = withGrades.filter(e => { const m = calcMedia(e.n1, e.n2, e.n3); return m !== null && m >= 6; }).length;
  const emSub      = withGrades.filter(e => { const m = calcMedia(e.n1, e.n2, e.n3); return m !== null && m >= 4 && m < 6; }).length;
  const reprovados = withGrades.filter(e => calcStatus(e).label.startsWith('Rep')).length;
  const emRisco    = enrollments.filter(e => {
    const max = Math.floor(e.workload * 0.25);
    return e.total_classes > 0 && e.absences > max * 0.7 && e.absences <= max;
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Dados do discente */}
      <Card style={{ padding: '20px 24px' }}>
        <SectionTitle>Dados do discente</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px 32px' }}>
          {[
            ['Nome',       profile?.name ?? '—'],
            ['Matrícula',  p?.matricula ?? '—'],
            ['Curso',      'ADS — Tecnólogo'],
            ['Semestre',   p?.semester ? `${p.semester}º Semestre` : '—'],
          ].map(([l, v]) => (
            <div key={l}>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{l}</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500 }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Indicadores */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { label: 'Disciplinas',  value: enrollments.length,  sub: 'matriculadas',          color: 'rgba(255,255,255,0.85)', alert: false },
          { label: 'Média Geral',  value: mediaGeral !== null ? mediaGeral.toFixed(2) : '—', sub: mediaGeral === null ? 'sem notas' : mediaGeral >= 6 ? 'regular' : 'abaixo do mínimo', color: mediaGeral !== null && mediaGeral < 6 ? '#f87171' : 'rgba(255,255,255,0.85)', alert: false },
          { label: 'Aprovações',   value: aprovados,            sub: `de ${withGrades.length} avaliadas`, color: aprovados > 0 ? '#4ade80' : 'rgba(255,255,255,0.85)', alert: false },
          { label: 'Prova Sub.',   value: emSub,                sub: 'aguardando',            color: emSub > 0 ? '#fbbf24' : 'rgba(255,255,255,0.85)', alert: false },
          { label: 'Reprovações',  value: reprovados,           sub: 'no período',            color: reprovados > 0 ? '#f87171' : 'rgba(255,255,255,0.85)', alert: false },
        ].map(m => (
          <Card key={m.label} style={{ padding: '16px 20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{m.label}</p>
            <p style={{ color: m.color, fontSize: 26, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{String(m.value)}</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{m.sub}</p>
          </Card>
        ))}
      </div>

      {/* Alerta frequência */}
      {emRisco > 0 && (
        <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderLeft: '3px solid #fbbf24', borderRadius: 6, padding: '12px 16px' }}>
          <p style={{ color: '#fbbf24', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Atenção — Frequência</p>
          <p style={{ color: 'rgba(251,191,36,0.7)', fontSize: 12 }}>{emRisco} disciplina(s) próximas do limite mínimo de 75%.</p>
        </div>
      )}

      {/* Quadro geral */}
      <Card>
        <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${BORD}` }}>
          <SectionTitle>Quadro geral de disciplinas</SectionTitle>
        </div>
        {enrollments.length === 0
          ? <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Nenhuma disciplina matriculada.</p>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                    {['Código','Disciplina','Média','Freq.','Situação'].map((h, i) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: i >= 2 ? 'center' : 'left', color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => {
                    const s   = calcStatus(e);
                    const m   = calcMedia(e.n1, e.n2, e.n3);
                    const allN = [e.n1,e.n2,e.n3].every(v => v !== null);
                    const freq = e.total_classes > 0 ? ((e.total_classes - e.absences) / e.total_classes) * 100 : null;
                    const repF = e.total_classes > 0 && e.absences > Math.floor(e.workload * 0.25);
                    return (
                      <tr key={e.enrollment_id} style={{ borderBottom: `1px solid ${BORD}` }}
                        onMouseEnter={el => (el.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '11px 16px', fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)' }}>{e.code}</td>
                        <td style={{ padding: '11px 16px', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{e.name}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: allN && m !== null ? (m >= 6 ? '#4ade80' : m >= 4 ? '#fbbf24' : '#f87171') : 'rgba(255,255,255,0.2)' }}>{allN && m !== null ? m.toFixed(1) : '—'}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: 13, fontWeight: 500, color: repF ? '#f87171' : freq !== null && freq < 80 ? '#fbbf24' : 'rgba(255,255,255,0.45)' }}>{freq !== null ? freq.toFixed(0)+'%' : '—'}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center' }}><Badge label={s.label} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </Card>
    </div>
  );
}

/* ── BOLETIM ─────────────────────────────────────────────────────────────── */

function BoletimTab({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <Card>
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${BORD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle>Boletim acadêmico</SectionTitle>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>{enrollments.length} disciplina(s)</span>
      </div>

      {enrollments.length === 0
        ? <p style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '32px 0', fontSize: 13 }}>Nenhuma disciplina matriculada.</p>
        : (
          <>
            {/* Mobile */}
            <div className="bol-mobile" style={{ display: 'none' }}>
              {enrollments.map(e => {
                const m    = calcMedia(e.n1, e.n2, e.n3);
                const allN = [e.n1,e.n2,e.n3].every(v => v !== null);
                return (
                  <div key={e.enrollment_id} style={{ padding: '14px 20px', borderBottom: `1px solid ${BORD}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>{e.name}</p>
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>{e.code}</p>
                      </div>
                      <Badge label={calcStatus(e).label} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                      {(['N1','N2','N3'] as const).map((l, i) => (
                        <div key={l} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4, padding: '8px 0', textAlign: 'center' }}>
                          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>{l}</p>
                          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginTop: 2 }}>{fmtGrade([e.n1,e.n2,e.n3][i])}</p>
                        </div>
                      ))}
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4, padding: '8px 0', textAlign: 'center' }}>
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>Média</p>
                        <p style={{ fontSize: 13, fontWeight: 700, marginTop: 2, color: allN && m !== null ? (m >= 6 ? '#4ade80' : '#f87171') : 'rgba(255,255,255,0.2)' }}>{allN && m !== null ? m.toFixed(1) : '—'}</p>
                      </div>
                    </div>
                    {e.final_exam !== null && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 8 }}>Prova Sub.: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{fmtGrade(e.final_exam)}</strong></p>}
                  </div>
                );
              })}
            </div>

            {/* Desktop */}
            <div className="bol-desktop" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                    {['Código','Disciplina','N1','N2','N3','Média','Prova Sub.','Situação'].map((h, i) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: i >= 2 ? 'center' : 'left', color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => {
                    const m    = calcMedia(e.n1, e.n2, e.n3);
                    const allN = [e.n1,e.n2,e.n3].every(v => v !== null);
                    return (
                      <tr key={e.enrollment_id} style={{ borderBottom: `1px solid ${BORD}` }}
                        onMouseEnter={el => (el.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '11px 16px', fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)' }}>{e.code}</td>
                        <td style={{ padding: '11px 16px', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{e.name}</td>
                        {[e.n1,e.n2,e.n3].map((v,i) => <td key={i} style={{ padding: '11px 16px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{fmtGrade(v)}</td>)}
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: allN && m !== null ? (m >= 6 ? '#4ade80' : m >= 4 ? '#fbbf24' : '#f87171') : 'rgba(255,255,255,0.2)' }}>{allN && m !== null ? m.toFixed(1) : '—'}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{fmtGrade(e.final_exam)}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center' }}><Badge label={calcStatus(e).label} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 20px', borderTop: `1px solid ${BORD}` }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>Aprovado: média ≥ 6,0 · Prova Sub.: 4,0 a 5,9 · Reprovado: média &lt; 4,0 ou pós-sub &lt; 6,0</p>
            </div>
          </>
        )}
      <style>{`
        @media(max-width:640px){ .bol-mobile{display:block !important} .bol-desktop{display:none !important} }
      `}</style>
    </Card>
  );
}

/* ── FREQUÊNCIA ──────────────────────────────────────────────────────────── */

function FrequenciaTab({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <Card>
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${BORD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle>Controle de frequência</SectionTitle>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Mínimo: 75%</span>
      </div>

      {enrollments.length === 0
        ? <p style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '32px 0', fontSize: 13 }}>Nenhuma disciplina matriculada.</p>
        : (
          <>
            {/* Mobile */}
            <div className="freq-mobile" style={{ display: 'none' }}>
              {enrollments.map(e => {
                const maxAbs = Math.floor(e.workload * 0.25);
                const freq   = e.total_classes > 0 ? ((e.total_classes - e.absences) / e.total_classes) * 100 : null;
                const repF   = e.total_classes > 0 && e.absences > maxAbs;
                const risk   = !repF && freq !== null && freq < 80;
                const badge  = repF ? 'Rep. Falta (freq)' : risk ? 'Em Risco' : e.total_classes === 0 ? 'Aguardando' : 'Regular';
                return (
                  <div key={e.enrollment_id} style={{ padding: '14px 20px', borderBottom: `1px solid ${BORD}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>{e.name}</p>
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>{e.code} · {e.workload}h</p>
                      </div>
                      <Badge label={badge} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
                      {[['Aulas',e.total_classes||0],['Faltas',e.absences||0],['Máx.',maxAbs]].map(([l,v]) => (
                        <div key={String(l)} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4, padding: '8px 0', textAlign: 'center' }}>
                          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>{l}</p>
                          <p style={{ color: l==='Faltas' && repF ? '#f87171' : 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginTop: 2 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                    {freq !== null && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Frequência</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: freq >= 75 ? '#4ade80' : freq >= 60 ? '#fbbf24' : '#f87171' }}>{freq.toFixed(1)}%</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 3 }}>
                          <div style={{ height: 3, borderRadius: 99, width: `${Math.min(freq,100)}%`, background: freq >= 75 ? '#4ade80' : freq >= 60 ? '#fbbf24' : RED }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop */}
            <div className="freq-desktop" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                    {['Código','Disciplina','C.H.','Aulas','Faltas','Máx.','Frequência','Situação'].map((h, i) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: i >= 2 ? 'center' : 'left', color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => {
                    const maxAbs = Math.floor(e.workload * 0.25);
                    const freq   = e.total_classes > 0 ? ((e.total_classes - e.absences) / e.total_classes) * 100 : null;
                    const repF   = e.total_classes > 0 && e.absences > maxAbs;
                    const risk   = !repF && freq !== null && freq < 80;
                    const badge  = repF ? 'Rep. Falta (freq)' : risk ? 'Em Risco' : e.total_classes === 0 ? 'Aguardando' : 'Regular';
                    return (
                      <tr key={e.enrollment_id} style={{ borderBottom: `1px solid ${BORD}` }}
                        onMouseEnter={el => (el.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '11px 16px', fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)' }}>{e.code}</td>
                        <td style={{ padding: '11px 16px', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{e.name}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{e.workload}h</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{e.total_classes||0}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: repF ? '#f87171' : risk ? '#fbbf24' : 'rgba(255,255,255,0.45)' }}>{e.absences||0}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>{maxAbs}</td>
                        <td style={{ padding: '11px 16px' }}>
                          {freq !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 3 }}>
                                <div style={{ height: 3, borderRadius: 99, width: `${Math.min(freq,100)}%`, background: freq >= 75 ? '#4ade80' : freq >= 60 ? '#fbbf24' : RED }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, width: 40, textAlign: 'right', color: freq >= 75 ? '#4ade80' : freq >= 60 ? '#fbbf24' : '#f87171' }}>{freq.toFixed(1)}%</span>
                            </div>
                          ) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, display: 'block', textAlign: 'center' }}>—</span>}
                        </td>
                        <td style={{ padding: '11px 16px', textAlign: 'center' }}><Badge label={badge} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 20px', borderTop: `1px solid ${BORD}` }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>Reprovação por falta: ausências acima de 25% da carga horária.</p>
            </div>
          </>
        )}
      <style>{`
        @media(max-width:640px){ .freq-mobile{display:block !important} .freq-desktop{display:none !important} }
      `}</style>
    </Card>
  );
}

/* ── PERFIL ──────────────────────────────────────────────────────────────── */

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX = 300;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else       { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PerfilTab({ profile, onPhotoUpdate }: { profile: User | null; onPhotoUpdate: (p: string) => void }) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr]             = useState('');
  if (!profile) return null;

  const p = profile as User & { matricula?: string; semester?: number; cpf?: string; phone?: string };

  function fmtCPF(v?: string)   { if (!v) return '—'; return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); }
  function fmtPhone(v?: string) { if (!v) return '—'; const d = v.replace(/\D/g,''); return d.length === 11 ? `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}` : v; }
  function fmtIngresso() {
    if (!p.semester) return '—';
    const now = new Date();
    const cur = now.getFullYear() * 2 + (now.getMonth() < 6 ? 0 : 1);
    const ing = cur - (p.semester - 1);
    const y = Math.floor(ing / 2);
    const s = (ing % 2) + 1;
    return s === 1 ? `Fevereiro/${y}` : `Agosto/${y}`;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Selecione uma imagem.'); return; }
    setErr(''); setUploading(true);
    try {
      const compressed = await compressImage(file);
      await api.put('/student/photo', { photo: compressed });
      onPhotoUpdate(compressed);
    } catch { setErr('Erro ao salvar foto.'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  const rows = [
    ['Curso',          'Tecnologia em Análise e Desenvolvimento de Sistemas'],
    ['Modalidade',     'Tecnólogo — Semestral Online'],
    ['Turno',          'Noturno'],
    ['Ingresso',       fmtIngresso()],
    ['Semestre atual', p.semester ? `${p.semester}º Semestre` : '—'],
    ['Matrícula',      p.matricula ?? '—'],
    ['CPF',            fmtCPF(p.cpf)],
    ['Telefone',       fmtPhone(p.phone)],
    ['Situação',       'Ativo(a)'],
    ['Regime',         'Semestral Online'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>

      {/* Identificação */}
      <Card style={{ padding: '20px 24px' }}>
        <SectionTitle>Identificação</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {profile.photo
              ? <img src={profile.photo} alt={profile.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${BORD}` }} />
              : <div style={{ width: 72, height: 72, borderRadius: '50%', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 900 }}>{profile.name.charAt(0)}</div>
            }
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
              position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%',
              background: RED, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {uploading
                ? <div style={{ width: 10, height: 10, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                : <svg width="11" height="11" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 600 }}>{profile.name}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 3 }}>Discente · ADS · FIAP</p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>{p.matricula}</p>
            {err && <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{err}</p>}
          </div>
        </div>
      </Card>

      {/* Dados */}
      <Card>
        <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${BORD}` }}>
          <SectionTitle>Dados acadêmicos e pessoais</SectionTitle>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map(([l, v]) => (
              <tr key={l} style={{ borderBottom: `1px solid ${BORD}` }}
                onMouseEnter={el => (el.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '10px 20px', color: 'rgba(255,255,255,0.28)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', width: 160, whiteSpace: 'nowrap' }}>{l}</td>
                <td style={{ padding: '10px 20px', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${BORD}` }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>Para atualização de dados, entre em contato: <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>relacionamento@fiap.com.br</span></p>
        </div>
      </Card>
    </div>
  );
}

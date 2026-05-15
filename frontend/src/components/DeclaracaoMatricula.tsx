import { useMemo } from 'react';
import type { User } from '../types';

const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function dateExtense() {
  const d = new Date();
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}
function fmtCPF(v?: string | null) {
  if (!v) return 'não informado';
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export default function DeclaracaoMatricula({ profile }: { profile: User | null }) {
  const p = profile as User & { matricula?: string; semester?: number; cpf?: string };
  const today = new Date();
  const year = today.getFullYear();

  const verifyCode = useMemo(() => {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const mat = p?.matricula?.slice(-6) ?? 'XXXXXX';
    return `FIAP-${year}-${mat}-${rand}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.matricula]);

  const name = (p?.name ?? '—').toUpperCase();
  const cpf  = fmtCPF(p?.cpf);
  const mat  = p?.matricula ?? '—';
  const sem  = p?.semester ?? '—';
  const date = dateExtense();

  function handlePrint() {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Declaração de Matrícula — FIAP</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    color: #111;
    background: #fff;
    width: 680px;
    margin: 0 auto;
    padding: 70px 80px;
    font-size: 14px;
    line-height: 1.9;
  }
  @page { size: A4; margin: 0; }
  .logo {
    font-family: Arial, sans-serif;
    font-weight: 900;
    font-size: 22px;
    letter-spacing: 8px;
    color: #F5004A;
    margin-bottom: 4px;
  }
  .inst {
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #555;
    margin-bottom: 2px;
  }
  .divider {
    border: none;
    border-top: 2px solid #F5004A;
    margin: 18px 0 40px;
  }
  h1 {
    font-family: Arial, sans-serif;
    font-size: 15px;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 36px;
  }
  p { margin-bottom: 18px; text-align: justify; }
  .date { margin-top: 40px; margin-bottom: 0; }
  .footer {
    font-family: Arial, sans-serif;
    font-size: 9px;
    color: #aaa;
    text-align: center;
    margin-top: 60px;
    border-top: 1px solid #e5e5e5;
    padding-top: 12px;
    line-height: 1.8;
  }
</style>
</head>
<body>
  <div class="logo">FIAP</div>
  <div class="inst">Faculdade de Informática e Administração Paulista</div>
  <div class="inst">Av. Lins de Vasconcelos, 1222 — Aclimação, São Paulo — SP</div>
  <hr class="divider"/>

  <h1>Declaração de Matrícula</h1>

  <p>
    Declaramos para os devidos fins que <strong>${name}</strong>, portador(a) do
    CPF <strong>${cpf}</strong>, encontra-se regularmente matriculado(a) no Curso de
    <strong> Tecnologia em Análise e Desenvolvimento de Sistemas</strong>, sob o número
    de matrícula <strong>${mat}</strong>, cursando atualmente o
    <strong> ${sem}º semestre</strong>, no turno <strong>noturno</strong>,
    no ano letivo de <strong>${year}</strong>.
  </p>

  <p>
    O(A) discente está em situação acadêmica regular, cumprindo os requisitos
    estabelecidos por esta Instituição de Ensino Superior no período letivo vigente.
  </p>

  <p>
    A presente declaração é expedida a pedido do(a) interessado(a) e é válida
    por <strong>90 (noventa) dias</strong> a contar da data de sua emissão.
  </p>

  <p class="date">São Paulo, ${date}.</p>

  <div class="footer">
    Documento gerado eletronicamente pelo Portal do Aluno FIAP · on.fiap.com.br<br/>
    Código de verificação: ${verifyCode}<br/>
    Este documento não substitui declarações emitidas diretamente pela Secretaria Acadêmica.
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=820,height=1000');
    if (!win) { alert('Permita pop-ups para imprimir.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  if (!profile) return null;

  const BORDER = 'rgba(255,255,255,0.07)';
  const RED    = '#F5004A';

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '15px' }}>Declaração de Matrícula</p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '3px' }}>
            {dateExtense()} · {verifyCode}
          </p>
        </div>
        <button onClick={handlePrint} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: RED, color: 'white', border: 'none',
          borderRadius: '3px', padding: '9px 18px', fontSize: '12px',
          fontWeight: 700, letterSpacing: '1.5px', cursor: 'pointer', whiteSpace: 'nowrap',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          IMPRIMIR / PDF
        </button>
      </div>

      {/* Preview */}
      <div style={{ background: '#161616', border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#111', borderBottom: `1px solid ${BORDER}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ color: RED, fontWeight: 900, fontSize: '18px', letterSpacing: '6px' }}>FIAP</span>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 600 }}>Faculdade de Informática e Administração Paulista</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', marginTop: '1px' }}>Av. Lins de Vasconcelos, 1222 — Aclimação, São Paulo — SP</p>
          </div>
        </div>
        <div style={{ height: '2px', background: RED }} />

        {/* Corpo */}
        <div style={{ padding: '28px 28px 24px' }}>

          <h2 style={{
            color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center',
            marginBottom: '28px',
          }}>
            Declaração de Matrícula
          </h2>

          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.95, textAlign: 'justify' }}>
            <p style={{ marginBottom: '16px' }}>
              Declaramos para os devidos fins que{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{name}</strong>, portador(a) do CPF{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{cpf}</strong>, encontra-se regularmente
              matriculado(a) no Curso de{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Tecnologia em Análise e Desenvolvimento de Sistemas</strong>,
              sob o número de matrícula{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{mat}</strong>, cursando atualmente o{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{sem}º semestre</strong>, no turno{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)' }}>noturno</strong>, no ano letivo de{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{year}</strong>.
            </p>

            <p style={{ marginBottom: '16px' }}>
              O(A) discente está em situação acadêmica regular, cumprindo os requisitos
              estabelecidos por esta Instituição de Ensino Superior no período letivo vigente.
            </p>

            <p style={{ marginBottom: '24px' }}>
              A presente declaração é expedida a pedido do(a) interessado(a) e é válida
              por <strong style={{ color: 'rgba(255,255,255,0.85)' }}>90 (noventa) dias</strong> a contar
              da data de sua emissão.
            </p>

            <p style={{ marginBottom: '0' }}>São Paulo, {date}.</p>
          </div>

          <div style={{ marginTop: '24px', borderTop: `1px solid ${BORDER}`, paddingTop: '14px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '10px', lineHeight: 1.8 }}>
              Documento gerado eletronicamente pelo Portal do Aluno FIAP · on.fiap.com.br<br />
              Código de verificação: {verifyCode}
            </p>
          </div>
        </div>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
        Clique em "Imprimir / PDF" para gerar o documento em formato A4.
      </p>
    </div>
  );
}

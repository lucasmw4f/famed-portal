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
function fmtPhone(v?: string | null) {
  if (!v) return 'não informado';
  const d = v.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  return v;
}

export default function DeclaracaoMatricula({ profile }: { profile: User | null }) {
  const p = profile as User & { matricula?: string; semester?: number; cpf?: string; phone?: string; photo?: string | null };
  const today = new Date();
  const year = today.getFullYear();

  const verifyCode = useMemo(() => {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const mat = p?.matricula?.slice(-4) ?? 'XXXX';
    return `UFSCar-${year}-${mat}-${rand}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.matricula]);

  function handlePrint() {
    const name  = (p?.name ?? '').toUpperCase();
    const cpf   = fmtCPF(p?.cpf);
    const phone = fmtPhone(p?.phone);
    const mat   = p?.matricula ?? '—';
    const sem   = p?.semester ?? '—';
    const date  = dateExtense();
    const photo = p?.photo ?? '';

    const photoTag = photo
      ? `<img src="${photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #e2e8f0;"/>`
      : `<div style="width:80px;height:80px;border-radius:50%;background:#F26522;display:flex;align-items:center;justify-content:center;color:#fff;font-size:32px;font-weight:bold;">${(p?.name ?? 'A').charAt(0).toUpperCase()}</div>`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Declaração de Matrícula — UFSCar</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,serif;color:#1e293b;background:#fff;width:794px;margin:0 auto}
@page{size:A4;margin:0}
.doc{display:flex;flex-direction:column;min-height:1123px}
.topbar{background:#071D41;padding:6px 48px}
.topbar p{font-size:9px;color:#fff;opacity:.7;font-family:Arial,sans-serif;letter-spacing:.3px}
.hdr{background:#F26522;color:#fff;padding:20px 48px;display:flex;align-items:center;gap:20px}
.hdr-logo{width:60px;height:60px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hdr h1{font-size:18px;font-weight:bold;letter-spacing:.8px;font-family:Arial,sans-serif;margin-bottom:3px}
.hdr p{font-size:10px;opacity:.85;font-family:Arial,sans-serif}
.stripe{height:4px;background:#071D41}
.title-area{text-align:center;padding:32px 48px 20px}
.sup{font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#64748b;font-family:Arial,sans-serif;margin-bottom:6px}
.title{font-size:20px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;border-bottom:2px solid #F26522;display:inline-block;padding-bottom:6px}
.docnum{font-size:10px;color:#94a3b8;margin-top:8px;font-family:'Courier New',monospace}
.body{padding:0 48px;flex-grow:1}
p.text{font-size:13.5px;line-height:1.85;margin-bottom:14px;text-align:justify}
.box{border:1.5px solid #cbd5e1;border-radius:8px;padding:18px 24px;margin-bottom:20px;background:#f8fafc;display:flex;gap:20px;align-items:flex-start}
.box-photo{flex-shrink:0}
.box-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 28px;flex:1}
.fi label{font-size:9.5px;text-transform:uppercase;letter-spacing:1px;color:#64748b;display:block;margin-bottom:2px;font-family:Arial,sans-serif}
.fi span{font-size:13px;font-weight:bold;color:#1e293b}
.date-line{font-size:13.5px;margin-bottom:40px}
.ftr{border-top:1px solid #e2e8f0;background:#f1f5f9;padding:14px 48px;display:flex;justify-content:space-between;align-items:center;margin-top:auto}
.ftr-left{font-size:10.5px;color:#64748b;font-family:Arial,sans-serif;line-height:1.7}
.ftr-right{text-align:right;font-size:10.5px;color:#94a3b8;font-family:Arial,sans-serif;line-height:1.7}
.ftr-right .code{font-family:'Courier New',monospace;font-weight:bold;color:#475569}
.seal{border:1.5px dashed #cbd5e1;border-radius:8px;padding:10px 20px;text-align:center;font-size:10px;color:#94a3b8;font-family:Arial,sans-serif;margin-bottom:20px}
</style>
</head>
<body>
<div class="doc">
  <div class="topbar"><p>Ministério da Educação · Universidade Federal de São Carlos — UFSCar</p></div>
  <div class="hdr">
    <div class="hdr-logo">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 14l9-5-9-5-9 5 9 5z"/>
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
      </svg>
    </div>
    <div>
      <h1>UNIVERSIDADE FEDERAL DE SÃO CARLOS — UFSCar</h1>
      <p>CNPJ: 48.709.315/0001-45 &nbsp;·&nbsp; São Carlos, SP &nbsp;·&nbsp; www.ufscar.br</p>
      <p>Autarquia Federal vinculada ao Ministério da Educação — Lei nº 3.835, de 13 de dezembro de 1960</p>
    </div>
  </div>
  <div class="stripe"></div>
  <div class="title-area">
    <div class="sup">Secretaria Geral de Graduação — Documento Oficial</div>
    <div class="title">Declaração de Matrícula Acadêmica</div>
    <div class="docnum">${verifyCode}</div>
  </div>
  <div class="body">
    <p class="text">A <strong>SECRETARIA GERAL DE GRADUAÇÃO DA UNIVERSIDADE FEDERAL DE SÃO CARLOS — UFSCar</strong>, no uso de suas atribuições legais e regimentais, declara para os devidos fins que o(a) discente identificado(a) abaixo:</p>
    <div class="box">
      <div class="box-photo">${photoTag}</div>
      <div class="box-grid">
        <div class="fi"><label>Nome Completo</label><span>${name}</span></div>
        <div class="fi"><label>CPF</label><span>${cpf}</span></div>
        <div class="fi"><label>Matrícula</label><span>${mat}</span></div>
        <div class="fi"><label>Telefone</label><span>${phone}</span></div>
        <div class="fi"><label>Curso</label><span>Medicina (Bacharelado)</span></div>
        <div class="fi"><label>Período</label><span>${sem}º Semestre</span></div>
        <div class="fi"><label>Turno</label><span>Integral</span></div>
        <div class="fi"><label>Situação</label><span>Regularmente Matriculado(a)</span></div>
        <div class="fi"><label>Ano Letivo</label><span>${year}</span></div>
        <div class="fi"><label>Regime</label><span>Semestral Presencial</span></div>
      </div>
    </div>
    <p class="text">encontra-se <strong>regularmente matriculado(a)</strong> no Curso de <strong>MEDICINA (Bacharelado)</strong> desta Instituição Federal de Ensino Superior, vinculada ao Ministério da Educação, cumprindo integralmente os requisitos acadêmicos e administrativos estabelecidos por esta Universidade no período letivo vigente.</p>
    <p class="text">A presente declaração é válida por <strong>90 (noventa) dias</strong> a contar da data de emissão e foi expedida a pedido do(a) interessado(a), para os fins que se fizerem necessários, não substituindo documentos oficiais emitidos pelo Ministério da Educação.</p>
    <p class="date-line">São Carlos, ${date}.</p>
    <div class="seal">Documento gerado eletronicamente pelo Sistema Acadêmico UFSCar &nbsp;·&nbsp; Autenticidade verificável em www.ufscar.br/verificar &nbsp;·&nbsp; Cód. ${verifyCode}</div>
  </div>
  <div class="ftr">
    <div class="ftr-left">
      <div><strong>UFSCar — Universidade Federal de São Carlos</strong></div>
      <div>Rod. Washington Luís, km 235 — São Carlos, SP — CEP 13565-905</div>
      <div>secretaria@ufscar.br &nbsp;·&nbsp; (16) 3351-8111</div>
    </div>
    <div class="ftr-right">
      <div class="code">${verifyCode}</div>
      <div>Emitido eletronicamente em ${date}</div>
    </div>
  </div>
</div>
</body></html>`;

    const win = window.open('', '_blank', 'width=860,height=1080');
    if (!win) { alert('Permita pop-ups para imprimir.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  }

  if (!profile) return null;

  const infoItems = [
    ['Nome Completo',  (p?.name ?? '').toUpperCase()],
    ['CPF',            fmtCPF(p?.cpf)],
    ['Matrícula',      p?.matricula ?? '—'],
    ['Telefone',       fmtPhone(p?.phone)],
    ['Curso',          'Medicina (Bacharelado)'],
    ['Período',        `${p?.semester ?? '—'}º Semestre`],
    ['Turno',          'Integral'],
    ['Situação',       'Regularmente Matriculado(a)'],
    ['Ano Letivo',     String(year)],
    ['Regime',         'Semestral Presencial'],
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Declaração de Matrícula</h2>
          <p className="text-xs sm:text-sm text-slate-500">Gerada em {dateExtense()} · {verifyCode}</p>
        </div>
        <button onClick={handlePrint}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          style={{ background: '#F26522' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E05A15')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#F26522')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Preview responsivo */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md">
        {/* Topo institucional */}
        <div className="bg-[#071D41] px-4 sm:px-6 py-1.5">
          <p className="text-white/70 text-xs">Ministério da Educação · Universidade Federal de São Carlos — UFSCar</p>
        </div>

        {/* Header */}
        <div className="bg-[#F26522] text-white p-4 sm:p-6 flex items-center gap-3 sm:gap-5">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[#F26522]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold tracking-wide">UNIVERSIDADE FEDERAL DE SÃO CARLOS — UFSCar</h1>
            <p className="text-xs opacity-80 mt-0.5">CNPJ: 48.709.315/0001-45 · São Carlos, SP</p>
            <p className="text-xs opacity-60 mt-0.5 hidden sm:block">Autarquia Federal vinculada ao Ministério da Educação</p>
          </div>
        </div>

        {/* Stripe dourada */}
        <div className="h-1" style={{ background: '#071D41' }} />

        {/* Título */}
        <div className="text-center py-5 sm:py-7 px-4">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Secretaria Geral de Graduação — Documento Oficial</p>
          <h2 className="text-sm sm:text-lg font-bold uppercase tracking-wide text-slate-800 inline-block border-b-2 border-[#F26522] pb-2">
            Declaração de Matrícula Acadêmica
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-mono">{verifyCode}</p>
        </div>

        {/* Corpo */}
        <div className="px-4 sm:px-8 pb-6">
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 mb-4 text-justify">
            A <strong>SECRETARIA GERAL DE GRADUAÇÃO DA UNIVERSIDADE FEDERAL DE SÃO CARLOS — UFSCar</strong>, no uso de suas
            atribuições legais e regimentais, declara para os devidos fins que o(a) discente identificado(a) abaixo:
          </p>

          {/* Caixa do aluno com foto */}
          <div className="border-2 border-slate-200 rounded-xl p-4 sm:p-5 mb-4 bg-slate-50 flex gap-4 items-start">
            <div className="flex-shrink-0">
              {p?.photo ? (
                <img src={p.photo} alt={p?.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-300" />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold"
                  style={{ background: '#F26522' }}>
                  {(p?.name ?? 'A').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
              {infoItems.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 mb-3 text-justify">
            encontra-se <strong>regularmente matriculado(a)</strong> no Curso de <strong>MEDICINA (Bacharelado)</strong> desta
            Instituição Federal de Ensino Superior, vinculada ao Ministério da Educação, cumprindo
            integralmente os requisitos acadêmicos no período letivo vigente.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 mb-5 text-justify">
            A presente declaração é válida por <strong>90 (noventa) dias</strong> a contar da data de emissão
            e foi expedida a pedido do(a) interessado(a).
          </p>
          <p className="text-xs sm:text-sm text-slate-700 mb-4">São Carlos, {dateExtense()}.</p>

          <div className="border border-dashed border-slate-300 rounded-lg px-4 py-3 text-center text-xs text-slate-400">
            Documento gerado eletronicamente pelo Sistema Acadêmico UFSCar · Autenticidade verificável em www.ufscar.br/verificar · Cód. {verifyCode}
          </div>
        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-slate-500">
            <div className="leading-relaxed">
              <p><strong>UFSCar — Universidade Federal de São Carlos</strong></p>
              <p>Rod. Washington Luís, km 235 — São Carlos, SP — CEP 13565-905</p>
              <p>secretaria@ufscar.br · (16) 3351-8111</p>
            </div>
            <div className="sm:text-right leading-relaxed">
              <p className="font-mono font-bold text-slate-600">{verifyCode}</p>
              <p>Emitido em: {dateExtense()}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-3 text-center">
        Clique em "Imprimir / Salvar PDF" para gerar o documento oficial em formato A4.
      </p>
    </div>
  );
}

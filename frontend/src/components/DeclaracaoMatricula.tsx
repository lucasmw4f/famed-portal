import { useMemo } from 'react';
import type { User } from '../types';

const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function dateExtense() {
  const d = new Date();
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

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

export default function DeclaracaoMatricula({ profile }: { profile: User | null }) {
  const p = profile as User & { matricula?: string; semester?: number; cpf?: string; phone?: string };
  const today = new Date();
  const year = today.getFullYear();

  const verifyCode = useMemo(() => {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const mat = p?.matricula?.slice(-4) ?? 'XXXX';
    return `FAMED-${year}-${mat}-${rand}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.matricula]);

  function handlePrint() {
    const name = (p?.name ?? '').toUpperCase();
    const cpf  = fmtCPF(p?.cpf);
    const phone = fmtPhone(p?.phone);
    const mat  = p?.matricula ?? '—';
    const sem  = p?.semester ?? '—';
    const date = dateExtense();

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Declaração de Matrícula — FAMED</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,serif;color:#1e293b;background:#fff;width:794px;margin:0 auto}
@page{size:A4;margin:0}
.doc{display:flex;flex-direction:column;min-height:1123px}
.hdr{background:#1e3a5f;color:#fff;padding:28px 48px;display:flex;align-items:center;gap:20px}
.hdr-logo{width:72px;height:72px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hdr h1{font-size:22px;font-weight:bold;letter-spacing:1px;font-family:Arial,sans-serif}
.hdr p{font-size:12px;opacity:.85;margin-top:3px;font-family:Arial,sans-serif}
.stripe{height:6px;background:linear-gradient(90deg,#dc2626,#2563eb)}
.title-area{text-align:center;padding:36px 48px 24px}
.title-area .sup{font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#64748b;font-family:Arial,sans-serif}
.title-area h2{font-size:21px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #1e3a5f;display:inline-block;padding-bottom:8px}
.title-area .code{font-size:11px;color:#94a3b8;margin-top:8px;font-family:Arial,sans-serif}
.body{padding:0 56px;flex-grow:1}
p{font-size:14px;line-height:1.9;margin-bottom:16px;text-align:justify}
.box{border:2px solid #cbd5e1;border-radius:8px;padding:20px 28px;margin-bottom:24px;background:#f8fafc}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 32px}
.fi label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;display:block;margin-bottom:2px;font-family:Arial,sans-serif}
.fi span{font-size:13.5px;font-weight:bold;color:#1e293b}
.sigs{display:flex;justify-content:space-around;margin-bottom:16px}
.sig{text-align:center;width:200px}
.sig-line{border-top:2px solid #334155;margin-bottom:8px}
.sig p{font-size:13px;font-weight:bold;font-family:Arial,sans-serif}
.sig small{font-size:11px;color:#64748b;font-family:Arial,sans-serif}
.ftr{border-top:1px solid #e2e8f0;background:#f1f5f9;padding:14px 48px;display:flex;justify-content:space-between;align-items:center}
.ftr-left{font-size:11px;color:#64748b;font-family:Arial,sans-serif;line-height:1.6}
.ftr-right{text-align:right;font-size:11px;color:#94a3b8;font-family:Arial,sans-serif;line-height:1.6}
.ftr-right .code{font-family:'Courier New',monospace;font-weight:bold;color:#475569}
</style>
</head>
<body>
<div class="doc">
  <div class="hdr">
    <div class="hdr-logo">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
    </div>
    <div>
      <h1>FACULDADE DE MEDICINA</h1>
      <p>FAMED &nbsp;·&nbsp; São Paulo, SP &nbsp;·&nbsp; CNPJ: 12.345.678/0001-90</p>
      <p>Credenciada pelo MEC — Portaria nº 1.234, de 15 de março de 2010</p>
    </div>
  </div>
  <div class="stripe"></div>
  <div class="title-area">
    <div class="sup">Secretaria Acadêmica</div>
    <h2>Declaração de Matrícula Acadêmica</h2>
    <div class="code">Nº ${verifyCode}</div>
  </div>
  <div class="body">
    <p>A <strong>SECRETARIA ACADÊMICA DA FACULDADE DE MEDICINA — FAMED</strong>, no uso de suas atribuições legais e regimentais, declara para os devidos fins que:</p>
    <div class="box">
      <div class="grid">
        <div class="fi"><label>Nome Completo</label><span>${name}</span></div>
        <div class="fi"><label>CPF</label><span>${cpf}</span></div>
        <div class="fi"><label>Matrícula</label><span>${mat}</span></div>
        <div class="fi"><label>Telefone</label><span>${phone}</span></div>
        <div class="fi"><label>Curso</label><span>Medicina (Bacharelado)</span></div>
        <div class="fi"><label>Período</label><span>${sem}º Semestre</span></div>
        <div class="fi"><label>Turno</label><span>Integral</span></div>
        <div class="fi"><label>Situação</label><span>Regularmente Matriculado(a)</span></div>
        <div class="fi"><label>Ano Letivo</label><span>${year}</span></div>
        <div class="fi"><label>Regime</label><span>Semestral</span></div>
      </div>
    </div>
    <p>encontra-se <strong>regularmente matriculado(a)</strong> no Curso de <strong>MEDICINA (Bacharelado)</strong> desta Instituição de Ensino Superior, devidamente credenciada pelo Ministério da Educação, no período letivo vigente, cumprindo todas as exigências acadêmicas e administrativas estabelecidas por esta Instituição.</p>
    <p>A presente declaração é válida por <strong>90 (noventa) dias</strong> a contar da data de emissão e foi expedida a pedido do(a) interessado(a), para os fins que se fizerem necessários.</p>
    <p>São Paulo, ${date}.</p>
    <div class="sigs">
      <div class="sig"><div class="sig-line"></div><p>Secretaria Acadêmica</p><small>FAMED — Faculdade de Medicina</small></div>
      <div class="sig"><div class="sig-line"></div><p>Diretoria Acadêmica</p><small>FAMED — Faculdade de Medicina</small></div>
    </div>
  </div>
  <div class="ftr">
    <div class="ftr-left">
      <div>Av. das Ciências da Saúde, 100 — São Paulo, SP — CEP: 01310-100</div>
      <div>secretaria@famed.edu.br &nbsp;·&nbsp; (11) 3000-0000 &nbsp;·&nbsp; www.famed.edu.br</div>
    </div>
    <div class="ftr-right">
      <div class="code">${verifyCode}</div>
      <div>Emitido em: ${date}</div>
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
    ['Nome Completo', (p?.name ?? '').toUpperCase()],
    ['CPF', fmtCPF(p?.cpf)],
    ['Matrícula', p?.matricula ?? '—'],
    ['Telefone', fmtPhone(p?.phone)],
    ['Curso', 'Medicina (Bacharelado)'],
    ['Período', `${p?.semester ?? '—'}º Semestre`],
    ['Turno', 'Integral'],
    ['Situação', 'Regularmente Matriculado(a)'],
    ['Ano Letivo', String(year)],
    ['Regime', 'Semestral'],
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Declaração de Matrícula</h2>
          <p className="text-xs sm:text-sm text-slate-500">Gerada em {dateExtense()}</p>
        </div>
        <button onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Responsive preview */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md">
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white p-4 sm:p-6 flex items-center gap-3 sm:gap-5">
          <div className="w-11 h-11 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 sm:w-9 sm:h-9 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg md:text-xl font-bold tracking-wide">FACULDADE DE MEDICINA</h1>
            <p className="text-xs opacity-85 mt-0.5">FAMED · São Paulo, SP · CNPJ: 12.345.678/0001-90</p>
            <p className="text-xs opacity-65 mt-0.5 hidden sm:block">Credenciada pelo MEC — Portaria nº 1.234, de 15 de março de 2010</p>
          </div>
        </div>

        {/* Color stripe */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #dc2626, #2563eb)' }} />

        {/* Title */}
        <div className="text-center py-6 sm:py-8 px-4">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Secretaria Acadêmica</p>
          <h2 className="text-sm sm:text-lg md:text-xl font-bold uppercase tracking-wide text-slate-800 inline-block border-b-2 border-[#1e3a5f] pb-2">
            Declaração de Matrícula Acadêmica
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-mono">{verifyCode}</p>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-8 pb-6">
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 mb-4 text-justify">
            A <strong>SECRETARIA ACADÊMICA DA FACULDADE DE MEDICINA — FAMED</strong>,
            no uso de suas atribuições legais e regimentais, declara para os devidos fins que:
          </p>

          {/* Student data box */}
          <div className="border-2 border-slate-200 rounded-xl p-4 sm:p-5 mb-4 bg-slate-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {infoItems.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 mb-3 text-justify">
            encontra-se <strong>regularmente matriculado(a)</strong> no Curso de <strong>MEDICINA (Bacharelado)</strong> desta
            Instituição de Ensino Superior, devidamente credenciada pelo Ministério da Educação,
            no período letivo vigente.
          </p>

          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 mb-6 text-justify">
            A presente declaração é válida por <strong>90 (noventa) dias</strong> a contar da data de emissão
            e foi expedida a pedido do(a) interessado(a), para os fins que se fizerem necessários.
          </p>

          <p className="text-xs sm:text-sm text-slate-700 mb-8">São Paulo, {dateExtense()}.</p>

          {/* Signatures */}
          <div className="flex justify-around flex-wrap gap-6 mb-4">
            {['Secretaria Acadêmica', 'Diretoria Acadêmica'].map((cargo) => (
              <div key={cargo} className="text-center w-44 sm:w-52">
                <div className="border-t-2 border-slate-500 mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-slate-700">{cargo}</p>
                <p className="text-xs text-slate-400">FAMED — Faculdade de Medicina</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-slate-500">
            <div className="leading-relaxed">
              <p>Av. das Ciências da Saúde, 100 — São Paulo, SP — CEP: 01310-100</p>
              <p>secretaria@famed.edu.br · (11) 3000-0000 · www.famed.edu.br</p>
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

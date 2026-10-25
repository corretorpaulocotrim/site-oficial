// Contexto: le o PDF (book/planta/tabela), classifica cada pagina e cruza com o que o Paulo FALA para escolher a hora de cada material.
const fs = require('fs');
const path = require('path');

// Categorias: palavras no PDF/etiqueta e palavras FALADAS que chamam aquele material
const CATEG = {
  planta: { rotulo: 'PLANTA', pdf: ['planta', 'm²', 'm2', 'dorm', 'quarto', 'suíte', 'suite', 'living', 'cozinha', 'varanda', 'área privativa', 'garden', 'cobertura', 'tipo'], fala: ['planta', 'quarto', 'quartos', 'sala', 'cozinha', 'varanda', 'suíte', 'metros', 'metragem', 'banheiro', 'layout'] },
  lazer: { rotulo: 'LAZER', pdf: ['lazer', 'piscina', 'academia', 'fitness', 'churrasqueira', 'playground', 'salão de festas', 'brinquedoteca', 'quadra', 'coworking', 'pet', 'sauna', 'gourmet', 'spa'], fala: ['lazer', 'piscina', 'academia', 'churrasqueira', 'playground', 'festa', 'quadra', 'crianças', 'rooftop'] },
  localizacao: { rotulo: 'LOCALIZAÇÃO', pdf: ['localização', 'localizacao', 'mapa', 'metrô', 'vlt', 'minutos', 'distância', 'shopping', 'avenida', 'estação'], fala: ['localização', 'fica', 'perto', 'metrô', 'metro', 'vlt', 'minutos', 'bairro', 'região', 'praia', 'centro', 'trabalho'] },
  condicoes: { rotulo: 'CONDIÇÕES', pdf: ['tabela', 'valor', 'r$', 'parcela', 'entrada', 'sinal', 'preço', 'condições', 'fluxo', 'repasse'], fala: ['entrada', 'parcela', 'fgts', 'financiamento', 'caixa', 'subsídio', 'valor', 'preço', 'renda', 'pagar'] },
  ficha: { rotulo: 'FICHA TÉCNICA', pdf: ['ficha técnica', 'torres', 'elevadores', 'unidades', 'vagas', 'andares', 'terreno'], fala: ['unidades', 'torre', 'andares', 'vaga', 'elevador'] },
  fachada: { rotulo: 'FACHADA', pdf: ['fachada', 'perspectiva', 'ilustrativa', 'portaria', 'vista'], fala: ['prédio', 'fachada', 'empreendimento', 'projeto', 'torre', 'portaria', 'lançamento'] },
  decorado: { rotulo: 'DECORADO', pdf: ['decorado', 'ambientação'], fala: ['decorado', 'acabamento', 'apartamento', 'por dentro'] }
};
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function classificar(texto) {
  const t = norm(texto); let melhor = null, pts = 0;
  for (const [k, c] of Object.entries(CATEG)) {
    const p = c.pdf.reduce((s, w) => s + (t.split(norm(w)).length - 1), 0);
    if (p > pts) { pts = p; melhor = k; }
  }
  return pts >= 1 ? melhor : null;
}
const categoriaDaEtiqueta = et => { if (!et) return null; const t = norm(et); return Object.keys(CATEG).find(k => t.includes(norm(k)) || CATEG[k].pdf.some(w => t.includes(norm(w)))) || null; };

function fatos(texto) {
  const m2 = [...texto.matchAll(/(\d{2,3}(?:[.,]\d{1,2})?)\s?m²/gi)].map(m => parseFloat(m[1].replace(',', '.'))).filter(n => n >= 18 && n < 1000);
  const q = [...texto.matchAll(/(\d)\s?(?:quartos?|dorms?\.?|dormit[óo]rios?|su[íi]tes?)/gi)].map(m => +m[1]).filter(n => n > 0 && n < 7);
  const r = {};
  if (m2.length) r.metragem = Math.min(...m2) === Math.max(...m2) ? `${Math.min(...m2)} m²` : `${Math.min(...m2)} a ${Math.max(...m2)} m²`;
  if (q.length) r.quartos = Math.min(...q) === Math.max(...q) ? `${q[0]} quarto${q[0] > 1 ? 's' : ''}` : `${Math.min(...q)} a ${Math.max(...q)} quartos`;
  return r;
}

function faixa(sel, n) { // "1-3,5" -> [1,2,3,5]
  if (!sel) return null; const out = new Set();
  for (const p of String(sel).split(',')) { const [a, b] = p.split('-').map(x => parseInt(x)); if (a) for (let i = a; i <= (b || a) && i <= n; i++) out.add(i); }
  return out.size ? out : null;
}

// PDF -> imagens + categoria por pagina + fatos (metragem/quartos)
async function lerPdf(item, dir, op, log) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { pdf } = await import('pdf-to-img');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(item.arquivo)), verbosity: 0 }).promise;
  const sel = faixa(op.paginasPdf, doc.numPages), max = op.maxPaginasPdf || 12;
  const textos = [];
  for (let i = 1; i <= doc.numPages; i++) textos.push((await (await doc.getPage(i)).getTextContent()).items.map(x => x.str).join(' '));
  const imgs = await pdf(item.arquivo, { scale: 2.5 });
  const out = []; let n = 0, todos = '';
  for await (const png of imgs) {
    n++; const txt = textos[n - 1] || ''; todos += ' ' + txt;
    if (sel ? !sel.has(n) : out.length >= max) continue;
    const cat = classificar(txt) || categoriaDaEtiqueta(item.etiqueta);
    if (cat === 'condicoes' && op.ocultarTabela !== false) { log(`  ⊘ pag. ${n} é tabela de preço — oculta (valor só no WhatsApp)`); continue; }
    const f = path.join(dir, `pdf-${String(out.length).padStart(2, '0')}-p${n}.png`);
    fs.writeFileSync(f, png);
    out.push({ ...item, arquivo: f, doc: true, categoria: cat, etiqueta: cat ? CATEG[cat].rotulo : item.etiqueta, texto: txt.slice(0, 300) });
  }
  log(`📄 ${path.basename(item.arquivo)}: ${n} páginas lidas → ${out.length} cenas (${out.map(o => o.etiqueta || '?').join(', ')})`);
  return { cenas: out, fatos: fatos(todos) };
}

// Agenda: cada material entra quando o Paulo fala do assunto; o resto preenche os buracos na ordem
function agendar(materiais, palavras, D, op) {
  const ini = Math.min(3, D * 0.2), fimFala = Math.max(ini + 1, D - (op.pauloNoFim ?? 1.6));
  const usados = new Set();
  const anc = materiais.map(m => {
    const cat = m.categoria || categoriaDaEtiqueta(m.etiqueta);
    if (!cat || !palavras.length) return null;
    const alvo = CATEG[cat].fala.map(norm);
    const p = palavras.find((w, i) => w.ini >= ini && !usados.has(i) && alvo.includes(norm(w.t).replace(/[^\w ]/g, '')) && usados.add(i));
    return p ? p.ini : null;
  });
  // interpola os sem ancora mantendo a ordem do usuario
  const n = materiais.length, base = i => ini + (fimFala - ini) * i / n;
  let ts = anc.map((a, i) => a ?? base(i));
  const ordem = ts.map((t, i) => [t, i]).sort((a, b) => a[0] - b[0]);
  const MIN = 1.6, MAX = op.maxCena || 4.5;
  const slots = [];
  ordem.forEach(([t, i], k) => {
    const prev = slots[slots.length - 1];
    let a = Math.max(t, prev ? prev.b : ini);
    const prox = k + 1 < ordem.length ? Math.max(ordem[k + 1][0], a + MIN) : fimFala;
    let b = Math.min(a + MAX, prox, fimFala);
    if (b - a < MIN) b = Math.min(a + MIN, fimFala);
    if (b - a >= 0.8) slots.push({ a, b, m: materiais[i], falado: anc[i] !== null });
  });
  // monta linha do tempo com o Paulo em tela cheia nos intervalos
  const tl = []; let t = 0;
  for (const s of slots) { if (s.a - t > 0.3) tl.push({ tipo: 'paulo', a: t, b: s.a }); else if (tl.length) tl[tl.length - 1].b = s.a; else s.a = 0; tl.push({ tipo: 'material', ...s }); t = s.b; }
  if (D - t > 0.05) tl.push({ tipo: 'paulo', a: t, b: D });
  return tl;
}

module.exports = { CATEG, classificar, categoriaDaEtiqueta, fatos, lerPdf, agendar };

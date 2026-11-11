// PDF INTELLIGENCE: texto (com tamanho de fonte), OCR de paginas escaneadas, imagens embutidas, classificacao de paginas,
// fatos comerciais COM pagina de origem, alertas (divergencia, tabela vencida) e separacao extraido / inferido / confirmar.
const fs = require('fs');
const path = require('path');
const cfg = require('../config');
const { ff } = require('../midia');

const CATEG = {
  planta: { rotulo: 'PLANTA', pdf: ['planta', 'm²', 'm2', 'dorm', 'quarto', 'suíte', 'suite', 'living', 'cozinha', 'varanda', 'área privativa', 'garden', 'cobertura', 'tipo '], fala: ['planta', 'quarto', 'quartos', 'sala', 'cozinha', 'varanda', 'suíte', 'metros', 'metragem', 'banheiro', 'layout'] },
  lazer: { rotulo: 'LAZER', pdf: ['lazer', 'piscina', 'academia', 'fitness', 'churrasqueira', 'playground', 'salão de festas', 'brinquedoteca', 'quadra', 'coworking', 'pet place', 'sauna', 'gourmet', 'spa', 'rooftop'], fala: ['lazer', 'piscina', 'academia', 'churrasqueira', 'playground', 'festa', 'quadra', 'crianças', 'rooftop', 'coworking'] },
  localizacao: { rotulo: 'LOCALIZAÇÃO', pdf: ['localização', 'localizacao', 'mapa', 'metrô', 'vlt', 'minutos', 'distância', 'shopping', 'avenida', 'estação', 'km'], fala: ['localização', 'fica', 'perto', 'metrô', 'metro', 'vlt', 'minutos', 'bairro', 'região', 'praia', 'centro', 'trabalho'] },
  condicoes: { rotulo: 'CONDIÇÕES', pdf: ['tabela', 'valor', 'r$', 'parcela', 'entrada', 'sinal', 'preço', 'condições', 'fluxo', 'repasse', 'mensais'], fala: ['entrada', 'parcela', 'fgts', 'financiamento', 'caixa', 'subsídio', 'valor', 'preço', 'renda', 'pagar'] },
  ficha: { rotulo: 'FICHA TÉCNICA', pdf: ['ficha técnica', 'torres', 'elevadores', 'unidades', 'vagas', 'pavimentos', 'andares', 'terreno', 'incorporação', 'arquitetura'], fala: ['unidades', 'torre', 'andares', 'vaga', 'elevador', 'arquiteto'] },
  fachada: { rotulo: 'FACHADA', pdf: ['fachada', 'perspectiva', 'ilustrativa', 'portaria', 'acesso'], fala: ['prédio', 'fachada', 'empreendimento', 'projeto', 'torre', 'portaria', 'lançamento'] },
  decorado: { rotulo: 'DECORADO', pdf: ['decorado', 'ambientação', 'living ampliado'], fala: ['decorado', 'acabamento', 'por dentro', 'ambiente'] }
};
const CONSTRUTORAS = ['Cury', 'MRV', 'Direcional', 'Tegra', 'Avanço', 'Gafisa', 'Cyrela', 'Calçada', 'RJZ', 'Mozak', 'Concal', 'Bait', 'Patrimar', 'Riva', 'by Living', 'Living Construtora', 'Even Construtora', 'João Fortes', 'W3 Engenharia', 'Vivaz', 'Tenda', 'Rossi', 'PDG', 'Brookfield', 'Carvalho Hosken', 'Lucio Costa', 'Opportunity', 'Plano&Plano', 'Pacaembu', 'Emccamp', 'Novolar', 'Construtora Bait', 'Fernandes Araujo'];
const MESES = { jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12 };
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function classificar(texto) {
  const t = norm(texto), pts = {};
  for (const [k, c] of Object.entries(CATEG)) pts[k] = c.pdf.reduce((s, w) => s + (t.split(norm(w)).length - 1), 0);
  if ((t.match(/r\$\s?\d/g) || []).length >= 4) pts.condicoes += 6; // muitas cifras = tabela
  const [melhor, p] = Object.entries(pts).sort((a, b) => b[1] - a[1])[0];
  return p >= 1 ? { categoria: melhor, confianca: Math.min(1, p / 5) } : { categoria: null, confianca: 0 };
}
const categoriaDaEtiqueta = et => { if (!et) return null; const t = norm(et); return Object.keys(CATEG).find(k => t.includes(norm(k)) || norm(CATEG[k].rotulo).includes(t) || CATEG[k].pdf.some(w => t.includes(norm(w).trim()))) || null; };

async function pegarObj(pg, nome) {
  const fonte = nome.startsWith('g_') ? pg.commonObjs : pg.objs;
  return new Promise(ok => { const t = setTimeout(() => ok(null), 2500); try { fonte.get(nome, o => { clearTimeout(t); ok(o); }); } catch { clearTimeout(t); ok(null); } });
}

let _ocr = null;
async function ocr(png, log) {
  if (!cfg.OCR) return '';
  try {
    if (!_ocr) {
      // idioma portugues empacotado (@tesseract.js-data/por): OCR 100% offline
      const T = require('tesseract.js');
      const langPath = path.join(path.dirname(require.resolve('@tesseract.js-data/por/package.json')), '4.0.0_best_int');
      let falha = null;
      _ocr = await T.createWorker('por', 1, { langPath, cachePath: cfg.MODELOS, logger: () => {}, errorHandler: e => { falha = e; } });
      if (falha) throw new Error(String(falha));
    }
    const r = await _ocr.recognize(png);
    return (r.data && r.data.text) || '';
  } catch (e) { log && log('  OCR indisponível (' + String(e.message || e).split('\n')[0] + ') — precisa de internet na 1ª vez para baixar o idioma'); _ocr = null; return null; }
}

// Fatos comerciais com pagina de origem
function extrairFatos(paginas, hoje = new Date(), nomeArquivo = '') {
  const fatos = [], alertas = [];
  const add = (campo, valor, pagina, tipo, obs) => { if (!fatos.some(f => f.campo === campo && f.valor === valor)) fatos.push({ campo, valor, pagina, tipo, confirmar: tipo !== 'extraido', obs: obs || '' }); };
  for (const pg of paginas) {
    const t = pg.texto || '', n = pg.numero;
    for (const m of t.matchAll(/(\d{1,2})\s?(?:e|a|ou|,)?\s?(\d)?\s?(quartos?|dorms?\.?|dormit[óo]rios?|su[íi]tes?)/gi)) add('tipologia', m[0].replace(/\s+/g, ' ').trim(), n, 'extraido');
    const m2 = [...t.matchAll(/(\d{2,4}(?:[.,]\d{1,2})?)\s?m[²2]/gi)].map(m => parseFloat(m[1].replace('.', '').replace(',', '.'))).filter(v => v >= 18 && v < 2000);
    if (m2.length && pg.categoria !== 'ficha') add('metragem', m2.length > 1 ? `${Math.min(...m2)} a ${Math.max(...m2)} m²` : `${m2[0]} m²`, n, 'extraido');
    for (const m of t.matchAll(/R\$\s?(\d{1,3}(?:\.\d{3})+(?:,\d{2})?|\d+(?:,\d{2})?\s?mil)/gi)) add('preco', m[0].replace(/\s+/g, ' '), n, 'extraido', pg.categoria === 'condicoes' ? 'tabela de preços' : '');
    for (const m of t.matchAll(/(?:entrega|previs[ãa]o(?: de entrega)?|conclus[ãa]o)[^\d]{0,30}((?:jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-zç]*\.?\s*(?:de\s*)?\/?\s*\d{4}|\d{2}\/\d{4})/gi)) add('entrega', m[1], n, 'extraido');
    for (const m of t.matchAll(/\b(Rua|R\.|Av\.|Avenida|Estrada|Praça|Travessa|Alameda|Rod\.)\s+(?:d[aoe]s?\s+)?[A-ZÀ-Ú][^,\n;]{2,60}(?:,\s*n?º?\s*\d+)?/g)) add('endereco', m[0].trim(), n, 'extraido');
    for (const c of CONSTRUTORAS) if (new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&')}\\b`).test(t)) add('construtora', c, n, 'inferido', 'nome encontrado no texto; confirme se é a incorporadora');
    if (pg.categoria === 'lazer') for (const w of CATEG.lazer.pdf) if (w !== 'lazer' && norm(t).includes(norm(w))) add('lazer', w, n, 'extraido');
    for (const m of t.matchAll(/(\d{1,3})\s?(?:min|minutos)\s?(?:a pé|de carro|do|da|até)?\s?([^\n,.;\-–|]{2,40})/gi)) add('distancia', m[0].trim(), n, 'extraido', 'conferir a fonte da distância');
    // tabela vencida
    const val = t.match(/validade[^0-9]{0,40}(\d{2}\/\d{2}\/\d{4})\s*(?:a|até|-)\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (val) {
      const [d, mm, a] = val[2].split('/').map(Number), fim = new Date(a, mm - 1, d, 23, 59);
      add('validade_tabela', `${val[1]} a ${val[2]}`, n, 'extraido');
      if (fim < hoje) alertas.push({ nivel: 'alto', pagina: n, texto: `Tabela com validade encerrada em ${val[2]} (p. ${n}). Não use estes preços sem confirmar com a construtora.` });
    }
  }
  // nome do empreendimento: maior texto da pagina 1-2 (inferido)
  const cand = paginas.slice(0, 3).flatMap(pg => (pg.titulos || []).map(t => ({ ...t, n: pg.numero }))).filter(t => t.texto.length > 3 && t.texto.length < 60 && !/^\d/.test(t.texto)).sort((a, b) => b.tam - a.tam)[0];
  if (nomeArquivo) add('nome', nomeArquivo, 1, 'inferido', 'nome do arquivo — confirme');
  if (cand && !(nomeArquivo && norm(cand.texto).includes(norm(nomeArquivo).split(' ')[0]))) add('nome', cand.texto.trim(), cand.n, 'inferido', 'maior título do início do PDF — confirme');
  // divergencias
  const precos = fatos.filter(f => f.campo === 'preco');
  const aPartir = paginas.flatMap(pg => [...(pg.texto || '').matchAll(/a partir de\s*R\$\s?([\d.]+(?:,\d{2})?)/gi)].map(m => ({ v: m[1], n: pg.numero })));
  if (new Set(aPartir.map(x => x.v)).size > 1) alertas.push({ nivel: 'medio', texto: `Valores "a partir de" diferentes no PDF: ${aPartir.map(x => `R$ ${x.v} (p. ${x.n})`).join(', ')}. Confirme qual vale.` });
  if (precos.length && !fatos.some(f => f.campo === 'validade_tabela')) alertas.push({ nivel: 'medio', texto: 'O PDF tem preços, mas não informa a validade. Preço pode estar desatualizado: confirme antes de publicar.' });
  const tip = [...new Set(fatos.filter(f => f.campo === 'tipologia').map(f => f.valor.toLowerCase()))];
  if (tip.length > 4) alertas.push({ nivel: 'baixo', texto: `Muitas tipologias citadas (${tip.length}); revise quais são do empreendimento.` });
  return { fatos, alertas };
}

function resumo(analise, nomeArquivo) {
  const f = c => analise.fatos.filter(x => x.campo === c);
  const um = c => (f(c)[0] || {}).valor;
  const cats = {}; analise.paginas.forEach(p => { if (p.categoria) cats[p.categoria] = (cats[p.categoria] || 0) + 1; });
  const linhas = [
    `Documento: ${nomeArquivo} — ${analise.paginas.length} páginas (${Object.entries(cats).map(([k, v]) => `${v} ${CATEG[k].rotulo.toLowerCase()}`).join(', ') || 'sem classificação'}).`,
    um('nome') ? `Empreendimento (inferido): ${um('nome')}.` : null,
    f('tipologia').length ? `Tipologias: ${[...new Set(f('tipologia').map(x => x.valor))].slice(0, 4).join('; ')} (p. ${[...new Set(f('tipologia').map(x => x.pagina))].join(', ')}).` : null,
    f('metragem').length ? `Metragens: ${f('metragem').slice(0, 3).map(x => `${x.valor} (p. ${x.pagina})`).join('; ')}.` : null,
    f('lazer').length ? `Lazer: ${[...new Set(f('lazer').map(x => x.valor))].join(', ')}.` : null,
    f('endereco').length ? `Endereço: ${um('endereco')} (p. ${f('endereco')[0].pagina}).` : null,
    f('entrega').length ? `Entrega: ${um('entrega')} (p. ${f('entrega')[0].pagina}).` : null,
    f('preco').length ? `Preços citados: ${f('preco').length} valores (ex.: ${f('preco').slice(0, 2).map(x => `${x.valor} p. ${x.pagina}`).join('; ')}) — exibição só após confirmação.` : 'Sem preços no documento.',
    analise.imagens.length ? `${analise.imagens.length} imagens de alta resolução extraídas do PDF.` : null,
    analise.alertas.length ? `⚠ ${analise.alertas.length} alerta(s) para revisar.` : null
  ];
  return linhas.filter(Boolean).join('\n');
}

// Analise completa: renderiza paginas, extrai imagens, OCR, classifica, fatos
async function analisar(pdfArq, saidaDir, relBase, ctx) {
  const log = ctx.log || (() => {});
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { pdf } = await import('pdf-to-img');
  fs.mkdirSync(saidaDir, { recursive: true });
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(pdfArq)), verbosity: 0 }).promise;
  const N = doc.numPages, paginas = [], vistos = new Set(), usos = new Map(), sigPorNome = new Map();
  let imagens = [];
  log(`PDF com ${N} páginas`);
  const renders = await pdf(pdfArq, { scale: 2 });
  let n = 0;
  for await (const png of renders) {
    n++;
    if (ctx.sinal && ctx.sinal.aborted) throw Object.assign(new Error('Cancelado'), { cancelado: true });
    const pg = await doc.getPage(n), tc = await pg.getTextContent();
    let texto = tc.items.map(x => x.str).join(' ').replace(/\s+/g, ' ').trim();
    const titulos = tc.items.filter(x => x.str.trim()).map(x => ({ texto: x.str.trim(), tam: Math.abs(x.transform[0]) || 0 })).sort((a, b) => b.tam - a.tam).slice(0, 5);
    const pngRel = `${relBase}/pag-${String(n).padStart(3, '0')}.png`, jpgThumb = `${relBase}/pag-${String(n).padStart(3, '0')}_thumb.jpg`;
    const pngArq = path.join(saidaDir, path.basename(pngRel));
    fs.writeFileSync(pngArq, png);
    await ff(['-i', pngArq, '-vf', 'scale=320:-2', '-q:v', '5', path.join(saidaDir, path.basename(jpgThumb))], { tag: 'miniatura pdf' }).catch(() => {});
    let fezOcr = false;
    if (texto.length < 25) { const o = await ocr(pngArq, log); if (o && o.trim().length > texto.length) { texto = o.replace(/\s+/g, ' ').trim(); fezOcr = true; } }
    const { categoria, confianca } = classificar(texto);
    // imagens embutidas (fotos do book em resolucao original)
    try {
      const ops = await pg.getOperatorList();
      for (let k = 0; k < ops.fnArray.length && imagens.length < 60; k++) {
        if (ops.fnArray[k] !== pdfjs.OPS.paintImageXObject) continue;
        const nome = ops.argsArray[k][0];
        const chaveObj = nome.startsWith('g_') ? nome : `${n}:${nome}`;
        if (sigPorNome.has(chaveObj)) { const sg = sigPorNome.get(chaveObj); if (sg) usos.set(sg, (usos.get(sg) || 0) + 1); continue; }
        sigPorNome.set(chaveObj, null);
        const o = await pegarObj(pg, nome);
        if (!o || !o.data || o.width < 600 || o.height < 400 || ![2, 3].includes(o.kind)) continue;
        // assinatura pelo conteudo: o mesmo fundo aparece com nome diferente em cada pagina
        let soma = 0; const passo = Math.max(1, Math.floor(o.data.length / 997));
        let sx = 0, sx2 = 0, cnt = 0;
        for (let q = 0; q < o.data.length; q += passo) { const v = o.data[q]; soma = (soma * 31 + v) >>> 0; sx += v; sx2 += v * v; cnt++; }
        const desvio = Math.sqrt(Math.max(0, sx2 / cnt - (sx / cnt) ** 2));
        if (desvio < 14) { sigPorNome.set(chaveObj, null); continue; } // cor lisa/degrade: fundo, nao foto
        const sig = `${o.width}x${o.height}:${soma}`;
        sigPorNome.set(chaveObj, sig);
        usos.set(sig, (usos.get(sig) || 0) + 1);
        if (vistos.has(sig)) continue; vistos.add(sig);
        const rel = `${relBase}/img-${String(imagens.length + 1).padStart(3, '0')}-p${n}.jpg`;
        await ff(['-f', 'rawvideo', '-pix_fmt', o.kind === 2 ? 'rgb24' : 'rgba', '-s', `${o.width}x${o.height}`, '-i', '-', '-frames:v', '1', '-q:v', '2', path.join(saidaDir, path.basename(rel))], { tag: 'imagem pdf', entrada: Buffer.from(o.data.buffer, o.data.byteOffset, o.data.byteLength) });
        imagens.push({ arquivo: rel, pagina: n, w: o.width, h: o.height, obj: sig });
      }
    } catch (e) { log(`  p.${n}: imagens não extraídas (${e.message})`); }
    paginas.push({ numero: n, texto: texto.slice(0, 4000), chars: texto.length, ocr: fezOcr, categoria, confianca, rotulo: categoria ? CATEG[categoria].rotulo : '', arquivo: pngRel, thumb: jpgThumb, titulos, w: 0, h: 0 });
    if (ctx.progresso) ctx.progresso(90 * n / N);
  }
  // imagem repetida em 3+ paginas = fundo/moldura do book, nao e foto do empreendimento
  imagens = imagens.filter(im => { const fundo = (usos.get(im.obj) || 0) >= 3; if (fundo) fs.rmSync(path.join(saidaDir, path.basename(im.arquivo)), { force: true }); delete im.obj; return !fundo; });
  const nomeArq = path.basename(pdfArq, '.pdf').replace(/^[a-z0-9]+_/i, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
  const { fatos, alertas } = extrairFatos(paginas, new Date(), nomeArq);
  const analise = { paginas, imagens, fatos, alertas, data: new Date().toISOString() };
  analise.resumo = resumo(analise, path.basename(pdfArq).replace(/^[a-z0-9]+_/i, ''));
  log(`Análise: ${paginas.filter(p => p.categoria).length}/${N} páginas classificadas, ${imagens.length} imagens, ${fatos.length} fatos, ${alertas.length} alertas`);
  return analise;
}

module.exports = { CATEG, classificar, categoriaDaEtiqueta, extrairFatos, analisar, resumo, norm };

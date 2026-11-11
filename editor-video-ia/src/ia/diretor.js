// ROTEIRISTA + DIRETOR + AUTO EDIT: transforma video bruto, PDF e dados reais em uma montagem editavel na linha do tempo.
// Toda decisao automatica vira uma "sugestao" registrada no projeto (revisavel). Nada de inventar dado comercial.
const fs = require('fs');
const path = require('path');
const cfg = require('../config');
const Modelo = require('../../public/js/modelo');
const projetos = require('../projetos');
const presets = require('../presets');
const marcaMod = require('../marca');
const PDF = require('./pdf');
const llm = require('./llm');
const { ff } = require('../midia');

const r1 = n => Math.round(n * 10) / 10;
const norm = PDF.norm;

// ---------- deteccao de fala e de cenas ----------
async function detectarFala(arquivo, dur, pausaMin, margem, sinal, maxCorte = 0.35) {
  const log = await ff(['-i', arquivo, '-vn', '-af', `silencedetect=noise=-33dB:d=${pausaMin}`, '-f', 'null', '-'], { tag: 'pausas', sinal });
  const sil = []; let ini = null;
  for (const l of log.split('\n')) {
    let m = l.match(/silence_start: (-?[\d.]+)/); if (m) ini = Math.max(0, +m[1]);
    m = l.match(/silence_end: ([\d.]+)/); if (m && ini !== null) { sil.push([ini, +m[1]]); ini = null; }
  }
  if (ini !== null) sil.push([ini, dur]);
  const todas = sil.length;
  // limite: remove as pausas mais longas primeiro e para ao atingir maxCorte do video (protege contra edicao excessiva)
  if (maxCorte < 1) {
    let soma = 0; const ok = new Set();
    sil.map((x, i) => [x[1] - x[0], i]).sort((a, b) => b[0] - a[0]).forEach(([d, i]) => { if (soma + d <= maxCorte * dur) { soma += d; ok.add(i); } });
    for (let i = sil.length - 1; i >= 0; i--) if (!ok.has(i)) sil.splice(i, 1);
  }
  const manter = []; let t = 0;
  for (const [a, b] of sil) { if (a - t > 0.05) manter.push([Math.max(0, t - margem), Math.min(dur, a + margem)]); t = b; }
  if (dur - t > 0.05) manter.push([Math.max(0, t - margem), dur]);
  // junta trechos minusculos para nao gerar micro-cortes
  const j = [];
  for (const k of manter) { const u = j[j.length - 1]; if (u && (k[0] - u[1] < 0.15 || k[1] - k[0] < 0.6)) u[1] = Math.max(u[1], k[1]); else j.push([...k]); }
  return { manter: j, falado: j.reduce((s, [a, b]) => s + b - a, 0), pausas: sil.length, pausasTotais: todas };
}
async function detectarCenas(arquivo, dur, sinal) {
  const log = await ff(['-i', arquivo, '-an', '-vf', "scale=320:-2,select='gt(scene,0.32)',showinfo", '-f', 'null', '-'], { tag: 'cenas', sinal }).catch(() => '');
  const cortes = [...log.matchAll(/pts_time:([\d.]+)/g)].map(m => +m[1]);
  const pts = [0, ...cortes, dur]; const cenas = [];
  for (let i = 0; i < pts.length - 1; i++) if (pts[i + 1] - pts[i] >= 1.2) cenas.push([pts[i], pts[i + 1]]);
  return cenas.length ? cenas : [[0, dur]];
}

// ---------- materiais disponiveis no projeto ----------
function materiais(p, { ocultarTabela = true } = {}) {
  const out = [];
  for (const m of p.midias) {
    if (m.tipo === 'pagina') { if (ocultarTabela && m.categoria === 'condicoes') continue; out.push({ midia: m, categoria: m.categoria, rotulo: m.categoria ? PDF.CATEG[m.categoria].rotulo : '' }); }
    else if (m.tipo === 'imagem') { const cat = m.categoria || PDF.categoriaDaEtiqueta(m.nome); out.push({ midia: m, categoria: cat, rotulo: cat ? PDF.CATEG[cat].rotulo : '' }); }
    else if (m.tipo === 'video' && !m.narracao) { const cat = m.categoria || PDF.categoriaDaEtiqueta(m.nome); out.push({ midia: m, categoria: cat || 'decorado', rotulo: cat ? PDF.CATEG[cat].rotulo : '' }); }
  }
  // preferencia: imagens extraidas do PDF (limpas) antes da pagina inteira na mesma categoria
  return out.sort((a, b) => (a.midia.tipo === 'imagem' && a.midia.origemPdf ? 0 : 1) - (b.midia.tipo === 'imagem' && b.midia.origemPdf ? 0 : 1));
}
const fatosDe = p => (p.pdfs || []).flatMap(d => (d.analise && d.analise.fatos) || []);

// ---------- ROTEIRO (regras locais; refinamento opcional com Claude) ----------
const ORDEM = {
  economico: ['fachada', 'localizacao', 'planta', 'lazer', 'condicoes'],
  'medio-alto': ['fachada', 'localizacao', 'planta', 'lazer', 'ficha', 'decorado'],
  luxo: ['fachada', 'decorado', 'lazer', 'planta', 'localizacao', 'ficha'],
  institucional: ['fachada', 'decorado', 'localizacao']
};
const NCENAS = { 15: 3, 30: 5, 45: 6, 60: 8, 90: 10 };

function gerarRoteiroBase(p, o) {
  const pos = o.posicionamento || 'medio-alto', D = +o.duracao || 30, marca = marcaMod.obter();
  const e = p.empreendimento || {}, fatos = fatosDe(p), avisos = [];
  const fato = c => fatos.find(f => f.campo === c && f.tipo === 'extraido') || null;
  const nome = e.nome || (fatos.find(f => f.campo === 'nome') || {}).valor || '';
  if (!e.nome && nome) avisos.push(`Nome "${nome}" foi inferido do PDF — confirme em Empreendimento.`);
  const bairro = e.bairro || '';
  const tip = e.plantas || (fato('tipologia') || {}).valor || '', met = (fato('metragem') || {}).valor || '';
  const lazer = [...new Set(fatos.filter(f => f.campo === 'lazer').map(f => f.valor))].slice(0, 3);
  const dist = fato('distancia'), entrega = fato('entrega');
  const fonte = f => f ? `PDF p. ${f.pagina}` : (e.fonte === 'catalogo' ? 'catálogo do site' : '');
  const ganchos = {
    economico: bairro ? `Dá pra sair do aluguel no ${bairro} usando o FGTS?` : 'Dá pra sair do aluguel usando o FGTS?',
    'medio-alto': tip && bairro ? `${tip} no ${bairro}: veja antes de decidir` : `${nome || 'Este lançamento'}: o que você precisa saber`,
    luxo: [nome, bairro].filter(Boolean).join('. ') + '.',
    institucional: marca.slogan
  };
  // Angulos de promessa (lote de variacoes): localizacao, planta/uso, condicao, prova social
  const ANG = {
    localizacao: { g: bairro ? `Por que tanta gente quer morar no ${bairro}?` : 'A localização que faz diferença no dia a dia', ordem: ['localizacao', 'fachada', 'planta', 'lazer'], palavra: 'BAIRRO', oque: 'o mapa do dia a dia do bairro' },
    planta: { g: tip ? `${tip}: repara como essa planta foi pensada` : 'Repara como essa planta foi pensada', ordem: ['planta', 'decorado', 'fachada', 'lazer'], palavra: 'PLANTA', oque: 'a planta completa' },
    condicao: { g: 'Como funciona o pagamento de um apê na planta, sem surpresa', ordem: ['condicoes', 'fachada', 'planta', 'localizacao'], palavra: 'SIMULA', oque: 'a sua simulação' },
    prova: { g: `${nome || 'Esse lançamento'}: o que mais me perguntam`, ordem: ['fachada', 'lazer', 'planta', 'localizacao'], palavra: 'QUERO', oque: 'todos os detalhes' }
  };
  const ang = ANG[o.angulo] || null;
  const FORM = {
    tour: { g: `Vem comigo conhecer ${tip ? 'esse ' + tip.toLowerCase().replace(/^(\d)/, '$1') : 'esse apê'}${bairro ? ' no ' + bairro : ''} — repara no final`, ordem: ['fachada', 'decorado', 'planta', 'lazer', 'localizacao'] },
    compraria: { g: `Você compraria ${nome ? 'o ' + nome : 'esse apê'}${bairro ? ' no ' + bairro : ''}? Comenta SIM ou NÃO`, ordem: ['fachada', 'planta', 'lazer', 'localizacao'] },
    condicao: { g: 'Entrada, obra e chaves: como você paga um apê na planta', ordem: ['condicoes', 'planta', 'fachada'] },
    bairro: { g: bairro ? `3 motivos para morar no ${bairro}` : '3 motivos para morar aqui', ordem: ['localizacao', 'fachada', 'lazer'] }
  };
  const form = FORM[o.formato] || null;
  const objetivoGancho = { objecoes: `${nome || 'Esse lançamento'}: as 3 dúvidas que todo mundo me faz`, diferenciais: `O que ${nome || 'esse lançamento'} tem que os outros não têm` };
  const gancho = o.gancho || (form && form.g) || (ang && ang.g) || objetivoGancho[o.objetivo] || ganchos[pos] || ganchos['medio-alto'];
  const FALA = {
    fachada: () => ({ fala: `Esse é o ${nome || 'empreendimento'}${e.construtora ? ', da ' + e.construtora : ''}${bairro ? ', no ' + bairro : ''}.`, tela: nome || 'O projeto', fonte: e.nome ? (e.fonte === 'catalogo' ? 'catálogo do site' : 'informado') : '' }),
    localizacao: () => ({ fala: dist ? `A localização: ${dist.valor}.` : bairro ? `Olha a localização no ${bairro}.` : 'Agora a localização.', tela: dist ? dist.valor.slice(0, 32) : (bairro || 'Localização'), fonte: fonte(dist) }),
    planta: () => ({ fala: tip || met ? `A planta: ${[tip, met].filter(Boolean).join(', ')}.` : 'Repara na planta.', tela: [tip, met].filter(Boolean).join(' · ').slice(0, 40) || 'Planta', fonte: fonte(fato('tipologia') || fato('metragem')) || (e.plantas ? 'catálogo do site' : '') }),
    lazer: () => ({ fala: lazer.length ? `No lazer: ${lazer.join(', ')}.` : 'E o lazer do condomínio.', tela: lazer.length ? lazer.join(' · ') : 'Lazer', fonte: lazer.length ? fonte(fatos.find(f => f.campo === 'lazer')) : '' }),
    condicoes: () => ({ fala: 'Dá pra usar o FGTS na entrada e financiar pela Caixa, conforme a sua aprovação.', tela: 'FGTS + Financiamento CAIXA', fonte: 'regra geral do programa — confirmar caso a caso' }),
    ficha: () => ({ fala: entrega ? `Previsão de entrega: ${entrega.valor}.` : 'Os detalhes técnicos do projeto.', tela: entrega ? `Entrega ${entrega.valor}` : 'Ficha técnica', fonte: fonte(entrega) }),
    decorado: () => ({ fala: 'Olha o acabamento por dentro.', tela: 'Por dentro', fonte: '' })
  };
  const mats = materiais(p, { ocultarTabela: o.ocultarTabela !== false });
  const usados = new Set();
  const escolher = cat => { const m = mats.find(x => x.categoria === cat && !usados.has(x.midia.id)) || null; if (m) usados.add(m.midia.id); return m; };
  let ordem = (ORDEM[pos] || ORDEM['medio-alto']).slice();
  if (o.objetivo === 'diferenciais') ordem = ['fachada', 'lazer', 'planta', 'localizacao', 'ficha', 'decorado'];
  if (o.objetivo === 'desejo') ordem = ['decorado', 'fachada', 'lazer', 'planta', 'localizacao'];
  if (ang) ordem = ang.ordem; if (form) ordem = form.ordem;
  const n = NCENAS[D] || Math.max(3, Math.round(D / 6));
  const cenas = []; let k = 0, voltas = 0;
  while (cenas.length < n && voltas < 3) {
    const cat = ordem[k % ordem.length];
    const m = escolher(cat);
    if (m || (voltas === 0 && ['localizacao', 'condicoes'].includes(cat) && pos !== 'luxo')) {
      const f = FALA[cat]();
      cenas.push({ ordem: cenas.length + 1, categoria: cat, rotulo: PDF.CATEG[cat] ? PDF.CATEG[cat].rotulo : '', midia: m ? m.midia.id : null, fala: f.fala, textoTela: f.tela, fonte: f.fonte });
    }
    k++; if (k % ordem.length === 0) voltas++;
  }
  // Formato "3 motivos para morar no bairro": dados reais do site (No dia a dia do bairro)
  if (o.formato === 'bairro') {
    const bi = require('./bairro').buscar(bairro);
    if (bi) {
      const loc = cenas.filter(c => c.midia), linhas = [['Transporte', bi.transporte], ['Lazer', bi.lazer], ['Compras', bi.compras], ['Saúde', bi.saude], ['Educação', bi.educacao]].filter(x => x[1] && x[1].length).slice(0, 3);
      cenas.length = 0;
      linhas.forEach(([rot, l], i) => cenas.push({ ordem: i + 1, categoria: 'localizacao', rotulo: `${i + 1}. ${rot.toUpperCase()}`, midia: (loc[i] || loc[0] || {}).midia || null, fala: `Motivo ${i + 1}: ${l[0]}.`, textoTela: l[0].split(/[—,(]/)[0].trim().slice(0, 42), fonte: 'site: No dia a dia do bairro' }));
    } else avisos.push(`Sem dados de "dia a dia" para o bairro "${bairro || '?'}" no site: formato bairro usou o roteiro padrão.`);
  }
  // Formato "condição como previsibilidade": estrutura geral da compra na planta, sem valor sem fonte
  if (o.formato === 'condicao' || (ang && o.angulo === 'condicao')) {
    const est = [['ENTRADA', 'Uma parte de entrada, que pode usar o FGTS conforme as regras do seu enquadramento.', 'Entrada (pode usar FGTS)'], ['DURANTE A OBRA', 'Parcelas durante a obra, conforme a tabela vigente da construtora.', 'Parcelas na obra'], ['NAS CHAVES', 'E o saldo financiado na entrega das chaves, com análise de crédito.', 'Financiamento nas chaves']];
    const base = cenas.filter(c => c.categoria !== 'condicoes');
    cenas.length = 0;
    est.forEach(([rot, fala, tela], i) => cenas.push({ ordem: i + 1, categoria: 'condicoes', rotulo: rot, midia: (base[i] || {}).midia || null, fala, textoTela: tela, fonte: 'estrutura geral de compra na planta — valores e regras confirmados no WhatsApp' }));
    if (e.preco) cenas.push({ ordem: 4, categoria: 'condicoes', rotulo: 'A PARTIR DE', midia: null, fala: `Valores a partir de ${e.preco}, conforme tabela vigente.`, textoTela: `a partir de ${e.preco}`, fonte: 'informado no projeto' });
  }
  // materiais que sobraram (fotos do usuario) completam
  for (const m of mats) { if (cenas.length >= n) break; if (!usados.has(m.midia.id)) { usados.add(m.midia.id); cenas.push({ ordem: cenas.length + 1, categoria: m.categoria, rotulo: m.rotulo, midia: m.midia.id, fala: '', textoTela: '', fonte: '' }); } }
  const corpo = Math.max(3, D - 3 - 3.5), dCena = r1(Math.min(6, Math.max(1.8, corpo / Math.max(1, cenas.length))));
  cenas.forEach(c => { c.duracao = dCena; });
  if (!mats.length) avisos.push('Nenhum material visual (PDF, fotos, vídeos) no projeto: o roteiro ficou só com falas.');
  if ((p.pdfs || []).some(d => (d.analise.alertas || []).length)) avisos.push('O PDF tem alertas (veja PDF Intelligence) — revise antes de publicar.');
  // CTA com palavra-codigo no comentario (gera conversa e permite saber de qual video veio o lead)
  const palavra = String(o.palavraCta || (ang && ang.palavra) || (o.formato === 'bairro' ? 'BAIRRO' : o.formato === 'condicao' ? 'SIMULA' : pos === 'luxo' ? '' : 'QUERO')).toUpperCase().replace(/[^A-Z0-9À-Ú]/g, '').slice(0, 14);
  const cta = pos === 'luxo' && !o.palavraCta ? 'Agende uma apresentação privada' : palavra ? `Comente ${palavra} que eu te mando ${(ang && ang.oque) || (o.formato === 'condicao' ? 'a sua simulação' : o.formato === 'bairro' ? 'o mapa do bairro' : 'os detalhes')}` : 'Fale comigo no WhatsApp';
  const tags = ['#imoveisrj', '#lancamentoimobiliario', '#riodejaneiro', '#corretordeimoveis', bairro && '#' + norm(bairro).replace(/\W/g, ''), nome && '#' + norm(nome).replace(/\W/g, '')].filter(Boolean);
  const legendaPost = `${gancho}\n\n${nome ? '🏢 ' + nome + (bairro ? ' — ' + bairro : '') + '\n' : ''}${tip ? '📐 ' + [tip, met].filter(Boolean).join(' · ') + '\n' : ''}${lazer.length ? '✨ ' + lazer.join(', ') + '\n' : ''}\n👉 ${cta}: ${marca.telefone}\n🌐 ${marca.site}\n\n${marca.nome} • ${marca.creci}\n\n${tags.join(' ')}`;
  return { origem: 'regras', posicionamento: pos, objetivo: o.objetivo || 'interesse', formato: o.formato || 'padrao', angulo: o.angulo || null, palavraCta: palavra, duracao: D, gancho, cenas, cta, legendaPost, avisos, criado: new Date().toISOString() };
}

// Formato "comparativo": 2-3 empreendimentos do catalogo do site na mesma regiao, com a capa oficial de cada um
async function roteiroComparativo(p, o) {
  const cat = o.catalogo || require('../catalogo').catalogo(), e = p.empreendimento || {}, nn = x => norm(x || '');
  const atual = cat.find(x => nn(x.nome) === nn(e.nome));
  const regiao = (atual && atual.regiao) || '', local = e.bairro || (atual && atual.local) || '';
  const comImg = x => x.img && fs.existsSync(path.join(cfg.RAIZ, '..', x.img));
  const outros = cat.filter(x => x !== atual && comImg(x) && (nn(x.local) === nn(local) || (regiao && x.regiao === regiao)))
    .sort((a, b) => (nn(b.local) === nn(local)) - (nn(a.local) === nn(local)));
  const lista = [atual && comImg(atual) ? atual : null, ...outros].filter(Boolean).slice(0, 3);
  if (lista.length < 2) return null;
  const cenas = [];
  for (const [i, x] of lista.entries()) {
    const f = path.join(cfg.RAIZ, '..', x.img);
    const m = p.midias.find(y => y.origemCatalogo === x.img) || await projetos.importar(p.id, path.basename(x.img), fs.createReadStream(f), 50e6);
    if (!m.origemCatalogo) await projetos.alterar(p.id, pp => { const y = pp.midias.find(z => z.id === m.id); if (y) { y.origemCatalogo = x.img; y.categoria = 'fachada'; y.nome = x.nome; } });
    cenas.push({ ordem: i + 1, categoria: 'fachada', rotulo: `OPÇÃO ${i + 1}`, midia: m.id, fala: `Opção ${i + 1}: ${x.nome}, ${x.local || ''}${x.plantas ? ' — ' + x.plantas : ''}${x.status ? ', ' + x.status.toLowerCase() : ''}.`, textoTela: x.nome, sub: [x.plantas, x.incorporadora].filter(Boolean).join(' · '), fonte: 'catálogo do site' });
  }
  return { cenas, local: local || regiao, n: lista.length };
}

async function gerarRoteiro(p, o, log) {
  let base = gerarRoteiroBase(p, o);
  if (o.formato === 'comparativo') {
    const c = await roteiroComparativo(p, o);
    if (c) {
      const dC = r1(Math.max(2.5, ((+o.duracao || 30) - 6.5) / c.n));
      base = { ...base, gancho: o.gancho || `${c.n} lançamentos ${c.local ? 'no ' + c.local : 'na mesma região'}: qual combina com você?`, cenas: c.cenas.map(x => ({ ...x, duracao: dC })) };
      base.legendaPost = base.legendaPost.replace(/^[^\n]*/, base.gancho);
    } else base.avisos.push('Comparativo precisa de pelo menos 2 empreendimentos do catálogo com capa na mesma região: usei o roteiro padrão.');
  }
  if (o.usarIA && llm.disponivel()) {
    try {
      const fatos = fatosDe(p).map(f => ({ campo: f.campo, valor: f.valor, pagina: f.pagina, status: f.confirmar ? 'confirmar' : 'extraido' }));
      const r = await llm.refinarRoteiro(base, { slogan: marcaMod.obter().slogan, empreendimento: p.empreendimento, posicionamento: base.posicionamento, objetivo: base.objetivo, duracaoSegundos: base.duracao, fatos });
      log && log('Roteiro refinado com Claude (textos); mídias e fontes mantidas.');
      return r;
    } catch (e) { base.avisos.push('Claude indisponível: ' + e.message.slice(0, 200)); }
  }
  return base;
}

// ---------- Monta a linha do tempo a partir do roteiro (sem apresentador) ----------
function aplicarRoteiro(p, rot, preset) {
  const novo = { principal: [], broll: [], textos: [] };
  for (const c of rot.cenas) {
    const m = c.midia && Modelo.midiaDe(p, c.midia); if (!m) continue;
    const clip = { id: Modelo.uid('c'), midia: m.id, duracao: c.duracao, rotulo: c.rotulo || '', transicao: { tipo: 'auto' }, movimento: 'auto', enquadramento: 'auto' };
    if (m.tipo === 'video') { const vel = preset.ritmo.velocidadeTour || 1; clip.entrada = r1(Math.min(Math.max(0, m.dur / 2 - c.duracao * vel / 2), Math.max(0, m.dur - c.duracao * vel))); clip.duracao = r1(Math.min(m.dur - clip.entrada, c.duracao * vel)); clip.velocidade = vel; clip.volume = 0; }
    novo.principal.push(clip);
  }
  const lay = Modelo.layout({ ...p, principal: novo.principal, telaFinal: false }, preset);
  novo.textos.push({ id: Modelo.uid('x'), tipo: 'gancho', texto: rot.gancho, inicio: 0, duracao: preset.titulos.gancho.duracao });
  lay.clips.forEach((lc, i) => { const c = rot.cenas.filter(c => c.midia && Modelo.midiaDe(p, c.midia))[i]; if (c && c.textoTela && i > 0) novo.textos.push({ id: Modelo.uid('x'), tipo: 'ficha', texto: c.textoTela, sub: c.sub || '', inicio: r1(lc.ini + 0.3), duracao: r1(Math.min(2.2, lc.dur - 0.4)) }); });
  if (lay.total > 4) novo.textos.push({ id: Modelo.uid('x'), tipo: 'cta', texto: rot.cta, inicio: r1(Math.max(0, lay.total - 3)), duracao: 3 });
  return novo;
}

// ---------- AUTO EDIT ----------
async function autoEdit(params, ctx) {
  const { projetoId } = params, log = ctx.log;
  const conservador = params.modo === 'conservador';
  let p = projetos.ler(projetoId);
  if (params.presetId) p.presetId = params.presetId;
  const preset = presets.obter(p.presetId);
  const sug = [];
  log(`Auto Edit (${conservador ? 'conservador' : 'criativo'}) — preset ${preset.nome}`);
  // 1-2) inspecao + escolha do video falado (apresentador)
  const videos = p.midias.filter(m => m.tipo === 'video' && m.audio);
  let narr = null, cortes = null;
  const pausaMin = conservador ? 0.8 : preset.ritmo.pausaMinima, margem = conservador ? 0.2 : preset.ritmo.margem;
  for (const v of videos) {
    const f = await detectarFala(projetos.arq(projetoId, v.arquivo), v.dur, pausaMin, margem, ctx.sinal, conservador ? 0.2 : (preset.ritmo.maxCorte ?? 0.35));
    v._fala = f;
    if (f.falado >= v.dur * 0.4 && (!narr || f.falado > narr._fala.falado)) narr = v;
  }
  if (params.narracao) narr = p.midias.find(m => m.id === params.narracao) || narr;
  ctx.progresso(15);
  // 3) roteiro
  const rot = await gerarRoteiro(p, params, log);
  p.roteiro = rot;
  let novo;
  if (narr) {
    log(`Apresentador: ${narr.nome} (${r1(narr._fala ? narr._fala.falado : narr.dur)}s de fala)`);
    cortes = preset.ritmo.cortarPausas && params.cortarPausas !== false ? narr._fala.manter : [[0, narr.dur]];
    if (cortes.length > 1) sug.push({ tipo: 'corte', texto: `${narr._fala.pausas} pausas removidas: ${r1(narr.dur)}s → ${r1(narr._fala.falado)}s${narr._fala.pausasTotais > narr._fala.pausas ? ` (${narr._fala.pausasTotais - narr._fala.pausas} pausas curtas mantidas pelo limite de corte)` : ''}. Revise na faixa principal.` });
    p.midias.forEach(m => { m.narracao = m.id === narr.id; });
    const principal = cortes.map(([a, b], k) => ({ id: Modelo.uid('c'), midia: narr.id, entrada: +a.toFixed(3), duracao: +(b - a).toFixed(3), fala: true, zoom: !conservador && k % 2 ? preset.ritmo.punchIn : 1, transicao: { tipo: 'auto' }, enquadramento: 'auto', movimento: 'nenhum', volume: 1 }));
    const lay = Modelo.layout({ ...p, principal, telaFinal: false }, preset);
    // 4) transcricao e mapeamento para a linha do tempo
    let palavras = [];
    if (params.legendas !== false) {
      try {
        const src = await require('./transcricao').transcrever(projetos.arq(projetoId, narr.arquivo), { log, sinal: ctx.sinal });
        for (const w of src) {
          const k = cortes.findIndex(([a, b]) => w.ini >= a - 0.05 && w.ini < b);
          if (k < 0) continue;
          const off = lay.clips[k].ini - cortes[k][0];
          palavras.push({ t: w.t, ini: +(w.ini + off).toFixed(3), fim: +(Math.min(w.fim, cortes[k][1]) + off).toFixed(3) });
        }
        log(`Legendas: ${palavras.length} palavras sincronizadas`);
      } catch (e) { log('⚠ ' + e.message); sug.push({ tipo: 'aviso', texto: 'Legenda automática não gerada: ' + e.message.slice(0, 160) + ' — use "Transcrever" depois ou digite as legendas.' }); }
    }
    ctx.progresso(55);
    // 5) materiais entram quando o assunto e falado (contexto)
    const mats = materiais(p, { ocultarTabela: params.ocultarTabela !== false });
    const usados = new Set(), broll = [], ini0 = Math.min(3, lay.total * 0.2), fimFala = lay.total - 1.6;
    const MAX = conservador ? 3.5 : preset.ritmo.maxCena, MIN = preset.ritmo.minCena;
    const livre = (a, b) => !broll.some(x => a < x.inicio + x.duracao + 0.4 && b > x.inicio - 0.4);
    for (const w of palavras) {
      if (w.ini < ini0 || w.ini > fimFala - MIN) continue;
      const cat = Object.keys(PDF.CATEG).find(c => PDF.CATEG[c].fala.map(norm).includes(norm(w.t).replace(/[^\w ]/g, '')));
      if (!cat) continue;
      const m = mats.find(x => x.categoria === cat && !usados.has(x.midia.id));
      if (!m) continue;
      const a = w.ini, d = Math.min(MAX, fimFala - a);
      if (d < MIN || !livre(a, a + d)) continue;
      usados.add(m.midia.id);
      broll.push(itemBroll(m, a, d, preset)); sug.push({ tipo: 'contexto', texto: `${m.rotulo || m.midia.nome} entra em ${r1(a)}s quando você diz "${w.t}"${m.midia.pagina ? ` (PDF p. ${m.midia.pagina})` : ''}.` });
    }
    if (!conservador) { // criativo: preenche espacos longos sem material com o que sobrou
      let t = ini0;
      for (const m of mats.filter(x => !usados.has(x.midia.id))) {
        while (t < fimFala - MIN && !livre(t, t + MIN)) t += 0.5;
        if (t >= fimFala - MIN) break;
        const d = Math.min(MAX * 0.8, fimFala - t);
        if (d < MIN || !livre(t, t + d)) break;
        broll.push(itemBroll(m, t, d, preset)); usados.add(m.midia.id); t += d + Math.max(2.5, MAX);
      }
    }
    broll.sort((a, b) => a.inicio - b.inicio);
    novo = { principal, broll, textos: [] };
    p.legendas = { ativas: true, grupos: Modelo.agrupar(palavras, preset.legenda.palavras, preset.legenda.maxCaracteres, correcoes()), origem: palavras.length ? 'whisper' : null };
    novo.textos.push({ id: Modelo.uid('x'), tipo: 'gancho', texto: rot.gancho, inicio: 0, duracao: preset.titulos.gancho.duracao });
    fichasEm(novo.textos, p, preset, lay.total, broll);
    if (lay.total > 6) novo.textos.push({ id: Modelo.uid('x'), tipo: 'cta', texto: rot.cta, inicio: r1(Math.max(0, lay.total - 3.2)), duracao: 3 });
    if (lay.total > rot.duracao * 1.25) sug.push({ tipo: 'duracao', texto: `A fala tem ${r1(lay.total)}s e o alvo é ${rot.duracao}s. O app não corta frases (preserva o sentido): remova trechos na faixa principal se quiser encurtar.` });
  } else {
    log('Sem apresentador: montando sequência pelo roteiro');
    // videos sem fala viram cenas (deteccao de cortes de camera)
    for (const v of p.midias.filter(m => m.tipo === 'video')) {
      const cenas = await detectarCenas(projetos.arq(projetoId, v.arquivo), v.dur, ctx.sinal);
      v.cenas = cenas.map(c => c.map(r1));
    }
    novo = aplicarRoteiro(p, rot, preset);
    p.legendas = { ativas: true, grupos: [], origem: null };
    sug.push({ tipo: 'roteiro', texto: `Sequência montada com ${novo.principal.length} cenas a partir do roteiro (${rot.origem === 'claude' ? 'refinado com Claude' : 'roteirista local'}). Para narrar, grave a fala do roteiro e rode o Auto Edit de novo.` });
  }
  // 6) trilha
  const musica = p.midias.find(m => m.tipo === 'audio' && !m.narracaoSintetica);
  if (musica && preset.audio.musicaVolume > 0 && !(conservador && narr)) {
    const total = Modelo.layout({ ...p, ...novo }, preset).total;
    novo.audios = [{ id: Modelo.uid('a'), midia: musica.id, tipo: 'musica', inicio: 0, entrada: 0, duracao: r1(total), volume: preset.audio.musicaVolume, ducking: true }];
    sug.push({ tipo: 'trilha', texto: `Trilha "${musica.nome}" com volume ${Math.round(preset.audio.musicaVolume * 100)}% e abaixamento automático na fala.` });
  } else if (!musica) sug.push({ tipo: 'trilha', texto: 'Sem trilha: importe uma música licenciada (aba Mídia) para usar.' });
  rot.avisos.forEach(a => sug.push({ tipo: 'aviso', texto: a }));
  // grava (mantem midias novas importadas durante o processamento)
  await projetos.alterar(projetoId, pp => {
    Object.assign(pp, { presetId: p.presetId, principal: novo.principal, broll: novo.broll, textos: novo.textos, audios: novo.audios || pp.audios || [], legendas: p.legendas, roteiro: rot, telaFinal: true });
    pp.midias.forEach(m => { const x = p.midias.find(y => y.id === m.id); if (x) { m.narracao = !!x.narracao; if (x.cenas) m.cenas = x.cenas; } });
    pp.sugestoes = sug.map(s => ({ id: Modelo.uid('s'), ...s, data: new Date().toISOString() }));
  });
  ctx.progresso(100);
  log(`Pronto: ${novo.principal.length} clipes, ${novo.broll.length} sobreposições, ${novo.textos.length} textos, ${(p.legendas.grupos || []).length} legendas.`);
  return { sugestoes: sug.length };
}
function itemBroll(m, inicio, dur, preset) {
  const b = { id: Modelo.uid('b'), midia: m.midia.id, inicio: r1(inicio), duracao: r1(dur), pip: true, rotulo: m.rotulo || '', movimento: 'auto', enquadramento: 'auto' };
  if (m.midia.tipo === 'video') { const vel = preset.ritmo.velocidadeTour || 1; b.velocidade = vel; b.entrada = r1(Math.max(0, Math.min(m.midia.dur - dur * vel, m.midia.dur * 0.3))); b.duracao = r1(Math.min(dur * vel, m.midia.dur - b.entrada)); b.volume = 0; /* duracao = tempo de origem, como nos clipes */ }
  return b;
}
function fichasEm(textos, p, preset, total, broll) {
  const e = p.empreendimento || {}, f = [];
  if (e.nome) f.push({ texto: e.nome, sub: e.bairro || '' });
  if (e.plantas) f.push({ texto: e.plantas.split('·')[0].trim(), sub: (e.plantas.split('·')[1] || '').trim() });
  if (e.status || e.construtora) f.push({ texto: e.status || '', sub: e.construtora ? 'por ' + e.construtora : '' });
  if (e.preco) f.push({ texto: 'a partir de', sub: e.preco });
  let t = preset.titulos.gancho.duracao + 0.3;
  for (const x of f) { if (t + 2 > total - 4) break; textos.push({ id: Modelo.uid('x'), tipo: 'ficha', texto: x.texto, sub: x.sub, inicio: r1(t), duracao: 2 }); t += 2.2; }
}
function correcoes() { try { return JSON.parse(fs.readFileSync(path.join(cfg.RAIZ, 'config.json'), 'utf8')).correcoes || {}; } catch { return {}; } }

// ---------- Tarefas avulsas ----------
async function processarPdf({ projetoId, midiaId }, ctx) {
  const p = projetos.ler(projetoId), m = p.midias.find(x => x.id === midiaId);
  if (!m) throw new Error('PDF não encontrado no projeto');
  const rel = `midia/pdf_${midiaId}`;
  const analise = await PDF.analisar(projetos.arq(projetoId, m.arquivo), projetos.arq(projetoId, rel), rel, ctx);
  await projetos.alterar(projetoId, pp => {
    pp.midias = pp.midias.filter(x => x.pdfId !== midiaId);
    for (const pg of analise.paginas) pp.midias.push({ id: `${midiaId}p${pg.numero}`, tipo: 'pagina', nome: `${m.nome} · p. ${pg.numero}${pg.rotulo ? ' · ' + pg.rotulo : ''}`, arquivo: pg.arquivo, thumb: pg.thumb, pdfId: midiaId, pagina: pg.numero, categoria: pg.categoria, w: 0, h: 0 });
    for (const im of analise.imagens) { const pg = analise.paginas.find(x => x.numero === im.pagina) || {}; pp.midias.push({ id: `${midiaId}i${path.basename(im.arquivo, '.jpg').replace(/\W/g, '')}`, tipo: 'imagem', nome: `${m.nome} · imagem p. ${im.pagina}`, arquivo: im.arquivo, thumb: im.arquivo, pdfId: midiaId, origemPdf: true, pagina: im.pagina, categoria: pg.categoria || null, w: im.w, h: im.h }); }
    pp.pdfs = (pp.pdfs || []).filter(d => d.midiaId !== midiaId);
    pp.pdfs.push({ id: 'd' + midiaId, midiaId, nome: m.nome, analise });
  });
  // dimensoes das paginas renderizadas (para enquadramento)
  const { probe } = require('../midia');
  const pp = projetos.ler(projetoId);
  for (const x of pp.midias.filter(y => y.pdfId === midiaId && y.tipo === 'pagina')) { const i = await probe(projetos.arq(projetoId, x.arquivo)).catch(() => null); if (i) { x.w = i.w; x.h = i.h; } }
  await projetos.alterar(projetoId, q => { q.midias.forEach(y => { const z = pp.midias.find(k => k.id === y.id); if (z && y.tipo === 'pagina') { y.w = z.w; y.h = z.h; } }); });
  return { paginas: analise.paginas.length, imagens: analise.imagens.length, fatos: analise.fatos.length, alertas: analise.alertas.length };
}

// Transcreve a fala dos clipes da faixa principal e gera as legendas na linha do tempo
async function transcreverProjeto({ projetoId }, ctx) {
  const p = projetos.ler(projetoId), preset = presets.obter(p.presetId);
  const lay = Modelo.layout(p, preset), palavras = [];
  const T = require('./transcricao');
  for (let i = 0; i < lay.clips.length; i++) {
    const lc = lay.clips[i], m = lc.midia;
    if (!m || m.tipo !== 'video' || !m.audio || (lc.clip.volume ?? 1) === 0) continue;
    const vel = lc.clip.velocidade || 1;
    const ws = await T.transcrever(projetos.arq(projetoId, m.arquivo), { ini: lc.clip.entrada || 0, dur: lc.clip.duracao, log: ctx.log, sinal: ctx.sinal });
    ws.forEach(w => palavras.push({ t: w.t, ini: +(lc.ini + w.ini / vel).toFixed(3), fim: +(lc.ini + w.fim / vel).toFixed(3) }));
    ctx.progresso(95 * (i + 1) / lay.clips.length);
  }
  const grupos = Modelo.agrupar(palavras, preset.legenda.palavras, preset.legenda.maxCaracteres, correcoes());
  await projetos.alterar(projetoId, pp => { pp.legendas = { ativas: true, grupos, origem: 'whisper' }; });
  ctx.log(`${palavras.length} palavras → ${grupos.length} legendas`);
  return { legendas: grupos.length };
}

// LOTE DE VARIACOES: o mesmo material com angulos de promessa diferentes (testar qual gera mais conversa)
const ANGULOS = { localizacao: 'Localização', planta: 'Planta e uso', condicao: 'Condição', prova: 'Prova social' };
function gerarVariacoes(projetoId, { angulos, formatos }) {
  const p = projetos.ler(projetoId), lista = (angulos && angulos.length ? angulos : Object.keys(ANGULOS)).filter(a => ANGULOS[a]);
  if (!p.principal.length) throw Object.assign(new Error('Monte o vídeo (Auto Edit ou editor) antes de gerar variações'), { status: 400 });
  const base = p.roteiro || {};
  return lista.map(angulo => {
    const d = projetos.duplicar(projetoId);
    const rot = gerarRoteiroBase(d, { posicionamento: base.posicionamento, objetivo: base.objetivo, duracao: base.duracao, formato: base.formato === 'padrao' ? undefined : base.formato, angulo, ocultarTabela: true });
    d.nome = `${p.nome} · ${ANGULOS[angulo]}`;
    d.textos = (d.textos || []).map(t => t.tipo === 'gancho' ? { ...t, texto: rot.gancho } : t.tipo === 'cta' ? { ...t, texto: rot.cta } : t);
    if (!d.textos.some(t => t.tipo === 'gancho')) d.textos.unshift({ id: Modelo.uid('x'), tipo: 'gancho', texto: rot.gancho, inicio: 0, duracao: 3 });
    d.roteiro = { ...base, ...rot, cenas: base.cenas || rot.cenas, variacaoDe: projetoId };
    if (formatos && formatos.length) d.formatosExport = formatos.filter(f => Modelo.FORMATOS[f]);
    d.sugestoes = [{ id: Modelo.uid('s'), tipo: 'variação', texto: `Variação "${ANGULOS[angulo]}": gancho "${rot.gancho}" e CTA "${rot.cta}". Meça os comentários com a palavra ${rot.palavraCta || '—'}.`, data: new Date().toISOString() }];
    projetos.salvar(d.id, d);
    return { id: d.id, nome: d.nome, angulo, gancho: rot.gancho, cta: rot.cta, palavraCta: rot.palavraCta };
  });
}

module.exports = { gerarVariacoes, ANGULOS, gerarRoteiro, gerarRoteiroBase, aplicarRoteiro, autoEdit, processarPdf, transcreverProjeto, detectarFala, detectarCenas, materiais };

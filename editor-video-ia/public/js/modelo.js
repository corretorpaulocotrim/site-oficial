// Modelo de projeto compartilhado entre o navegador (editor/previa) e o servidor (renderizacao).
// Mesma matematica de linha do tempo nos dois lados = a previa bate com o arquivo final.
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.Modelo = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  const FPS = 30;
  const FORMATOS = {
    '9x16': { w: 1080, h: 1920, nome: 'Vertical 9:16 (Reels, TikTok, Shorts)' },
    '4x5': { w: 1080, h: 1350, nome: 'Vertical 4:5 (Feed)' },
    '1x1': { w: 1080, h: 1080, nome: 'Quadrado 1:1' },
    '16x9': { w: 1920, h: 1080, nome: 'Horizontal 16:9 (YouTube)' }
  };
  const TRANSICOES = ['fade', 'fadeblack', 'fadewhite', 'smoothleft', 'smoothright', 'smoothup', 'smoothdown', 'slideleft', 'slideup', 'circleopen', 'circleclose', 'zoomin', 'wipeleft', 'wiperight', 'radial', 'dissolve', 'pixelize', 'hblur'];
  const MOVIMENTOS = ['auto', 'nenhum', 'zoomin', 'zoomout', 'panesq', 'pandir', 'subir', 'descer'];
  const ENQUADRAMENTOS = ['auto', 'preencher', 'ajustar', 'cartao'];
  const TEXTO_TIPOS = ['gancho', 'ficha', 'impacto', 'rotulo', 'cta'];

  // Emojis contextuais: so aparecem quando a FALA cita o assunto (e so em presets que permitem)
  const EMOJIS = [
    [['piscina', 'piscinas', 'nadar'], '1f3ca'], [['praia', 'praias', 'orla'], '1f3d6'], [['mar'], '1f30a'],
    [['metro', 'metrô', 'vlt', 'trem', 'brt', 'estação'], '1f687'], [['vaga', 'vagas', 'garagem', 'carro'], '1f697'],
    [['chave', 'chaves'], '1f511'], [['casa', 'lar'], '1f3e0'], [['prédio', 'predio', 'torre', 'empreendimento'], '1f3e2'],
    [['fgts', 'dinheiro', 'entrada', 'parcela', 'parcelas'], '1f4b0'], [['quarto', 'quartos', 'suíte', 'suite', 'suítes'], '1f6cf'],
    [['varanda', 'vista', 'pôr', 'sol'], '1f305'], [['academia', 'fitness', 'treino'], '1f4aa'], [['segurança', 'portaria', 'seguro'], '1f512'],
    [['família', 'familia', 'crianças', 'filhos', 'playground'], '1f46a'], [['pet', 'cachorro', 'cachorros'], '1f436'],
    [['churrasqueira', 'gourmet', 'churrasco'], '1f356'], [['localização', 'localizacao', 'endereço', 'fica'], '1f4cd'],
    [['lançamento', 'lancamento', 'novo', 'novidade'], '2728'], [['financiamento', 'caixa', 'banco', 'financiar'], '1f3e6'],
    [['whatsapp', 'mensagem', 'chama', 'direct'], '1f4f2'], [['olha', 'veja', 'repara'], '1f440'], [['jardim', 'verde', 'parque', 'natureza'], '1f333'],
    [['shopping', 'compras', 'mercado'], '1f6cd'], [['escola', 'faculdade', 'universidade'], '1f393'], [['hospital', 'saúde'], '1f3e5'],
    [['luxo', 'exclusivo', 'exclusiva', 'alto padrão'], '1f48e'], [['valorização', 'investimento', 'rentabilidade', 'aluguel'], '1f4c8'],
    [['minutos', 'rápido', 'perto'], '23f1'], [['aprovado', 'aprovação', 'garantido'], '2705'], [['planta', 'metragem', 'm²', 'metros'], '1f4d0']
  ];
  const sem = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w² ]/g, '');
  const EMOJI_IDX = new Map(); EMOJIS.forEach(([ws, c]) => ws.forEach(w => EMOJI_IDX.set(sem(w), c)));
  const GENERICOS = new Set(['1f440', '23f1', '2728', '1f4cd']); // olha/minutos/novo/fica: so se nada mais especifico
  const emojiPara = texto => { let g = null; for (const w of String(texto).split(/\s+/)) { const c = EMOJI_IDX.get(sem(w)); if (c && !GENERICOS.has(c)) return c; if (c && !g) g = c; } return g; };

  let _n = 0;
  const uid = p => (p || 'x') + Date.now().toString(36) + (++_n).toString(36) + Math.random().toString(36).slice(2, 5);
  const clone = o => JSON.parse(JSON.stringify(o));
  const ehObj = o => o && typeof o === 'object' && !Array.isArray(o);
  function mesclar(base, extra) {
    const r = clone(base || {});
    for (const [k, v] of Object.entries(extra || {})) r[k] = ehObj(v) && ehObj(r[k]) ? mesclar(r[k], v) : clone(v);
    return r;
  }

  function projetoVazio(nome, formato, presetId) {
    const agora = new Date().toISOString();
    return {
      versao: 1, id: uid('p'), nome: nome || 'Novo projeto', criado: agora, atualizado: agora,
      formato: formato || '9x16', formatosExport: [formato || '9x16'], presetId: presetId || 'social-performance',
      empreendimento: { nome: '', bairro: '', construtora: '', status: '', plantas: '', preco: '', fonte: 'manual' },
      midias: [], pdfs: [], principal: [], broll: [], textos: [], audios: [],
      legendas: { ativas: true, grupos: [], origem: null },
      telaFinal: true, ajustes: { barraProgresso: true, marcaDagua: true, efeitosSonoros: true },
      sugestoes: [], ia: { conteudoGerado: false, notas: '' }, exportacoes: []
    };
  }

  const midiaDe = (p, id) => (p.midias || []).find(m => m.id === id);
  const ehImagem = m => m && (m.tipo === 'imagem' || m.tipo === 'pagina');
  function duracaoClip(c, m) {
    if (c.tipo === 'telaFinal' || ehImagem(m) || !m) return Math.max(0.2, +c.duracao || 3);
    return Math.max(0.1, (+c.duracao || 1) / (+c.velocidade || 1));
  }
  function transicaoDe(ant, c, i, preset) {
    const pt = (preset && preset.transicoes) || { lista: ['fade'], dur: 0.35, entreFalas: 'corte' };
    let tipo = (c.transicao && c.transicao.tipo) || 'auto';
    let dur = c.transicao && c.transicao.dur != null ? +c.transicao.dur : +pt.dur || 0.35;
    if (tipo === 'auto') {
      if (c.tipo === 'telaFinal') tipo = 'fadeblack';
      else if (ant && ant.fala && c.fala) tipo = pt.entreFalas || 'corte';
      else tipo = (pt.lista && pt.lista.length ? pt.lista : ['fade'])[i % (pt.lista && pt.lista.length || 1)];
    }
    if (tipo === 'corte') return { tipo: 'fade', dur: 1 / FPS, corte: true };
    return { tipo, dur: Math.max(1 / FPS, dur) };
  }
  // Linha do tempo da faixa principal: cada clipe comeca onde o anterior termina menos a transicao
  function layout(p, preset) {
    const lista = (p.principal || []).slice();
    if (p.telaFinal && preset && !(preset.marca && preset.marca.telaFinal === false)) lista.push({ id: '__fim', tipo: 'telaFinal', duracao: (preset.marca && preset.marca.duracaoTelaFinal) || 3.5 });
    const out = []; let fim = 0;
    lista.forEach((c, i) => {
      const m = midiaDe(p, c.midia), d = duracaoClip(c, m);
      let tr = i === 0 ? { tipo: null, dur: 0 } : transicaoDe(lista[i - 1], c, i, preset);
      tr.dur = Math.min(tr.dur, d / 2, out[i - 1] ? out[i - 1].dur / 2 : tr.dur);
      const ini = Math.max(0, fim - tr.dur);
      out.push({ clip: c, midia: m, ini, fim: ini + d, dur: d, trans: tr });
      fim = ini + d;
    });
    return { clips: out, total: fim, fimConteudo: out.length && out[out.length - 1].clip.tipo === 'telaFinal' ? out[out.length - 1].ini : fim };
  }

  // Legendas: agrupa palavras em blocos curtos estilo reels
  function agrupar(palavras, max, maxChars, correcoes) {
    const grupos = []; let g = null;
    const corr = w => { const k = w.toLowerCase().replace(/[.,!?;:]+$/, ''); const c = (correcoes || {})[k]; return c ? c + w.slice(k.length) : w; };
    (palavras || []).forEach((p, i) => {
      const w = { t: corr(p.t), ini: +p.ini, fim: +p.fim };
      const prev = palavras[i - 1];
      const quebra = !g || g.palavras.length >= (max || 3) || (prev && w.ini - prev.fim > 0.5) ||
        /[.!?]$/.test(g.palavras[g.palavras.length - 1].t) || (g.palavras.map(x => x.t).join(' ') + ' ' + w.t).length > (maxChars || 22);
      if (quebra) { g = { id: uid('g'), palavras: [] }; grupos.push(g); }
      g.palavras.push(w);
    });
    grupos.forEach(g => { g.ini = g.palavras[0].ini; });
    grupos.forEach((g, i) => {
      const prox = grupos[i + 1] ? grupos[i + 1].ini : Infinity;
      g.fim = Math.min(g.palavras[g.palavras.length - 1].fim + 0.25, prox);
      g.emoji = emojiPara(g.palavras.map(p => p.t).join(' '));
    });
    return grupos;
  }
  // Correcao manual do texto de um bloco: redistribui o tempo entre as palavras novas
  function reescrever(g, texto) {
    const ws = String(texto || '').trim().split(/\s+/).filter(Boolean);
    if (!ws.length) return null;
    const d = (g.fim - g.ini) / ws.length;
    return { ...g, palavras: ws.map((t, k) => ({ t, ini: g.ini + d * k, fim: g.ini + d * (k + 1) })), emoji: g.emoji === undefined ? emojiPara(texto) : g.emoji };
  }
  const fmtTempo = s => { s = Math.max(0, s || 0); const m = Math.floor(s / 60); return `${m}:${(s % 60).toFixed(1).padStart(4, '0')}`; };

  return { FPS, FORMATOS, TRANSICOES, MOVIMENTOS, ENQUADRAMENTOS, TEXTO_TIPOS, EMOJIS, emojiPara, uid, clone, mesclar, projetoVazio, midiaDe, ehImagem, duracaoClip, transicaoDe, layout, agrupar, reescrever, fmtTempo };
});

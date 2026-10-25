// Legendas: transcricao local (Whisper via transformers.js), agrupamento estilo reels, ASS animado, SRT e texto do post.
const fs = require('fs');
const path = require('path');

let _asr = null;
async function transcrever(rawF32, cfg, log) {
  const { pipeline, env } = await import('@huggingface/transformers');
  env.cacheDir = path.join(__dirname, '.modelos');
  // Tenta o modelo do config (com tempo por palavra); se falhar, cai para o whisper-base padrao
  const tentativas = [[cfg.modeloWhisper, { dtype: { encoder_model: 'fp32', decoder_model_merged: 'q8' } }], [cfg.modeloWhisper, {}], ['onnx-community/whisper-base', {}]];
  for (const [modelo, o] of tentativas) {
    if (_asr || !modelo) break;
    try { _asr = await pipeline('automatic-speech-recognition', modelo, o); } catch (e) { log && log('  modelo ' + modelo + ' indisponivel: ' + e.message.split('\n')[0]); }
  }
  if (!_asr) throw new Error('sem modelo de legenda (precisa de internet na 1a vez)');
  const buf = fs.readFileSync(rawF32);
  const audio = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const base = { language: 'portuguese', task: 'transcribe', chunk_length_s: 30, stride_length_s: 5 };
  let palavras = [];
  try {
    const r = await _asr(audio, { ...base, return_timestamps: 'word' });
    palavras = (r.chunks || []).map(c => ({ t: c.text.trim(), ini: c.timestamp[0], fim: c.timestamp[1] ?? c.timestamp[0] + 0.3 }));
  } catch (e) {
    log && log('  (sem tempo por palavra; usando tempo por frase)');
    const r = await _asr(audio, { ...base, return_timestamps: true });
    for (const c of r.chunks || []) {
      const ws = c.text.trim().split(/\s+/).filter(Boolean), a = c.timestamp[0], b = c.timestamp[1] ?? a + ws.length * 0.35;
      ws.forEach((w, i) => palavras.push({ t: w, ini: a + (b - a) * i / ws.length, fim: a + (b - a) * (i + 1) / ws.length }));
    }
  }
  return palavras.filter(p => p.t);
}

function corrigir(w, cfg) {
  const k = w.toLowerCase().replace(/[.,!?;:]+$/, '');
  const c = (cfg.correcoes || {})[k];
  return c ? c + w.slice(k.length) : w;
}

function agrupar(palavras, cfg, max) {
  const grupos = []; let g = null;
  palavras.forEach((p, i) => {
    const w = { ...p, t: corrigir(p.t, cfg) };
    const prev = palavras[i - 1];
    const quebra = !g || g.palavras.length >= max || (prev && w.ini - prev.fim > 0.5) ||
      /[.!?]$/.test(g.palavras[g.palavras.length - 1].t) || (g.palavras.map(x => x.t).join(' ') + ' ' + w.t).length > 22;
    if (quebra) { g = { palavras: [] }; grupos.push(g); }
    g.palavras.push(w);
  });
  grupos.forEach(g => { g.ini = g.palavras[0].ini; });
  grupos.forEach((g, i) => {
    const prox = grupos[i + 1] ? grupos[i + 1].ini : Infinity;
    g.fim = Math.min(g.palavras[g.palavras.length - 1].fim + 0.25, prox);
  });
  return grupos;
}

// Aplica a revisao do usuario (uma linha por legenda), redistribuindo o tempo dentro de cada legenda
function aplicarEdicao(grupos, linhas) {
  return grupos.map((g, i) => {
    const txt = (linhas[i] ?? '').trim();
    if (!txt) return null;
    const ws = txt.split(/\s+/), d = (g.fim - g.ini) / ws.length;
    return { ini: g.ini, fim: g.fim, palavras: ws.map((t, k) => ({ t, ini: g.ini + d * k, fim: g.ini + d * (k + 1) })) };
  }).filter(Boolean);
}

const cor = hex => { const h = hex.replace('#', ''); return `&H00${h.slice(4, 6)}${h.slice(2, 4)}${h.slice(0, 2)}&`.toUpperCase(); };
const tempo = s => { s = Math.max(0, s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = (s % 60).toFixed(2).padStart(5, '0'); return `${h}:${String(m).padStart(2, '0')}:${x}`; };
const esc = t => String(t || '').replace(/[{}]/g, '').replace(/\\/g, '/').replace(/\n/g, '\\N');

function gerarASS(job, cfg, w, h, FIM) {
  const op = job.opcoes, C = cfg.cores, dur = job.duracao;
  const vert = h > w, s = vert ? w : h * 0.6; // escala base de fonte
  const fL = cfg.fonteLegenda || 'Arial Black', fT = cfg.fonteTitulo || 'Georgia';
  const mvLeg = Math.round(h * (h / w > 1.6 ? 0.24 : 0.13));
  const ev = [];
  const add = (ini, fim, est, txt) => fim > ini && ev.push(`Dialogue: 0,${tempo(ini)},${tempo(fim)},${est},,0,0,0,,${txt}`);
  const fimConteudo = op.cartaoFinal ? dur - FIM : dur;

  // 1) Gancho (primeiros segundos) - o que segura o espectador
  if (op.gancho) add(0, Math.min(3.2, fimConteudo), 'Gancho', `{\\fad(120,200)}${esc(op.gancho.toUpperCase())}`);
  // 2) Ficha do imovel
  const linha2 = [op.bairro, op.preco ? 'a partir de ' + op.preco : ''].filter(Boolean).join(' • ');
  if (op.titulo) add(op.gancho ? 3.3 : 0.3, Math.min((op.gancho ? 3.3 : 0.3) + 4.5, fimConteudo), 'Ficha',
    `{\\fad(200,250)}${esc(op.titulo.toUpperCase())}${linha2 ? `\\N{\\fs${Math.round(s * 0.036)}\\b0}${esc(linha2)}` : ''}`);
  // 3) Etiquetas de capitulo (ex.: FACHADA, LAZER, PLANTA) no canto superior
  for (const m of job.marcas || []) add(m.ini + 0.1, Math.min(m.fim, fimConteudo), 'Etiqueta', `{\\fad(150,150)}● ${esc(m.texto.toUpperCase())}`);
  // 4) Legenda palavra a palavra com destaque
  const dest = new Set((cfg.palavrasDestaque || []).map(x => x.toLowerCase()));
  const ehDestaque = t => { const k = t.toLowerCase().replace(/[.,!?;:]/g, ''); return dest.has(k) || /\d/.test(k); };
  for (const g of job.grupos || []) {
    if (g.ini >= fimConteudo) continue;
    g.palavras.forEach((p, k) => {
      const ini = k === 0 ? g.ini : p.ini, fim = k < g.palavras.length - 1 ? g.palavras[k + 1].ini : g.fim;
      const txt = g.palavras.map((q, j) => {
        let t = esc(op.caixaAlta === false ? q.t : q.t.toUpperCase());
        if (j === k) return `{\\c${cor(C.destaque)}\\fscx108\\fscy108}${t}{\\c&H00FFFFFF&\\fscx100\\fscy100}`;
        if (ehDestaque(q.t)) return `{\\c${cor(C.destaque)}}${t}{\\c&H00FFFFFF&}`;
        return t;
      }).join(' ');
      add(ini, Math.min(fim, fimConteudo), 'Leg', (k === 0 ? '{\\fscx80\\fscy80\\t(0,90,\\fscx100\\fscy100)}' : '') + txt);
    });
  }
  // 5) Cartao final: nome, WhatsApp, site, CRECI (abaixo da chave)
  if (op.cartaoFinal) {
    const off = vert || w === h ? (1920 - h) / 2 : 0;
    const base = w > h ? Math.round(900 * h / 1920) : Math.round(900 - off);
    const y = base + Math.round(h * 0.035), x = Math.round(w / 2), t0 = dur - FIM + 0.25;
    add(t0, dur, 'FimNome', `{\\an8\\pos(${x},${y})\\fad(250,0)}${esc(cfg.nome.toUpperCase())}`);
    add(t0 + 0.2, dur, 'FimCta', `{\\an8\\pos(${x},${y + Math.round(s * 0.11)})\\fad(250,0)}WhatsApp ${esc(cfg.whatsapp)}`);
    add(t0 + 0.4, dur, 'FimInfo', `{\\an8\\pos(${x},${y + Math.round(s * 0.21)})\\fad(250,0)}${esc(cfg.site)}  •  ${esc(cfg.instagram)}\\N${esc(cfg.creci)}`);
  }
  const st = (nome, fonte, tam, prim, outl, back, bold, borda, bordaT, sombra, al, ml, mr, mv) =>
    `Style: ${nome},${fonte},${Math.round(tam)},${prim},${prim},${outl},${back},${bold},0,0,0,100,100,0,0,${borda},${bordaT},${sombra},${al},${Math.round(ml)},${Math.round(mr)},${Math.round(mv)},1`;
  const B = '&H00FFFFFF&', P = '&H00000000&';
  return `[Script Info]
ScriptType: v4.00+
PlayResX: ${w}
PlayResY: ${h}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${st('Leg', fL, s * 0.082, B, P, '&H80000000&', -1, 1, s * 0.0065, s * 0.003, 2, w * 0.07, w * 0.07, mvLeg)}
${st('Gancho', fT, s * 0.07, B, cor(C.petroleo), P, -1, 3, s * 0.022, 0, 8, w * 0.07, w * 0.07, h * (vert ? 0.13 : 0.07))}
${st('Ficha', fT, s * 0.058, B, cor(C.azul), P, -1, 3, s * 0.02, 0, 8, w * 0.07, w * 0.07, h * (vert ? 0.13 : 0.07))}
${st('Etiqueta', 'Arial', s * 0.03, B, '&H50000000&', P, -1, 3, s * 0.012, 0, 7, w * 0.05, w * 0.05, h * (h / w > 1.6 ? 0.06 : 0.04))}
${st('FimNome', fT, s * 0.075, B, P, P, -1, 1, 0, 0, 8, 0, 0, 0)}
${st('FimCta', 'Arial', s * 0.052, B, cor(C.verde), P, -1, 3, s * 0.02, 0, 8, 0, 0, 0)}
${st('FimInfo', 'Arial', s * 0.036, '&H00E6E6E6&', P, P, 0, 1, 0, 0, 8, 0, 0, 0)}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${ev.join('\n')}
`;
}

function gerarSRT(grupos) {
  const t = s => { const ms = Math.round(s * 1000); return new Date(ms).toISOString().slice(11, 23).replace('.', ','); };
  return (grupos || []).map((g, i) => `${i + 1}\n${t(g.ini)} --> ${t(g.fim)}\n${g.palavras.map(p => p.t).join(' ')}\n`).join('\n');
}

function textoPost(op, cfg) {
  const tag = s => '#' + String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]/g, '').toLowerCase();
  const tags = [op.bairro && tag(op.bairro), op.titulo && tag(op.titulo), '#imoveisrj', '#apartamentonaplanta', '#minhacasaminhavida', '#financiamentocaixa', '#fgts', '#riodejaneiro', '#corretordeimoveis', '#lancamentoimobiliario'].filter(Boolean);
  return `${op.gancho || op.titulo || ''}

🏢 ${op.titulo || 'Lançamento no Rio'}${op.bairro ? ' — ' + op.bairro : ''}
${op.preco ? '💰 A partir de ' + op.preco + '\n' : ''}🏦 Financiamento CAIXA • uso do FGTS • análise inicial em até 48h úteis
📲 Simulação 100% online, sem sair de casa

👉 Comente "QUERO" ou chame no WhatsApp ${cfg.whatsapp}
🌐 ${cfg.site}

${cfg.nome} • ${cfg.creci}

${tags.join(' ')}
`;
}

module.exports = { transcrever, agrupar, aplicarEdicao, gerarASS, gerarSRT, textoPost };

// Camada de texto (ASS/libass): legendas palavra a palavra, titulos animados, rotulos e tela final, por formato e preset.
const Modelo = require('../../public/js/modelo');

const cor = (hex, alfa = 0) => { const h = String(hex || '#FFFFFF').replace('#', '').padEnd(6, 'F'); const a = Math.round(Math.max(0, Math.min(1, alfa)) * 255).toString(16).padStart(2, '0'); return `&H${a}${h.slice(4, 6)}${h.slice(2, 4)}${h.slice(0, 2)}&`.toUpperCase(); };
const tempo = s => { s = Math.max(0, s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = (s % 60).toFixed(2).padStart(5, '0'); return `${h}:${String(m).padStart(2, '0')}:${x}`; };
const esc = t => String(t == null ? '' : t).replace(/[{}]/g, '').replace(/\\/g, '/').replace(/\r?\n/g, '\\N');
const semAc = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.,!?;:]/g, '');

// Escala tipografica por formato: retrato/quadrado usam a largura; horizontal usa ~60% da altura
function geometria(w, h) {
  const s = h > w ? w : w === h ? w * 0.92 : h * 0.62;
  const legY = h / w > 1.6 ? null : w === h ? 0.8 : w > h ? 0.86 : 0.78; // null = usa o preset (9:16)
  return { s, legY };
}

function gerar(p, lay, preset, marca, w, h) {
  const g = geometria(w, h), s = g.s, L = preset.legenda, ev = [], estilos = new Map();
  const fimC = lay.fimConteudo;
  const add = (ini, fim, est, txt, camada = 1) => { fim = Math.min(fim, lay.total); if (fim - ini > 0.04) ev.push(`Dialogue: ${camada},${tempo(ini)},${tempo(fim)},${est},,0,0,0,,${txt}`); };
  const estilo = (nome, fonte, tam, primaria, contorno, fundo, negrito, borda, esp, sombra, al) => {
    estilos.set(nome, `Style: ${nome},${fonte},${Math.round(tam)},${primaria},${primaria},${contorno},${fundo},${negrito ? -1 : 0},0,0,0,100,100,0,0,${borda},${Math.round(esp * 10) / 10},${Math.round(sombra * 10) / 10},${al},${Math.round(w * 0.07)},${Math.round(w * 0.07)},0,1`);
  };
  const anim = (tipo, x, y) => tipo === 'subir' ? `\\move(${x},${y + Math.round(h * 0.02)},${x},${y},0,260)\\fad(160,200)` : tipo === 'pop' ? `\\pos(${x},${y})\\fscx80\\fscy80\\t(0,130,\\fscx100\\fscy100)\\fad(80,160)` : tipo === 'nenhuma' ? `\\pos(${x},${y})` : `\\pos(${x},${y})\\fad(250,250)`;

  // Titulos (gancho, ficha, impacto, rotulo, cta)
  for (const [tipo, T] of Object.entries(preset.titulos)) {
    const box = T.fundo && T.fundoOpacidade > 0;
    estilo('T_' + tipo, T.fonte, T.tamanho * s, cor(T.cor), box ? cor(T.fundo, 1 - T.fundoOpacidade) : cor('#000000', 0.4), cor('#000000', 0.6), /Black|Bold/.test(T.fonte) || tipo === 'rotulo', box ? 3 : 1, box ? s * 0.016 : s * 0.002, box ? 0 : s * 0.003, tipo === 'rotulo' ? 7 : 8);
  }
  const titulo = (tipo, ini, dur, texto, sub, posY) => {
    const T = preset.titulos[tipo] || preset.titulos.ficha, y = Math.round((posY != null ? posY : T.posicaoY) * h);
    const x = tipo === 'rotulo' ? Math.round(w * 0.05) : Math.round(w / 2);
    const tx = esc(T.caixaAlta ? String(texto).toUpperCase() : texto) + (sub ? `\\N{\\fs${Math.round(T.tamanho * s * 0.58)}\\b0}${esc(sub)}` : '');
    add(ini, ini + dur, 'T_' + tipo, `{${tipo === 'rotulo' ? `\\pos(${x},${y})\\fad(150,150)` : anim(T.animacao, x, y)}}${tipo === 'rotulo' ? '● ' : ''}${tx}`, 3);
  };
  for (const t of p.textos || []) if (t.inicio < lay.total) titulo(t.tipo || 'impacto', +t.inicio, +t.duracao || 2, t.texto, t.sub, t.posicaoY);
  for (const b of p.broll || []) if (b.rotulo) titulo('rotulo', +b.inicio + 0.1, Modelo.duracaoClip(b, Modelo.midiaDe(p, b.midia)) - 0.1, b.rotulo);
  for (const lc of lay.clips) if (lc.clip.rotulo && lc.clip.tipo !== 'telaFinal') titulo('rotulo', lc.ini + 0.1, lc.dur - 0.1, lc.clip.rotulo);

  // Legendas palavra a palavra
  const emojis = [];
  if (p.legendas && p.legendas.ativas && (p.legendas.grupos || []).length) {
    const tam = L.tamanho * s, box = L.fundo && L.fundoOpacidade > 0;
    estilo('Leg', L.fonte, tam, cor(L.cor), box ? cor(L.fundo, 1 - L.fundoOpacidade) : cor(L.contorno), cor('#000000', 0.5), L.negrito, box ? 3 : 1, box ? s * 0.014 : L.espessura * s, L.sombra * s, 2);
    const y = Math.round((g.legY || L.posicaoY) * h), x = Math.round(w / 2);
    const dest = new Set((L.palavrasDestaque || []).map(semAc));
    const ehDest = t => dest.has(semAc(t)) || /\d/.test(t);
    const fmt = t => esc(L.caixaAlta ? t.toUpperCase() : t);
    const pinta = (t, c) => `{\\c${cor(c)}}${t}{\\c${cor(L.cor)}}`;
    for (const gr of p.legendas.grupos) {
      if (gr.ini >= fimC || !gr.palavras || !gr.palavras.length) continue;
      const fimG = Math.min(gr.fim, fimC);
      const ent = L.animacao === 'pop' ? `\\fscx82\\fscy82\\t(0,110,\\fscx100\\fscy100)` : L.animacao === 'fade' ? `\\fad(120,0)` : L.animacao === 'subir' ? '' : '';
      if (!L.destacarAtiva) {
        add(gr.ini, fimG, 'Leg', `{\\pos(${x},${y})${ent}}` + gr.palavras.map(q => ehDest(q.t) ? pinta(fmt(q.t), L.destaque) : fmt(q.t)).join(' '));
      } else {
        gr.palavras.forEach((q, k) => {
          const a = k === 0 ? gr.ini : Math.max(gr.ini, q.ini), b = k < gr.palavras.length - 1 ? Math.max(a + 0.05, gr.palavras[k + 1].ini) : fimG;
          const txt = gr.palavras.map((r, j) => j === k ? `{\\c${cor(L.destaque)}\\fscx106\\fscy106}${fmt(r.t)}{\\c${cor(L.cor)}\\fscx100\\fscy100}` : ehDest(r.t) ? pinta(fmt(r.t), L.destaque) : fmt(r.t)).join(' ');
          add(a, Math.min(b, fimG), 'Leg', `{\\pos(${x},${y})${k === 0 ? ent : ''}}${txt}`);
        });
      }
      if (L.emojis && gr.emoji) emojis.push({ codigo: gr.emoji, ini: gr.ini, fim: fimG, tam: Math.round(tam * 1.5), x: Math.round(w / 2 - tam * 0.75), y: Math.round(y - tam * 2.55 - tam * 1.5) });
    }
  }

  // Tela final com identidade oficial
  const fim = lay.clips.find(c => c.clip.tipo === 'telaFinal');
  if (fim) {
    const C = marca.cores, T = marca.telaFinal, t0 = fim.ini + 0.3, cx = Math.round(w / 2);
    const logoTam = Math.round(Math.min(w, h) * 0.26), y0 = Math.round(h * (h > w ? 0.36 : 0.3) + logoTam / 2 + h * 0.035);
    estilo('F_tit', marca.fontes.titulo, s * 0.085, cor(C.marfim), cor('#000000', 1), cor('#000000', 1), false, 1, 0, 0, 8);
    estilo('F_cta', 'Inter', s * 0.045, cor(C.tinta), cor(C.ouro), cor('#000000', 1), true, 3, s * 0.018, 0, 8);
    estilo('F_inf', 'Inter', s * 0.036, cor(C.marfim, 0.1), cor('#000000', 1), cor('#000000', 1), false, 1, 0, 0, 8);
    add(t0, lay.total, 'F_tit', `{\\pos(${cx},${y0})\\fad(300,0)}${esc(T.titulo)}`, 4);
    add(t0 + 0.2, lay.total, 'F_cta', `{\\pos(${cx},${y0 + Math.round(s * 0.13)})\\fad(300,0)}${esc(T.linha1)}  ${esc(T.linha2)}`, 4);
    add(t0 + 0.4, lay.total, 'F_inf', `{\\pos(${cx},${y0 + Math.round(s * 0.24)})\\fad(300,0)}${esc(T.linha3)}  •  ${esc(marca.instagram)}\\N${esc(marca.creci)}`, 4);
  }

  const ass = `[Script Info]
ScriptType: v4.00+
PlayResX: ${w}
PlayResY: ${h}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${[...estilos.values()].join('\n')}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${ev.join('\n')}
`;
  return { ass, emojis };
}

function srt(grupos) {
  const t = s => new Date(Math.round(Math.max(0, s) * 1000)).toISOString().slice(11, 23).replace('.', ',');
  return (grupos || []).map((g, i) => `${i + 1}\n${t(g.ini)} --> ${t(g.fim)}\n${g.palavras.map(p => p.t).join(' ')}\n`).join('\n');
}

module.exports = { gerar, srt, cor };

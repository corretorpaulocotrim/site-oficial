// Motor de renderizacao: projeto (linha do tempo) -> MP4 validado, em qualquer formato. Trechos em cache por hash.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cfg = require('../config');
const Modelo = require('../../public/js/modelo');
const projetos = require('../projetos');
const presets = require('../presets');
const marcaMod = require('../marca');
const ASS = require('./ass');
const sfx = require('./sfx');
const { ff, probe } = require('../midia');

const FPS = Modelo.FPS;
const par = n => Math.round(n / 2) * 2;
const hash = o => crypto.createHash('sha1').update(JSON.stringify(o)).digest('hex').slice(0, 20);
const num = (v, d) => (v === undefined || v === null || isNaN(+v)) ? d : +v;
const escFiltro = f => f.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");

function codec(preset, previa) {
  return previa
    ? ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '30', '-pix_fmt', 'yuv420p', '-r', String(FPS)]
    : ['-c:v', 'libx264', '-preset', preset.export.preset || 'veryfast', '-crf', String(preset.export.crf || 19), '-pix_fmt', 'yuv420p', '-r', String(FPS)];
}
const AAC = kbps => ['-c:a', 'aac', '-b:a', `${kbps || 192}k`, '-ar', '48000', '-ac', '2'];

// Cor/nitidez do preset + ajustes do clipe
function grade(preset, aj = {}) {
  const c = preset.cor;
  const f = [`eq=contrast=${(c.contraste * num(aj.contraste, 1)).toFixed(3)}:saturation=${(c.saturacao * num(aj.saturacao, 1)).toFixed(3)}:brightness=${(c.brilho + num(aj.brilho, 0)).toFixed(3)}:gamma=${c.gamma}`];
  if (c.nitidez > 0) f.push(`unsharp=5:5:${c.nitidez}:5:5:0`);
  if (c.vinheta > 0) f.push(`vignette=angle=${(Math.PI / 4 * c.vinheta).toFixed(3)}`);
  return f.join(',');
}
// Enquadramento: preencher (corta pelo ponto de foco), ajustar (inteiro sobre fundo desfocado)
function enquadrar(modo, W, H, fx, fy) {
  if (modo === 'preencher') return `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:(iw-${W})*${fx}:(ih-${H})*${fy}`;
  return `split[ea][eb];[ea]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=${Math.round(W / 45)}:2,eq=brightness=-0.12[ebg];[eb]scale=${W}:${H}:force_original_aspect_ratio=decrease[efg];[ebg][efg]overlay=(W-w)/2:(H-h)/2`;
}
function modoAuto(clip, m, W, H) {
  if (clip.enquadramento && clip.enquadramento !== 'auto') return clip.enquadramento;
  if (!m.w || !m.h) return 'preencher';
  const r = (m.w / m.h) / (W / H);
  return r > 0.82 && r < 1.22 ? 'preencher' : 'ajustar';
}

// Cartao "estilo Apple": cantos arredondados + sombra, sobre a cor da marca (PDF) ou a propria imagem desfocada
async function cartao(src, out, W, H, fundoCor, sinal) {
  const R = Math.round(Math.min(W, H) * 0.035), cw = par(W * 0.87), ch = par(H * 0.77), pad = Math.round(Math.min(W, H) * 0.06);
  const bg = fundoCor
    ? `color=c=${fundoCor}:s=${W}x${H}:d=1,vignette=angle=PI/4[bg]`
    : `[0]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=${Math.round(W / 36)}:3,eq=brightness=-0.16:saturation=0.85[bg]`;
  const fc = `${bg};[0]scale=${cw}:${ch}:force_original_aspect_ratio=decrease,format=rgba,` +
    `geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(abs(W/2-X),W/2-${R})*gt(abs(H/2-Y),H/2-${R}),if(lte(hypot(${R}-(W/2-abs(W/2-X)),${R}-(H/2-abs(H/2-Y))),${R}),255,0),255)',split[c1][c2];` +
    `[c2]pad=iw+${pad * 2}:ih+${pad * 2}:${pad}:${pad}:color=black@0,colorchannelmixer=rr=0:gg=0:bb=0:aa=0.55,boxblur=${Math.round(pad / 3)}:2[sh];` +
    `[bg][sh]overlay=(W-w)/2:(H-h)/2+${Math.round(pad / 2)}[b1];[b1][c1]overlay=(W-w)/2:(H-h)/2,format=rgb24`;
  await ff(['-i', src, '-filter_complex', fc, '-frames:v', '1', out], { tag: 'cartão', sinal });
}

// Um trecho de video de duracao EXATA (a matematica da linha do tempo depende disso)
async function trecho(p, item, ctxR, comAudio) {
  const { W, H, preset, previa, sinal, marca } = ctxR;
  const m = item.tipo === 'telaFinal' ? null : Modelo.midiaDe(p, item.midia);
  if (item.tipo !== 'telaFinal' && !m) throw new Error('Mídia não encontrada no projeto: ' + item.midia);
  const D = Modelo.duracaoClip(item, m);
  const src = m && projetos.arq(p.id, m.arquivo);
  const chave = hash({ v: 4, item, D, W, H, previa, cor: preset.cor, mov: preset.movimento, a: comAudio, src: m && [m.arquivo, fs.statSync(src).mtimeMs], marca: item.tipo === 'telaFinal' ? [marca.cores, marca.logos] : 0 });
  const out = projetos.arq(p.id, 'cache', `t_${chave}.mp4`);
  if (fs.existsSync(out)) return out;
  const tmp = out.replace('.mp4', '.tmp.mp4');
  const enc = codec(preset, previa);
  const audio = ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo'];
  const fx = num(item.focoX, 0.5), fy = num(item.focoY, m && m.tipo === 'video' ? 0.4 : 0.5);

  if (item.tipo === 'telaFinal') {
    const L = par(Math.min(W, H) * 0.26), y = Math.round(H * (H > W ? 0.36 : 0.3) - L / 2);
    await ff(['-f', 'lavfi', '-i', `color=c=${marca.cores.tinta}:s=${W}x${H}:r=${FPS}:d=${D}`, '-loop', '1', '-i', marcaMod.caminhoLogo('monograma'), ...audio,
      '-filter_complex', `[0]vignette=angle=PI/5[b];[1]scale=${L}:-1,format=rgba,fade=in:st=0:d=0.5:alpha=1[l];[b][l]overlay=(W-w)/2:${y}:shortest=0,format=yuv420p[v]`,
      '-map', '[v]', '-map', '2:a', '-t', D.toFixed(3), ...enc, ...AAC(), tmp], { tag: 'tela final', sinal });
  } else if (Modelo.ehImagem(m)) {
    const n = Math.max(2, Math.round(D * FPS)), I = num(item.intensidade, m.tipo === 'pagina' && m.categoria === 'planta' ? preset.movimento.planta : preset.movimento.intensidade);
    let modo = item.enquadramento && item.enquadramento !== 'auto' ? item.enquadramento : (m.tipo === 'pagina' ? preset.movimento.pdf || 'cartao' : preset.movimento.fotos === 'cartao' ? 'cartao' : 'preencher');
    let mov = item.movimento && item.movimento !== 'auto' ? item.movimento : (modo === 'preencher' && preset.movimento.fotos === 'pan' ? 'pan' : 'zoomin');
    const largo = m.w / m.h > W / H * 1.08, alto = m.w / m.h < W / H / 1.08;
    if ((mov === 'pan' || mov === 'panesq' || mov === 'pandir') && !largo) mov = alto ? (mov === 'panesq' ? 'descer' : 'subir') : 'zoomin';
    if ((mov === 'subir' || mov === 'descer') && !alto) mov = 'zoomin';
    let entrada = src, vf, loop = [];
    if (mov === 'pan' || mov === 'panesq' || mov === 'pandir' || mov === 'subir' || mov === 'descer') {
      // Panoramica (sem distorcer a arquitetura): desliza pela imagem inteira
      const dir = mov === 'panesq' ? '(1-t/' + D + ')' : mov === 'pan' && item.indice % 2 ? '(1-t/' + D + ')' : 't/' + D;
      vf = mov === 'subir' || mov === 'descer'
        ? `scale=${W * 2}:-2,crop=${W * 2}:${H * 2}:0:'(ih-${H * 2})*${mov === 'subir' ? '(1-t/' + D + ')' : 't/' + D}',scale=${W}:${H}`
        : `scale=-2:${H * 2},crop=${W * 2}:${H * 2}:'(iw-${W * 2})*${dir}':0,scale=${W}:${H}`;
      loop = ['-loop', '1', '-framerate', String(FPS), '-t', D.toFixed(3)];
    } else {
      if (modo === 'cartao') {
        entrada = projetos.arq(p.id, 'cache', `c_${hash([m.arquivo, W, H, m.tipo, marca.cores.tinta])}.png`);
        if (!fs.existsSync(entrada)) await cartao(src, entrada, W * 2, H * 2, m.tipo === 'pagina' ? marca.cores.tinta : null, sinal);
      }
      const pre = modo === 'cartao' ? `scale=${W * 2}:${H * 2}` : modo === 'ajustar' ? enquadrar('ajustar', W * 2, H * 2) : enquadrar('preencher', W * 2, H * 2, fx, fy);
      const z = mov === 'zoomout' ? `${1 + I}-${I}*on/${n}` : mov === 'nenhum' ? '1' : `1+${I}*on/${n}`;
      vf = `${pre},zoompan=z='${z}':x='(iw-iw/zoom)*${fx}':y='(ih-ih/zoom)*${fy}':d=${n}:s=${W}x${H}:fps=${FPS}`;
    }
    const g = m.tipo === 'pagina' ? 'null' : grade(preset, item.ajustes);
    await ff([...loop, '-i', entrada, ...audio, '-filter_complex', `[0:v]${vf},${g},setsar=1,format=yuv420p[v]`, '-map', '[v]', '-map', '1:a', '-t', D.toFixed(3), ...enc, ...AAC(), tmp], { tag: 'imagem', sinal });
  } else {
    // Video: corte, velocidade, enquadramento, punch-in, movimento e cor
    const vel = Math.max(0.25, Math.min(4, num(item.velocidade, 1))), ent = num(item.entrada, 0), dur = num(item.duracao, m.dur);
    const modo = modoAuto(item, m, W, H);
    let vf = `fps=${FPS},setpts=(PTS-STARTPTS)/${vel},${enquadrar(modo, W, H, fx, fy)}`;
    const zoom = num(item.zoom, 1);
    if (zoom > 1.001) vf += `,crop=iw/${zoom}:ih/${zoom}:(iw-iw/${zoom})*${fx}:(ih-ih/${zoom})*${fy},scale=${W}:${H}`;
    if (item.movimento === 'zoomin' || item.movimento === 'zoomout') {
      const I = num(item.intensidade, preset.movimento.intensidade), n = Math.round(D * FPS);
      vf += `,zoompan=z='${item.movimento === 'zoomin' ? `1+${I}*on/${n}` : `${1 + I}-${I}*on/${n}`}':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s=${W}x${H}:fps=${FPS}`;
    }
    vf += `,${grade(preset, item.ajustes)},tpad=stop_mode=clone:stop_duration=2,setsar=1,format=yuv420p`;
    const temAudio = comAudio && m.audio && num(item.volume, 1) > 0;
    let af = '';
    if (temAudio) { let v = vel; const at = []; while (v > 2) { at.push('atempo=2'); v /= 2; } while (v < 0.5) { at.push('atempo=0.5'); v /= 0.5; } at.push(`atempo=${v.toFixed(4)}`); af = `[0:a]asetpts=PTS-STARTPTS,${at.join(',')},volume=${num(item.volume, 1)},aresample=48000,aformat=channel_layouts=stereo,apad[a]`; }
    await ff(['-ss', ent.toFixed(3), '-t', dur.toFixed(3), '-i', src, ...audio, '-filter_complex', `[0:v]${vf}[v]${af ? ';' + af : ''}`,
      '-map', '[v]', '-map', temAudio ? '[a]' : '1:a', '-t', D.toFixed(3), ...enc, ...AAC(), tmp], { tag: 'vídeo', sinal });
  }
  fs.renameSync(tmp, out);
  return out;
}

// Junta a faixa principal com as transicoes nos tempos exatos do layout
async function juntarPrincipal(p, lay, arquivos, ctxR) {
  const chave = hash({ arquivos: arquivos.map(a => path.basename(a)), t: lay.clips.map(c => [c.ini, c.trans]) });
  const out = projetos.arq(p.id, 'cache', `base_${chave}.mp4`);
  if (fs.existsSync(out)) return out;
  if (arquivos.length === 1) { fs.copyFileSync(arquivos[0], out); return out; }
  const fc = []; let vl = '[0:v]', al = '[0:a]';
  for (let i = 1; i < arquivos.length; i++) {
    const t = lay.clips[i].trans, d = t.dur.toFixed(3);
    fc.push(`${vl}[${i}:v]xfade=transition=${t.tipo}:duration=${d}:offset=${lay.clips[i].ini.toFixed(3)}[v${i}]`);
    fc.push(`${al}[${i}:a]acrossfade=d=${d}:c1=tri:c2=tri[a${i}]`);
    vl = `[v${i}]`; al = `[a${i}]`;
  }
  const tmp = out.replace('.mp4', '.tmp.mp4');
  await ff([...arquivos.flatMap(a => ['-i', a]), '-filter_complex', fc.join(';'), '-map', vl, '-map', al, '-t', lay.total.toFixed(3), ...codec(ctxR.preset, ctxR.previa), ...AAC(), tmp],
    { tag: 'transições', sinal: ctxR.sinal, aoTempo: t => ctxR.prog(50 + 10 * t / lay.total) });
  fs.renameSync(tmp, out);
  return out;
}

function slug(s) { return String(s || 'video').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 50) || 'video'; }

async function renderizar(id, opt, ctx) {
  const p = projetos.ler(id);
  const preset = presets.obter(p.presetId), marca = marcaMod.obter();
  const formato = opt.formato || p.formato, F = Modelo.FORMATOS[formato];
  if (!F) throw new Error('Formato inválido: ' + formato);
  const previa = opt.qualidade === 'previa';
  const W = par(F.w * (previa ? 0.5 : 1)), H = par(F.h * (previa ? 0.5 : 1));
  const lay = Modelo.layout(p, preset);
  if (!lay.clips.length) throw new Error('A linha do tempo está vazia: adicione pelo menos um clipe na faixa principal.');
  const prog = v => ctx.progresso(v);
  const ctxR = { W, H, preset, marca, previa, sinal: ctx.sinal, prog };
  await sfx.garantir();
  ctx.log(`Renderizando ${F.nome} ${previa ? '(prévia rápida)' : '(final)'} — ${lay.total.toFixed(1)}s, ${lay.clips.length} clipes, ${(p.broll || []).length} sobreposições`);

  // 1) trechos da faixa principal
  const arquivos = [];
  for (let i = 0; i < lay.clips.length; i++) {
    arquivos.push(await trecho(p, { ...lay.clips[i].clip, indice: i }, ctxR, true));
    prog(45 * (i + 1) / lay.clips.length);
  }
  const base = await juntarPrincipal(p, lay, arquivos, ctxR);
  // 2) sobreposicoes (b-roll) em tela cheia
  const brolls = [];
  for (const b of (p.broll || []).filter(b => +b.inicio < lay.total)) brolls.push({ b, f: await trecho(p, { ...b, volume: 0 }, ctxR, false) });

  // 3) composicao final: b-roll, apresentador em circulo, marca, emojis, barra, textos, audio
  const ins = ['-i', base], fc = [];
  const entrada = (args) => { ins.push(...args); return ins.filter(x => x === '-i').length - 1; };
  let v = '[0:v]', k = 0;
  const S = Math.min(W, H);
  brolls.forEach(({ b, f }) => {
    const i = entrada(['-i', f]), a = +b.inicio, d = Math.min(Modelo.duracaoClip(b, Modelo.midiaDe(p, b.midia)), lay.total - a), fd = Math.min(0.3, d / 4);
    fc.push(`[${i}:v]format=yuva420p,fade=in:st=0:d=${fd}:alpha=1,fade=out:st=${(d - fd).toFixed(3)}:d=${fd}:alpha=1,setpts=PTS-STARTPTS+${a.toFixed(3)}/TB[br${k}]`);
    fc.push(`${v}[br${k}]overlay=0:0:enable='between(t,${a.toFixed(3)},${(a + d).toFixed(3)})':eof_action=pass[vb${k}]`); v = `[vb${k}]`; k++;
  });
  const pips = brolls.filter(x => x.b.pip !== false && Modelo.midiaDe(p, (lay.clips.find(c => c.ini <= x.b.inicio && c.fim > x.b.inicio) || {}).clip?.midia || '')?.tipo === 'video');
  if (pips.length) {
    const P = par(S * 0.34), lado = par(S * 0.9), cy = H > W ? Math.round(H * 0.07) : Math.round((H - lado) / 2);
    const mask = projetos.arq(p.id, 'cache', `mask_${P}.png`), aro = projetos.arq(p.id, 'cache', `aro_${P}_${marca.cores.ouro.slice(1)}.png`);
    if (!fs.existsSync(mask)) await ff(['-f', 'lavfi', '-i', `color=black:s=${P}x${P}`, '-vf', `format=gray,geq=lum='if(lte(hypot(X-${P / 2},Y-${P / 2}),${P / 2 - 1}),255,0)'`, '-frames:v', '1', mask], { tag: 'máscara' });
    const [r, g, bl] = [1, 3, 5].map(o => parseInt(marca.cores.ouro.slice(o, o + 2), 16)), A = P + Math.round(P * 0.06);
    if (!fs.existsSync(aro)) await ff(['-f', 'lavfi', '-i', `color=black:s=${A}x${A}`, '-vf', `format=rgba,geq=r=${r}:g=${g}:b=${bl}:a='if(between(hypot(X-${A / 2},Y-${A / 2}),${P / 2 - 2},${A / 2 - 1}),255,0)'`, '-frames:v', '1', aro], { tag: 'aro' });
    const im = entrada(['-loop', '1', '-i', mask]), ia = entrada(['-loop', '1', '-i', aro]);
    const quando = pips.map(x => `between(t,${(+x.b.inicio).toFixed(3)},${(+x.b.inicio + Modelo.duracaoClip(x.b, Modelo.midiaDe(p, x.b.midia))).toFixed(3)})`).join('+');
    const px = W - P - Math.round(W * 0.05), py = H > W ? Math.round(H * 0.5) : H - P - Math.round(H * 0.08);
    fc.push(`[0:v]crop=${lado}:${lado}:(iw-${lado})/2:${cy},scale=${P}:${P},format=yuva420p[pc0];[${im}:v]format=gray,scale=${P}:${P}[pm];[pc0][pm]alphamerge[pc]`);
    fc.push(`${v}[${ia}:v]overlay=${px - (A - P) / 2}:${py - (A - P) / 2}:enable='${quando}':shortest=1[vp1];[vp1][pc]overlay=${px}:${py}:enable='${quando}':shortest=1[vp2]`);
    v = '[vp2]';
  }
  // marca d'agua (logo oficial)
  if (p.ajustes.marcaDagua !== false && preset.marca.marcaDagua) {
    const il = entrada(['-i', marcaMod.caminhoLogo('monograma')]), lw = par(S * preset.marca.tamanho);
    fc.push(`[${il}:v]scale=${lw}:-1,format=rgba,colorchannelmixer=aa=${preset.marca.opacidade}[logo];${v}[logo]overlay=W-w-${Math.round(lw * 0.35)}:${Math.round(lw * 0.4)}:enable='lt(t,${lay.fimConteudo.toFixed(2)})'[vl]`);
    v = '[vl]';
  }
  // textos + legendas
  const { ass, emojis } = ASS.gerar(p, lay, preset, marca, W, H);
  const assArq = projetos.arq(p.id, 'tmp', `t_${formato}_${previa ? 'p' : 'f'}.ass`);
  fs.mkdirSync(path.dirname(assArq), { recursive: true }); fs.writeFileSync(assArq, ass);
  // emojis contextuais (PNG Twemoji, pois o libass nao desenha emoji colorido)
  const porCodigo = {};
  emojis.forEach(e => { if (fs.existsSync(path.join(cfg.ASSETS, 'emojis', e.codigo + '.png'))) (porCodigo[e.codigo] = porCodigo[e.codigo] || []).push(e); });
  Object.entries(porCodigo).forEach(([c, lista], j) => {
    const ie = entrada(['-i', path.join(cfg.ASSETS, 'emojis', c + '.png')]);
    fc.push(`[${ie}:v]scale=${lista[0].tam}:-1,format=rgba,split=${lista.length}${lista.map((_, n) => `[e${j}_${n}]`).join('')}`);
    lista.forEach((e, n) => { fc.push(`${v}[e${j}_${n}]overlay=${e.x}:${e.y}:enable='between(t,${e.ini.toFixed(3)},${e.fim.toFixed(3)})'[ve${j}_${n}]`); v = `[ve${j}_${n}]`; });
  });
  let fin = `${v}`;
  const passos = [];
  if (p.ajustes.barraProgresso !== false && preset.marca.barraProgresso) passos.push(`drawbox=x=0:y=0:w='iw*t/${lay.fimConteudo.toFixed(3)}':h=${Math.max(4, Math.round(H * 0.005))}:color=${preset.marca.corBarra}:t=fill:enable='lt(t,${lay.fimConteudo.toFixed(3)})'`);
  if (preset.cor.cinema > 0 && H > W) passos.push(`drawbox=x=0:y=0:w=iw:h=${Math.round(H * preset.cor.cinema / 2)}:color=black:t=fill,drawbox=x=0:y=ih-${Math.round(H * preset.cor.cinema / 2)}:w=iw:h=${Math.round(H * preset.cor.cinema / 2)}:color=black:t=fill`);
  passos.push(`subtitles='${escFiltro(assArq)}':fontsdir='${escFiltro(path.join(cfg.ASSETS, 'fontes'))}'`);
  fc.push(`${fin}${passos.join(',')},format=yuv420p[vout]`);

  // AUDIO: voz tratada + musica com abaixamento + efeitos sonoros nos eventos
  const A = preset.audio, mix = [];
  fc.push(`[0:a]${A.limparVoz ? 'highpass=f=80,afftdn=nf=-25,acompressor=threshold=-18dB:ratio=3:attack=5:release=120,' : ''}aformat=channel_layouts=stereo,asplit=2[voz][voz_sc]`);
  mix.push('[voz]');
  const musicas = (p.audios || []).filter(a => Modelo.midiaDe(p, a.midia) && +a.inicio < lay.total);
  musicas.forEach((a, j) => {
    const m = Modelo.midiaDe(p, a.midia), ini = +a.inicio, d = Math.min(num(a.duracao, lay.total - ini), lay.total - ini);
    const im = entrada([...(a.tipo === 'musica' ? ['-stream_loop', '-1'] : []), '-ss', num(a.entrada, 0).toFixed(3), '-i', projetos.arq(p.id, m.arquivo)]);
    const vol = num(a.volume, a.tipo === 'musica' ? A.musicaVolume : 1), ms = Math.round(ini * 1000);
    fc.push(`[${im}:a]atrim=0:${d.toFixed(3)},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,volume=${vol},afade=in:d=${a.tipo === 'musica' ? 0.6 : 0.02},afade=out:st=${Math.max(0, d - (a.tipo === 'musica' ? 1.8 : 0.05)).toFixed(3)}:d=${a.tipo === 'musica' ? 1.8 : 0.05},adelay=${ms}|${ms}[m${j}]`);
  });
  const duck = musicas.map((a, j) => a.ducking !== false && A.ducking ? `[m${j}]` : null).filter(Boolean);
  const livres = musicas.map((a, j) => !(a.ducking !== false && A.ducking) ? `[m${j}]` : null).filter(Boolean);
  if (duck.length) { fc.push(`${duck.join('')}${duck.length > 1 ? `amix=inputs=${duck.length}:normalize=0,` : ''}anull[mus];[mus][voz_sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[musd]`); mix.push('[musd]'); }
  else fc.push('[voz_sc]anullsink');
  mix.push(...livres);
  // eventos de efeito sonoro
  const ev = [];
  if (p.ajustes.efeitosSonoros !== false && A.sfxVolume > 0) {
    lay.clips.forEach(c => { if (c.trans && c.trans.tipo && !c.trans.corte && A.sfx.transicao) ev.push([A.sfx.transicao, c.ini + c.trans.dur / 2 - 0.25]); });
    (p.broll || []).forEach(b => A.sfx.broll && ev.push([A.sfx.broll, +b.inicio - 0.2]));
    (p.textos || []).forEach(t => { const s = A.sfx[t.tipo]; if (s) ev.push([s, +t.inicio - (s === 'riser' ? 1 : 0)]); });
  }
  const evOk = ev.filter(([s, t]) => sfx.caminho(s) && t >= 0 && t < lay.total - 0.2).slice(0, 60);
  if (evOk.length) {
    const tipos = [...new Set(evOk.map(e => e[0]))], idx = {};
    tipos.forEach(s => { idx[s] = entrada(['-i', sfx.caminho(s)]); });
    const usados = {};
    tipos.forEach(s => { const n = evOk.filter(e => e[0] === s).length; fc.push(`[${idx[s]}:a]volume=${A.sfxVolume},asplit=${n}${Array.from({ length: n }, (_, q) => `[s_${s.replace(/\W/g, '')}_${q}]`).join('')}`); usados[s] = 0; });
    evOk.forEach(([s, t], q) => { const ms = Math.round(t * 1000); fc.push(`[s_${s.replace(/\W/g, '')}_${usados[s]++}]adelay=${ms}|${ms}[sd${q}]`); });
    fc.push(`${evOk.map((_, q) => `[sd${q}]`).join('')}amix=inputs=${evOk.length}:normalize=0[sfx]`); mix.push('[sfx]');
  }
  fc.push(`${mix.join('')}${mix.length > 1 ? `amix=inputs=${mix.length}:duration=first:normalize=0,` : ''}loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,apad,atrim=0:${lay.total.toFixed(3)}[aout]`);

  const nome = previa ? `previa_${formato}.mp4` : `${slug(p.empreendimento.nome || p.nome)}_${formato}_${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}.mp4`;
  const destino = projetos.arq(p.id, previa ? 'cache' : 'export', nome);
  const tmpOut = destino.replace('.mp4', '.tmp.mp4');
  await ff([...ins, '-filter_complex', fc.join(';'), '-map', '[vout]', '-map', '[aout]', '-t', lay.total.toFixed(3), ...codec(preset, previa), ...AAC(preset.export.audioKbps), '-movflags', '+faststart', tmpOut],
    { tag: 'composição final', sinal: ctx.sinal, aoTempo: t => prog(60 + 38 * t / lay.total) });
  fs.renameSync(tmpOut, destino);

  // 4) validacao real do arquivo
  const info = await probe(destino);
  const validacao = { largura: info.w, altura: info.h, duracao: +info.dur.toFixed(2), esperado: +lay.total.toFixed(2), video: info.vcodec, audio: info.acodec, fps: info.fps };
  validacao.ok = info.w === W && info.h === H && Math.abs(info.dur - lay.total) < 0.35 && info.vcodec === 'h264' && info.acodec === 'aac';
  ctx.log(`${validacao.ok ? '✅' : '⚠'} Validação: ${info.w}x${info.h}, ${info.dur.toFixed(2)}s (esperado ${lay.total.toFixed(2)}s), ${info.vcodec}/${info.acodec}`);
  const rel = path.relative(projetos.dir(id), destino).replace(/\\/g, '/');
  const extras = {};
  if (!previa) {
    const capa = destino.replace('.mp4', '_capa.jpg');
    await ff(['-ss', Math.min(1, lay.total / 3).toFixed(2), '-i', destino, '-frames:v', '1', '-q:v', '2', capa], { tag: 'capa' }).catch(() => {});
    if (fs.existsSync(capa)) extras.capa = path.relative(projetos.dir(id), capa).replace(/\\/g, '/');
    if (p.legendas.grupos.length) { const s = destino.replace('.mp4', '.srt'); fs.writeFileSync(s, ASS.srt(p.legendas.grupos)); extras.srt = path.relative(projetos.dir(id), s).replace(/\\/g, '/'); }
    await projetos.alterar(id, pp => { pp.exportacoes = pp.exportacoes || []; pp.exportacoes.unshift({ arquivo: rel, formato, criado: new Date().toISOString(), validacao, ...extras }); });
  }
  prog(100);
  return { arquivo: rel, formato, previa, validacao, ...extras };
}

module.exports = { renderizar };

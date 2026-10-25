// Motor de edicao: normaliza clipes/fotos/PDF, corta pausas, entende o contexto, sobrepoe o Paulo, legenda e exporta em todos os formatos.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const legendas = require('./legendas');
const contexto = require('./contexto');

const FFMPEG = process.env.FFMPEG_PATH || require('ffmpeg-static');
const FFPROBE = process.env.FFPROBE_PATH || require('ffprobe-static').path;
const W = 1080, H = 1920, FPS = 30;
const FIM_SEG = 3.5; // duracao do cartao final
const TD = 0.35; // duracao das transicoes
const SITE = 'https://paulocotrim.com.br/';
const FORMATOS = {
  '9x16': { w: 1080, h: 1920, nome: 'Reels-TikTok-Shorts' },
  '4x5': { w: 1080, h: 1350, nome: 'Feed-Instagram' },
  '1x1': { w: 1080, h: 1080, nome: 'Quadrado-Facebook' },
  '16x9': { w: 1920, h: 1080, nome: 'YouTube-Horizontal' }
};
const IMG = /\.(jpe?g|png|webp|bmp)$/i;
const X264 = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(FPS)];
const AAC = ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2'];
const ASSET = f => path.join(__dirname, 'assets', f);

function run(bin, args, log) {
  return new Promise((ok, fail) => {
    const p = spawn(bin, args, { windowsHide: true });
    let err = '';
    p.stderr.on('data', d => { err += d; if (err.length > 200000) err = err.slice(-100000); });
    p.on('error', fail);
    p.on('close', c => c === 0 ? ok(err) : fail(new Error((log || 'ffmpeg') + ' falhou:\n' + err.slice(-1500))));
  });
}
const ff = (args, tag) => run(FFMPEG, ['-hide_banner', '-y', ...args], tag);

async function probe(file) {
  const out = await new Promise((ok, fail) => {
    const p = spawn(FFPROBE, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file], { windowsHide: true });
    let s = ''; p.stdout.on('data', d => s += d); p.on('error', fail); p.on('close', () => ok(s));
  });
  if (!out) throw new Error('nao consegui ler o arquivo ' + path.basename(file));
  const j = JSON.parse(out);
  const v = (j.streams || []).find(s => s.codec_type === 'video') || {};
  let w = v.width || W, h = v.height || H;
  const rot = Math.abs(parseInt((v.tags && v.tags.rotate) || ((v.side_data_list || [])[0] || {}).rotation || 0));
  if (rot === 90 || rot === 270) [w, h] = [h, w];
  return { dur: parseFloat((j.format || {}).duration) || 0, w, h, audio: (j.streams || []).some(s => s.codec_type === 'audio') };
}

// Melhorias de imagem: contraste, cor viva, nitidez e vinheta leve (look "imobiliario profissional")
const GRADE = 'eq=contrast=1.07:saturation=1.2:brightness=0.015:gamma=1.03,unsharp=5:5:0.7:5:5:0,vignette=angle=PI/6';
const FIT_VERTICAL = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;
// Video horizontal vira vertical com fundo desfocado (sem tarja preta)
const FIT_BLUR = `split[a][b];[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=24:2,eq=brightness=-0.1[bg];[b]scale=${W}:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`;

async function detectarFala(file, dur) {
  const log = await ff(['-i', file, '-vn', '-af', 'silencedetect=noise=-33dB:d=0.45', '-f', 'null', '-'], 'silencedetect');
  const sil = []; let ini = null;
  for (const l of log.split('\n')) {
    let m = l.match(/silence_start: (-?[\d.]+)/); if (m) ini = Math.max(0, +m[1]);
    m = l.match(/silence_end: ([\d.]+)/); if (m && ini !== null) { sil.push([ini, +m[1]]); ini = null; }
  }
  if (ini !== null) sil.push([ini, dur]);
  const PAD = 0.12, manter = []; let t = 0;
  for (const [a, b] of sil) { if (a - t > 0.05) manter.push([Math.max(0, t - PAD), Math.min(dur, a + PAD)]); t = b; }
  if (dur - t > 0.05) manter.push([Math.max(0, t - PAD), dur]);
  const falado = manter.reduce((s, [a, b]) => s + b - a, 0);
  return { manter, falado };
}

async function segmentoVideo(item, out, op, log) {
  const info = await probe(item.arquivo);
  const vertical = info.w / info.h < 0.7;
  let vf = (op.estabilizar ? 'deshake,' : '') + (vertical ? FIT_VERTICAL : FIT_BLUR);
  let af = 'anull', tipo = item.narracao ? 'fala' : 'tour';
  if (info.audio && op.cortarPausas) {
    const { manter, falado } = await detectarFala(item.arquivo, info.dur);
    // So corta se o clipe for "falado" (>=40% fala). Clipe de tour/B-roll fica inteiro.
    if ((item.narracao || falado >= info.dur * 0.4) && manter.length > 1) {
      tipo = 'fala';
      const expr = manter.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join('+');
      vf = `select='${expr}',setpts=N/FRAME_RATE/TB,` + vf;
      af = `aselect='${expr}',asetpts=N/SR/TB`;
      log(`  ✂ pausas cortadas: ${info.dur.toFixed(1)}s → ${falado.toFixed(1)}s`);
    } else if (falado >= info.dur * 0.4) tipo = 'fala';
  }
  // Tour sem fala: acelera 1.25x (ritmo de reels) e silencia o som ambiente (a musica carrega)
  if (tipo === 'tour' && op.acelerarTour) vf += ',setpts=PTS/1.25';
  // Jump cut com "punch-in": clipes de fala alternados ganham zoom 12% (prende a atencao)
  if (tipo === 'fala' && item.indice % 2 && !item.narracao) vf += `,crop=iw/1.12:ih/1.12,scale=${W}:${H}`;
  vf = `fps=${FPS},${vf},${GRADE},setsar=1,format=yuv420p`;
  const args = ['-i', item.arquivo];
  if (!info.audio || tipo === 'tour') {
    args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-filter_complex', `[0:v]${vf}[v]`, '-map', '[v]', '-map', '1:a', '-shortest');
  } else {
    args.push('-filter_complex', `[0:v]${vf}[v];[0:a]${af},aresample=48000[a]`, '-map', '[v]', '-map', '[a]');
  }
  await ff([...args, ...X264, ...AAC, out], 'clipe ' + path.basename(item.arquivo));
  return { tipo, dur: (await probe(out)).dur };
}

// Estilo "Apple": material vira cartao com cantos arredondados e sombra, sobre fundo da marca (PDF) ou desfocado (foto)
async function cartaoPng(item, out, cfg) {
  const R = 38, cw = 940, ch = 1480;
  const bg = item.doc
    ? `color=c=${cfg.cores.petroleo}:s=${W}x${H}:d=1,vignette=angle=PI/4[bg]`
    : `[0]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=30:3,eq=brightness=-0.16:saturation=0.85[bg]`;
  const fc = `${bg};[0]scale=${cw}:${ch}:force_original_aspect_ratio=decrease,format=rgba,` +
    `geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(abs(W/2-X),W/2-${R})*gt(abs(H/2-Y),H/2-${R}),if(lte(hypot(${R}-(W/2-abs(W/2-X)),${R}-(H/2-abs(H/2-Y))),${R}),255,0),255)',split[c1][c2];` +
    `[c2]pad=iw+120:ih+120:60:60:color=black@0,colorchannelmixer=rr=0:gg=0:bb=0:aa=0.6,boxblur=22:2[sh];` +
    `[bg][sh]overlay=(W-w)/2:(H-h)/2+28[b1];[b1][c1]overlay=(W-w)/2:(H-h)/2,format=rgb24`;
  await ff(['-i', item.arquivo, '-filter_complex', fc, '-frames:v', '1', out], 'cartao');
}

async function segmentoFoto(item, out, op, cfg, durForcada) {
  const info = await probe(item.arquivo);
  const d = durForcada || op.tempoFoto || 3.2, n = Math.round(d * FPS);
  let vf, src = item.arquivo, loop = [];
  if (item.doc || op.estiloCartao) {
    src = out.replace(/\.mp4$/, '-card.png');
    await cartaoPng(item, src, cfg);
    // Planta: aproximacao mais forte (o cliente "entra" na planta); demais: zoom suave
    const z = item.categoria === 'planta' ? 0.32 : 0.07;
    vf = `scale=${W * 2}:${H * 2},zoompan=z='1+${z}*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${n}:s=${W}x${H}:fps=${FPS}`;
  } else if (info.w / info.h > 0.8) {
    // Foto horizontal: panoramica lenta mostrando o comodo inteiro
    const dir = item.indice % 2 ? `(iw-${W})*(1-t/${d})` : `(iw-${W})*t/${d}`;
    vf = `scale=-2:${H},crop=${W}:${H}:x='${dir}':y=0,${GRADE}`;
    loop = ['-loop', '1', '-framerate', String(FPS), '-t', String(d)];
  } else {
    // Foto vertical: zoom suave (Ken Burns)
    vf = `scale=${W * 1.5}:${H * 1.5}:force_original_aspect_ratio=increase,crop=${W * 1.5}:${H * 1.5},zoompan=z='1+0.12*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${n}:s=${W}x${H}:fps=${FPS},${GRADE}`;
  }
  await ff([...loop, '-i', src, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
    '-filter_complex', `[0:v]${vf},setsar=1,format=yuv420p[v]`, '-map', '[v]', '-map', '1:a', '-t', String(d), ...X264, ...AAC, out], 'foto');
  return { tipo: 'foto', dur: d };
}

async function cartaoFinal(out, cfg) {
  await ff(['-f', 'lavfi', '-i', `color=c=${cfg.cores.petroleo}:s=${W}x${H}:r=${FPS}:d=${FIM_SEG}`, '-i', ASSET('logo.png'),
    '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
    '-filter_complex', `[0]vignette=angle=PI/4[b];[1]scale=300:-1,format=rgba[l];[b][l]overlay=(W-w)/2:600,fade=in:st=0:d=0.3,format=yuv420p[v]`,
    '-map', '[v]', '-map', '2:a', '-t', String(FIM_SEG), ...X264, ...AAC, out], 'cartao final');
}

// Capa do empreendimento direto do site (catalogo Sawala): usa a copia local do repo ou baixa do site
async function capaDoSite(emp, dir) {
  if (!emp || !emp.img) return null;
  const local = path.join(__dirname, '..', emp.img);
  if (fs.existsSync(local)) return local;
  try {
    const r = await fetch(SITE + emp.img); if (!r.ok) return null;
    const f = path.join(dir, 'capa-site' + path.extname(emp.img)); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); return f;
  } catch { return null; }
}

// Transicoes do mercado (rotativas). Fala->fala = corte seco (jump cut), resto = transicao suave.
const TRANS = ['smoothleft', 'circleopen', 'slideup', 'fadeblack', 'zoomin', 'wipeleft', 'smoothup', 'radial'];
async function juntar(segs, out, comTransicao) {
  const marcas = [], trans = [];
  if (segs.length === 1 || !comTransicao) {
    const lista = path.join(path.dirname(out), 'lista.txt'); let t = 0;
    fs.writeFileSync(lista, segs.map(s => `file '${s.arquivo.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
    for (const s of segs) { if (s.etiqueta) marcas.push({ ini: t, fim: t + s.dur, texto: s.etiqueta }); t += s.dur; }
    await ff(['-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', out], 'juntar');
    return { t, marcas, trans };
  }
  const args = [], fc = []; let cum = segs[0].dur, vl = '[0:v]', al = '[0:a]';
  if (segs[0].etiqueta) marcas.push({ ini: 0, fim: segs[0].dur, texto: segs[0].etiqueta });
  segs.forEach(s => args.push('-i', s.arquivo));
  for (let i = 1; i < segs.length; i++) {
    const a = segs[i - 1], b = segs[i];
    const seco = a.tipo === 'fala' && b.tipo === 'fala';
    const d = seco ? 0.04 : Math.min(TD + 0.1, a.dur / 3, b.dur / 3);
    const tipo = seco ? 'fade' : b.tipo === 'fim' ? 'fadeblack' : TRANS[i % TRANS.length];
    const off = Math.max(0, cum - d);
    fc.push(`${vl}[${i}:v]xfade=transition=${tipo}:duration=${d.toFixed(3)}:offset=${off.toFixed(3)}[v${i}]`);
    fc.push(`${al}[${i}:a]acrossfade=d=${d.toFixed(3)}[a${i}]`);
    if (b.etiqueta) marcas.push({ ini: off, fim: off + b.dur, texto: b.etiqueta });
    if (!seco) trans.push(off + d / 2);
    vl = `[v${i}]`; al = `[a${i}]`; cum = off + b.dur;
  }
  await ff([...args, '-filter_complex', fc.join(';'), '-map', vl, '-map', al, ...X264, ...AAC, out], 'transicoes');
  return { t: cum, marcas, trans };
}

async function transcreverArquivo(video, job, cfg, log) {
  if (!job.opcoes.legendas) return [];
  try {
    const raw = path.join(job.dir, 'audio.f32');
    await ff(['-i', video, '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', raw], 'extrair audio');
    log('🗣 Transcrevendo sua fala (IA local Whisper)... 1a vez baixa o modelo');
    const p = await legendas.transcrever(raw, cfg, log);
    log(`✅ ${p.length} palavras reconhecidas`);
    return p;
  } catch (e) { log('⚠ Legenda automatica falhou (' + e.message.split('\n')[0] + '). Seguindo sem legenda.'); return []; }
}

// Fichas animadas (dados reais: catalogo do site + PDF + o que o Paulo digitou)
function montarFichas(op, fatos) {
  const e = op.emp || {}, f = [];
  const nome = op.titulo || e.nome, local = op.bairro || e.local;
  if (nome) f.push({ t: nome.toUpperCase(), s: local || '' });
  const pl = e.plantas || [fatos.quartos, fatos.metragem].filter(Boolean).join(' · ');
  if (pl) f.push({ t: pl.split('·')[0].trim(), s: (pl.split('·')[1] || '').trim() });
  if (e.status || e.incorporadora) f.push({ t: e.status || '', s: e.incorporadora ? 'por ' + e.incorporadora : '' });
  if (op.preco) f.push({ t: 'a partir de', s: op.preco });
  f.push({ t: 'Financiamento CAIXA', s: 'FGTS • análise em até 48h úteis' });
  return f;
}

// ETAPA 1: monta o corte (sem texto) + transcreve
async function preparar(job, cfg, log) {
  const op = job.opcoes, dir = job.dir;
  if (op.emp) { op.titulo = op.titulo || op.emp.nome; op.bairro = op.bairro || op.emp.local; }
  let itens = [], fatos = {};
  for (const a of job.arquivos.slice().sort((a, b) => a.ordem - b.ordem)) {
    if (/\.pdf$/i.test(a.arquivo)) { const r = await contexto.lerPdf(a, dir, op, log); itens.push(...r.cenas); fatos = { ...r.fatos, ...fatos }; }
    else itens.push({ ...a, categoria: contexto.categoriaDaEtiqueta(a.etiqueta) });
  }
  if (op.capaSite !== false && op.emp) {
    const capa = await capaDoSite(op.emp, dir);
    const pos = itens.findIndex(i => !i.narracao);
    if (capa) { itens.splice(pos < 0 ? itens.length : pos, 0, { arquivo: capa, etiqueta: 'FACHADA', categoria: 'fachada' }); log('🏢 Capa do empreendimento puxada do site'); }
  }
  job.fichas = montarFichas(op, fatos);
  if (fatos.metragem || fatos.quartos) log(`🔎 Do PDF: ${[fatos.quartos, fatos.metragem].filter(Boolean).join(' · ')}`);
  const narr = itens.find(i => i.narracao && !IMG.test(i.arquivo));
  if (op.modo === 'apresentacao' && narr) await prepararApresentacao(job, cfg, log, narr, itens.filter(i => i !== narr));
  else await prepararSequencia(job, cfg, log, itens);
  job.progresso = 60;
}

async function prepararSequencia(job, cfg, log, itens) {
  const op = job.opcoes, dir = job.dir, segs = [];
  for (let i = 0; i < itens.length; i++) {
    const it = { ...itens[i], indice: i };
    const out = path.join(dir, `seg${String(i).padStart(3, '0')}.mp4`);
    log(`🎬 ${i + 1}/${itens.length} ${it.etiqueta || path.basename(it.arquivo)}`);
    const r = IMG.test(it.arquivo) ? await segmentoFoto(it, out, op, cfg) : await segmentoVideo(it, out, op, log);
    segs.push({ arquivo: out, ...r, etiqueta: it.etiqueta });
    job.progresso = Math.round(5 + 40 * (i + 1) / itens.length);
  }
  if (op.cartaoFinal) { const fim = path.join(dir, 'zz-fim.mp4'); await cartaoFinal(fim, cfg); segs.push({ arquivo: fim, tipo: 'fim', dur: FIM_SEG }); }
  const corte = path.join(dir, 'corte.mp4');
  log('🔀 Juntando cenas com transições');
  const { t, marcas, trans } = await juntar(segs, corte, op.transicoes !== false);
  Object.assign(job, { duracao: t, marcas, trans, corte });
  log(`✅ Corte montado: ${t.toFixed(1)}s`);
  const palavras = await transcreverArquivo(corte, job, cfg, log);
  job.grupos = legendas.agrupar(palavras, cfg, op.palavrasPorLegenda || 3).filter(g => !op.cartaoFinal || g.ini < t - FIM_SEG);
}

// MODO APRESENTACAO: sua fala e a trilha; PDF/fotos/videos entram quando voce fala do assunto, com voce em circulo por cima
async function prepararApresentacao(job, cfg, log, narr, materiais) {
  const op = job.opcoes, dir = job.dir;
  log('🎙 Modo Apresentação: tratando sua fala');
  const narrF = path.join(dir, 'narr.mp4');
  const { dur: D } = await segmentoVideo({ ...narr, indice: 0, narracao: true }, narrF, op, log);
  job.progresso = 15;
  const palavras = await transcreverArquivo(narrF, job, cfg, log);
  const tl = contexto.agendar(materiais.map((m, i) => ({ ...m, indice: i })), palavras, D, op);
  log(`🧠 Roteiro: ${tl.filter(s => s.tipo === 'material').length} materiais na tela (${tl.filter(s => s.falado).length} no momento exato em que você fala do assunto)`);
  // mascara circular + aro dourado para o "Paulo em circulo"
  const P = 360, mask = path.join(dir, 'mask.png'), aro = path.join(dir, 'aro.png');
  await ff(['-f', 'lavfi', '-i', `color=black:s=${P}x${P}`, '-vf', `format=gray,geq=lum='if(lte(hypot(X-${P / 2},Y-${P / 2}),${P / 2 - 2}),255,0)'`, '-frames:v', '1', mask], 'mascara');
  await ff(['-f', 'lavfi', '-i', `color=black:s=${P + 20}x${P + 20}`, '-vf', `format=rgba,geq=r=176:g=137:b=91:a='if(between(hypot(X-${P / 2 + 10},Y-${P / 2 + 10}),${P / 2 - 1},${P / 2 + 9}),255,0)'`, '-frames:v', '1', aro], 'aro');
  const segs = []; let k = 0;
  for (let i = 0; i < tl.length; i++) {
    const s = tl[i], ult = i === tl.length - 1 && !op.cartaoFinal;
    const dur = s.b - s.a + (ult ? 0 : TD);
    const out = path.join(dir, `seg${String(i).padStart(3, '0')}.mp4`);
    if (s.tipo === 'paulo') {
      const zoom = k++ % 2 ? `,crop=iw/1.12:ih/1.12,scale=${W}:${H}` : '';
      await ff(['-ss', s.a.toFixed(3), '-t', dur.toFixed(3), '-i', narrF, '-an', '-vf', `tpad=stop_mode=clone:stop_duration=${TD}${zoom},setsar=1`, '-t', dur.toFixed(3), ...X264, out], 'paulo');
    } else {
      const m = { ...s.m }, base = out.replace('.mp4', '-base.mp4');
      log(`🎬 ${m.etiqueta || path.basename(m.arquivo)} em ${s.a.toFixed(1)}s${s.falado ? ' (quando você fala do assunto)' : ''}`);
      if (IMG.test(m.arquivo)) await segmentoFoto(m, base, op, cfg, dur);
      else await segmentoVideo({ ...m, narracao: false }, base, { ...op, cortarPausas: false }, log);
      const pip = op.pip !== false;
      const fc = `[0:v]tpad=stop_mode=clone:stop_duration=${dur.toFixed(2)},trim=duration=${dur.toFixed(3)},setpts=PTS-STARTPTS[b]` + (pip
        ? `;[1:v]crop=${W}:${W}:0:${Math.round(H * 0.08)},scale=${P}:${P},format=rgba[p];[2:v]format=gray,scale=${P}:${P}[mk];[p][mk]alphamerge[pc];` +
          `[b][3:v]overlay=${W - P - 70}:${Math.round(H * 0.5) - 10}[b2];[b2][pc]overlay=${W - P - 60}:${Math.round(H * 0.5)}:shortest=1`
        : '');
      const ins = ['-i', base, ...(pip ? ['-ss', s.a.toFixed(3), '-t', dur.toFixed(3), '-i', narrF, '-loop', '1', '-i', mask, '-loop', '1', '-i', aro] : [])];
      await ff([...ins, '-filter_complex', fc + ',setsar=1,format=yuv420p', '-an', '-t', dur.toFixed(3), ...X264, out], 'sobreposicao');
      for (const f of [base, base.replace('.mp4', '-card.png')]) fs.rmSync(f, { force: true });
    }
    segs.push(out);
    job.progresso = Math.round(15 + 40 * (i + 1) / tl.length);
  }
  if (op.cartaoFinal) { const fim = path.join(dir, 'zz-fim.mp4'); await cartaoFinal(fim, cfg); segs.push(fim); }
  // junta tudo com transicoes (video) e a sua voz continua por baixo, sem cortes
  const T = D + (op.cartaoFinal ? FIM_SEG : 0), fc = [], trans = [];
  let vl = '[0:v]';
  for (let i = 1; i < segs.length; i++) {
    const off = i < tl.length ? tl[i].a : D, tipo = i >= tl.length ? 'fadeblack' : TRANS[i % TRANS.length];
    fc.push(`${vl}[${i}:v]xfade=transition=${tipo}:duration=${TD}:offset=${off.toFixed(3)}[v${i}]`);
    trans.push(off + TD / 2); vl = `[v${i}]`;
  }
  fc.push(`[${segs.length}:a]apad=whole_dur=${T.toFixed(3)}[a]`);
  const corte = path.join(dir, 'corte.mp4');
  log('🔀 Montando a apresentação com transições');
  await ff([...segs.flatMap(f => ['-i', f]), '-i', narrF, '-filter_complex', fc.join(';'), '-map', vl, '-map', '[a]', '-t', T.toFixed(3), ...X264, ...AAC, corte], 'apresentacao');
  const marcas = tl.filter(s => s.tipo === 'material' && s.m.etiqueta).map(s => ({ ini: s.a, fim: s.b, texto: s.m.etiqueta }));
  Object.assign(job, { duracao: T, marcas, trans, corte });
  job.grupos = legendas.agrupar(palavras, cfg, op.palavrasPorLegenda || 3);
  log(`✅ Apresentação montada: ${T.toFixed(1)}s`);
}

// ETAPA 2: audio (voz limpa + musica com ducking + whoosh nas transicoes) e exportacao por formato
async function renderizar(job, cfg, log) {
  const op = job.opcoes, dir = job.dir;
  const master = path.join(dir, 'master.mp4');
  const voz = 'highpass=f=80,afftdn=nf=-25,acompressor=threshold=-18dB:ratio=3:attack=5:release=120';
  const musica = op.musica && fs.existsSync(path.join(__dirname, 'musicas', op.musica)) ? path.join(__dirname, 'musicas', op.musica) : null;
  const dur = job.duracao, ins = ['-i', job.corte], fc = [], mix = ['[vz]'];
  fc.push(`[0:a]${voz}${musica ? ',asplit=2[vz][sc]' : '[vz]'}`);
  if (musica) {
    ins.push('-stream_loop', '-1', '-i', musica);
    fc.push(`[1:a]volume=${op.volumeMusica || 0.22},atrim=0:${dur},afade=in:d=0.5,afade=out:st=${Math.max(0, dur - 2)}:d=2,aresample=48000,aformat=channel_layouts=stereo[m];[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md]`);
    mix.push('[md]');
  }
  const trans = op.efeitosSonoros !== false ? (job.trans || []).filter(t => t > 0.3 && t < dur - 0.3) : [];
  if (trans.length) {
    ins.push('-f', 'lavfi', '-t', '0.5', '-i', 'anoisesrc=d=0.5:c=pink:a=0.6:r=48000');
    fc.push(`[${musica ? 2 : 1}:a]highpass=f=500,lowpass=f=6000,afade=in:d=0.22,afade=out:st=0.25:d=0.25,volume=0.35,aformat=channel_layouts=stereo,asplit=${trans.length}${trans.map((_, i) => `[w${i}]`).join('')}`);
    trans.forEach((t, i) => { const ms = Math.max(0, Math.round((t - 0.25) * 1000)); fc.push(`[w${i}]adelay=${ms}|${ms}[d${i}]`); });
    fc.push(`${trans.map((_, i) => `[d${i}]`).join('')}amix=inputs=${trans.length}:normalize=0[wh]`);
    mix.push('[wh]');
  }
  fc.push(`${mix.join('')}${mix.length > 1 ? `amix=inputs=${mix.length}:duration=first:normalize=0,` : 'anull,'}loudnorm=I=-14:TP=-1.5:LRA=11[a]`);
  log(`🎵 Áudio: voz limpa${musica ? ' + música com abaixamento na fala' : ''}${trans.length ? ` + ${trans.length} efeitos de transição` : ''}`);
  await ff([...ins, '-filter_complex', fc.join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', ...AAC, '-t', String(dur), master], 'mixagem');
  job.progresso = 68;
  const slug = (op.titulo || (op.emp && op.emp.nome) || 'video').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'video';
  const saidas = [];
  const formatos = (op.formatos && op.formatos.length ? op.formatos : Object.keys(FORMATOS));
  for (let i = 0; i < formatos.length; i++) {
    const f = FORMATOS[formatos[i]]; if (!f) continue;
    const ass = path.join(dir, `leg-${formatos[i]}.ass`);
    fs.writeFileSync(ass, legendas.gerarASS(job, cfg, f.w, f.h, FIM_SEG));
    let base;
    if (f.w > f.h) base = `split[a][b];[a]scale=${f.w}:${f.h}:force_original_aspect_ratio=increase,crop=${f.w}:${f.h},boxblur=30:2,eq=brightness=-0.12[bg];[b]scale=-2:${f.h}[fg];[bg][fg]overlay=(W-w)/2:0`;
    else base = `crop=${W}:${f.h}:0:${Math.round((H - f.h) / 2)}`;
    const lw = Math.round(Math.min(f.w, f.h) * 0.095);
    const assEsc = ass.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
    const out = path.join(dir, `${slug}_${formatos[i]}_${f.nome}.mp4`);
    // Barra de progresso no topo (retencao: o cliente ve quanto falta)
    const fimC = (op.cartaoFinal ? dur - FIM_SEG : dur).toFixed(2);
    const barra = op.barraProgresso === false ? '' : `,drawbox=x=0:y=0:w='iw*t/${fimC}':h=${Math.max(6, Math.round(f.h * 0.006))}:color=${cfg.cores.verde}:t=fill:enable='lt(t,${fimC})'`;
    log(`📤 Exportando ${formatos[i]} (${f.nome})`);
    await ff(['-i', master, '-i', ASSET('logo.png'), '-filter_complex',
      `[0:v]${base}[b];[1]scale=${lw}:-1,format=rgba,colorchannelmixer=aa=0.9[l];[b][l]overlay=W-w-${Math.round(lw * 0.35)}:${Math.round(lw * 0.45)}:enable='lt(t,${fimC})'${barra},subtitles='${assEsc}'[v]`,
      '-map', '[v]', '-map', '0:a', ...X264, '-c:a', 'copy', '-movflags', '+faststart', out], 'exportar ' + formatos[i]);
    saidas.push(path.basename(out));
    job.progresso = Math.round(68 + 28 * (i + 1) / formatos.length);
  }
  // Capa (thumbnail) com o gancho na tela
  const v916 = saidas.find(s => s.includes('_9x16_')) || saidas[0];
  if (v916) {
    const capa = `${slug}_capa.jpg`;
    await ff(['-ss', '0.8', '-i', path.join(dir, v916), '-frames:v', '1', '-q:v', '2', path.join(dir, capa)], 'capa');
    saidas.push(capa);
  }
  fs.writeFileSync(path.join(dir, `${slug}_legendas.srt`), legendas.gerarSRT(job.grupos)); saidas.push(`${slug}_legendas.srt`);
  fs.writeFileSync(path.join(dir, `${slug}_texto-do-post.txt`), legendas.textoPost(op, cfg)); saidas.push(`${slug}_texto-do-post.txt`);
  // limpa temporarios
  for (const f of fs.readdirSync(dir)) if (/^(seg\d+|zz-fim|corte|master|narr)\.mp4$|-card\.png$|^capa-site|^audio\.f32$|^pdf-.*\.png$|^(mask|aro)\.png$|^lista\.txt$|\.ass$/.test(f)) fs.rmSync(path.join(dir, f), { force: true });
  job.saidas = saidas; job.progresso = 100;
  log('🏁 Pronto! Arquivos em: ' + dir);
}

module.exports = { preparar, renderizar, FORMATOS, probe };

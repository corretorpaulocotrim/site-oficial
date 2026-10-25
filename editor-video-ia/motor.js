// Motor de edicao: normaliza clipes/fotos, corta pausas, melhora imagem, legenda e exporta em todos os formatos.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const legendas = require('./legendas');

const FFMPEG = process.env.FFMPEG_PATH || require('ffmpeg-static');
const FFPROBE = process.env.FFPROBE_PATH || require('ffprobe-static').path;
const W = 1080, H = 1920, FPS = 30;
const FIM_SEG = 3.5; // duracao do cartao final
const FORMATOS = {
  '9x16': { w: 1080, h: 1920, nome: 'Reels-TikTok-Shorts' },
  '4x5': { w: 1080, h: 1350, nome: 'Feed-Instagram' },
  '1x1': { w: 1080, h: 1080, nome: 'Quadrado-Facebook' },
  '16x9': { w: 1920, h: 1080, nome: 'YouTube-Horizontal' }
};
const IMG = /\.(jpe?g|png|webp|heic|bmp)$/i;
const X264 = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(FPS)];
const AAC = ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2'];

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
  let af = 'anull', tipo = 'tour';
  if (info.audio && op.cortarPausas) {
    const { manter, falado } = await detectarFala(item.arquivo, info.dur);
    // So corta se o clipe for "falado" (>=40% fala). Clipe de tour/B-roll fica inteiro.
    if (falado >= info.dur * 0.4 && manter.length > 1) {
      tipo = 'fala';
      const expr = manter.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join('+');
      vf = `select='${expr}',setpts=N/FRAME_RATE/TB,` + vf;
      af = `aselect='${expr}',asetpts=N/SR/TB`;
      log(`  ✂ pausas cortadas: ${info.dur.toFixed(1)}s → ${falado.toFixed(1)}s`);
    } else if (falado >= info.dur * 0.4) tipo = 'fala';
  }
  // Tour sem fala: acelera 1.25x (ritmo de reels) e silencia o som ambiente (a musica carrega)
  const acelera = tipo === 'tour' && op.acelerarTour;
  if (acelera) vf += ',setpts=PTS/1.25';
  // Jump cut com "punch-in": clipes de fala alternados ganham zoom 12% (prende a atencao)
  if (tipo === 'fala' && item.indice % 2) vf += `,crop=iw/1.12:ih/1.12,scale=${W}:${H}`;
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

async function segmentoFoto(item, out, op) {
  const info = await probe(item.arquivo);
  const d = op.tempoFoto || 3.2, n = Math.round(d * FPS);
  let vf;
  if (item.doc) {
    // Pagina de PDF/book: inteira (sem cortar texto) sobre fundo desfocado + zoom lento
    vf = `${FIT_BLUR},zoompan=z='1+0.06*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${n}:s=${W}x${H}:fps=${FPS}`;
  } else if (info.w / info.h > 0.8) {
    // Foto horizontal: panoramica lenta da esquerda p/ direita mostrando o comodo inteiro
    const dir = item.indice % 2 ? `(iw-${W})*(1-t/${d})` : `(iw-${W})*t/${d}`;
    vf = `scale=-2:${H},crop=${W}:${H}:x='${dir}':y=0`;
  } else {
    // Foto vertical: zoom suave (Ken Burns)
    vf = `scale=${W * 1.5}:${H * 1.5}:force_original_aspect_ratio=increase,crop=${W * 1.5}:${H * 1.5},zoompan=z='1+0.12*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${n}:s=${W}x${H}:fps=${FPS}`;
  }
  const loop = !item.doc && info.w / info.h > 0.8 ? ['-loop', '1', '-framerate', String(FPS), '-t', String(d)] : [];
  await ff([...loop, '-i', item.arquivo, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
    '-filter_complex', `[0:v]${vf},${GRADE},setsar=1,format=yuv420p[v]`, '-map', '[v]', '-map', '1:a', '-t', String(d), ...X264, ...AAC, out], 'foto');
  return { tipo: 'foto', dur: d };
}

async function cartaoFinal(out, cfg) {
  const logo = path.join(__dirname, 'assets', 'chave.png');
  await ff(['-f', 'lavfi', '-i', `color=c=${cfg.cores.petroleo}:s=${W}x${H}:r=${FPS}:d=${FIM_SEG}`, '-i', logo,
    '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
    '-filter_complex', `[1]scale=300:-1,format=rgba[l];[0][l]overlay=(W-w)/2:600,fade=in:st=0:d=0.3,format=yuv420p[v]`,
    '-map', '[v]', '-map', '2:a', '-t', String(FIM_SEG), ...X264, ...AAC, out], 'cartao final');
}

// PDF (book, tabela, implantacao, planta) vira imagens - 1 pagina = 1 cena
async function paginasPdf(item, dir, op, log) {
  const { pdf } = await import('pdf-to-img');
  const doc = await pdf(item.arquivo, { scale: 2.5 });
  const max = op.maxPaginasPdf || 12, out = []; let n = 0;
  for await (const png of doc) {
    if (n >= max) break;
    const f = path.join(dir, `pdf-${path.basename(item.arquivo, '.pdf').slice(0, 20)}-${String(++n).padStart(2, '0')}.png`);
    fs.writeFileSync(f, png);
    out.push({ ...item, arquivo: f, doc: true });
  }
  log(`📄 PDF ${path.basename(item.arquivo)}: ${n} paginas viraram cenas`);
  return out;
}

// Transicoes do mercado (rotativas). Fala->fala = corte seco (jump cut), resto = transicao suave.
const TRANS = ['smoothleft', 'fadeblack', 'circleopen', 'slideup', 'zoomin', 'wipeleft', 'smoothup', 'radial'];
async function juntar(segs, out, comTransicao) {
  const marcas = [];
  if (segs.length === 1 || !comTransicao) {
    const lista = path.join(path.dirname(out), 'lista.txt'); let t = 0;
    fs.writeFileSync(lista, segs.map(s => `file '${s.arquivo.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
    for (const s of segs) { if (s.etiqueta) marcas.push({ ini: t, fim: t + s.dur, texto: s.etiqueta }); t += s.dur; }
    await ff(['-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', out], 'juntar');
    return { t, marcas };
  }
  const args = [], fc = []; let cum = segs[0].dur, vl = '[0:v]', al = '[0:a]';
  if (segs[0].etiqueta) marcas.push({ ini: 0, fim: segs[0].dur, texto: segs[0].etiqueta });
  segs.forEach(s => args.push('-i', s.arquivo));
  for (let i = 1; i < segs.length; i++) {
    const a = segs[i - 1], b = segs[i];
    const seco = a.tipo === 'fala' && b.tipo === 'fala';
    const d = seco ? 0.04 : Math.min(0.45, a.dur / 3, b.dur / 3);
    const tipo = seco ? 'fade' : b.tipo === 'fim' ? 'fadeblack' : TRANS[i % TRANS.length];
    const off = Math.max(0, cum - d);
    fc.push(`${vl}[${i}:v]xfade=transition=${tipo}:duration=${d.toFixed(3)}:offset=${off.toFixed(3)}[v${i}]`);
    fc.push(`${al}[${i}:a]acrossfade=d=${d.toFixed(3)}[a${i}]`);
    if (b.etiqueta) marcas.push({ ini: off, fim: off + b.dur, texto: b.etiqueta });
    vl = `[v${i}]`; al = `[a${i}]`; cum = off + b.dur;
  }
  await ff([...args, '-filter_complex', fc.join(';'), '-map', vl, '-map', al, ...X264, ...AAC, out], 'transicoes');
  return { t: cum, marcas };
}

async function audioWav(video, out) {
  await ff(['-i', video, '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', out], 'extrair audio');
}

// ETAPA 1: monta o corte (sem texto) + transcreve
async function preparar(job, cfg, log) {
  const op = job.opcoes, dir = job.dir;
  const itens = [];
  for (const a of job.arquivos.slice().sort((a, b) => a.ordem - b.ordem)) {
    if (/\.pdf$/i.test(a.arquivo)) itens.push(...await paginasPdf(a, dir, op, log));
    else itens.push(a);
  }
  const segs = [];
  for (let i = 0; i < itens.length; i++) {
    const it = { ...itens[i], indice: i };
    const out = path.join(dir, `seg${String(i).padStart(3, '0')}.mp4`);
    log(`🎬 ${i + 1}/${itens.length} ${path.basename(it.arquivo)}`);
    const r = IMG.test(it.arquivo) ? await segmentoFoto(it, out, op) : await segmentoVideo(it, out, op, log);
    segs.push({ arquivo: out, ...r, etiqueta: it.etiqueta });
    job.progresso = Math.round(5 + 45 * (i + 1) / itens.length);
  }
  if (op.cartaoFinal) { const fim = path.join(dir, 'zz-fim.mp4'); await cartaoFinal(fim, cfg); segs.push({ arquivo: fim, tipo: 'fim', dur: FIM_SEG }); }
  const corte = path.join(dir, 'corte.mp4');
  log('🔀 Juntando cenas com transicoes');
  const { t, marcas } = await juntar(segs, corte, op.transicoes !== false);
  job.duracao = t; job.marcas = marcas; job.corte = corte;
  log(`✅ Corte montado: ${t.toFixed(1)}s`);
  job.grupos = [];
  if (op.legendas) {
    try {
      const raw = path.join(dir, 'audio.f32');
      await audioWav(corte, raw);
      log('🗣 Transcrevendo fala (IA local Whisper)... 1a vez baixa o modelo (~150MB)');
      const palavras = await legendas.transcrever(raw, cfg, log);
      job.grupos = legendas.agrupar(palavras, cfg, op.palavrasPorLegenda || 3)
        .filter(g => !op.cartaoFinal || g.ini < t - FIM_SEG);
      log(`✅ ${palavras.length} palavras reconhecidas`);
    } catch (e) { log('⚠ Legenda automatica falhou (' + e.message.split('\n')[0] + '). Seguindo sem legenda.'); }
  }
  job.progresso = 60;
}

// ETAPA 2: audio (voz limpa + musica com ducking) e exportacao por formato
async function renderizar(job, cfg, log) {
  const op = job.opcoes, dir = job.dir;
  const master = path.join(dir, 'master.mp4');
  const voz = 'highpass=f=80,afftdn=nf=-25,acompressor=threshold=-18dB:ratio=3:attack=5:release=120';
  const musica = op.musica && fs.existsSync(path.join(__dirname, 'musicas', op.musica)) ? path.join(__dirname, 'musicas', op.musica) : null;
  const dur = job.duracao;
  if (musica) {
    log('🎵 Mixando musica com abaixamento automatico na fala');
    await ff(['-i', job.corte, '-stream_loop', '-1', '-i', musica, '-filter_complex',
      `[0:a]${voz},asplit[v1][v2];[1:a]volume=${op.volumeMusica || 0.22},atrim=0:${dur},afade=in:d=0.5,afade=out:st=${Math.max(0, dur - 2)}:d=2[m];` +
      `[m][v1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];[v2][md]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]`,
      '-map', '0:v', '-map', '[a]', '-c:v', 'copy', ...AAC, '-t', String(dur), master], 'mixagem');
  } else {
    await ff(['-i', job.corte, '-af', `${voz},loudnorm=I=-14:TP=-1.5:LRA=11`, '-c:v', 'copy', ...AAC, master], 'audio');
  }
  job.progresso = 68;
  const slug = (op.titulo || 'video').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'video';
  const logo = path.join(__dirname, 'assets', 'chave.png');
  const saidas = [];
  const formatos = (op.formatos && op.formatos.length ? op.formatos : Object.keys(FORMATOS));
  for (let i = 0; i < formatos.length; i++) {
    const f = FORMATOS[formatos[i]]; if (!f) continue;
    const ass = path.join(dir, `leg-${formatos[i]}.ass`);
    fs.writeFileSync(ass, legendas.gerarASS(job, cfg, f.w, f.h, FIM_SEG));
    let base;
    if (f.w > f.h) base = `split[a][b];[a]scale=${f.w}:${f.h}:force_original_aspect_ratio=increase,crop=${f.w}:${f.h},boxblur=30:2,eq=brightness=-0.12[bg];[b]scale=-2:${f.h}[fg];[bg][fg]overlay=(W-w)/2:0`;
    else base = `crop=${W}:${f.h}:0:${Math.round((H - f.h) / 2)}`;
    const lw = Math.round(Math.min(f.w, f.h) * 0.075);
    const assEsc = ass.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
    const out = path.join(dir, `${slug}_${formatos[i]}_${f.nome}.mp4`);
    // Barra de progresso no topo (retencao: o cliente ve quanto falta)
    const fimC = (op.cartaoFinal ? dur - FIM_SEG : dur).toFixed(2);
    const barra = op.barraProgresso === false ? '' : `,drawbox=x=0:y=0:w='iw*t/${fimC}':h=${Math.max(6, Math.round(f.h * 0.006))}:color=${cfg.cores.verde}:t=fill:enable='lt(t,${fimC})'`;
    log(`📤 Exportando ${formatos[i]} (${f.nome})`);
    await ff(['-i', master, '-i', logo, '-filter_complex',
      `[0:v]${base}[b];[1]scale=${lw}:-1,format=rgba,colorchannelmixer=aa=0.85[l];[b][l]overlay=W-w-${Math.round(lw * 0.45)}:${Math.round(lw * 0.45)}:enable='lt(t,${fimC})'${barra},subtitles='${assEsc}'[v]`,
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
  for (const f of fs.readdirSync(dir)) if (/^(seg\d+|zz-fim|corte|master)\.mp4$|^audio\.f32$|^pdf-.*\.png$|^lista\.txt$|\.ass$/.test(f)) fs.rmSync(path.join(dir, f), { force: true });
  job.saidas = saidas; job.progresso = 100;
  log('🏁 Pronto! Arquivos em: ' + dir);
}

module.exports = { preparar, renderizar, FORMATOS, probe };

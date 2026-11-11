// Recorte do apresentador SEM tela verde: RobustVideoMatting (ONNX) quadro a quadro, com memoria temporal.
// Gera um video-mascara (cinza) alinhado ao original; o render usa a mascara para pôr o corretor sobre o material.
const { spawn } = require('child_process');
const projetos = require('../projetos');
const modelos = require('./modelos');
const { FFMPEG, Cancelado } = require('../midia');

let sessao = null;
async function recortar({ projetoId, midiaId }, ctx) {
  const p = projetos.ler(projetoId), m = p.midias.find(x => x.id === midiaId);
  if (!m || m.tipo !== 'video') throw new Error('Escolha um vídeo do projeto');
  const ort = require('onnxruntime-node');
  if (!sessao) sessao = await ort.InferenceSession.create(await modelos.garantir('rvm', ctx.log), { intraOpNumThreads: Math.max(1, require('os').cpus().length) });
  // resolucao de trabalho: lado maior 672 px, multiplos de 16 (rapido e suficiente para a mascara)
  const k = 672 / Math.max(m.w, m.h), W = Math.max(16, Math.round(m.w * k / 16) * 16), H = Math.max(16, Math.round(m.h * k / 16) * 16);
  const fps = Math.min(30, Math.round(m.fps || 30)), total = Math.max(1, Math.round(m.dur * fps));
  const rel = `midia/${midiaId}_recorte.mp4`, saida = projetos.arq(projetoId, rel);
  const dec = spawn(FFMPEG, ['-v', 'error', '-i', projetos.arq(projetoId, m.arquivo), '-vf', `fps=${fps},scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { windowsHide: true });
  const enc = spawn(FFMPEG, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', `${W}x${H}`, '-r', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', saida], { windowsHide: true });
  const parar = () => { try { dec.kill('SIGKILL'); enc.kill('SIGKILL'); } catch {} };
  if (ctx.sinal) ctx.sinal.addEventListener('abort', parar, { once: true });
  const fimEnc = new Promise((ok, fail) => enc.on('close', c => c === 0 ? ok() : fail(new Error('falha ao gravar a máscara'))));
  const escrever = buf => new Promise(ok => enc.stdin.write(buf) ? ok() : enc.stdin.once('drain', ok));
  const tam = W * H * 3, src = new Float32Array(3 * W * H), area = W * H;
  let rec = [1, 2, 3, 4].map(() => new ort.Tensor('float32', new Float32Array(1), [1, 1, 1, 1]));
  const ratio = new ort.Tensor('float32', new Float32Array([0.4]), [1]);
  let resto = Buffer.alloc(0), n = 0;
  ctx.log(`Recortando ${m.nome}: ${total} quadros em ${W}×${H}`);
  for await (const chunk of dec.stdout) {
    resto = resto.length ? Buffer.concat([resto, chunk]) : chunk;
    while (resto.length >= tam) {
      if (ctx.sinal && ctx.sinal.aborted) { parar(); throw new Cancelado(); }
      for (let i = 0; i < area; i++) { src[i] = resto[i * 3] / 255; src[area + i] = resto[i * 3 + 1] / 255; src[2 * area + i] = resto[i * 3 + 2] / 255; }
      resto = resto.subarray(tam);
      const o = await sessao.run({ src: new ort.Tensor('float32', src, [1, 3, H, W]), r1i: rec[0], r2i: rec[1], r3i: rec[2], r4i: rec[3], downsample_ratio: ratio });
      rec = [o.r1o, o.r2o, o.r3o, o.r4o];
      const a = o.pha.data, g = Buffer.allocUnsafe(area);
      for (let i = 0; i < area; i++) g[i] = Math.max(0, Math.min(255, Math.round(a[i] * 255)));
      await escrever(g);
      if (++n % 15 === 0) ctx.progresso(98 * n / total);
    }
  }
  enc.stdin.end(); await fimEnc;
  if (ctx.sinal && ctx.sinal.aborted) throw new Cancelado();
  if (!n) throw new Error('Nenhum quadro lido do vídeo');
  await projetos.alterar(projetoId, pp => { const x = pp.midias.find(y => y.id === midiaId); if (x) { x.recorte = rel; x.recorteFps = fps; } });
  ctx.log(`Máscara pronta: ${n} quadros`);
  return { quadros: n, arquivo: rel };
}
module.exports = { recortar };

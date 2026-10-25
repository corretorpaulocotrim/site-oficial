// Execucao de ffmpeg/ffprobe com cancelamento (AbortSignal) e progresso; inspecao de midia.
const { spawn } = require('child_process');
const path = require('path');

const FFMPEG = process.env.FFMPEG_PATH || require('ffmpeg-static');
const FFPROBE = process.env.FFPROBE_PATH || require('ffprobe-static').path;

class Cancelado extends Error { constructor() { super('Cancelado pelo usuário'); this.cancelado = true; } }

function run(bin, args, opt = {}) {
  return new Promise((ok, fail) => {
    if (opt.sinal && opt.sinal.aborted) return fail(new Cancelado());
    const p = spawn(bin, args, { windowsHide: true });
    let err = '', out = '';
    const parar = () => { try { p.kill('SIGKILL'); } catch {} };
    if (opt.sinal) opt.sinal.addEventListener('abort', parar, { once: true });
    const timer = opt.timeoutMs ? setTimeout(parar, opt.timeoutMs) : null;
    if (opt.entrada) { p.stdin.on('error', () => {}); p.stdin.end(opt.entrada); }
    p.stdout.on('data', d => { if (opt.stdout) out += d; });
    p.stderr.on('data', d => {
      const s = String(d); err += s; if (err.length > 400000) err = err.slice(-200000);
      if (opt.aoTempo) { const m = s.match(/time=(\d+):(\d+):([\d.]+)/g); if (m) { const t = m[m.length - 1].match(/(\d+):(\d+):([\d.]+)/); opt.aoTempo(+t[1] * 3600 + +t[2] * 60 + +t[3]); } }
    });
    p.on('error', fail);
    p.on('close', c => {
      if (timer) clearTimeout(timer);
      if (opt.sinal) opt.sinal.removeEventListener('abort', parar);
      if (opt.sinal && opt.sinal.aborted) return fail(new Cancelado());
      c === 0 ? ok(opt.stdout ? out : err) : fail(new Error((opt.tag || path.basename(bin)) + ' falhou (código ' + c + '):\n' + err.slice(-2000)));
    });
  });
}
const ff = (args, opt = {}) => run(FFMPEG, ['-hide_banner', '-y', ...args], opt);

async function probe(file) {
  const out = await run(FFPROBE, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file], { stdout: true, timeoutMs: 60000 });
  const j = JSON.parse(out || '{}');
  const v = (j.streams || []).find(s => s.codec_type === 'video') || null;
  const a = (j.streams || []).find(s => s.codec_type === 'audio') || null;
  let w = v ? v.width : 0, h = v ? v.height : 0;
  const rot = v ? Math.abs(parseInt((v.tags && v.tags.rotate) || ((v.side_data_list || [])[0] || {}).rotation || 0)) : 0;
  if (rot === 90 || rot === 270) [w, h] = [h, w];
  const fr = v && v.avg_frame_rate ? v.avg_frame_rate.split('/').map(Number) : [0, 1];
  const fmt = (j.format && j.format.format_name) || '';
  const imagem = /image2|png_pipe|jpeg_pipe|webp_pipe|bmp_pipe|tiff_pipe|gif/.test(fmt) && !(+(j.format || {}).duration > 0.2);
  return {
    dur: parseFloat((j.format || {}).duration) || 0, w, h, fps: fr[1] ? +(fr[0] / fr[1]).toFixed(2) : 0,
    audio: !!a, video: !!v, imagem, vcodec: v && v.codec_name, acodec: a && a.codec_name, formato: fmt
  };
}

module.exports = { FFMPEG, FFPROBE, run, ff, probe, Cancelado };

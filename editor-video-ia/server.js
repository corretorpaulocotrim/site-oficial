// Atlas Editor de Video - servidor local. Rode: node server.js  (abre http://localhost:3333)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const motor = require('./motor');
const legendas = require('./legendas');

const PORTA = process.env.PORT || 3333;
const SAIDA = path.join(__dirname, 'saida');
const cfg = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const jobs = {};
let fila = Promise.resolve(); // um video por vez (ffmpeg ja usa todos os nucleos)

const json = (res, obj, code = 200) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
const corpo = req => new Promise((ok, fail) => { let s = ''; req.on('data', d => s += d); req.on('end', () => { try { ok(JSON.parse(s || '{}')); } catch (e) { fail(e); } }); });
const publico = j => ({ id: j.id, fase: j.fase, progresso: j.progresso, log: j.log.slice(-60), saidas: j.saidas || [], grupos: j.fase === 'revisao' ? j.grupos.map(g => g.palavras.map(p => p.t).join(' ')) : undefined, erro: j.erro });

function novoJob() {
  const d = new Date(), id = d.toISOString().slice(0, 19).replace(/[T:]/g, '-') + '-' + Math.random().toString(36).slice(2, 6);
  const dir = path.join(SAIDA, id);
  fs.mkdirSync(path.join(dir, 'entrada'), { recursive: true });
  return jobs[id] = { id, dir, arquivos: [], fase: 'enviando', progresso: 0, log: [] };
}

function executar(job, etapa) {
  const log = m => { job.log.push(m); console.log(`[${job.id.slice(-4)}] ${m}`); };
  fila = fila.then(async () => {
    try {
      if (etapa === 'preparar') {
        job.fase = 'processando';
        await motor.preparar(job, cfg(), log);
        if (job.opcoes.revisar && job.grupos.length) { job.fase = 'revisao'; log('✍ Revise as legendas e clique em Renderizar'); return; }
      }
      job.fase = 'renderizando';
      await motor.renderizar(job, cfg(), log);
      job.fase = 'pronto';
    } catch (e) { job.fase = 'erro'; job.erro = e.message; log('❌ ' + e.message); }
  });
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'), p = decodeURIComponent(u.pathname);
  try {
    if (req.method === 'GET' && (p === '/' || p === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return fs.createReadStream(path.join(__dirname, 'public', 'index.html')).pipe(res);
    }
    if (p === '/api/config') return json(res, { config: cfg(), musicas: fs.readdirSync(path.join(__dirname, 'musicas')).filter(f => /\.(mp3|m4a|wav|aac)$/i.test(f)), formatos: motor.FORMATOS });
    if (p === '/api/job' && req.method === 'POST') return json(res, { id: novoJob().id });
    let m = p.match(/^\/api\/job\/([\w-]+)(\/\w+)?$/);
    if (m) {
      const job = jobs[m[1]]; if (!job) return json(res, { erro: 'job nao encontrado' }, 404);
      const acao = m[2];
      if (acao === '/upload' && req.method === 'POST') {
        const nome = path.basename(u.searchParams.get('nome') || 'arquivo').replace(/[^\w.\-]/g, '_');
        const destino = path.join(job.dir, 'entrada', `${String(job.arquivos.length).padStart(3, '0')}_${nome}`);
        await new Promise((ok, fail) => req.pipe(fs.createWriteStream(destino)).on('finish', ok).on('error', fail));
        job.arquivos.push({ arquivo: destino, ordem: +u.searchParams.get('ordem') || job.arquivos.length, etiqueta: u.searchParams.get('etiqueta') || '' });
        return json(res, { ok: true });
      }
      if (acao === '/iniciar' && req.method === 'POST') { job.opcoes = await corpo(req); executar(job, 'preparar'); return json(res, { ok: true }); }
      if (acao === '/legendas' && req.method === 'POST') {
        const { linhas } = await corpo(req); job.grupos = legendas.aplicarEdicao(job.grupos, linhas || []); executar(job, 'renderizar'); return json(res, { ok: true });
      }
      if (acao === '/abrir') { const c = process.platform === 'win32' ? `explorer "${job.dir}"` : process.platform === 'darwin' ? `open "${job.dir}"` : `xdg-open "${job.dir}"`; exec(c); return json(res, { ok: true }); }
      return json(res, publico(job));
    }
    m = p.match(/^\/saida\/([\w-]+)\/([^/]+)$/);
    if (m && jobs[m[1]]) {
      const f = path.join(jobs[m[1]].dir, path.basename(m[2]));
      if (fs.existsSync(f)) {
        const tipo = f.endsWith('.mp4') ? 'video/mp4' : f.endsWith('.jpg') ? 'image/jpeg' : 'text/plain; charset=utf-8';
        res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': fs.statSync(f).size, ...(u.searchParams.has('dl') ? { 'Content-Disposition': `attachment; filename="${path.basename(f)}"` } : {}) });
        return fs.createReadStream(f).pipe(res);
      }
    }
    json(res, { erro: 'nao encontrado' }, 404);
  } catch (e) { json(res, { erro: e.message }, 500); }
}).listen(PORTA, '127.0.0.1', () => {
  const url = `http://localhost:${PORTA}`;
  console.log(`\n  🎬 Atlas Editor de Video rodando em ${url}\n  (deixe esta janela aberta; feche para encerrar)\n`);
  if (!process.env.NO_OPEN) exec(process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`);
});

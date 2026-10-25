// Paulo Cotrim AI Studio — servidor HTTP (sem framework): API, arquivos com Range (seek no player), login e fila de tarefas.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const cfg = require('./config');
const jobs = require('./jobs');
const projetos = require('./projetos');
const presets = require('./presets');
const marca = require('./marca');
const sfx = require('./render/sfx');
const { renderizar } = require('./render/render');
const diretor = require('./ia/diretor');
const llm = require('./ia/llm');
const tts = require('./ia/tts');
const Modelo = require('../public/js/modelo');
const { FFMPEG, run } = require('./midia');

// ---------- tarefas ----------
jobs.registrar('render', (p, ctx) => renderizar(p.projetoId, p, ctx));
jobs.registrar('autoedit', diretor.autoEdit);
jobs.registrar('pdf', diretor.processarPdf);
jobs.registrar('transcrever', diretor.transcreverProjeto);
jobs.registrar('proxy', (p, ctx) => projetos.gerarProxy(p.projetoId, p.midiaId, ctx));
jobs.registrar('tts', async ({ projetoId, texto }, ctx) => {
  const rel = `midia/tts_${Date.now()}.mp3`;
  ctx.log('Gerando voz sintética (ElevenLabs)…');
  await tts.sintetizar(texto, projetos.arq(projetoId, rel));
  const { probe } = require('./midia'); const i = await probe(projetos.arq(projetoId, rel));
  const m = { id: Modelo.uid('m'), tipo: 'audio', nome: 'Narração sintética', arquivo: rel, dur: i.dur, audio: true, narracaoSintetica: true, ia: true };
  await projetos.alterar(projetoId, p => { p.midias.push(m); p.ia = { ...p.ia, conteudoGerado: true, notas: (p.ia.notas || '') + ' Narração gerada por IA (ElevenLabs).' }; });
  return { midia: m.id };
});

// ---------- catalogo do site ----------
let _cat = null;
function catalogo() {
  if (_cat) return _cat;
  for (const f of [cfg.CATALOGO_LOCAL, path.join(cfg.RAIZ, 'catalogo.json')]) { try { _cat = JSON.parse(fs.readFileSync(f, 'utf8')).itens || []; if (_cat.length) return _cat; } catch {} }
  return _cat = [];
}
fetch(cfg.SITE + 'data/catalogo.json').then(r => r.ok && r.json()).then(d => { if (d && d.itens && d.itens.length) { _cat = d.itens; fs.writeFileSync(path.join(cfg.RAIZ, 'catalogo.json'), JSON.stringify(d)); } }).catch(() => {});

// ---------- autenticacao (obrigatoria fora do localhost) ----------
const sessoes = new Map();
const autenticado = req => {
  if (!cfg.SENHA) return true;
  const c = (req.headers.cookie || '').match(/pcs=([a-f0-9]{48})/);
  return !!(c && sessoes.has(c[1]) && sessoes.get(c[1]) > Date.now());
};

// ---------- utilitarios http ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm', '.m4v': 'video/mp4', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.aac': 'audio/aac', '.srt': 'text/plain; charset=utf-8', '.ttf': 'font/ttf', '.pdf': 'application/pdf' };
const json = (res, obj, code = 200) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const erro = (res, msg, code = 400) => json(res, { erro: msg }, code);
const corpo = (req, max = 20e6) => new Promise((ok, fail) => { let s = ''; req.on('data', d => { s += d; if (s.length > max) { req.destroy(); fail(new Error('Corpo grande demais')); } }); req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch { fail(new Error('JSON inválido')); } }); });

function servirArquivo(req, res, arq, download) {
  let st; try { st = fs.statSync(arq); } catch { return erro(res, 'arquivo não encontrado', 404); }
  if (!st.isFile()) return erro(res, 'arquivo não encontrado', 404);
  const tipo = MIME[path.extname(arq).toLowerCase()] || 'application/octet-stream';
  const h = { 'Content-Type': tipo, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
  if (download) h['Content-Disposition'] = `attachment; filename="${path.basename(arq).replace(/"/g, '')}"`;
  const r = req.headers.range && req.headers.range.match(/bytes=(\d*)-(\d*)/);
  if (r) {
    const ini = r[1] ? +r[1] : st.size - +r[2], fim = r[1] && r[2] ? Math.min(+r[2], st.size - 1) : st.size - 1;
    if (ini >= st.size || ini < 0) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
    res.writeHead(206, { ...h, 'Content-Range': `bytes ${ini}-${fim}/${st.size}`, 'Content-Length': fim - ini + 1 });
    return fs.createReadStream(arq, { start: ini, end: fim }).pipe(res);
  }
  res.writeHead(200, { ...h, 'Content-Length': st.size });
  fs.createReadStream(arq).pipe(res);
}
function estatico(req, res, base, rel) {
  const f = path.resolve(base, '.' + path.sep + rel);
  if (!f.startsWith(path.resolve(base) + path.sep)) return erro(res, 'proibido', 403);
  servirArquivo(req, res, f);
}

// ---------- rotas ----------
const R = [];
const rota = (metodo, padrao, fn) => R.push([metodo, padrao, fn]);
const exige = (cond, msg) => { if (!cond) throw Object.assign(new Error(msg), { status: 400 }); };
const projetoOk = id => { if (!projetos.existe(id)) throw Object.assign(new Error('Projeto não encontrado'), { status: 404 }); };

rota('POST', /^\/api\/login$/, async (req, res) => {
  const { senha } = await corpo(req);
  const ok = cfg.SENHA && typeof senha === 'string' && senha.length === cfg.SENHA.length && crypto.timingSafeEqual(Buffer.from(senha), Buffer.from(cfg.SENHA));
  if (!ok) { await new Promise(r => setTimeout(r, 800)); return erro(res, 'Senha incorreta', 401); }
  const tok = crypto.randomBytes(24).toString('hex'); sessoes.set(tok, Date.now() + 7 * 864e5);
  res.writeHead(200, { 'Set-Cookie': `pcs=${tok}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${7 * 86400}`, 'Content-Type': 'application/json' }); res.end('{"ok":true}');
});
rota('GET', /^\/api\/status$/, async (req, res) => {
  let ffv = ''; try { ffv = (await run(FFMPEG, ['-version'], { stdout: true, timeoutMs: 10000 })).split('\n')[0]; } catch (e) { ffv = 'ERRO: ' + e.message; }
  const modeloBaixado = fs.existsSync(cfg.MODELOS) && fs.readdirSync(cfg.MODELOS).some(f => /whisper/i.test(f) || fs.existsSync(path.join(cfg.MODELOS, f, 'config.json')));
  json(res, {
    versao: require('../package.json').version, ffmpeg: ffv, node: process.version, dados: cfg.DADOS, autenticacao: !!cfg.SENHA,
    recursos: {
      edicao: { ativo: true, tipo: 'local' }, render: { ativo: true, tipo: 'local (FFmpeg)' },
      transcricao: { ativo: true, tipo: 'local (Whisper)', modelo: cfg.WHISPER_MODELO, baixado: modeloBaixado },
      ocr: { ativo: cfg.OCR, tipo: 'local (Tesseract, português)' },
      roteiroIA: { ativo: llm.disponivel(), tipo: 'Claude (opcional, pago por uso)', modelo: cfg.ANTHROPIC_MODELO },
      vozIA: { ativo: tts.disponivel(), tipo: 'ElevenLabs (opcional, pago)' }
    },
    fornecedores: tts.FORNECEDORES
  });
});
rota('GET', /^\/api\/catalogo$/, (req, res) => json(res, catalogo()));
rota('GET', /^\/api\/marca$/, (req, res) => json(res, marca.obter()));
rota('PUT', /^\/api\/marca$/, async (req, res) => json(res, marca.salvar(await corpo(req))));
rota('POST', /^\/api\/marca\/logo\/(monograma|assinatura)$/, async (req, res, m) => {
  exige(/image\/png/.test(req.headers['content-type'] || ''), 'Envie um PNG (com fundo transparente)');
  const dir = path.join(cfg.DADOS, 'marca'); fs.mkdirSync(dir, { recursive: true });
  const nome = m[1] === 'monograma' ? 'logo-usuario.png' : 'assinatura-usuario.png';
  await new Promise((ok, fail) => req.pipe(fs.createWriteStream(path.join(dir, nome))).on('finish', ok).on('error', fail));
  const atual = marca.obter(); marca.salvar({ logos: { ...atual.logos, [m[1]]: nome } });
  json(res, { ok: true });
});
rota('GET', /^\/api\/marca\/logo\/(monograma|assinatura)$/, (req, res, m) => servirArquivo(req, res, marca.caminhoLogo(m[1])));

rota('GET', /^\/api\/presets$/, (req, res) => json(res, presets.listar()));
rota('POST', /^\/api\/presets$/, async (req, res) => json(res, presets.salvar(await corpo(req))));
rota('GET', /^\/api\/presets\/([\w-]+)$/, (req, res, m) => json(res, presets.obter(m[1])));
rota('PUT', /^\/api\/presets\/([\w-]+)$/, async (req, res, m) => json(res, presets.salvar({ ...(await corpo(req)), id: m[1] })));
rota('POST', /^\/api\/presets\/([\w-]+)\/duplicar$/, (req, res, m) => json(res, presets.duplicar(m[1])));
rota('DELETE', /^\/api\/presets\/([\w-]+)$/, (req, res, m) => { presets.excluir(m[1]); json(res, { ok: true }); });
rota('GET', /^\/api\/efeitos$/, (req, res) => json(res, {
  transicoes: Modelo.TRANSICOES, movimentos: Modelo.MOVIMENTOS, enquadramentos: Modelo.ENQUADRAMENTOS, sons: sfx.lista(),
  animacoes: ['pop', 'subir', 'fade', 'nenhuma'], textos: Modelo.TEXTO_TIPOS, emojis: Modelo.EMOJIS.map(([ws, c]) => ({ codigo: c, palavras: ws })),
  favoritos: (() => { try { return JSON.parse(fs.readFileSync(path.join(cfg.DADOS, 'favoritos.json'), 'utf8')); } catch { return []; } })()
}));
rota('PUT', /^\/api\/efeitos\/favoritos$/, async (req, res) => { const f = await corpo(req); exige(Array.isArray(f), 'lista esperada'); fs.writeFileSync(path.join(cfg.DADOS, 'favoritos.json'), JSON.stringify(f.slice(0, 200))); json(res, f); });
rota('GET', /^\/api\/sfx\/([\w-]+)$/, async (req, res, m) => { await sfx.garantir(); const f = sfx.caminho(m[1]); f ? servirArquivo(req, res, f) : erro(res, 'efeito não existe', 404); });

rota('GET', /^\/api\/projetos$/, (req, res) => json(res, projetos.listar()));
rota('POST', /^\/api\/projetos$/, async (req, res) => { const d = await corpo(req); json(res, projetos.criar(d)); });
rota('GET', /^\/api\/projetos\/(\w+)$/, (req, res, m) => { projetoOk(m[1]); json(res, projetos.ler(m[1])); });
rota('PUT', /^\/api\/projetos\/(\w+)$/, async (req, res, m) => {
  projetoOk(m[1]); const p = await corpo(req);
  exige(p && Array.isArray(p.principal) && Array.isArray(p.midias), 'Projeto inválido');
  if (p.atualizado && projetos.ler(m[1]).atualizado > p.atualizado && !req.headers['x-forcar']) return json(res, { erro: 'conflito', atual: projetos.ler(m[1]) }, 409);
  const s = projetos.salvar(m[1], p, { versao: req.headers['x-versao'] === '1' });
  json(res, { ok: true, atualizado: s.atualizado });
});
rota('DELETE', /^\/api\/projetos\/(\w+)$/, (req, res, m) => { projetoOk(m[1]); projetos.excluir(m[1]); json(res, { ok: true }); });
rota('POST', /^\/api\/projetos\/(\w+)\/duplicar$/, (req, res, m) => { projetoOk(m[1]); json(res, projetos.duplicar(m[1])); });
rota('GET', /^\/api\/projetos\/(\w+)\/versoes$/, (req, res, m) => { projetoOk(m[1]); json(res, projetos.versoes(m[1])); });
rota('POST', /^\/api\/projetos\/(\w+)\/versoes\/([\w-]+)\/restaurar$/, (req, res, m) => { projetoOk(m[1]); json(res, projetos.restaurar(m[1], m[2])); });
rota('POST', /^\/api\/projetos\/(\w+)\/midia$/, async (req, res, m, u) => {
  projetoOk(m[1]);
  const tam = +req.headers['content-length'] || 0;
  exige(tam <= cfg.MAX_UPLOAD_MB * 1048576, `Arquivo maior que ${cfg.MAX_UPLOAD_MB} MB`);
  const md = await projetos.importar(m[1], u.searchParams.get('nome') || 'arquivo', req, cfg.MAX_UPLOAD_MB * 1048576);
  const out = { midia: md };
  if (md.tipo === 'pdf') out.tarefa = jobs.criar('pdf', { projetoId: m[1], midiaId: md.id }, `PDF Intelligence: ${md.nome}`).id;
  if (md.proxyPendente) out.proxy = jobs.criar('proxy', { projetoId: m[1], midiaId: md.id }, `Prévia leve: ${md.nome}`).id;
  json(res, out);
});
rota('DELETE', /^\/api\/projetos\/(\w+)\/midia\/(\w+)$/, async (req, res, m) => {
  projetoOk(m[1]);
  const p = await projetos.alterar(m[1], p => {
    const em = [...p.principal, ...p.broll, ...p.audios].some(x => x.midia === m[2]);
    if (em) throw Object.assign(new Error('Mídia em uso na linha do tempo: remova os clipes primeiro'), { status: 409 });
    p.midias = p.midias.filter(x => x.id !== m[2] && x.pdfId !== m[2]); p.pdfs = (p.pdfs || []).filter(d => d.midiaId !== m[2]);
  });
  json(res, p);
});
const tarefa = (tipo, rotulo, extra = () => ({})) => async (req, res, m) => {
  projetoOk(m[1]); const b = await corpo(req);
  json(res, jobs.criar(tipo, { ...b, ...extra(b), projetoId: m[1] }, rotulo(b, projetos.ler(m[1]))));
};
rota('POST', /^\/api\/projetos\/(\w+)\/render$/, async (req, res, m) => {
  projetoOk(m[1]); const b = await corpo(req), p = projetos.ler(m[1]);
  const formatos = (b.formatos && b.formatos.length ? b.formatos : [p.formato]).filter(f => Modelo.FORMATOS[f]);
  exige(formatos.length, 'Formato inválido');
  json(res, formatos.map(f => jobs.criar('render', { projetoId: m[1], formato: f, qualidade: b.qualidade === 'previa' ? 'previa' : 'final' }, `${b.qualidade === 'previa' ? 'Prévia' : 'Exportar'} ${f}: ${p.nome}`)));
});
rota('POST', /^\/api\/projetos\/(\w+)\/autoedit$/, tarefa('autoedit', (b, p) => `Auto Edit: ${p.nome}`));
rota('POST', /^\/api\/projetos\/(\w+)\/transcrever$/, tarefa('transcrever', (b, p) => `Legendas: ${p.nome}`));
rota('POST', /^\/api\/projetos\/(\w+)\/tts$/, tarefa('tts', (b, p) => `Voz IA: ${p.nome}`));
rota('POST', /^\/api\/projetos\/(\w+)\/roteiro$/, async (req, res, m) => {
  projetoOk(m[1]); const b = await corpo(req), p = projetos.ler(m[1]);
  const rot = await diretor.gerarRoteiro(p, b);
  await projetos.alterar(m[1], pp => { pp.roteiro = rot; });
  json(res, rot);
});
rota('POST', /^\/api\/projetos\/(\w+)\/aplicar-roteiro$/, async (req, res, m) => {
  projetoOk(m[1]); const b = await corpo(req);
  const p = await projetos.alterar(m[1], pp => {
    const rot = b.roteiro || pp.roteiro; exige(rot && rot.cenas, 'Gere um roteiro primeiro');
    const preset = presets.obter(pp.presetId), novo = diretor.aplicarRoteiro(pp, rot, preset);
    Object.assign(pp, novo, { roteiro: rot, telaFinal: true });
    pp.sugestoes = [{ id: Modelo.uid('s'), tipo: 'roteiro', texto: `Linha do tempo montada a partir do roteiro (${novo.principal.length} cenas). Revise textos e durações.`, data: new Date().toISOString() }];
  });
  json(res, p);
});
rota('GET', /^\/api\/tarefas$/, (req, res, m, u) => json(res, jobs.listar(u.searchParams.get('projetoId') ? { projetoId: u.searchParams.get('projetoId') } : null)));
rota('GET', /^\/api\/tarefas\/(\w+)$/, (req, res, m) => { const j = jobs.obter(m[1]); j ? json(res, j) : erro(res, 'tarefa não encontrada', 404); });
rota('POST', /^\/api\/tarefas\/(\w+)\/cancelar$/, (req, res, m) => json(res, jobs.cancelar(m[1]) || {}));
rota('POST', /^\/api\/tarefas\/(\w+)\/repetir$/, (req, res, m) => { const j = jobs.repetir(m[1]); j ? json(res, j) : erro(res, 'Só tarefas com erro/canceladas podem ser repetidas'); });
rota('POST', /^\/api\/projetos\/(\w+)\/abrir-pasta$/, (req, res, m) => {
  projetoOk(m[1]); if (cfg.HOST !== '127.0.0.1' && cfg.HOST !== 'localhost') return erro(res, 'Disponível só no computador local');
  const d = projetos.arq(m[1], 'export');
  exec(process.platform === 'win32' ? `explorer "${d}"` : process.platform === 'darwin' ? `open "${d}"` : `xdg-open "${d}"`); json(res, { ok: true });
});

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'); let p;
  try { p = decodeURIComponent(u.pathname); } catch { return erro(res, 'url inválida'); }
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  try {
    if (req.method === 'GET' && (p === '/' || p === '/index.html')) return estatico(req, res, path.join(cfg.RAIZ, 'public'), 'index.html');
    if (req.method === 'GET' && /^\/(js|css)\//.test(p)) return estatico(req, res, path.join(cfg.RAIZ, 'public'), p.slice(1));
    if (req.method === 'GET' && /^\/assets\/(fontes|emojis)\/[\w.-]+$/.test(p)) return estatico(req, res, cfg.ASSETS, p.slice(8));
    if (p !== '/api/login' && !p.startsWith('/api/marca/logo/') && !autenticado(req)) {
      if (p.startsWith('/api/') || p.startsWith('/arquivos/')) return erro(res, 'login necessário', 401);
      return estatico(req, res, path.join(cfg.RAIZ, 'public'), 'index.html');
    }
    const a = p.match(/^\/arquivos\/(\w+)\/(.+)$/);
    if (a && req.method === 'GET') { projetoOk(a[1]); return servirArquivo(req, res, projetos.arq(a[1], a[2]), u.searchParams.has('baixar')); }
    for (const [metodo, padrao, fn] of R) { const m = p.match(padrao); if (m && metodo === req.method) return await fn(req, res, m, u); }
    erro(res, 'rota não encontrada', 404);
  } catch (e) {
    if (!res.headersSent) erro(res, e.message || String(e), e.status || 500);
    if (!e.status) console.error(e);
  }
}).listen(cfg.PORTA, cfg.HOST, () => {
  const url = `http://${cfg.HOST === '0.0.0.0' ? 'localhost' : cfg.HOST}:${cfg.PORTA}`;
  console.log(`\n  ● Paulo Cotrim AI Studio rodando em ${url}\n    Dados: ${cfg.DADOS}\n    (deixe esta janela aberta; Ctrl+C encerra)\n`);
  sfx.garantir().catch(e => console.error('Efeitos sonoros:', e.message));
  if (!process.env.NO_OPEN && cfg.HOST === '127.0.0.1') exec(process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url} 2>/dev/null`);
});

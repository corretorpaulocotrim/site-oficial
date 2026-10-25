// Projetos persistentes em disco: dados/projetos/<id>/{projeto.json, midia/, cache/, export/, versoes/}
const fs = require('fs');
const path = require('path');
const cfg = require('./config');
const Modelo = require('../public/js/modelo');
const { ff, probe } = require('./midia');

const EXT = { video: /\.(mp4|mov|m4v|webm|mkv|avi|3gp)$/i, imagem: /\.(jpe?g|png|webp|bmp|tiff?|heic)$/i, audio: /\.(mp3|m4a|wav|aac|ogg|flac)$/i, pdf: /\.pdf$/i };
const tipoPorNome = n => Object.keys(EXT).find(k => EXT[k].test(n)) || null;
const idOk = id => /^[a-z0-9]{6,40}$/i.test(String(id || ''));
const dir = id => { if (!idOk(id)) throw new Error('id inválido'); return path.join(cfg.PROJETOS, id); };
const arq = (id, ...p) => {
  const base = dir(id), f = path.resolve(base, ...p);
  if (!f.startsWith(base + path.sep) && f !== base) throw new Error('caminho inválido');
  return f;
};
const travas = new Map(); // escrita atomica por projeto

function criar(dados = {}) {
  const p = Modelo.projetoVazio(dados.nome, dados.formato, dados.presetId);
  p.id = p.id.replace(/[^a-z0-9]/gi, '');
  if (dados.empreendimento) p.empreendimento = { ...p.empreendimento, ...dados.empreendimento };
  for (const s of ['midia', 'cache', 'export', 'versoes', 'tmp']) fs.mkdirSync(arq(p.id, s), { recursive: true });
  gravar(p);
  return p;
}
function gravar(p) {
  p.atualizado = new Date().toISOString();
  const f = arq(p.id, 'projeto.json');
  fs.writeFileSync(f + '.tmp', JSON.stringify(p)); fs.renameSync(f + '.tmp', f);
}
function ler(id) { return JSON.parse(fs.readFileSync(arq(id, 'projeto.json'), 'utf8')); }
const existe = id => idOk(id) && fs.existsSync(path.join(cfg.PROJETOS, id, 'projeto.json'));

// Salvamento automatico + versao (no maximo 1 a cada 2 min, guarda 40)
function salvar(id, novo, { versao = false } = {}) {
  const atual = ler(id);
  // campos controlados pelo servidor nao sao sobrescritos pelo editor
  const p = { ...novo, id, criado: atual.criado, midias: novo.midias || atual.midias, exportacoes: atual.exportacoes, pdfs: novo.pdfs || atual.pdfs };
  const vdir = arq(id, 'versoes'); fs.mkdirSync(vdir, { recursive: true });
  const vs = fs.readdirSync(vdir).sort();
  const ultima = vs.length ? fs.statSync(path.join(vdir, vs[vs.length - 1])).mtimeMs : 0;
  if (versao || Date.now() - ultima > 120000) {
    fs.copyFileSync(arq(id, 'projeto.json'), path.join(vdir, new Date().toISOString().replace(/[:.]/g, '-') + '.json'));
    vs.slice(0, Math.max(0, vs.length - 39)).forEach(v => fs.rmSync(path.join(vdir, v), { force: true }));
  }
  gravar(p);
  return p;
}
// Alteracao feita pelo servidor (tarefas): le-modifica-grava em sequencia
async function alterar(id, fn) {
  const ant = travas.get(id) || Promise.resolve();
  const prox = ant.then(async () => { const p = ler(id); const r = await fn(p); gravar(p); return r === undefined ? p : r; });
  travas.set(id, prox.catch(() => {}));
  return prox;
}
function listar() {
  return fs.readdirSync(cfg.PROJETOS).filter(existe).map(id => {
    try {
      const p = ler(id), thumb = (p.midias.find(m => m.thumb) || {}).thumb;
      return { id, nome: p.nome, formato: p.formato, presetId: p.presetId, atualizado: p.atualizado, criado: p.criado, midias: p.midias.length, clipes: p.principal.length, thumb, empreendimento: p.empreendimento.nome, exportacoes: (p.exportacoes || []).length };
    } catch { return null; }
  }).filter(Boolean).sort((a, b) => b.atualizado.localeCompare(a.atualizado));
}
function duplicar(id) {
  const p = ler(id), novo = criar({ nome: p.nome + ' (cópia)', formato: p.formato, presetId: p.presetId });
  const c = { ...Modelo.clone(p), id: novo.id, nome: novo.nome, criado: novo.criado, exportacoes: [] };
  fs.cpSync(arq(id, 'midia'), arq(novo.id, 'midia'), { recursive: true });
  gravar(c); return c;
}
function excluir(id) { fs.rmSync(dir(id), { recursive: true, force: true }); }
const versoes = id => fs.readdirSync(arq(id, 'versoes')).sort().reverse().map(v => ({ id: v.replace('.json', ''), data: fs.statSync(arq(id, 'versoes', v)).mtime }));
function restaurar(id, v) {
  const f = arq(id, 'versoes', path.basename(v) + '.json');
  if (!fs.existsSync(f)) throw new Error('versão não encontrada');
  const p = JSON.parse(fs.readFileSync(f, 'utf8'));
  return salvar(id, p, { versao: true });
}

// Importacao de midia: grava, inspeciona, gera miniatura e proxy de previa (H.264 leve que qualquer navegador toca)
async function importar(id, nomeOriginal, origemStream, limiteBytes) {
  const nome = path.basename(nomeOriginal || 'arquivo').replace(/[^\w.\-]+/g, '_').slice(-80);
  const tipo = tipoPorNome(nome);
  if (!tipo) throw new Error('Formato não suportado: ' + nome);
  const mid = Modelo.uid('m').replace(/[^a-z0-9]/gi, '');
  const rel = `midia/${mid}_${nome}`, destino = arq(id, rel);
  await new Promise((ok, fail) => {
    let n = 0; const w = fs.createWriteStream(destino);
    origemStream.on('data', d => { n += d.length; if (n > limiteBytes) { origemStream.destroy(); w.destroy(); fs.rmSync(destino, { force: true }); fail(new Error(`Arquivo maior que ${cfg.MAX_UPLOAD_MB} MB`)); } });
    origemStream.pipe(w).on('finish', ok).on('error', fail); origemStream.on('error', fail);
  });
  const m = { id: mid, tipo, nome: nomeOriginal, arquivo: rel, criado: new Date().toISOString() };
  if (tipo !== 'pdf') {
    let info;
    try { info = await probe(destino); } catch { fs.rmSync(destino, { force: true }); throw new Error('Arquivo corrompido ou não é mídia: ' + nome); }
    if (tipo === 'video' && !info.video) m.tipo = 'audio';
    Object.assign(m, { dur: tipo === 'imagem' ? 0 : info.dur, w: info.w, h: info.h, fps: info.fps, audio: info.audio, vcodec: info.vcodec });
    if (m.tipo !== 'audio') {
      m.thumb = `midia/${mid}_thumb.jpg`;
      await ff(['-ss', String(Math.min(1, (m.dur || 0) / 3)), '-i', destino, '-frames:v', '1', '-vf', 'scale=320:-2', '-q:v', '4', arq(id, m.thumb)], { tag: 'miniatura', timeoutMs: 60000 }).catch(() => { m.thumb = m.tipo === 'imagem' ? rel : undefined; });
    }
    // proxy: navegador nao toca HEVC/MOV de iPhone; o render final sempre usa o original
    if (m.tipo === 'video' && !(/h264/.test(m.vcodec || '') && /\.mp4$/i.test(nome))) m.proxyPendente = true;
  }
  await alterar(id, p => { p.midias.push(m); });
  return m;
}
async function gerarProxy(id, mid, ctx) {
  const p = ler(id), m = p.midias.find(x => x.id === mid); if (!m) return;
  const rel = `midia/${mid}_proxy.mp4`;
  await ff(['-i', arq(id, m.arquivo), '-vf', 'scale=-2:720', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', arq(id, rel)],
    { tag: 'proxy', sinal: ctx && ctx.sinal, aoTempo: t => ctx && m.dur && ctx.progresso(100 * t / m.dur) });
  await alterar(id, p2 => { const x = p2.midias.find(y => y.id === mid); if (x) { x.proxy = rel; delete x.proxyPendente; } });
}

module.exports = { criar, ler, salvar, alterar, listar, duplicar, excluir, versoes, restaurar, importar, gerarProxy, arq, dir, existe, tipoPorNome, idOk };

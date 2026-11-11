// Fila de tarefas assincronas persistente: estado, progresso, log, cancelamento, repeticao e recuperacao apos reinicio.
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

const ARQ = path.join(cfg.DADOS, 'jobs.json');
const jobs = new Map(), executores = {}, controles = new Map();
let rodando = 0, salvarT = null;

function salvar() {
  clearTimeout(salvarT);
  salvarT = setTimeout(() => {
    const lista = [...jobs.values()].slice(-300);
    fs.writeFileSync(ARQ + '.tmp', JSON.stringify(lista)); fs.renameSync(ARQ + '.tmp', ARQ);
  }, 300);
}
// Recuperacao: tarefas que estavam rodando quando o servidor caiu viram "interrompida" (podem ser repetidas)
try {
  for (const j of JSON.parse(fs.readFileSync(ARQ, 'utf8'))) {
    if (j.estado === 'executando' || j.estado === 'na_fila') { j.estado = 'erro'; j.erro = 'Interrompida (servidor reiniciado). Use "Repetir".'; }
    jobs.set(j.id, j);
  }
} catch {}

const publico = j => ({ ...j, log: j.log.slice(-80) });
function registrar(tipo, fn) { executores[tipo] = fn; }

function criar(tipo, params, rotulo) {
  if (!executores[tipo]) throw new Error('Tipo de tarefa desconhecido: ' + tipo);
  const id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const j = { id, tipo, rotulo: rotulo || tipo, estado: 'na_fila', progresso: 0, criado: new Date().toISOString(), inicio: null, fim: null, params, resultado: null, erro: null, tentativas: 0, log: [] };
  jobs.set(id, j); salvar(); proximo();
  return j;
}

function proximo() {
  if (rodando >= cfg.CONCORRENCIA) return;
  const j = [...jobs.values()].find(x => x.estado === 'na_fila');
  if (!j) return;
  rodando++;
  const ctl = new AbortController(); controles.set(j.id, ctl);
  Object.assign(j, { estado: 'executando', inicio: new Date().toISOString(), tentativas: j.tentativas + 1, erro: null });
  salvar();
  const ctx = {
    sinal: ctl.signal,
    log: m => { j.log.push(`${new Date().toLocaleTimeString('pt-BR')} ${m}`); if (j.log.length > 500) j.log.splice(0, 100); console.log(`[${j.tipo}] ${m}`); salvar(); },
    progresso: p => { j.progresso = Math.max(0, Math.min(100, Math.round(p))); salvar(); }
  };
  Promise.resolve().then(() => executores[j.tipo](j.params, ctx)).then(r => {
    Object.assign(j, { estado: 'concluido', progresso: 100, resultado: r || null });
  }).catch(e => {
    if (e && e.cancelado) Object.assign(j, { estado: 'cancelado', erro: 'Cancelado pelo usuário' });
    else { Object.assign(j, { estado: 'erro', erro: (e && e.message || String(e)).slice(0, 3000) }); console.error(e); }
  }).finally(() => {
    j.fim = new Date().toISOString(); controles.delete(j.id); rodando--; salvar(); proximo();
  });
}

function cancelar(id) {
  const j = jobs.get(id); if (!j) return null;
  if (j.estado === 'na_fila') { j.estado = 'cancelado'; j.fim = new Date().toISOString(); salvar(); }
  else if (j.estado === 'executando') controles.get(id)?.abort();
  return j;
}
function repetir(id) {
  const j = jobs.get(id); if (!j || !['erro', 'cancelado'].includes(j.estado)) return null;
  Object.assign(j, { estado: 'na_fila', progresso: 0, erro: null, resultado: null, log: [...j.log, '— repetindo —'] });
  salvar(); proximo(); return j;
}
const listar = filtro => [...jobs.values()].filter(j => !filtro || Object.entries(filtro).every(([k, v]) => (k in j ? j[k] : j.params?.[k]) === v)).reverse().map(publico);
const obter = id => jobs.has(id) ? publico(jobs.get(id)) : null;
const aguardar = id => new Promise(ok => { const t = setInterval(() => { const j = jobs.get(id); if (!j || ['concluido', 'erro', 'cancelado'].includes(j.estado)) { clearInterval(t); ok(j && publico(j)); } }, 200); });

// Limpeza de temporarios antigos
function limparTmp() {
  const limite = Date.now() - cfg.RETENCAO_TMP_DIAS * 864e5;
  for (const f of fs.readdirSync(cfg.TMP)) { const p = path.join(cfg.TMP, f); try { if (fs.statSync(p).mtimeMs < limite) fs.rmSync(p, { recursive: true, force: true }); } catch {} }
}
limparTmp(); setInterval(limparTmp, 6 * 3600e3).unref();

module.exports = { registrar, criar, cancelar, repetir, listar, obter, aguardar };

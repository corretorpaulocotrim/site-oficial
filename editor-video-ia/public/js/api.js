// Cliente da API + utilitarios de interface (toast, escape, upload com progresso, espera de tarefa)
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
function toast(msg, erro) {
  const d = document.createElement('div'); d.className = erro ? 'er' : ''; d.textContent = msg;
  $('#toast').appendChild(d); setTimeout(() => d.remove(), erro ? 7000 : 3500);
}
const API = {
  async req(metodo, url, corpo, cab = {}) {
    const r = await fetch(url, { method: metodo, headers: corpo !== undefined ? { 'Content-Type': 'application/json', ...cab } : cab, body: corpo !== undefined ? JSON.stringify(corpo) : undefined });
    if (r.status === 401 && !url.endsWith('/login')) { App.login(); throw new Error('Login necessário'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.erro || 'Erro ' + r.status); e.status = r.status; e.dados = j; throw e; }
    return j;
  },
  get: u => API.req('GET', u), post: (u, c) => API.req('POST', u, c || {}), put: (u, c, h) => API.req('PUT', u, c, h), del: u => API.req('DELETE', u),
  arq: (pid, rel) => `/arquivos/${pid}/${String(rel).split('/').map(encodeURIComponent).join('/')}`,
  upload(pid, arquivo, aoProgresso) {
    return new Promise((ok, fail) => {
      const x = new XMLHttpRequest();
      x.open('POST', `/api/projetos/${pid}/midia?nome=${encodeURIComponent(arquivo.name)}`);
      x.upload.onprogress = e => aoProgresso && e.lengthComputable && aoProgresso(e.loaded / e.total);
      x.onload = () => { let j = {}; try { j = JSON.parse(x.responseText); } catch {} x.status < 300 ? ok(j) : fail(new Error(j.erro || 'Falha no envio')); };
      x.onerror = () => fail(new Error('Falha de conexão no envio'));
      x.send(arquivo);
    });
  },
  // acompanha uma tarefa ate terminar (a tarefa continua no servidor mesmo se a pagina fechar)
  esperar(id, aoMudar) {
    return new Promise(ok => {
      const t = setInterval(async () => {
        let j; try { j = await API.get('/api/tarefas/' + id); } catch { return; }
        aoMudar && aoMudar(j);
        if (['concluido', 'erro', 'cancelado'].includes(j.estado)) { clearInterval(t); ok(j); }
      }, 1000);
    });
  }
};
const ESTADO = { na_fila: ['na fila', ''], executando: ['processando', 'av'], concluido: ['concluído', 'ok'], erro: ['erro', 'er'], cancelado: ['cancelado', ''] };
const chipEstado = e => `<span class="chip ${ESTADO[e] ? ESTADO[e][1] : ''}">${ESTADO[e] ? ESTADO[e][0] : esc(e)}</span>`;
const dataBR = d => d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '';

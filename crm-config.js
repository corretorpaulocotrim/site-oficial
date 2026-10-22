/**
 * CRM CONFIG — Paulo Cotrim
 * Backend grátis via Google Apps Script (veja APPS-SCRIPT-CRM.gs).
 * Depois de implantar o Apps Script, cole a URL /exec em webhookUrl abaixo
 * e use o MESMO token do arquivo .gs. Só isso — o site e o CRM passam a
 * enviar/sincronizar leads automaticamente.
 */
window.CRM_CONFIG = {
  // URL /exec do Apps Script (backend do CRM):
  webhookUrl: 'https://script.google.com/macros/s/AKfycbwAl107wFuwn54xIBG1fu49pVzt45GxYVJHkrQ-n961y8NDR3JAYK_buMmyV20__z70zw/exec',
  // Mesma senha do arquivo APPS-SCRIPT-CRM.gs (campo TOKEN):
  authToken: 'pcotrim2026',
  source: 'site-paulocotrim',
  debug: false
};

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

/**
 * Envia um lead para o backend (Apps Script).
 * Corpo text/plain para não disparar preflight CORS no Apps Script.
 */
window.enviarLeadCRM = function (lead) {
  var cfg = window.CRM_CONFIG || {};
  var payload = {
    id: lead.id || Date.now(),
    nome: lead.nome || '',
    telefone: lead.telefone || lead.tel || '',
    email: lead.email || '',
    interesse: lead.interesse || '',
    renda: lead.renda || '',
    regiao: lead.regiao || '',
    origem: lead.origem || cfg.source || 'site',
    status: lead.status || 'novo',
    temp: lead.temp || 'morno',
    obs: lead.obs || '',
    pagina: window.location.pathname,
    token: cfg.authToken || '',
    extras: lead.extras || {}
  };
  // Cópia local sempre (funciona mesmo sem backend / offline)
  try {
    var pend = JSON.parse(localStorage.getItem('crm_leads_site') || '[]');
    pend.unshift(payload);
    localStorage.setItem('crm_leads_site', JSON.stringify(pend.slice(0, 500)));
  } catch (e) {}

  if (!cfg.webhookUrl) {
    if (cfg.debug) console.warn('[CRM] backend não configurado — lead salvo só localmente.');
    return Promise.resolve({ ok: false, reason: 'no_backend' });
  }
  return fetch(cfg.webhookUrl, {
    method: 'POST',
    body: JSON.stringify(payload) // sem header application/json = sem preflight
  }).then(function (r) { return { ok: r.ok, status: r.status }; })
    .catch(function (err) { if (cfg.debug) console.error('[CRM] erro:', err); return { ok: false, error: String(err) }; });
};

/**
 * Busca todos os leads do backend (o CRM usa pra sincronizar celular/PC).
 */
// Leitura/importacao exigem login conferido no Apps Script (credenciais so na sessao do navegador)
function crmPost(body) {
  var cfg = window.CRM_CONFIG || {};
  if (!cfg.webhookUrl) return Promise.resolve(null);
  return fetch(cfg.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
    .then(function (r) { return r.json(); }).catch(function () { return null; });
}
function crmCred() { try { return { usuario: sessionStorage.getItem('crm_u') || '', senha: sessionStorage.getItem('crm_p') || '' }; } catch (e) { return { usuario: '', senha: '' }; } }
// Devolve 'ok' | 'antigo' (Apps Script ainda na versao antiga, sem login no servidor) | 'erro'
window.crmBackendLogin = function (u, p) {
  return crmPost({ acao: 'login', usuario: u, senha: p }).then(function (j) { return (j && j.ok) ? 'ok' : (j && j.err === 'token') ? 'antigo' : 'erro'; });
};
window.crmBackendGet = function () {
  var cfg = window.CRM_CONFIG || {};
  var legado = false; try { legado = sessionStorage.getItem('crm_legado') === '1'; } catch (e) {}
  if (legado && cfg.webhookUrl) { // modo antigo: so enquanto o Apps Script nao for atualizado
    var url = cfg.webhookUrl + (cfg.webhookUrl.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(cfg.authToken || '');
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) { return (j && j.ok) ? j.leads : null; }).catch(function () { return null; });
  }
  var c = crmCred(); if (!c.usuario) return Promise.resolve(null);
  return crmPost({ acao: 'leads', usuario: c.usuario, senha: c.senha }).then(function (j) { return (j && j.ok) ? j.leads : null; });
};
window.crmBackendImport = function (leads) {
  var c = crmCred();
  return crmPost({ acao: 'importar', usuario: c.usuario, senha: c.senha, leads: leads }).then(function (j) { return (j && j.ok) ? j.n : 0; });
};

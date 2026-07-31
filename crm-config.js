/**
 * CRM CONFIG — Paulo Cotrim
 * Backend grátis via Google Apps Script (veja APPS-SCRIPT-CRM.gs).
 * Depois de implantar o Apps Script, cole a URL /exec em webhookUrl abaixo
 * e use o MESMO token do arquivo .gs. Só isso — o site e o CRM passam a
 * enviar/sincronizar leads automaticamente.
 */
window.CRM_CONFIG = {
  // Cole aqui a URL /exec do seu Apps Script (vazio = só localStorage):
  webhookUrl: '',
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
window.crmBackendGet = function () {
  var cfg = window.CRM_CONFIG || {};
  if (!cfg.webhookUrl) return Promise.resolve(null);
  var url = cfg.webhookUrl + (cfg.webhookUrl.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(cfg.authToken || '');
  return fetch(url).then(function (r) { return r.json(); })
    .then(function (j) { return (j && j.ok) ? j.leads : null; })
    .catch(function () { return null; });
};

/**
 * CRM CONFIG — Paulo Cotrim
 * Quando seu CRM estiver pronto, coloque a URL do webhook aqui.
 * O site vai enviar todos os leads automaticamente.
 */

window.CRM_CONFIG = {
  // URL do webhook do seu CRM (substitua quando estiver pronto)
  webhookUrl: '',  // ex: 'https://seu-crm.com.br/api/leads'

  // Token de autenticação (se necessário)
  authToken: '',

  // Origem padrão dos leads
  source: 'site-paulocotrim',

  // Ativar log no console (útil para testar)
  debug: false
};

/**
 * Envia um lead para o CRM via webhook POST
 * @param {Object} lead - dados do lead
 * @param {string} lead.nome
 * @param {string} lead.telefone
 * @param {string} [lead.interesse]
 * @param {string} [lead.renda]
 * @param {string} [lead.regiao]
 * @param {string} [lead.origem] - qual página/formulário
 * @param {Object} [lead.extras] - dados adicionais
 */
window.enviarLeadCRM = async function(lead) {
  const cfg = window.CRM_CONFIG;

  // Monta payload padrão
  const payload = {
    nome:      lead.nome     || '',
    telefone:  lead.telefone || '',
    interesse: lead.interesse || '',
    renda:     lead.renda    || '',
    regiao:    lead.regiao   || '',
    origem:    lead.origem   || cfg.source,
    pagina:    window.location.pathname,
    utm_source:    getParam('utm_source'),
    utm_medium:    getParam('utm_medium'),
    utm_campaign:  getParam('utm_campaign'),
    timestamp: new Date().toISOString(),
    extras:    lead.extras || {}
  };

  if (cfg.debug) console.log('[CRM] Lead capturado:', payload);

  // Se não tem webhook configurado, apenas loga
  if (!cfg.webhookUrl) {
    if (cfg.debug) console.warn('[CRM] webhookUrl não configurado. Lead não enviado.');
    return { ok: false, reason: 'no_webhook' };
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (cfg.authToken) headers['Authorization'] = 'Bearer ' + cfg.authToken;

    const res = await fetch(cfg.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (cfg.debug) console.log('[CRM] Resposta:', res.status);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    if (cfg.debug) console.error('[CRM] Erro ao enviar lead:', err);
    return { ok: false, error: err.message };
  }
};

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

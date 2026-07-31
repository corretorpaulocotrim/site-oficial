/**
 * CRM Paulo Cotrim — Backend GRÁTIS (Google Apps Script + Google Sheets)
 * ---------------------------------------------------------------------
 * O que ele faz:
 *  - Recebe leads do site (simulador, aprovação, formulários) e guarda numa planilha SUA.
 *  - Devolve todos os leads pro CRM (/adm) — assim celular e PC ficam sincronizados.
 *  - É seu backup automático: cada lead é uma linha na planilha do Google.
 *
 * COMO INSTALAR (5 minutos, uma vez só):
 *  1. Crie uma planilha nova em https://sheets.google.com  (dê o nome "CRM Paulo").
 *  2. Menu Extensões > Apps Script.
 *  3. Apague o que estiver lá e COLE todo este arquivo.
 *  4. (Opcional) troque o TOKEN abaixo por uma senha sua — a MESMA que vai no crm-config.js.
 *  5. Clique em Implantar > Nova implantação > tipo "App da Web".
 *       - Executar como: Eu mesmo.
 *       - Quem tem acesso: Qualquer pessoa.
 *     Copie a URL que termina em /exec.
 *  6. Cole essa URL no arquivo crm-config.js do site (campo webhookUrl) e no CRM.
 *  Pronto: os leads começam a cair na planilha e no CRM.
 */

var SHEET_NAME = 'Leads';
var TOKEN = 'pcotrim2026'; // troque se quiser — use a MESMA no crm-config.js

function _sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['id','data','nome','telefone','email','interesse','renda','regiao','origem','status','temp','obs','pagina']);
  }
  return sh;
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Recebe um lead novo (POST) e adiciona uma linha
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (TOKEN && d.token !== TOKEN) return _json({ ok: false, err: 'token' });
    var sh = _sheet();
    var id = d.id || Date.now();
    sh.appendRow([
      id, new Date(), d.nome || '', d.telefone || d.tel || '', d.email || '',
      d.interesse || '', d.renda || '', d.regiao || '', d.origem || '',
      d.status || 'novo', d.temp || 'morno', d.obs || '', d.pagina || ''
    ]);
    return _json({ ok: true, id: id });
  } catch (err) {
    return _json({ ok: false, err: String(err) });
  }
}

// Devolve todos os leads (GET) — o CRM usa isso pra sincronizar
function doGet(e) {
  if (TOKEN && (!e.parameter || e.parameter.token !== TOKEN)) return _json({ ok: false, err: 'token' });
  var sh = _sheet();
  var rows = sh.getDataRange().getValues();
  var head = rows.shift() || [];
  var out = rows.map(function (r) {
    var o = {}; head.forEach(function (h, i) { o[h] = r[i]; }); return o;
  });
  return _json({ ok: true, leads: out });
}

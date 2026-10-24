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
var CRM_USER = 'paulo';
var CRM_PASS = 'TROQUE_AQUI'; // digite SUA senha aqui, só no Apps Script (nunca no GitHub)
function _auth(u, p) { return CRM_PASS !== 'TROQUE_AQUI' && String(u).toLowerCase() === CRM_USER && String(p) === CRM_PASS; }
var TOKEN = 'pcotrim2026'; // troque se quiser — use a MESMA no crm-config.js

var COLS = ['id','data','nome','telefone','email','interesse','renda','regiao','origem','status','temp','obs','pagina','dados','upd'];
function _sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(COLS); }
  else if (sh.getLastColumn() < COLS.length) sh.getRange(1, 1, 1, COLS.length).setValues([COLS]);
  return sh;
}

// Sincronizacao completa do CRM (PC e celular): grava/atualiza/apaga leads pelo id
function _row(x) {
  return [x.id, x.data || '', x.nome || '', x.tel || x.telefone || '', x.email || '', x.interesse || '', x.orcamento || x.renda || '',
    x.regiao || '', x.origem || '', x.status || 'novo', x.temp || '', x.obs || '', x.pagina || '', JSON.stringify(x), x.upd || Date.now()];
}
function _salvar(list) {
  var lock = LockService.getScriptLock(); lock.waitLock(25000);
  try {
    var sh = _sheet(), v = sh.getDataRange().getValues(); v.shift();
    var pos = {}, del = {};
    v.forEach(function (r, i) { var k = String(r[0]); if (!k) { del[i] = 1; return; } if (pos[k] !== undefined) del[i] = 1; else pos[k] = i; });
    list.forEach(function (x) {
      var k = String(x.id);
      if (x._del) { if (pos[k] !== undefined) del[pos[k]] = 1; return; }
      var row = _row(x);
      if (pos[k] !== undefined) v[pos[k]] = row; else { pos[k] = v.length; v.push(row); }
    });
    v = v.filter(function (r, i) { return !del[i]; }).map(function (r) { r = r.slice(0, COLS.length); while (r.length < COLS.length) r.push(''); return r; });
    var old = sh.getLastRow() - 1;
    if (old > 0) sh.getRange(2, 1, old, COLS.length).clearContent();
    if (v.length) sh.getRange(2, 1, v.length, COLS.length).setValues(v);
    return _json({ ok: true, n: list.length });
  } finally { lock.releaseLock(); }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Recebe um lead novo (POST) e adiciona uma linha
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.acao === 'atualizacao') { if (!_auth(d.usuario, d.senha)) return _json({ ok: false, err: 'login' }); return _addFeed(d); }
    // CRM: login, leitura e importacao em lote — sempre com usuario/senha conferidos aqui no servidor
    if (d.acao === 'login') return _json({ ok: _auth(d.usuario, d.senha) });
    // IMOVEIS CADASTRADOS PELO PUBLICO: entram em analise; contato so aparece no CRM
    if (d.acao === 'imovel') {
      if (TOKEN && d.token !== TOKEN) return _json({ ok: false, err: 'token' });
      var si = _imSheet(), idi = Date.now();
      si.appendRow([idi, new Date(), 'analise', d.titulo || '', d.tipo || '', d.bairro || '', d.preco || '', d.area || '', d.quartos || '', d.vagas || '', d.descricao || '', d.nome || '', d.tel || '', d.email || '', d.f1 || '', d.f2 || '', d.f3 || '']);
      return _json({ ok: true, id: idi });
    }
    if (d.acao === 'imoveis_adm') { if (!_auth(d.usuario, d.senha)) return _json({ ok: false, err: 'login' }); return _json({ ok: true, itens: _imRows(true) }); }
    if (d.acao === 'aprovar') {
      if (!_auth(d.usuario, d.senha)) return _json({ ok: false, err: 'login' });
      var sa = _imSheet(), va = sa.getDataRange().getValues();
      for (var ia = 1; ia < va.length; ia++) if (String(va[ia][0]) === String(d.id)) sa.getRange(ia + 1, 3).setValue(d.status || 'aprovado');
      return _json({ ok: true });
    }
    if (d.acao === 'salvar') { if (!_auth(d.usuario, d.senha)) return _json({ ok: false, err: 'login' }); return _salvar(d.leads || []); }
    if (d.acao === 'leads') { if (!_auth(d.usuario, d.senha)) return _json({ ok: false, err: 'login' }); return _json({ ok: true, leads: _leads() }); }
    if (d.acao === 'importar') {
      if (!_auth(d.usuario, d.senha)) return _json({ ok: false, err: 'login' });
      var arr = (d.leads || []).map(function (x) {
        return [x.id || Date.now(), new Date(), x.nome || '', x.tel || '', x.email || '', x.interesse || '', x.renda || '', x.regiao || '', x.origem || 'Agenda do celular', x.status || 'novo', x.temp || 'frio', x.obs || '', ''];
      });
      if (arr.length) { var sh0 = _sheet(); sh0.getRange(sh0.getLastRow() + 1, 1, arr.length, arr[0].length).setValues(arr); }
      return _json({ ok: true, n: arr.length });
    }
    if (TOKEN && d.token !== TOKEN) return _json({ ok: false, err: 'token' });
    var lk = LockService.getScriptLock(); lk.waitLock(25000); // nao colide com a sincronizacao do CRM
    try {
      var sh = _sheet();
      var id = d.id || Date.now();
      sh.appendRow([
        id, new Date(), d.nome || '', d.telefone || d.tel || '', d.email || '',
        d.interesse || '', d.renda || '', d.regiao || '', d.origem || '',
        d.status || 'novo', d.temp || 'morno', d.obs || '', d.pagina || ''
      ]);
    } finally { lk.releaseLock(); }
    return _json({ ok: true, id: id });
  } catch (err) {
    return _json({ ok: false, err: String(err) });
  }
}

// Devolve todos os leads (GET) — o CRM usa isso pra sincronizar
function doGet(e) {
  var act = e.parameter && e.parameter.action;
  if (act === 'news') return _feed(false);
  if (act === 'imoveis') return _json({ ok: true, itens: _imRows(false) }); // PUBLICO: so aprovados, sem contato                       // PÚBLICO: só itens publico=sim, sem comissão
  if (act === 'feed') {                                          // PRIVADO: tudo, exige token
    if (!_auth(e.parameter.usuario, e.parameter.senha)) return _json({ ok: false, err: 'login' });
    return _feed(true);
  }
  // Leitura dos leads NAO e mais publica: so via POST {acao:'leads'} com login (o token fica visivel no site)
  return _json({ ok: false, err: 'login' });
}

var IM_HEAD = ['id','data','status','titulo','tipo','bairro','preco','area','quartos','vagas','descricao','nome','tel','email','f1','f2','f3'];
function _imSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName('Imoveis');
  if (!sh) { sh = ss.insertSheet('Imoveis'); sh.appendRow(IM_HEAD); }
  return sh;
}
function _imRows(adm) {
  var v = _imSheet().getDataRange().getValues(); v.shift();
  return v.filter(function (r) { return r[0] !== '' && (adm || r[2] === 'aprovado'); }).map(function (r) {
    var o = {}; IM_HEAD.forEach(function (h, i) { o[h] = r[i]; });
    if (!adm) { delete o.nome; delete o.tel; delete o.email; }
    return o;
  }).reverse();
}

function _leads() {
  var rows = _sheet().getDataRange().getValues();
  var head = rows.shift() || [];
  return rows.filter(function (r) { return r[0] !== '' && r[0] != null; }).map(function (r) {
    var o = {}; head.forEach(function (h, i) { o[h] = r[i]; }); return o;
  });
}


// ===== FEED DE ATUALIZAÇÕES (WhatsApp/construtoras) =====
var FEED_SHEET = 'Atualizacoes';
var FEED_HEAD = ['id','data','construtora','tipo','titulo','texto','comissao','prazo','publico','empreendimento','link'];
function _feedSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(FEED_SHEET);
  if (!sh) { sh = ss.insertSheet(FEED_SHEET); sh.appendRow(FEED_HEAD); }
  return sh;
}
// tipo: lancamento | evento | comissao | premiacao | tabela | mercado | aviso
function _addFeed(d) {
  var sh = _feedSheet();
  var id = d.id || Date.now();
  sh.appendRow([id, new Date(), d.construtora || '', d.tipo || 'aviso', d.titulo || '', d.texto || '',
    d.comissao || '', d.prazo || '', d.publico || 'nao', d.empreendimento || '', d.link || '']);
  return _json({ ok: true, id: id });
}
function _feed(privado) {
  var rows = _feedSheet().getDataRange().getValues();
  var head = rows.shift() || [];
  var out = rows.map(function (r) { var o = {}; head.forEach(function (h, i) { o[h] = r[i]; }); return o; });
  if (!privado) {
    out = out.filter(function (o) { return String(o.publico).toLowerCase() === 'sim'; })
             .map(function (o) { delete o.comissao; return o; });
  }
  out.reverse();
  return _json({ ok: true, itens: out.slice(0, 200) });
}

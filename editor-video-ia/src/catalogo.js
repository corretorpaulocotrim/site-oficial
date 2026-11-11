// Catalogo de empreendimentos do site (Sawala): copia do repositorio > copia do app; atualiza do site em segundo plano
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

let _cat = null;
function catalogo() {
  if (_cat) return _cat;
  for (const f of [cfg.CATALOGO_LOCAL, path.join(cfg.RAIZ, 'catalogo.json')]) { try { _cat = JSON.parse(fs.readFileSync(f, 'utf8')).itens || []; if (_cat.length) return _cat; } catch {} }
  return _cat = [];
}
if (!process.env.SEM_REDE) fetch(cfg.SITE + 'data/catalogo.json').then(r => r.ok && r.json()).then(d => { if (d && d.itens && d.itens.length) { _cat = d.itens; fs.writeFileSync(path.join(cfg.RAIZ, 'catalogo.json'), JSON.stringify(d)); } }).catch(() => {});
module.exports = { catalogo };

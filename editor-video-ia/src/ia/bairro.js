// "No dia a dia do bairro": dados REAIS pesquisados do site (bairro-info.js). Nunca inventa: sem bairro conhecido, devolve null.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cfg = require('../config');

let _info = null;
function carregar() {
  if (_info) return _info;
  for (const f of [path.join(cfg.RAIZ, '..', 'bairro-info.js'), path.join(cfg.RAIZ, 'bairro-info.js')]) {
    try { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(f, 'utf8'), ctx, { timeout: 1000 }); if (ctx.window.BAIRRO_INFO) return (_info = ctx.window.BAIRRO_INFO); } catch {}
  }
  return (_info = {});
}
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// Casa pela chave mais longa contida no nome (mesma regra do site: cidade antes de "centro")
function buscar(bairro) {
  const b = norm(bairro); if (!b) return null;
  const chaves = Object.keys(carregar()).filter(k => b.includes(norm(k))).sort((x, y) => y.length - x.length);
  return chaves.length ? { chave: chaves[0], ...carregar()[chaves[0]] } : null;
}
module.exports = { buscar, carregar };

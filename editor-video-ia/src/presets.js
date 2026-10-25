// Biblioteca de presets: oficiais (pasta presets/, somente leitura) + do usuario (dados/presets). Estilo separado de dados comerciais.
const fs = require('fs');
const path = require('path');
const cfg = require('./config');
const Modelo = require('../public/js/modelo');

const ler = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const idSeguro = id => String(id || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const CAMPOS_PROIBIDOS = ['empreendimento', 'preco', 'textos', 'legendas']; // preset nunca carrega dado de um empreendimento

function listar() {
  const m = new Map();
  for (const d of [cfg.PRESETS_OFICIAIS, cfg.PRESETS_USUARIO]) for (const f of fs.readdirSync(d).filter(f => f.endsWith('.json'))) {
    try { const p = ler(path.join(d, f)); p.oficial = d === cfg.PRESETS_OFICIAIS && !m.has(p.id) ? true : false; m.set(p.id, p); } catch {}
  }
  return [...m.values()];
}
const base = () => ler(path.join(cfg.PRESETS_OFICIAIS, 'social-performance.json'));
function obter(id) {
  const p = listar().find(x => x.id === id) || base();
  return Modelo.mesclar(base(), p); // garante todos os campos mesmo em presets antigos/importados
}
function salvar(p) {
  if (!p || !p.nome) throw new Error('Preset precisa de nome');
  const limpo = Modelo.clone(p); CAMPOS_PROIBIDOS.forEach(k => delete limpo[k]);
  limpo.id = idSeguro(limpo.id || limpo.nome);
  if (fs.existsSync(path.join(cfg.PRESETS_OFICIAIS, limpo.id + '.json')) && !p.sobrescreverOficial) limpo.id += '-meu';
  delete limpo.sobrescreverOficial; limpo.oficial = false;
  fs.writeFileSync(path.join(cfg.PRESETS_USUARIO, limpo.id + '.json'), JSON.stringify(limpo, null, 1));
  return limpo;
}
function duplicar(id) { const p = obter(id); return salvar({ ...p, id: p.id + '-copia-' + Date.now().toString(36).slice(-3), nome: p.nome + ' (cópia)' }); }
function excluir(id) {
  const f = path.join(cfg.PRESETS_USUARIO, idSeguro(id) + '.json');
  if (!fs.existsSync(f)) throw new Error('Só presets criados por você podem ser excluídos');
  fs.unlinkSync(f);
}
module.exports = { listar, obter, salvar, duplicar, excluir };

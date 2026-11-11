// Modelos abertos baixados do GitHub na 1a vez (ficam em dados/modelos). Nada e baixado sem o recurso ser usado.
const fs = require('fs');
const path = require('path');
const cfg = require('../config');

const MODELOS = {
  rvm: { arquivo: 'rvm_mobilenetv3_fp32.onnx', url: 'https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx', licenca: 'GPL-3.0 (RobustVideoMatting, Peter Lin)', uso: 'recorte do apresentador sem tela verde' },
  rnnoise: { arquivo: 'rnnoise-std.rnnn', url: 'https://raw.githubusercontent.com/richardpl/arnndn-models/master/std.rnnn', licenca: 'BSD-3-Clause (Xiph RNNoise)', uso: 'redução de ruído da voz' }
};
const baixando = new Map();
const caminho = id => { const f = path.join(cfg.MODELOS, MODELOS[id].arquivo); return fs.existsSync(f) && fs.statSync(f).size > 1000 ? f : null; };
async function garantir(id, log) {
  const f = caminho(id); if (f) return f;
  if (baixando.has(id)) return baixando.get(id);
  const m = MODELOS[id], destino = path.join(cfg.MODELOS, m.arquivo);
  const p = (async () => {
    log && log(`Baixando modelo de ${m.uso} (1ª vez, do GitHub)…`);
    const r = await fetch(m.url);
    if (!r.ok) throw new Error(`Não foi possível baixar o modelo (${r.status}). Verifique a internet e tente de novo.`);
    fs.writeFileSync(destino + '.part', Buffer.from(await r.arrayBuffer())); fs.renameSync(destino + '.part', destino);
    return destino;
  })().finally(() => baixando.delete(id));
  baixando.set(id, p);
  return p;
}
const lista = () => Object.entries(MODELOS).map(([id, m]) => ({ id, ...m, baixado: !!caminho(id) }));
module.exports = { garantir, caminho, lista };

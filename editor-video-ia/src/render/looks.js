// Looks de cor (LUT 3D .cube) gerados pelo proprio estudio: sem licenca de terceiros. Aplicados com o filtro lut3d.
const fs = require('fs');
const path = require('path');
const cfg = require('../config');

const DIR = path.join(cfg.DADOS, 'luts');
const cl = v => Math.max(0, Math.min(1, v));
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const curvaS = (v, k) => cl(v + k * (v - 0.5) * (1 - Math.abs(2 * v - 1)) * 2 * 0.5);
const LOOKS = {
  natural: { nome: 'Natural imobiliário', desc: 'sombras abertas, branco limpo, leve calor', f: (r, g, b) => { const l = lum(r, g, b), lift = 0.04 * (1 - l); return [cl(r + lift + 0.012), cl(g + lift + 0.004), cl(b + lift - 0.01)].map(v => curvaS(v, 0.18)); } },
  'quente-rio': { nome: 'Quente Rio', desc: 'luz dourada de fim de tarde', f: (r, g, b) => { const l = lum(r, g, b); return [cl(r * 1.05 + 0.02 * l), cl(g * 1.01 + 0.008), cl(b * 0.9)].map(v => curvaS(v, 0.22)); } },
  'luxo-noturno': { nome: 'Luxo noturno', desc: 'teal & orange cinematográfico', f: (r, g, b) => { const l = lum(r, g, b), s = 1 - l; return [cl(r + 0.06 * l - 0.03 * s), cl(g + 0.01 * l + 0.01 * s), cl(b - 0.05 * l + 0.05 * s)].map(v => curvaS(v, 0.3)); } },
  'branco-clean': { nome: 'Branco clean', desc: 'claro, neutro, ambientes amplos', f: (r, g, b) => { const l = lum(r, g, b), k = 0.75; const ex = v => cl(Math.pow(v, 0.88)); return [ex(l + (r - l) * k), ex(l + (g - l) * k + 0.004), ex(l + (b - l) * k + 0.01)]; } }
};
function arquivo(id) {
  const L = LOOKS[id]; if (!L) return null;
  fs.mkdirSync(DIR, { recursive: true });
  const f = path.join(DIR, `${id}.cube`);
  if (!fs.existsSync(f)) {
    const N = 33, linhas = [`TITLE "${L.nome}"`, `LUT_3D_SIZE ${N}`];
    for (let b = 0; b < N; b++) for (let g = 0; g < N; g++) for (let r = 0; r < N; r++) linhas.push(L.f(r / (N - 1), g / (N - 1), b / (N - 1)).map(v => v.toFixed(5)).join(' '));
    fs.writeFileSync(f, linhas.join('\n') + '\n');
  }
  return f;
}
const lista = () => Object.entries(LOOKS).map(([id, l]) => ({ id, nome: l.nome, desc: l.desc }));
module.exports = { arquivo, lista, LOOKS };

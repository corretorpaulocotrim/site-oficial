// Biblioteca de efeitos sonoros SINTETIZADOS localmente (sem direitos de terceiros): gerados uma vez com ffmpeg.
const fs = require('fs');
const path = require('path');
const cfg = require('../config');
const { ff } = require('../midia');

const DIR = path.join(cfg.DADOS, 'sfx');
const SFX = {
  whoosh: { nome: 'Whoosh', categoria: 'transição', src: 'anoisesrc=d=0.55:c=pink:a=0.7:r=48000', af: 'highpass=f=350,lowpass=f=7000,afade=in:d=0.25,afade=out:st=0.27:d=0.28' },
  'swoosh-suave': { nome: 'Swoosh suave', categoria: 'transição', src: 'anoisesrc=d=0.9:c=brown:a=0.8:r=48000', af: 'highpass=f=120,lowpass=f=2500,afade=in:d=0.45,afade=out:st=0.45:d=0.45,volume=1.6' },
  pop: { nome: 'Pop', categoria: 'texto', src: "aevalsrc='0.7*sin(2*PI*(500+1100*exp(-t*35))*t)*exp(-t*28)':d=0.18:s=48000", af: 'anull' },
  clique: { nome: 'Clique', categoria: 'interface', src: "aevalsrc='0.8*sin(2*PI*2200*t)*exp(-t*140)':d=0.06:s=48000", af: 'anull' },
  impacto: { nome: 'Impacto', categoria: 'gancho', src: "aevalsrc='0.95*sin(2*PI*52*t)*exp(-t*5)+0.35*(random(0)*2-1)*exp(-t*28)':d=0.9:s=48000", af: 'lowpass=f=4000' },
  grave: { nome: 'Grave cinematográfico', categoria: 'transição', src: "aevalsrc='0.85*sin(2*PI*38*t)*exp(-t*2.6)+0.25*sin(2*PI*76*t)*exp(-t*4)':d=1.4:s=48000", af: 'afade=in:d=0.03' },
  riser: { nome: 'Riser', categoria: 'cta', src: "aevalsrc='0.45*sin(2*PI*(180+900*t*t)*t)*(t/1.2)':d=1.2:s=48000", af: 'afade=out:st=1.05:d=0.15' }
};
async function garantir() {
  fs.mkdirSync(DIR, { recursive: true });
  for (const [id, s] of Object.entries(SFX)) {
    const f = path.join(DIR, id + '.wav');
    if (!fs.existsSync(f)) await ff(['-f', 'lavfi', '-i', s.src, '-af', `${s.af},aformat=sample_rates=48000:channel_layouts=stereo`, f], { tag: 'sfx ' + id });
  }
}
const caminho = id => SFX[id] ? path.join(DIR, id + '.wav') : null;
const lista = () => Object.entries(SFX).map(([id, s]) => ({ id, nome: s.nome, categoria: s.categoria }));
module.exports = { garantir, caminho, lista, DIR };

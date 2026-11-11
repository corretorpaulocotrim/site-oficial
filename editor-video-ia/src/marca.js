// Modulo de identidade oficial (extraida de paulocotrim.com: logo monograma PC, marfim/tinta/ouro, Cormorant Garamond + Inter).
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

const ARQ = path.join(cfg.DADOS, 'marca.json');
const PADRAO = {
  nome: 'Paulo Cotrim',
  creci: 'CRECI-RJ 77677-F',
  telefone: '(21) 98915-0864',
  whatsapp: '5521989150864',
  site: 'www.paulocotrim.com',
  instagram: '@corretor.paulocotrim',
  slogan: 'Não vendo um apartamento. Ajudo você a decidir.',
  cores: { tinta: '#1A1A19', marfim: '#F6F2EA', ouro: '#B0895B', grafite: '#2C2B28', areia: '#DED4C4' },
  fontes: { titulo: 'Cormorant Garamond SemiBold', texto: 'Inter' },
  logos: { monograma: 'logo.png', assinatura: 'logo-assinatura.png' },
  telaFinal: { titulo: 'Paulo Cotrim', linha1: 'Fale comigo no WhatsApp', linha2: '(21) 98915-0864', linha3: 'www.paulocotrim.com' },
  fonteDaIdentidade: 'paulocotrim.com (logo-round-gold.svg, logo-premium-light.svg, variáveis CSS --gold/--ink/--ivory, fontes do site)'
};
function obter() {
  try { const m = JSON.parse(fs.readFileSync(ARQ, 'utf8')); return { ...PADRAO, ...m, cores: { ...PADRAO.cores, ...m.cores }, fontes: { ...PADRAO.fontes, ...m.fontes }, logos: { ...PADRAO.logos, ...m.logos }, telaFinal: { ...PADRAO.telaFinal, ...m.telaFinal } }; }
  catch { return { ...PADRAO }; }
}
function salvar(m) { const atual = obter(); const novo = { ...atual, ...m }; fs.writeFileSync(ARQ, JSON.stringify(novo, null, 1)); return novo; }
// Logos: o usuario pode enviar um PNG oficial; senao usa os da pasta assets (gerados dos SVGs do site)
function caminhoLogo(tipo) {
  const m = obter(), nome = m.logos[tipo] || PADRAO.logos[tipo];
  const usuario = path.join(cfg.DADOS, 'marca', nome);
  return fs.existsSync(usuario) ? usuario : path.join(cfg.ASSETS, nome);
}
module.exports = { obter, salvar, caminhoLogo, PADRAO };

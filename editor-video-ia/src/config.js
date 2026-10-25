// Configuracao: le .env (sem dependencia externa), define pastas e limites. Segredos ficam so no .env.
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const envArq = path.join(RAIZ, '.env');
if (fs.existsSync(envArq)) {
  for (const l of fs.readFileSync(envArq, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const E = process.env;
const DADOS = path.resolve(E.DADOS_DIR || path.join(RAIZ, 'dados'));
const cfg = {
  RAIZ, DADOS,
  PROJETOS: path.join(DADOS, 'projetos'),
  PRESETS_USUARIO: path.join(DADOS, 'presets'),
  MUSICAS: path.join(DADOS, 'musicas'),
  TMP: path.join(DADOS, 'tmp'),
  MODELOS: path.join(DADOS, 'modelos'),
  ASSETS: path.join(RAIZ, 'assets'),
  PRESETS_OFICIAIS: path.join(RAIZ, 'presets'),
  PORTA: +E.PORT || 3333,
  HOST: E.HOST || '127.0.0.1',
  SENHA: E.APP_SENHA || '',
  MAX_UPLOAD_MB: +E.MAX_UPLOAD_MB || 4096,
  RETENCAO_TMP_DIAS: +E.RETENCAO_TMP_DIAS || 3,
  CONCORRENCIA: Math.max(1, +E.CONCORRENCIA || 1),
  WHISPER_MODELO: E.WHISPER_MODELO || 'onnx-community/whisper-base_timestamped',
  OCR: E.OCR !== '0',
  ANTHROPIC_API_KEY: E.ANTHROPIC_API_KEY || '',
  ANTHROPIC_MODELO: E.ANTHROPIC_MODELO || 'claude-opus-5-5',
  ELEVENLABS_API_KEY: E.ELEVENLABS_API_KEY || '',
  ELEVENLABS_VOZ: E.ELEVENLABS_VOZ || '',
  SITE: (E.SITE_URL || 'https://paulocotrim.com.br').replace(/\/$/, '') + '/',
  CATALOGO_LOCAL: path.join(RAIZ, '..', 'data', 'catalogo.json')
};
for (const d of [cfg.DADOS, cfg.PROJETOS, cfg.PRESETS_USUARIO, cfg.MUSICAS, cfg.TMP, cfg.MODELOS]) fs.mkdirSync(d, { recursive: true });
if (cfg.HOST !== '127.0.0.1' && cfg.HOST !== 'localhost' && !cfg.SENHA) {
  console.error('\n  ✖ HOST aberto para a rede sem APP_SENHA. Defina APP_SENHA no .env (segurança).\n');
  process.exit(1);
}
module.exports = cfg;

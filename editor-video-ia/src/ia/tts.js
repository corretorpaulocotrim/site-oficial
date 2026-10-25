// AI PRESENTER — adaptador de voz (ElevenLabs). So funciona com ELEVENLABS_API_KEY e uma voz AUTORIZADA (ELEVENLABS_VOZ).
const fs = require('fs');
const cfg = require('../config');

const disponivel = () => !!(cfg.ELEVENLABS_API_KEY && cfg.ELEVENLABS_VOZ);
async function sintetizar(texto, destino) {
  if (!disponivel()) throw new Error('Voz sintética não configurada: defina ELEVENLABS_API_KEY e ELEVENLABS_VOZ no .env');
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(cfg.ELEVENLABS_VOZ)}`, {
    method: 'POST',
    headers: { 'xi-api-key': cfg.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text: texto, model_id: 'eleven_multilingual_v2' })
  });
  if (!r.ok) throw new Error(`ElevenLabs respondeu ${r.status}: ${(await r.text()).slice(0, 300)}`);
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
}
// Fornecedores avaliados (sem precos inventados: consulte a pagina oficial de cada um)
const FORNECEDORES = [
  { id: 'elevenlabs', recurso: 'Voz sintética / voz clonada autorizada', status: 'adaptador implementado (precisa de chave)', precos: 'https://elevenlabs.io/pricing', docs: 'https://elevenlabs.io/docs/api-reference/text-to-speech' },
  { id: 'heygen', recurso: 'Avatar falante, sincronia labial', status: 'não implementado nesta versão', precos: 'https://www.heygen.com/pricing', docs: 'https://docs.heygen.com' },
  { id: 'synthesia', recurso: 'Avatar de apresentador', status: 'não implementado nesta versão', precos: 'https://www.synthesia.io/pricing', docs: 'https://docs.synthesia.io' },
  { id: 'runway', recurso: 'Vídeo generativo curto / troca de cenário', status: 'não implementado nesta versão', precos: 'https://runwayml.com/pricing', docs: 'https://docs.dev.runwayml.com' }
];
module.exports = { disponivel, sintetizar, FORNECEDORES };

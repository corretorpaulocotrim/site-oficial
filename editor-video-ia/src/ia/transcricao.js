// Transcricao local (Whisper via transformers.js, roda no proprio computador). 1a vez baixa o modelo; depois offline.
const fs = require('fs');
const path = require('path');
const cfg = require('../config');
const { ff } = require('../midia');

let _asr = null;
async function carregar(log) {
  if (_asr) return _asr;
  const { pipeline, env } = await import('@huggingface/transformers');
  env.cacheDir = cfg.MODELOS;
  const tentativas = [[cfg.WHISPER_MODELO, { dtype: { encoder_model: 'fp32', decoder_model_merged: 'q8' } }], [cfg.WHISPER_MODELO, {}], ['onnx-community/whisper-base', {}]];
  for (const [modelo, o] of tentativas) {
    try { _asr = await pipeline('automatic-speech-recognition', modelo, o); return _asr; }
    catch (e) { log && log(`  modelo ${modelo} indisponível: ${String(e.message).split('\n')[0]}`); }
  }
  throw new Error('Transcrição indisponível: o modelo Whisper não pôde ser carregado (na 1ª vez precisa de internet).');
}

// Transcreve um trecho [ini, ini+dur] de um arquivo; devolve palavras com tempo relativo ao trecho
async function transcrever(arquivo, { ini = 0, dur = null, log, sinal } = {}) {
  const asr = await carregar(log);
  const raw = path.join(cfg.TMP, `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.f32`);
  await ff(['-ss', String(ini), ...(dur ? ['-t', String(dur)] : []), '-i', arquivo, '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', raw], { tag: 'extrair áudio', sinal });
  const buf = fs.readFileSync(raw); fs.rmSync(raw, { force: true });
  if (buf.length < 16000 * 4 * 0.3) return [];
  const audio = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const base = { language: 'portuguese', task: 'transcribe', chunk_length_s: 30, stride_length_s: 5 };
  let palavras = [];
  try {
    const r = await asr(audio, { ...base, return_timestamps: 'word' });
    palavras = (r.chunks || []).map(c => ({ t: c.text.trim(), ini: c.timestamp[0], fim: c.timestamp[1] ?? c.timestamp[0] + 0.3 }));
  } catch {
    log && log('  (modelo sem tempo por palavra; usando tempo por frase — precisão menor)');
    const r = await asr(audio, { ...base, return_timestamps: true });
    for (const c of r.chunks || []) {
      const ws = c.text.trim().split(/\s+/).filter(Boolean), a = c.timestamp[0], b = c.timestamp[1] ?? a + ws.length * 0.35;
      ws.forEach((w, i) => palavras.push({ t: w, ini: a + (b - a) * i / ws.length, fim: a + (b - a) * (i + 1) / ws.length }));
    }
  }
  return palavras.filter(p => p.t && isFinite(p.ini));
}
module.exports = { transcrever };

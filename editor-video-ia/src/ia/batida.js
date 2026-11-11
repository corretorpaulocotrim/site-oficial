// Batida da musica: deteccao de ataques (fluxo de energia) + tempo por autocorrelacao. Para cortar as cenas no ritmo.
const { run, FFMPEG } = require('../midia');

async function analisar(arquivo, { sinal } = {}) {
  const SR = 11025, HOP = 256;
  const raw = await run(FFMPEG, ['-v', 'error', '-i', arquivo, '-t', '180', '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { binario: true, sinal });
  const buf = raw, x = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 4));
  const nf = Math.floor(x.length / HOP), env = new Float32Array(nf);
  for (let f = 0; f < nf; f++) { let s = 0; for (let i = f * HOP; i < (f + 1) * HOP; i++) s += x[i] * x[i]; env[f] = Math.log1p(1000 * s / HOP); }
  const fl = new Float32Array(nf); for (let f = 1; f < nf; f++) fl[f] = Math.max(0, env[f] - env[f - 1]);
  const dt = HOP / SR;
  // tempo (70-180 BPM) pela autocorrelacao do fluxo
  let melhor = 0, lagB = 0;
  for (let bpm = 70; bpm <= 180; bpm += 0.5) {
    const lag = 60 / bpm / dt; let s = 0;
    for (let f = 0; f + lag + 1 < nf; f++) { const l = f + lag, i = Math.floor(l), fr = l - i; s += fl[f] * (fl[i] * (1 - fr) + fl[i + 1] * fr); }
    if (s > melhor) { melhor = s; lagB = lag; }
  }
  if (!lagB) return { bpm: 0, batidas: [] };
  // fase: deslocamento que mais coincide com ataques
  let fase = 0, best = -1;
  for (let ph = 0; ph < lagB; ph += 1) { let s = 0; for (let t = ph; t < nf; t += lagB) s += fl[Math.round(t)] || 0; if (s > best) { best = s; fase = ph; } }
  // refinamento: ataques reais (picos do fluxo) ajustados por regressao linear t = fase + k*periodo
  let media = 0; for (let f = 0; f < nf; f++) media += fl[f]; media /= nf;
  const picos = [];
  for (let f = 1; f < nf - 1; f++) if (fl[f] > media * 3 && fl[f] >= fl[f - 1] && fl[f] > fl[f + 1] && (!picos.length || f - picos[picos.length - 1] > lagB * 0.4)) picos.push(f);
  let per = lagB, f0 = fase;
  if (picos.length >= 4) {
    const ks = picos.map(f => Math.round((f - fase) / lagB)), n = ks.length;
    const mk = ks.reduce((a, b) => a + b, 0) / n, mt = picos.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0; ks.forEach((k, i) => { num += (k - mk) * (picos[i] - mt); den += (k - mk) ** 2; });
    if (den > 0 && Math.abs(num / den / lagB - 1) < 0.08) { per = num / den; f0 = mt - per * mk; }
  }
  while (f0 - per >= 0) f0 -= per;
  const batidas = []; for (let t = f0; t < nf; t += per) if (t >= 0) batidas.push(+(t * dt).toFixed(3));
  return { bpm: +(60 / (per * dt)).toFixed(1), batidas };
}

// Ajusta a faixa principal (sem fala) para que cada corte caia numa batida, mantendo cada cena entre min e max segundos
function encaixar(p, preset, Modelo, batidas, { min = 1.4, max = 4.5 } = {}) {
  if (batidas.length < 4) return 0;
  let n = 0;
  for (let i = 0; i < p.principal.length; i++) {
    const c = p.principal[i]; if (c.fala) continue;
    const lay = Modelo.layout({ ...p, telaFinal: false }, preset), lc = lay.clips[i];
    const alvo = batidas.filter(b => b >= lc.ini + min && b <= lc.ini + max);
    if (!alvo.length) continue;
    const fim = alvo.reduce((a, b) => Math.abs(b - lc.fim) < Math.abs(a - lc.fim) ? b : a);
    const prox = lay.clips[i + 1], tr = prox ? prox.trans.dur : 0;
    const novaDur = fim - lc.ini + tr; // o proximo clipe comeca (fim - transicao): o corte visual fica na batida
    const m = lc.midia, vel = c.velocidade || 1;
    if (m && m.tipo === 'video') { const d = +(novaDur * vel).toFixed(3); if ((c.entrada || 0) + d > m.dur) continue; c.duracao = d; }
    else c.duracao = +novaDur.toFixed(3);
    n++;
  }
  return n;
}
module.exports = { analisar, encaixar };

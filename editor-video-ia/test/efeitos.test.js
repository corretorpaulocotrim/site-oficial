// Ferramentas de acabamento: batida da musica, looks (LUT), estabilizacao, camera lenta suave, RNNoise e recorte por IA
const { fixtures, DADOS } = require('./_ambiente');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const projetos = require('../src/projetos');
const presets = require('../src/presets');
const jobs = require('../src/jobs');
const batida = require('../src/ia/batida');
const looks = require('../src/render/looks');
const modelos = require('../src/ia/modelos');
const { renderizar } = require('../src/render/render');
const { ff, probe } = require('../src/midia');
const M = require('../public/js/modelo');
jobs.registrar('render', (p, c) => renderizar(p.projetoId, p, c));
jobs.registrar('recorte', require('../src/ia/recorte').recortar);
const FX = path.join(DADOS, 'fixtures');

test('batida: detecta 120 BPM e encaixa os cortes nas batidas', { timeout: 60000 }, async () => {
  const click = path.join(FX, 'click120.wav');
  await ff(['-f', 'lavfi', '-i', "aevalsrc='0.8*sin(2*PI*1000*t)*exp(-60*mod(t,0.5))':s=22050:d=12", click]);
  const r = await batida.analisar(click);
  assert.ok(Math.abs(r.bpm - 120) <= 2, 'bpm ' + r.bpm);
  const p = M.projetoVazio('b'); p.midias = [{ id: 'i', tipo: 'imagem' }];
  p.principal = [1, 2, 3, 4].map(k => ({ id: 'c' + k, midia: 'i', duracao: 2.3 }));
  const preset = presets.obter('social-performance');
  const n = batida.encaixar(p, preset, M, r.batidas);
  assert.ok(n >= 3);
  const lay = M.layout({ ...p, telaFinal: false }, preset);
  for (const c of lay.clips.slice(1)) { const corte = c.ini; /* a transicao comeca na batida */ assert.ok(r.batidas.some(b => Math.abs(b - corte) < 0.06), 'corte fora da batida: ' + corte); }
});

test('looks: LUT 3D valida e render com look + cor automatica', { timeout: 120000 }, async () => {
  const f = await fixtures();
  for (const l of looks.lista()) { const linhas = fs.readFileSync(looks.arquivo(l.id), 'utf8').trim().split('\n'); assert.strictEqual(linhas.length, 2 + 33 ** 3); }
  const p = projetos.criar({ nome: 'Look', formato: '1x1' });
  const m = await projetos.importar(p.id, 'sala.jpg', fs.createReadStream(f.foto), 1e9);
  const pp = projetos.ler(p.id); pp.principal = [{ id: 'c', midia: m.id, duracao: 2, look: 'quente-rio', autoCor: true }]; pp.telaFinal = false; projetos.salvar(p.id, pp);
  const j = await jobs.aguardar(jobs.criar('render', { projetoId: p.id, formato: '1x1', qualidade: 'previa' }).id);
  assert.strictEqual(j.estado, 'concluido', j.erro); assert.ok(j.resultado.validacao.ok);
});

test('estabilizacao, camera lenta suave e voz com RNNoise', { timeout: 300000 }, async () => {
  const tremido = path.join(FX, 'tremido.mp4');
  await ff(['-f', 'lavfi', '-i', 'testsrc2=s=800x1400:r=30:d=3', '-f', 'lavfi', '-i', 'anoisesrc=d=3:a=0.2', '-filter_complex', "[0]crop=720:1280:'40+30*sin(t*17)':'60+30*cos(t*13)'[v]", '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', tremido]);
  const p = projetos.criar({ nome: 'Estab', formato: '9x16' });
  const m = await projetos.importar(p.id, 'tremido.mp4', fs.createReadStream(tremido), 1e9);
  const pp = projetos.ler(p.id);
  pp.principal = [{ id: 'a', midia: m.id, entrada: 0, duracao: 2, estabilizar: true }, { id: 'b', midia: m.id, entrada: 1, duracao: 1, velocidade: 0.5, suavizar: true, transicao: { tipo: 'corte' } }];
  pp.telaFinal = false; projetos.salvar(p.id, pp);
  const j = await jobs.aguardar(jobs.criar('render', { projetoId: p.id, formato: '9x16', qualidade: 'previa' }).id);
  assert.strictEqual(j.estado, 'concluido', j.erro); assert.ok(j.resultado.validacao.ok, JSON.stringify(j.resultado.validacao));
  assert.ok(Math.abs(j.resultado.validacao.duracao - (2 + 2 - 1 / 30)) < 0.2, 'trecho em 0,5x dura o dobro');
  assert.ok(fs.readdirSync(projetos.arq(p.id, 'cache')).some(x => x.endsWith('.trf')), 'passada de analise do vid.stab');
  if (!modelos.caminho('rnnoise')) console.log('# aviso: modelo RNNoise nao baixado (sem rede) — usado afftdn');
});

test('recorte por IA (RobustVideoMatting): mascara alinhada e composicao', { timeout: 300000 }, async t => {
  try { await modelos.garantir('rvm'); } catch (e) { t.skip('modelo indisponivel sem rede: ' + e.message); return; }
  const f = await fixtures();
  const p = projetos.criar({ nome: 'Recorte', formato: '9x16' });
  const mv = await projetos.importar(p.id, 'fala.mp4', fs.createReadStream(f.video), 1e9);
  const mf = await projetos.importar(p.id, 'sala.jpg', fs.createReadStream(f.foto), 1e9);
  const r = await jobs.aguardar(jobs.criar('recorte', { projetoId: p.id, midiaId: mv.id }).id);
  assert.strictEqual(r.estado, 'concluido', r.erro);
  const pm = projetos.ler(p.id), mm = pm.midias.find(x => x.id === mv.id);
  const info = await probe(projetos.arq(p.id, mm.recorte));
  assert.ok(Math.abs(info.dur - 8) < 0.2, 'mascara cobre o video inteiro: ' + info.dur);
  pm.principal = [{ id: 'c', midia: mv.id, entrada: 0, duracao: 4 }]; pm.broll = [{ id: 'b', midia: mf.id, inicio: 1, duracao: 2, pip: true }]; pm.telaFinal = false; projetos.salvar(p.id, pm);
  const j = await jobs.aguardar(jobs.criar('render', { projetoId: p.id, formato: '9x16', qualidade: 'previa' }).id);
  assert.strictEqual(j.estado, 'concluido', j.erro); assert.ok(j.resultado.validacao.ok);
});

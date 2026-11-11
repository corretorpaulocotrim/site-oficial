// API HTTP real: status, criar projeto, upload, render, servir arquivo com Range (seek do player)
const { fixtures, DADOS } = require('./_ambiente');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const PORTA = 3900 + Math.floor(Math.random() * 90), B = `http://127.0.0.1:${PORTA}`;
let srv;
test.before(async () => {
  srv = spawn(process.execPath, [path.join(__dirname, '..', 'src', 'server.js')], { env: { ...process.env, PORT: PORTA, DADOS_DIR: DADOS + '-srv', NO_OPEN: '1' }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { await fetch(B + '/api/status'); return; } catch { await new Promise(r => setTimeout(r, 200)); } }
});
test.after(() => srv && srv.kill());
test('API ponta a ponta', { timeout: 300000 }, async () => {
  const f = await fixtures();
  const st = await (await fetch(B + '/api/status')).json();
  assert.match(st.ffmpeg, /ffmpeg version/);
  const p = await (await fetch(B + '/api/projetos', { method: 'POST', body: JSON.stringify({ nome: 'API' }), headers: { 'Content-Type': 'application/json' } })).json();
  const up = await (await fetch(`${B}/api/projetos/${p.id}/midia?nome=fala.mp4`, { method: 'POST', body: fs.readFileSync(f.video) })).json();
  assert.strictEqual(up.midia.tipo, 'video');
  const pj = await (await fetch(`${B}/api/projetos/${p.id}`)).json();
  pj.principal.push({ id: 'c1', midia: up.midia.id, entrada: 0, duracao: 3 });
  const s = await fetch(`${B}/api/projetos/${p.id}`, { method: 'PUT', body: JSON.stringify(pj), headers: { 'Content-Type': 'application/json' } });
  assert.strictEqual(s.status, 200);
  const [t] = await (await fetch(`${B}/api/projetos/${p.id}/render`, { method: 'POST', body: JSON.stringify({ qualidade: 'previa' }), headers: { 'Content-Type': 'application/json' } })).json();
  let j; for (let i = 0; i < 240; i++) { j = await (await fetch(`${B}/api/tarefas/${t.id}`)).json(); if (['concluido', 'erro'].includes(j.estado)) break; await new Promise(r => setTimeout(r, 500)); }
  assert.strictEqual(j.estado, 'concluido', j.erro);
  const r = await fetch(`${B}/arquivos/${p.id}/${j.resultado.arquivo}`, { headers: { Range: 'bytes=0-99' } });
  assert.strictEqual(r.status, 206); assert.strictEqual((await r.arrayBuffer()).byteLength, 100);
  const trav = await fetch(`${B}/arquivos/${p.id}/..%2F..%2Fjobs.json`);
  assert.ok(trav.status >= 400, 'bloqueia path traversal');
});

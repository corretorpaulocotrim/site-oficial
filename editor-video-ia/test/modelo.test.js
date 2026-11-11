const test = require('node:test');
const assert = require('node:assert');
const M = require('../public/js/modelo');

test('layout: clipes se sobrepoem exatamente na duracao da transicao', () => {
  const p = M.projetoVazio('t', '9x16', 'x');
  p.midias = [{ id: 'v', tipo: 'video', dur: 10 }, { id: 'i', tipo: 'imagem' }];
  p.principal = [{ id: 'a', midia: 'v', entrada: 0, duracao: 4 }, { id: 'b', midia: 'i', duracao: 3, transicao: { tipo: 'fade', dur: 0.5 } }, { id: 'c', midia: 'v', entrada: 5, duracao: 4, velocidade: 2, transicao: { tipo: 'corte' } }];
  p.telaFinal = false;
  const L = M.layout(p, { transicoes: { lista: ['fade'], dur: 0.35 }, marca: {} });
  assert.strictEqual(L.clips[1].ini, 3.5);
  assert.ok(Math.abs(L.clips[2].ini - (6.5 - 1 / 30)) < 1e-9);
  assert.ok(Math.abs(L.total - (L.clips[2].ini + 2)) < 1e-9, 'velocidade 2x divide a duracao');
});
test('layout: tela final entra no fim e define fimConteudo', () => {
  const p = M.projetoVazio('t'); p.midias = [{ id: 'i', tipo: 'imagem' }]; p.principal = [{ id: 'a', midia: 'i', duracao: 3 }];
  const L = M.layout(p, { transicoes: { lista: ['fade'], dur: 0.35 }, marca: { telaFinal: true, duracaoTelaFinal: 3.5 } });
  assert.strictEqual(L.clips.length, 2); assert.strictEqual(L.clips[1].clip.tipo, 'telaFinal');
  assert.ok(L.fimConteudo < L.total);
});
test('legendas: agrupa, quebra em pausa e aplica correcoes; emoji contextual', () => {
  const ws = 'olha a piscina do predio . tem fgts sim'.split(' ').map((t, i) => ({ t, ini: i * 0.4 + (i > 4 ? 1 : 0), fim: i * 0.4 + 0.35 + (i > 4 ? 1 : 0) }));
  const g = M.agrupar(ws, 3, 22, { fgts: 'FGTS' });
  assert.ok(g.length >= 3);
  assert.ok(g.some(x => x.palavras.some(p => p.t === 'FGTS')));
  assert.strictEqual(g[0].emoji, '1f3ca');
  const r = M.reescrever(g[0], 'Olhe a piscina');
  assert.strictEqual(r.palavras.length, 3); assert.strictEqual(r.palavras[0].ini, g[0].ini);
});

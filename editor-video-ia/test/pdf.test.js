require('./_ambiente');
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { fixtures, DADOS } = require('./_ambiente');
const PDF = require('../src/ia/pdf');

test('PDF Intelligence: classifica paginas, extrai fatos com pagina e alerta tabela vencida', { timeout: 120000 }, async () => {
  const f = await fixtures();
  const a = await PDF.analisar(f.pdf, path.join(DADOS, 'pdfout'), 'pdfout', { log: () => {} });
  assert.strictEqual(a.paginas.length, 3);
  assert.deepStrictEqual(a.paginas.map(p => p.categoria), ['planta', 'lazer', 'condicoes']);
  const m = a.fatos.find(x => x.campo === 'metragem'); assert.ok(m && m.pagina === 1 && /45.5 a 62.1 m²/.test(m.valor), JSON.stringify(m));
  assert.ok(a.fatos.some(x => x.campo === 'tipologia' && x.pagina === 1));
  assert.ok(a.fatos.some(x => x.campo === 'preco' && x.pagina === 3));
  assert.ok(a.fatos.some(x => x.campo === 'endereco' && x.pagina === 2));
  assert.ok(a.alertas.some(x => /validade encerrada/.test(x.texto)), 'deve alertar tabela vencida');
  assert.ok(a.fatos.filter(x => x.campo === 'nome').every(x => x.confirmar), 'nome inferido exige confirmacao');
  assert.match(a.resumo, /3 páginas/);
});

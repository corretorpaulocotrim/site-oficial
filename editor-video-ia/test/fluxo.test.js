// Fluxo completo do nucleo: projeto -> importar video/PDF/foto/musica -> Auto Edit -> editar -> renderizar -> validar -> reabrir
const { fixtures } = require('./_ambiente');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const projetos = require('../src/projetos');
const jobs = require('../src/jobs');
const diretor = require('../src/ia/diretor');
const { renderizar } = require('../src/render/render');
const { probe } = require('../src/midia');
const M = require('../public/js/modelo');
jobs.registrar('pdf', diretor.processarPdf); jobs.registrar('autoedit', diretor.autoEdit); jobs.registrar('render', (p, c) => renderizar(p.projetoId, p, c));

let pid;
test('importa midias e analisa PDF como tarefa', { timeout: 180000 }, async () => {
  const f = await fixtures();
  const p = projetos.criar({ nome: 'Teste', formato: '9x16', presetId: 'social-performance', empreendimento: { nome: 'Residencial Teste', bairro: 'Centro' } });
  pid = p.id;
  for (const a of [f.video, f.pdf, f.foto, f.musica]) {
    const m = await projetos.importar(pid, require('path').basename(a), fs.createReadStream(a), 1e9);
    if (m.tipo === 'pdf') { const j = await jobs.aguardar(jobs.criar('pdf', { projetoId: pid, midiaId: m.id }).id); assert.strictEqual(j.estado, 'concluido', j.erro); }
  }
  const pp = projetos.ler(pid);
  assert.strictEqual(pp.midias.filter(m => m.tipo === 'pagina').length, 3);
  assert.ok(pp.midias.find(m => m.tipo === 'video').audio);
});
test('Auto Edit corta pausas, encaixa materiais e registra sugestoes', { timeout: 300000 }, async () => {
  const j = await jobs.aguardar(jobs.criar('autoedit', { projetoId: pid, posicionamento: 'medio-alto', objetivo: 'interesse', duracao: 15, modo: 'criativo' }).id);
  assert.strictEqual(j.estado, 'concluido', j.erro);
  const p = projetos.ler(pid);
  assert.ok(p.principal.length >= 3, 'pausas viram cortes: ' + p.principal.length);
  assert.ok(p.principal.every(c => c.fala));
  assert.ok(p.textos.some(t => t.tipo === 'gancho'));
  assert.ok(p.sugestoes.length > 0);
  assert.ok(p.roteiro && p.roteiro.cenas.length);
  assert.ok(!p.broll.some(b => (M.midiaDe(p, b.midia) || {}).categoria === 'condicoes'), 'tabela de preco nao entra');
});
test('edicao manual + render previa 9:16 e final 1:1 validados', { timeout: 600000 }, async () => {
  const p = projetos.ler(pid);
  const foto = p.midias.find(m => m.tipo === 'imagem');
  p.broll.push({ id: 'bt', midia: foto.id, inicio: 1, duracao: 1.5, pip: true, rotulo: 'SALA' });
  p.legendas = { ativas: true, grupos: M.agrupar([{ t: 'olha', ini: 0.2, fim: 0.5 }, { t: 'a', ini: 0.5, fim: 0.6 }, { t: 'piscina', ini: 0.6, fim: 1.1 }], 3, 22) };
  projetos.salvar(pid, p);
  for (const [formato, qualidade] of [['9x16', 'previa'], ['1x1', 'final']]) {
    const j = await jobs.aguardar(jobs.criar('render', { projetoId: pid, formato, qualidade }).id);
    assert.strictEqual(j.estado, 'concluido', j.erro);
    assert.ok(j.resultado.validacao.ok, JSON.stringify(j.resultado.validacao));
    const i = await probe(projetos.arq(pid, j.resultado.arquivo));
    assert.ok(i.audio && i.video);
  }
  const p2 = projetos.ler(pid);
  assert.strictEqual(p2.exportacoes.length, 1);
  assert.ok(fs.existsSync(projetos.arq(pid, p2.exportacoes[0].capa)));
});
test('cancelamento interrompe a renderizacao', { timeout: 120000 }, async () => {
  const t = jobs.criar('render', { projetoId: pid, formato: '16x9', qualidade: 'final' });
  await new Promise(r => setTimeout(r, 700));
  jobs.cancelar(t.id);
  const j = await jobs.aguardar(t.id);
  assert.ok(['cancelado', 'concluido'].includes(j.estado));
});
test('salvar, versionar, reabrir e duplicar', () => {
  const p = projetos.ler(pid); p.nome = 'Renomeado'; projetos.salvar(pid, p, { versao: true });
  assert.strictEqual(projetos.ler(pid).nome, 'Renomeado');
  assert.ok(projetos.versoes(pid).length >= 1);
  const d = projetos.duplicar(pid);
  assert.notStrictEqual(d.id, pid); assert.strictEqual(projetos.ler(d.id).principal.length, p.principal.length);
});

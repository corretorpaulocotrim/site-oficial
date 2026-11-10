// Formatos de video do mercado (2026), limite de corte, variacoes em lote, fundo verde, capitulos/VTT
const { fixtures, DADOS } = require('./_ambiente');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const projetos = require('../src/projetos');
const jobs = require('../src/jobs');
const diretor = require('../src/ia/diretor');
const { renderizar } = require('../src/render/render');
const { ff, run, FFMPEG } = require('../src/midia');
const M = require('../public/js/modelo');
jobs.registrar('render', (p, c) => renderizar(p.projetoId, p, c));

test('limite de corte: nunca remove mais que maxCorte do video', { timeout: 60000 }, async () => {
  const f = await fixtures();
  const livre = await diretor.detectarFala(f.video, 8, 0.45, 0.05, null, 1);
  const limitado = await diretor.detectarFala(f.video, 8, 0.45, 0.05, null, 0.1);
  assert.ok(8 - livre.falado > 2, 'sem limite corta as pausas: ' + livre.falado);
  assert.ok(8 - limitado.falado <= 0.8 + 0.3, 'com limite de 10% corta no maximo ~0,8s: ' + limitado.falado);
  assert.ok(limitado.pausasTotais > limitado.pausas);
});

test('formatos de roteiro: bairro (dado real do site), condicao, compraria e CTA com palavra-codigo', () => {
  const p = projetos.criar({ nome: 'F', empreendimento: { nome: 'Residencial X', bairro: 'Porto Maravilha' } });
  const b = diretor.gerarRoteiroBase(p, { formato: 'bairro', duracao: 30 });
  assert.match(b.gancho, /3 motivos para morar no Porto Maravilha/);
  assert.strictEqual(b.cenas.length, 3);
  assert.ok(b.cenas.every(c => c.fonte === 'site: No dia a dia do bairro'));
  assert.match(b.cenas[0].fala, /VLT/, 'primeiro motivo vem do transporte real do bairro');
  assert.match(b.cta, /^Comente BAIRRO/);
  const c = diretor.gerarRoteiroBase(p, { formato: 'condicao' });
  assert.deepStrictEqual(c.cenas.map(x => x.rotulo), ['ENTRADA', 'DURANTE A OBRA', 'NAS CHAVES']);
  assert.ok(!c.cenas.some(x => /R\$/.test(x.fala)), 'sem preco quando o projeto nao informa');
  const q = diretor.gerarRoteiroBase(p, { formato: 'compraria', palavraCta: 'quero apê!' });
  assert.match(q.gancho, /Você compraria/);
  assert.strictEqual(q.palavraCta, 'QUEROAPÊ');
  const sem = diretor.gerarRoteiroBase(projetos.criar({ empreendimento: { bairro: 'Bairro Inexistente' } }), { formato: 'bairro' });
  assert.ok(sem.avisos.some(a => /Sem dados/.test(a)), 'nunca inventa dado de bairro');
});

test('comparativo usa empreendimentos reais do catalogo com capa', { timeout: 60000 }, async () => {
  const cat = require('../src/catalogo').catalogo();
  const alvo = cat.find(x => x.img && fs.existsSync(path.join(__dirname, '..', '..', x.img)) && cat.filter(y => y.local === x.local && y.img && fs.existsSync(path.join(__dirname, '..', '..', y.img))).length >= 2);
  if (!alvo) return; // catalogo do site indisponivel neste ambiente
  const p = projetos.criar({ empreendimento: { nome: alvo.nome, bairro: alvo.local } });
  const r = await diretor.gerarRoteiro(p, { formato: 'comparativo', duracao: 30 });
  assert.ok(r.cenas.length >= 2 && r.cenas.every(c => c.fonte === 'catálogo do site' && c.midia));
  assert.strictEqual(r.cenas[0].textoTela, alvo.nome);
  assert.ok(projetos.ler(p.id).midias.filter(m => m.origemCatalogo).length >= 2);
});

test('variacoes: 4 angulos com ganchos e CTAs diferentes, midia por hard link', { timeout: 60000 }, async () => {
  const f = await fixtures();
  const p = projetos.criar({ nome: 'Base', empreendimento: { nome: 'Res Y', bairro: 'Centro', plantas: '2 quartos' } });
  const m = await projetos.importar(p.id, 'fala.mp4', fs.createReadStream(f.video), 1e9);
  const pp = projetos.ler(p.id); pp.principal = [{ id: 'c1', midia: m.id, entrada: 0, duracao: 4 }]; pp.textos = [{ id: 't', tipo: 'gancho', texto: 'x', inicio: 0, duracao: 3 }]; projetos.salvar(p.id, pp);
  const vs = diretor.gerarVariacoes(p.id, {});
  assert.strictEqual(vs.length, 4);
  assert.strictEqual(new Set(vs.map(v => v.gancho)).size, 4);
  assert.strictEqual(new Set(vs.map(v => v.palavraCta)).size, 4);
  const v0 = projetos.ler(vs[0].id);
  assert.strictEqual(v0.textos.find(t => t.tipo === 'gancho').texto, vs[0].gancho);
  const a = fs.statSync(projetos.arq(p.id, m.arquivo)), b = fs.statSync(projetos.arq(vs[0].id, m.arquivo));
  assert.ok(a.ino === b.ino || a.size === b.size);
});

test('fundo verde: apresentador recortado sobre o material e VTT na exportacao', { timeout: 300000 }, async () => {
  const f = await fixtures();
  const verde = path.join(DADOS, 'fixtures', 'verde.mp4');
  await ff(['-f', 'lavfi', '-i', 'color=c=0x00B140:s=720x1280:r=30:d=4', '-f', 'lavfi', '-i', 'color=c=0xC03030:s=240x700:r=30:d=4', '-f', 'lavfi', '-i', "sine=f=200:d=4", '-filter_complex', '[0][1]overlay=240:400[v]', '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', verde]);
  const p = projetos.criar({ nome: 'Verde', formato: '9x16' });
  const mv = await projetos.importar(p.id, 'verde.mp4', fs.createReadStream(verde), 1e9);
  const mf = await projetos.importar(p.id, 'sala.jpg', fs.createReadStream(f.foto), 1e9);
  const pp = projetos.ler(p.id);
  pp.midias.find(x => x.id === mv.id).fundoVerde = true;
  pp.principal = [{ id: 'c1', midia: mv.id, entrada: 0, duracao: 4 }];
  pp.broll = [{ id: 'b1', midia: mf.id, inicio: 1, duracao: 2.5, pip: true, rotulo: 'SALA' }];
  pp.legendas = { ativas: true, grupos: M.agrupar([{ t: 'olha', ini: 0.2, fim: 0.6 }, { t: 'a', ini: 0.6, fim: 0.8 }, { t: 'sala', ini: 0.8, fim: 1.2 }], 3, 22) };
  pp.telaFinal = false; projetos.salvar(p.id, pp);
  const j = await jobs.aguardar(jobs.criar('render', { projetoId: p.id, formato: '9x16', qualidade: 'final' }).id);
  assert.strictEqual(j.estado, 'concluido', j.erro);
  assert.ok(j.resultado.vtt && fs.readFileSync(projetos.arq(p.id, j.resultado.vtt), 'utf8').startsWith('WEBVTT'));
  const pix = async (t, x, y) => { const out = await run(FFMPEG, ['-v', 'error', '-ss', String(t), '-i', projetos.arq(p.id, j.resultado.arquivo), '-frames:v', '1', '-vf', `crop=4:4:${x}:${y},scale=1:1`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { stdout: true }); return [...Buffer.from(out, 'latin1')]; };
  const fora = await pix(0.5, 40, 300);       // sem sobreposicao: fundo trocado pela cor da marca (nao verde)
  assert.ok(!(fora[1] > 120 && fora[0] < 80), 'fundo verde removido: ' + fora);
  const corpo = await pix(2.2, 740, 1450);    // durante a sobreposicao: o recorte (vermelho) aparece no canto inferior direito
  assert.ok(corpo[0] > 120 && corpo[1] < 90, 'apresentador recortado visivel: ' + corpo);
});

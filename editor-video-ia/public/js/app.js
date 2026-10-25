// Navegacao e paginas do AI Studio (inicio, projetos, auto edit, PDF intelligence, presenter, presets, efeitos, renders, config)
const App = (() => {
  const V = () => $('#vista');
  let timerPagina = null, catalogo = null;
  const cat = async () => catalogo || (catalogo = await API.get('/api/catalogo').catch(() => []));
  const POS = [['economico', 'Econômico / MCMV'], ['medio-alto', 'Médio-alto padrão'], ['luxo', 'Luxo / alto padrão'], ['institucional', 'Institucional (marca Paulo Cotrim)']];
  const OBJ = [['interesse', 'Gerar interesse (captação)'], ['diferenciais', 'Apresentar diferenciais'], ['desejo', 'Criar desejo'], ['objecoes', 'Responder objeções'], ['institucional', 'Institucional']];
  const PRESET_POR_POS = { economico: 'social-performance', 'medio-alto': 'real-estate-dynamic', luxo: 'cinematic-luxury', institucional: 'premium-editorial' };
  const opts = (lista, v) => lista.map(([a, b]) => `<option value="${a}" ${a === v ? 'selected' : ''}>${b}</option>`).join('');

  function login() {
    if ($('#login')) return;
    const c = document.createElement('div'); c.className = 'modal'; c.id = 'login';
    c.innerHTML = `<div style="width:340px;text-align:center"><img src="/api/marca/logo/monograma" style="width:64px"><h2>AI Studio</h2><input type="password" id="lsenha" placeholder="Senha"><button class="btn pri" id="lok" style="width:100%;margin-top:10px;justify-content:center">Entrar</button></div>`;
    document.body.appendChild(c);
    const ir = async () => { try { await API.post('/api/login', { senha: $('#lsenha').value }); c.remove(); rotear(); } catch (e) { toast(e.message, true); } };
    $('#lok').onclick = ir; $('#lsenha').onkeydown = e => e.key === 'Enter' && ir(); $('#lsenha').focus();
  }

  // ---------- INICIO ----------
  async function inicio() {
    const [ps, st] = await Promise.all([API.get('/api/projetos'), API.get('/api/status')]);
    const h = new Date().getHours(), sauda = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    const rec = st.recursos;
    V().innerHTML = `<div class="pagina"><h1>${sauda}, Paulo.</h1><p class="sub">Envie o vídeo e o PDF: o estúdio monta, legenda e entrega em todos os formatos — e você ajusta o que quiser.</p>
      <div class="grade" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
        <div class="cartao clica" onclick="location.hash='#/autoedit'"><h2>✦ Auto Edit</h2><p class="sub" style="margin:0">Vídeo bruto + PDF → campanha montada com roteiro, legendas, cortes e efeitos.</p></div>
        <div class="cartao clica" onclick="location.hash='#/novo'"><h2>＋ Editor</h2><p class="sub" style="margin:0">Linha do tempo multifaixa para montar à mão, do seu jeito.</p></div>
        <div class="cartao clica" onclick="location.hash='#/pdf'"><h2>▤ PDF Intelligence</h2><p class="sub" style="margin:0">Lê o book, separa plantas, lazer e localização, extrai dados com página de origem e escreve o roteiro.</p></div>
      </div>
      <h3>Projetos recentes</h3>
      ${ps.length ? `<div class="grade">${ps.slice(0, 8).map(cartaoProjeto).join('')}</div>` : '<div class="vazio">Nenhum projeto ainda. Comece pelo Auto Edit.</div>'}
      <h3>Motor</h3><div class="linha">
        <span class="chip ok">Edição e render local</span>
        <span class="chip ${rec.transcricao.baixado ? 'ok' : 'av'}">Legendas IA: ${rec.transcricao.baixado ? 'pronto' : 'baixa o modelo no 1º uso'}</span>
        <span class="chip ${rec.ocr.ativo ? 'ok' : ''}">OCR português</span>
        <span class="chip ${rec.roteiroIA.ativo ? 'ok' : ''}">Roteiro com Claude: ${rec.roteiroIA.ativo ? 'ativo' : 'desligado (opcional)'}</span>
        <span class="chip ${rec.vozIA.ativo ? 'ok' : ''}">Voz IA: ${rec.vozIA.ativo ? 'ativa' : 'desligada (opcional)'}</span></div></div>`;
  }
  const cartaoProjeto = p => `<div class="cartao clica" onclick="location.hash='#/editor/${p.id}'"><div class="thumb" style="${p.thumb ? `background-image:url('${API.arq(p.id, p.thumb)}')` : ''}"></div><b>${esc(p.nome)}</b><div style="color:var(--mut);font-size:12px">${esc(p.empreendimento || '')} · ${p.formato.replace('x', ':')} · ${dataBR(p.atualizado)}</div></div>`;

  // ---------- PROJETOS ----------
  async function projetos() {
    const ps = await API.get('/api/projetos');
    V().innerHTML = `<div class="pagina"><div class="linha"><h1>Projetos</h1><span class="esp"></span><a class="btn pri" href="#/novo">＋ Novo projeto</a></div><p class="sub">${ps.length} projeto(s) salvos, com histórico de versões.</p>
      ${ps.length ? `<table class="t"><tr><th></th><th>Projeto</th><th>Empreendimento</th><th>Formato</th><th>Mídias</th><th>Exportações</th><th>Atualizado</th><th></th></tr>${ps.map(p => `<tr><td><div class="thumb" style="width:72px;margin:0;${p.thumb ? `background-image:url('${API.arq(p.id, p.thumb)}')` : ''}"></div></td><td><a href="#/editor/${p.id}"><b>${esc(p.nome)}</b></a></td><td>${esc(p.empreendimento || '—')}</td><td>${p.formato.replace('x', ':')}</td><td>${p.midias}</td><td>${p.exportacoes}</td><td>${dataBR(p.atualizado)}</td>
        <td class="linha"><a class="btn pq" href="#/editor/${p.id}">Abrir</a><button class="btn pq" data-dup="${p.id}">Duplicar</button><button class="btn pq perigo" data-del="${p.id}">Excluir</button></td></tr>`).join('')}</table>` : '<div class="vazio">Nenhum projeto.</div>'}</div>`;
    $$('[data-dup]').forEach(b => b.onclick = async () => { await API.post(`/api/projetos/${b.dataset.dup}/duplicar`); toast('Projeto duplicado'); projetos(); });
    $$('[data-del]').forEach(b => b.onclick = async () => { if (!confirm('Excluir o projeto e todos os arquivos dele? Não dá para desfazer.')) return; await API.del('/api/projetos/' + b.dataset.del); projetos(); });
  }

  // ---------- NOVO ----------
  async function formProjeto(alvo, botao, aoCriar) {
    const [presets, c] = await Promise.all([API.get('/api/presets'), cat()]);
    alvo.innerHTML = `<div class="grade" style="grid-template-columns:1fr 1fr">
      <div>${'<label class="c">Nome do projeto</label><input type="text" id="np-nome" placeholder="ex.: Beon Porto — Reels de lançamento">'}
        <label class="c">Empreendimento do catálogo do site (Sawala) — opcional</label><input type="text" id="np-cat" list="np-dl" placeholder="digite para buscar…"><datalist id="np-dl">${c.map(e => `<option value="${esc(e.nome)}">${esc(e.local || '')} · ${esc(e.incorporadora || '')}</option>`).join('')}</datalist>
        <label class="c">Formato principal</label><select id="np-fmt">${Object.entries(Modelo.FORMATOS).map(([k, f]) => `<option value="${k}">${f.nome}</option>`).join('')}</select></div>
      <div><label class="c">Estilo (preset)</label><select id="np-preset">${presets.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('')}</select><p class="sub" id="np-desc" style="margin-top:8px;font-size:12px"></p></div></div>
      <button class="btn pri" id="np-ok" style="margin-top:14px">${botao}</button>`;
    const desc = () => { const p = presets.find(x => x.id === $('#np-preset').value); $('#np-desc').textContent = p ? p.descricao : ''; }; desc();
    $('#np-preset').onchange = desc;
    $('#np-ok').onclick = async () => {
      const e = c.find(x => x.nome === $('#np-cat').value);
      const p = await API.post('/api/projetos', { nome: $('#np-nome').value || (e ? e.nome : 'Novo projeto'), formato: $('#np-fmt').value, presetId: $('#np-preset').value, empreendimento: e ? { nome: e.nome, bairro: e.local || '', construtora: e.incorporadora || '', status: e.status || '', plantas: e.plantas || '', preco: e.preco_texto || '', fonte: 'catalogo', url: e.url || '' } : undefined });
      aoCriar(p);
    };
  }
  async function novo() {
    V().innerHTML = `<div class="pagina" style="max-width:860px"><h1>Novo projeto</h1><p class="sub">Comece vazio no editor. Para montagem automática use o Auto Edit.</p><div class="cartao" id="np"></div></div>`;
    formProjeto($('#np'), 'Criar e abrir no editor', p => location.hash = '#/editor/' + p.id);
  }

  // ---------- AUTO EDIT ----------
  async function autoedit(pid) {
    const [presets, st] = await Promise.all([API.get('/api/presets'), API.get('/api/status')]);
    V().innerHTML = `<div class="pagina" style="max-width:980px"><h1>✦ Auto Edit</h1><p class="sub">1. Envie o material · 2. Escolha objetivo, duração e estilo · 3. O estúdio monta e você revisa no editor.</p>
      <div class="cartao" id="ae1"></div>
      <div class="cartao" id="ae2" style="margin-top:14px;display:none"><h2>Material</h2><div class="drop" id="ae-drop">Arraste o vídeo em que você fala, o PDF do empreendimento, fotos e música<br><small>tudo de uma vez — PDF é analisado automaticamente</small></div><input type="file" id="ae-file" multiple hidden accept="video/*,image/*,audio/*,application/pdf,.pdf,.mov,.heic"><div id="ae-lista" style="margin-top:10px"></div></div>
      <div class="cartao" id="ae3" style="margin-top:14px;display:none"><h2>Direção criativa</h2>
        <div class="grade" style="grid-template-columns:1fr 1fr 1fr">
          <div><label class="c">Objetivo</label><select id="ae-obj">${opts(OBJ, 'interesse')}</select></div>
          <div><label class="c">Posicionamento</label><select id="ae-pos">${opts(POS, 'medio-alto')}</select></div>
          <div><label class="c">Duração alvo</label><select id="ae-dur">${[15, 30, 45, 60, 90].map(d => `<option value="${d}" ${d === 30 ? 'selected' : ''}>${d} segundos</option>`).join('')}</select></div>
          <div><label class="c">Estilo (preset)</label><select id="ae-preset">${presets.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('')}</select></div>
          <div><label class="c">Edição</label><select id="ae-modo"><option value="criativo">Criativa (mais recursos visuais)</option><option value="conservador">Conservadora (preserva o original)</option></select></div>
          <div><label class="c">Gancho (opcional)</label><input type="text" id="ae-gancho" placeholder="deixe vazio para sugerir"></div></div>
        <div class="linha" style="margin-top:12px"><label class="linha"><input type="checkbox" id="ae-tab" checked> Ocultar tabelas de preço (valor só no WhatsApp)</label>
        <label class="linha"><input type="checkbox" id="ae-ia" ${st.recursos.roteiroIA.ativo ? 'checked' : 'disabled'}> Refinar roteiro com Claude ${st.recursos.roteiroIA.ativo ? '' : '<small style="color:var(--mut)">(configure ANTHROPIC_API_KEY)</small>'}</label>
        <label class="linha"><input type="checkbox" id="ae-leg" checked> Legendas automáticas</label></div>
        <button class="btn pri" id="ae-go" style="margin-top:14px">✦ Montar campanha</button><div id="ae-prog" style="margin-top:12px"></div></div></div>`;
    $('#ae-pos').onchange = () => { $('#ae-preset').value = PRESET_POR_POS[$('#ae-pos').value]; };
    $('#ae-preset').value = PRESET_POR_POS['medio-alto'];
    let projeto = null; const pend = new Set();
    const etapa2 = async p => {
      projeto = p; $('#ae1').innerHTML = `<div class="linha"><b>Projeto:</b> ${esc(p.nome)} <span class="esp"></span><a class="btn pq" href="#/editor/${p.id}">Abrir no editor</a></div>`;
      $('#ae2').style.display = $('#ae3').style.display = 'block'; if (p.presetId) $('#ae-preset').value = p.presetId;
      listar();
    };
    const listar = async () => { const p = await API.get('/api/projetos/' + projeto.id); projeto = p; $('#ae-lista').innerHTML = p.midias.filter(m => !m.pdfId).map(m => `<div class="linha" style="padding:3px 0"><span class="chip">${m.tipo}</span> ${esc(m.nome)} ${m.dur ? '· ' + Modelo.fmtTempo(m.dur) : ''}</div>`).join('') + (pend.size ? `<div class="chip av" style="margin-top:6px">Analisando ${pend.size} arquivo(s)…</div>` : ''); $('#ae-go').disabled = pend.size > 0; };
    const enviar = async fs => { for (const f of fs) { const d = document.createElement('div'); d.innerHTML = `${esc(f.name)}<div class="barra"><i></i></div>`; $('#ae-lista').appendChild(d); try { const r = await API.upload(projeto.id, f, x => $('i', d).style.width = x * 100 + '%'); for (const t of [r.tarefa, r.proxy].filter(Boolean)) { pend.add(t); API.esperar(t).then(j => { pend.delete(t); if (j.estado === 'erro') toast(j.rotulo + ': ' + j.erro, true); listar(); }); } } catch (e) { toast(e.message, true); } } listar(); };
    const drop = $('#ae-drop'); drop.onclick = () => $('#ae-file').click(); $('#ae-file').onchange = e => enviar([...e.target.files]);
    drop.ondragover = e => { e.preventDefault(); drop.classList.add('on'); }; drop.ondragleave = () => drop.classList.remove('on'); drop.ondrop = e => { e.preventDefault(); drop.classList.remove('on'); enviar([...e.dataTransfer.files]); };
    $('#ae-go').onclick = async () => {
      $('#ae-go').disabled = true;
      const j = await API.post(`/api/projetos/${projeto.id}/autoedit`, { objetivo: $('#ae-obj').value, posicionamento: $('#ae-pos').value, duracao: +$('#ae-dur').value, presetId: $('#ae-preset').value, modo: $('#ae-modo').value, gancho: $('#ae-gancho').value.trim() || undefined, ocultarTabela: $('#ae-tab').checked, usarIA: $('#ae-ia').checked, legendas: $('#ae-leg').checked });
      $('#ae-prog').innerHTML = `<div class="barra"><i style="width:0"></i></div><pre id="ae-log" style="font-size:11px;color:var(--mut);white-space:pre-wrap;max-height:200px;overflow:auto"></pre>`;
      const r = await API.esperar(j.id, x => { $('#ae-prog i').style.width = x.progresso + '%'; $('#ae-log').textContent = x.log.join('\n'); });
      if (r.estado === 'concluido') { toast('Campanha montada — revise no editor'); location.hash = '#/editor/' + projeto.id; } else { toast('Auto Edit: ' + (r.erro || r.estado), true); $('#ae-go').disabled = false; }
    };
    if (pid) etapa2(await API.get('/api/projetos/' + pid));
    else { $('#ae1').innerHTML = '<h2>Projeto</h2>'; const d = document.createElement('div'); $('#ae1').appendChild(d); formProjeto(d, 'Criar projeto e enviar material', etapa2); }
  }

  // ---------- PDF INTELLIGENCE ----------
  async function pdf(pid) {
    if (!pid) {
      const ps = await API.get('/api/projetos');
      V().innerHTML = `<div class="pagina"><h1>▤ PDF Intelligence</h1><p class="sub">Escolha um projeto (ou crie um) e envie o PDF do empreendimento.</p><div class="cartao" id="pdf-novo"></div><h3>Projetos com PDF</h3><div class="grade">${ps.map(cartaoProjeto).join('').replace(/#\/editor\//g, '#/pdf/')}</div></div>`;
      return formProjeto($('#pdf-novo'), 'Criar projeto', p => location.hash = '#/pdf/' + p.id);
    }
    const [p, st] = await Promise.all([API.get('/api/projetos/' + pid), API.get('/api/status')]);
    const docs = p.pdfs || [];
    V().innerHTML = `<div class="pagina"><div class="linha"><h1>▤ ${esc(p.nome)}</h1><span class="esp"></span><a class="btn" href="#/editor/${pid}">Abrir no editor</a></div><p class="sub">Dados extraídos sempre com a página de origem. <span class="chip ok">extraído</span> veio do texto · <span class="chip av">confirmar</span> é inferência e precisa da sua confirmação.</p>
      <div class="drop" id="pdf-drop">Enviar PDF (book, tabela, memorial, planta)</div><input type="file" id="pdf-file" hidden accept="application/pdf,.pdf"><div id="pdf-st"></div>
      <div id="pdf-docs"></div></div>`;
    const drop = $('#pdf-drop'); drop.onclick = () => $('#pdf-file').click();
    const env = async f => { $('#pdf-st').innerHTML = `<div class="barra" style="margin:10px 0"><i></i></div><span class="chip av" id="pdf-fase">enviando…</span>`; const r = await API.upload(pid, f, x => $('#pdf-st i').style.width = x * 50 + '%'); const j = await API.esperar(r.tarefa, x => { $('#pdf-st i').style.width = 50 + x.progresso / 2 + '%'; $('#pdf-fase').textContent = x.log.slice(-1)[0] || 'analisando…'; }); toast('PDF: ' + ESTADO[j.estado][0], j.estado === 'erro'); pdf(pid); };
    $('#pdf-file').onchange = e => e.target.files[0] && env(e.target.files[0]);
    drop.ondragover = e => { e.preventDefault(); drop.classList.add('on'); }; drop.ondragleave = () => drop.classList.remove('on'); drop.ondrop = e => { e.preventDefault(); drop.classList.remove('on'); const f = [...e.dataTransfer.files].find(x => /pdf$/i.test(x.name)); f && env(f); };
    const CATS = [['', '—'], ['fachada', 'Fachada'], ['planta', 'Planta'], ['lazer', 'Lazer'], ['localizacao', 'Localização'], ['ficha', 'Ficha técnica'], ['decorado', 'Decorado'], ['condicoes', 'Condições/tabela']];
    $('#pdf-docs').innerHTML = docs.length ? docs.map(d => { const a = d.analise; return `<div class="cartao" style="margin-top:16px"><h2>${esc(d.nome)}</h2>
      <pre style="white-space:pre-wrap;font:13px/1.5 var(--sans);background:var(--tinta);padding:12px;border-radius:8px">${esc(a.resumo)}</pre>
      ${a.alertas.map(x => `<div class="chip er" style="display:block;margin:6px 0;padding:8px">⚠ ${esc(x.texto)}</div>`).join('')}
      <h3>Fatos com fonte</h3><table class="t"><tr><th>Campo</th><th>Valor</th><th>Página</th><th>Status</th><th></th></tr>${a.fatos.map((f, i) => `<tr><td>${esc(f.campo)}</td><td>${esc(f.valor)}${f.obs ? `<br><small style="color:var(--mut)">${esc(f.obs)}</small>` : ''}</td><td>p. ${f.pagina}</td><td><span class="chip ${f.confirmar ? 'av' : 'ok'}">${f.confirmar ? 'confirmar' : 'extraído'}</span></td><td>${['nome', 'endereco', 'tipologia', 'metragem', 'construtora', 'preco'].includes(f.campo) ? `<button class="btn pq" data-usar="${d.id}|${i}">Usar</button>` : ''}</td></tr>`).join('')}</table>
      <h3>Páginas (${a.paginas.length}) — corrija a categoria se precisar</h3><div class="grade" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${a.paginas.map(pg => { const m = p.midias.find(x => x.id === `${d.midiaId}p${pg.numero}`); return `<div class="cartao" style="padding:8px"><div class="thumb" style="aspect-ratio:4/3;background-size:contain;background-repeat:no-repeat;background-image:url('${API.arq(pid, pg.thumb)}')"></div><div class="linha" style="font-size:11px">p. ${pg.numero}${pg.ocr ? ' <span class="chip">OCR</span>' : ''}</div><select data-pag="${m ? m.id : ''}" style="padding:4px;font-size:12px">${opts(CATS, (m && m.categoria) || '')}</select></div>`; }).join('')}</div>
      ${a.imagens.length ? `<h3>Imagens extraídas (${a.imagens.length})</h3><div class="grade" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">${a.imagens.map(im => `<div class="thumb" style="aspect-ratio:4/3;background-image:url('${API.arq(pid, im.arquivo)}')" title="p. ${im.pagina} · ${im.w}×${im.h}"></div>`).join('')}</div>` : ''}</div>`; }).join('') : '<div class="vazio" style="margin-top:16px">Nenhum PDF analisado neste projeto.</div>';
    if (docs.length) {
      const box = document.createElement('div'); box.className = 'cartao'; box.style.marginTop = '16px';
      box.innerHTML = `<h2>Roteirista e diretor criativo</h2><div class="grade" style="grid-template-columns:repeat(4,1fr)"><div><label class="c">Objetivo</label><select id="r-obj">${opts(OBJ, 'interesse')}</select></div><div><label class="c">Posicionamento</label><select id="r-pos">${opts(POS, 'medio-alto')}</select></div><div><label class="c">Duração</label><select id="r-dur">${[15, 30, 45, 60, 90].map(x => `<option ${x === 30 ? 'selected' : ''}>${x}</option>`).join('')}</select></div><div><label class="c">&nbsp;</label><label class="linha"><input type="checkbox" id="r-ia" ${st.recursos.roteiroIA.ativo ? 'checked' : 'disabled'}> Refinar com Claude</label></div></div>
        <div class="linha" style="margin-top:12px"><button class="btn pri" id="r-gerar">Gerar roteiro</button></div><div id="r-out"></div>`;
      $('#pdf-docs').appendChild(box);
      const mostrar = r => { $('#r-out').innerHTML = `<h3>Gancho</h3><p style="font:600 20px var(--ser)">${esc(r.gancho)}</p><table class="t"><tr><th>#</th><th>Cena</th><th>Material</th><th>Fala sugerida</th><th>Na tela</th><th>Fonte</th></tr>${r.cenas.map(c => { const m = c.midia && p.midias.find(x => x.id === c.midia); return `<tr><td>${c.ordem}</td><td>${esc(c.rotulo || c.categoria || '')} · ${c.duracao}s</td><td>${m && m.thumb ? `<div class="thumb" style="width:70px;margin:0;background-image:url('${API.arq(pid, m.thumb)}')"></div>` : '—'}</td><td>${esc(c.fala)}</td><td>${esc(c.textoTela)}</td><td><small>${esc(c.fonte || '—')}</small></td></tr>`; }).join('')}</table><h3>CTA</h3><p>${esc(r.cta)}</p><h3>Legenda do post</h3><textarea rows="7">${esc(r.legendaPost)}</textarea>${(r.avisos || []).map(a => `<div class="chip er" style="display:block;margin:6px 0;padding:8px">${esc(a)}</div>`).join('')}<div class="linha" style="margin-top:12px"><button class="btn pri" id="r-aplicar">Montar no editor (sem apresentador)</button><a class="btn" href="#/autoedit/${pid}">Gravei a fala → Auto Edit</a><button class="btn" id="r-copiar">Copiar falas</button></div><p class="sub" style="font-size:12px;margin-top:8px">Origem: ${r.origem === 'claude' ? 'Claude (textos) + regras (fatos e mídias)' : 'roteirista local por regras'}.</p>`;
        $('#r-aplicar').onclick = async () => { await API.post(`/api/projetos/${pid}/aplicar-roteiro`, { roteiro: r }); location.hash = '#/editor/' + pid; };
        $('#r-copiar').onclick = () => { navigator.clipboard.writeText([r.gancho, ...r.cenas.map(c => c.fala).filter(Boolean), r.cta].join('\n')); toast('Falas copiadas'); }; };
      if (p.roteiro) mostrar(p.roteiro);
      $('#r-gerar').onclick = async () => { $('#r-gerar').disabled = true; try { mostrar(await API.post(`/api/projetos/${pid}/roteiro`, { objetivo: $('#r-obj').value, posicionamento: $('#r-pos').value, duracao: +$('#r-dur').value, usarIA: $('#r-ia').checked })); } catch (e) { toast(e.message, true); } $('#r-gerar').disabled = false; };
    }
    $$('[data-usar]').forEach(b => b.onclick = async () => {
      const [did, i] = b.dataset.usar.split('|'), f = docs.find(d => d.id === did).analise.fatos[+i];
      const pp = await API.get('/api/projetos/' + pid), mapa = { nome: 'nome', endereco: 'bairro', tipologia: 'plantas', metragem: 'plantas', construtora: 'construtora', preco: 'preco' };
      const k = mapa[f.campo]; pp.empreendimento[k] = k === 'plantas' && pp.empreendimento.plantas && f.campo === 'metragem' ? pp.empreendimento.plantas + ' · ' + f.valor : f.valor; pp.empreendimento.fonte = 'pdf';
      await API.put('/api/projetos/' + pid, pp, { 'x-forcar': '1' }); toast(`${k} = ${f.valor} (fonte: PDF p. ${f.pagina})`);
    });
    $$('[data-pag]').forEach(s => s.onchange = async () => { const pp = await API.get('/api/projetos/' + pid); const m = pp.midias.find(x => x.id === s.dataset.pag); if (m) { m.categoria = s.value || null; await API.put('/api/projetos/' + pid, pp, { 'x-forcar': '1' }); toast('Categoria atualizada'); } });
  }

  // ---------- AI PRESENTER ----------
  async function presenter() {
    const [st, ps] = await Promise.all([API.get('/api/status'), API.get('/api/projetos')]);
    const voz = st.recursos.vozIA.ativo;
    V().innerHTML = `<div class="pagina" style="max-width:980px"><h1>◉ AI Presenter</h1><p class="sub">Recursos generativos de apresentação. Só aparecem como ativos quando há um serviço real configurado — nada de botão de enfeite.</p>
      <div class="cartao"><h2>Voz sintética (narração a partir do roteiro)</h2>
        ${voz ? `<label class="c">Projeto</label><select id="tt-p">${ps.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('')}</select><label class="c">Texto (use apenas voz autorizada)</label><textarea id="tt-t" rows="5" placeholder="Cole aqui as falas do roteiro"></textarea><button class="btn pri" id="tt-go" style="margin-top:10px">Gerar narração e adicionar ao projeto</button>`
        : `<p>Desligado. Para ativar: crie uma conta na ElevenLabs, autorize a sua voz e coloque no arquivo <code>.env</code>:<br><code>ELEVENLABS_API_KEY=...</code><br><code>ELEVENLABS_VOZ=id_da_voz</code><br>Reinicie o estúdio. O custo é cobrado pela ElevenLabs por caractere (veja a página de preços abaixo).</p>`}
      </div>
      <h3>Fornecedores avaliados</h3><table class="t"><tr><th>Serviço</th><th>Recurso</th><th>Status no estúdio</th><th>Preços</th><th>Documentação</th></tr>${st.fornecedores.map(f => `<tr><td><b>${esc(f.id)}</b></td><td>${esc(f.recurso)}</td><td><span class="chip ${/implementado/.test(f.status) && !/não/.test(f.status) ? 'ok' : ''}">${esc(f.status)}</span></td><td><a href="${f.precos}" target="_blank" rel="noopener">página oficial</a></td><td><a href="${f.docs}" target="_blank" rel="noopener">docs</a></td></tr>`).join('')}</table>
      <div class="cartao" style="margin-top:16px"><h2>Ainda não disponível</h2><p class="sub" style="margin:0">Avatar falante, troca de roupa e troca de cenário exigem um fornecedor pago (HeyGen, Synthesia, Runway…). Os adaptadores são separados (pasta <code>src/ia/</code>) para entrarem sem mexer no editor. Regra do estúdio: só identidade e voz <b>autorizadas</b>, e nunca alterar características reais do imóvel.</p></div></div>`;
    if (voz) $('#tt-go').onclick = async () => { const j = await API.post(`/api/projetos/${$('#tt-p').value}/tts`, { texto: $('#tt-t').value }); toast('Gerando narração…'); const r = await API.esperar(j.id); toast(r.estado === 'concluido' ? 'Narração adicionada à biblioteca do projeto' : r.erro, r.estado !== 'concluido'); };
  }

  // ---------- PRESETS ----------
  async function presetsPg(id) {
    const lista = await API.get('/api/presets');
    const atual = id ? await API.get('/api/presets/' + id) : null;
    V().innerHTML = `<div class="pagina"><div class="linha"><h1>❖ Presets</h1><span class="esp"></span><label class="btn">Importar JSON<input type="file" id="pr-imp" hidden accept=".json,application/json"></label></div><p class="sub">Estilo visual separado dos dados comerciais: um preset nunca carrega preço ou texto de outro empreendimento.</p>
      <div class="grade">${lista.map(p => `<div class="cartao clica ${atual && atual.id === p.id ? '' : ''}" onclick="location.hash='#/presets/${p.id}'" style="${atual && atual.id === p.id ? 'border-color:var(--ouro)' : ''}"><div class="linha"><b>${esc(p.nome)}</b><span class="esp"></span><span class="chip">${p.oficial ? 'oficial' : 'meu'}</span></div><p class="sub" style="margin:6px 0 0;font-size:12px">${esc(p.descricao || '')}</p></div>`).join('')}</div>
      <div id="pr-ed"></div></div>`;
    $('#pr-imp').onchange = async e => { try { const j = JSON.parse(await e.target.files[0].text()); const s = await API.post('/api/presets', j); toast('Importado: ' + s.nome); location.hash = '#/presets/' + s.id; } catch (x) { toast('JSON inválido: ' + x.message, true); } };
    if (!atual) return;
    const P = atual, L = P.legenda;
    const f = (rot, k, tipo, extra = '') => { const v = k.split('.').reduce((o, x) => o && o[x], P); return `<div><label class="c">${rot}</label>` + (tipo === 'cor' ? `<input type="color" data-p="${k}" value="${v}" style="width:100%;height:34px;background:none;border:1px solid var(--linha);border-radius:8px">` : tipo === 'bool' ? `<label class="linha"><input type="checkbox" data-p="${k}" ${v ? 'checked' : ''}> ativo</label>` : tipo === 'sel' ? `<select data-p="${k}">${extra.map(o => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('')}</select>` : `<input type="${tipo}" data-p="${k}" value="${esc(v)}" ${extra}>`) + '</div>'; };
    const FONTES = ['Inter', 'Inter SemiBold', 'Inter Black', 'Cormorant Garamond SemiBold'];
    $('#pr-ed').innerHTML = `<div class="cartao" style="margin-top:16px"><div class="linha"><h2 style="margin:0">${esc(P.nome)}</h2><span class="esp"></span><button class="btn pq" id="pr-dup">Duplicar</button><a class="btn pq" href="data:application/json,${encodeURIComponent(JSON.stringify(P, null, 1))}" download="${P.id}.json">Exportar</a>${P.oficial ? '' : '<button class="btn pq perigo" id="pr-del">Excluir</button>'}<button class="btn pri pq" id="pr-salvar">Salvar${P.oficial ? ' como meu' : ''}</button></div>
      <div class="grade" style="grid-template-columns:1fr 340px;margin-top:10px"><div>
      <h3>Legenda</h3><div class="grade" style="grid-template-columns:repeat(3,1fr)">${f('Fonte', 'legenda.fonte', 'sel', FONTES)}${f('Tamanho (fração da largura)', 'legenda.tamanho', 'number', 'step=0.002')}${f('Palavras por bloco', 'legenda.palavras', 'number', 'min=1 max=8')}${f('Cor', 'legenda.cor', 'cor')}${f('Destaque', 'legenda.destaque', 'cor')}${f('Contorno', 'legenda.contorno', 'cor')}${f('Espessura do contorno', 'legenda.espessura', 'number', 'step=0.001')}${f('Posição vertical', 'legenda.posicaoY', 'number', 'step=0.01')}${f('Animação', 'legenda.animacao', 'sel', ['pop', 'fade', 'nenhuma'])}${f('Caixa alta', 'legenda.caixaAlta', 'bool')}${f('Destacar palavra falada', 'legenda.destacarAtiva', 'bool')}${f('Emojis do assunto', 'legenda.emojis', 'bool')}${f('Fundo (caixa)', 'legenda.fundo', 'text', 'placeholder="#1A1A19 ou vazio"')}</div>
      <h3>Gancho</h3><div class="grade" style="grid-template-columns:repeat(3,1fr)">${f('Fonte', 'titulos.gancho.fonte', 'sel', FONTES)}${f('Tamanho', 'titulos.gancho.tamanho', 'number', 'step=0.002')}${f('Duração (s)', 'titulos.gancho.duracao', 'number', 'step=0.5')}${f('Cor', 'titulos.gancho.cor', 'cor')}${f('Fundo', 'titulos.gancho.fundo', 'text')}${f('Animação', 'titulos.gancho.animacao', 'sel', ['subir', 'pop', 'fade', 'nenhuma'])}</div>
      <h3>Ritmo e movimento</h3><div class="grade" style="grid-template-columns:repeat(3,1fr)">${f('Cortar pausas', 'ritmo.cortarPausas', 'bool')}${f('Pausa mínima (s)', 'ritmo.pausaMinima', 'number', 'step=0.05')}${f('Punch-in (zoom de corte)', 'ritmo.punchIn', 'number', 'step=0.01')}${f('Velocidade do tour', 'ritmo.velocidadeTour', 'number', 'step=0.05')}${f('Cena máxima (s)', 'ritmo.maxCena', 'number', 'step=0.5')}${f('Intensidade do movimento', 'movimento.intensidade', 'number', 'step=0.01')}${f('Fotos', 'movimento.fotos', 'sel', ['pan', 'kenburns', 'cartao'])}${f('Zoom na planta', 'movimento.planta', 'number', 'step=0.02')}</div>
      <h3>Transições, cor e áudio</h3><div class="grade" style="grid-template-columns:repeat(3,1fr)">${f('Lista (separada por vírgula)', 'transicoes.lista', 'text')}${f('Duração (s)', 'transicoes.dur', 'number', 'step=0.05')}${f('Entre falas', 'transicoes.entreFalas', 'sel', ['corte', 'fade', 'dissolve'])}${f('Contraste', 'cor.contraste', 'number', 'step=0.01')}${f('Saturação', 'cor.saturacao', 'number', 'step=0.01')}${f('Vinheta', 'cor.vinheta', 'number', 'step=0.05')}${f('Volume da música', 'audio.musicaVolume', 'number', 'step=0.01')}${f('Volume dos efeitos', 'audio.sfxVolume', 'number', 'step=0.01')}${f('Som das transições', 'audio.sfx.transicao', 'sel', ['', 'whoosh', 'swoosh-suave', 'grave', 'clique', 'pop'])}</div>
      <h3>Marca</h3><div class="grade" style="grid-template-columns:repeat(3,1fr)">${f("Marca d'água", 'marca.marcaDagua', 'bool')}${f('Tamanho do logo', 'marca.tamanho', 'number', 'step=0.005')}${f('Barra de progresso', 'marca.barraProgresso', 'bool')}${f('Tela final', 'marca.telaFinal', 'bool')}${f('Cor da barra', 'marca.corBarra', 'cor')}</div>
      <details style="margin-top:14px"><summary>JSON completo (avançado)</summary><textarea id="pr-json" rows="16" style="font:12px monospace;margin-top:8px">${esc(JSON.stringify(P, null, 1))}</textarea></details></div>
      <div><h3>Amostra</h3><div id="pr-amostra" style="aspect-ratio:9/16;border-radius:12px;background:linear-gradient(160deg,#5b6a72,#2a2f33) ;position:relative;overflow:hidden;container-type:inline-size"></div></div></div></div>`;
    const amostra = () => {
      const s = $('#pr-amostra').clientWidth, G = P.titulos.gancho, rg = (h, o) => { const x = String(h || '#000').replace('#', ''); return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${o})`; };
      const w = ['OLHA', 'ESSA', 'PISCINA'].map(x => P.legenda.caixaAlta ? x : x.toLowerCase());
      $('#pr-amostra').innerHTML = `<div style="position:absolute;top:${G.posicaoY * 100}%;left:7%;right:7%;text-align:center"><span style="${Preview.fonteCSS(G.fonte, /Black|Bold/.test(G.fonte))}font-size:${G.tamanho * s}px;color:${G.cor};${G.fundo ? `background:${rg(G.fundo, G.fundoOpacidade)};padding:.1em .3em` : ''}">${G.caixaAlta ? 'APÊ NA PLANTA NO PORTO' : 'Apê na planta no Porto'}</span></div>
        <div style="position:absolute;top:${P.legenda.posicaoY * 100}%;transform:translateY(-100%);left:7%;right:7%;text-align:center;${Preview.fonteCSS(L.fonte, L.negrito)}font-size:${L.tamanho * s}px;${L.espessura > 0 && !L.fundo ? `-webkit-text-stroke:${L.espessura * s * 1.3}px ${L.contorno};paint-order:stroke fill;` : ''}"><span style="${L.fundo ? `background:${rg(L.fundo, L.fundoOpacidade)};padding:.1em .3em` : ''}"><span style="color:${L.cor}">${w[0]} ${w[1]}</span> <span style="color:${L.destaque}">${w[2]}</span></span></div>
        ${L.emojis ? `<img src="/assets/emojis/1f3ca.png" style="position:absolute;width:${L.tamanho * s * 1.5}px;left:50%;transform:translateX(-50%);top:calc(${P.legenda.posicaoY * 100}% - ${L.tamanho * s * 4}px)">` : ''}<div style="position:absolute;top:0;left:0;height:4px;width:40%;background:${P.marca.corBarra}"></div>`;
    };
    amostra();
    $$('[data-p]').forEach(c => c.onchange = () => { const ks = c.dataset.p.split('.'); let o = P; while (ks.length > 1) o = o[ks.shift()]; let v = c.type === 'checkbox' ? c.checked : c.type === 'number' ? +c.value : c.value; if (c.dataset.p === 'transicoes.lista') v = String(v).split(',').map(x => x.trim()).filter(x => Modelo.TRANSICOES.includes(x)); o[ks[0]] = v; $('#pr-json').value = JSON.stringify(P, null, 1); amostra(); });
    $('#pr-salvar').onclick = async () => { let obj; try { obj = JSON.parse($('#pr-json').value); } catch (e) { return toast('JSON inválido', true); } if (P.oficial && !obj.nome.includes('(meu)')) obj.nome += ' (meu)'; const s = await API.post('/api/presets', obj); toast('Preset salvo: ' + s.nome); location.hash = '#/presets/' + s.id; };
    $('#pr-dup').onclick = async () => { const s = await API.post(`/api/presets/${P.id}/duplicar`); location.hash = '#/presets/' + s.id; };
    if ($('#pr-del')) $('#pr-del').onclick = async () => { if (!confirm('Excluir preset?')) return; await API.del('/api/presets/' + P.id); location.hash = '#/presets'; };
  }

  // ---------- EFEITOS ----------
  async function efeitos() {
    const ef = await API.get('/api/efeitos'); let fav = new Set(ef.favoritos), filtro = '', aba = 'transicoes';
    const desenhar = () => {
      const itens = { transicoes: ef.transicoes.map(t => ({ id: 't:' + t, nome: t, demo: `<div class="demo-tr" data-t="${t}"></div>` })), movimentos: ef.movimentos.map(m => ({ id: 'm:' + m, nome: m })), sons: ef.sons.map(s => ({ id: 's:' + s.id, nome: s.nome, cat: s.categoria, som: s.id })), animacoes: ef.animacoes.map(a => ({ id: 'a:' + a, nome: a })), emojis: ef.emojis.map(e => ({ id: 'e:' + e.codigo, nome: e.palavras.join(', '), img: e.codigo })) }[aba];
      const lista = itens.filter(i => !filtro || i.nome.toLowerCase().includes(filtro) || (i.cat || '').includes(filtro)).sort((a, b) => fav.has(b.id) - fav.has(a.id));
      $('#ef-l').innerHTML = lista.map(i => `<div class="cartao" style="padding:10px"><div class="linha"><b>${esc(i.nome)}</b><span class="esp"></span><button class="btn pq" data-fav="${i.id}">${fav.has(i.id) ? '★' : '☆'}</button></div>${i.cat ? `<span class="chip">${i.cat}</span>` : ''}${i.som ? `<button class="btn pq" data-som="${i.som}" style="margin-top:8px">▶ Ouvir</button>` : ''}${i.img ? `<img src="/assets/emojis/${i.img}.png" style="width:48px;margin-top:6px">` : ''}${aba === 'transicoes' ? `<div style="height:60px;margin-top:8px;border-radius:6px;background:linear-gradient(90deg,#b0895b,#2c2b28);animation:tr 1.6s infinite alternate"></div>` : ''}</div>`).join('') || '<div class="vazio">Nada encontrado.</div>';
      $$('[data-fav]').forEach(b => b.onclick = async () => { fav.has(b.dataset.fav) ? fav.delete(b.dataset.fav) : fav.add(b.dataset.fav); await API.put('/api/efeitos/favoritos', [...fav]); desenhar(); });
      $$('[data-som]').forEach(b => b.onclick = () => new Audio('/api/sfx/' + b.dataset.som).play());
      $$('.abas button').forEach(b => b.classList.toggle('on', b.dataset.a === aba));
    };
    V().innerHTML = `<style>@keyframes tr{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}</style><div class="pagina"><h1>✺ Biblioteca de efeitos</h1><p class="sub">Tudo aqui é aplicado pelo motor (FFmpeg) e pelos presets. Sons sintetizados localmente, sem direitos de terceiros. Emojis: Twemoji (CC-BY 4.0).</p>
      <div class="abas" style="background:none">${[['transicoes', 'Transições'], ['movimentos', 'Movimentos'], ['sons', 'Sons'], ['animacoes', 'Animações de texto'], ['emojis', 'Emojis']].map(([a, n]) => `<button data-a="${a}">${n}</button>`).join('')}</div>
      <input type="text" id="ef-busca" placeholder="Buscar…" style="margin:12px 0"><div class="grade" id="ef-l"></div></div>`;
    $$('.abas button').forEach(b => b.onclick = () => { aba = b.dataset.a; desenhar(); });
    $('#ef-busca').oninput = e => { filtro = e.target.value.toLowerCase(); desenhar(); };
    desenhar();
  }

  // ---------- RENDERIZACOES ----------
  async function renders() {
    const tick = async () => {
      if (!$('#rd-l')) return clearInterval(timerPagina);
      const ts = await API.get('/api/tarefas');
      $('#rd-l').innerHTML = ts.length ? `<table class="t"><tr><th>Tarefa</th><th>Estado</th><th style="width:180px">Progresso</th><th>Criada</th><th></th></tr>${ts.map(t => `<tr><td><b>${esc(t.rotulo)}</b>${t.erro ? `<br><small style="color:var(--erro)">${esc(t.erro.split('\n')[0].slice(0, 160))}</small>` : ''}${t.resultado && t.resultado.validacao ? `<br><small class="chip ${t.resultado.validacao.ok ? 'ok' : 'er'}">${t.resultado.validacao.largura}×${t.resultado.validacao.altura} · ${t.resultado.validacao.duracao}s</small>` : ''}</td><td>${chipEstado(t.estado)}</td><td><div class="barra"><i style="width:${t.progresso}%"></i></div></td><td>${dataBR(t.criado)}</td>
        <td class="linha">${t.resultado && t.resultado.arquivo ? `<a class="btn pq" target="_blank" href="${API.arq(t.params.projetoId, t.resultado.arquivo)}">▶</a><a class="btn pq" href="${API.arq(t.params.projetoId, t.resultado.arquivo)}?baixar">⬇</a>` : ''}${['na_fila', 'executando'].includes(t.estado) ? `<button class="btn pq perigo" data-c="${t.id}">Cancelar</button>` : ''}${['erro', 'cancelado'].includes(t.estado) ? `<button class="btn pq" data-r="${t.id}">Repetir</button>` : ''}<button class="btn pq" data-log="${t.id}">Log</button></td></tr>`).join('')}</table>` : '<div class="vazio">Nenhuma tarefa ainda.</div>';
      $$('[data-c]').forEach(b => b.onclick = () => API.post(`/api/tarefas/${b.dataset.c}/cancelar`).then(tick));
      $$('[data-r]').forEach(b => b.onclick = () => API.post(`/api/tarefas/${b.dataset.r}/repetir`).then(tick));
      $$('[data-log]').forEach(b => b.onclick = async () => { const t = await API.get('/api/tarefas/' + b.dataset.log); const c = document.createElement('div'); c.className = 'modal'; c.innerHTML = `<div style="width:min(800px,92vw)"><div class="linha"><h2 style="margin:0">${esc(t.rotulo)}</h2><span class="esp"></span><button class="btn pq">Fechar</button></div><pre style="white-space:pre-wrap;font-size:11px">${esc(t.log.join('\n'))}\n${esc(t.erro || '')}</pre></div>`; document.body.appendChild(c); $('button', c).onclick = () => c.remove(); });
    };
    V().innerHTML = `<div class="pagina"><h1>▶ Renderizações e tarefas</h1><p class="sub">As tarefas rodam no servidor: pode fechar a página que elas continuam. Arquivos validados (resolução, duração, H.264/AAC).</p><div id="rd-l"></div></div>`;
    await tick(); timerPagina = setInterval(tick, 1500);
  }

  // ---------- CONFIGURACOES ----------
  async function config() {
    const [m, st] = await Promise.all([API.get('/api/marca'), API.get('/api/status')]);
    const c = (k, r) => `<label class="c">${r}</label><input type="text" data-m="${k}" value="${esc(k.split('.').reduce((o, x) => o && o[x], m) || '')}">`;
    V().innerHTML = `<div class="pagina" style="max-width:980px"><h1>⚙ Configurações</h1><p class="sub">Identidade oficial (vinda de paulocotrim.com) usada em todos os vídeos. Integrações e segredos ficam no arquivo <code>.env</code>.</p>
      <div class="cartao"><h2>Identidade</h2><div class="grade" style="grid-template-columns:1fr 1fr">
        <div>${c('nome', 'Nome')}${c('creci', 'CRECI')}${c('telefone', 'Telefone')}${c('whatsapp', 'WhatsApp (só números, com DDI)')}${c('site', 'Site')}${c('instagram', 'Instagram')}${c('slogan', 'Posicionamento')}</div>
        <div><label class="c">Logo (monograma) — PNG transparente</label><div class="linha"><img src="/api/marca/logo/monograma?${Date.now()}" style="width:64px;background:#000;border-radius:8px;padding:6px"><label class="btn">Trocar<input type="file" hidden accept="image/png" data-logo="monograma"></label></div>
        <label class="c">Assinatura (logo + nome)</label><div class="linha"><img src="/api/marca/logo/assinatura?${Date.now()}" style="height:44px;background:#000;border-radius:8px;padding:6px"><label class="btn">Trocar<input type="file" hidden accept="image/png" data-logo="assinatura"></label></div>
        <h3>Cores</h3><div class="linha">${Object.entries(m.cores).map(([k, v]) => `<label style="text-align:center;font-size:11px">${k}<br><input type="color" data-cor="${k}" value="${v}"></label>`).join('')}</div>
        <h3>Tela final</h3>${c('telaFinal.titulo', 'Título')}${c('telaFinal.linha1', 'Chamada')}${c('telaFinal.linha2', 'Contato')}${c('telaFinal.linha3', 'Site')}</div></div>
        <button class="btn pri" id="cf-salvar" style="margin-top:12px">Salvar identidade</button><p class="sub" style="font-size:12px;margin-top:8px">Fonte da identidade: ${esc(m.fonteDaIdentidade)}</p></div>
      <div class="cartao" style="margin-top:16px"><h2>Sistema</h2><table class="t"><tr><td>Versão</td><td>${st.versao}</td></tr><tr><td>FFmpeg</td><td>${esc(st.ffmpeg)}</td></tr><tr><td>Node</td><td>${st.node}</td></tr><tr><td>Pasta de dados</td><td><code>${esc(st.dados)}</code> (faça backup desta pasta)</td></tr><tr><td>Login</td><td>${st.autenticacao ? 'ativo (APP_SENHA)' : 'desligado — uso local'}</td></tr>
        ${Object.entries(st.recursos).map(([k, r]) => `<tr><td>${k}</td><td><span class="chip ${r.ativo ? 'ok' : ''}">${r.ativo ? 'ativo' : 'desligado'}</span> ${esc(r.tipo)} ${r.modelo ? '· ' + esc(r.modelo) : ''}</td></tr>`).join('')}</table></div></div>`;
    $('#cf-salvar').onclick = async () => {
      const novo = JSON.parse(JSON.stringify(m));
      $$('[data-m]').forEach(i => { const ks = i.dataset.m.split('.'); let o = novo; while (ks.length > 1) o = o[ks.shift()]; o[ks[0]] = i.value; });
      $$('[data-cor]').forEach(i => { novo.cores[i.dataset.cor] = i.value.toUpperCase(); });
      await API.put('/api/marca', novo); toast('Identidade salva');
    };
    $$('[data-logo]').forEach(i => i.onchange = async () => { const f = i.files[0]; if (!f) return; const r = await fetch('/api/marca/logo/' + i.dataset.logo, { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: f }); r.ok ? (toast('Logo atualizado'), config()) : toast('Envie um PNG', true); });
  }

  // ---------- roteador ----------
  async function rotear() {
    clearInterval(timerPagina); Editor.fechar();
    document.querySelector('.app').classList.toggle('modo-editor', (location.hash || '').startsWith('#/editor/'));
    const [, r, a] = (location.hash || '#/inicio').split('/');
    $$('nav.lado a').forEach(x => x.classList.toggle('on', x.dataset.r === r || (r === 'editor' && x.dataset.r === 'projetos')));
    try {
      const pg = { inicio, projetos, novo, autoedit: () => autoedit(a), pdf: () => pdf(a), presenter, presets: () => presetsPg(a), efeitos, render: renders, config, editor: () => Editor.abrir(a) }[r] || inicio;
      await pg();
    } catch (e) { if (e.message !== 'Login necessário') V().innerHTML = `<div class="pagina"><h1>Ops</h1><p class="sub">${esc(e.message)}</p><a class="btn" href="#/inicio">Voltar ao início</a></div>`; }
  }
  addEventListener('hashchange', rotear);
  addEventListener('DOMContentLoaded', rotear);
  return { login, rotear };
})();

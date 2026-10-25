// EDITOR: biblioteca de midia, palco com previa ao vivo, inspetor e linha do tempo multifaixa
// (arrastar, aparar, dividir, desfazer/refazer, salvamento automatico, versoes).
const Editor = (() => {
  let E = null, raf = 0, ultimoQuadro = 0, salvarT = null, montado = false;
  const FAIXAS = [['principal', 'Vídeo principal'], ['broll', 'Sobreposição'], ['textos', 'Textos'], ['legendas', 'Legendas'], ['audios', 'Áudio']];
  const r2 = n => Math.round(n * 100) / 100;

  // ---------- estado / historico ----------
  function recalcular() { E.lay = Modelo.layout(E.p, E.preset); }
  function alterar(fn, { semHistorico } = {}) {
    if (!semHistorico) { E.undo.push(JSON.stringify(E.p)); if (E.undo.length > 150) E.undo.shift(); E.redo = []; }
    fn(E.p); recalcular(); E.sujo = true; agendarSalvar(); desenharTudo();
  }
  function desfazer() { if (!E.undo.length) return; E.redo.push(JSON.stringify(E.p)); E.p = JSON.parse(E.undo.pop()); pos(); }
  function refazer() { if (!E.redo.length) return; E.undo.push(JSON.stringify(E.p)); E.p = JSON.parse(E.redo.pop()); pos(); }
  function pos() { recalcular(); E.sujo = true; agendarSalvar(); desenharTudo(); }
  function agendarSalvar() { clearTimeout(salvarT); estadoSalvo('alterado…'); salvarT = setTimeout(salvar, 1200); }
  async function salvar(versao) {
    clearTimeout(salvarT);
    try {
      const r = await API.put('/api/projetos/' + E.p.id, E.p, versao ? { 'x-versao': '1' } : {});
      E.p.atualizado = r.atualizado; E.sujo = false; estadoSalvo('salvo ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      if (e.status === 409) {
        if (confirm('O projeto foi alterado por uma tarefa (ex.: Auto Edit, PDF). Recarregar a versão do servidor? (Cancelar = manter a sua e sobrescrever)')) { await recarregar(); }
        else { await API.put('/api/projetos/' + E.p.id, E.p, { 'x-forcar': '1' }); estadoSalvo('salvo'); }
      } else { estadoSalvo('⚠ não salvo'); toast('Falha ao salvar: ' + e.message, true); }
    }
  }
  const estadoSalvo = s => { const el = $('#ed-salvo'); if (el) el.textContent = s; };
  async function recarregar() { const p = await API.get('/api/projetos/' + E.p.id); E.p = p; E.preset = await API.get('/api/presets/' + p.presetId); recalcular(); desenharTudo(); }

  // ---------- montagem ----------
  async function abrir(id) {
    const [p, presets, marca] = await Promise.all([API.get('/api/projetos/' + id), API.get('/api/presets'), API.get('/api/marca')]);
    const preset = await API.get('/api/presets/' + p.presetId);
    E = { p, preset, presets, marca, sel: null, t: 0, tocando: false, pps: 40, undo: [], redo: [], aba: 'midia', lay: null };
    recalcular();
    const v = $('#vista');
    v.innerHTML = `<div class="ed">
      <div class="ed-topo">
        <a class="btn pq" href="#/projetos" title="Projetos">←</a>
        <input class="nome" id="ed-nome" value="${esc(p.nome)}">
        <select id="ed-formato" title="Formato" style="width:auto">${Object.entries(Modelo.FORMATOS).map(([k, f]) => `<option value="${k}" ${k === p.formato ? 'selected' : ''}>${k.replace('x', ':')}</option>`).join('')}</select>
        <select id="ed-preset" title="Estilo (preset)" style="width:auto">${presets.map(x => `<option value="${x.id}" ${x.id === p.presetId ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select>
        <button class="btn pq" id="ed-undo" title="Desfazer (Ctrl+Z)">↶</button><button class="btn pq" id="ed-redo" title="Refazer (Ctrl+Shift+Z)">↷</button>
        <span class="chip" id="ed-salvo">salvo</span>
        <span class="esp"></span>
        <button class="btn pq" id="ed-versoes" title="Versões salvas">Versões</button>
        <button class="btn pq" id="ed-transcrever" title="Gerar legendas da fala (IA local)">✎ Legendas IA</button>
        <button class="btn pq" id="ed-autoedit" title="Montagem automática">✦ Auto Edit</button>
        <button class="btn pq" id="ed-previa" title="Renderizar prévia rápida com transições e cor finais">▶ Prévia renderizada</button>
        <button class="btn pri" id="ed-exportar">Exportar</button>
      </div>
      <div class="ed-meio">
        <div class="painel" id="ed-esq"></div>
        <div class="palco-area"><div class="palco-w" id="ed-palco"></div>
          <div class="controles">
            <button class="btn pq" id="ed-inicio" title="Início (Home)">⏮</button>
            <button class="btn pq" id="ed-play" title="Reproduzir/pausar (Espaço)" style="min-width:44px">▶</button>
            <span class="tempo" id="ed-tempo">0:00.0</span><span class="esp"></span>
            <span style="font-size:11px;color:var(--mut)"><span class="kbd">Espaço</span> play · <span class="kbd">S</span> dividir · <span class="kbd">Del</span> apagar · <span class="kbd">Ctrl+D</span> duplicar · <span class="kbd">←→</span> quadro</span>
          </div></div>
        <div class="painel dir"><div class="insp" id="ed-insp"></div></div>
      </div>
      <div class="tl">
        <div class="tl-bar"><b style="font-weight:600">Linha do tempo</b><span id="ed-dur" style="color:var(--mut)"></span><span class="esp"></span>
          <button class="btn pq" id="ed-dividir" title="Dividir no cursor (S)">✂ Dividir</button>
          <button class="btn pq" id="ed-zm">−</button><button class="btn pq" id="ed-zp">＋</button><button class="btn pq" id="ed-zfit">Ajustar</button></div>
        <div class="tl-corpo"><div class="tl-rot"><div class="reg"></div>${FAIXAS.map(f => `<div>${f[1]}</div>`).join('')}</div>
          <div class="tl-scroll" id="ed-tls"><div class="tl-cont" id="ed-tl"></div></div></div>
      </div></div>`;
    Preview.init($('#ed-palco'), () => E);
    ligarTopo(); ligarTimeline(); ajustarZoom(); desenharTudo();
    if (!montado) { document.addEventListener('keydown', teclado); montado = true; }
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    // tarefas pendentes deste projeto (PDF, proxy, auto edit) recarregam o projeto ao terminar
    acompanharTarefas();
  }
  function fechar() { cancelAnimationFrame(raf); if (E) { Preview.parar(); if (E.sujo) salvar(); } E = null; }

  async function acompanharTarefas() {
    if (!E) return;
    const pid = E.p.id;
    const ts = (await API.get('/api/tarefas?projetoId=' + pid)).filter(t => ['na_fila', 'executando'].includes(t.estado) && t.tipo !== 'render');
    for (const t of ts) API.esperar(t.id).then(async j => { if (E && E.p.id === pid) { toast(`${j.rotulo}: ${ESTADO[j.estado][0]}`, j.estado === 'erro'); if (j.estado === 'concluido') { if (E.sujo) await salvar(); await recarregar(); } } });
  }

  // ---------- reproducao ----------
  function loop(ts) {
    if (!E) return;
    if (E.tocando) { E.t += (ts - ultimoQuadro) / 1000; if (E.t >= E.lay.total) { E.t = E.lay.total; tocar(false); } }
    ultimoQuadro = ts;
    Preview.desenhar(E.t, E.tocando); atualizarCabeca();
    raf = requestAnimationFrame(loop);
  }
  function tocar(on) { E.tocando = on === undefined ? !E.tocando : on; if (E.tocando && E.t >= E.lay.total - 0.05) E.t = 0; $('#ed-play').textContent = E.tocando ? '❚❚' : '▶'; if (!E.tocando) Preview.parar(); }
  function irPara(t) { E.t = Math.max(0, Math.min(E.lay.total, t)); }

  // ---------- desenho geral ----------
  function desenharTudo() { if (!E) return; desenharEsquerda(); desenharTimeline(); desenharInspetor(); $('#ed-dur').textContent = '· ' + Modelo.fmtTempo(E.lay.total) + ` · ${E.p.principal.length} clipes`; $('#ed-undo').disabled = !E.undo.length; $('#ed-redo').disabled = !E.redo.length; }

  function desenharEsquerda() {
    const el = $('#ed-esq'), p = E.p;
    const aba = (id, n) => `<button class="${E.aba === id ? 'on' : ''}" data-aba="${id}">${n}</button>`;
    let h = `<div class="abas">${aba('midia', 'Mídia')}${aba('texto', 'Texto')}${aba('sug', 'Sugestões' + (p.sugestoes && p.sugestoes.length ? ' •' : ''))}${aba('rot', 'Roteiro')}</div>`;
    if (E.aba === 'midia') {
      h += `<div style="padding:10px"><div class="drop" id="ed-drop">Arraste vídeos, fotos, PDF ou música<br><small>ou clique para escolher</small></div><input type="file" id="ed-file" multiple hidden accept="video/*,image/*,audio/*,application/pdf,.pdf,.heic,.mov"></div><div id="ed-up"></div>`;
      const grupos = [['Vídeos', m => m.tipo === 'video'], ['Imagens', m => m.tipo === 'imagem'], ['Páginas de PDF', m => m.tipo === 'pagina'], ['Áudio', m => m.tipo === 'audio'], ['PDFs', m => m.tipo === 'pdf']];
      for (const [nome, f] of grupos) {
        const ms = p.midias.filter(f); if (!ms.length) continue;
        h += `<h3 style="margin:10px 12px 0">${nome} (${ms.length})</h3><div class="bin">${ms.map(m => `<div class="mi" draggable="${m.tipo !== 'pdf'}" data-mid="${m.id}" title="${esc(m.nome)}">
          <div class="im" style="${m.thumb ? `background-image:url('${API.arq(p.id, m.thumb)}')` : ''}">${m.tipo === 'audio' ? '<div style="padding:18px;text-align:center">♪</div>' : m.tipo === 'pdf' ? '<div style="padding:18px;text-align:center">PDF</div>' : ''}</div>
          ${m.categoria ? `<span class="tag">${esc((m.categoria || '').toUpperCase())}</span>` : m.narracao ? '<span class="tag">FALA</span>' : ''}
          <span>${esc(m.nome)}${m.dur ? ' · ' + Modelo.fmtTempo(m.dur) : ''}</span>
          <div class="ad">${m.tipo !== 'pdf' ? `<button data-add="${m.id}" title="Adicionar ao fim da faixa ${m.tipo === 'audio' ? 'de áudio' : 'principal'}">＋</button>` : ''}${['imagem', 'pagina', 'video'].includes(m.tipo) ? `<button data-sob="${m.id}" title="Sobrepor no cursor (com você em círculo)">⧉</button>` : ''}<button data-rm="${m.id}" title="Remover do projeto">✕</button></div></div>`).join('')}</div>`;
      }
      if (!p.midias.length) h += '<div class="vazio" style="margin:10px">Nenhuma mídia ainda.</div>';
    } else if (E.aba === 'texto') {
      h += `<div style="padding:12px"><p class="sub" style="margin:0 0 10px">Adiciona no cursor (${Modelo.fmtTempo(E.t)}). O estilo vem do preset.</p>
        ${[['gancho', 'Gancho (3s iniciais)'], ['ficha', 'Ficha / dado'], ['impacto', 'Texto de impacto'], ['rotulo', 'Rótulo de capítulo'], ['cta', 'Chamada para ação']].map(([k, n]) => `<button class="btn" style="width:100%;margin-bottom:6px;justify-content:flex-start" data-txt="${k}">＋ ${n}</button>`).join('')}
        <h3>Legendas</h3><label class="linha"><input type="checkbox" id="ed-legon" ${p.legendas.ativas ? 'checked' : ''}> Mostrar legendas</label>
        <p class="sub" style="margin:8px 0">${p.legendas.grupos.length} blocos ${p.legendas.origem ? '(' + p.legendas.origem + ')' : ''}. Clique num bloco da faixa Legendas para corrigir o texto.</p>
        <button class="btn" id="ed-leg-add" style="width:100%">＋ Bloco de legenda no cursor</button></div>`;
    } else if (E.aba === 'sug') {
      const s = p.sugestoes || [];
      h += s.length ? s.map(x => `<div class="sug"><span class="chip ${x.tipo === 'aviso' ? 'er' : 'av'}">${esc(x.tipo)}</span>${esc(x.texto)}</div>`).join('') + '<div style="padding:10px"><button class="btn pq" id="ed-sug-limpar">Marcar como revisadas</button></div>' : '<div class="vazio" style="margin:10px">Sem sugestões. O Auto Edit registra aqui cada decisão automática para você revisar.</div>';
    } else {
      const r = p.roteiro;
      h += r ? `<div style="padding:12px"><h3 style="margin-top:0">Gancho</h3><p>${esc(r.gancho)}</p><h3>Falas para gravar</h3>${r.cenas.map(c => `<p style="margin:6px 0"><span class="chip">${esc(c.rotulo || c.categoria || '')}</span> ${esc(c.fala)} ${c.fonte ? `<small style="color:var(--mut)">(${esc(c.fonte)})</small>` : ''}</p>`).join('')}<h3>CTA</h3><p>${esc(r.cta)}</p><h3>Legenda do post</h3><textarea rows="8" readonly>${esc(r.legendaPost)}</textarea>${(r.avisos || []).map(a => `<p class="chip er" style="margin-top:6px">${esc(a)}</p>`).join('')}</div>` : '<div class="vazio" style="margin:10px">Sem roteiro. Gere em PDF Intelligence ou no Auto Edit.</div>';
    }
    el.innerHTML = h;
    $$('[data-aba]', el).forEach(b => b.onclick = () => { E.aba = b.dataset.aba; desenharEsquerda(); });
    const drop = $('#ed-drop', el);
    if (drop) {
      drop.onclick = () => $('#ed-file').click(); $('#ed-file').onchange = e => enviar([...e.target.files]);
      drop.ondragover = e => { e.preventDefault(); drop.classList.add('on'); }; drop.ondragleave = () => drop.classList.remove('on');
      drop.ondrop = e => { e.preventDefault(); drop.classList.remove('on'); enviar([...e.dataTransfer.files]); };
    }
    $$('.mi[draggable=true]', el).forEach(d => d.ondragstart = e => e.dataTransfer.setData('text/midia', d.dataset.mid));
    $$('[data-add]', el).forEach(b => b.onclick = e => { e.stopPropagation(); adicionar(b.dataset.add, null); });
    $$('[data-sob]', el).forEach(b => b.onclick = e => { e.stopPropagation(); adicionar(b.dataset.sob, 'broll', E.t); });
    $$('[data-rm]', el).forEach(b => b.onclick = async e => { e.stopPropagation(); if (!confirm('Remover esta mídia do projeto?')) return; try { if (E.sujo) await salvar(); await API.del(`/api/projetos/${E.p.id}/midia/${b.dataset.rm}`); await recarregar(); } catch (x) { toast(x.message, true); } });
    $$('[data-txt]', el).forEach(b => b.onclick = () => { const tipo = b.dataset.txt, T = E.preset.titulos[tipo]; const id = Modelo.uid('x'); alterar(p => p.textos.push({ id, tipo, texto: tipo === 'cta' ? 'Chama no WhatsApp' : tipo === 'gancho' ? 'Seu gancho aqui' : 'Texto', inicio: r2(E.t), duracao: T ? T.duracao : 2 })); E.sel = { faixa: 'textos', id }; desenharInspetor(); });
    const lo = $('#ed-legon', el); if (lo) lo.onchange = () => alterar(p => { p.legendas.ativas = lo.checked; });
    const la = $('#ed-leg-add', el); if (la) la.onclick = () => { const g = { id: Modelo.uid('g'), ini: r2(E.t), fim: r2(E.t + 1.5), palavras: [{ t: 'Texto', ini: E.t, fim: E.t + 1.5 }] }; alterar(p => { p.legendas.grupos.push(g); p.legendas.grupos.sort((a, b) => a.ini - b.ini); }); E.sel = { faixa: 'legendas', id: g.id }; desenharInspetor(); };
    const sl = $('#ed-sug-limpar', el); if (sl) sl.onclick = () => alterar(p => { p.sugestoes = []; });
  }

  async function enviar(arqs) {
    const box = $('#ed-up'); if (E.sujo) await salvar();
    for (const f of arqs) {
      const d = document.createElement('div'); d.style.cssText = 'padding:4px 12px;font-size:12px'; d.innerHTML = `${esc(f.name)} <div class="barra"><i style="width:0"></i></div>`; box && box.appendChild(d);
      try {
        const r = await API.upload(E.p.id, f, x => { $('i', d).style.width = (x * 100) + '%'; });
        if (r.tarefa) { toast('PDF enviado: analisando páginas (PDF Intelligence)…'); API.esperar(r.tarefa).then(async j => { toast('PDF: ' + ESTADO[j.estado][0], j.estado === 'erro'); if (E) await recarregar(); }); }
        if (r.proxy) API.esperar(r.proxy).then(() => E && recarregar());
      } catch (e) { toast(f.name + ': ' + e.message, true); }
      d.remove();
    }
    await recarregar();
  }

  function adicionar(mid, faixa, inicio) {
    const m = Modelo.midiaDe(E.p, mid); if (!m) return;
    const id = Modelo.uid('c');
    alterar(p => {
      if (m.tipo === 'audio') p.audios.push({ id, midia: m.id, tipo: m.narracaoSintetica ? 'narracao' : 'musica', inicio: r2(inicio ?? 0), entrada: 0, duracao: r2(Math.min(m.dur, Math.max(E.lay.total, 5))), volume: m.narracaoSintetica ? 1 : E.preset.audio.musicaVolume, ducking: !m.narracaoSintetica });
      else if (faixa === 'broll') { const vel = m.tipo === 'video' ? E.preset.ritmo.velocidadeTour : 1; p.broll.push({ id, midia: m.id, inicio: r2(inicio || 0), duracao: m.tipo === 'video' ? r2(Math.min(m.dur, 3 * vel)) : 3, entrada: 0, velocidade: vel, volume: 0, pip: true, rotulo: m.categoria ? m.categoria.toUpperCase() : '', movimento: 'auto', enquadramento: 'auto' }); p.broll.sort((a, b) => a.inicio - b.inicio); }
      else {
        const clip = { id, midia: m.id, entrada: 0, duracao: m.tipo === 'video' ? r2(m.dur) : (E.preset.ritmo.maxCena > 3.2 ? 3.2 : E.preset.ritmo.maxCena), velocidade: 1, volume: m.tipo === 'video' && m.audio ? 1 : 0, transicao: { tipo: 'auto' }, movimento: 'auto', enquadramento: 'auto', rotulo: '' };
        if (m.tipo === 'video' && !m.narracao && !(m._fala)) { clip.velocidade = 1; }
        if (inicio != null) { const k = E.lay.clips.findIndex(c => c.ini + c.dur / 2 > inicio && c.clip.tipo !== 'telaFinal'); p.principal.splice(k < 0 ? p.principal.length : k, 0, clip); } else p.principal.push(clip);
      }
    });
    E.sel = { faixa: m.tipo === 'audio' ? 'audios' : faixa || 'principal', id }; desenharInspetor();
  }

  // ---------- inspetor ----------
  function itemSel() {
    if (!E.sel) return null;
    const { faixa, id } = E.sel;
    if (faixa === 'legendas') return E.p.legendas.grupos.find(g => g.id === id) || null;
    return (E.p[faixa] || []).find(x => x.id === id) || null;
  }
  const campo = (rot, html) => `<label class="c">${rot}</label>${html}`;
  const num = (k, v, passo = 0.1, min = '', max = '') => `<input type="number" data-k="${k}" value="${v ?? ''}" step="${passo}" min="${min}" max="${max}">`;
  const sel = (k, v, ops) => `<select data-k="${k}">${ops.map(o => Array.isArray(o) ? o : [o, o]).map(([a, b]) => `<option value="${a}" ${String(a) === String(v) ? 'selected' : ''}>${b}</option>`).join('')}</select>`;
  const rng = (k, v, min, max, passo) => `<div class="linha"><input type="range" data-k="${k}" value="${v}" min="${min}" max="${max}" step="${passo}" style="flex:1"><span style="width:38px;text-align:right;font-size:12px">${v}</span></div>`;

  function desenharInspetor() {
    const el = $('#ed-insp'); if (!el) return;
    const it = itemSel(), p = E.p;
    if (!it) {
      const e = p.empreendimento;
      el.innerHTML = `<h2>Projeto</h2>
        ${campo('Formatos para exportar', `<div class="linha">${Object.keys(Modelo.FORMATOS).map(k => `<label class="linha" style="gap:4px"><input type="checkbox" data-fmt="${k}" ${(p.formatosExport || [p.formato]).includes(k) ? 'checked' : ''}>${k.replace('x', ':')}</label>`).join('')}</div>`)}
        <h3>Empreendimento</h3>
        ${['nome', 'bairro', 'construtora', 'status', 'plantas', 'preco'].map(k => campo(k === 'preco' ? 'Preço (só se confirmado)' : k[0].toUpperCase() + k.slice(1), `<input type="text" data-emp="${k}" value="${esc(e[k] || '')}">`)).join('')}
        <h3>Acabamento</h3>
        <label class="linha"><input type="checkbox" data-aj="telaFinal" ${p.telaFinal ? 'checked' : ''}> Tela final com a marca</label>
        <label class="linha"><input type="checkbox" data-aj="marcaDagua" ${p.ajustes.marcaDagua !== false ? 'checked' : ''}> Logo (marca d'água)</label>
        <label class="linha"><input type="checkbox" data-aj="barraProgresso" ${p.ajustes.barraProgresso !== false ? 'checked' : ''}> Barra de progresso</label>
        <label class="linha"><input type="checkbox" data-aj="efeitosSonoros" ${p.ajustes.efeitosSonoros !== false ? 'checked' : ''}> Efeitos sonoros</label>
        <h3>Uso de IA</h3><label class="linha"><input type="checkbox" data-ia="conteudoGerado" ${p.ia.conteudoGerado ? 'checked' : ''}> Contém conteúdo gerado/alterado por IA</label>
        <p class="sub" style="font-size:12px;margin-top:10px">Selecione um bloco na linha do tempo para editar.</p>`;
      $$('[data-fmt]', el).forEach(c => c.onchange = () => alterar(p => { p.formatosExport = $$('[data-fmt]:checked', el).map(x => x.dataset.fmt); }));
      $$('[data-emp]', el).forEach(c => c.onchange = () => alterar(p => { p.empreendimento[c.dataset.emp] = c.value; if (p.empreendimento.fonte !== 'catalogo') p.empreendimento.fonte = 'manual'; }));
      $$('[data-aj]', el).forEach(c => c.onchange = () => alterar(p => { if (c.dataset.aj === 'telaFinal') p.telaFinal = c.checked; else p.ajustes[c.dataset.aj] = c.checked; }));
      $$('[data-ia]', el).forEach(c => c.onchange = () => alterar(p => { p.ia.conteudoGerado = c.checked; }));
      return;
    }
    const f = E.sel.faixa, m = it.midia && Modelo.midiaDe(p, it.midia);
    let h = `<div class="linha"><h2 style="margin:0">${{ principal: 'Clipe', broll: 'Sobreposição', textos: 'Texto', legendas: 'Legenda', audios: 'Áudio' }[f]}</h2><span class="esp"></span><button class="btn pq" id="ed-dup" title="Duplicar (Ctrl+D)">⧉</button><button class="btn pq perigo" id="ed-del" title="Apagar (Del)">🗑</button></div>`;
    if (m) h += `<p class="sub" style="margin:4px 0 0;font-size:12px">${esc(m.nome)}${m.pagina ? ' · página ' + m.pagina : ''}</p>`;
    if (f === 'principal' || f === 'broll') {
      if (f === 'broll') h += campo('Início (s)', num('inicio', it.inicio)) + `<label class="linha" style="margin-top:8px"><input type="checkbox" data-k="pip" ${it.pip !== false ? 'checked' : ''}> Apresentador em círculo por cima</label>`;
      if (m && m.tipo === 'video') h += campo('Entrada no vídeo (s)', num('entrada', r2(it.entrada || 0), 0.05, 0, m.dur)) + campo('Duração do trecho (s)', num('duracao', r2(it.duracao), 0.05, 0.2, m.dur)) + campo('Velocidade', sel('velocidade', it.velocidade || 1, [0.5, 0.75, 1, 1.25, 1.5, 2])) + (f === 'principal' ? campo('Volume', rng('volume', it.volume ?? 1, 0, 2, 0.05)) : '') + campo('Zoom (punch-in)', sel('zoom', it.zoom || 1, [[1, 'nenhum'], [1.06, '6%'], [1.12, '12%'], [1.2, '20%']]));
      else h += campo('Duração (s)', num('duracao', r2(it.duracao), 0.1, 0.3));
      h += campo('Enquadramento', sel('enquadramento', it.enquadramento || 'auto', [['auto', 'Automático'], ['preencher', 'Preencher (corta pelo foco)'], ['ajustar', 'Inteiro + fundo desfocado'], ['cartao', 'Cartão (estilo Apple)']]));
      h += campo('Movimento', sel('movimento', it.movimento || 'auto', [['auto', 'Automático'], ['nenhum', 'Nenhum'], ['zoomin', 'Aproximar'], ['zoomout', 'Afastar'], ['panesq', 'Panorâmica ←'], ['pandir', 'Panorâmica →'], ['subir', 'Subir'], ['descer', 'Descer']]));
      h += campo('Ponto de foco (reenquadramento)', `<div class="linha"><span style="font-size:11px">X</span>${rng('focoX', it.focoX ?? 0.5, 0, 1, 0.05)}</div><div class="linha"><span style="font-size:11px">Y</span>${rng('focoY', it.focoY ?? (m && m.tipo === 'video' ? 0.4 : 0.5), 0, 1, 0.05)}</div>`);
      h += campo('Rótulo de capítulo', `<input type="text" data-k="rotulo" value="${esc(it.rotulo || '')}" placeholder="ex.: LAZER">`);
      if (f === 'principal') h += campo('Transição de entrada', sel('transicao.tipo', (it.transicao || {}).tipo || 'auto', [['auto', 'Automática (preset)'], ['corte', 'Corte seco'], ...Modelo.TRANSICOES])) + campo('Duração da transição (s)', num('transicao.dur', (it.transicao || {}).dur ?? '', 0.05, 0.05, 2));
      h += `<h3>Ajustes de imagem</h3>` + campo('Brilho', rng('ajustes.brilho', (it.ajustes || {}).brilho ?? 0, -0.3, 0.3, 0.01)) + campo('Contraste', rng('ajustes.contraste', (it.ajustes || {}).contraste ?? 1, 0.6, 1.6, 0.01)) + campo('Saturação', rng('ajustes.saturacao', (it.ajustes || {}).saturacao ?? 1, 0, 2, 0.01));
    } else if (f === 'textos') {
      h += campo('Tipo', sel('tipo', it.tipo, [['gancho', 'Gancho'], ['ficha', 'Ficha'], ['impacto', 'Impacto'], ['rotulo', 'Rótulo'], ['cta', 'CTA']])) + campo('Texto', `<textarea data-k="texto" rows="2">${esc(it.texto)}</textarea>`) + campo('Linha de apoio', `<input type="text" data-k="sub" value="${esc(it.sub || '')}">`) + campo('Início (s)', num('inicio', it.inicio)) + campo('Duração (s)', num('duracao', it.duracao, 0.1, 0.3)) + campo('Posição vertical (0 = topo, 1 = base)', rng('posicaoY', it.posicaoY ?? E.preset.titulos[it.tipo]?.posicaoY ?? 0.5, 0.03, 0.95, 0.01));
    } else if (f === 'legendas') {
      h += campo('Texto (a palavra em destaque segue o tempo)', `<textarea id="ed-legtx" rows="3">${esc(it.palavras.map(q => q.t).join(' '))}</textarea>`) + campo('Início (s)', num('ini', r2(it.ini))) + campo('Fim (s)', num('fim', r2(it.fim))) + campo('Emoji', `<select data-k="emoji"><option value="">nenhum</option>${Modelo.EMOJIS.map(([w, c]) => `<option value="${c}" ${it.emoji === c ? 'selected' : ''}>${w[0]}</option>`).join('')}</select>`);
    } else if (f === 'audios') {
      h += campo('Tipo', sel('tipo', it.tipo || 'musica', [['musica', 'Música (repete até o fim)'], ['narracao', 'Narração'], ['sfx', 'Efeito']])) + campo('Início (s)', num('inicio', it.inicio)) + campo('Entrada no arquivo (s)', num('entrada', it.entrada || 0)) + campo('Duração (s)', num('duracao', it.duracao)) + campo('Volume', rng('volume', it.volume ?? 1, 0, 1.5, 0.01)) + `<label class="linha" style="margin-top:8px"><input type="checkbox" data-k="ducking" ${it.ducking !== false ? 'checked' : ''}> Abaixar quando houver fala</label>`;
    }
    el.innerHTML = h;
    $('#ed-del', el).onclick = apagarSel; $('#ed-dup', el).onclick = duplicarSel;
    $$('[data-k]', el).forEach(c => {
      const ev = c.type === 'range' ? 'input' : 'change';
      c[`on${ev}`] = () => {
        const k = c.dataset.k; let v = c.type === 'checkbox' ? c.checked : c.type === 'number' || c.type === 'range' ? (c.value === '' ? undefined : +c.value) : c.value;
        if (['velocidade', 'zoom'].includes(k)) v = +v;
        if (c.type === 'range') c.nextElementSibling && (c.nextElementSibling.textContent = c.value);
        alterar(() => { const x = itemSel(); if (!x) return; const partes = k.split('.'); let o = x; while (partes.length > 1) { const a = partes.shift(); o[a] = o[a] || {}; o = o[a]; } if (v === undefined) delete o[partes[0]]; else o[partes[0]] = v; if (f === 'broll' || f === 'textos' || f === 'audios') E.p[f].sort((a, b) => a.inicio - b.inicio); }, { semHistorico: c.type === 'range' && E._ultimoRange === k });
        E._ultimoRange = c.type === 'range' ? k : null;
      };
    });
    const lt = $('#ed-legtx', el); if (lt) lt.onchange = () => alterar(p => { const i = p.legendas.grupos.findIndex(g => g.id === E.sel.id); const n = Modelo.reescrever(p.legendas.grupos[i], lt.value); if (n) p.legendas.grupos[i] = n; else { p.legendas.grupos.splice(i, 1); E.sel = null; } });
  }
  function apagarSel() {
    if (!E.sel) return; const { faixa, id } = E.sel;
    alterar(p => { if (faixa === 'legendas') p.legendas.grupos = p.legendas.grupos.filter(g => g.id !== id); else p[faixa] = p[faixa].filter(x => x.id !== id); });
    E.sel = null; desenharInspetor();
  }
  function duplicarSel() {
    const it = itemSel(); if (!it || E.sel.faixa === 'legendas') return;
    const c = { ...JSON.parse(JSON.stringify(it)), id: Modelo.uid('c') }, f = E.sel.faixa;
    alterar(p => { if (f === 'principal') p.principal.splice(p.principal.findIndex(x => x.id === it.id) + 1, 0, c); else { c.inicio = r2(it.inicio + (it.duracao || 2)); p[f].push(c); p[f].sort((a, b) => a.inicio - b.inicio); } });
    E.sel = { faixa: f, id: c.id }; desenharInspetor();
  }
  // Dividir no cursor (faixa principal, sobreposicao, texto ou legenda selecionada)
  function dividir() {
    const t = E.t;
    if (E.sel && E.sel.faixa !== 'principal') {
      const it = itemSel(), f = E.sel.faixa; if (!it) return;
      if (f === 'legendas') { if (t <= it.ini || t >= it.fim) return toast('Posicione o cursor dentro do bloco'); alterar(p => { const i = p.legendas.grupos.findIndex(g => g.id === it.id); const a = { ...it, fim: t, palavras: it.palavras.filter(q => q.ini < t) }, b = { ...it, id: Modelo.uid('g'), ini: t, palavras: it.palavras.filter(q => q.ini >= t) }; p.legendas.grupos.splice(i, 1, ...[a, b].filter(x => x.palavras.length)); }); return; }
      const m = it.midia && Modelo.midiaDe(E.p, it.midia), vel = it.velocidade || 1, durT = m ? Modelo.duracaoClip(it, m) : it.duracao;
      if (t <= it.inicio + 0.1 || t >= it.inicio + durT - 0.1) return toast('Posicione o cursor dentro do bloco selecionado');
      alterar(p => { const a = p[f].find(x => x.id === it.id), b = { ...JSON.parse(JSON.stringify(a)), id: Modelo.uid('c'), inicio: r2(t) }; const corte = t - a.inicio; if (m && m.tipo === 'video') { b.entrada = r2((a.entrada || 0) + corte * vel); b.duracao = r2(a.duracao - corte * vel); a.duracao = r2(corte * vel); } else { b.duracao = r2(a.duracao - corte); a.duracao = r2(corte); } p[f].push(b); p[f].sort((x, y) => x.inicio - y.inicio); });
      return;
    }
    const lc = E.lay.clips.find(c => t > c.ini + 0.1 && t < c.fim - 0.1 && c.clip.tipo !== 'telaFinal');
    if (!lc) return toast('Posicione o cursor sobre um clipe da faixa principal');
    alterar(p => {
      const i = p.principal.findIndex(x => x.id === lc.clip.id), a = p.principal[i], b = { ...JSON.parse(JSON.stringify(a)), id: Modelo.uid('c'), transicao: { tipo: 'corte' } };
      const corte = t - lc.ini;
      if (lc.midia && lc.midia.tipo === 'video') { const vel = a.velocidade || 1; b.entrada = r2((a.entrada || 0) + corte * vel); b.duracao = r2(a.duracao - corte * vel); a.duracao = r2(corte * vel); }
      else { b.duracao = r2(a.duracao - corte); a.duracao = r2(corte); }
      p.principal.splice(i + 1, 0, b);
    });
  }

  // ---------- linha do tempo ----------
  function blocos() {
    const p = E.p, out = { principal: [], broll: [], textos: [], legendas: [], audios: [] };
    E.lay.clips.forEach(lc => out.principal.push({ id: lc.clip.id, ini: lc.ini, dur: lc.dur, nome: lc.clip.tipo === 'telaFinal' ? 'Tela final' : (lc.midia ? lc.midia.nome : '?'), thumb: lc.midia && lc.midia.thumb, fim: lc.clip.tipo === 'telaFinal' }));
    p.broll.forEach(b => { const m = Modelo.midiaDe(p, b.midia); out.broll.push({ id: b.id, ini: b.inicio, dur: Modelo.duracaoClip(b, m), nome: (b.rotulo ? b.rotulo + ' · ' : '') + (m ? m.nome : '?'), thumb: m && m.thumb }); });
    p.textos.forEach(x => out.textos.push({ id: x.id, ini: x.inicio, dur: x.duracao || 2, nome: `${x.tipo}: ${x.texto}` }));
    p.legendas.grupos.forEach(g => out.legendas.push({ id: g.id, ini: g.ini, dur: g.fim - g.ini, nome: g.palavras.map(q => q.t).join(' ') }));
    p.audios.forEach(a => { const m = Modelo.midiaDe(p, a.midia); out.audios.push({ id: a.id, ini: a.inicio, dur: a.duracao || (m && m.dur) || 3, nome: '♪ ' + (m ? m.nome : '?') }); });
    return out;
  }
  function desenharTimeline() {
    const el = $('#ed-tl'), pps = E.pps, total = Math.max(E.lay.total, 10) + 6, W = total * pps;
    const passo = pps > 120 ? 0.5 : pps > 50 ? 1 : pps > 20 ? 2 : 5;
    let h = `<div class="regua" id="ed-regua" style="width:${W}px">`;
    for (let s = 0; s < total; s += passo) h += `<i style="left:${s * pps}px">${Modelo.fmtTempo(s).replace(/\.0$/, '')}</i>`;
    h += '</div>';
    const b = blocos();
    for (const [f] of FAIXAS) {
      h += `<div class="faixa" data-faixa="${f}" style="width:${W}px">`;
      for (const x of b[f]) {
        const ehSel = E.sel && E.sel.faixa === f && E.sel.id === x.id;
        h += `<div class="bl f-${f} ${ehSel ? 'sel' : ''} ${x.fim ? 'fim' : ''}" data-f="${f}" data-id="${x.id}" style="left:${x.ini * pps}px;width:${Math.max(4, x.dur * pps)}px;${x.thumb ? `background-image:url('${API.arq(E.p.id, x.thumb)}')` : ''}">${x.fim ? '' : '<span class="al e"></span>'}<b>${esc(x.nome)}</b>${x.fim ? '' : '<span class="al d"></span>'}</div>`;
      }
      h += '</div>';
    }
    h += '<div class="cabeca" id="ed-cab"></div>';
    el.innerHTML = h; el.style.width = W + 'px';
    atualizarCabeca();
  }
  function atualizarCabeca() {
    const c = $('#ed-cab'); if (c) c.style.left = E.t * E.pps + 'px';
    const t = $('#ed-tempo'); if (t) t.textContent = `${Modelo.fmtTempo(E.t)} / ${Modelo.fmtTempo(E.lay.total)}`;
  }
  function ajustarZoom() { const w = $('#ed-tls').clientWidth - 40; E.pps = Math.max(8, Math.min(200, w / Math.max(8, E.lay.total + 2))); desenharTimeline(); }

  function ligarTimeline() {
    const sc = $('#ed-tls'), cont = $('#ed-tl');
    const tempoX = x => (x - cont.getBoundingClientRect().left) / E.pps;
    cont.addEventListener('mousedown', ev => {
      const bl = ev.target.closest('.bl');
      if (!bl) { if (ev.target.closest('.regua') || ev.target.classList.contains('faixa')) { irPara(tempoX(ev.clientX)); E.sel = null; desenharTimeline(); desenharInspetor(); const mv = e => irPara(tempoX(e.clientX)); const up = () => { removeEventListener('mousemove', mv); removeEventListener('mouseup', up); }; addEventListener('mousemove', mv); addEventListener('mouseup', up); } return; }
      if (bl.classList.contains('fim')) { E.sel = null; desenharInspetor(); return; }
      const f = bl.dataset.f, id = bl.dataset.id, modo = ev.target.classList.contains('al') ? (ev.target.classList.contains('e') ? 'e' : 'd') : 'mover';
      E.sel = { faixa: f, id }; $$('.bl.sel').forEach(x => x.classList.remove('sel')); bl.classList.add('sel'); desenharInspetor();
      const x0 = ev.clientX, snap = JSON.stringify(E.p), orig = JSON.parse(JSON.stringify(itemSel())); let mexeu = false;
      const mv = e => {
        const dt = (e.clientX - x0) / E.pps; if (Math.abs(e.clientX - x0) < 3 && !mexeu) return; mexeu = true;
        const it = itemSel(); if (!it) return;
        const m = it.midia && Modelo.midiaDe(E.p, it.midia), vel = it.velocidade || 1, video = m && m.tipo === 'video';
        if (f === 'principal') {
          if (modo === 'mover') { bl.style.transform = `translateX(${dt * E.pps}px)`; bl.style.zIndex = 9; return; }
          if (modo === 'e' && video) { const d = Math.max(-(orig.entrada || 0), Math.min(orig.duracao - 0.2, dt * vel)); it.entrada = r2((orig.entrada || 0) + d); it.duracao = r2(orig.duracao - d); }
          else if (modo === 'd' && video) it.duracao = r2(Math.max(0.2, Math.min(m.dur - (it.entrada || 0), orig.duracao + dt * vel)));
          else if (modo === 'd') it.duracao = r2(Math.max(0.3, orig.duracao + dt));
          else if (modo === 'e') it.duracao = r2(Math.max(0.3, orig.duracao - dt));
        } else if (f === 'legendas') {
          if (modo === 'mover') { const d = Math.max(-orig.ini, dt); it.ini = r2(orig.ini + d); it.fim = r2(orig.fim + d); it.palavras = orig.palavras.map(q => ({ ...q, ini: q.ini + d, fim: q.fim + d })); }
          else { if (modo === 'e') it.ini = r2(Math.min(orig.fim - 0.2, Math.max(0, orig.ini + dt))); else it.fim = r2(Math.max(orig.ini + 0.2, orig.fim + dt)); const k = (it.fim - it.ini) / (orig.fim - orig.ini); it.palavras = orig.palavras.map(q => ({ ...q, ini: it.ini + (q.ini - orig.ini) * k, fim: it.ini + (q.fim - orig.ini) * k })); }
        } else {
          if (modo === 'mover') it.inicio = r2(Math.max(0, orig.inicio + dt));
          else if (modo === 'd') it.duracao = r2(Math.max(0.3, video ? Math.min(m.dur - (it.entrada || 0), orig.duracao + dt * vel) : orig.duracao + dt));
          else { const d = Math.max(-orig.inicio, Math.min((video ? orig.duracao / vel : orig.duracao) - 0.3, dt)); it.inicio = r2(orig.inicio + d); it.duracao = r2(orig.duracao - d * (video ? vel : 1)); if (video || f === 'audios') it.entrada = r2((orig.entrada || 0) + d * (video ? vel : 1)); }
        }
        recalcular(); desenharTimeline(); $$(`.bl[data-id="${id}"]`).forEach(x => x.classList.add('sel'));
      };
      const up = e => {
        removeEventListener('mousemove', mv); removeEventListener('mouseup', up);
        if (!mexeu) return;
        if (f === 'principal' && modo === 'mover') {
          const t = tempoX(e.clientX), lista = E.p.principal, i = lista.findIndex(x => x.id === id);
          let alvo = E.lay.clips.filter(c => c.clip.tipo !== 'telaFinal' && c.clip.id !== id).findIndex(c => c.ini + c.dur / 2 > t);
          const it = lista.splice(i, 1)[0]; if (alvo < 0) alvo = lista.length; lista.splice(alvo, 0, it);
        }
        if (['broll', 'textos', 'audios'].includes(f)) E.p[f].sort((a, b) => a.inicio - b.inicio);
        E.undo.push(snap); E.redo = []; pos();
      };
      addEventListener('mousemove', mv); addEventListener('mouseup', up);
    });
    // soltar midia da biblioteca numa faixa
    cont.addEventListener('dragover', e => e.preventDefault());
    cont.addEventListener('drop', e => {
      e.preventDefault(); const mid = e.dataTransfer.getData('text/midia'); if (!mid) return;
      const fx = e.target.closest('.faixa'), f = fx ? fx.dataset.faixa : 'principal', t = tempoX(e.clientX);
      adicionar(mid, f === 'broll' ? 'broll' : f === 'audios' ? 'audios' : null, t);
    });
    sc.addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); E.pps = Math.max(5, Math.min(300, E.pps * (e.deltaY < 0 ? 1.15 : 0.87))); desenharTimeline(); } }, { passive: false });
  }

  function ligarTopo() {
    $('#ed-nome').onchange = e => alterar(p => { p.nome = e.target.value || 'Sem nome'; });
    $('#ed-formato').onchange = e => { alterar(p => { p.formato = e.target.value; if (!(p.formatosExport || []).includes(p.formato)) p.formatosExport = [p.formato, ...(p.formatosExport || [])]; }); Preview.redimensionar(); };
    $('#ed-preset').onchange = async e => { E.preset = await API.get('/api/presets/' + e.target.value); alterar(p => { p.presetId = e.target.value; }); };
    $('#ed-undo').onclick = desfazer; $('#ed-redo').onclick = refazer;
    $('#ed-play').onclick = () => tocar(); $('#ed-inicio').onclick = () => irPara(0);
    $('#ed-dividir').onclick = dividir;
    $('#ed-zm').onclick = () => { E.pps = Math.max(5, E.pps / 1.4); desenharTimeline(); }; $('#ed-zp').onclick = () => { E.pps = Math.min(300, E.pps * 1.4); desenharTimeline(); }; $('#ed-zfit').onclick = ajustarZoom;
    $('#ed-previa').onclick = () => renderizar('previa', [E.p.formato]);
    $('#ed-exportar').onclick = () => renderizar('final', E.p.formatosExport && E.p.formatosExport.length ? E.p.formatosExport : [E.p.formato]);
    $('#ed-transcrever').onclick = async () => { if (E.sujo) await salvar(); const j = await API.post(`/api/projetos/${E.p.id}/transcrever`); toast('Gerando legendas da fala (IA local)…'); API.esperar(j.id).then(async r => { toast(r.estado === 'concluido' ? `Legendas prontas: ${r.resultado.legendas} blocos` : 'Legendas: ' + (r.erro || r.estado), r.estado !== 'concluido'); await recarregar(); }); };
    $('#ed-autoedit').onclick = async () => { if (E.sujo) await salvar(); location.hash = '#/autoedit/' + E.p.id; };
    $('#ed-versoes').onclick = versoes;
  }
  async function renderizar(qualidade, formatos) {
    if (!E.p.principal.length) return toast('Adicione clipes na faixa principal primeiro', true);
    await salvar(true);
    const js = await API.post(`/api/projetos/${E.p.id}/render`, { qualidade, formatos });
    const caixa = document.createElement('div'); caixa.className = 'modal';
    caixa.innerHTML = `<div style="width:min(760px,92vw)"><div class="linha"><h2 style="margin:0">${qualidade === 'previa' ? 'Prévia renderizada' : 'Exportando'}</h2><span class="esp"></span><button class="btn pq" id="mx">Fechar</button></div><p class="sub">A renderização continua no servidor mesmo se você fechar esta janela (acompanhe em Renderizações).</p><div id="mlist"></div></div>`;
    document.body.appendChild(caixa); $('#mx', caixa).onclick = () => caixa.remove();
    for (const j of js) {
      const d = document.createElement('div'); d.className = 'cartao'; d.style.marginBottom = '10px'; d.innerHTML = `<div class="linha"><b>${esc(j.rotulo)}</b><span class="esp"></span><span class="st">${chipEstado(j.estado)}</span><button class="btn pq perigo cx">Cancelar</button></div><div class="barra" style="margin-top:8px"><i style="width:0"></i></div><div class="res"></div>`;
      $('#mlist', caixa).appendChild(d); $('.cx', d).onclick = () => API.post(`/api/tarefas/${j.id}/cancelar`);
      API.esperar(j.id, x => { $('i', d).style.width = x.progresso + '%'; $('.st', d).innerHTML = chipEstado(x.estado); }).then(x => {
        $('.cx', d).remove();
        if (x.estado === 'concluido') { const r = x.resultado, u = API.arq(E.p.id, r.arquivo); $('.res', d).innerHTML = `<video src="${u}" controls style="width:100%;max-height:60vh;margin-top:10px;background:#000;border-radius:8px"></video><div class="linha" style="margin-top:8px"><span class="chip ${r.validacao.ok ? 'ok' : 'er'}">${r.validacao.ok ? 'validado' : 'verificar'}: ${r.validacao.largura}×${r.validacao.altura} · ${r.validacao.duracao}s · ${r.validacao.video}/${r.validacao.audio}</span><span class="esp"></span>${qualidade === 'final' ? `<a class="btn pq pri" href="${u}?baixar">⬇ Baixar MP4</a>${r.srt ? `<a class="btn pq" href="${API.arq(E.p.id, r.srt)}?baixar">SRT</a>` : ''}${r.capa ? `<a class="btn pq" href="${API.arq(E.p.id, r.capa)}?baixar">Capa</a>` : ''}` : ''}</div>`; }
        else $('.res', d).innerHTML = `<pre style="white-space:pre-wrap;font-size:11px;color:var(--erro)">${esc(x.erro || x.estado)}</pre>`;
      });
    }
  }
  async function versoes() {
    if (E.sujo) await salvar();
    const vs = await API.get(`/api/projetos/${E.p.id}/versoes`);
    const c = document.createElement('div'); c.className = 'modal';
    c.innerHTML = `<div style="width:min(520px,92vw)"><div class="linha"><h2 style="margin:0">Versões salvas</h2><span class="esp"></span><button class="btn pq" id="vx">Fechar</button></div><p class="sub">Uma versão é guardada a cada 2 minutos de edição e antes de cada exportação.</p>${vs.length ? vs.map(v => `<div class="linha" style="padding:6px 0;border-bottom:1px solid var(--linha)"><span>${dataBR(v.data)}</span><span class="esp"></span><button class="btn pq" data-v="${v.id}">Restaurar</button></div>`).join('') : '<div class="vazio">Nenhuma versão ainda.</div>'}</div>`;
    document.body.appendChild(c); $('#vx', c).onclick = () => c.remove();
    $$('[data-v]', c).forEach(b => b.onclick = async () => { if (!confirm('Restaurar esta versão? A atual também fica guardada.')) return; await API.post(`/api/projetos/${E.p.id}/versoes/${b.dataset.v}/restaurar`); c.remove(); await recarregar(); toast('Versão restaurada'); });
  }

  function teclado(e) {
    if (!E || !$('.ed')) return;
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    const k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
    if (k === ' ') { e.preventDefault(); tocar(); }
    else if (ctrl && k === 'z') { e.preventDefault(); e.shiftKey ? refazer() : desfazer(); }
    else if (ctrl && k === 'y') { e.preventDefault(); refazer(); }
    else if (ctrl && k === 's') { e.preventDefault(); salvar(true); }
    else if (ctrl && k === 'd') { e.preventDefault(); duplicarSel(); }
    else if (k === 's') dividir();
    else if (k === 'delete' || k === 'backspace') { e.preventDefault(); apagarSel(); }
    else if (k === 'arrowleft') irPara(E.t - (e.shiftKey ? 1 : 1 / 30));
    else if (k === 'arrowright') irPara(E.t + (e.shiftKey ? 1 : 1 / 30));
    else if (k === 'home') irPara(0); else if (k === 'end') irPara(E.lay.total);
    else if (k === 'escape') { E.sel = null; desenharTimeline(); desenharInspetor(); }
  }
  addEventListener('beforeunload', e => { if (E && E.sujo) { salvar(); e.preventDefault(); } });
  return { abrir, fechar };
})();

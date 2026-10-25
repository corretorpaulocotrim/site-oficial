// Previa ao vivo do editor: desenha o projeto no tempo t usando a MESMA linha do tempo do render (Modelo.layout).
// Transicoes e cor exata aparecem na "Previa renderizada" (FFmpeg); aqui o foco e montar rapido.
const Preview = (() => {
  let raiz, palco, camadas, txts, logo, barra, fim, estado, ultimaChave = '';
  const audios = new Map();

  function fonteCSS(nome, negrito) {
    const n = String(nome || 'Inter'), fam = /Cormorant/.test(n) ? "'Cormorant Garamond',Georgia,serif" : 'Inter,system-ui,sans-serif';
    let w = negrito ? 700 : 400;
    if (/Black/.test(n)) w = 900; else if (/ExtraBold/.test(n)) w = 800; else if (/SemiBold/.test(n)) w = 600; else if (/Bold/.test(n)) w = 700; else if (/Medium/.test(n)) w = 500;
    if (/Cormorant/.test(n) && w < 500) w = 500;
    return `font-family:${fam};font-weight:${w};`;
  }
  const rgba = (hex, op) => { const h = String(hex || '#000').replace('#', ''); return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${op})`; };
  const geom = (w, h) => ({ s: h > w ? w : w === h ? w * 0.92 : h * 0.62, legY: h / w > 1.6 ? null : w === h ? 0.8 : w > h ? 0.86 : 0.78 });

  function camada() {
    const c = document.createElement('div'); c.className = 'cam';
    c.innerHTML = '<div class="fundo" style="position:absolute;inset:0"></div><video playsinline preload="auto"></video><img class="mid" alt=""><div class="card"></div>';
    palco.appendChild(c);
    return { el: c, fundo: c.children[0], video: c.children[1], img: c.children[2], card: c.children[3] };
  }
  function init(container, getEstado) {
    raiz = container; estado = getEstado;
    raiz.innerHTML = '<div class="palco"></div>'; palco = raiz.firstChild;
    camadas = { principal: camada(), broll: camada() };
    fim = document.createElement('div'); fim.className = 'fimtela'; palco.appendChild(fim);
    txts = document.createElement('div'); txts.style.cssText = 'position:absolute;inset:0;pointer-events:none'; palco.appendChild(txts);
    logo = document.createElement('img'); logo.className = 'logo'; logo.src = '/api/marca/logo/monograma'; palco.appendChild(logo);
    barra = document.createElement('div'); barra.className = 'barraP'; palco.appendChild(barra);
    new ResizeObserver(redimensionar).observe(raiz);
    redimensionar();
  }
  function redimensionar() {
    const E = estado(); if (!E || !E.p) return;
    const F = Modelo.FORMATOS[E.p.formato], aw = raiz.clientWidth - 24, ah = raiz.clientHeight - 24;
    const k = Math.min(aw / F.w, ah / F.h);
    palco.style.width = Math.max(50, F.w * k) + 'px'; palco.style.height = Math.max(50, F.h * k) + 'px';
    ultimaChave = '';
  }
  const esconder = c => { c.video.style.display = 'none'; c.img.style.display = 'none'; c.card.style.display = 'none'; c.fundo.style.background = 'none'; if (!c.video.paused) c.video.pause(); c.el.style.display = 'none'; };
  function filtro(preset, aj = {}) {
    const c = preset.cor;
    return `contrast(${(c.contraste * (aj.contraste ?? 1)).toFixed(2)}) saturate(${(c.saturacao * (aj.saturacao ?? 1)).toFixed(2)}) brightness(${(1 + c.brilho * 2 + (aj.brilho || 0) * 2).toFixed(2)})`;
  }

  function mostrar(c, item, m, tLocal, dur, tocando, ehPrincipal, E) {
    const p = E.p, preset = E.preset;
    c.el.style.display = 'block'; c.el.classList.remove('pip'); c.el.style.cssText = 'position:absolute;inset:0;overflow:hidden';
    if (item.tipo === 'telaFinal' || !m) { esconder(c); return; }
    const fx = item.focoX ?? 0.5, fy = item.focoY ?? (m.tipo === 'video' ? 0.4 : 0.5), prog = Math.max(0, Math.min(1, tLocal / dur));
    if (m.tipo === 'video') {
      c.img.style.display = 'none'; c.card.style.display = 'none'; c.fundo.style.background = '#000';
      const v = c.video, url = API.arq(p.id, m.proxy || m.arquivo), vel = item.velocidade || 1;
      v.style.display = 'block';
      if (v.dataset.src !== url) { v.dataset.src = url; v.src = url; }
      const alvo = (item.entrada || 0) + tLocal * vel;
      v.muted = !ehPrincipal || (item.volume ?? 1) === 0; v.volume = Math.max(0, Math.min(1, item.volume ?? 1));
      if (tocando) { v.playbackRate = vel; if (v.paused) v.play().catch(() => {}); if (Math.abs(v.currentTime - alvo) > 0.35) v.currentTime = alvo; }
      else { if (!v.paused) v.pause(); if (Math.abs(v.currentTime - alvo) > 0.04 && v.readyState >= 1) v.currentTime = alvo; }
      const modo = item.enquadramento && item.enquadramento !== 'auto' ? item.enquadramento : (m.w && m.h && Math.abs((m.w / m.h) / (Modelo.FORMATOS[p.formato].w / Modelo.FORMATOS[p.formato].h) - 1) < 0.22 ? 'preencher' : 'ajustar');
      v.style.objectFit = modo === 'preencher' ? 'cover' : 'contain';
      v.style.objectPosition = `${fx * 100}% ${fy * 100}%`;
      const z = (item.zoom || 1) * (item.movimento === 'zoomin' ? 1 + (item.intensidade ?? preset.movimento.intensidade) * prog : item.movimento === 'zoomout' ? 1 + (item.intensidade ?? preset.movimento.intensidade) * (1 - prog) : 1);
      v.style.transform = `scale(${z})`; v.style.transformOrigin = `${fx * 100}% ${fy * 100}%`;
      v.style.filter = filtro(preset, item.ajustes);
    } else {
      if (!c.video.paused) c.video.pause(); c.video.style.display = 'none';
      const url = API.arq(p.id, m.arquivo);
      let modo = item.enquadramento && item.enquadramento !== 'auto' ? item.enquadramento : (m.tipo === 'pagina' ? preset.movimento.pdf || 'cartao' : preset.movimento.fotos === 'cartao' ? 'cartao' : 'preencher');
      const I = item.intensidade ?? (m.tipo === 'pagina' && m.categoria === 'planta' ? preset.movimento.planta : preset.movimento.intensidade);
      const mov = item.movimento && item.movimento !== 'auto' ? item.movimento : (modo === 'preencher' && preset.movimento.fotos === 'pan' ? 'pan' : 'zoomin');
      const escala = mov === 'zoomout' ? 1 + I * (1 - prog) : mov === 'nenhum' || /pan|subir|descer/.test(mov) ? 1 : 1 + I * prog;
      if (modo === 'cartao') {
        c.img.style.display = 'none'; c.card.style.display = 'block';
        c.fundo.style.background = m.tipo === 'pagina' ? (E.marca.cores.tinta || '#1a1a19') : `center/cover url("${url}")`; c.fundo.style.filter = m.tipo === 'pagina' ? '' : 'blur(14px) brightness(.8)';
        c.card.style.backgroundImage = `url("${url}")`; c.card.style.transform = `scale(${escala})`;
      } else {
        c.card.style.display = 'none'; c.fundo.style.background = '#000'; c.fundo.style.filter = '';
        const im = c.img; im.style.display = 'block'; if (im.dataset.src !== url) { im.dataset.src = url; im.src = url; }
        im.style.objectFit = modo === 'ajustar' ? 'contain' : 'cover';
        const pos = mov === 'panesq' || (mov === 'pan' && (item.indice || 0) % 2) ? (1 - prog) * 100 : mov === 'pandir' || mov === 'pan' ? prog * 100 : fx * 100;
        im.style.objectPosition = /subir|descer/.test(mov) ? `50% ${(mov === 'subir' ? 1 - prog : prog) * 100}%` : `${pos}% ${fy * 100}%`;
        im.style.transform = `scale(${/pan|subir|descer/.test(mov) ? 1.0 : escala})`; im.style.transformOrigin = `${fx * 100}% ${fy * 100}%`;
        im.style.filter = m.tipo === 'pagina' ? '' : filtro(preset, item.ajustes);
      }
    }
  }

  function textoHTML(E, w, h, t, lay, tocando) {
    const p = E.p, preset = E.preset, g = geom(w, h), s = g.s, partes = [];
    const tit = (tipo, texto, sub, posY, x0, a) => {
      const T = preset.titulos[tipo] || preset.titulos.ficha, y = (posY ?? T.posicaoY) * h, box = T.fundo && T.fundoOpacidade > 0;
      const st = `${fonteCSS(T.fonte, /Black|Bold/.test(T.fonte) || tipo === 'rotulo')}font-size:${T.tamanho * s}px;color:${T.cor};${box ? `background:${rgba(T.fundo, T.fundoOpacidade)};` : 'text-shadow:0 .06em .2em #000a;'}`;
      const tx = esc(T.caixaAlta ? String(texto).toUpperCase() : texto);
      const anima = tocando && a < 0.3 ? (T.animacao === 'subir' ? `transform:translateY(${(1 - a / 0.3) * 0.02 * h}px);opacity:${a / 0.3};` : T.animacao === 'pop' ? `transform:scale(${0.8 + 0.2 * a / 0.3});opacity:${a / 0.3};` : `opacity:${a / 0.3};`) : '';
      if (tipo === 'rotulo') partes.push(`<div class="tx" style="left:5%;right:auto;text-align:left;top:${y}px;${anima}"><span class="bx" style="${st}">● ${tx}</span></div>`);
      else partes.push(`<div class="tx" style="top:${y}px;${anima}"><span class="bx" style="${st}">${tx}${sub ? `<br><span style="font-size:.58em;font-weight:400">${esc(sub)}</span>` : ''}</span></div>`);
    };
    for (const x of p.textos || []) if (t >= x.inicio && t < x.inicio + (x.duracao || 2)) tit(x.tipo || 'impacto', x.texto, x.sub, x.posicaoY, null, t - x.inicio);
    for (const b of p.broll || []) { const d = Modelo.duracaoClip(b, Modelo.midiaDe(p, b.midia)); if (b.rotulo && t >= b.inicio && t < b.inicio + d) tit('rotulo', b.rotulo, '', null, null, t - b.inicio); }
    for (const lc of lay.clips) if (lc.clip.rotulo && lc.clip.tipo !== 'telaFinal' && t >= lc.ini && t < lc.fim) tit('rotulo', lc.clip.rotulo, '', null, null, t - lc.ini);
    const L = preset.legenda;
    if (p.legendas && p.legendas.ativas && t < lay.fimConteudo) {
      const gr = (p.legendas.grupos || []).find(x => t >= x.ini && t < x.fim);
      if (gr) {
        const dest = new Set((L.palavrasDestaque || []).map(x => x.toLowerCase()));
        const box = L.fundo && L.fundoOpacidade > 0, tam = L.tamanho * s, y = (g.legY || L.posicaoY) * h;
        const words = gr.palavras.map(q => {
          const ativo = L.destacarAtiva && t >= q.ini && t < q.fim, d = dest.has(q.t.toLowerCase().replace(/[.,!?;:]/g, '')) || /\d/.test(q.t);
          const tx = esc(L.caixaAlta ? q.t.toUpperCase() : q.t);
          return `<span style="color:${ativo || d ? L.destaque : L.cor};${ativo ? 'display:inline-block;transform:scale(1.06)' : ''}">${tx}</span>`;
        }).join(' ');
        const contorno = !box && L.espessura > 0 ? `-webkit-text-stroke:${L.espessura * s * 1.3}px ${L.contorno};paint-order:stroke fill;` : '';
        partes.push(`<div class="tx" style="top:${y}px;transform:translateY(-100%);${fonteCSS(L.fonte, L.negrito)}font-size:${tam}px;${contorno}text-shadow:0 ${L.sombra * s}px ${L.sombra * s * 2}px #000c"><span class="bx" style="${box ? `background:${rgba(L.fundo, L.fundoOpacidade)}` : ''}">${words}</span></div>`);
        if (L.emojis && gr.emoji) partes.push(`<img class="emo" src="/assets/emojis/${gr.emoji}.png" style="width:${tam * 1.5}px;top:${y - tam * 2.55 - tam * 1.5}px">`);
      }
    }
    return partes.join('');
  }

  function desenhar(t, tocando) {
    const E = estado(); if (!E || !E.p || !palco) return;
    const p = E.p, preset = E.preset, lay = E.lay;
    const w = palco.clientWidth, h = palco.clientHeight;
    // faixa principal
    let lc = null; for (const c of lay.clips) if (t >= c.ini && t < c.fim) lc = c;
    if (!lc && lay.clips.length && t >= lay.total) lc = lay.clips[lay.clips.length - 1];
    if (lc) mostrar(camadas.principal, { ...lc.clip, indice: lay.clips.indexOf(lc) }, lc.midia, Math.max(0, t - lc.ini), lc.dur, tocando, true, E); else esconder(camadas.principal);
    // sobreposicao (b-roll) + apresentador em circulo
    const b = (p.broll || []).find(x => t >= x.inicio && t < x.inicio + Modelo.duracaoClip(x, Modelo.midiaDe(p, x.midia)));
    if (b) {
      const m = Modelo.midiaDe(p, b.midia);
      mostrar(camadas.broll, b, m, t - b.inicio, Modelo.duracaoClip(b, m), tocando, false, E);
      if (b.pip !== false && lc && lc.midia && lc.midia.tipo === 'video') {
        const P = Math.min(w, h) * 0.34, pe = camadas.principal.el;
        pe.classList.add('pip'); pe.style.cssText = `position:absolute;overflow:hidden;border-radius:50%;width:${P}px;height:${P}px;left:${w - P - w * 0.05}px;top:${h > w ? h * 0.5 : h - P - h * 0.08}px;box-shadow:0 0 0 ${P * 0.03}px ${E.marca.cores.ouro};z-index:3`;
        camadas.principal.video.style.objectFit = 'cover'; camadas.principal.video.style.objectPosition = '50% 12%';
      }
    } else esconder(camadas.broll);
    camadas.broll.el.style.zIndex = 2;
    // tela final
    if (lc && lc.clip.tipo === 'telaFinal') {
      const C = E.marca.cores, T = E.marca.telaFinal, s = geom(w, h).s;
      fim.style.display = 'flex'; fim.style.background = `radial-gradient(circle at 50% 40%, ${C.grafite}, ${C.tinta})`;
      const k = `${w}${h}${T.titulo}${T.linha1}`;
      if (fim.dataset.k !== k) {
        fim.dataset.k = k;
        fim.innerHTML = `<img src="/api/marca/logo/monograma" style="width:${Math.min(w, h) * 0.26}px;margin-top:${h * (h > w ? 0.36 : 0.3) - Math.min(w, h) * 0.13 - h * 0.24}px"><div style="font:600 ${s * 0.085}px 'Cormorant Garamond';color:${C.marfim}">${esc(T.titulo)}</div><div style="font:700 ${s * 0.045}px Inter;background:${C.ouro};color:${C.tinta};padding:.3em .7em;border-radius:.2em">${esc(T.linha1)} ${esc(T.linha2)}</div><div style="font:400 ${s * 0.036}px Inter;color:${C.marfim};opacity:.9;text-align:center">${esc(T.linha3)} • ${esc(E.marca.instagram)}<br>${esc(E.marca.creci)}</div>`;
      }
    } else fim.style.display = 'none';
    // textos e legendas (so reconstroi quando muda)
    const html = textoHTML(E, w, h, t, lay, tocando);
    if (html !== ultimaChave) { txts.innerHTML = html; ultimaChave = html; }
    // marca d'agua e barra
    const conteudo = t < lay.fimConteudo;
    logo.style.display = p.ajustes.marcaDagua !== false && preset.marca.marcaDagua && conteudo ? 'block' : 'none';
    logo.style.width = Math.min(w, h) * preset.marca.tamanho + 'px'; logo.style.opacity = preset.marca.opacidade;
    barra.style.display = p.ajustes.barraProgresso !== false && preset.marca.barraProgresso && conteudo ? 'block' : 'none';
    barra.style.background = preset.marca.corBarra; barra.style.width = (100 * Math.min(1, t / Math.max(0.1, lay.fimConteudo))) + '%';
    // faixas de audio
    for (const a of p.audios || []) {
      const m = Modelo.midiaDe(p, a.midia); if (!m) continue;
      let el = audios.get(a.id); if (!el) { el = new Audio(); audios.set(a.id, el); }
      const url = API.arq(p.id, m.arquivo); if (el.dataset.src !== url) { el.dataset.src = url; el.src = url; }
      const dur = a.duracao || m.dur, dentro = t >= a.inicio && t < a.inicio + dur;
      el.volume = Math.max(0, Math.min(1, a.volume ?? (a.tipo === 'musica' ? preset.audio.musicaVolume : 1)));
      const alvo = (a.entrada || 0) + (t - a.inicio);
      if (dentro && tocando) { if (el.paused) el.play().catch(() => {}); const d = m.dur || 1, real = a.tipo === 'musica' ? alvo % d : alvo; if (Math.abs(el.currentTime - real) > 0.4) el.currentTime = real; }
      else if (!el.paused) el.pause();
    }
    for (const [id, el] of audios) if (!(p.audios || []).some(a => a.id === id)) { el.pause(); audios.delete(id); }
  }
  function parar() { for (const c of Object.values(camadas || {})) if (!c.video.paused) c.video.pause(); for (const el of audios.values()) el.pause(); }
  return { init, desenhar, redimensionar, parar, fonteCSS };
})();

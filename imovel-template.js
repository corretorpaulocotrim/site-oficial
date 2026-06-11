// Shared property page template — Paulo Cotrim · Cury RJ
// Each page defines PROP before loading this script

const WA_SVG=`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.373 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

function waLink(msg){ return `https://wa.me/5521989150864?text=${msg||PROP.wa}`; }

function trackLeadCRM(origem){
  if(window.enviarLeadCRM) enviarLeadCRM({
    nome: 'Interesse', telefone: '',
    interesse: (window.PROP||{}).nome || origem,
    regiao: (window.PROP||{}).regiao || '',
    origem: origem || 'pagina-imovel',
    extras: { imovel: (window.PROP||{}).nome }
  });
}

const NEARBY={
  'Porto Maravilha':['VLT Porto Maravilha','Museu do Amanhã (500m)','Museu de Arte do Rio','AquaRio (1,5km)','Centro Histórico'],
  'Santo Cristo':['VLT Parada Gamboa','Metrô Central (1,5km)','Porto Maravilha (800m)','Lapa (2km)'],
  'Centro':['Metrô Carioca (400m)','Metrô Uruguaiana (400m)','Lapa (1km)','Porto Maravilha (1km)'],
  'Piedade':['BRT Piedade','Shopping Nova América (3km)','Faculdades UNIP','Zona Norte do Rio'],
  'Imperial de São Cristóvão':['Metrô São Cristóvão (800m)','Quinta da Boa Vista (1km)','Rodoviária Novo Rio (2km)','UNIRIO'],
  'Niterói':['Barcas Rio-Niterói (1km)','MAC Niterói','Teatro Popular de Niterói','Shopping Niterói'],
};

const amenIcons={
  'Piscinas':'🏊','Piscina':'🏊','Rooftop':'🌇','Solário':'☀️','Academia':'💪',
  'Churrasqueira':'🔥','Salão de Festas':'🎉','Playground':'🛝','Horta':'🌿',
  'Beach Tênis':'🎾','Futmesa':'⚽','Espaço Gourmet':'🍽️','Espaço Zen':'🧘',
  'Pet Place':'🐾','Pet Care':'🐾','Petplace':'🐾','Espaço Relax':'🛋️',
  'Praça':'🌳','Apoio Festas':'🎊','Bike LEV':'🚲','Quadra Poliesportiva':'🏀',
  'Sauna':'🧖','Lavanderia':'🫧','Apoio Churrasqueira':'🔥',
};

function render(){
  const savedImg = localStorage.getItem('pc_img_' + PROP.id) || PROP.imgDefault;
  const allImgs = [savedImg, ...(PROP.imgs||[]).slice(1)];
  const fotoCoord = localStorage.getItem('pc_foto_paulo') || '';
  const mapQ = PROP.mapQuery || encodeURIComponent((PROP.nome+' '+PROP.bairro+' Rio de Janeiro'));
  const nearby = NEARBY[PROP.bairro] || [];
  const totalFotos = allImgs.length;

  document.getElementById('imovel-root').innerHTML = `
  <header class="im-hdr">
    <a href="index.html" class="im-hdr-logo"><img src="logo-header.png" alt="Paulo Cotrim" style="height:44px;width:auto;display:block"/></a>
    <div class="im-hdr-right">
      <a href="index.html"><button class="btn-back">← Voltar</button></a>
      <a href="${waLink()}" target="_blank"><button class="btn-wa-im">${WA_SVG} WhatsApp</button></a>
    </div>
  </header>

  <div class="im-hero">
    <img class="im-hero-bg" src="${savedImg}" alt="${PROP.nome}" id="hero-bg-img" onclick="openLightbox(0)" style="cursor:zoom-in"/>
    <div class="im-hero-content">
      <div class="im-badge">${PROP.tipo}</div>
      <div class="im-bairro">📍 ${PROP.bairro} · ${PROP.cidade}</div>
      <h1>${PROP.nome}</h1>
      <div class="im-meta">
        <span>🛏 ${PROP.quartos}</span>
        <span>🏗 ${PROP.status}</span>
      </div>
    </div>
    <button class="im-hero-gallery-btn" onclick="openLightbox(0)">📷 Ver fotos</button>
  </div>

  <div class="im-gallery-wrap">
    <div class="im-gallery" id="im-gallery">
      ${allImgs.map((src,i)=>`<div class="im-gthumb${i===0?' im-gthumb-main':''}" onclick="openLightbox(${i})"><img src="${src}" alt="${PROP.nome} foto ${i+1}" loading="${i?'lazy':'eager'}"/></div>`).join('')}
    </div>
    <button class="im-gallery-all-btn" onclick="openLightbox(0)">📷 Ver todas as ${totalFotos} fotos</button>
  </div>

  <div class="im-layout">
    <div class="im-main">

      <div class="section-block">
        <h2>Sobre o empreendimento</h2>
        <p class="im-desc">${PROP.desc}</p>
      </div>

      <div class="section-block">
        <h2>Lazer e amenidades</h2>
        <div class="amenidades-grid">
          ${PROP.amenidades.map(a=>`<div class="amen">${amenIcons[a]||'✓'} ${a}</div>`).join('')}
        </div>
      </div>

      <div class="section-block">
        <h2>Tipologias e preços</h2>
        <div class="tipo-cards">
          ${PROP.tipologias.map(t=>`
          <div class="tipo-card" onclick="window.open('${waLink(`Tenho%20interesse%20na%20tipologia%20${encodeURIComponent(t.n)}%20do%20${encodeURIComponent(PROP.nome)}!`)}','_blank')">
            <div>
              <div class="tipo-nome">${t.n}</div>
              <div class="tipo-m2">${t.m2}</div>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <div class="tipo-preco">${t.preco}</div>
              <button class="tipo-cta">Consultar →</button>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <div class="section-block">
        <h2>Planta baixa</h2>
        ${PROP.planta
          ? `<img src="${PROP.planta}" class="im-planta-img" alt="Planta baixa ${PROP.nome}" onclick="openLightboxSingle('${PROP.planta}')" style="cursor:zoom-in"/>`
          : `<div class="planta-cta-box">
              <div class="planta-icon">📐</div>
              <div class="planta-body">
                <div class="planta-title">Receba a planta no seu WhatsApp</div>
                <div class="planta-sub">Paulo envia a planta baixa, memorial descritivo e disponibilidade de unidades em minutos.</div>
                <a href="${waLink('Quero%20receber%20a%20planta%20baixa%20do%20'+encodeURIComponent(PROP.nome))}" target="_blank">
                  <button class="btn-planta">${WA_SVG} Solicitar planta agora</button>
                </a>
              </div>
            </div>`
        }
      </div>

      <div class="section-block">
        <h2>Localização</h2>
        <div class="im-map-wrap">
          <iframe class="im-map" src="https://maps.google.com/maps?q=${mapQ}&output=embed&hl=pt-BR&z=15" allowfullscreen loading="lazy" title="Mapa ${PROP.nome}"></iframe>
        </div>
        ${nearby.length?`<div class="im-nearby">
          <span class="nearby-label">Próximo a:</span>
          ${nearby.map(p=>`<span class="nearby-pill">${p}</span>`).join('')}
        </div>`:''}
        <a href="https://www.google.com/maps/search/?api=1&query=${mapQ}" target="_blank" class="im-maps-link">Abrir no Google Maps →</a>
      </div>

      <div class="section-block">
        <h2>Financiamento</h2>
        <div class="fin-box">
          <div class="fin-icon">🏦</div>
          <div>
            <div class="fin-title">Financiamento facilitado — Caixa Econômica Federal</div>
            <p class="fin-desc">Use seu FGTS, FGTS de cônjuge ou familiar. Parcelas que cabem no seu bolso com o Programa Minha Casa Minha Vida (MCMV) ou SBPE. Paulo Cotrim cuida de toda a documentação.</p>
            <a href="simulador.html" class="fin-link">🧮 Simular agora →</a>
          </div>
        </div>
      </div>

    </div>

    <div class="im-sidebar">
      <div class="sid-card sid-sticky">
        <h3>Tenho interesse</h3>
        <div class="sid-info">
          <div class="sid-row"><span class="sid-label">Empreendimento</span><span class="sid-value">${PROP.nome}</span></div>
          <div class="sid-row"><span class="sid-label">Bairro</span><span class="sid-value">${PROP.bairro}</span></div>
          <div class="sid-row"><span class="sid-label">Quartos</span><span class="sid-value">${PROP.quartos}</span></div>
          <div class="sid-row"><span class="sid-label">Status</span><span class="sid-value" style="color:#16a34a">${PROP.tipo}</span></div>
        </div>
        <a href="${waLink()}" target="_blank" style="display:block;margin-bottom:10px">
          <button class="btn-wa-sid">${WA_SVG} Falar com Paulo agora</button>
        </a>
        <a href="simulador.html" style="display:block;margin-bottom:10px">
          <button class="btn-sim-sid">🧮 Simular financiamento</button>
        </a>
        <a href="${waLink('Quero%20receber%20a%20planta%20baixa%20do%20'+encodeURIComponent(PROP.nome))}" target="_blank" style="display:block">
          <button class="btn-planta-sid">📐 Receber planta</button>
        </a>
      </div>

      <div class="sid-card">
        <h3>Seu coordenador</h3>
        <div class="coord-box">
          <img class="coord-av" src="${fotoCoord||'paulo-cotrim-profissional.jpeg'}" alt="Paulo Cotrim" onerror="this.onerror=null;this.style.background='#0d2040'"/>
          <div class="coord-info">
            <div class="name">Paulo Cotrim</div>
            <div class="role">Coordenador Cury · 18 anos de experiência</div>
          </div>
        </div>
        <p style="margin-top:14px;font-size:13px;color:#475569;line-height:1.6">Especialista em MCMV e financiamento imobiliário. Do primeiro contato até a entrega das chaves, Paulo cuida de tudo para você.</p>
        <a href="https://instagram.com/corretorpaulocotrim" target="_blank" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:12px;font-weight:600;color:#64748b">📷 @corretorpaulocotrim</a>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:#94a3b8;font-weight:700">CRECI-RJ 77677-F</span>
        </div>
      </div>

      <div class="sid-highlight">
        <strong>⚡ Aprovação em 48h</strong> — Paulo já aprovou mais de 700 famílias. Envie seus documentos pelo WhatsApp e receba a resposta rapidinho.
      </div>
    </div>
  </div>

  <div class="im-footer">
    <strong>Paulo Cotrim — Coordenador Cury</strong> &nbsp;|&nbsp; CRECI-RJ 77677-F &nbsp;|&nbsp; (21) 98915-0864 &nbsp;|&nbsp;
    <a href="index.html" style="color:rgba(255,255,255,.6)">← Voltar ao site</a>
  </div>

  <div class="im-lightbox" id="im-lightbox" onclick="if(event.target===this)closeLightbox()">
    <button class="lb-close" onclick="closeLightbox()">✕</button>
    <button class="lb-prev" onclick="lbNav(-1)">‹</button>
    <button class="lb-next" onclick="lbNav(1)">›</button>
    <img class="lb-img" id="lb-img" src="" alt=""/>
    <div class="lb-counter" id="lb-counter"></div>
  </div>
  `;

  window._lbImgs = allImgs;
  window._lbIdx = 0;
}

window.openLightbox = function(i){
  window._lbIdx = i;
  const lb = document.getElementById('im-lightbox');
  const img = document.getElementById('lb-img');
  const ctr = document.getElementById('lb-counter');
  img.src = window._lbImgs[i];
  ctr.textContent = (i+1) + ' / ' + window._lbImgs.length;
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};
window.openLightboxSingle = function(src){
  window._lbImgs = [src];
  openLightbox(0);
};
window.closeLightbox = function(){
  document.getElementById('im-lightbox').style.display = 'none';
  document.body.style.overflow = '';
};
window.lbNav = function(dir){
  if(window._lbImgs.length<=1) return;
  window._lbIdx = (window._lbIdx + dir + window._lbImgs.length) % window._lbImgs.length;
  openLightbox(window._lbIdx);
};
document.addEventListener('keydown', function(e){
  const lb = document.getElementById('im-lightbox');
  if(!lb || lb.style.display==='none' || lb.style.display==='') return;
  if(e.key==='Escape') closeLightbox();
  if(e.key==='ArrowLeft') lbNav(-1);
  if(e.key==='ArrowRight') lbNav(1);
});

document.addEventListener('DOMContentLoaded', render);

// Admin panel
(function(){
  var s = document.createElement('script');
  s.src = 'admin-panel.js';
  s.defer = true;
  document.body.appendChild(s);
})();

// CRM config
(function(){
  var s = document.createElement('script');
  s.src = 'crm-config.js';
  document.head.appendChild(s);
})();

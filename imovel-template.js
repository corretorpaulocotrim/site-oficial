// Shared property page template — Paulo Cotrim · Cury RJ
// Each page defines PROP before loading this script

const WA_SVG=`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.373 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
const FALLBACK_ICON = `<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#1a8f4c;fill:none;stroke-width:3;vertical-align:-2px" class="amen-ic"><path d="M4 12l5 5L20 6"/></svg>`;
const FALLBACK_ICON_INLINE = `<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#1a8f4c;fill:none;stroke-width:3;vertical-align:-2px" class="amen-ic"><path d="M4 12l5 5L20 6"/></svg>`;


// Todos os empreendimentos — para mapa cruzado nas páginas individuais
const ALL_IMOVEIS = [
  {id:"orla-central", nome:"Orla Central",            lat:-22.8960,lng:-43.1255, url:"orla-central.html",          regiao:"Centro · Niterói · RJ",         preco:"A partir de R$ 402.000", tipo:"Lançamento", img:"https://cury.net/storage/images/products/gallery/69e13d1c110eb.jpeg"},
  {id:"farol",        nome:"Farol da Guanabara",       lat:-22.8972,lng:-43.2072, url:"farol-da-guanabara.html",    regiao:"Santo Cristo · Porto Maravilha", preco:"A partir de R$ 403.000", tipo:"Lançamento", img:"https://cury.net/storage/images/products/gallery/68d552905502b.jpeg"},
  {id:"arcos",        nome:"Arcos do Porto",            lat:-22.8942,lng:-43.1988, url:"arcos-do-porto.html",        regiao:"Porto Maravilha · RJ",           preco:"A partir de R$ 361.000", tipo:"Em Obras", img:"https://cury.net/storage/images/products/gallery/6790f60b9605f.jpeg"},
  {id:"piedade",      nome:"Parque Piedade – Aquarela", lat:-22.8672,lng:-43.2885, url:"parque-piedade.html",        regiao:"Piedade · Zona Norte · RJ",      preco:"A partir de R$ 263.000", tipo:"Lançamento", img:"https://cury.net/storage/images/products/gallery/69c6cbd3e9e0a.jpeg"},
  {id:"lamparina",    nome:"Luzes do Rio – Lamparina",  lat:-22.9008,lng:-43.2238, url:"luzes-do-rio-lamparina.html",regiao:"São Cristóvão · RJ",             preco:"A partir de R$ 309.000", tipo:"Lançamento", img:"https://cury.net/storage/images/products/gallery/69cd31f2e807e.jpeg"},
  {id:"caminhos",     nome:"Caminhos da Guanabara",     lat:-22.8748,lng:-43.1105, url:"caminhos-da-guanabara.html",regiao:"Pendotiba · Niterói · RJ",        preco:"A partir de R$ 335.000", tipo:"Em Obras", img:"https://cury.net/storage/images/products/gallery/67c9b83a44c13.jpeg"},
  {id:"cartola",      nome:"Residencial Cartola II",    lat:-22.9015,lng:-43.2295, url:"cartola-ii.html",            regiao:"São Cristóvão · RJ",             preco:"A partir de R$ 302.000", tipo:"Lançamento", img:"https://cury.net/storage/images/products/gallery/697a4d6093ae0.jpeg"},
  {id:"candeeiro",    nome:"Luzes do Rio – Candeeiro",  lat:-22.9000,lng:-43.2220, url:"luzes-do-rio-candeeiro.html",regiao:"São Cristóvão · RJ",            preco:"A partir de R$ 362.000", tipo:"Lançamento", img:"https://cury.net/storage/images/products/gallery/699605e256f3b.jpeg"}
];

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
  'Piscinas':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><rect x="3" y="5" width="18" height="9" rx="2"/><path d="M2 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/></svg>`,
  'Piscina':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><rect x="3" y="5" width="18" height="9" rx="2"/><path d="M2 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/></svg>`,
  'Rooftop':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M4 21V10l8-6 8 6v11"/><path d="M9 21v-6h6v6"/></svg>`,
  'Solário':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>`,
  'Academia':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M6 7v10M18 7v10M6 12h12"/><rect x="3" y="9" width="3" height="6" rx="1"/><rect x="18" y="9" width="3" height="6" rx="1"/></svg>`,
  'Churrasqueira':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M12 2s-5 5-5 10a5 5 0 0010 0c0-2-1-3-1-3s-1 2-2 2c-1 0-1-2 0-4 0 0-2 1-2-5z"/></svg>`,
  'Apoio Churrasqueira':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M12 2s-5 5-5 10a5 5 0 0010 0c0-2-1-3-1-3s-1 2-2 2c-1 0-1-2 0-4 0 0-2 1-2-5z"/></svg>`,
  'Salão de Festas':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 20a2 2 0 004 0"/></svg>`,
  'Apoio Festas':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 20a2 2 0 004 0"/></svg>`,
  'Playground':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M4 4v16M20 4v16M4 4h16"/><path d="M8 10l4 4 4-4"/></svg>`,
  'Horta':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M12 21c-5-2-8-6-8-11a8 8 0 0116 0c0 5-3 9-8 11z"/><path d="M12 21V8"/></svg>`,
  'Beach Tênis':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><circle cx="12" cy="12" r="8"/><path d="M4 8c4 2 4 6 0 8M20 8c-4 2-4 6 0 8"/></svg>`,
  'Futmesa':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><circle cx="12" cy="12" r="9"/><path d="M12 8l3 2-1 4h-4l-1-4z"/></svg>`,
  'Espaço Gourmet':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M7 3v7a2 2 0 002 2v9M7 3v4M9 3v4M11 3v9M17 3c-2 0-3 2-3 5s1 5 3 5v8"/></svg>`,
  'Espaço Zen':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><circle cx="12" cy="9" r="3"/><path d="M12 12v9M8 21c0-3 2-4 4-4s4 1 4 4"/></svg>`,
  'Pet Place':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><circle cx="8" cy="9" r="1.5"/><circle cx="12" cy="7" r="1.5"/><circle cx="16" cy="9" r="1.5"/><path d="M12 12c-3 0-5 2-5 4.5A2.5 2.5 0 009.5 19c1 0 1.3-.5 2.5-.5s1.5.5 2.5.5a2.5 2.5 0 002.5-2.5c0-2.5-2-4.5-5-4.5z"/></svg>`,
  'Pet Care':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><circle cx="8" cy="9" r="1.5"/><circle cx="12" cy="7" r="1.5"/><circle cx="16" cy="9" r="1.5"/><path d="M12 12c-3 0-5 2-5 4.5A2.5 2.5 0 009.5 19c1 0 1.3-.5 2.5-.5s1.5.5 2.5.5a2.5 2.5 0 002.5-2.5c0-2.5-2-4.5-5-4.5z"/></svg>`,
  'Petplace':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><circle cx="8" cy="9" r="1.5"/><circle cx="12" cy="7" r="1.5"/><circle cx="16" cy="9" r="1.5"/><path d="M12 12c-3 0-5 2-5 4.5A2.5 2.5 0 009.5 19c1 0 1.3-.5 2.5-.5s1.5.5 2.5.5a2.5 2.5 0 002.5-2.5c0-2.5-2-4.5-5-4.5z"/></svg>`,
  'Espaço Relax':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M4 12v6M20 12v6M4 18h16M5 12V9a2 2 0 012-2h10a2 2 0 012 2v3M7 12h10"/></svg>`,
  'Praça':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><circle cx="12" cy="8" r="5"/><path d="M12 13v8"/></svg>`,
  'Bike LEV':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-9h5l3 9M10 8h4"/></svg>`,
  'Quadra Poliesportiva':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14M3 12h18"/><path d="M7 5a5 5 0 010 14M17 5a5 5 0 000 14"/></svg>`,
  'Sauna':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><path d="M6 21v-3a3 3 0 013-3h6a3 3 0 013 3v3"/><path d="M8 11c-1-1-1-3 0-4M12 9c-1-1-1-3 0-4M16 11c-1-1-1-3 0-4"/></svg>`,
  'Lavanderia':`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--gold,#b8873a);fill:none;stroke-width:2" class="amen-ic"><circle cx="12" cy="13" r="7"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="6" r="2"/></svg>`
};

function render(){
  const savedImg = localStorage.getItem('pc_img_' + PROP.id) || PROP.imgDefault;
  const allImgs = [savedImg, ...(PROP.imgs||[]).slice(0,7)];
  const galeria = PROP.galeria || allImgs;
  const fotoCoord = localStorage.getItem('pc_foto_paulo') || '';
  const mapQ = PROP.mapQuery || encodeURIComponent((PROP.nome+' '+PROP.bairro+' Rio de Janeiro'));
  const nearby = NEARBY[PROP.bairro] || [];
  const totalFotos = galeria.length;

  document.getElementById('imovel-root').innerHTML = `
  <header class="im-hdr">
    <a href="index.html" class="im-hdr-logo" style="display:flex;align-items:center;gap:10px;text-decoration:none">
      <img src="logo-wordmark-light.png" alt="Paulo Cotrim" style="height:30px;width:auto;max-width:230px;object-fit:contain"/>
      <div style="display:flex;flex-direction:column;gap:1px;line-height:1">
        <span style="color:#fff;font-size:14px;font-weight:800;letter-spacing:-.01em;white-space:nowrap">Paulo Cotrim</span>
        <span style="color:#cf9f4f;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Especialista em lançamentos · CRECI-RJ 77677-F</span>
      </div>
    </a>
    <div class="im-hdr-right">
      <a href="index.html"><button class="btn-back">← Voltar</button></a>
      <a href="${waLink()}" target="_blank"><button class="btn-wa-im">${WA_SVG} Falar direto com Paulo Cotrim</button></a>
    </div>
  </header>

  <div class="im-hero">
    <img class="im-hero-bg" src="${savedImg}" alt="${PROP.nome}" id="hero-bg-img" onclick="openLightbox(0)" style="cursor:zoom-in"/>
    <div class="im-hero-content">
      <div class="im-badge">${PROP.tipo}</div>
      <div class="im-bairro"><svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.4;vertical-align:-1px" class="pin-ic"><path d="M12 21s-7-5.2-7-11a7 7 0 0114 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> ${PROP.bairro} · ${PROP.cidade}</div>
      <h1>${PROP.nome}</h1>
      <div class="im-meta">
        <span><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><rect x="2" y="11" width="20" height="7" rx="2"/><path d="M4 11V7a2 2 0 012-2h5v6M2 18v2M22 18v2"/></svg>${PROP.quartos}</span>
        <span><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M3 21h18M6 21V10l6-4 6 4v11M10 21v-6h4v6"/></svg>${PROP.status}</span>
      </div>
    </div>
    <button class="im-hero-gallery-btn" onclick="openLightbox(0)"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M9 7l1.5-2h3L15 7"/><circle cx="12" cy="14" r="3.5"/></svg>Ver fotos</button>
  </div>

  <div class="im-gallery-wrap">
    <div class="im-gallery" id="im-gallery">
      ${allImgs.slice(0,4).map((src,i)=>`<div class="im-gthumb${i===0?' im-gthumb-main':''}" onclick="openGaleriaLb(${i})"><img src="${src}" alt="${PROP.nome} foto ${i+1}" loading="${i?'lazy':'eager'}"/></div>`).join('')}
    </div>
    <button class="im-gallery-all-btn" onclick="openGaleriaLb(0)"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M9 7l1.5-2h3L15 7"/><circle cx="12" cy="14" r="3.5"/></svg>Ver todas as ${totalFotos} fotos</button>
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
          ${PROP.amenidades.map(a=>`<div class="amen">${amenIcons[a]||FALLBACK_ICON} ${a}</div>`).join('')}
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

      <div class="section-block galeria-section">
        <h2>Galeria de imagens</h2>
        <div class="galeria-grid">
          ${galeria.map((src,i)=>`<div class="galeria-thumb" onclick="openGaleriaLb(${i})" title="Ampliar foto ${i+1}"><img src="${src}" alt="${PROP.nome} — foto ${i+1}" loading="lazy"/><div class="galeria-overlay"><span><svg viewBox="0 0 24 24" style="width:22px;height:22px;stroke:#fff;fill:none;stroke-width:2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></span></div></div>`).join('')}
        </div>
        <p class="galeria-hint">Clique em qualquer foto para ampliar · ${galeria.length} fotos disponíveis</p>
      </div>

      <div class="section-block">
        <h2>Planta baixa</h2>
        ${PROP.planta
          ? `<img src="${PROP.planta}" class="im-planta-img" alt="Planta baixa ${PROP.nome}" onclick="openLightboxSingle('${PROP.planta}')" style="cursor:zoom-in"/>`
          : `<div class="planta-cta-box">
              <div class="planta-icon"><svg viewBox="0 0 24 24" style="width:26px;height:26px;stroke:#b8873a;fill:none;stroke-width:1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18M9 13h6v6"/></svg></div>
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
        <div class="im-loc-points">
          ${PROP.standLat?`<div class="im-loc-pt">
            <div class="im-loc-pt-label"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#b8873a;fill:none;stroke-width:2;vertical-align:-2px;margin-right:4px" class="ic-inline"><path d="M3 21h18M6 21V10l6-4 6 4v11M10 21v-6h4v6"/></svg>Stand de Vendas</div>
            <div class="im-loc-pt-addr">${PROP.standEndereco||''}</div>
            <div class="im-loc-pt-links">
              <a href="https://waze.com/ul?ll=${PROP.standLat},${PROP.standLng}&navigate=yes" target="_blank">Waze</a>
              <a href="https://maps.google.com/maps?daddr=${PROP.standLat},${PROP.standLng}" target="_blank">Google Maps</a>
            </div>
          </div>`:''}
          ${PROP.endereco?`<div class="im-loc-pt">
            <div class="im-loc-pt-label"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#b8873a;fill:none;stroke-width:2;vertical-align:-2px;margin-right:4px" class="pin-ic"><path d="M12 21s-7-5.2-7-11a7 7 0 0114 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>Empreendimento</div>
            <div class="im-loc-pt-addr"><strong style="color:#0f2e36">${PROP.nome}</strong><br>${PROP.endereco}</div>
            <div class="im-loc-pt-links">
              <a href="https://waze.com/ul?ll=${PROP.lat},${PROP.lng}&navigate=yes" target="_blank">Waze</a>
              <a href="https://maps.google.com/maps?daddr=${PROP.lat},${PROP.lng}" target="_blank">Google Maps</a>
            </div>
          </div>`:''}
        </div>
        <div class="im-map-route-wrap">
          <div id="map-imovel" style="width:100%;height:360px;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0"></div>
          <div class="im-route-card">
            <div class="im-route-title"><svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#b8873a;fill:none;stroke-width:2;vertical-align:-3px;margin-right:5px" class="ic-inline"><path d="M9 20l-5.5-2V4L9 6M9 20l6-2M9 20V6M15 18l6 2V6l-6-2M15 18V4"/></svg>Calcule sua rota até aqui</div>
            <p class="im-route-sub">Digite seu endereço de trabalho ou de onde você costuma sair e veja se o deslocamento até o ${PROP.nome} é viável para você.</p>
            <input type="text" class="im-route-input" id="im-route-origin" placeholder="Seu endereço de partida (rua, bairro, cidade)" onkeydown="if(event.key==='Enter')calcularRota()"/>
            <div class="im-route-modes" id="im-route-modes">
              <button type="button" class="im-route-mode on" data-mode="driving" onclick="setRotaModo('driving',this)"><svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2" class="ic-inline"><path d="M5 11l1.5-5h11L19 11"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7.5" cy="17" r="1.6"/><circle cx="16.5" cy="17" r="1.6"/></svg>De carro</button>
              <button type="button" class="im-route-mode" data-mode="walking" onclick="setRotaModo('walking',this)"><svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2" class="ic-inline"><circle cx="13" cy="4" r="2"/><path d="M9 21l2-6 2 2 3 4M6 14l3-4 3 1 3-3"/></svg>A pé</button>
              <button type="button" class="im-route-mode" data-mode="transit" onclick="setRotaModo('transit',this)"><svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2" class="ic-inline"><rect x="4" y="3" width="16" height="13" rx="2"/><path d="M4 11h16M8 19l-2 3M16 19l2 3"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/></svg>Ônibus</button>
            </div>
            <button class="im-route-btn" onclick="calcularRota()"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.4;vertical-align:-2px;margin-right:5px" class="ic-inline"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Ver rota até o imóvel</button>
            <p class="im-route-hint" id="im-route-hint">Abre o roteiro completo no Google Maps, com horários e opções em tempo real.</p>
          </div>
        </div>
        ${nearby.length?`<div class="im-nearby">
          <span class="nearby-label">Próximo a:</span>
          ${nearby.map(p=>`<span class="nearby-pill">${p}</span>`).join('')}
        </div>`:''}
        <a href="https://www.google.com/maps/search/?api=1&query=${mapQ}" target="_blank" class="im-maps-link">Abrir no Google Maps →</a>
      </div>

      ${(function(){
        var related = (ALL_IMOVEIS||[]).filter(function(im){return im.id!==PROP.id;}).slice(0,3);
        if(!related.length) return '';
        return `<div class="section-block">
          <h2>Imóveis relacionados</h2>
          <div class="im-related-grid">
            ${related.map(function(im){
              return `<a class="im-related-card" href="${im.url}">
                <img src="${im.img||PROP.imgDefault}" alt="${im.nome}" loading="lazy" onerror="this.style.background='#e7edee'"/>
                <div class="im-related-body">
                  <div class="im-related-tag">${im.tipo||'Lançamento'}</div>
                  <div class="im-related-name">${im.nome}</div>
                  <div class="im-related-loc">${im.regiao}</div>
                  <div class="im-related-preco">${im.preco}</div>
                </div>
              </a>`;
            }).join('')}
          </div>
        </div>`;
      })()}

      ${PROP.vizinhanca ? `
      <div class="section-block">
        <h2><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-6h5v6"/></svg>O bairro para a sua família</h2>
        <div class="viz-grid">
          <div class="viz-row-2">
            ${PROP.vizinhanca.escolas ? `<div class="viz-cat"><div class="viz-cat-title"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M6 10.5V16c0 1 3 2.5 6 2.5s6-1.5 6-2.5v-5.5"/></svg>Escolas de Renome</div><ul class="viz-list">${PROP.vizinhanca.escolas.map(e=>`<li>${e}</li>`).join('')}</ul></div>` : ''}
            ${PROP.vizinhanca.padarias ? `<div class="viz-cat"><div class="viz-cat-title"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M4 21V9a4 4 0 014-4h8a4 4 0 014 4v12"/><path d="M4 14h16"/></svg>Padarias &amp; Cafés</div><ul class="viz-list">${PROP.vizinhanca.padarias.map(p=>`<li>${p}</li>`).join('')}</ul></div>` : ''}
          </div>
          <div class="viz-row-3">
            ${PROP.vizinhanca.banco ? `<div class="viz-item"><span class="viz-icon"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M3 10l9-6 9 6"/><path d="M5 10v9M9 10v9M15 10v9M19 10v9M3 21h18"/></svg></span><div><div class="viz-item-label">Banco</div><div class="viz-item-val">${PROP.vizinhanca.banco}</div></div></div>` : ''}
            ${PROP.vizinhanca.combustivel ? `<div class="viz-item"><span class="viz-icon"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M4 21V6a2 2 0 012-2h5a2 2 0 012 2v15"/><path d="M4 21h9M14 9h2l2 2v6a1.5 1.5 0 003 0v-4"/></svg></span><div><div class="viz-item-label">Combustível</div><div class="viz-item-val">${PROP.vizinhanca.combustivel}</div></div></div>` : ''}
            ${PROP.vizinhanca.hospital ? `<div class="viz-item"><span class="viz-icon"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M20.8 8.6c0 5-8.8 10.4-8.8 10.4S3.2 13.6 3.2 8.6a4.6 4.6 0 018.8-1.8 4.6 4.6 0 018.8 1.8z"/><path d="M9 9h3M10.5 7.5v3"/></svg></span><div><div class="viz-item-label">Saúde</div><div class="viz-item-val">${PROP.vizinhanca.hospital}</div></div></div>` : ''}
          </div>
          ${PROP.vizinhanca.transporte ? `<div class="viz-cat"><div class="viz-cat-title"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M3 13h18M7 17v2M17 17v2"/><circle cx="7.5" cy="10" r="1"/><circle cx="16.5" cy="10" r="1"/></svg>Como se locomover</div><ul class="viz-list">${PROP.vizinhanca.transporte.map(t=>`<li>${t}</li>`).join('')}</ul></div>` : ''}
        </div>
      </div>` : ''}

      <div class="section-block">
        <h2><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.35l-.77-.77a5.4 5.4 0 00-7.65 7.65L12 20.5l8.42-8.27a5.4 5.4 0 000-7.65z"/></svg>Famílias que já receberam as chaves</h2>
        <p class="im-desc" style="margin-bottom:16px">Famílias realizando o sonho da casa própria — há 18 anos no mercado em mãos. Alguns momentos reais de entrega, com o Paulo Cotrim:</p>
        <div class="depo-grid">
          ${['cliente-2','cliente-3','cliente-7','cliente-9'].map(function(f){
            return `<div class="depo-photo"><img src="clientes-img/${f}.jpg" alt="Cliente recebendo as chaves do apartamento" loading="lazy"/></div>`;
          }).join('')}
        </div>
      </div>

      <div class="section-block">
        <h2>Financiamento</h2>
        <div class="fin-box">
          <div class="fin-icon"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M3 10l9-6 9 6"/><path d="M5 10v9M9 10v9M15 10v9M19 10v9M3 21h18"/></svg></div>
          <div>
            <div class="fin-title">Financiamento facilitado — Caixa Econômica Federal</div>
            <p class="fin-desc">Use seu FGTS, FGTS de cônjuge ou familiar. Parcelas que cabem no seu bolso com o Programa Minha Casa Minha Vida (MCMV) ou SBPE. Paulo Cotrim cuida de toda a documentação.</p>
            <a href="simulador.html" class="fin-link">Simular agora →</a>
          </div>
        </div>
      </div>

      <!-- ═══ BAIXAR PROPOSTA ═══ -->
      <div class="section-block proposta-section">
        <div class="proposta-banner">
          <div class="proposta-banner-badge"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>DOWNLOAD GRATUITO</div>
          <h2 class="proposta-banner-title">Baixe a proposta do <span>${PROP.nome}</span></h2>
          <p class="proposta-banner-sub">Escolha o formato ideal para você. Leve todas as informações do empreendimento para analisar com calma.</p>
          <div class="proposta-options">
            <div class="proposta-card" onclick="baixarPropostaSimples()">
              <div class="proposta-card-icon"><svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></div>
              <div class="proposta-card-body">
                <div class="proposta-card-title">Proposta Resumo</div>
                <div class="proposta-card-desc">Tipologias, preços, localização e condições de financiamento em um PDF limpo e objetivo.</div>
                <button class="btn-proposta-simples">Baixar agora (sem apresentação)</button>
              </div>
            </div>
            <div class="proposta-card proposta-card-destaque" onclick="solicitarPropostaCompleta()">
              <div class="proposta-card-badge">MAIS COMPLETO</div>
              <div class="proposta-card-icon"><svg viewBox="0 0 24 24" style="width:22px;height:22px;stroke:#fff;fill:none;stroke-width:2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></div>
              <div class="proposta-card-body">
                <div class="proposta-card-title">Apresentação Completa</div>
                <div class="proposta-card-desc">Catálogo oficial do empreendimento com plantas, perspectivas, área de lazer e tabela de preços atualizada.</div>
                <button class="btn-proposta-completa">${WA_SVG} Receber apresentação completa</button>
              </div>
            </div>
          </div>
          <p class="proposta-nota">Material gratuito · Sem compromisso · Resposta em minutos</p>
        </div>
      </div>

    </div>

    <div class="im-sidebar">
      <div class="sid-card sid-sticky">
        <h3>Tenho interesse</h3>
        <div class="sid-info">
          <div class="sid-row"><span class="sid-label">Empreendimento</span><span class="sid-value">${PROP.nome}</span></div>
          <div class="sid-row"><span class="sid-label">Bairro</span><span class="sid-value">${PROP.bairro}</span></div>
          <div class="sid-row"><span class="sid-label">Endereço</span><span class="sid-value" style="font-size:11px;line-height:1.4">${PROP.endereco||PROP.bairro+' · '+PROP.cidade}</span></div>
          <div class="sid-row"><span class="sid-label">Quartos</span><span class="sid-value">${PROP.quartos}</span></div>
          <div class="sid-row"><span class="sid-label">Status</span><span class="sid-value" style="color:#b8873a">${PROP.tipo}</span></div>
        </div>
        <a href="${waLink()}" target="_blank" style="display:block;margin-bottom:10px">
          <button class="btn-wa-sid">${WA_SVG} Falar direto com Paulo Cotrim</button>
        </a>
        <a href="simulador.html" style="display:block;margin-bottom:10px">
          <button class="btn-sim-sid">Simular financiamento</button>
        </a>
        <a href="${waLink('Quero%20receber%20a%20planta%20baixa%20do%20'+encodeURIComponent(PROP.nome))}" target="_blank" style="display:block;margin-bottom:10px">
          <button class="btn-planta-sid">Receber planta</button>
        </a>
        <div style="border-top:1px solid #f1f5f9;padding-top:10px;margin-top:2px">
          <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:8px"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>Baixar proposta</div>
          <button class="btn-proposta-sid-simples" onclick="baixarPropostaSimples()" style="display:flex;align-items:center;gap:6px;width:100%;margin-bottom:6px;padding:9px 12px;background:#f5f6f7;border:1px solid #e8eaed;border-radius:8px;font-size:12px;font-weight:700;color:#0f2e36;cursor:pointer;font-family:inherit">Resumo (sem apresentação)</button>
          <button class="btn-proposta-sid-completa" onclick="solicitarPropostaCompleta()" style="display:flex;align-items:center;gap:6px;width:100%;padding:9px 12px;background:linear-gradient(135deg,#b8873a,#a5772e);border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;cursor:pointer;font-family:inherit">Com apresentação PDF</button>
        </div>
      </div>

      <div class="sid-card">
        <h3>Quem vai te atender</h3>
        <div class="coord-box">
          <img class="coord-av" src="${fotoCoord||'paulo-cotrim-profissional.jpeg'}" alt="Paulo Cotrim" onerror="this.onerror=null;this.style.background='#0f2e36'"/>
          <div class="coord-info">
            <div class="name">Paulo Cotrim</div>
            <div class="role">Corretor de Imóveis · CRECI-RJ 77677-F · 18 anos</div>
          </div>
        </div>
        <p style="margin-top:14px;font-size:13px;color:#475569;line-height:1.6">Especialista em MCMV e financiamento imobiliário. Do primeiro contato até a entrega das chaves, o Paulo cuida de tudo para você — sem intermediário.</p>
        <a href="https://instagram.com/corretorpaulocotrim" target="_blank" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:12px;font-weight:600;color:#64748b"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>@corretorpaulocotrim</a>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:#94a3b8;font-weight:700">CRECI-RJ 77677-F</span>
        </div>
      </div>

      <div class="sid-highlight">
        <strong><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>Aprovação em 48h</strong> — o Paulo já aprovou mais de famílias atendidas. Envie seus documentos pelo WhatsApp e receba a resposta rapidinho.
      </div>
    </div>
  </div>

  <div class="im-footer">
    <strong>Paulo Cotrim — Corretor de Imóveis</strong> &nbsp;|&nbsp; CRECI-RJ 77677-F &nbsp;|&nbsp; (21) 98915-0864 &nbsp;|&nbsp;
    <a href="index.html" style="color:rgba(255,255,255,.6)">← Voltar ao site</a>
    <div style="margin-top:10px;font-size:10.5px;color:rgba(255,255,255,.4);max-width:640px;margin-left:auto;margin-right:auto;line-height:1.5">Valores, condições de pagamento, disponibilidade e prazos de entrega são fornecidos pela construtora e estão sujeitos a alteração sem aviso prévio. Consulte sempre a tabela oficial atualizada com o Paulo Cotrim antes de decidir.</div>
  </div>

  <div class="im-lightbox" id="im-lightbox" onclick="if(event.target===this)closeLightbox()">
    <button class="lb-close" onclick="closeLightbox()"><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.4"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <button class="lb-prev" onclick="lbNav(-1)">‹</button>
    <button class="lb-next" onclick="lbNav(1)">›</button>
    <img class="lb-img" id="lb-img" src="" alt=""/>
    <div class="lb-counter" id="lb-counter"></div>
  </div>

  <div class="wa-msg" id="wa-msg">Atendimento direto com Paulo Cotrim — valores e condições no WhatsApp.</div>
  <a href="${waLink()}" target="_blank" class="wafloat" aria-label="Falar direto com Paulo Cotrim no WhatsApp">${WA_SVG}</a>
  `;

  window._lbImgs = galeria;
  window._lbIdx = 0;
}

window.openGaleriaLb = function(i){
  window._lbIdx = i;
  const lb = document.getElementById('im-lightbox');
  const img = document.getElementById('lb-img');
  const ctr = document.getElementById('lb-counter');
  img.src = window._lbImgs[i];
  ctr.textContent = (i+1) + ' / ' + window._lbImgs.length;
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};
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

// ═══ PROPOSTA: BAIXAR RESUMO (SEM APRESENTAÇÃO) ═══
window.baixarPropostaSimples = function(){
  const p = window.PROP || {};
  const tipos = (p.tipologias||[]).map(t=>`
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f2e36">${t.n}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#64748b">${t.m2}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#b8873a">${t.preco}</td>
    </tr>`).join('');
  const amens = (p.amenidades||[]).map(a=>`<li style="margin-bottom:4px"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#1a8f4c;fill:none;stroke-width:3;vertical-align:-2px" class="amen-ic"><path d="M4 12l5 5L20 6"/></svg> ${a}</li>`).join('');
  const w = window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
  <title>Proposta — ${p.nome}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Arial',sans-serif;color:#0f2e36;background:#fff}
    .pg{max-width:800px;margin:0 auto;padding:40px 32px}
    .hdr{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #b8873a;padding-bottom:20px;margin-bottom:28px}
    .hdr-name{font-size:22px;font-weight:900;color:#0f2e36}
    .hdr-sub{font-size:11px;color:#64748b;margin-top:3px;letter-spacing:.05em;text-transform:uppercase}
    .hdr-creci{font-size:11px;color:#94a3b8;font-weight:700}
    .badge{display:inline-block;background:#faf3e7;color:#8a6526;border:1px solid #e8d4ab;border-radius:20px;font-size:11px;font-weight:700;padding:4px 12px;margin-bottom:16px;letter-spacing:.05em;text-transform:uppercase}
    h1{font-size:28px;font-weight:900;color:#0f2e36;margin-bottom:6px}
    .bairro{font-size:14px;color:#64748b;margin-bottom:24px}
    h2{font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin:24px 0 12px;padding-bottom:6px;border-bottom:1px solid #f1f5f9}
    table{width:100%;border-collapse:collapse;font-size:14px;background:#fff;border:1px solid #f1f5f9;border-radius:8px;overflow:hidden}
    th{background:#0f2e36;color:#fff;padding:10px 14px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em}
    ul{list-style:none;columns:2;gap:12px;font-size:13px;color:#475569}
    .desc{font-size:14px;line-height:1.7;color:#475569}
    .cta-box{background:linear-gradient(135deg,#0a1f26,#0f2e36);color:#fff;border-radius:12px;padding:24px;margin-top:32px;text-align:center}
    .cta-box h3{font-size:20px;font-weight:900;margin-bottom:8px}
    .cta-box p{font-size:13px;opacity:.8;margin-bottom:16px}
    .cta-wa{display:inline-block;background:#25d366;color:#fff;font-weight:800;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none}
    .footer{margin-top:40px;padding-top:16px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;text-align:center}
    @media print{.cta-box a{color:#fff!important}.no-print{display:none}}
  </style></head><body>
  <div class="pg">
    <div class="hdr">
      <div>
        <div class="hdr-name">Paulo Cotrim</div>
        <div class="hdr-sub">Corretor de Imóveis · Especialista MCMV · RJ</div>
      </div>
      <div class="hdr-creci">CRECI-RJ 77677-F<br><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px" class="ic-inline"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>(21) 98915-0864</div>
    </div>
    <div class="badge">${p.tipo||'Empreendimento'}</div>
    <h1>${p.nome}</h1>
    <div class="bairro"><svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.4;vertical-align:-1px" class="pin-ic"><path d="M12 21s-7-5.2-7-11a7 7 0 0114 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> ${p.bairro} · ${p.cidade||'Rio de Janeiro'}</div>
    <h2>Sobre o empreendimento</h2>
    <p class="desc">${p.desc||''}</p>
    <h2>Tipologias e preços</h2>
    <table><thead><tr><th>Tipologia</th><th>Área</th><th>Preço</th></tr></thead><tbody>${tipos}</tbody></table>
    <h2>Lazer e amenidades</h2>
    <ul>${amens}</ul>
    <div class="cta-box">
      <h3>Pronto para dar o próximo passo?</h3>
      <p>Paulo Cotrim cuida de toda a documentação e aprovação do seu financiamento em até 48h.</p>
      <a class="cta-wa" href="https://wa.me/5521989150864?text=Tenho%20interesse%20no%20${encodeURIComponent(p.nome)}!" target="_blank">Falar direto com Paulo Cotrim</a>
    </div>
    <div class="footer">Proposta gerada em ${new Date().toLocaleDateString('pt-BR')} · paulocotrim.com.br · corretorpaulocotrim@gmail.com</div>
  </div>
  <script>window.onload=function(){window.print()}<\/script>
  </body></html>`);
  w.document.close();
  if(window.trackEvent) trackEvent('proposta_simples','download',p.nome);
};

// ═══ PROPOSTA: SOLICITAR COMPLETA COM APRESENTAÇÃO PDF ═══
window.solicitarPropostaCompleta = function(){
  const p = window.PROP || {};
  if(p.pdf){
    const a = document.createElement('a');
    a.href = p.pdf;
    a.download = (p.nome||'proposta').replace(/\s+/g,'-').toLowerCase()+'-apresentacao.pdf';
    a.target = '_blank';
    a.click();
  } else {
    const msg = encodeURIComponent('Olá Paulo! Quero receber a apresentação completa (PDF) do ' + (p.nome||'empreendimento') + '. Pode me enviar?');
    window.open('https://wa.me/5521989150864?text=' + msg, '_blank');
  }
  if(window.trackEvent) trackEvent('proposta_completa','download',p.nome);
};

// ═══ ROTA ATÉ O IMÓVEL (tipo Google Maps: a pé / carro / ônibus) ═══
window._rotaModo = 'driving';
window.setRotaModo = function(modo, btn){
  window._rotaModo = modo;
  document.querySelectorAll('#im-route-modes .im-route-mode').forEach(function(b){ b.classList.remove('on'); });
  if(btn) btn.classList.add('on');
};
window.calcularRota = function(){
  var input = document.getElementById('im-route-origin');
  var origem = (input && input.value || '').trim();
  if(!origem){
    if(input){
      input.classList.add('im-route-error');
      input.placeholder = 'Digite um endereço para calcular a rota';
      input.focus();
      setTimeout(function(){ input.classList.remove('im-route-error'); }, 1600);
    }
    return;
  }
  var destino = PROP.lat ? (PROP.lat + ',' + PROP.lng) : encodeURIComponent(PROP.endereco || (PROP.nome + ' ' + PROP.bairro + ' Rio de Janeiro'));
  var url = 'https://www.google.com/maps/dir/?api=1'
    + '&origin=' + encodeURIComponent(origem)
    + '&destination=' + destino
    + '&travelmode=' + (window._rotaModo || 'driving');
  window.open(url, '_blank');
  if(window.trackEvent) trackEvent('rota_calculada', window._rotaModo, PROP.nome);
};

// Init Leaflet map on property page
function initImovelMap(){
  var el = document.getElementById('map-imovel');
  if(!el || typeof L === 'undefined' || !PROP.lat) return;

  /* ── Mapa centrado na propriedade atual ── */
  var map = L.map('map-imovel', {
    center:[PROP.lat, PROP.lng],
    zoom: 16,
    scrollWheelZoom: false,
    zoomControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
    attribution:'&copy; <a href="https://openstreetmap.org">OSM</a> &copy; <a href="https://carto.com">CARTO</a>',
    subdomains:'abcd', maxZoom:19
  }).addTo(map);

  /* ── Marcador GRANDE — empreendimento atual ── */
  var mainIcon = L.divIcon({
    className:'',
    html: '<div style="'
      +'background:#b8873a;'
      +'width:30px;height:30px;'
      +'border-radius:50%;'
      +'border:4px solid #fff;'
      +'box-shadow:0 4px 16px rgba(184,135,58,.55);'
      +'cursor:default;'
      +'"></div>',
    iconSize:[30,30], iconAnchor:[15,15], popupAnchor:[0,-20]
  });

  var mainMarker = L.marker([PROP.lat, PROP.lng], {icon:mainIcon, zIndexOffset:1000})
    .addTo(map)
    .bindPopup(
      '<div style="font-family:Outfit,Inter,sans-serif;min-width:180px">'
      +'<div style="font-size:13px;font-weight:800;color:#0f2e36;margin-bottom:4px">'+PROP.nome+'</div>'
      +'<div style="font-size:11px;color:#6b7280;line-height:1.4">'+(PROP.endereco||PROP.bairro+' · '+PROP.cidade)+'</div>'
      +'</div>',
      {maxWidth:240, closeButton:false}
    );
  mainMarker.openPopup();

  /* ── Marcador — Stand de Vendas (quando informado) ── */
  if(PROP.standLat){
    var standIcon = L.divIcon({
      className:'',
      html: '<div style="'
        +'background:#0f2e36;'
        +'width:26px;height:26px;'
        +'border-radius:50%;'
        +'border:4px solid #fff;'
        +'box-shadow:0 4px 16px rgba(15,46,54,.45);'
        +'cursor:default;'
        +'"></div>',
      iconSize:[26,26], iconAnchor:[13,13], popupAnchor:[0,-18]
    });
    L.marker([PROP.standLat, PROP.standLng], {icon:standIcon, zIndexOffset:900})
      .addTo(map)
      .bindPopup(
        '<div style="font-family:Outfit,Inter,sans-serif;min-width:180px">'
        +'<div style="font-size:13px;font-weight:800;color:#0f2e36;margin-bottom:4px">Stand de Vendas</div>'
        +'<div style="font-size:11px;color:#6b7280;line-height:1.4">'+(PROP.standEndereco||'')+'</div>'
        +'</div>',
        {maxWidth:240, closeButton:false}
      );
  }

  /* ── Marcadores PEQUENOS — outros empreendimentos ── */
  var smallIcon = L.divIcon({
    className:'',
    html: '<div style="'
      +'background:#0f2e36;'
      +'width:12px;height:12px;'
      +'border-radius:50%;'
      +'border:2.5px solid #b8873a;'
      +'box-shadow:0 1px 6px rgba(0,0,0,.35);'
      +'cursor:pointer;'
      +'"></div>',
    iconSize:[12,12], iconAnchor:[6,6], popupAnchor:[0,-10]
  });

  var group = L.featureGroup();
  group.addLayer(mainMarker);

  (ALL_IMOVEIS||[]).forEach(function(im){
    if(im.id === PROP.id) return;
    var m = L.marker([im.lat, im.lng], {icon:smallIcon, zIndexOffset:100})
      .addTo(map)
      .bindPopup(
        '<div style="font-family:Outfit,Inter,sans-serif;min-width:180px">'
        +'<div style="font-size:13px;font-weight:800;color:#0f2e36;margin-bottom:3px">'+im.nome+'</div>'
        +'<div style="font-size:11px;color:#6b7280;margin-bottom:6px">'+im.regiao+'</div>'
        +'<div style="font-size:12px;color:#9ca3af;margin-bottom:8px">'+im.preco+'</div>'
        +'<a href="'+im.url+'" style="display:inline-block;background:#b8873a;color:#fff;font-size:11px;font-weight:700;padding:5px 10px;border-radius:6px;text-decoration:none">Ver empreendimento →</a>'
        +'</div>',
        {maxWidth:240}
      );
    group.addLayer(m);
  });

  /* Ao clicar no pequeno → navega direto */
  map.on('popupopen', function(e){
    var el = e.popup.getElement();
    if(!el) return;
    var link = el.querySelector('a[href]');
    if(link) link.addEventListener('click', function(ev){
      ev.preventDefault();
      window.location.href = link.getAttribute('href');
    });
  });

  /* Zoom inicial: foca na propriedade atual com contexto das vizinhas */
  var propBounds = L.latLng(PROP.lat, PROP.lng).toBounds(1800); /* 1.8km radius */

  /* ── Correção de tamanho: o mapa agora vive dentro de um grid (ao lado do
     card de rota). O Leaflet mede o container na hora da criação, e se o
     grid ainda não estabilizou a largura, os pins ficam mal posicionados
     ("fora do mapa"). invalidateSize() força o recálculo antes do fitBounds
     e de novo depois que tudo (fontes, imagens) terminar de carregar. ── */
  map.invalidateSize();
  map.fitBounds(propBounds, {padding:[20,20], maxZoom:16});
  setTimeout(function(){ map.invalidateSize(); map.fitBounds(propBounds, {padding:[20,20], maxZoom:16}); }, 400);
  window.addEventListener('load', function(){ map.invalidateSize(); map.fitBounds(propBounds, {padding:[20,20], maxZoom:16}); });
}

// Call after DOM is ready
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(initImovelMap,300); });
} else {
  setTimeout(initImovelMap,300);
}

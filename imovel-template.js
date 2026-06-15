// Shared property page template — Paulo Cotrim · Cury RJ
// Each page defines PROP before loading this script

const WA_SVG=`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.373 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;


// Todos os empreendimentos — para mapa cruzado nas páginas individuais
const ALL_IMOVEIS = [
  {id:"orla-central", nome:"Orla Central",            lat:-22.8960,lng:-43.1255, url:"orla-central.html",          regiao:"Centro · Niterói · RJ",         preco:"A partir de R$ 402.000"},
  {id:"farol",        nome:"Farol da Guanabara",       lat:-22.8972,lng:-43.2072, url:"farol-da-guanabara.html",    regiao:"Santo Cristo · Porto Maravilha", preco:"A partir de R$ 403.000"},
  {id:"arcos",        nome:"Arcos do Porto",            lat:-22.8942,lng:-43.1988, url:"arcos-do-porto.html",        regiao:"Porto Maravilha · RJ",           preco:"A partir de R$ 361.000"},
  {id:"piedade",      nome:"Parque Piedade – Aquarela", lat:-22.8672,lng:-43.2885, url:"parque-piedade.html",        regiao:"Piedade · Zona Norte · RJ",      preco:"A partir de R$ 263.000"},
  {id:"lamparina",    nome:"Luzes do Rio – Lamparina",  lat:-22.9008,lng:-43.2238, url:"luzes-do-rio-lamparina.html",regiao:"São Cristóvão · RJ",             preco:"A partir de R$ 309.000"},
  {id:"caminhos",     nome:"Caminhos da Guanabara",     lat:-22.8748,lng:-43.1105, url:"caminhos-da-guanabara.html",regiao:"Pendotiba · Niterói · RJ",        preco:"A partir de R$ 335.000"},
  {id:"cartola",      nome:"Residencial Cartola II",    lat:-22.9015,lng:-43.2295, url:"cartola-ii.html",            regiao:"São Cristóvão · RJ",             preco:"A partir de R$ 302.000"},
  {id:"candeeiro",    nome:"Luzes do Rio – Candeeiro",  lat:-22.9000,lng:-43.2220, url:"luzes-do-rio-candeeiro.html",regiao:"São Cristóvão · RJ",            preco:"A partir de R$ 362.000"}
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
  'Piscinas':'🏊','Piscina':'🏊','Rooftop':'🌇','Solário':'☀️','Academia':'💪',
  'Churrasqueira':'🔥','Salão de Festas':'🎉','Playground':'🛝','Horta':'🌿',
  'Beach Tênis':'🎾','Futmesa':'⚽','Espaço Gourmet':'🍽️','Espaço Zen':'🧘',
  'Pet Place':'🐾','Pet Care':'🐾','Petplace':'🐾','Espaço Relax':'🛋️',
  'Praça':'🌳','Apoio Festas':'🎊','Bike LEV':'🚲','Quadra Poliesportiva':'🏀',
  'Sauna':'🧖','Lavanderia':'🫧','Apoio Churrasqueira':'🔥',
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
      <img src="logo-header.png" alt="Paulo Cotrim" style="height:38px;width:auto;max-width:230px;border-radius:7px;object-fit:contain;filter:brightness(1.05)"/>
      <div style="display:flex;flex-direction:column;gap:1px;line-height:1">
        <span style="color:#fff;font-size:14px;font-weight:800;letter-spacing:-.01em;white-space:nowrap">Paulo Cotrim</span>
        <span style="color:#e8b84b;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Especialista Cury · RJ</span>
      </div>
    </a>
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
      ${allImgs.slice(0,4).map((src,i)=>`<div class="im-gthumb${i===0?' im-gthumb-main':''}" onclick="openGaleriaLb(${i})"><img src="${src}" alt="${PROP.nome} foto ${i+1}" loading="${i?'lazy':'eager'}"/></div>`).join('')}
    </div>
    <button class="im-gallery-all-btn" onclick="openGaleriaLb(0)">📷 Ver todas as ${totalFotos} fotos</button>
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

      <div class="section-block galeria-section">
        <h2>Galeria de imagens</h2>
        <div class="galeria-grid">
          ${galeria.map((src,i)=>`<div class="galeria-thumb" onclick="openGaleriaLb(${i})" title="Ampliar foto ${i+1}"><img src="${src}" alt="${PROP.nome} — foto ${i+1}" loading="lazy"/><div class="galeria-overlay"><span>🔍</span></div></div>`).join('')}
        </div>
        <p class="galeria-hint">Clique em qualquer foto para ampliar · ${galeria.length} fotos disponíveis</p>
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
        ${PROP.endereco?`<p style="font-size:13px;color:#64748b;margin:0 0 14px;display:flex;align-items:flex-start;gap:6px"><span style="font-size:16px">📍</span><span><strong style="color:#1e293b">${PROP.nome}</strong><br>${PROP.endereco}</span></p>`:''}
        <div id="map-imovel" style="width:100%;height:360px;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:14px"></div>
        ${nearby.length?`<div class="im-nearby">
          <span class="nearby-label">Próximo a:</span>
          ${nearby.map(p=>`<span class="nearby-pill">${p}</span>`).join('')}
        </div>`:''}
        <a href="https://www.google.com/maps/search/?api=1&query=${mapQ}" target="_blank" class="im-maps-link">Abrir no Google Maps →</a>
      </div>

      ${PROP.vizinhanca ? `
      <div class="section-block">
        <h2>🏘️ O bairro para a sua família</h2>
        <div class="viz-grid">
          <div class="viz-row-2">
            ${PROP.vizinhanca.escolas ? `<div class="viz-cat"><div class="viz-cat-title">🏫 Escolas de Renome</div><ul class="viz-list">${PROP.vizinhanca.escolas.map(e=>`<li>${e}</li>`).join('')}</ul></div>` : ''}
            ${PROP.vizinhanca.padarias ? `<div class="viz-cat"><div class="viz-cat-title">🥐 Padarias & Cafés</div><ul class="viz-list">${PROP.vizinhanca.padarias.map(p=>`<li>${p}</li>`).join('')}</ul></div>` : ''}
          </div>
          <div class="viz-row-3">
            ${PROP.vizinhanca.banco ? `<div class="viz-item"><span class="viz-icon">🏦</span><div><div class="viz-item-label">Banco</div><div class="viz-item-val">${PROP.vizinhanca.banco}</div></div></div>` : ''}
            ${PROP.vizinhanca.combustivel ? `<div class="viz-item"><span class="viz-icon">⛽</span><div><div class="viz-item-label">Combustível</div><div class="viz-item-val">${PROP.vizinhanca.combustivel}</div></div></div>` : ''}
            ${PROP.vizinhanca.hospital ? `<div class="viz-item"><span class="viz-icon">🏥</span><div><div class="viz-item-label">Saúde</div><div class="viz-item-val">${PROP.vizinhanca.hospital}</div></div></div>` : ''}
          </div>
          ${PROP.vizinhanca.transporte ? `<div class="viz-cat"><div class="viz-cat-title">🚌 Como se locomover</div><ul class="viz-list">${PROP.vizinhanca.transporte.map(t=>`<li>${t}</li>`).join('')}</ul></div>` : ''}
        </div>
      </div>` : ''}

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

      <!-- ═══ BAIXAR PROPOSTA ═══ -->
      <div class="section-block proposta-section">
        <div class="proposta-banner">
          <div class="proposta-banner-badge">📥 DOWNLOAD GRATUITO</div>
          <h2 class="proposta-banner-title">Baixe a proposta do <span>${PROP.nome}</span></h2>
          <p class="proposta-banner-sub">Escolha o formato ideal para você. Leve todas as informações do empreendimento para analisar com calma.</p>
          <div class="proposta-options">
            <div class="proposta-card" onclick="baixarPropostaSimples()">
              <div class="proposta-card-icon">📋</div>
              <div class="proposta-card-body">
                <div class="proposta-card-title">Proposta Resumo</div>
                <div class="proposta-card-desc">Tipologias, preços, localização e condições de financiamento em um PDF limpo e objetivo.</div>
                <button class="btn-proposta-simples">⬇ Baixar agora (sem apresentação)</button>
              </div>
            </div>
            <div class="proposta-card proposta-card-destaque" onclick="solicitarPropostaCompleta()">
              <div class="proposta-card-badge">⭐ MAIS COMPLETO</div>
              <div class="proposta-card-icon">💼</div>
              <div class="proposta-card-body">
                <div class="proposta-card-title">Apresentação Completa</div>
                <div class="proposta-card-desc">Catálogo oficial do empreendimento com plantas, perspectivas, área de lazer e tabela de preços atualizada.</div>
                <button class="btn-proposta-completa">${WA_SVG} Receber apresentação completa</button>
              </div>
            </div>
          </div>
          <p class="proposta-nota">✓ Material gratuito · ✓ Sem compromisso · ✓ Resposta em minutos</p>
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
          <div class="sid-row"><span class="sid-label">Status</span><span class="sid-value" style="color:#16a34a">${PROP.tipo}</span></div>
        </div>
        <a href="${waLink()}" target="_blank" style="display:block;margin-bottom:10px">
          <button class="btn-wa-sid">${WA_SVG} Falar com Paulo agora</button>
        </a>
        <a href="simulador.html" style="display:block;margin-bottom:10px">
          <button class="btn-sim-sid">🧮 Simular financiamento</button>
        </a>
        <a href="${waLink('Quero%20receber%20a%20planta%20baixa%20do%20'+encodeURIComponent(PROP.nome))}" target="_blank" style="display:block;margin-bottom:10px">
          <button class="btn-planta-sid">📐 Receber planta</button>
        </a>
        <div style="border-top:1px solid #f1f5f9;padding-top:10px;margin-top:2px">
          <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:8px">📥 Baixar proposta</div>
          <button class="btn-proposta-sid-simples" onclick="baixarPropostaSimples()" style="display:flex;align-items:center;gap:6px;width:100%;margin-bottom:6px;padding:9px 12px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;font-weight:700;color:#1e293b;cursor:pointer;font-family:inherit">⬇ Resumo (sem apresentação)</button>
          <button class="btn-proposta-sid-completa" onclick="solicitarPropostaCompleta()" style="display:flex;align-items:center;gap:6px;width:100%;padding:9px 12px;background:linear-gradient(135deg,#16a34a,#15803d);border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;cursor:pointer;font-family:inherit">💼 Com apresentação PDF</button>
        </div>
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
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#1e293b">${t.n}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#64748b">${t.m2}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#16a34a">${t.preco}</td>
    </tr>`).join('');
  const amens = (p.amenidades||[]).map(a=>`<li style="margin-bottom:4px">✓ ${a}</li>`).join('');
  const w = window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
  <title>Proposta — ${p.nome}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Arial',sans-serif;color:#1e293b;background:#fff}
    .pg{max-width:800px;margin:0 auto;padding:40px 32px}
    .hdr{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #16a34a;padding-bottom:20px;margin-bottom:28px}
    .hdr-name{font-size:22px;font-weight:900;color:#060f1e}
    .hdr-sub{font-size:11px;color:#64748b;margin-top:3px;letter-spacing:.05em;text-transform:uppercase}
    .hdr-creci{font-size:11px;color:#94a3b8;font-weight:700}
    .badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:20px;font-size:11px;font-weight:700;padding:4px 12px;margin-bottom:16px;letter-spacing:.05em;text-transform:uppercase}
    h1{font-size:28px;font-weight:900;color:#060f1e;margin-bottom:6px}
    .bairro{font-size:14px;color:#64748b;margin-bottom:24px}
    h2{font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin:24px 0 12px;padding-bottom:6px;border-bottom:1px solid #f1f5f9}
    table{width:100%;border-collapse:collapse;font-size:14px;background:#fff;border:1px solid #f1f5f9;border-radius:8px;overflow:hidden}
    th{background:#060f1e;color:#fff;padding:10px 14px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em}
    ul{list-style:none;columns:2;gap:12px;font-size:13px;color:#475569}
    .desc{font-size:14px;line-height:1.7;color:#475569}
    .cta-box{background:linear-gradient(135deg,#060f1e,#0d2040);color:#fff;border-radius:12px;padding:24px;margin-top:32px;text-align:center}
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
        <div class="hdr-sub">Coordenador Cury · Especialista MCMV · RJ</div>
      </div>
      <div class="hdr-creci">CRECI-RJ 77677-F<br>📞 (21) 98915-0864</div>
    </div>
    <div class="badge">${p.tipo||'Empreendimento'}</div>
    <h1>${p.nome}</h1>
    <div class="bairro">📍 ${p.bairro} · ${p.cidade||'Rio de Janeiro'}</div>
    <h2>Sobre o empreendimento</h2>
    <p class="desc">${p.desc||''}</p>
    <h2>Tipologias e preços</h2>
    <table><thead><tr><th>Tipologia</th><th>Área</th><th>Preço</th></tr></thead><tbody>${tipos}</tbody></table>
    <h2>Lazer e amenidades</h2>
    <ul>${amens}</ul>
    <div class="cta-box">
      <h3>Pronto para dar o próximo passo?</h3>
      <p>Paulo Cotrim cuida de toda a documentação e aprovação do seu financiamento em até 48h.</p>
      <a class="cta-wa" href="https://wa.me/5521989150864?text=Tenho%20interesse%20no%20${encodeURIComponent(p.nome)}!" target="_blank">💬 Falar com Paulo no WhatsApp</a>
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
      +'background:#c9993a;'
      +'width:30px;height:30px;'
      +'border-radius:50%;'
      +'border:4px solid #fff;'
      +'box-shadow:0 4px 16px rgba(201,153,58,.55);'
      +'cursor:default;'
      +'"></div>',
    iconSize:[30,30], iconAnchor:[15,15], popupAnchor:[0,-20]
  });

  var mainMarker = L.marker([PROP.lat, PROP.lng], {icon:mainIcon, zIndexOffset:1000})
    .addTo(map)
    .bindPopup(
      '<div style="font-family:Outfit,Inter,sans-serif;min-width:180px">'
      +'<div style="font-size:13px;font-weight:800;color:#060f1e;margin-bottom:4px">'+PROP.nome+'</div>'
      +'<div style="font-size:11px;color:#64748b;line-height:1.4">'+(PROP.endereco||PROP.bairro+' · '+PROP.cidade)+'</div>'
      +'</div>',
      {maxWidth:240, closeButton:false}
    );
  mainMarker.openPopup();

  /* ── Marcadores PEQUENOS — outros empreendimentos ── */
  var smallIcon = L.divIcon({
    className:'',
    html: '<div style="'
      +'background:#1e293b;'
      +'width:12px;height:12px;'
      +'border-radius:50%;'
      +'border:2.5px solid #c9993a;'
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
        +'<div style="font-size:13px;font-weight:800;color:#060f1e;margin-bottom:3px">'+im.nome+'</div>'
        +'<div style="font-size:11px;color:#64748b;margin-bottom:6px">'+im.regiao+'</div>'
        +'<div style="font-size:12px;color:#94a3b8;margin-bottom:8px">'+im.preco+'</div>'
        +'<a href="'+im.url+'" style="display:inline-block;background:#c9993a;color:#fff;font-size:11px;font-weight:700;padding:5px 10px;border-radius:6px;text-decoration:none">Ver empreendimento →</a>'
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
  map.fitBounds(propBounds, {padding:[20,20], maxZoom:16});
}

// Call after DOM is ready
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(initImovelMap,300); });
} else {
  setTimeout(initImovelMap,300);
}

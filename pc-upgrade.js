/* Paulo Cotrim · melhorias de desempenho, acessibilidade e inovações (busca inteligente, perto de mim, minha seleção, instalar app) */
(function(){
  var W='5521989150864';
  function es(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function nrm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
  function wa(t){return 'https://wa.me/'+W+'?text='+encodeURIComponent(t);}
  var CAT=[];
  var catP=fetch('/data/catalogo.json').then(function(r){return r.json();}).then(function(d){CAT=(d&&d.itens)||[];return CAT;}).catch(function(){return [];});

  /* ===== CORREÇÃO 1: carregamento preguiçoso das fotos de fundo ===== */
  var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es_){es_.forEach(function(x){if(x.isIntersecting){var el=x.target;if(el.dataset.bg){el.style.backgroundImage=el.dataset.bg;delete el.dataset.bg;}io.unobserve(el);}});},{rootMargin:'400px 300px'}):null;
  function lazyBG(root){
    if(!io)return;
    (root||document).querySelectorAll('.pcard .im[style*="background-image"], .inv .th i[style*="background-image"], .k-im').forEach(function(el){
      if(el.dataset.lz||!el.style.backgroundImage)return;el.dataset.lz=1;
      var r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0&&r.left<innerWidth&&r.right>0)return;
      el.dataset.bg=el.style.backgroundImage;el.style.backgroundImage='none';io.observe(el);});
  }
  /* ===== CORREÇÃO 4: texto alternativo e carregamento nas imagens ===== */
  function fixImgs(root){
    (root||document).querySelectorAll('img').forEach(function(i){
      if(!i.hasAttribute('alt')||i.alt===''){var t=(i.closest('a,figure,div')||{}).textContent||'';i.alt=(i.getAttribute('aria-label')||t.trim().split('\n')[0]||'Imagem do empreendimento — Paulo Cotrim').slice(0,110);}
      if(!i.loading&&!i.closest('.hero'))i.loading='lazy';i.decoding='async';});
    (root||document).querySelectorAll('.pcard .im:not([aria-label])').forEach(function(a){var h=a.closest('.pcard');var n=h&&h.querySelector('h3');if(n)a.setAttribute('aria-label','Ver '+n.textContent);});
  }
  function pass(){lazyBG();fixImgs();}
  var mo=new MutationObserver(function(){clearTimeout(pass.t);pass.t=setTimeout(pass,120);});
  function boot(){pass();['pf-grid','dq','inv-b','grid'].forEach(function(id){var e=document.getElementById(id);if(e)mo.observe(e,{childList:true});});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

  /* ===== INOVAÇÃO 1: busca inteligente com fotos (digite e veja o condomínio) ===== */
  function initSuggest(){
    var inp=document.getElementById('hs-q');if(!inp||inp.dataset.sg)return;inp.dataset.sg=1;
    var box=document.createElement('div');box.className='pcs-box';box.setAttribute('role','listbox');inp.closest('.hsearch').style.position='relative';inp.closest('.hsearch').appendChild(box);
    function show(q){
      q=nrm(q).trim();if(q.length<2){box.style.display='none';return;}
      var L=CAT.filter(function(e){return e.img&&nrm([e.nome,e.local,e.regiao,e.incorporadora].join(' ')).indexOf(q)>=0;}).slice(0,6);
      if(!L.length){box.innerHTML='<div class="pcs-n">Nada encontrado. Fale comigo no WhatsApp que eu procuro para você.</div>';box.style.display='block';return;}
      box.innerHTML=L.map(function(e){return '<a class="pcs-i" role="option" href="'+es(e.url)+'"><i style="background-image:url(\''+es(e.img)+'\')"></i><span><b>'+es(e.nome)+'</b><small>'+es([e.local,e.incorporadora].filter(Boolean).join(' · '))+'</small></span></a>';}).join('');
      box.style.display='block';}
    inp.addEventListener('input',function(){show(inp.value);});
    inp.addEventListener('focus',function(){show(inp.value);});
    document.addEventListener('click',function(ev){if(!box.contains(ev.target)&&ev.target!==inp)box.style.display='none';});
  }
  /* ===== INOVAÇÃO 2: condomínios perto de você (GPS do celular) ===== */
  function km(a,b,c,d){var R=6371,t=Math.PI/180,x=(c-a)*t,y=(d-b)*t,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*t)*Math.cos(c*t)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(h));}
  function initNear(){
    var f=document.querySelector('.hsearch');if(!f||document.getElementById('pcs-near'))return;
    var b=document.createElement('button');b.type='button';b.id='pcs-near';b.className='pcs-near';b.textContent='📍 Perto de mim';
    var it=document.querySelector('.intent');if(it)it.appendChild(b);else f.parentNode.appendChild(b);
    b.onclick=function(){
      if(!navigator.geolocation){alert('Seu aparelho não permite localização.');return;}
      b.textContent='Localizando…';
      navigator.geolocation.getCurrentPosition(function(p){
        fetch('/data/mapa.json').then(function(r){return r.json();}).then(function(m){
          var L=(m.pontos||[]).filter(function(x){return x.lat&&x.lng&&x.img;}).map(function(x){x.d=km(p.coords.latitude,p.coords.longitude,x.lat,x.lng);return x;}).sort(function(a,b){return a.d-b.d;}).slice(0,5);
          b.textContent='📍 Perto de mim';openModal('Condomínios mais perto de você','<div class="pcs-list">'+L.map(function(x){return '<a class="pcs-i" href="'+es(x.u)+'"><i style="background-image:url(\'/'+es(x.img)+'\')"></i><span><b>'+es(x.n)+'</b><small>'+es(x.b)+'</small></span><em>'+(x.d<10?x.d.toFixed(1):Math.round(x.d))+' km</em></a>';}).join('')+'</div><p class="pcs-sm">Sua localização é usada só neste aparelho e não é enviada nem guardada.</p>');
        });
      },function(){b.textContent='📍 Perto de mim';alert('Não consegui sua localização. Autorize o acesso ou busque pelo bairro.');},{timeout:9000,maximumAge:600000});
    };
  }
  /* ===== modal simples ===== */
  var M;
  function openModal(t,html){
    if(!M){M=document.createElement('div');M.className='pcs-m';M.innerHTML='<div class="pcs-b"><button class="pcs-x" aria-label="Fechar">&times;</button><h3></h3><div class="pcs-c"></div></div>';document.body.appendChild(M);
      M.addEventListener('click',function(e){if(e.target===M||e.target.classList.contains('pcs-x'))M.classList.remove('on');});
      document.addEventListener('keydown',function(e){if(e.key==='Escape')M.classList.remove('on');});}
    M.querySelector('h3').textContent=t;M.querySelector('.pcs-c').innerHTML=html;M.classList.add('on');
  }
  window.pcsModal=openModal;
  /* ===== INOVAÇÃO 3: minha seleção (coração nos cartões → envia ao Paulo) ===== */
  var FAV=[];try{FAV=JSON.parse(localStorage.getItem('pcs_fav')||'[]');}catch(e){}
  function saveFav(){try{localStorage.setItem('pcs_fav',JSON.stringify(FAV));}catch(e){}pill();}
  var P;
  function pill(){
    if(!P){P=document.createElement('button');P.className='pcs-pill';P.type='button';P.onclick=openFav;document.body.appendChild(P);}
    P.style.display=FAV.length?'flex':'none';var hh='♥ Minha seleção <b>'+FAV.length+'</b>';if(P.dataset.h!==hh){P.dataset.h=hh;P.innerHTML=hh;}
    document.querySelectorAll('.pcs-h').forEach(function(h){var on=FAV.indexOf(h.dataset.n)>=0;h.classList.toggle('on',on);h.setAttribute('aria-pressed',on);});
  }
  function hearts(){
    document.querySelectorAll('.pcard').forEach(function(c){
      if(c.querySelector('.pcs-h'))return;var n=c.querySelector('h3');if(!n)return;var im=c.querySelector('.im');if(!im)return;
      var h=document.createElement('button');h.type='button';h.className='pcs-h';h.dataset.n=n.textContent.trim();h.setAttribute('aria-label','Guardar '+h.dataset.n+' na minha seleção');h.textContent='♥';c.style.position='relative';c.appendChild(h);});
    pill();
  }
  document.addEventListener('click',function(e){
    var h=e.target.closest&&e.target.closest('.pcs-h');if(!h)return;e.preventDefault();e.stopPropagation();
    var n=h.dataset.n,i=FAV.indexOf(n);if(i>=0)FAV.splice(i,1);else FAV.push(n);saveFav();},true);
  function openFav(){
    var L=FAV.map(function(n){return CAT.filter(function(e){return e.nome===n;})[0];}).filter(Boolean);
    openModal('Minha seleção','<div class="pcs-list">'+L.map(function(x){return '<a class="pcs-i" href="'+es(x.url)+'"><i style="background-image:url(\''+es(x.img)+'\')"></i><span><b>'+es(x.nome)+'</b><small>'+es([x.local,x.incorporadora].filter(Boolean).join(' · '))+'</small></span></a>';}).join('')+'</div>'+
    '<form class="pcs-f" id="pcs-ff"><input name="n" placeholder="Seu nome" required autocomplete="name"/><input name="t" type="tel" placeholder="WhatsApp com DDD" required autocomplete="tel"/><button class="pcs-go" type="submit">Receber estes condomínios no WhatsApp</button></form><button class="pcs-lk" id="pcs-clr" type="button">Limpar seleção</button>');
    document.getElementById('pcs-clr').onclick=function(){FAV=[];saveFav();M.classList.remove('on');};
    document.getElementById('pcs-ff').onsubmit=function(ev){ev.preventDefault();var f=ev.target,nome=f.n.value.trim(),tel=f.t.value.trim();
      var lista=L.map(function(x){return x.nome;}).join(', ');
      try{window.enviarLeadCRM&&enviarLeadCRM({nome:nome,telefone:tel,interesse:'Seleção: '+lista,origem:'site:minha-selecao',temp:'quente',extras:{condominios:lista}});}catch(x){}
      window.open(wa('Olá Paulo, sou '+nome+'. Quero apresentação, plantas e tabela destes condomínios: '+lista+'.'),'_blank','noopener');};
  }
  /* ===== INOVAÇÃO 4: instalar como app + compartilhar ===== */
  var dp;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;var b=document.getElementById('pcs-inst');if(b)b.style.display='inline-flex';});
  function initInstall(){
    if(document.getElementById('pcs-inst'))return;var f=document.querySelector('footer');if(!f)return;
    var d=document.createElement('div');d.className='pcs-ft';
    d.innerHTML='<button id="pcs-inst" type="button" style="display:none">📲 Instalar o app do Paulo Cotrim</button><button id="pcs-sh" type="button">↗ Compartilhar este site</button>';f.appendChild(d);
    document.getElementById('pcs-inst').onclick=function(){if(dp){dp.prompt();dp=null;}};
    document.getElementById('pcs-sh').onclick=function(){var u={title:document.title,text:'Condomínios na planta no Rio — Paulo Cotrim',url:location.href};if(navigator.share)navigator.share(u).catch(function(){});else{try{navigator.clipboard.writeText(location.href);alert('Link copiado!');}catch(e){window.open(wa('Veja este site: '+location.href),'_blank','noopener');}}};
  }
  function initAll(){catP.then(function(){initSuggest();initNear();hearts();initInstall();new MutationObserver(function(){clearTimeout(initAll.t);initAll.t=setTimeout(hearts,150);}).observe(document.body,{childList:true,subtree:true});});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initAll);else initAll();
})();

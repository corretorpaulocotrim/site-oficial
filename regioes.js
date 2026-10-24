/* =====================================================
   MAPA DO RIO POR REGIAO — cada regiao muda a apresentacao:
   Zona Norte, Zona Oeste e Centro = linguagem Minha Casa Minha Vida
   Zona Sul e Barra = linguagem alto padrao.
   ===================================================== */
(function(){
  var box=document.getElementById('pc-regioes');if(!box||!window.L)return;
  var R={
    norte:{n:'Zona Norte',c:[-22.865,-43.30],r:9000,t:'mcmv',b:['tijuca','meier','cachambi','del castilho','engenho','madureira','pilares','piedade','todos os santos','inhauma','riachuelo','rocha','sao cristovao','vila isabel','grajau','andarai','maracana','penha','olaria','ramos','bonsucesso','iraja','vila da penha','vista alegre','campinho','cascadura','abolicao','lins','benfica','quintino','encantado','agua santa','bento ribeiro','oswaldo cruz','marechal hermes','rocha miranda','coelho neto','pavuna','guadalupe','anchieta','vila kosmos','praca seca','valqueire']},
    oeste:{n:'Zona Oeste',c:[-22.905,-43.56],r:12000,t:'mcmv',b:['campo grande','santa cruz','bangu','realengo','santissimo','paciencia','guaratiba','sepetiba','cosmos','inhoaiba','senador camara','padre miguel','jacarepagua','taquara','curicica','freguesia','pechincha','tanque','camorim','vargem']},
    centro:{n:'Centro',c:[-22.905,-43.19],r:3200,t:'mcmv',b:['centro','lapa','santo cristo','gamboa','saude','cidade nova','estacio','catumbi','santa teresa','rio comprido','porto maravilha']},
    sul:{n:'Zona Sul',c:[-22.965,-43.20],r:5200,t:'lux',b:['ipanema','leblon','copacabana','botafogo','flamengo','laranjeiras','gavea','sao conrado','lagoa','jardim botanico','humaita','urca','leme','catete','gloria','cosme velho','joa']},
    barra:{n:'Barra e Recreio',c:[-23.0,-43.40],r:7500,t:'lux',b:['barra da tijuca','barra olimpica','recreio','itanhanga','jardim oceanico']}
  };
  var TX={
    mcmv:{cl:'mc',eye:'Minha Casa Minha Vida · Financiamento CAIXA',h:'Sua casa própria com parcela que cabe no bolso',p:'Saia do aluguel com subsídio do governo, FGTS na entrada e análise de crédito em até 48h úteis. Eu faço a simulação e cuido da documentação com você.',
      it:['Parcela muitas vezes menor que o aluguel','Use o FGTS na entrada','Subsídio do Minha Casa Minha Vida para quem se enquadra','Análise de crédito em até 48h úteis'],cta:'Simular minha parcela',href:'simulador.html',w:'Olá Paulo, quero simular meu financiamento na '},
    lux:{cl:'lx',eye:'Alto padrão · Curadoria Paulo Cotrim',h:'Endereços que se tornam patrimônio',p:'Seleção reservada de lançamentos assinados, coberturas e unidades frente-mar. Atendimento discreto, visita com hora marcada e análise de investimento.',
      it:['Curadoria dos lançamentos mais exclusivos','Plantas, tabela vigente e disponibilidade em primeira mão','Visita privativa com hora marcada','Análise de valorização e locação'],cta:'Atendimento reservado',href:'',w:'Olá Paulo, quero conhecer os imóveis de alto padrão na '}
  };
  function N(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
  function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function reg(b){b=N(b);for(var k in R)if(R[k].b.some(function(x){return b.indexOf(x)>-1}))return k;return ''}
  box.innerHTML='<div class="rg-w"><span class="rg-eye">Onde você quer morar?</span><h2>Escolha a região no mapa</h2><p class="rg-sub">Cada região tem o seu jeito de comprar. Toque no mapa. Quer vender? <a href="cadastre-seu-imovel.html" style="color:#1a8f4c;font-weight:700">Cadastre seu imóvel</a></p>'+
    '<div class="rg-tabs">'+Object.keys(R).map(function(k){return '<button type="button" data-k="'+k+'">'+R[k].n+'</button>'}).join('')+'</div>'+
    '<div class="rg-g"><div id="rg-map"></div><div id="rg-p" class="rg-p"><p class="rg-sub">Toque numa região para ver os imóveis e as condições.</p></div></div></div>';
  var map=L.map('rg-map',{scrollWheelZoom:false,zoomControl:true}).setView([-22.93,-43.38],10);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{attribution:'© OpenStreetMap © CARTO',maxZoom:18}).addTo(map);
  var C={};Object.keys(R).forEach(function(k){var r=R[k];C[k]=L.circle(r.c,{radius:r.r,color:r.t==='lux'?'#cf9f4f':'#0058a3',weight:2,fillOpacity:.18}).addTo(map).bindTooltip(r.n,{permanent:true,direction:'center',className:'rg-tt'}).on('click',function(){abre(k)})});
  var D=[];
  Promise.all(['data/sawala-oportunidades.json','data/catalogo.json'].map(function(u){return fetch(u).then(function(r){return r.json()}).catch(function(){return{itens:[]}})})).then(function(a){
    var vis={};a[0].itens.concat(a[1].itens).forEach(function(x){var nome=x.nome,u=x.url||'',p=x.preco||0;if(!nome||vis[N(nome)])return;vis[N(nome)]=1;D.push({n:nome,b:x.bairro||x.local||'',p:p,u:u,img:x.img||'',st:x.status||''})});
    var m=(location.hash+location.search).match(/regiao[-=](norte|oeste|centro|sul|barra)/);if(m){abre(m[1]);setTimeout(function(){box.scrollIntoView()},300)}
  });
  function abre(k){
    var r=R[k],t=TX[r.t],hoje=new Date().toISOString().slice(0,7);
    document.querySelectorAll('#pc-regioes .rg-tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.k===k)});
    Object.keys(C).forEach(function(z){C[z].setStyle({fillOpacity:z===k?.38:.12})});map.flyTo(r.c,r.t==='lux'?12:11,{duration:.6});
    var T=D.filter(function(x){return reg(x.b)===k&&x.u}),pm=T.filter(function(x){return x.p}).map(function(x){return x.p}),L2=T.sort(function(a,b){return (a.p?0:1)-(b.p?0:1)||(r.t==='lux'?b.p-a.p:a.p-b.p)}).slice(0,6);
    var p=document.getElementById('rg-p');p.className='rg-p '+t.cl;
    p.innerHTML='<span class="rg-eye">'+t.eye+'</span><h3>'+t.h+'</h3><div class="rg-k"><div><b>'+T.length+'</b><small>imóveis em '+r.n+'</small></div>'+(pm.length?'<div><b>R$ '+Math.round(Math.min.apply(0,pm)/1000)+' mil</b><small>a partir de</small></div>':'')+'</div><p>'+t.p+'</p><ul>'+t.it.map(function(i){return '<li>'+i+'</li>'}).join('')+'</ul>'+
      (L2.length?'<div class="rg-l">'+L2.map(function(x){return '<a href="'+E(x.u)+'"><span style="background-image:url(\''+E(x.img)+'\')"></span><b>'+E(x.n)+'</b><small>'+E(x.b)+(x.p?' · a partir de R$ '+Math.round(x.p).toLocaleString('pt-BR'):'')+'</small></a>'}).join('')+'</div>':'')+
      '<div class="rg-ct"><a class="rg-btn" href="'+(t.href||('https://wa.me/5521989150864?text='+encodeURIComponent(t.w+r.n)))+'"'+(t.href?'':' target="_blank" rel="noopener"')+'>'+t.cta+'</a><a class="rg-btn2" href="https://wa.me/5521989150864?text='+encodeURIComponent(t.w+r.n)+'" target="_blank" rel="noopener">Falar no WhatsApp</a></div>';
    try{localStorage.setItem('pc_perfil',r.t);history.replaceState(null,'','#regiao-'+k)}catch(e){}
    if(innerWidth<760)p.scrollIntoView({behavior:'smooth',block:'start'});
  }
  box.querySelector('.rg-tabs').onclick=function(e){var b=e.target.closest('button');if(b)abre(b.dataset.k)};
})();

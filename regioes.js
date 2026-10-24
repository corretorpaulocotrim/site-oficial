/* =====================================================
   REGIOES — escolha da regiao (estilo vitrine) e pagina por regiao.
   Home: #pc-regioes mostra 5 cartoes. regiao.html?r=<k> mostra so aquela regiao.
   Zona Norte, Oeste e Centro: linguagem Minha Casa Minha Vida.
   Zona Sul e Barra: linguagem alto padrao. Visual de luxo em todas.
   ===================================================== */
(function(){
  var R={
    norte:{n:'Zona Norte',s:'Tijuca, Méier, Penha, Madureira e região',t:'mcmv',b:['tijuca','meier','cachambi','del castilho','engenho','madureira','pilares','piedade','todos os santos','inhauma','riachuelo','rocha','sao cristovao','vila isabel','grajau','andarai','maracana','penha','olaria','ramos','bonsucesso','iraja','vila da penha','vista alegre','campinho','cascadura','abolicao','lins','benfica','quintino','encantado','agua santa','bento ribeiro','oswaldo cruz','marechal hermes','rocha miranda','coelho neto','pavuna','guadalupe','anchieta','vila kosmos','praca seca','valqueire']},
    oeste:{n:'Zona Oeste',s:'Jacarepaguá, Campo Grande, Bangu e região',t:'mcmv',b:['campo grande','santa cruz','bangu','realengo','santissimo','paciencia','guaratiba','sepetiba','cosmos','inhoaiba','senador camara','padre miguel','jacarepagua','taquara','curicica','freguesia','pechincha','tanque','camorim','vargem']},
    centro:{n:'Centro',s:'Porto Maravilha, Lapa e Centro histórico',t:'mcmv',b:['centro','lapa','santo cristo','gamboa','saude','cidade nova','estacio','catumbi','santa teresa','rio comprido','porto maravilha']},
    sul:{n:'Zona Sul',s:'Ipanema, Leblon, Botafogo e Copacabana',t:'lux',b:['ipanema','leblon','copacabana','botafogo','flamengo','laranjeiras','gavea','sao conrado','lagoa','jardim botanico','humaita','urca','leme','catete','gloria','cosme velho','joa']},
    barra:{n:'Barra e Recreio',s:'Barra da Tijuca, Ilha Pura e Recreio',t:'lux',b:['barra da tijuca','barra olimpica','recreio','itanhanga','jardim oceanico']}
  };
  var TX={
    mcmv:{eye:'Minha Casa Minha Vida · Financiamento CAIXA',h:'Sua casa própria com parcela que cabe no bolso',p:'Saia do aluguel com subsídio do governo, FGTS na entrada e análise de crédito em até 48h úteis. Eu faço a simulação e cuido de toda a documentação com você.',
      it:['Parcela muitas vezes menor que o aluguel','FGTS na entrada','Subsídio do Minha Casa Minha Vida para quem se enquadra','Análise de crédito em até 48h úteis'],cta:'Simular minha parcela',href:'simulador.html',w:'Olá Paulo, quero simular meu financiamento na '},
    lux:{eye:'Alto padrão · Curadoria Paulo Cotrim',h:'Endereços que se tornam patrimônio',p:'Seleção reservada de lançamentos assinados, coberturas e unidades a passos do mar. Atendimento discreto, visita com hora marcada e análise de investimento.',
      it:['Curadoria dos lançamentos mais exclusivos','Plantas, tabela vigente e disponibilidade em primeira mão','Visita privativa com hora marcada','Análise de valorização e locação'],cta:'Atendimento reservado',href:'',w:'Olá Paulo, quero conhecer os imóveis de alto padrão na '}
  };
  function N(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
  function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function reg(b){b=N(b);var m='',l=0;for(var k in R)R[k].b.forEach(function(x){if(x.length>l&&b.indexOf(x)>-1){m=k;l=x.length}});return m}
  function M(v){return v>=1e6?'R$ '+(v/1e6).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mi':'R$ '+Math.round(v/1000)+' mil'}
  function dados(cb){Promise.all(['data/sawala-oportunidades.json','data/catalogo.json'].map(function(u){return fetch(u).then(function(r){return r.json()}).catch(function(){return{itens:[]}})})).then(function(a){
    var D=[],vis={};a[0].itens.concat(a[1].itens).forEach(function(x){var nome=x.nome;if(!nome||!x.url||vis[N(nome)])return;vis[N(nome)]=1;var k=reg(x.bairro||x.local);if(k)D.push({k:k,n:nome,b:x.bairro||x.local||'',p:x.preco||0,u:x.url,img:x.img||''})});cb(D)})}

  // ---------- HOME: escolha da regiao ----------
  var box=document.getElementById('pc-regioes');
  if(box){
    box.innerHTML='<div class="rg-w"><span class="rg-eye">Onde você quer morar?</span><h2>Escolha a sua região</h2><p class="rg-sub">Veja só os imóveis e as condições da região que é a sua. Quer vender o seu? <a href="cadastre-seu-imovel.html" style="color:#e6c581">Cadastre seu imóvel ›</a></p><div class="rg-cards">'+
      Object.keys(R).map(function(k){return '<a class="rg-c" href="regiao.html?r='+k+'" data-k="'+k+'"><span class="rg-ph"></span><span class="rg-tx"><small>'+(R[k].t==='lux'?'Alto padrão':'Minha Casa Minha Vida')+'</small><b>'+R[k].n+'</b><em>'+R[k].s+'</em><i data-n></i></span></a>'}).join('')+'</div></div>';
    dados(function(D){Object.keys(R).forEach(function(k){var L=D.filter(function(x){return x.k===k}),c=box.querySelector('[data-k='+k+']'),f=L.find(function(x){return x.img}),pm=L.filter(function(x){return x.p}).map(function(x){return x.p});
      if(f)c.querySelector('.rg-ph').style.backgroundImage="url('"+f.img+"')";c.querySelector('[data-n]').textContent=L.length+' imóveis'+(pm.length?' · a partir de '+M(Math.min.apply(0,pm)):'')})});
  }

  // ---------- PAGINA DA REGIAO ----------
  var pg=document.getElementById('pc-regiao');
  if(pg){
    var k=(location.search.match(/r=(norte|oeste|centro|sul|barra)/)||[])[1]||'norte',r=R[k],t=TX[r.t];
    document.title=r.n+' · Imóveis · Paulo Cotrim';
    try{localStorage.setItem('pc_perfil',r.t)}catch(e){}
    var wa='https://wa.me/5521989150864?text='+encodeURIComponent(t.w+r.n);
    pg.innerHTML='<header class="rx-h"><div class="rx-w"><a class="rx-v" href="index.html#pc-regioes">‹ Escolher outra região</a><span class="rg-eye">'+t.eye+'</span><h1>'+r.n+'</h1><p class="rx-s">'+r.s+'</p><h2>'+t.h+'</h2><p>'+t.p+'</p>'+
      '<div class="rx-k" id="rx-k"></div><ul>'+t.it.map(function(i){return '<li>'+i+'</li>'}).join('')+'</ul><div class="rx-ct"><a class="rx-b" href="'+(t.href||wa)+'"'+(t.href?'':' target="_blank" rel="noopener"')+'>'+t.cta+'</a><a class="rx-b2" href="'+wa+'" target="_blank" rel="noopener">Falar com Paulo Cotrim</a></div></div></header>'+
      '<section class="rx-w"><h3>Imóveis em '+r.n+'</h3><div class="rx-l" id="rx-l"><p>Carregando…</p></div></section>';
    var tabs=document.getElementById('rx-tabs');if(tabs)tabs.innerHTML=Object.keys(R).map(function(z){return '<a href="regiao.html?r='+z+'"'+(z===k?' class="on"':'')+'>'+R[z].n+'</a>'}).join('');
    dados(function(D){var L=D.filter(function(x){return x.k===k}).sort(function(a,b){return (a.p?0:1)-(b.p?0:1)||(r.t==='lux'?b.p-a.p:a.p-b.p)}),pm=L.filter(function(x){return x.p}).map(function(x){return x.p});
      document.getElementById('rx-k').innerHTML='<div><b>'+L.length+'</b><small>imóveis na região</small></div>'+(pm.length?'<div><b>'+M(Math.min.apply(0,pm))+'</b><small>a partir de</small></div>':'');
      document.getElementById('rx-l').innerHTML=L.map(function(x){return '<a class="rx-c" href="'+E(x.u)+'"><span style="background-image:url(\''+E(x.img)+'\')"></span><b>'+E(x.n)+'</b><small>'+E(x.b)+'</small><em>'+(x.p?'a partir de R$ '+Math.round(x.p).toLocaleString('pt-BR'):'Valores sob consulta')+'</em></a>'}).join('')||'<p>Em breve.</p>'});
  }
})();

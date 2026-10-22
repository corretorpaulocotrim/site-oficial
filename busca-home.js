/* =====================================================
   BUSCA DA HOME — filtros por bairro, tipo, tamanho, prazo e valor
   Fonte: data/flow-catalogo.json + data/sawala-oportunidades.json
   (valor/entrega de referência Sawala quando houver)
   ===================================================== */
(function(){
  var box=document.getElementById('busca-home');if(!box)return;
  var MS=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  var HOJE=new Date().toISOString().slice(0,7);
  function N(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
  function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function R(v){return 'R$ '+Math.round(v).toLocaleString('pt-BR')}
  function num(s){var m=String(s||'').replace(/\./g,'').match(/\d+(,\d+)?/);return m?parseFloat(m[0].replace(',','.')):0}
  function tipos(x){var s=N(x.q+' '+x.t+' '+x.a),r=[];
    if(/studio|loft|double/.test(s))r.push('S');
    var q=(x.q||'').match(/\d/g)||[];q.forEach(function(d){d=+d;if(d>=1&&d<=4&&r.indexOf(String(d))<0)r.push(String(d));if(d>4&&r.indexOf('4')<0)r.push('4')});
    if(/cobertura/.test(s))r.push('C');if(/casa/.test(s))r.push('K');if(/lote|terreno/.test(s))r.push('L');if(/comercial|sala|loja/.test(s))r.push('M');
    return r}
  function prazo(x){if(x.pronto)return 'P';if(!x.e)return '';if(x.e<=HOJE)return 'P';var y=+x.e.slice(0,4);return y<=2027?'27':(y==2028?'28':'29')}
  var D=[];
  box.innerHTML='<div class="bh-f">'+
   '<label><span>Bairro</span><select id="bh-b"><option value="">Todos</option></select></label>'+
   '<label><span>Tipo</span><select id="bh-t"><option value="">Qualquer</option><option value="S">Studio</option><option value="1">1 quarto</option><option value="2">2 quartos</option><option value="3">3 quartos</option><option value="4">4+ quartos</option><option value="C">Cobertura</option><option value="K">Casa</option><option value="L">Lote</option><option value="M">Comercial</option></select></label>'+
   '<label><span>Tamanho</span><select id="bh-m"><option value="">Qualquer</option><option value="0-40">Até 40 m²</option><option value="40-70">40 a 70 m²</option><option value="70-120">70 a 120 m²</option><option value="120-9999">Acima de 120 m²</option></select></label>'+
   '<label><span>Prazo</span><select id="bh-p"><option value="">Qualquer</option><option value="P">Pronto para morar</option><option value="27">Entrega até 2027</option><option value="28">Entrega em 2028</option><option value="29">2029 em diante</option></select></label>'+
   '<label><span>Valor</span><select id="bh-v"><option value="">Qualquer</option><option value="0-500000">Até R$ 500 mil</option><option value="500000-1000000">R$ 500 mil a 1 mi</option><option value="1000000-3000000">R$ 1 a 3 mi</option><option value="3000000-1e12">Acima de R$ 3 mi</option></select></label>'+
   '</div><label class="bh-ck"><input type="checkbox" id="bh-sv"> Mostrar também empreendimentos com valor sob consulta</label><p class="bh-n" id="bh-n">Carregando empreendimentos…</p><div class="bh-g" id="bh-g"></div><button type="button" class="bh-mais" id="bh-mais" hidden>Ver mais</button>';
  var $=function(i){return document.getElementById(i)},LIM=12;
  function render(){
    var b=$('bh-b').value,t=$('bh-t').value,m=$('bh-m').value,p=$('bh-p').value,v=$('bh-v').value,q=N((document.getElementById('hs-q')||{}).value);
    var mm=m?m.split('-').map(Number):null,vv=v?v.split('-').map(Number):null;
    var L=D.filter(function(x){
      if(b&&x.b!==b)return false;if(t&&x.tp.indexOf(t)<0)return false;
      if(mm&&!(x.amin&&x.amax>=mm[0]&&x.amin<=mm[1]))return false;
      if(p&&x.pz!==p)return false;if(vv&&!(x.p&&x.p>=vv[0]&&x.p<=vv[1]))return false;
      if(q&&N(x.n+' '+x.b+' '+x.i).indexOf(q)<0)return false;if(!$('bh-sv').checked&&!x.p)return false;return true});
    $('bh-n').textContent=L.length+(L.length===1?' empreendimento encontrado':' empreendimentos encontrados');
    $('bh-g').innerHTML=L.slice(0,LIM).map(function(x){
      var ent=x.pz==='P'?'Pronto para morar':(x.e?'Entrega '+MS[+x.e.slice(5,7)-1]+'/'+x.e.slice(0,4):'Lançamento');
      return '<a class="bh-c" href="'+E(x.u)+'"><span class="bh-ph" style="background-image:url(\''+E(x.img)+'\')"></span><span class="bh-tx"><b>'+E(x.n)+'</b><small>'+E(x.b+(x.i?' · '+x.i:''))+'</small><em>'+E([x.q,x.a].filter(Boolean).join(' · '))+'</em><span class="bh-tg">'+E(ent)+'</span>'+(x.p?'<span class="bh-pr">a partir de '+R(x.p)+'</span>':'')+'</span></a>'}).join('');
    $('bh-mais').hidden=L.length<=LIM;
  }
  function J(u,k){return fetch(u).then(function(r){return r.json()}).then(function(j){return j[k]||[]}).catch(function(){return[]})}
  Promise.all([J('data/flow-catalogo.json','itens'),J('data/sawala-oportunidades.json','itens'),J('data/catalogo.json','itens'),J('data/mapa.json','pontos')]).then(function(a){
    var op=a[1],PU={};
    a[2].forEach(function(c){if(c.url&&c.preco)PU[c.url]=c.preco});a[3].forEach(function(c){if(c.u&&c.preco&&!PU[c.u])PU[c.u]=c.preco});
    var urls={};a[0].forEach(function(x){if(x.u)urls[x.u]=1});
    // empreendimentos do catalogo do site que nao estao no catalogo Flow (ex.: MCMV)
    a[2].forEach(function(c){if(c.url&&!urls[c.url])a[0].push({n:c.nome,b:c.local||'',i:c.incorporadora||'',q:c.plantas||'',a:c.plantas||'',e:'',p:c.preco||0,u:c.url,img:c.img,t:''})});
    D=a[0].filter(function(x){return x.u}).map(function(x){if(!x.p&&PU[x.u])x.p=PU[x.u];return x}).map(function(x){
      var o=op.find(function(y){var k=N(y.nome);return k.length>3&&(N(x.n)===k||N(x.n).indexOf(k)===0)&&y.bairro===x.b});
      var ar=String(x.a||'').replace(/m2|m²/g,'').match(/\d+(,\d+)?/g)||[],nums=ar.map(function(s){return parseFloat(s.replace(',','.'))}).filter(function(n){return n>=15&&n<5000});
      var r={n:x.n,b:x.b||'',i:x.i||'',q:(x.q&&x.q!=='0')?x.q:'',a:(x.a&&x.a!=='0')?x.a:'',e:o&&o.entrega||x.e||'',p:o&&o.preco||x.p||0,u:x.u,img:x.img,pronto:o&&o.status==='Pronto',amin:nums.length?Math.min.apply(0,nums):0,amax:nums.length?Math.max.apply(0,nums):0};
      if(!/\d/.test(r.q)&&x.t)r.q=r.q||x.t;r.tp=tipos({q:r.q,t:x.t,a:r.a});r.pz=prazo(r);return r});
    D.sort(function(a,b){return (b.p?1:0)-(a.p?1:0)||a.n.localeCompare(b.n)});
    var bs={};D.forEach(function(x){if(x.b)bs[x.b]=(bs[x.b]||0)+1});
    $('bh-b').innerHTML+=Object.keys(bs).sort(function(a,b){return a.localeCompare(b)}).map(function(k){return '<option>'+E(k)+'</option>'}).join('');
    ['bh-b','bh-t','bh-m','bh-p','bh-v','bh-sv'].forEach(function(i){$(i).addEventListener('change',function(){LIM=12;render()})});
    var hq=document.getElementById('hs-q');if(hq)hq.addEventListener('input',function(){LIM=12;render()});
    $('bh-mais').addEventListener('click',function(){LIM+=12;render()});
    render();
  }).catch(function(){$('bh-n').textContent='Não foi possível carregar a lista agora.'});
})();

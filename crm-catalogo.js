/* Catálogo único: o CRM usa o mesmo data/catalogo.json do site (fonte única). */
(function(){
  var VER='sawala-2026-10-v2';
  function brl(v){return 'A partir de R$ '+Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
  function badge(s){return s==='Pronto'?'ib-pronto':(s==='Em obras'?'ib-obras':'ib-lanc');}
  function mes(d){if(!d)return '';var p=d.split('-'),m=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];return m[+p[1]-1]+'/'+p[0];}
  function build(c){
    return c.map(function(e,i){
      var st=e.status||'Lançamento';
      return {id:(e.sid||(100000+i)),nome:e.nome,loc:(e.local||e.regiao||''),regiao:e.regiao||'',status:st,badge:badge(st),
        preco:e.preco?brl(e.preco):'Consulte',roi:e.plantas||'',urg:(e.lanc&&st!=='Pronto'?'Lançamento '+mes(e.lanc):''),
        tags:[e.incorporadora||'Consulte'],icon:'&#127970;',rendaMin:e.preco?Math.round(e.preco*0.0095):0,end:(e.local||''),
        url:'/'+e.url,img:'/'+e.img,fonte:'catalogo'};
    });
  }
  function run(){
    try{
      if(localStorage.getItem('crm_im_ver')===VER)return;
      fetch('/data/catalogo.json?v='+VER,{cache:'no-store'}).then(function(r){return r.json();}).then(function(d){
        var novos=build((d&&d.itens)||[]); if(!novos.length)return;
        var meus=[];try{meus=JSON.parse(localStorage.getItem('crm_imoveis')||'[]').filter(function(x){return x&&x.id>1e12;});}catch(e){}
        localStorage.setItem('crm_imoveis',JSON.stringify(novos.concat(meus)));
        localStorage.setItem('crm_im_ver',VER);
        if(typeof window.renderImoveis==='function'){try{window._imLim=60;window.renderImoveis();}catch(e){}}
      }).catch(function(){});
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();

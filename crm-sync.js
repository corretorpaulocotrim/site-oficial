/* =====================================================
   CRM SYNC — mesma base no PC e no celular.
   Toda alteracao (etapa, anotacao, retorno, ligacao, mensagem, exclusao)
   vai para a planilha em ate 3 s; a cada 90 s (e ao voltar para a aba)
   o CRM puxa o que mudou no outro aparelho. Vence a alteracao mais recente.
   ===================================================== */
(function(){
  if(typeof crmPost!=='function'||typeof getLeads!=='function'||typeof saveLeads!=='function')return;
  function legado(){try{return sessionStorage.getItem('crm_legado')==='1'}catch(e){return false}}
  function cred(){return typeof crmCred==='function'?crmCred():{usuario:'',senha:''}}
  function key(l){var c={};for(var k in l)if(k!=='upd')c[k]=l[k];return JSON.stringify(c)}
  var snap={},fila={},timer=null,orig=window.saveLeads;
  (getLeads()||[]).forEach(function(l){snap[l.id]=key(l)});
  var DEL={};try{JSON.parse(localStorage.getItem('crm_del')||'[]').forEach(function(d){DEL[d]=1})}catch(e){}

  window.pcSyncStatus='';
  function status(t){window.pcSyncStatus=t;var e=document.getElementById('pc-sync');if(e)e.textContent=t}

  window.saveLeads=function(a){
    var now=Date.now(),vistos={};
    (a||[]).forEach(function(l){vistos[l.id]=1;var k=key(l);if(snap[l.id]!==k){l.upd=now;fila[l.id]=l;snap[l.id]=k}});
    Object.keys(snap).forEach(function(id){if(!vistos[id]){fila[id]={id:isNaN(+id)?id:+id,_del:true};DEL[id]=1;delete snap[id]}});
    try{localStorage.setItem('crm_del',JSON.stringify(Object.keys(DEL).slice(-3000)))}catch(e){}
    clearTimeout(timer);timer=setTimeout(enviar,2500);
    return orig.apply(this,arguments);
  };

  function enviar(){
    var c=cred();if(!c.usuario||legado()){status('Salvo só neste aparelho');return}
    var arr=Object.keys(fila).map(function(k){var x=fila[k];if(x.hist&&x.hist.length>60){var y={};for(var p in x)y[p]=x[p];y.hist=x.hist.slice(0,60);x=y}return x});
    if(!arr.length)return;fila={};status('Salvando…');
    var lotes=[];while(arr.length)lotes.push(arr.splice(0,400));
    (function prox(){var b=lotes.shift();if(!b){status('Salvo na nuvem ✓');return}
      crmPost({acao:'salvar',usuario:c.usuario,senha:c.senha,leads:b}).then(function(j){
        if(j&&j.ok)return prox();
        b.concat([].concat.apply([],lotes)).forEach(function(x){fila[x.id]=x});
        status(!j?'Sem internet — tento de novo':j.err==='login'?'Entre de novo para salvar':j.err==='token'?'Atualize o Apps Script':'Erro ao salvar — tento de novo');
        setTimeout(enviar,30000);
      });
    })();
  }

  function refresh(){['renderLeads','renderDash','updateBadge','atualizarBadgeHoje','renderPipeline'].forEach(function(f){try{if(typeof window[f]==='function')window[f]()}catch(e){}});if(window.pcRefresh)window.pcRefresh()}

  var puxando=false;
  function puxar(){
    var c=cred();if(!c.usuario||legado()||puxando)return;puxando=true;
    crmPost({acao:'leads',usuario:c.usuario,senha:c.senha}).then(function(j){
      puxando=false;if(!j||!j.ok){if(j&&j.err==='login')status('Entre de novo para sincronizar');return}
      var L=getLeads()||[],idx={},mudou=0,rem={};L.forEach(function(l,i){idx[l.id]=i});
      (j.leads||[]).forEach(function(r){
        if(r.id===''||r.id==null||DEL[r.id])return;var x=null;
        if(r.dados){try{x=JSON.parse(r.dados)}catch(e){}}
        if(x)rem[x.id]=1;
        if(!x)x={id:Number(r.id)||r.id,nome:r.nome||'Lead',tel:String(r.telefone||''),email:r.email||'',origem:r.origem||'Site',interesse:r.interesse||'',temp:r.temp||'morno',status:r.status||'novo',orcamento:r.renda||'',obs:r.obs||'',data:r.data?new Date(r.data).toLocaleDateString('pt-BR'):'',hist:[{a:'Lead do site',d:r.origem||'',t:r.data?new Date(r.data).toLocaleString('pt-BR'):''}],upd:0};
        var i=idx[x.id];
        if(i===undefined){idx[x.id]=L.length;L.push(x);mudou++}
        else if((+x.upd||0)>(+L[i].upd||0)){L[i]=x;mudou++}
      });
      if(mudou){orig(L);L.forEach(function(l){snap[l.id]=key(l)});refresh()}
      // primeira vez neste aparelho: envia para a nuvem o que so existe aqui
      if(!localStorage.getItem('crm_sync2')){L.forEach(function(l){if(!rem[l.id])fila[l.id]=l});localStorage.setItem('crm_sync2','1');enviar()}
      if(!Object.keys(fila).length)status('Sincronizado ✓ '+new Date().toLocaleTimeString('pt-BR').slice(0,5));
    });
  }
  window.crmSync=function(){puxar()};
  setTimeout(puxar,1500);setInterval(puxar,90000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)puxar()});
  window.addEventListener('beforeunload',function(){if(Object.keys(fila).length)enviar()});
})();

/* =====================================================
   CRM PLUS — tema de luxo (identidade Paulo Cotrim) +
   na ficha do cliente: oportunidades sugeridas e mensagens
   prontas de WhatsApp por etapa.
   ===================================================== */
(function(){
  var st=document.createElement('style');
  st.textContent=':root{--navy:#0f2e36!important;--navy2:#0b2228!important;--navy3:#0f2e36!important;--gold:#cf9f4f!important;--gold2:#e6c581!important;--green:#1a8f4c!important;--text:#0f2e36!important;--muted:#6b7774!important;--border:#e3d9c6!important}'+
  'body{background:#f4efe6!important}h1,h2,h3,.page-title,.kpi-val{font-family:Fraunces,Georgia,serif!important}'+
  '.btn-primary,.btn-sm.green{background:#1a8f4c!important;border-color:#1a8f4c!important;color:#fff!important}'+
  '#p-ops{margin-top:14px;border-top:1px solid #e3d9c6;padding-top:12px}#p-ops h4{font:600 15px Fraunces,Georgia,serif;color:#0f2e36;margin:0 0 8px}'+
  '.pop{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:9px 10px;border:1px solid #e3d9c6;border-radius:10px;margin-bottom:7px;background:#fff}'+
  '.pop b{display:block;font-size:13.5px;color:#0f2e36}.pop small{color:#6b7774;font-size:12px}.pop button,.pmsg button{background:#1a8f4c;color:#fff;border:0;border-radius:20px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap}'+
  '.pmsg{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 4px}.pmsg button{background:#0f2e36;color:#e6c581}'+
  '@media(max-width:700px){.pop{flex-direction:column;align-items:flex-start}}';
  document.head.appendChild(st);

  var OP=[];fetch('/data/sawala-oportunidades.json').then(function(r){return r.json()}).then(function(j){OP=j.itens||[]}).catch(function(){});
  var MS=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  function N(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
  function R(v){return 'R$ '+Math.round(v).toLocaleString('pt-BR')}
  function ent(o){return o.status==='Pronto'?'pronto para morar':(o.entrega?'entrega '+MS[+o.entrega.slice(5,7)-1]+'/'+o.entrega.slice(0,4):'lançamento')}
  function url(o){return 'https://www.paulocotrim.com/'+(o.url&&o.url.indexOf('ficha-')===0?o.url:'oportunidades.html')}
  function wa(l,txt){var t=String(l.tel||'').replace(/\D/g,'');if(t&&t.length<=11)t='55'+t;window.open('https://wa.me/'+t+'?text='+encodeURIComponent(txt),'_blank')}
  // sugestao: bairro citado no interesse/obs primeiro; teto de valor so quando o orcamento informado for um valor de imovel
  function sugere(l){
    var h=N([l.interesse,l.obs,l.orcamento].join(' ')),teto=parseFloat(String(l.orcamento||'').replace(/[^\d,]/g,'').replace(',','.'))||0;
    if(teto<50000)teto=0;
    return OP.map(function(o){var s=0;if(h.indexOf(N(o.bairro))>-1)s+=10;if(teto&&o.preco<=teto*1.1)s+=5;if(teto&&o.preco>teto*1.3)s-=8;return {o:o,s:s}})
      .filter(function(x){return x.s>=0}).sort(function(a,b){return b.s-a.s||a.o.preco-b.o.preco}).slice(0,5).map(function(x){return x.o});
  }
  var orig=window.verPerfil;if(typeof orig!=='function')return;
  window.verPerfil=function(id){
    orig.apply(this,arguments);
    var l=(getLeads()||[]).find(function(x){return x.id===id});var sub=document.getElementById('p-sub');if(!l||!sub)return;
    var box=document.getElementById('p-ops');if(!box){box=document.createElement('div');box.id='p-ops';sub.parentNode.appendChild(box)}
    var nome=(l.nome||'').split(' ')[0];
    var M=[['Primeiro contato','Olá '+nome+'! Aqui é o Paulo Cotrim, corretor no Rio (CRECI-RJ 77677-F). Vi seu interesse em imóvel e separei opções no seu perfil. Prefere que eu te mande por aqui?'],
      ['Follow-up','Oi '+nome+', tudo bem? Passando para saber se conseguiu ver as opções que te mandei. Quer que eu faça a simulação de financiamento CAIXA para você?'],
      ['Agendar visita','Oi '+nome+'! Tenho horários para visita esta semana. Fica melhor durante a semana ou no sábado?']];
    var S=sugere(l);
    box.innerHTML='<div class="pmsg">'+M.map(function(m,i){return '<button type="button" data-m="'+i+'">'+m[0]+'</button>'}).join('')+'</div>'+
      (S.length?'<h4>Oportunidades para este cliente</h4>'+S.map(function(o,i){return '<div class="pop"><span><b>'+o.nome+'</b><small>'+o.bairro+' · a partir de '+R(o.preco)+' · '+ent(o)+'</small></span><button type="button" data-o="'+i+'">Enviar no WhatsApp</button></div>'}).join(''):'');
    box.onclick=function(e){var b=e.target.closest('button');if(!b)return;
      if(b.dataset.m)wa(l,M[+b.dataset.m][1]);
      if(b.dataset.o){var o=S[+b.dataset.o];wa(l,'Oi '+nome+'! Separei este para você: '+o.nome+' ('+o.bairro+'), a partir de '+R(o.preco)+', '+ent(o)+'. Ficha completa: '+url(o)+' — quer que eu te mande o resumo em PDF?');
        try{var L=getLeads(),x=L.find(function(y){return y.id===id});if(x){(x.hist=x.hist||[]).unshift({a:'Enviou oportunidade',d:o.nome,t:new Date().toLocaleString('pt-BR')});saveLeads(L)}}catch(er){}}
    };
  };
})();

/* CONTADOR DE ATENDIMENTO: ligacoes e mensagens por cliente (fica na ficha e no historico) */
(function(){
  function conta(id,tipo){
    try{var L=getLeads(),x=L.find(function(y){return y.id===id});if(!x)return;
      x.cont=x.cont||{l:0,m:0};x.cont[tipo]++;
      (x.hist=x.hist||[]).unshift({a:tipo==='l'?'Ligou':'Enviou mensagem',d:'',t:new Date().toLocaleString('pt-BR')});
      saveLeads(L);}catch(e){}
  }
  var oL=window.ligar,oZ=window.zap;
  if(typeof oL==='function')window.ligar=function(id){conta(id,'l');return oL.apply(this,arguments)};
  if(typeof oZ==='function')window.zap=function(id){conta(id,'m');return oZ.apply(this,arguments)};
  var oV=window.verPerfil;
  if(typeof oV==='function')window.verPerfil=function(id){oV.apply(this,arguments);
    var l=(getLeads()||[]).find(function(x){return x.id===id});var b=document.getElementById('p-ops');
    if(!l||!b)return;var c=l.cont||{l:0,m:0};
    var d=document.createElement('div');d.style.cssText='margin:0 0 8px;font-weight:600;color:#0f2e36';
    d.textContent='📞 '+c.l+' ligações · 💬 '+c.m+' mensagens';b.insertBefore(d,b.firstChild);};
})();

/* LEMBRETES DE RETORNO: data de retorno por cliente + contador "Retornos de hoje" na lateral */
(function(){
  var HOJE=function(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  function vencidos(){return (getLeads()||[]).filter(function(l){return l.retorno&&l.retorno<=HOJE()}).length}
  function badge(){
    var b=document.getElementById('pc-retornos');
    if(!b){b=document.createElement('div');b.id='pc-retornos';b.style.cssText='margin:10px 14px;padding:10px 12px;border:1px solid #cf9f4f;border-radius:12px;color:#e6c581;font:600 13px Inter,Arial,sans-serif;cursor:pointer';var side=document.querySelector('aside')||document.querySelector('nav')||document.body;side.insertBefore(b,side.firstChild);b.onclick=function(){if(typeof renderHoje==='function'){goPage&&goPage('hoje')}}}
    var n=vencidos();b.textContent=n?('🔔 '+n+' retorno(s) para hoje'):'🔔 Nenhum retorno para hoje';
  }
  var oV=window.verPerfil;
  if(typeof oV==='function')window.verPerfil=function(id){oV.apply(this,arguments);
    var b=document.getElementById('p-ops');var l=(getLeads()||[]).find(function(x){return x.id===id});if(!b||!l)return;
    var w=document.createElement('div');w.style.cssText='margin:10px 0;display:flex;gap:8px;align-items:center;font:600 13px Inter,Arial,sans-serif;color:#0f2e36';
    w.innerHTML='Retornar em: <input type="date" value="'+(l.retorno||'')+'" style="padding:6px;border:1px solid #e3d9c6;border-radius:8px"> <button type="button" style="background:#0f2e36;color:#e6c581;border:0;border-radius:20px;padding:6px 12px;cursor:pointer">Salvar</button>';
    b.insertBefore(w,b.firstChild);
    w.querySelector('button').onclick=function(){var v=w.querySelector('input').value;var L=getLeads(),x=L.find(function(y){return y.id===id});if(x){x.retorno=v;saveLeads(L);badge();toast&&toast(v?'Retorno marcado para '+v.split('-').reverse().join('/'):'Retorno removido')}};
  };
  setTimeout(badge,1200);setTimeout(badge,3000);
})();

/* QUADRO DE LEADS (etapas): Novo > Contatado > Proposta > Visita > Fechado, com ligar/WhatsApp direto no card */
(function(){
  var COL=[['novo','Novo'],['contato','Contatado'],['proposta','Proposta'],['visita','Visita'],['fechado','Fechado'],['perdido','Perdido']];
  function ab(){
    var pg=document.getElementById('pc-quadro');if(pg)return pg.style.display='flex';
    pg=document.createElement('div');pg.id='pc-quadro';
    pg.style.cssText='position:fixed;inset:0;z-index:9990;background:#f4efe6;display:flex;flex-direction:column;font:14px Inter,Arial,sans-serif;color:#0f2e36';
    pg.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#0f2e36;color:#e6c581"><b style="font:600 20px Fraunces,Georgia,serif">Quadro de leads</b><button type="button" id="pcq-x" style="background:none;border:0;color:#e6c581;font-size:26px;cursor:pointer">×</button></div><div id="pcq-b" style="flex:1;overflow:auto;display:flex;gap:10px;padding:12px;align-items:flex-start"></div>';
    document.body.appendChild(pg);document.getElementById('pcq-x').onclick=function(){pg.style.display='none'};
    draw();
  }
  function st(l){return l.status||'novo'}
  function mover(id,to){var L=getLeads(),x=L.find(function(y){return y.id===id});if(!x)return;x.status=to;(x.hist=x.hist||[]).unshift({a:'Etapa: '+to,d:'',t:new Date().toLocaleString('pt-BR')});saveLeads(L);draw()}
  function draw(){
    var box=document.getElementById('pcq-b');if(!box)return;var L=getLeads()||[];
    box.innerHTML=COL.map(function(c){
      var list=L.filter(function(l){return st(l)===c[0]});
      return '<div style="min-width:220px;flex:1;background:#fff;border:1px solid #e3d9c6;border-radius:14px;padding:10px"><div style="font:600 15px Fraunces,Georgia,serif;margin-bottom:8px">'+c[1]+' <span style="color:#8a6a2f">('+list.length+')</span></div>'+
        list.map(function(l){var i=COL.findIndex(function(z){return z[0]===st(l)});
          return '<div style="border:1px solid #e3d9c6;border-radius:10px;padding:8px;margin-bottom:8px"><b>'+(l.nome||'')+'</b><div style="color:#6b7774;font-size:12px">'+(l.tel||'')+(l.interesse?' · '+l.interesse:'')+'</div>'+
          (l.retorno?'<div style="font-size:12px;color:#8a6a2f">Retorno: '+l.retorno.split('-').reverse().join('/')+'</div>':'')+
          '<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap"><button data-m="'+l.id+'|'+(COL[i-1]||[''])[0]+'" '+(i<=0?'disabled':'')+'>‹</button><button data-m="'+l.id+'|'+(COL[i+1]||[''])[0]+'" '+(i>=COL.length-1?'disabled':'')+'>›</button><button data-l="'+l.id+'">Ligar</button><button data-w="'+l.id+'">WhatsApp</button><button data-p="'+l.id+'">Ficha</button></div></div>'}).join('')+'</div>';
      }).join('');
    box.querySelectorAll('button').forEach(function(b){b.style.cssText='background:#0f2e36;color:#e6c581;border:0;border-radius:14px;padding:4px 8px;font-size:12px;cursor:pointer';if(b.disabled)b.style.opacity='.35'});
    box.onclick=function(e){var b=e.target.closest('button');if(!b||b.disabled)return;
      if(b.dataset.m){var p=b.dataset.m.split('|');mover(+p[0]||p[0],p[1]);return}
      var id=b.dataset.l||b.dataset.w||b.dataset.p;var x=(getLeads()||[]).find(function(y){return String(y.id)===String(id)});if(!x)return;
      if(b.dataset.l&&typeof ligar==='function')ligar(x.id);
      else if(b.dataset.w&&typeof zap==='function')zap(x.id);
      else if(b.dataset.p&&typeof verPerfil==='function'){document.getElementById('pc-quadro').style.display='none';verPerfil(x.id)}
    };
  }
  var hdr=document.querySelector('header,.topbar,.top-bar')||document.body;
  var b=document.createElement('button');b.type='button';b.textContent='Quadro';
  b.style.cssText='position:fixed;right:16px;top:12px;z-index:9991;background:#fff;color:#0f2e36;border:1px solid #cf9f4f;border-radius:30px;padding:9px 16px;font:600 13px Inter,Arial,sans-serif;cursor:pointer';
  b.onclick=ab;document.body.appendChild(b);
})();

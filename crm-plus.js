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


/* =====================================================
   ATENDIMENTO: painel do dia na lateral, retorno por cliente,
   quadro de etapas (arrastar no PC, setas no celular) e
   atalhos Quadro / Montar PDF no menu.
   ===================================================== */
(function(){
  function hojeISO(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  var hojeBR=new Date().toLocaleDateString('pt-BR');
  function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function N(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
  var css=document.createElement('style');
  css.textContent=
   '#pc-dia{margin:12px 14px 6px;padding:12px 14px;border:1px solid rgba(207,159,79,.55);border-radius:14px;background:rgba(207,159,79,.08);color:#f4efe6;font:500 12.5px Inter,Arial,sans-serif;cursor:pointer}'+
   '#pc-dia b{display:block;font:600 10px Inter,Arial,sans-serif;letter-spacing:.2em;color:#cf9f4f;margin-bottom:7px}'+
   '#pc-dia .n{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center}#pc-dia .n div{background:rgba(0,0,0,.25);border-radius:9px;padding:6px 2px}'+
   '#pc-dia .n i{display:block;font:600 18px Fraunces,Georgia,serif;font-style:normal;color:#e6c581}#pc-dia .n span{font-size:10.5px;color:#cfc6b6}'+
   '#pc-dia .r{margin-top:8px;color:#e6c581}#pc-dia .r.al{color:#ff9d7a}#pc-sync{display:block;margin-top:6px;font-size:10.5px;color:#9fb0ae}'+
   '#pcq{position:fixed;inset:0;z-index:9990;background:#f4efe6;display:none;flex-direction:column;font:14px Inter,Arial,sans-serif;color:#0f2e36}'+
   '#pcq .hd{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 16px;background:#0f2e36;color:#e6c581}'+
   '#pcq .hd b{font:italic 600 22px Fraunces,Georgia,serif;margin-right:auto}#pcq .hd input,#pcq .hd select{padding:9px 12px;border-radius:10px;border:1px solid rgba(230,197,129,.5);background:#0b2228;color:#f4efe6;font:inherit;min-width:0}'+
   '#pcq .hd input{flex:1 1 200px}#pcq .x{background:none;border:0;color:#e6c581;font-size:28px;line-height:1;cursor:pointer;padding:0 4px}'+
   '#pcq .bd{flex:1;overflow:auto;display:flex;gap:12px;padding:14px;scroll-snap-type:x mandatory}'+
   '#pcq .col{flex:0 0 280px;display:flex;flex-direction:column;background:#fff;border:1px solid #e3d9c6;border-radius:16px;max-height:100%;scroll-snap-align:start}'+
   '#pcq .col.over{outline:2px dashed #cf9f4f;outline-offset:-4px}#pcq .ch{padding:12px 14px;border-bottom:3px solid var(--c);font:600 15px Fraunces,Georgia,serif;display:flex;justify-content:space-between}'+
   '#pcq .ch em{font:600 12px Inter,Arial,sans-serif;font-style:normal;background:#f4efe6;border-radius:20px;padding:2px 9px}#pcq .cl{overflow:auto;padding:10px;flex:1}'+
   '#pcq .cd{border:1px solid #e3d9c6;border-left:4px solid var(--t);border-radius:12px;padding:10px 11px;margin-bottom:9px;background:#fff;cursor:grab}'+
   '#pcq .cd b{display:block;font:600 15px Fraunces,Georgia,serif}#pcq .cd small{display:block;color:#6b7774;font-size:12px;margin-top:2px}'+
   '#pcq .tg{display:inline-block;margin-top:6px;font-size:11px;font-weight:600;border-radius:20px;padding:2px 8px;background:#f4efe6;color:#8a6a2f}#pcq .tg.al{background:#fde8e1;color:#b4441d}'+
   '#pcq .ac{display:flex;gap:6px;margin-top:9px}#pcq .ac button{flex:1;border:0;border-radius:10px;padding:8px 4px;font:600 12px Inter,Arial,sans-serif;cursor:pointer;background:#0f2e36;color:#e6c581}'+
   '#pcq .ac button.w{background:#1a8f4c;color:#fff}#pcq .ac button.s{flex:0 0 34px;background:#f4efe6;color:#0f2e36}#pcq .ac button:disabled{opacity:.3}'+
   '#pcq .mais{font-size:12px;color:#6b7774;text-align:center;padding:6px}'+
   '@media(max-width:700px){#pcq .col{flex-basis:86vw}}';
  document.head.appendChild(css);

  var COL=[['novo','Novo','#9fb0ae'],['contato','Contatado','#cf9f4f'],['proposta','Proposta','#0058a3'],['visita','Visita','#8a6a2f'],['fechado','Fechado','#1a8f4c'],['perdido','Perdido','#b4441d']];
  var TEMP={quente:'#d9480f',morno:'#cf9f4f',frio:'#9fb0ae'};
  function st(l){return COL.some(function(c){return c[0]===l.status})?l.status:'novo'}
  function atrasado(l){return l.retorno&&l.retorno<=hojeISO()}
  function hoje(){var lg=0,ms=0,rt=0;(getLeads()||[]).forEach(function(l){if(atrasado(l))rt++;(l.hist||[]).forEach(function(h){if(String(h.t||'').indexOf(hojeBR)!==0)return;if(h.a==='Ligou')lg++;else if(/^Enviou/.test(h.a||''))ms++})});return{lg:lg,ms:ms,rt:rt}}

  // ---------- painel do dia ----------
  function painel(){
    var p=document.getElementById('pc-dia');
    if(!p){var ref=document.querySelector('[onclick*="goPage(\'hoje\')"]');if(!ref)return;p=document.createElement('div');p.id='pc-dia';ref.parentNode.insertBefore(p,ref);p.onclick=function(){abrir('ret')}}
    var h=hoje();
    p.innerHTML='<b>ATENDIMENTO HOJE</b><div class="n"><div><i>'+h.lg+'</i><span>ligações</span></div><div><i>'+h.ms+'</i><span>mensagens</span></div><div><i>'+h.rt+'</i><span>retornos</span></div></div>'+
      '<div class="r'+(h.rt?' al':'')+'">'+(h.rt?'🔔 '+h.rt+' cliente(s) esperando retorno — toque aqui':'✓ Nenhum retorno pendente')+'</div><span id="pc-sync">'+E(window.pcSyncStatus||'')+'</span>';
  }

  // ---------- atalhos no menu ----------
  function menu(){
    var ref=document.querySelector('.sb-link[onclick*="goPage(\'leads\')"]');if(!ref||document.getElementById('pc-mq'))return;
    [['pc-mq','▦','Quadro de leads',function(){abrir('')}],['pc-mp','📄','Montar PDF',function(){if(window.pcAbrirPdf)pcAbrirPdf()}]].reverse().forEach(function(m){
      var d=ref.cloneNode(false);d.id=m[0];d.removeAttribute('onclick');d.classList.remove('active');
      d.innerHTML='<span class="sb-icon">'+m[1]+'</span> '+m[2];d.onclick=m[3];ref.parentNode.insertBefore(d,ref.nextSibling);
    });
  }

  // ---------- retorno na ficha ----------
  var oV=window.verPerfil;
  if(typeof oV==='function')window.verPerfil=function(id){oV.apply(this,arguments);
    var b=document.getElementById('p-ops');var l=(getLeads()||[]).find(function(x){return x.id===id});if(!b||!l)return;
    var w=document.createElement('div');w.style.cssText='margin:4px 0 10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font:600 13px Inter,Arial,sans-serif;color:#0f2e36';
    w.innerHTML='🔔 Retornar em <input type="date" value="'+E(l.retorno||'')+'" style="padding:7px;border:1px solid #e3d9c6;border-radius:9px;font:inherit"><button type="button" style="background:#0f2e36;color:#e6c581;border:0;border-radius:20px;padding:7px 14px;cursor:pointer">Salvar</button>';
    b.insertBefore(w,b.firstChild);
    w.querySelector('button').onclick=function(){var v=w.querySelector('input').value,L=getLeads(),x=L.find(function(y){return y.id===id});if(!x)return;x.retorno=v;if(v)(x.hist=x.hist||[]).unshift({a:'Retorno agendado',d:v.split('-').reverse().join('/'),t:new Date().toLocaleString('pt-BR')});saveLeads(L);painel();if(typeof toast==='function')toast(v?'Retorno marcado para '+v.split('-').reverse().join('/'):'Retorno removido')};
  };

  // ---------- quadro ----------
  var filtro='',busca='';
  function abrir(f){
    var q=document.getElementById('pcq');
    if(!q){q=document.createElement('div');q.id='pcq';
      q.innerHTML='<div class="hd"><b>Quadro de leads</b><input id="pcq-s" type="search" placeholder="Buscar nome ou telefone"><select id="pcq-f"><option value="">Todos</option><option value="ret">Retorno hoje / atrasado</option><option value="quente">Quentes</option><option value="morno">Mornos</option><option value="frio">Frios</option></select><button class="x" type="button" aria-label="Fechar">×</button></div><div class="bd" id="pcq-b"></div>';
      document.body.appendChild(q);
      q.querySelector('.x').onclick=function(){q.style.display='none';painel()};
      document.getElementById('pcq-s').oninput=function(){busca=this.value;draw()};
      document.getElementById('pcq-f').onchange=function(){filtro=this.value;draw()};
      var bd=document.getElementById('pcq-b');
      bd.addEventListener('click',clique);
      bd.addEventListener('dragstart',function(e){var c=e.target.closest('.cd');if(c)e.dataTransfer.setData('text/plain',c.dataset.id)});
      bd.addEventListener('dragover',function(e){var c=e.target.closest('.col');if(c){e.preventDefault();c.classList.add('over')}});
      bd.addEventListener('dragleave',function(e){var c=e.target.closest('.col');if(c)c.classList.remove('over')});
      bd.addEventListener('drop',function(e){var c=e.target.closest('.col');if(!c)return;e.preventDefault();c.classList.remove('over');mover(e.dataTransfer.getData('text/plain'),c.dataset.s)});
    }
    filtro=f||'';document.getElementById('pcq-f').value=filtro;q.style.display='flex';draw();
  }
  function mover(id,to){if(!to)return;var L=getLeads(),x=L.find(function(y){return String(y.id)===String(id)});if(!x||st(x)===to)return;x.status=to;(x.hist=x.hist||[]).unshift({a:'Etapa: '+to,d:'',t:new Date().toLocaleString('pt-BR')});saveLeads(L);draw()}
  function draw(){
    var bd=document.getElementById('pcq-b');if(!bd||document.getElementById('pcq').style.display==='none')return;
    var q=N(busca.trim()),dg=busca.replace(/\D/g,'');
    var L=(getLeads()||[]).filter(function(l){
      if(filtro==='ret'&&!atrasado(l))return false;if(filtro&&filtro!=='ret'&&l.temp!==filtro)return false;
      if(q&&N(l.nome).indexOf(q)<0&&!(dg.length>=3&&String(l.tel||'').replace(/\D/g,'').indexOf(dg)>-1))return false;return true});
    bd.innerHTML=COL.map(function(c,ci){
      var list=L.filter(function(l){return st(l)===c[0]}).sort(function(a,b){return (atrasado(b)?1:0)-(atrasado(a)?1:0)||(+b.upd||0)-(+a.upd||0)});
      if((filtro||busca.trim())&&!list.length)return '';
      return '<div class="col" data-s="'+c[0]+'" style="--c:'+c[2]+'"><div class="ch">'+c[1]+'<em>'+list.length+'</em></div><div class="cl">'+
        list.slice(0,120).map(function(l){var k=l.cont||{l:0,m:0};
          return '<div class="cd" draggable="true" data-id="'+E(l.id)+'" style="--t:'+(TEMP[l.temp]||'#e3d9c6')+'"><b>'+E(l.nome)+'</b><small>'+E(l.tel)+(l.interesse?' · '+E(l.interesse):'')+'</small>'+
            (l.retorno?'<span class="tg'+(atrasado(l)?' al':'')+'">Retorno '+E(l.retorno.split('-').reverse().join('/'))+'</span> ':'')+((k.l||k.m)?'<span class="tg">'+k.l+' lig. · '+k.m+' msg</span>':'')+
            '<div class="ac"><button class="s" data-m="'+(COL[ci-1]||[''])[0]+'"'+(ci?'':' disabled')+' aria-label="Etapa anterior">‹</button><button data-a="l">Ligar</button><button class="w" data-a="w">WhatsApp</button><button data-a="p">Ficha</button><button class="s" data-m="'+(COL[ci+1]||[''])[0]+'"'+(ci<COL.length-1?'':' disabled')+' aria-label="Próxima etapa">›</button></div></div>'}).join('')+
        (list.length>120?'<div class="mais">+'+(list.length-120)+' — use a busca</div>':'')+'</div></div>'}).join('');
  }
  function clique(e){var b=e.target.closest('button');if(!b||b.disabled)return;var cd=b.closest('.cd');if(!cd)return;var id=cd.dataset.id;
    if(b.dataset.m!==undefined)return mover(id,b.dataset.m);
    var x=(getLeads()||[]).find(function(y){return String(y.id)===id});if(!x)return;
    if(b.dataset.a==='l'&&typeof ligar==='function')ligar(x.id);
    else if(b.dataset.a==='w'&&typeof zap==='function')zap(x.id);
    else if(b.dataset.a==='p'&&typeof verPerfil==='function'){document.getElementById('pcq').style.display='none';verPerfil(x.id)}
    setTimeout(function(){draw();painel()},300);
  }
  window.pcAbrirQuadro=abrir;
  window.pcRefresh=function(){painel();draw()};
  function init(){menu();painel()}
  setTimeout(init,600);setTimeout(init,2500);setInterval(painel,60000);
})();

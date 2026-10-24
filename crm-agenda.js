/* =====================================================
   ROTINA DO DIA — pendencias (clientes, ADM, marketing, pessoal),
   ideias para Instagram/redes e banco de fotos de marketing.
   Pendencias e ideias sincronizam PC/celular junto com o CRM
   (registro especial id "pc-agenda"). Fotos ficam no aparelho.
   ===================================================== */
(function(){
  var KEY='crm_agenda',A=load();
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||{t:[],i:[],upd:0}}catch(e){return{t:[],i:[],upd:0}}}
  function save(){A.upd=Date.now();localStorage.setItem(KEY,JSON.stringify(A));clearTimeout(save.t);save.t=setTimeout(nuvem,2500);desenha()}
  function cred(){return typeof crmCred==='function'?crmCred():{}}
  function nuvem(){var c=cred();if(!c.usuario||typeof crmPost!=='function')return;crmPost({acao:'salvar',usuario:c.usuario,senha:c.senha,leads:[{id:'pc-agenda',nome:'(agenda do corretor)',status:'agenda',agenda:A,upd:A.upd}]})}
  window.pcAgendaRemota=function(x){if(x&&x.agenda&&(+x.upd||0)>(+A.upd||0)){A=x.agenda;A.upd=x.upd;localStorage.setItem(KEY,JSON.stringify(A));desenha()}};
  function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function hoje(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  var CAT={cliente:'Clientes',adm:'ADM',mkt:'Marketing',pessoal:'Pessoal'},ABA='t';

  // ---------- fotos: IndexedDB (ficam neste aparelho) ----------
  var db=null;function idb(cb){if(db)return cb(db);var r=indexedDB.open('pc-fotos',1);r.onupgradeneeded=function(){r.result.createObjectStore('f',{keyPath:'id'})};r.onsuccess=function(){db=r.result;cb(db)};r.onerror=function(){cb(null)}}
  function fotos(cb){idb(function(d){if(!d)return cb([]);var o=[],q=d.transaction('f').objectStore('f').openCursor();q.onsuccess=function(){var c=q.result;if(c){o.push(c.value);c.continue()}else cb(o.sort(function(a,b){return b.id-a.id}))}})}
  function addFoto(file,leg){var rd=new FileReader();rd.onload=function(){var im=new Image();im.onload=function(){var k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    var u=c.toDataURL('image/jpeg',.85);idb(function(d){if(!d)return;d.transaction('f','readwrite').objectStore('f').put({id:Date.now()+Math.random(),u:u,leg:leg||'',data:new Date().toLocaleDateString('pt-BR')}).oncomplete=desenha})};im.src=rd.result};rd.readAsDataURL(file)}
  function delFoto(id){idb(function(d){d.transaction('f','readwrite').objectStore('f').delete(+id).oncomplete=desenha})}

  var css=document.createElement('style');css.textContent=
   '#pca{position:fixed;inset:0;z-index:9992;background:#f4efe6;display:none;flex-direction:column;font:14px Inter,Arial,sans-serif;color:#0f2e36}'+
   '#pca .hd{display:flex;align-items:center;gap:10px;padding:12px 16px;background:#0f2e36;color:#e6c581}#pca .hd b{font:italic 600 22px Fraunces,Georgia,serif;margin-right:auto}#pca .x{background:none;border:0;color:#e6c581;font-size:28px;cursor:pointer}'+
   '#pca .tb{display:flex;gap:6px;padding:10px 16px;background:#0b2228;overflow:auto}#pca .tb button{border:1px solid rgba(230,197,129,.4);background:none;color:#e6c581;border-radius:20px;padding:8px 14px;font:600 13px Inter,Arial,sans-serif;white-space:nowrap;cursor:pointer}#pca .tb button.on{background:#e6c581;color:#0f2e36}'+
   '#pca .bd{flex:1;overflow:auto;padding:14px 16px;max-width:900px;width:100%;margin:0 auto}#pca .nw{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}'+
   '#pca .nw input,#pca .nw select,#pca .nw textarea{flex:1 1 180px;padding:11px;border:1px solid #e3d9c6;border-radius:10px;font:inherit;background:#fff;min-width:0}#pca .nw textarea{flex-basis:100%;min-height:70px}'+
   '#pca .nw button,#pca .ok{background:#1a8f4c;color:#fff;border:0;border-radius:22px;padding:11px 18px;font-weight:700;cursor:pointer}'+
   '#pca h4{font:600 15px Fraunces,Georgia,serif;margin:14px 0 8px}#pca .it{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid #e3d9c6;border-radius:12px;padding:10px 12px;margin-bottom:8px}'+
   '#pca .it input[type=checkbox]{width:20px;height:20px;accent-color:#1a8f4c;flex:none;margin-top:1px}#pca .it.f span{text-decoration:line-through;color:#9fb0ae}#pca .it span{flex:1}#pca .it small{display:block;color:#8a6a2f;font-size:11.5px;margin-top:2px}'+
   '#pca .it button{background:none;border:0;color:#b4441d;font-size:18px;cursor:pointer}#pca .al{color:#b4441d!important}'+
   '#pca .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}#pca .ph{background:#fff;border:1px solid #e3d9c6;border-radius:12px;overflow:hidden}#pca .ph img{width:100%;aspect-ratio:1;object-fit:cover;display:block}'+
   '#pca .ph div{padding:6px 8px;font-size:12px;display:flex;gap:6px;align-items:center}#pca .ph div span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#pca .ph a,#pca .ph button{font-size:12px;color:#0f2e36;background:none;border:0;cursor:pointer}'+
   '#pca .rs{background:#0f2e36;color:#f4efe6;border-radius:14px;padding:12px 14px;margin-bottom:12px}#pca .rs b{color:#e6c581}#pca .vz{color:#6b7774;padding:10px 2px}#pca .ac{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}#pca .ac button{background:#0f2e36;color:#e6c581;border:0;border-radius:16px;padding:7px 12px;font:600 12px Inter,Arial,sans-serif;cursor:pointer}#pca .ac button[data-la=w]{background:#1a8f4c;color:#fff}#pca .ac button[data-la=ok]{background:#e6c581;color:#0f2e36}';
  document.head.appendChild(css);

  function abrir(aba){var p=document.getElementById('pca');
    if(!p){p=document.createElement('div');p.id='pca';
      p.innerHTML='<div class="hd"><b>Rotina do dia</b><button class="x" type="button" aria-label="Fechar">×</button></div><div class="tb"><button data-a="t">Pendências</button><button data-a="i">Ideias para redes</button><button data-a="f">Fotos de marketing</button></div><div class="bd" id="pca-b"></div>';
      document.body.appendChild(p);p.querySelector('.x').onclick=function(){p.style.display='none';painel()};
      p.querySelector('.tb').onclick=function(e){var b=e.target.closest('button');if(b){ABA=b.dataset.a;desenha()}};
      p.addEventListener('click',clique);p.addEventListener('change',muda)}
    ABA=aba||ABA;p.style.display='flex';desenha()}
  function desenha(){var b=document.getElementById('pca-b');if(!b||document.getElementById('pca').style.display==='none'){painel();return}
    document.querySelectorAll('#pca .tb button').forEach(function(x){x.classList.toggle('on',x.dataset.a===ABA)});
    var h=hoje();
    if(ABA==='t'){
      var L=(typeof getLeads==='function'?getLeads():[])||[],ret=L.filter(function(l){return l.retorno&&l.retorno<=h});
      var ab=A.t.filter(function(t){return !t.ok}),ft=A.t.filter(function(t){return t.ok&&t.fim===h});
      b.innerHTML='<div class="rs"><b>Hoje:</b> '+ab.filter(function(t){return !t.dt||t.dt<=h}).length+' pendência(s) · '+ret.length+' cliente(s) para retornar'+(ret.length?' — <a href="#" data-q="1" style="color:#e6c581">abrir quadro</a>':'')+'</div>'+
        '<div class="nw"><input id="pca-tx" placeholder="Nova pendência (ex.: enviar documentos do João para a CAIXA)"><select id="pca-ct">'+Object.keys(CAT).map(function(k){return '<option value="'+k+'">'+CAT[k]+'</option>'}).join('')+'</select><input id="pca-ld" list="pca-lds" placeholder="Cliente (nome ou telefone)"><datalist id="pca-lds">'+L.slice(0,3000).map(function(l){return '<option value="'+E(l.nome)+' · '+E(l.tel)+'"></option>'}).join('')+'</datalist><select id="pca-ac"><option value="">Ação com cliente</option><option>Ligar</option><option>Enviar apresentação</option><option>Retornar</option><option>Agendar visita</option><option>Enviar documentos</option></select><input id="pca-dt" type="date" value="'+h+'"><button type="button" data-add="t">Adicionar</button></div>'+
        (ret.length?'<h4>Retornos de clientes ('+ret.length+')</h4>'+ret.slice(0,60).map(function(l){var at=l.retorno<h;return '<div class="it"><span><b>'+E(l.nome)+'</b> · '+E(l.tel)+'<small class="'+(at?'al':'')+'">Retorno '+l.retorno.split('-').reverse().join('/')+(l.interesse?' · '+E(l.interesse):'')+'</small>'+acoes(l.id,1)+'</span></div>'}).join(''):'')+Object.keys(CAT).map(function(k){var it=ab.filter(function(t){return t.c===k}).sort(function(x,y){return String(x.dt||'').localeCompare(String(y.dt||''))});if(!it.length)return '';
          return '<h4>'+CAT[k]+' ('+it.length+')</h4>'+it.map(function(t){var at=t.dt&&t.dt<h;return '<label class="it"><input type="checkbox" data-ok="'+t.id+'"><span>'+(t.a?'<b>'+E(t.a)+'</b> · ':'')+(t.ln?E(t.ln)+(t.x?' — ':''):'')+E(t.x)+(t.lid?acoes(t.lid,0):'')+(t.dt?'<small class="'+(at?'al':'')+'">'+(at?'Atrasada · ':'')+t.dt.split('-').reverse().join('/')+'</small>':'')+'</span><button type="button" data-del="'+t.id+'" aria-label="Apagar">×</button></label>'}).join('')}).join('')+
        (ab.length?'':'<p class="vz">Nenhuma pendência. Adicione acima.</p>')+(ft.length?'<h4>Concluídas hoje ('+ft.length+')</h4>'+ft.map(function(t){return '<label class="it f"><input type="checkbox" checked data-ok="'+t.id+'"><span>'+E(t.x)+'</span></label>'}).join(''):'');
    }else if(ABA==='i'){
      b.innerHTML='<div class="nw"><select id="pca-ic"><option>Reels</option><option>Story</option><option>Post / Carrossel</option><option>WhatsApp</option><option>Outro</option></select><textarea id="pca-ix" placeholder="Anote a ideia: roteiro, gancho, legenda, empreendimento…"></textarea><button type="button" data-add="i">Salvar ideia</button></div>'+
        (A.i.length?A.i.map(function(t){return '<div class="it'+(t.ok?' f':'')+'"><input type="checkbox" data-iok="'+t.id+'"'+(t.ok?' checked':'')+' title="Já postei"><span>'+E(t.x).replace(/\n/g,'<br>')+'<small>'+E(t.c)+' · '+E(t.d)+(t.ok?' · postado':'')+'</small></span><button type="button" data-idel="'+t.id+'" aria-label="Apagar">×</button></div>'}).join(''):'<p class="vz">Nenhuma ideia ainda.</p>');
    }else{
      b.innerHTML='<div class="nw"><input id="pca-fl" placeholder="Legenda ou onde usar (opcional)"><label class="ok" style="display:inline-flex;align-items:center">+ Adicionar fotos<input type="file" id="pca-ff" accept="image/*" multiple hidden></label></div><p class="vz">As fotos ficam guardadas neste aparelho. Toque em Baixar para postar ou enviar.</p><div class="gr" id="pca-g"></div>';
      fotos(function(F){var g=document.getElementById('pca-g');if(!g)return;g.innerHTML=F.length?F.map(function(f){return '<div class="ph"><img src="'+f.u+'" alt="'+E(f.leg)+'"><div><span>'+E(f.leg||f.data)+'</span><a href="'+f.u+'" download="foto-'+String(f.id).split('.')[0]+'.jpg">Baixar</a><button type="button" data-fdel="'+f.id+'" aria-label="Apagar">×</button></div></div>'}).join(''):'<p class="vz">Nenhuma foto ainda.</p>'});
    }
  }
  function clique(e){var t=e.target;
    if(t.dataset.q){e.preventDefault();document.getElementById('pca').style.display='none';if(window.pcAbrirQuadro)pcAbrirQuadro('ret');return}
    if(t.dataset.add==='t'){var x=document.getElementById('pca-tx').value.trim(),ac=document.getElementById('pca-ac').value,ld=lead(document.getElementById('pca-ld').value),dt=document.getElementById('pca-dt').value;if(!x&&!ac)return;
      A.t.push({id:Date.now(),x:x,a:ac,c:(ld||ac)?'cliente':document.getElementById('pca-ct').value,dt:dt,lid:ld?ld.id:'',ln:ld?ld.nome:''});
      if(ld){var L3=getLeads(),x3=L3.find(function(q){return q.id===ld.id});if(dt&&(!x3.retorno||dt<x3.retorno))x3.retorno=dt;(x3.hist=x3.hist||[]).unshift({a:'Pendência: '+(ac||x),d:dt.split('-').reverse().join('/'),t:new Date().toLocaleString('pt-BR')});saveLeads(L3)}
      save();return}
    if(t.dataset.la){e.preventDefault();var L0=getLeads()||[],l0=L0.find(function(q){return String(q.id)===t.dataset.id});if(!l0)return;var a=t.dataset.la;
      if(a==='l'&&typeof ligar==='function')ligar(l0.id);
      else if(a==='w'&&typeof zap==='function')zap(l0.id);
      else if(a==='p'&&window.pcAbrirPdf){document.getElementById('pca').style.display='none';pcAbrirPdf();setTimeout(function(){var i=document.getElementById('pdf-lead');if(i)i.value=l0.nome+' · '+l0.tel},300);hist(l0.id,'Montando apresentação','')}
      else if(a==='ok'||a==='adia'){var L1=getLeads(),x1=L1.find(function(q){return q.id===l0.id});var dd=new Date();dd.setDate(dd.getDate()+1);x1.retorno=a==='ok'?'':dd.toISOString().slice(0,10);(x1.hist=x1.hist||[]).unshift({a:a==='ok'?'Retorno feito':'Retorno adiado',d:a==='ok'?'':x1.retorno.split('-').reverse().join('/'),t:new Date().toLocaleString('pt-BR')});saveLeads(L1)}
      setTimeout(desenha,200);return}
    if(t.dataset.add==='i'){var y=document.getElementById('pca-ix').value.trim();if(!y)return;A.i.unshift({id:Date.now(),x:y,c:document.getElementById('pca-ic').value,d:new Date().toLocaleDateString('pt-BR')});save();return}
    if(t.dataset.del){A.t=A.t.filter(function(z){return String(z.id)!==t.dataset.del});save();return}
    if(t.dataset.idel){A.i=A.i.filter(function(z){return String(z.id)!==t.dataset.idel});save();return}
    if(t.dataset.fdel&&confirm('Apagar esta foto?'))delFoto(t.dataset.fdel);
  }
  function muda(e){var t=e.target;
    if(t.dataset.ok){var z=A.t.find(function(q){return String(q.id)===t.dataset.ok});if(z){z.ok=t.checked;z.fim=t.checked?hoje():'';if(z.ok&&z.lid)hist(z.lid,'Concluiu: '+(z.a||z.x),z.a&&z.x?z.x:'');save()}}
    if(t.dataset.iok){var w=A.i.find(function(q){return String(q.id)===t.dataset.iok});if(w){w.ok=t.checked;save()}}
    if(t.id==='pca-ff'){var leg=document.getElementById('pca-fl').value;[].forEach.call(t.files,function(f){addFoto(f,leg)});t.value=''}
  }
  // contador no painel do dia + item no menu
  function painel(){var p=document.getElementById('pc-dia');if(!p)return;var h=hoje(),n=A.t.filter(function(t){return !t.ok&&(!t.dt||t.dt<=h)}).length,el=document.getElementById('pca-n');
    if(!el){el=document.createElement('div');el.id='pca-n';el.style.cssText='margin-top:6px;color:#e6c581;cursor:pointer';el.onclick=function(e){e.stopPropagation();abrir('t')};p.appendChild(el)}
    el.textContent='📋 '+n+' pendência(s) hoje — abrir rotina'}
  function menu(){var ref=document.getElementById('pc-mq')||document.querySelector('.sb-link[onclick*="goPage(\'leads\')"]');if(!ref||document.getElementById('pc-ma'))return;
    var d=ref.cloneNode(false);d.id='pc-ma';d.removeAttribute('onclick');d.classList.remove('active');d.innerHTML='<span class="sb-icon">📋</span> Rotina do dia';d.onclick=function(){abrir('t')};ref.parentNode.insertBefore(d,ref)}
  function acoes(id,r){return '<span class="ac"><button type="button" data-la="l" data-id="'+E(id)+'">Ligar</button><button type="button" data-la="w" data-id="'+E(id)+'">WhatsApp</button><button type="button" data-la="p" data-id="'+E(id)+'">Enviar apresentação</button>'+(r?'<button type="button" data-la="ok" data-id="'+E(id)+'">Feito</button><button type="button" data-la="adia" data-id="'+E(id)+'">Amanhã</button>':'')+'</span>'}
  function lead(v){v=String(v||'').trim();if(!v)return null;var L=getLeads()||[],dg=v.replace(/\D/g,'');return L.find(function(l){return (l.nome+' · '+l.tel)===v})||L.find(function(l){return dg.length>=6&&String(l.tel||'').replace(/\D/g,'').indexOf(dg.slice(-8))>-1})||L.find(function(l){return String(l.nome||'').toLowerCase()===v.toLowerCase()})}
  function hist(id,a,d){try{var L=getLeads(),x=L.find(function(q){return String(q.id)===String(id)});if(x){(x.hist=x.hist||[]).unshift({a:a,d:d||'',t:new Date().toLocaleString('pt-BR')});saveLeads(L)}}catch(e){}}
  window.pcAbrirRotina=abrir;
  setInterval(painel,60000);[800,2600].forEach(function(t){setTimeout(function(){menu();painel()},t)});
})();

/* =====================================================
   ATUALIZAR PELO WHATSAPP: cole o relatorio das conversas
   (uma linha por cliente: telefone | nome | etapa | resumo | proximo passo | data | mensagem sugerida)
   e o CRM atualiza etapa, historico, retorno e cria a pendencia na Rotina do dia.
   ===================================================== */
(function(){
  var ET={novo:'novo',contato:'contato',contatado:'contato',conversa:'contato',proposta:'proposta',visita:'visita',fechado:'fechado',vendido:'fechado',perdido:'perdido',frio:'perdido'};
  function D(t){return String(t||'').replace(/\D/g,'').slice(-10)}
  function data(s){s=String(s||'').trim();var m=s.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);if(m){var y=m[3]?(m[3].length===2?'20'+m[3]:m[3]):new Date().getFullYear();return y+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0')}
    var d=new Date();if(/amanh/i.test(s))d.setDate(d.getDate()+1);else if(!/hoje/i.test(s))return '';return d.toISOString().slice(0,10)}
  function aplicar(txt){
    var L=getLeads()||[],n=0,novos=0,tarefas=[],linhas=txt.split(/\r?\n/).map(function(l){return l.trim()}).filter(function(l){return l&&l.indexOf('|')>-1&&!/^telefone\s*\|/i.test(l)&&!/^[-|\s]+$/.test(l)});
    linhas.forEach(function(l){
      var c=l.replace(/^\||\|$/g,'').split('|').map(function(x){return x.trim()}),tel=c[0],nome=c[1],et=ET[String(c[2]||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').split(' ')[0]],res=c[3]||'',prox=c[4]||'',dt=data(c[5]),msg=c[6]||'';
      var d=D(tel);if(d.length<8)return;
      var x=L.find(function(q){return D(q.tel)===d});
      if(!x){x={id:Date.now()*1000+n,nome:nome||('Contato '+d.slice(-4)),tel:tel,origem:'WhatsApp',temp:'morno',status:'contato',hist:[],data:new Date().toLocaleDateString('pt-BR')};L.unshift(x);novos++}
      if(et)x.status=et;if(et==='proposta'||et==='visita')x.temp='quente';
      if(dt)x.retorno=dt;if(msg)x.zapMsg=msg;
      (x.hist=x.hist||[]).unshift({a:'WhatsApp: '+(res||'conversa revisada'),d:prox,t:new Date().toLocaleString('pt-BR')});
      if(prox)tarefas.push({id:Date.now()+n,x:prox,a:'Retornar',c:'cliente',dt:dt||new Date().toISOString().slice(0,10),lid:x.id,ln:x.nome});
      n++;
    });
    if(!n){alert('Nenhuma linha reconhecida. Cada linha precisa começar com o telefone e usar | entre as colunas.');return}
    saveLeads(L);
    try{var A=JSON.parse(localStorage.getItem('crm_agenda'))||{t:[],i:[]};A.t=A.t.concat(tarefas);A.upd=Date.now();localStorage.setItem('crm_agenda',JSON.stringify(A))}catch(e){}
    if(typeof toast==='function')toast(n+' cliente(s) atualizados'+(novos?' ('+novos+' novos)':'')+' · '+tarefas.length+' pendência(s) na Rotina');
    if(window.pcRefresh)pcRefresh();
  }
  // WhatsApp do lead usa a mensagem sugerida, se houver
  var oZ=window.zap;
  if(typeof oZ==='function')window.zap=function(id){var l=(getLeads()||[]).find(function(x){return x.id===id});if(l&&l.zapMsg){var t=String(l.tel||'').replace(/\D/g,'');if(t.length<=11)t='55'+t;window.open('https://wa.me/'+t+'?text='+encodeURIComponent(l.zapMsg),'_blank');var L=getLeads(),y=L.find(function(q){return q.id===id});y.cont=y.cont||{l:0,m:0};y.cont.m++;(y.hist=y.hist||[]).unshift({a:'Enviou mensagem',d:'mensagem sugerida',t:new Date().toLocaleString('pt-BR')});delete y.zapMsg;saveLeads(L);return}return oZ.apply(this,arguments)};
  function abrir(){
    var m=document.getElementById('pcz');
    if(!m){m=document.createElement('div');m.id='pcz';m.style.cssText='position:fixed;inset:0;z-index:9993;background:rgba(5,11,12,.6);display:flex;align-items:center;justify-content:center;padding:16px';
      m.innerHTML='<div style="background:#f4efe6;color:#0f2e36;border-radius:16px;max-width:720px;width:100%;padding:18px;font:14px Inter,Arial,sans-serif"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font:italic 600 21px Fraunces,Georgia,serif">Atualizar pelo WhatsApp</b><button type="button" id="pcz-x" style="background:none;border:0;font-size:26px;cursor:pointer">×</button></div>'+
       '<p style="color:#6b7774;margin:8px 0">Cole o relatório das conversas (uma linha por cliente):<br><code>telefone | nome | etapa | resumo | próximo passo | data | mensagem sugerida</code></p>'+
       '<textarea id="pcz-t" style="width:100%;min-height:220px;padding:10px;border:1px solid #e3d9c6;border-radius:10px;font:13px monospace"></textarea>'+
       '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button type="button" id="pcz-go" style="background:#1a8f4c;color:#fff;border:0;border-radius:22px;padding:11px 20px;font-weight:700;cursor:pointer">Atualizar CRM</button><button type="button" id="pcz-cp" style="background:#0f2e36;color:#e6c581;border:0;border-radius:22px;padding:11px 16px;font-weight:600;cursor:pointer">Copiar pedido para o Claude do Chrome</button></div></div>';
      document.body.appendChild(m);
      document.getElementById('pcz-x').onclick=function(){m.style.display='none'};
      document.getElementById('pcz-go').onclick=function(){aplicar(document.getElementById('pcz-t').value);m.style.display='none'};
      document.getElementById('pcz-cp').onclick=function(){var p='Leia minhas conversas do WhatsApp Web dos últimos 30 dias com clientes de imóveis (ignore grupos, família e fornecedores). Para cada cliente, devolva UMA linha neste formato, sem texto extra:\ntelefone | nome | etapa (novo, contato, proposta, visita, fechado ou perdido) | resumo de 1 frase | próximo passo | data do retorno (dd/mm ou hoje/amanhã) | mensagem sugerida para eu enviar agora, curta e natural, assinada Paulo Cotrim\nNão envie nenhuma mensagem: só me devolva a lista.';navigator.clipboard.writeText(p).then(function(){if(typeof toast==='function')toast('Pedido copiado. Cole no Claude do Chrome.')})};
    }
    m.style.display='flex';
  }
  window.pcAbrirZap=abrir;
  function menu(){var ref=document.getElementById('pc-ma');if(!ref||document.getElementById('pc-mz'))return;var d=ref.cloneNode(false);d.id='pc-mz';d.innerHTML='<span class="sb-icon">💬</span> Atualizar pelo WhatsApp';d.onclick=abrir;ref.parentNode.insertBefore(d,ref.nextSibling)}
  [1200,3000].forEach(function(t){setTimeout(menu,t)});
})();

/* IMOVEIS CADASTRADOS PELO PUBLICO: analisar, ver contato, aprovar (vai para o site) ou recusar */
(function(){
  function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function cred(){return typeof crmCred==='function'?crmCred():{}}
  function abrir(){
    var m=document.getElementById('pci');
    if(!m){m=document.createElement('div');m.id='pci';m.style.cssText='position:fixed;inset:0;z-index:9993;background:#f4efe6;display:flex;flex-direction:column;font:14px Inter,Arial,sans-serif;color:#0f2e36';
      m.innerHTML='<div style="display:flex;align-items:center;padding:12px 16px;background:#0f2e36;color:#e6c581"><b style="font:italic 600 22px Fraunces,Georgia,serif;margin-right:auto">Imóveis cadastrados</b><a href="cadastre-seu-imovel.html" target="_blank" style="color:#e6c581;margin-right:14px">ver página</a><button type="button" id="pci-x" style="background:none;border:0;color:#e6c581;font-size:28px;cursor:pointer">×</button></div><div id="pci-b" style="flex:1;overflow:auto;padding:14px 16px;max-width:900px;width:100%;margin:0 auto"></div>';
      document.body.appendChild(m);document.getElementById('pci-x').onclick=function(){m.style.display='none'};
      m.addEventListener('click',function(e){var b=e.target.closest('button[data-st]');if(!b)return;var c=cred();b.disabled=true;
        crmPost({acao:'aprovar',usuario:c.usuario,senha:c.senha,id:b.dataset.id,status:b.dataset.st}).then(function(j){if(typeof toast==='function')toast(j&&j.ok?(b.dataset.st==='aprovado'?'Aprovado: já aparece no site':'Atualizado'):'Erro: atualize o Apps Script');carrega()})});
    }
    m.style.display='flex';carrega();
  }
  function carrega(){var b=document.getElementById('pci-b'),c=cred();b.innerHTML='<p>Carregando…</p>';
    if(typeof crmPost!=='function'||!c.usuario){b.innerHTML='<p>Entre no CRM com seu login para ver os cadastros.</p>';return}
    crmPost({acao:'imoveis_adm',usuario:c.usuario,senha:c.senha}).then(function(j){
      if(!j||!j.ok){b.innerHTML='<p>'+(j&&j.err==='login'?'Entre de novo no CRM.':'Atualize o Apps Script com o código novo para ativar os cadastros.')+'</p>';return}
      var L=j.itens||[],pend=L.filter(function(x){return x.status==='analise'}).length;
      b.innerHTML='<p><b>'+pend+'</b> em análise · '+L.length+' no total</p>'+L.map(function(x){var t=String(x.tel||'').replace(/\D/g,'');if(t&&t.length<=11)t='55'+t;
        return '<div style="background:#fff;border:1px solid #e3d9c6;border-left:5px solid '+(x.status==='aprovado'?'#1a8f4c':x.status==='recusado'?'#b4441d':'#cf9f4f')+';border-radius:14px;padding:12px 14px;margin-bottom:10px">'+
          '<div style="display:flex;gap:10px;flex-wrap:wrap">'+[x.f1,x.f2,x.f3].filter(Boolean).map(function(f){return '<img src="'+f+'" style="width:90px;height:90px;object-fit:cover;border-radius:10px">'}).join('')+'</div>'+
          '<b style="display:block;font:600 17px Fraunces,Georgia,serif;margin-top:8px">'+E(x.titulo)+'</b><small>'+E([x.tipo,x.bairro,x.area&&x.area+' m²',x.quartos&&x.quartos+' qto(s)',x.vagas&&x.vagas+' vaga(s)',x.preco&&'R$ '+x.preco].filter(Boolean).join(' · '))+'</small>'+
          '<p style="margin:8px 0;white-space:pre-wrap">'+E(x.descricao)+'</p>'+
          '<p style="background:#f4efe6;border-radius:10px;padding:8px 10px;margin:6px 0">🔒 <b>'+E(x.nome)+'</b> · '+E(x.tel)+(x.email?' · '+E(x.email):'')+'</p>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap">'+(t?'<a href="https://wa.me/'+t+'?text='+encodeURIComponent('Olá '+String(x.nome||'').split(' ')[0]+', aqui é o Paulo Cotrim. Recebi o cadastro do seu imóvel ('+x.titulo+'). Podemos conversar?')+'" target="_blank" style="background:#1a8f4c;color:#fff;text-decoration:none;border-radius:20px;padding:8px 14px;font-weight:600">WhatsApp</a>':'')+
          (x.status!=='aprovado'?'<button type="button" data-st="aprovado" data-id="'+E(x.id)+'" style="background:#0f2e36;color:#e6c581;border:0;border-radius:20px;padding:8px 14px;font-weight:600;cursor:pointer">Aprovar e publicar</button>':'<button type="button" data-st="analise" data-id="'+E(x.id)+'" style="background:#e6c581;color:#0f2e36;border:0;border-radius:20px;padding:8px 14px;font-weight:600;cursor:pointer">Tirar do site</button>')+
          (x.status!=='recusado'?'<button type="button" data-st="recusado" data-id="'+E(x.id)+'" style="background:none;color:#b4441d;border:1px solid #b4441d;border-radius:20px;padding:8px 14px;cursor:pointer">Recusar</button>':'')+'</div></div>'}).join('');
    });
  }
  window.pcAbrirImoveisCad=abrir;
  function menu(){var ref=document.getElementById('pc-ma');if(!ref||document.getElementById('pc-mi'))return;var d=ref.cloneNode(false);d.id='pc-mi';d.innerHTML='<span class="sb-icon">🏠</span> Imóveis cadastrados';d.onclick=abrir;ref.parentNode.insertBefore(d,ref.nextSibling)}
  [1400,3200].forEach(function(t){setTimeout(menu,t)});
})();

/* CRM — Montar PDF de oportunidades + enviar a um lead (WhatsApp / ligar) */
(function(){
  var OP=[],FIL=[],MS=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  function N0(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
  Promise.all([fetch('/data/sawala-oportunidades.json').then(function(r){return r.json()}).catch(function(){return{}}),fetch('/data/flow-catalogo.json').then(function(r){return r.json()}).catch(function(){return{}})]).then(function(a){
    var S=(a[0].itens||[]),vis={};S.forEach(function(o){vis[N0(o.nome)]=1});
    var F=(a[1].itens||[]).filter(function(x){return x.u&&x.n&&!vis[N0(x.n)]}).map(function(x){return{nome:x.n,bairro:x.b||'',preco:x.p||0,entrega:x.e||'',status:'',url:x.u,img:x.img||'',plantas:[x.q&&x.q!=='0'?x.q:'',x.a&&x.a!=='0'?x.a:''].filter(Boolean).join(' · ')}});
    OP=S.concat(F);
  });
  function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function N(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
  function R(v){return v?'R$ '+Math.round(v).toLocaleString('pt-BR'):'valor sob consulta'}
  function ent(o){var hj=new Date().toISOString().slice(0,7);return (o.status==='Pronto'||(o.entrega&&o.entrega.slice(0,7)<=hj))?'Pronto para morar':(o.entrega?'Entrega '+MS[+o.entrega.slice(5,7)-1]+'/'+o.entrega.slice(0,4):'Lançamento')}
  function url(o){return 'https://www.paulocotrim.com/'+(o.url&&o.url.indexOf('ficha-')===0?o.url:'oportunidades.html')}
  function qts(o){var t=N(o.plantas),r=[];if(/studio/.test(t))r.push('0');(t.match(/\d/g)||[]).forEach(function(d){r.push(+d>=4?'4':d)});return r}
  function filtrar(){
    var b=val('pdf-b'),q=val('pdf-q'),v=+val('pdf-v')||0,s=N(val('pdf-s'));
    FIL=OP.filter(function(o){return (!b||o.bairro===b)&&(!q||qts(o).indexOf(q)>-1)&&(!v||(o.preco&&o.preco<=v))&&(!s||N(o.nome+' '+o.bairro).indexOf(s)>-1)}).sort(function(a,c){return (a.preco?0:1)-(c.preco?0:1)||a.preco-c.preco});
    document.getElementById('pdf-l').innerHTML=FIL.slice(0,200).map(function(o,i){return '<label class="pi"><input type="checkbox" value="'+i+'"><span><b>'+E(o.nome)+'</b><small>'+E(o.bairro)+' · '+R(o.preco)+' · '+E(ent(o))+'</small></span></label>'}).join('')||'<p>Nenhum imóvel com esses filtros.</p>';
    document.getElementById('pdf-n').textContent=FIL.length+' encontrados';
  }
  function val(id){var e=document.getElementById(id);return e?e.value.trim():''}
  function marcados(){return [].slice.call(document.querySelectorAll('#pdf-l input:checked')).map(function(c){return FIL[+c.value]})}
  function gerarPdf(){
    var sel=marcados();if(!sel.length){alert('Marque ao menos um imóvel.');return}
    var t=val('pdf-t')||'Seleção de imóveis', base=location.origin;
    var cards=sel.map(function(o){return '<div class="c"><div class="ph" style="background-image:url(\''+base+'/'+E(o.img)+'\')"></div><div class="tx"><h3>'+E(o.nome)+'</h3><p>'+E(o.bairro)+' · '+E(ent(o))+'</p><p>'+E(o.plantas||'')+'</p><p class="pr">'+(o.preco?'a partir de '+R(o.preco):'Valor sob consulta')+'</p><p class="lk">'+E(url(o))+'</p></div></div>'}).join('');
    var h='<!doctype html><html><head><meta charset="utf-8"><title>'+E(t)+'</title><style>@page{size:A4;margin:14mm}body{font-family:Inter,Arial,sans-serif;color:#0f2e36;margin:0}h1{font-family:Fraunces,Georgia,serif;font-style:italic;color:#8a6a2f;font-size:28px;margin:0}.hd{border-bottom:2px solid #cf9f4f;padding-bottom:10px;margin-bottom:16px;font-size:12px}.g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.c{border:1px solid #e3d9c6;border-radius:10px;overflow:hidden;break-inside:avoid}.ph{height:120px;background:#e9e3d6 center/cover}.tx{padding:10px}.tx h3{font-family:Fraunces,Georgia,serif;margin:0 0 4px;font-size:17px}.tx p{margin:3px 0;font-size:12px}.pr{color:#8a6a2f;font-weight:700;font-size:14px}.lk{color:#6b7774;word-break:break-all;font-size:10px}.ft{margin-top:14px;font-size:10px;color:#6b7774}</style></head><body><div class="hd"><h1>'+E(t)+'</h1>Paulo Cotrim · CRECI-RJ 77677-F · (21) 98915-0864 · paulocotrim.com</div><div class="g">'+cards+'</div><p class="ft">Valores de referência Oportunidades Sawala (out/2026), sujeitos a alteração e disponibilidade. Imagens ilustrativas.</p><script>onload=function(){print()}<\/script></body></html>';
    var w=window.open('','_blank');w.document.write(h);w.document.close();
  }
  function enviar(tipo){
    var qv=val('pdf-lead');if(!qv){alert('Digite o nome ou telefone do cliente.');return}
    var dg=qv.replace(/D/g,''),qn=N(qv),L0=getLeads()||[];
    var l=L0.find(function(x){return N(x.nome+' · '+x.tel)===qn})||L0.find(function(x){return dg.length>=6&&String(x.tel||'').replace(/D/g,'').indexOf(dg.slice(-8))>-1})||L0.find(function(x){return N(x.nome).indexOf(qn)===0});
    if(!l){alert('Cliente não encontrado na base.');return}var id=String(l.id);
    var sel=marcados();if(!sel.length){alert('Marque os imóveis que quer enviar.');return}
    var nome=(l.nome||'').split(' ')[0],tel=String(l.tel||'').replace(/\D/g,'');if(tel&&tel.length<=11)tel='55'+tel;
    if(tipo==='ligar'){location.href='tel:+'+tel;return}
    var linhas=sel.slice(0,8).map(function(o){return '• '+o.nome+' ('+o.bairro+') — '+(o.preco?'a partir de '+R(o.preco):'valor sob consulta')+', '+ent(o)+': '+url(o)}).join('\n');
    var msg='Olá '+nome+'! Separei estas opções para você:\n'+linhas+'\n\nQuer que eu te envie o resumo em PDF ou agende uma visita?';
    window.open('https://wa.me/'+tel+'?text='+encodeURIComponent(msg),'_blank');
    try{var L=getLeads(),x=L.find(function(y){return String(y.id)===id});if(x){(x.hist=x.hist||[]).unshift({a:'Enviou '+sel.length+' opção(ões)',d:'Montado no CRM',t:new Date().toLocaleString('pt-BR')});saveLeads(L)}}catch(e){}
  }
  function abrir(){
    var m=document.getElementById('pdf-m');
    if(!m){
      m=document.createElement('div');m.id='pdf-m';
      m.innerHTML='<div class="pdf-box"><div class="pdf-hd"><b>Montar PDF e enviar</b><button type="button" id="pdf-x">×</button></div>'+
        '<div class="pdf-f"><input id="pdf-s" placeholder="Buscar nome ou bairro"><select id="pdf-b"><option value="">Todos os bairros</option></select><select id="pdf-q"><option value="">Qualquer quarto</option><option value="0">Studio</option><option value="1">1 quarto</option><option value="2">2 quartos</option><option value="3">3 quartos</option><option value="4">4+ quartos</option></select><select id="pdf-v"><option value="">Qualquer valor</option><option value="500000">Até R$ 500 mil</option><option value="1000000">Até R$ 1 mi</option><option value="2000000">Até R$ 2 mi</option><option value="5000000">Até R$ 5 mi</option></select></div>'+
        '<div class="pdf-n" id="pdf-n"></div><div class="pdf-l" id="pdf-l"></div>'+
        '<div class="pdf-f"><input id="pdf-t" placeholder="Título do PDF (ex.: Melhores oportunidades Zona Norte 2 quartos)"></div>'+
        '<div class="pdf-f"><button type="button" id="pdf-gen">Gerar PDF</button></div>'+
        '<div class="pdf-f"><input id="pdf-lead" list="pdf-leads" placeholder="Digite o nome ou telefone do cliente" autocomplete="off"><datalist id="pdf-leads"></datalist><button type="button" id="pdf-wa">WhatsApp</button><button type="button" id="pdf-call">Ligar</button></div><p class="pdf-tip">O PDF abre na tela de impressão: escolha "Salvar como PDF". Para anexar no WhatsApp, baixe o PDF e anexe na conversa.</p></div>';
      document.body.appendChild(m);
      var st=document.createElement('style');st.textContent='#pdf-m{position:fixed;inset:0;background:rgba(5,11,12,.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center}.pdf-box{background:#f4efe6;width:100%;max-width:640px;max-height:92vh;overflow:auto;border-radius:18px 18px 0 0;padding:16px;color:#0f2e36;font-family:Inter,Arial,sans-serif}.pdf-hd{display:flex;justify-content:space-between;align-items:center;font-family:Fraunces,Georgia,serif;font-size:20px;margin-bottom:10px}.pdf-hd button{background:none;border:0;font-size:26px;cursor:pointer}.pdf-f{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.pdf-f input,.pdf-f select{flex:1 1 140px;padding:10px;border:1px solid #e3d9c6;border-radius:10px;font:inherit;background:#fff}.pdf-f button,.pdf-box button{background:#1a8f4c;color:#fff;border:0;border-radius:20px;padding:10px 16px;font-weight:600;cursor:pointer}.pdf-n{font-weight:600;margin:6px 0}.pdf-l{max-height:340px;overflow:auto;border:1px solid #e3d9c6;border-radius:12px;background:#fff}.pi{display:flex;gap:10px;align-items:flex-start;padding:10px;border-bottom:1px solid #efe9df;cursor:pointer}.pi input{margin-top:4px;accent-color:#cf9f4f;width:18px;height:18px}.pi b{display:block;font-size:14px}.pi small{color:#6b7774;font-size:12px}.pdf-tip{font-size:12px;color:#6b7774}';document.head.appendChild(st);
      document.getElementById('pdf-x').onclick=function(){m.remove()};
      document.getElementById('pdf-gen').onclick=gerarPdf;
      document.getElementById('pdf-wa').onclick=function(){enviar('wa')};
      document.getElementById('pdf-call').onclick=function(){enviar('ligar')};
      ['pdf-s','pdf-b','pdf-q','pdf-v'].forEach(function(i){document.getElementById(i).addEventListener(i==='pdf-s'?'input':'change',filtrar)});
    }
    var bs=[];OP.forEach(function(o){if(o.bairro&&bs.indexOf(o.bairro)<0)bs.push(o.bairro)});bs.sort();
    var bsel=document.getElementById('pdf-b');if(bsel.options.length<2)bs.forEach(function(b){bsel.add(new Option(b,b))});
    var ls=(getLeads()||[]).slice().sort(function(a,b){return String(a.nome).localeCompare(String(b.nome))});
    document.getElementById('pdf-leads').innerHTML=ls.map(function(l){return '<option value="'+E(l.nome)+' · '+E(l.tel)+'"></option>'}).join('');
    filtrar();
  }
  window.pcAbrirPdf=abrir;
})();

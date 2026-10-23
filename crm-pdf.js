/* CRM — Montar PDF de oportunidades + enviar a um lead (WhatsApp / ligar) */
(function(){
  var OP=[],FIL=[],MS=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  function N0(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
  Promise.all([fetch('/data/sawala-oportunidades.json').then(function(r){return r.json()}).catch(function(){return{}}),fetch('/data/flow-catalogo.json').then(function(r){return r.json()}).catch(function(){return{}})]).then(function(a){
    var S=(a[0].itens||[]),vis={},CO={};(a[1].itens||[]).forEach(function(x){if(x.la&&x.lo)CO[N0(x.n)]=[x.la,x.lo]});S.forEach(function(o){var k=N0(o.nome);vis[k]=1;var c=CO[k]||CO[Object.keys(CO).find(function(z){return k.length>4&&(z.indexOf(k)===0||k.indexOf(z)===0)})];if(c){o.la=c[0];o.lo=c[1]}});
    var F=(a[1].itens||[]).filter(function(x){return x.u&&x.n&&!vis[N0(x.n)]}).map(function(x){return{nome:x.n,bairro:x.b||'',preco:x.p||0,entrega:x.e||'',status:'',url:x.u,img:x.img||'',la:x.la||0,lo:x.lo||0,plantas:[x.q&&x.q!=='0'?x.q:'',x.a&&x.a!=='0'?x.a:''].filter(Boolean).join(' · ')}});
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
    var t=val('pdf-t')||'Seleção de imóveis',sub=val('pdf-ped')||'',base=location.origin,hoje=new Date().toLocaleDateString('pt-BR');
    function img(o){return o.img?(/^https?:/.test(o.img)?o.img:base+'/'+String(o.img).replace(/^\//,'')):''}
    var linhas=sel.map(function(o,i){return '<tr><td>'+(i+1)+'</td><td><b>'+E(o.nome)+'</b></td><td>'+E(o.bairro)+'</td><td>'+E(o.plantas||'—')+'</td><td>'+E(ent(o))+'</td><td class="v">'+(o.preco?R(o.preco):'Sob consulta')+'</td></tr>'}).join('');
    var pags=sel.map(function(o,i){return '<section class="pg emp"><div class="ph" style="background-image:url(\''+E(img(o))+'\')"><span class="nr">'+String(i+1).padStart(2,'0')+'</span></div>'+
      '<div class="bd"><span class="ey">'+E(o.bairro)+'</span><h2>'+E(o.nome)+'</h2>'+
      '<div class="gr"><div><small>A partir de</small><b>'+(o.preco?R(o.preco):'Sob consulta')+'</b></div><div><small>Plantas</small><b>'+E(o.plantas||'Consulte')+'</b></div><div><small>Prazo</small><b>'+E(ent(o))+'</b></div><div><small>Bairro</small><b>'+E(o.bairro)+'</b></div></div>'+
      '<p class="lk">Ficha completa, fotos e plantas: <a href="'+E(url(o))+'">'+E(url(o).replace('https://',''))+'</a></p></div>'+
      '<div class="ft">Paulo Cotrim · CRECI-RJ 77677-F · (21) 98915-0864</div></section>'}).join('');
    var h='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>'+E(t)+'</title><style>'+
      '@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,Arial,sans-serif;color:#0f2e36;-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
      '.pg{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;break-after:page}.pg:last-child{page-break-after:auto}'+
      '.cv{background:radial-gradient(120% 80% at 80% 0%,#163c45,#0f2e36 45%,#050b0c);color:#f4efe6;padding:28mm 20mm}.cv .ey,.ey{font:600 9pt Inter,Arial;letter-spacing:.3em;text-transform:uppercase;color:#cf9f4f}'+
      '.cv h1{font:italic 600 40pt/1.05 Georgia,serif;color:#e6c581;margin:10mm 0 6mm}.cv p{font-size:13pt;color:#d9d3c7;max-width:150mm}.cv .ln{width:24mm;height:1.5px;background:#cf9f4f;margin:10mm 0}'+
      '.cv .rd{position:absolute;left:20mm;right:20mm;bottom:18mm;border-top:1px solid rgba(230,197,129,.4);padding-top:6mm;display:flex;justify-content:space-between;font-size:9.5pt;color:#cfc6b6}'+
      '.rs{padding:20mm 16mm;background:#f4efe6}.rs h2{font:600 24pt Georgia,serif;margin:3mm 0 8mm}table{width:100%;border-collapse:collapse;font-size:9.5pt;background:#fff}'+
      'th{background:#0f2e36;color:#e6c581;text-align:left;padding:3mm;font-size:8pt;letter-spacing:.12em;text-transform:uppercase}td{padding:3mm;border-bottom:1px solid #e3d9c6;vertical-align:top}td.v{color:#8a6a2f;font-weight:700;white-space:nowrap}'+
      '.rs .nt{margin-top:6mm;font-size:8pt;color:#6b7774}'+
      '.emp{background:#f4efe6}.emp .ph{height:140mm;background:#0b2228 center/cover no-repeat;position:relative}.emp .nr{position:absolute;left:14mm;top:12mm;background:#0f2e36;color:#e6c581;font:600 14pt Georgia,serif;padding:2mm 4mm;border-radius:2mm}'+
      '.emp .bd{padding:10mm 16mm}.emp h2{font:italic 600 26pt Georgia,serif;color:#0f2e36;margin:2mm 0 7mm}.gr{display:grid;grid-template-columns:1fr 1fr;gap:4mm}'+
      '.gr div{background:#fff;border:1px solid #e3d9c6;border-radius:3mm;padding:4mm 5mm}.gr small{display:block;font-size:7.5pt;letter-spacing:.2em;text-transform:uppercase;color:#8a6a2f}.gr b{display:block;font-size:12pt;margin-top:1mm}'+
      '.lk{margin-top:7mm;font-size:9.5pt;color:#2c3a38}.lk a{color:#0f2e36;font-weight:600;word-break:break-all}'+
      '.ft{position:absolute;left:16mm;right:16mm;bottom:9mm;border-top:1px solid #d9cdb6;padding-top:3mm;font-size:8pt;letter-spacing:.12em;text-transform:uppercase;color:#8a7f6c}'+
      '.fim{background:radial-gradient(120% 80% at 80% 0%,#163c45,#0f2e36 45%,#050b0c);color:#f4efe6;padding:40mm 20mm;text-align:center}.fim h2{font:italic 600 30pt Georgia,serif;color:#e6c581;margin:8mm 0}.fim p{font-size:12pt;color:#d9d3c7;margin:3mm 0}.fim .bt{display:inline-block;margin-top:10mm;background:#1a8f4c;color:#fff;padding:4mm 9mm;border-radius:20mm;font-weight:700;font-size:12pt}'+
      '</style></head><body>'+
      '<section class="pg cv"><span class="ey">Seleção exclusiva · Paulo Cotrim</span><div class="ln"></div><h1>'+E(t)+'</h1>'+(sub&&sub!==t?'<p>'+E(sub)+'</p>':'')+'<p style="margin-top:6mm">'+sel.length+' empreendimento(s) selecionado(s) para você</p>'+
        '<div class="rd"><span>Paulo Cotrim · Corretor de Imóveis<br>CRECI-RJ 77677-F</span><span style="text-align:right">'+hoje+'<br>(21) 98915-0864 · paulocotrim.com</span></div></section>'+
      '<section class="pg rs"><span class="ey">Visão geral</span><h2>Resumo da seleção</h2><table><thead><tr><th>#</th><th>Empreendimento</th><th>Bairro</th><th>Plantas</th><th>Prazo</th><th>A partir de</th></tr></thead><tbody>'+linhas+'</tbody></table>'+
        '<p class="nt">Valores de referência (Oportunidades Sawala, out/2026), sujeitos a alteração e disponibilidade. Confirme a tabela vigente. Imagens ilustrativas.</p><div class="ft">Paulo Cotrim · CRECI-RJ 77677-F · (21) 98915-0864</div></section>'+
      pags+
      '<section class="pg fim"><span class="ey">Próximo passo</span><h2>Vamos encontrar o seu?</h2><p>Simulação de financiamento CAIXA, análise de crédito e visita agendada.</p><p>Tudo comigo, do primeiro contato até a chave.</p><span class="bt">WhatsApp (21) 98915-0864</span><p style="margin-top:14mm;color:#cfc6b6">Paulo Cotrim · CRECI-RJ 77677-F · paulocotrim.com</p></section>'+
      '<script>window.onload=function(){var im=[].slice.call(document.querySelectorAll(".ph"));setTimeout(function(){print()},im.length?1500:300)}<\/script></body></html>';
    var w=window.open('','_blank');if(!w){alert('Permita pop-ups para gerar o PDF.');return}w.document.write(h);w.document.close();
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
  
  /* ---- PEDIDO EM TEXTO: "melhores opções perto do Norte Shopping, 2 quartos até 400 mil" ---- */
  var PONTOS={'norte shopping':[-22.8866,-43.2826],'nova america':[-22.8786,-43.2717],'shopping tijuca':[-22.9238,-43.2357],'madureira shopping':[-22.8722,-43.3366],'carioca shopping':[-22.8449,-43.3061],'barrashopping':[-22.9998,-43.3593],'barra shopping':[-22.9998,-43.3593],'village mall':[-22.9994,-43.3622],'metropolitano':[-22.975,-43.397],'shopping leblon':[-22.9837,-43.2172],'botafogo praia shopping':[-22.9476,-43.1825],'recreio shopping':[-23.0129,-43.4641],'maracana':[-22.9122,-43.2302],'engenhao':[-22.8932,-43.2922],'praca maua':[-22.8967,-43.1803],'central do brasil':[-22.9035,-43.1912],'aeroporto santos dumont':[-22.9105,-43.1631],'jardim oceanico':[-23.0067,-43.3115]};
  var REG={'zona norte':['tijuca','meier','cachambi','del castilho','engenho de dentro','engenho novo','madureira','pilares','piedade','todos os santos','inhauma','riachuelo','rocha','sao cristovao','vila isabel','grajau','andarai','maracana','penha','olaria','ramos','bonsucesso','iraja','vila da penha','vista alegre','campinho','cascadura','abolicao','lins','higienopolis','maria da graca','benfica','vicente de carvalho','quintino','encantado','agua santa','jacarezinho','manguinhos','bento ribeiro','oswaldo cruz','marechal hermes','rocha miranda','coelho neto','pavuna','guadalupe','anchieta','ricardo de albuquerque'],
    'zona sul':['ipanema','leblon','copacabana','botafogo','flamengo','laranjeiras','gavea','sao conrado','lagoa','jardim botanico','humaita','urca','leme','catete','gloria','cosme velho'],
    'barra':['barra da tijuca','barra olimpica','recreio dos bandeirantes','jacarepagua','vargem grande','vargem pequena','camorim','itanhanga','joa','freguesia','pechincha','taquara','curicica'],
    'centro':['centro','lapa','santo cristo','gamboa','saude','cidade nova','estacio','catumbi','santa teresa','rio comprido','porto maravilha']};
  function km(a,b,c,d){var R=6371,x=(c-a)*Math.PI/180,y=(d-b)*Math.PI/180,s=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(s))}
  function pedir(){
    var txt=val('pdf-ped');if(!txt){alert('Escreva o que você quer. Ex.: melhores opções perto do Norte Shopping, 2 quartos até 400 mil');return}
    var t=N(txt).replace(/[^a-z0-9 ,.$]/g,' '),res=OP.slice(),motivo=[];
    // local: ponto de referencia (raio 4 km), regiao ou bairro citado
    var pt=null;Object.keys(PONTOS).some(function(k){if(t.indexOf(k)>-1){pt=[k,PONTOS[k]];return true}});
    if(pt){res=res.filter(function(o){return o.la&&km(pt[1][0],pt[1][1],o.la,o.lo)<=4});res.forEach(function(o){o._d=km(pt[1][0],pt[1][1],o.la,o.lo)});motivo.push('até 4 km de '+pt[0].replace(/\b\w/g,function(c){return c.toUpperCase()}))}
    else{var rg=null;Object.keys(REG).some(function(k){if(t.indexOf(k)>-1){rg=k;return true}});
      if(rg){res=res.filter(function(o){return REG[rg].some(function(b){return N(o.bairro).indexOf(b)>-1})});motivo.push(rg)}
      else{var bs={};OP.forEach(function(o){if(o.bairro)bs[N(o.bairro)]=1});var hit=Object.keys(bs).filter(function(b){return b.length>3&&t.indexOf(b)>-1});
        if(hit.length){res=res.filter(function(o){return hit.indexOf(N(o.bairro))>-1});motivo.push(hit.join(', '))}}}
    // quartos
    var mq=t.match(/(\d)\s*(q\b|qts?|quartos?|dorm)/);if(/studio|estudio|loft/.test(t))mq=[0,'0'];
    if(mq){var q=+mq[1]>=4?'4':String(mq[1]);res=res.filter(function(o){return qts(o).indexOf(q)>-1});motivo.push(q==='0'?'studio':q+' quartos')}
    // valor maximo
    var mv=t.match(/(ate|max(imo)?|abaixo de|menos de)\s*r?\$?\s*([\d.,]+)\s*(milhoes|milhao|mil|mi|k)?/);
    if(mv){var v=parseFloat(mv[3].replace(/\./g,'').replace(',','.'));if(/^(mil|k)$/.test(mv[4]||''))v*=1000;else if(/^mi/.test(mv[4]||''))v*=1e6;else if(v<10000)v*=1000;var pr=res.filter(function(o){return o.preco&&o.preco<=v});if(pr.length){res=pr;motivo.push('até '+R(v))}else{res=res.filter(function(o){return !o.preco});motivo.push('nenhum com valor publicado até '+R(v)+' — estes estão sob consulta, confirme a tabela')}}
    // prazo
    if(/pronto|pra morar|imediat/.test(t)){res=res.filter(function(o){return ent(o)==='Pronto para morar'});motivo.push('prontos')}
    else if(/planta|lancamento/.test(t)){res=res.filter(function(o){return ent(o)!=='Pronto para morar'});motivo.push('na planta')}
    var mn=t.match(/(\d{1,2})\s*(opcoes|imoveis|empreendimentos|melhores)/),qtd=mn?Math.min(+mn[1],20):8;
    res.sort(function(a,c){return (a.preco?0:1)-(c.preco?0:1)||(a._d||0)-(c._d||0)||a.preco-c.preco});
    res=res.slice(0,qtd);OP.forEach(function(o){delete o._d});
    if(!res.length){alert('Não encontrei imóveis para: '+txt+'\n\nTente outro ponto, bairro ou valor.');return}
    FIL=res;
    document.getElementById('pdf-l').innerHTML=FIL.map(function(o,i){return '<label class="pi"><input type="checkbox" checked value="'+i+'"><span><b>'+E(o.nome)+'</b><small>'+E(o.bairro)+' · '+R(o.preco)+' · '+E(ent(o))+'</small></span></label>'}).join('');
    document.getElementById('pdf-n').textContent=FIL.length+' escolhidos para: '+(motivo.join(' · ')||txt)+' — desmarque o que não quiser';
    var ti=document.getElementById('pdf-t');if(!ti.value)ti.value=txt.charAt(0).toUpperCase()+txt.slice(1);
  }

  function abrir(){
    var m=document.getElementById('pdf-m');
    if(!m){
      m=document.createElement('div');m.id='pdf-m';
      m.innerHTML='<div class="pdf-box"><div class="pdf-hd"><b>Montar PDF e enviar</b><button type="button" id="pdf-x">×</button></div>'+'<div class="pdf-f"><input id="pdf-ped" placeholder="Peça em texto: melhores opções perto do Norte Shopping, 2 quartos até 400 mil"><button type="button" id="pdf-ped-go">Escolher</button></div>'+
        '<div class="pdf-f"><input id="pdf-s" placeholder="Buscar nome ou bairro"><select id="pdf-b"><option value="">Todos os bairros</option></select><select id="pdf-q"><option value="">Qualquer quarto</option><option value="0">Studio</option><option value="1">1 quarto</option><option value="2">2 quartos</option><option value="3">3 quartos</option><option value="4">4+ quartos</option></select><select id="pdf-v"><option value="">Qualquer valor</option><option value="500000">Até R$ 500 mil</option><option value="1000000">Até R$ 1 mi</option><option value="2000000">Até R$ 2 mi</option><option value="5000000">Até R$ 5 mi</option></select></div>'+
        '<div class="pdf-n" id="pdf-n"></div><div class="pdf-l" id="pdf-l"></div>'+
        '<div class="pdf-f"><input id="pdf-t" placeholder="Título do PDF (ex.: Melhores oportunidades Zona Norte 2 quartos)"></div>'+
        '<div class="pdf-f"><button type="button" id="pdf-gen">Gerar PDF</button></div>'+
        '<div class="pdf-f"><input id="pdf-lead" list="pdf-leads" placeholder="Digite o nome ou telefone do cliente" autocomplete="off"><datalist id="pdf-leads"></datalist><button type="button" id="pdf-wa">WhatsApp</button><button type="button" id="pdf-call">Ligar</button></div><p class="pdf-tip">O PDF abre na tela de impressão: escolha "Salvar como PDF". Para anexar no WhatsApp, baixe o PDF e anexe na conversa.</p></div>';
      document.body.appendChild(m);
      var st=document.createElement('style');st.textContent='#pdf-m{position:fixed;inset:0;background:rgba(5,11,12,.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center}.pdf-box{background:#f4efe6;width:100%;max-width:640px;max-height:92vh;overflow:auto;border-radius:18px 18px 0 0;padding:16px;color:#0f2e36;font-family:Inter,Arial,sans-serif}.pdf-hd{display:flex;justify-content:space-between;align-items:center;font-family:Fraunces,Georgia,serif;font-size:20px;margin-bottom:10px}.pdf-hd button{background:none;border:0;font-size:26px;cursor:pointer}.pdf-f{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.pdf-f input,.pdf-f select{flex:1 1 140px;padding:10px;border:1px solid #e3d9c6;border-radius:10px;font:inherit;background:#fff}.pdf-f button,.pdf-box button{background:#1a8f4c;color:#fff;border:0;border-radius:20px;padding:10px 16px;font-weight:600;cursor:pointer}.pdf-n{font-weight:600;margin:6px 0}.pdf-l{max-height:340px;overflow:auto;border:1px solid #e3d9c6;border-radius:12px;background:#fff}.pi{display:flex;gap:10px;align-items:flex-start;padding:10px;border-bottom:1px solid #efe9df;cursor:pointer}.pi input{margin-top:4px;accent-color:#cf9f4f;width:18px;height:18px}.pi b{display:block;font-size:14px}.pi small{color:#6b7774;font-size:12px}.pdf-tip{font-size:12px;color:#6b7774}';document.head.appendChild(st);
      document.getElementById('pdf-x').onclick=function(){m.remove()};
      document.getElementById('pdf-gen').onclick=gerarPdf;document.getElementById('pdf-ped-go').onclick=pedir;document.getElementById('pdf-ped').onkeydown=function(e){if(e.key==='Enter')pedir()};
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

/* Modo apresentação + resumo para o cliente — todas as páginas do site.
   Carregado por leads.js (ou direto em páginas sem leads.js). Sem dependências.
   O número de WhatsApp vem de barra-config.js (configuração central). */
(function(){
  if (window.__pcApres || /(^|\/)barradatijuca(\.html)?$/.test(location.pathname)) return;
  window.__pcApres = true;
  var KEY='pc_apres', PRIV='politica-de-privacidade.html';
  function ss(f){try{return f();}catch(e){return null;}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function $(id){return document.getElementById(id);}
  function cfg(){return window.BARRA_CFG||{whatsapp:'5521989150864',telefoneExibicao:'(21) 98915-0864',siteUrl:'https://www.paulocotrim.com',creci:'CRECI-RJ 77677-F'};}

  var css='html.pc-apres body{zoom:1.08}'+
  'html.pc-apres .wafloat,html.pc-apres .sticky-cta,html.pc-apres #cookieConsentBar,html.pc-apres #waStatusDot,html.pc-apres #waStatusBubble,html.pc-apres .pc-exit,html.pc-apres [id*=exit]{display:none!important}'+
  '.pcA-bar{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:flex;gap:8px;font:600 13px Inter,system-ui,sans-serif}'+
  '.pcA-bar button{border:0;border-radius:99px;padding:11px 16px;cursor:pointer;font:inherit;box-shadow:0 4px 14px rgba(0,0,0,.25)}'+
  '.pcA-ap{background:#0f2e36;color:#fff}.pcA-ap[aria-pressed=true]{background:#fff;color:#0f2e36;outline:2px solid #0f2e36}'+
  '.pcA-rs{background:#0058A3;color:#fff}'+
  '@media(max-width:900px){.pcA-bar{bottom:84px}.pcA-ap{display:none}}'+
  'dialog.pcA-d{margin:auto;border:0;border-radius:18px;padding:0;max-width:560px;width:calc(100% - 24px);max-height:calc(100vh - 24px);background:#fff;color:#1d2a2e;font:15px/1.5 Inter,system-ui,sans-serif}'+
  'dialog.pcA-d::backdrop{background:rgba(8,20,24,.6)}'+
  '.pcA-h{display:flex;justify-content:space-between;align-items:start;gap:10px;padding:16px 18px 4px}.pcA-h h2{margin:0;font:500 22px Fraunces,Georgia,serif}'+
  '.pcA-x{border:1px solid #e3e6e8;background:#fff;border-radius:99px;width:38px;height:38px;font-size:18px;cursor:pointer;flex:none}'+
  '.pcA-b{padding:6px 18px 18px;overflow:auto;max-height:calc(100vh - 100px)}'+
  '.pcA-b label{display:block;font-size:12px;color:#5d6b70;margin:8px 0 4px}'+
  '.pcA-b input[type=text],.pcA-b input[type=tel],.pcA-b input[type=email]{width:100%;padding:11px;border:1px solid #e3e6e8;border-radius:10px;font:inherit}'+
  '.pcA-chk{display:flex;gap:8px;align-items:flex-start;font-size:13px;color:#5d6b70;margin:12px 0}.pcA-chk input{margin-top:3px;width:18px;height:18px;flex:none}'+
  '.pcA-err{color:#b3261e;font-size:13px;min-height:18px}'+
  '.pcA-prev{white-space:pre-wrap;font-size:13px;background:#f5f6f7;border:1px solid #e3e6e8;border-radius:12px;padding:12px;max-height:220px;overflow:auto}'+
  '.pcA-cta{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}'+
  '.pcA-btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border:0;cursor:pointer;font:600 14px Inter,system-ui,sans-serif;padding:12px 18px;border-radius:99px;color:#fff}'+
  '.pcA-z{background:#1a8f4c}.pcA-c{background:#0058A3}.pcA-g{background:#f5f6f7;color:#1d2a2e;border:1px solid #e3e6e8}'+
  '.pcA-n{font-size:12.5px;color:#5d6b70;margin:8px 0 0}';

  function isApres(){return document.documentElement.classList.contains('pc-apres');}
  function setApres(on,fs){
    document.documentElement.classList.toggle('pc-apres',on);
    var b=$('pcAap'); if(b){b.setAttribute('aria-pressed',on?'true':'false');b.textContent=on?'Sair da apresentação':'Modo apresentação';}
    ss(function(){on?sessionStorage.setItem(KEY,'1'):sessionStorage.removeItem(KEY);});
    if(fs){ try{ if(on&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(function(){}); else if(!on&&document.fullscreenElement)document.exitFullscreen(); }catch(e){} }
  }

  function pagina(){
    var h1=document.querySelector('h1'), md=document.querySelector('meta[name=description]'), cn=document.querySelector('link[rel=canonical]');
    var local=/^(localhost|127\.)/.test(location.hostname), base=local?location.origin:cfg().siteUrl;
    return {titulo:(document.title||(h1&&h1.textContent)||'').replace(/\s+/g,' ').trim(), desc:(md&&md.content||'').trim(), url:base+location.pathname.replace(/index\.html$/,'')};
  }
  function fone(v){var d=String(v||'').replace(/\D/g,''); if(d.length===10||d.length===11)d='55'+d; return (d.length>=12&&d.length<=13&&d.indexOf('55')===0)?d:'';}
  function texto(pg,nome,zap){
    var B=zap?'*':'',C=cfg(),L=[B+'Resumo — '+pg.titulo+B+(nome?' | para '+nome:''),''];
    if(pg.desc)L.push(pg.desc,'');
    L.push('Link: '+pg.url,'');
    L.push('Valores, disponibilidade e condições podem ter mudado e só valem após confirmação. Simulação de financiamento é estimativa, não é proposta oficial, e a aprovação depende da análise do banco. Nenhum retorno ou valorização é garantido.','');
    L.push('Paulo Cotrim · '+C.creci+' · WhatsApp '+C.telefoneExibicao+' · '+C.siteUrl);
    return L.join('\n');
  }
  function fecha(){var d=$('pcAd');if(d.close)d.close();else d.removeAttribute('open');}
  function abre(){
    var pg=pagina(), ap=isApres(), d=$('pcAd');
    $('pcAt').textContent=ap?'Resumo completo para o cliente':'Receber resumo completo';
    $('pcAb').innerHTML='<p style="margin:4px 0 0">Resumo de: <strong>'+esc(pg.titulo)+'</strong></p>'+
      '<form id="pcAf" novalidate><label for="pcAn">Nome</label><input type="text" id="pcAn" autocomplete="name">'+
      '<label for="pcAt2">WhatsApp com DDD</label><input type="tel" id="pcAt2" autocomplete="tel" inputmode="tel" placeholder="(21) 99999-9999">'+
      '<label for="pcAe">E-mail (para receber por e-mail)</label><input type="email" id="pcAe" autocomplete="email">'+
      '<label class="pcA-chk"><input type="checkbox" id="pcAc"><span>'+(ap?'O cliente autoriza':'Autorizo')+' Paulo Cotrim a usar estes dados para enviar este resumo e falar sobre o imóvel. Dados protegidos conforme a <a href="'+PRIV+'" target="_blank" rel="noopener">política de privacidade</a>; pode pedir a exclusão quando quiser.</span></label>'+
      '<div class="pcA-err" id="pcAr" role="alert"></div><button type="submit" class="pcA-btn pcA-c">Gerar resumo</button></form>';
    if(!d.open){ if(d.showModal)d.showModal(); else d.setAttribute('open',''); }
    $('pcAf').onsubmit=function(ev){
      ev.preventDefault();
      var nome=$('pcAn').value.trim(), tel=fone($('pcAt2').value), em=$('pcAe').value.trim(), er=$('pcAr');
      if(nome.length<2){er.textContent='Informe o nome.';$('pcAn').focus();return;}
      if(!tel){er.textContent='Informe o WhatsApp com DDD, por exemplo (21) 99999-9999.';$('pcAt2').focus();return;}
      if(em&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){er.textContent='Confira o e-mail digitado.';$('pcAe').focus();return;}
      if(!$('pcAc').checked){er.textContent='É preciso concordar com o uso dos dados para gerar o resumo.';$('pcAc').focus();return;}
      try{ if(window.enviarLeadCRM)window.enviarLeadCRM({nome:nome,telefone:tel,email:em,interesse:'Resumo: '+pg.titulo,origem:ap?'site-videochamada':'site-resumo',temp:'quente',obs:'Pediu resumo completo da página '+pg.url+'. Consentimento LGPD marcado em '+new Date().toISOString().slice(0,10)+'.'}); }catch(x){}
      pronto(pg,nome,tel,em,ap);
    };
  }
  function pronto(pg,nome,tel,em,ap){
    var C=cfg(), tz=texto(pg,nome,true), te=texto(pg,nome,false), as='Resumo — '+pg.titulo+' | Paulo Cotrim';
    var zap=ap?'https://wa.me/'+tel+'?text='+encodeURIComponent(tz):'https://wa.me/'+C.whatsapp+'?text='+encodeURIComponent(tz+'\n\nMeu contato: '+nome+' · '+tel);
    var gm=em?'https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(em)+'&su='+encodeURIComponent(as)+'&body='+encodeURIComponent(te):'';
    var mt=em?'mailto:'+encodeURIComponent(em)+'?subject='+encodeURIComponent(as)+'&body='+encodeURIComponent(te):'';
    $('pcAb').innerHTML='<p style="margin:4px 0 8px"><strong>Resumo pronto.</strong> '+(ap?'Os botões abrem o seu WhatsApp e o seu e-mail com a mensagem pronta para '+esc(nome)+'. Você confere e envia.':'Escolha como receber. Nada é enviado sem o seu clique.')+'</p>'+
      '<div class="pcA-prev" id="pcAp">'+esc(te)+'</div><div class="pcA-cta"><a class="pcA-btn pcA-z" target="_blank" rel="noopener" href="'+zap+'">'+(ap?'Enviar ao cliente pelo WhatsApp':'Enviar ao Paulo pelo WhatsApp')+'</a>'+
      (em?'<a class="pcA-btn pcA-c" target="_blank" rel="noopener" href="'+gm+'">'+(ap?'Enviar por e-mail (Gmail)':'Abrir e-mail (Gmail)')+'</a><a class="pcA-btn pcA-g" href="'+mt+'">Outro programa de e-mail</a>':'')+
      '<button type="button" class="pcA-btn pcA-g" id="pcAcp">Copiar resumo</button></div>'+(em?'':'<p class="pcA-n">Sem e-mail informado, o envio por e-mail fica indisponível.</p>');
    $('pcAcp').onclick=function(){var b=this; if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(te).then(function(){b.textContent='Copiado';},sel);}else sel(); function sel(){var r=document.createRange();r.selectNodeContents($('pcAp'));var g=getSelection();g.removeAllRanges();g.addRange(r);}};
  }

  function init(){
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    var bar=document.createElement('div'); bar.className='pcA-bar';
    bar.innerHTML='<button type="button" class="pcA-ap" id="pcAap" aria-pressed="false" title="Tela cheia, letras maiores, ideal para videochamada">Modo apresentação</button><button type="button" class="pcA-rs" id="pcArs">Enviar resumo</button>';
    document.body.appendChild(bar);
    var d=document.createElement('dialog'); d.className='pcA-d'; d.id='pcAd'; d.setAttribute('aria-labelledby','pcAt');
    d.innerHTML='<div class="pcA-h"><h2 id="pcAt"></h2><button type="button" class="pcA-x" id="pcAx" aria-label="Fechar">×</button></div><div class="pcA-b" id="pcAb"></div>';
    document.body.appendChild(d);
    $('pcAap').addEventListener('click',function(){setApres(!isApres(),true);});
    $('pcArs').addEventListener('click',abre);
    $('pcAx').addEventListener('click',fecha);
    d.addEventListener('click',function(ev){if(ev.target===d)fecha();});
    document.addEventListener('fullscreenchange',function(){ if(!document.fullscreenElement&&isApres()){ /* sair da tela cheia não desliga o modo; continua nas próximas páginas */ } });
    if(ss(function(){return sessionStorage.getItem(KEY);})||/[?&]apresentar=1/.test(location.search))setApres(true,false);
  }
  function boot(){
    if(!window.BARRA_CFG){var s=document.createElement('script');s.src='barra-config.js';s.onload=s.onerror=init;document.head.appendChild(s);} else init();
    if(!window.enviarLeadCRM){var c=document.createElement('script');c.src='crm-config.js';document.head.appendChild(c);}
  }
  if(document.readyState!=='loading')boot(); else document.addEventListener('DOMContentLoaded',boot);
})();

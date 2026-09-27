/**
 * preco-dolar.js — Preço na moeda do país selecionado (bandeira), com o R$ real atrás da lupa.
 * Idioma/moeda vêm do i18n.js (evento 'pc-ccy' + window.PC_CCY). Sem seleção, mostra US$.
 *  - PT/BRL: mostra R$ (sem lupa).  EN/USD e ES·IT/EUR: mostra na moeda + lupa revela o R$ real.
 *  - Cotações (USD-BRL, EUR-BRL) ao vivo, cacheadas por 3 dias. Nada inventado: sem data-brl → "Sob consulta".
 */
(function(){
  var TTL=3*24*60*60*1000, KEY='fx_rates_v1';
  var API='https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL';
  var RATES=null; // {USD:brlPerUsd, EUR:brlPerEur}

  function ccy(){ var c=(window.PC_CCY&&window.PC_CCY.code); if(c)return c;
    try{return localStorage.getItem('pc_ccy')||'USD';}catch(e){return 'USD';} }
  function sym(c){return c==='BRL'?'R$':c==='EUR'?'€':'US$';}
  function loc(c){return c==='BRL'?'pt-BR':c==='EUR'?'de-DE':'en-US';}
  function fmt(v,c){return sym(c)+' '+Math.round(v).toLocaleString(loc(c));}
  function conv(brl,c){ if(c==='BRL'||!RATES)return brl; var r=RATES[c]; return r?brl/r:brl; }

  function getCached(){try{var x=JSON.parse(localStorage.getItem(KEY)||'null');
    if(x&&x.USD&&(Date.now()-x.ts)<TTL)return x;}catch(e){}return null;}
  function setCached(r){try{r.ts=Date.now();localStorage.setItem(KEY,JSON.stringify(r));}catch(e){}}
  function fetchRates(){
    return fetch(API).then(function(r){return r.json();}).then(function(j){
      var u=j&&j.USDBRL&&parseFloat(j.USDBRL.bid), e=j&&j.EURBRL&&parseFloat(j.EURBRL.bid);
      if(!u)throw new Error('sem cotação'); RATES={USD:u,EUR:e||null}; setCached(RATES); return RATES;
    });
  }

  function one(el){
    var brl=parseFloat(el.getAttribute('data-brl')||'');
    if(!brl||isNaN(brl)){el.innerHTML='<span class="pu-consulta">Sob consulta</span>';return;}
    var c=ccy();
    if(c==='BRL'||!RATES){
      el.innerHTML='<span class="pu-usd">'+fmt(brl,'BRL')+'</span>';
      return;
    }
    var v=conv(brl,c);
    el.innerHTML=
      '<span class="pu-usd">'+fmt(v,c)+'</span>'
      +'<button class="pu-lupa" type="button" aria-label="Ver em Reais" title="Ver em R$"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></button>'
      +'<span class="pu-brl" hidden>'+fmt(brl,'BRL')+'</span>'
      +'<span class="pu-cot">'+sym(c)+' 1 = '+fmt((c==='EUR'?RATES.EUR:RATES.USD),'BRL').replace('R$ ','R$ ')+' · atualiza a cada 3 dias</span>';
    var lupa=el.querySelector('.pu-lupa'), br=el.querySelector('.pu-brl');
    lupa.addEventListener('click',function(){
      if(br.hasAttribute('hidden')){br.removeAttribute('hidden');lupa.classList.add('on');}
      else{br.setAttribute('hidden','');lupa.classList.remove('on');}
      if(window.trackEvent)trackEvent('preco_real_revelado',{});
    });
  }
  function renderAll(){ var els=document.querySelectorAll('.preco-usd'); [].forEach.call(els,one); }

  function boot(){
    if(!document.querySelector('.preco-usd'))return;
    var c=getCached();
    if(c){RATES={USD:c.USD,EUR:c.EUR};renderAll();}
    else fetchRates().then(renderAll).catch(function(){RATES=null;renderAll();});
    document.addEventListener('pc-ccy',renderAll);
  }
  if(document.readyState!=='loading')boot(); else document.addEventListener('DOMContentLoaded',boot);
})();

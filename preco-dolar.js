/**
 * preco-dolar.js — Preço em DÓLAR na frente, REAL escondido atrás da lupa.
 * ------------------------------------------------------------------------
 * Padrão alto padrão (comprador/investidor internacional):
 *  - Mostra o valor em US$ (convertido do preço real em R$).
 *  - O valor em R$ fica oculto; clicar na lupa revela.
 *  - A cotação do dólar é buscada ao vivo e CACHEADA por 3 dias
 *    (atualiza de 3 em 3 dias, conforme o valor do dólar do dia).
 *
 * Uso no HTML:
 *   <div class="preco-usd" data-brl="1250000"></div>
 *   (sem data-brl, ou vazio → "Sob consulta", sem inventar dólar)
 *   <script src="preco-dolar.js" defer></script>
 * ------------------------------------------------------------------------
 */
(function(){
  var TTL = 3*24*60*60*1000;            // 3 dias
  var KEY = 'usdbrl_rate_v1';
  var API = 'https://economia.awesomeapi.com.br/last/USD-BRL';  // cotação pública

  function fmtUSD(v){ return 'US$ ' + Math.round(v).toLocaleString('en-US'); }
  function fmtBRL(v){ return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); }

  function getCached(){
    try{ var c = JSON.parse(localStorage.getItem(KEY)||'null');
      if(c && c.rate && (Date.now()-c.ts) < TTL) return c; }catch(e){}
    return null;
  }
  function setCached(rate){
    try{ localStorage.setItem(KEY, JSON.stringify({rate:rate, ts:Date.now()})); }catch(e){}
  }

  function fetchRate(){
    return fetch(API).then(function(r){return r.json();}).then(function(j){
      var bid = j && j.USDBRL && parseFloat(j.USDBRL.bid);
      if(!bid || isNaN(bid)) throw new Error('sem cotação');
      setCached(bid); return bid;
    });
  }

  function renderAll(rate, aprox){
    document.querySelectorAll('.preco-usd').forEach(function(el){
      if(el.dataset.done) return;
      var brl = parseFloat(el.getAttribute('data-brl')||'');
      if(!brl || isNaN(brl)){
        el.innerHTML = '<span class="pu-consulta">Sob consulta</span>';
        el.dataset.done = '1'; return;
      }
      var usd = brl / rate;
      el.innerHTML =
        '<span class="pu-usd">'+fmtUSD(usd)+'</span>'
        +'<button class="pu-lupa" type="button" aria-label="Ver valor em reais" title="Ver em R$">'
        +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></button>'
        +'<span class="pu-brl" hidden>'+fmtBRL(brl)+'</span>'
        +'<span class="pu-cot">câmbio '+ (aprox?'aprox. ':'') +'US$ 1 = '+fmtBRL(rate).replace('R$ ','R$ ')+' · atualiza a cada 3 dias</span>';
      var lupa = el.querySelector('.pu-lupa'), br = el.querySelector('.pu-brl');
      lupa.addEventListener('click', function(){
        var show = br.hasAttribute('hidden');
        if(show){ br.removeAttribute('hidden'); lupa.classList.add('on'); }
        else { br.setAttribute('hidden',''); lupa.classList.remove('on'); }
        if(window.trackEvent) trackEvent('preco_real_revelado',{});
      });
      el.dataset.done = '1';
    });
  }

  function boot(){
    if(!document.querySelector('.preco-usd')) return;
    var c = getCached();
    if(c){ renderAll(c.rate,false); return; }
    fetchRate().then(function(rate){ renderAll(rate,false); })
      .catch(function(){
        var c2 = null; try{ c2 = JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){}
        if(c2 && c2.rate){ renderAll(c2.rate,true); }
        else {
          // sem cotação e sem cache: mostra o Real direto, sem inventar dólar
          document.querySelectorAll('.preco-usd').forEach(function(el){
            if(el.dataset.done) return;
            var brl = parseFloat(el.getAttribute('data-brl')||'');
            el.innerHTML = brl?('<span class="pu-usd">'+fmtBRL(brl)+'</span><span class="pu-cot">cotação do dólar indisponível no momento</span>'):'<span class="pu-consulta">Sob consulta</span>';
            el.dataset.done='1';
          });
        }
      });
  }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();

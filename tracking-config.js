/**
 * tracking-config.js — GA4 + Meta Pixel (remarketing e conversão)
 * ------------------------------------------------------------------
 * Paulo: este arquivo já está pronto e carregado em todo o site.
 * Só falta VOCÊ colar dois IDs abaixo — sem eles, nada é enviado
 * (o site funciona normal, só não gera dado de tracking ainda).
 *
 * 1. GA4_MEASUREMENT_ID — crie uma propriedade em analytics.google.com
 *    (Admin → Criar propriedade → Fluxo de dados Web). O ID começa
 *    com "G-", ex: G-ABC1234XYZ.
 * 2. META_PIXEL_ID — crie em business.facebook.com/events_manager
 *    (Conectar dados → Web → Meta Pixel). É só um número, ex: 123456789012345.
 *
 * Depois de colar os dois valores abaixo, salve — pronto, todo o site
 * (todas as páginas, porque este arquivo é carregado em todas) passa
 * a enviar dado pro Google Analytics e pro Facebook/Instagram Ads,
 * incluindo os eventos que o site já dispara (WhatsApp clicado,
 * simulador usado, formulário enviado, popup de MCMV visto, etc. —
 * ver leads.js) — sem precisar editar mais nada.
 * ------------------------------------------------------------------
 */
var GA4_MEASUREMENT_ID = '';   // ex: 'G-ABC1234XYZ'
var META_PIXEL_ID = '';        // ex: '123456789012345'

(function(){
  // Ponte com os eventos que leads.js já dispara — não precisa duplicar
  // lógica, só espelhar pro GA4/Pixel quando eles existirem. Definida sempre
  // (mesmo sem consentimento ainda) pra não quebrar chamadas de capture().
  window.trackEvent = function(nome, dados){
    if(window.gtag) gtag('event', nome, dados||{});
    if(window.fbq){
      // eventos-chave viram conversões padrão do Meta, o resto vira evento custom
      if(nome==='whatsapp_clicado' || nome==='formulario_enviado') fbq('track','Lead', dados||{});
      else fbq('trackCustom', nome, dados||{});
    }
  };

  // Só carrega os scripts de GA4/Meta Pixel depois que a pessoa aceitar o
  // banner de cookies (LGPD) — ver o banner em leads.js. Se ela já aceitou
  // em visita anterior (localStorage), carrega direto.
  window.__initTrackingScripts = function(){
    if(window.__trackingScriptsLoaded) return;
    window.__trackingScriptsLoaded = true;

    if(GA4_MEASUREMENT_ID){
      var s1 = document.createElement('script');
      s1.async = true;
      s1.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
      document.head.appendChild(s1);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', GA4_MEASUREMENT_ID);
    }

    if(META_PIXEL_ID){
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', META_PIXEL_ID);
      fbq('track', 'PageView');
    }
  };

  try{
    if(localStorage.getItem('cookieConsent') === 'accepted') window.__initTrackingScripts();
  }catch(e){}
})();

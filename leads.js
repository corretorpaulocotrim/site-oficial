/**
 * leads.js — Captura de leads no Google Sheets
 * Endpoint: substitua SHEET_URL pela URL do Google Apps Script
 * Paulo Cotrim · corretorpaulocotrim@gmail.com
 */
(function(){
  var SHEET_URL = 'https://script.google.com/macros/s/SEU_SCRIPT_ID_AQUI/exec';

  function capture(evento, dados){
    var payload = Object.assign({
      evento: evento,
      ts: new Date().toISOString(),
      pagina: location.pathname,
      ref: document.referrer || 'direto',
      ua: navigator.userAgent.substring(0,80)
    }, dados || {});

    // Beacon API (non-blocking, works on page unload)
    if(navigator.sendBeacon){
      var blob = new Blob([JSON.stringify(payload)], {type:'application/json'});
      navigator.sendBeacon(SHEET_URL, blob);
    } else {
      fetch(SHEET_URL, {
        method:'POST',
        body: JSON.stringify(payload),
        headers:{'Content-Type':'application/json'},
        keepalive: true
      }).catch(function(){});
    }
  }

  // ─── EVENTOS AUTOMÁTICOS ─────────────────────────────────────────────

  // 1. Visualização de página
  window.addEventListener('DOMContentLoaded', function(){
    capture('pagina_visualizada', {titulo: document.title});
  });

  // 2. Mapa: propriedade clicada (disparado pelo mapa Órulo)
  window.leadMapaClick = function(imovel){
    capture('mapa_imovel_clicado', {imovel: imovel});
  };

  // 3. Simulador usado
  window.leadSimulador = function(tipo){
    capture('simulador_usado', {simulador: tipo});
  };

  // 4. Botão WhatsApp clicado (qualquer botão WA)
  document.addEventListener('click', function(e){
    var el = e.target.closest('a[href*="wa.me"]');
    if(el){
      var text = decodeURIComponent(el.href.split('text=')[1]||'').substring(0,120);
      capture('whatsapp_clicado', {texto: text, btn_label: el.textContent.trim().substring(0,40)});
    }
  });

  // 5. Formulário de contato enviado
  window.leadFormulario = function(nome, telefone, interesse){
    capture('formulario_enviado', {nome: nome||'', telefone: telefone||'', interesse: interesse||''});
  };

  // 6. Tabela Direta usada
  window.leadTabelaDireta = function(empreendimento, tipologia, valor){
    capture('tabela_direta_calculada', {empreendimento: empreendimento||'', tipologia: tipologia||'', valor: valor||''});
  };

  // 7. Scroll 50% — engajamento
  var scroll50fired = false;
  window.addEventListener('scroll', function(){
    if(!scroll50fired && (window.scrollY/(document.body.scrollHeight-window.innerHeight))>.5){
      scroll50fired = true;
      capture('scroll_50pct');
    }
  }, {passive:true});

  // Expor para uso externo
  window.leadCapture = capture;
})();

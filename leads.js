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

    if(window.trackEvent) window.trackEvent(evento, dados||{});

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

  window.addEventListener('DOMContentLoaded', function(){
    capture('pagina_visualizada', {titulo: document.title});
  });

  window.leadMapaClick = function(imovel){
    capture('mapa_imovel_clicado', {imovel: imovel});
  };

  window.leadSimulador = function(tipo){
    capture('simulador_usado', {simulador: tipo});
  };

  document.addEventListener('click', function(e){
    var el = e.target.closest('a[href*="wa.me"]');
    if(el){
      var text = decodeURIComponent(el.href.split('text=')[1]||'').substring(0,120);
      capture('whatsapp_clicado', {texto: text, btn_label: el.textContent.trim().substring(0,40)});
    }
  });

  window.leadFormulario = function(nome, telefone, interesse){
    capture('formulario_enviado', {nome: nome||'', telefone: telefone||'', interesse: interesse||''});
  };

  window.leadTabelaDireta = function(empreendimento, tipologia, valor){
    capture('tabela_direta_calculada', {empreendimento: empreendimento||'', tipologia: tipologia||'', valor: valor||''});
  };

  window.leadNewsletter = function(email){
    capture('newsletter_inscricao', {email: email||''});
  };

  var scroll50fired = false;
  window.addEventListener('scroll', function(){
    if(!scroll50fired && (window.scrollY/(document.body.scrollHeight-window.innerHeight))>.5){
      scroll50fired = true;
      capture('scroll_50pct');
    }
  }, {passive:true});

  (function(){
    if(sessionStorage.getItem('mcmv_popup_shown')) return;
    if(/aprovacao-expressa|simulador|documentos|admin|crm/.test(location.pathname)) return;
    setTimeout(function(){
      if(sessionStorage.getItem('mcmv_popup_shown')) return;
      sessionStorage.setItem('mcmv_popup_shown','1');
      injectMcmvPopup();
      capture('mcmv_popup_exibido');
    }, 120000);
  })();

  function injectMcmvPopup(){
    var wrap = document.createElement('div');
    wrap.id = 'mcmvPopupOverlay';
    wrap.setAttribute('style','position:fixed;inset:0;z-index:9999;background:rgba(15,46,54,.62);display:flex;align-items:center;justify-content:center;padding:20px;animation:mcmvFadeIn .35s ease');
    wrap.innerHTML = ''
      +'<style>@keyframes mcmvFadeIn{from{opacity:0}to{opacity:1}}@keyframes mcmvPop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}</style>'
      +'<div style="background:#fff;border-radius:18px;max-width:460px;width:100%;padding:34px 30px 28px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.35);font-family:Inter,system-ui,sans-serif;animation:mcmvPop .4s cubic-bezier(.16,1,.3,1)">'
      +'  <button id="mcmvPopupClose" aria-label="Fechar" style="position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;background:#f5f6f7;border:none;font-size:18px;color:#6b7280;cursor:pointer;line-height:1">&times;</button>'
      +'  <div style="display:inline-flex;align-items:center;gap:7px;background:#e7edee;color:#0f2e36;font-size:11.5px;font-weight:700;padding:6px 13px;border-radius:999px;text-transform:uppercase;letter-spacing:.04em;margin-bottom:16px">Minha Casa Minha Vida</div>'
      +'  <h3 style="font-family:Fraunces,Georgia,serif;font-size:22px;font-weight:600;color:#0f2e36;line-height:1.25;margin-bottom:12px">O que você ganha comprando dentro do programa</h3>'
      +'  <ul style="list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:22px">'
      +      mcmvBenefit('ITBI e RGI grátis','O comprador não paga documentação de cartório nem registro do imóvel.')
      +      mcmvBenefit('Entrada facilitada','Gratuita ou parcelada sem juros durante o período da obra.')
      +      mcmvBenefit('Prestação fixa pós-chaves','Você só começa a pagar o financiamento depois de receber as chaves.')
      +      mcmvBenefit('FGTS na compra','Pode ser usado para abater entrada ou parte do financiamento.')
      +'  </ul>'
      +'  <a href="https://wa.me/5521989150864?text=Ol%C3%A1%21%20Quero%20entender%20os%20benef%C3%ADcios%20do%20Minha%20Casa%20Minha%20Vida%20na%20pr%C3%A1tica." id="mcmvPopupCta" style="display:flex;align-items:center;justify-content:center;gap:9px;background:#b8873a;color:#fff;padding:14px 20px;border-radius:12px;font-size:14.5px;font-weight:700;text-decoration:none;box-shadow:0 10px 26px rgba(184,135,58,.3)">Quero entender na prática</a>'
      +'  <button id="mcmvPopupDismiss" style="display:block;width:100%;background:none;border:none;color:#6b7280;font-size:12.5px;margin-top:12px;cursor:pointer;text-decoration:underline">Agora não</button>'
      +'</div>';
    document.body.appendChild(wrap);
    function close(){ wrap.remove(); }
    document.getElementById('mcmvPopupClose').onclick = close;
    document.getElementById('mcmvPopupDismiss').onclick = close;
    wrap.addEventListener('click', function(e){ if(e.target===wrap) close(); });
    document.getElementById('mcmvPopupCta').addEventListener('click', function(){ capture('mcmv_popup_clicado'); });
  }
  function mcmvBenefit(titulo, desc){
    return '<li style="display:flex;gap:11px;align-items:flex-start">'
      +'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a8f4c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><path d="M20 6 9 17l-5-5"/></svg>'
      +'<span style="font-size:13.5px;color:#0f2e36;line-height:1.5"><b>'+titulo+'</b><br><span style="color:#6b7280">'+desc+'</span></span>'
      +'</li>';
  }

  (function(){
    if(sessionStorage.getItem('exitPopupShown'))return;
    if(/aprovacao-expressa|simulador|documentos|admin|crm/.test(location.pathname))return;
    var siteEnterTime = Date.now();
    var minTimeMs = 15000;
    function trigger(motivo){
      if(sessionStorage.getItem('exitPopupShown'))return;
      if(Date.now()-siteEnterTime < minTimeMs)return;
      sessionStorage.setItem('exitPopupShown','1');
      injectExitPopup();
      capture('exit_popup_exibido', {motivo:motivo});
    }
    document.addEventListener('mouseleave', function(e){
      if(e.clientY <= 0) trigger('mouseleave-topo');
    });
    var inactivityTimer;
    function resetInactivity(){
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(function(){
        if(window.scrollY > window.innerHeight * 0.5) trigger('inatividade-mobile');
      }, 40000);
    }
    ['scroll','touchstart','click'].forEach(function(ev){ document.addEventListener(ev, resetInactivity, {passive:true}); });
    resetInactivity();
  })();

  function injectExitPopup(){
    var wrap = document.createElement('div');
    wrap.id = 'exitPopupOverlay';
    wrap.setAttribute('style','position:fixed;inset:0;z-index:9999;background:rgba(15,46,54,.66);display:flex;align-items:center;justify-content:center;padding:20px;animation:exitFadeIn .3s ease');
    wrap.innerHTML = ''
      +'<style>@keyframes exitFadeIn{from{opacity:0}to{opacity:1}}@keyframes exitPop{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}</style>'
      +'<div style="background:#fff;border-radius:18px;max-width:440px;width:100%;padding:32px 28px 26px;position:relative;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.35);font-family:Inter,system-ui,sans-serif;animation:exitPop .4s cubic-bezier(.16,1,.3,1)">'
      +'  <button id="exitPopupClose" aria-label="Fechar" style="position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;background:#f5f6f7;border:none;font-size:18px;color:#6b7280;cursor:pointer;line-height:1">&times;</button>'
      +'  <div style="width:52px;height:52px;border-radius:50%;background:#e7edee;display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b8873a" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>'
      +'  <h3 style="font-family:Fraunces,Georgia,serif;font-size:21px;font-weight:600;color:#0f2e36;line-height:1.25;margin-bottom:10px">Antes de sair, uma coisa rápida</h3>'
      +'  <p style="font-size:13.5px;color:#6b7280;line-height:1.6;margin-bottom:20px">Me manda seu WhatsApp que eu te envio a tabela atualizada, com valores e condições, sem compromisso nenhum.</p>'
      +'  <a href="https://wa.me/5521989150864?text=Ol%C3%A1%21%20Quero%20receber%20a%20tabela%20atualizada%20de%20valores%20e%20condi%C3%A7%C3%B5es." id="exitPopupCta" style="display:flex;align-items:center;justify-content:center;gap:9px;background:#b8873a;color:#fff;padding:14px 20px;border-radius:12px;font-size:14.5px;font-weight:700;text-decoration:none;box-shadow:0 10px 26px rgba(184,135,58,.3)">Quero receber a tabela</a>'
      +'  <button id="exitPopupDismiss" style="display:block;width:100%;background:none;border:none;color:#6b7280;font-size:12.5px;margin-top:12px;cursor:pointer;text-decoration:underline">Não, obrigado</button>'
      +'</div>';
    document.body.appendChild(wrap);
    function close(){ wrap.remove(); }
    document.getElementById('exitPopupClose').onclick = close;
    document.getElementById('exitPopupDismiss').onclick = close;
    wrap.addEventListener('click', function(e){ if(e.target===wrap) close(); });
    document.getElementById('exitPopupCta').addEventListener('click', function(){ capture('exit_popup_clicado'); });
  }

  (function(){
    var waBtn = document.querySelector('.wafloat');
    if(!waBtn) return;
    var hour = new Date().getHours();
    var online = hour >= 8 && hour < 21;
    var style = document.createElement('style');
    style.textContent = '@keyframes waPulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.55)}70%{box-shadow:0 0 0 9px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}@keyframes waBubbleIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}';
    document.head.appendChild(style);
    var dot = document.createElement('span');
    dot.id = 'waStatusDot';
    dot.setAttribute('style','position:absolute;top:-2px;right:-2px;width:14px;height:14px;border-radius:50%;border:2.5px solid #fff;background:'+(online?'#22c55e':'#9ca3af')+';'+(online?'animation:waPulse 2s infinite':''));
    waBtn.appendChild(dot);

    if(!sessionStorage.getItem('waStatusSeen')){
      sessionStorage.setItem('waStatusSeen','1');
      setTimeout(function(){
        var bubble = document.createElement('div');
        bubble.id = 'waStatusBubble';
        bubble.setAttribute('style','position:fixed;z-index:998;bottom:88px;right:24px;background:#0f2e36;color:#fff;padding:9px 14px;border-radius:10px 10px 2px 10px;font-family:Inter,system-ui,sans-serif;font-size:12.5px;font-weight:600;box-shadow:0 8px 22px rgba(15,46,54,.3);display:flex;align-items:center;gap:7px;animation:waBubbleIn .3s ease;max-width:220px');
        bubble.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:'+(online?'#4ade80':'#9ca3af')+';flex-shrink:0"></span>'
          + (online ? 'Paulo está online agora' : 'Responde em breve');
        document.body.appendChild(bubble);
        setTimeout(function(){
          bubble.style.transition='opacity .4s';
          bubble.style.opacity='0';
          setTimeout(function(){ bubble.remove(); },400);
        }, 5000);
      }, 2500);
    }
  })();

  (function(){
    var badge = document.querySelector('.hero-status');
    if(!badge || document.getElementById('scarcityNote')) return;
    var txt = (badge.textContent||'').trim().toLowerCase();
    var msg = 'Consulte a disponibilidade atualizada agora — a tabela muda conforme as reservas da construtora.';
    if(txt.indexOf('lançamento') > -1) msg = 'Fase de lançamento: as condições e o valor tendem a subir a cada nova etapa de vendas liberada pela construtora.';
    else if(txt.indexOf('últimas') > -1 || txt.indexOf('final') > -1) msg = 'Últimas unidades desta fase — a disponibilidade por tipologia muda conforme a construtora atualiza a tabela.';
    else if(txt.indexOf('obras') > -1 || txt.indexOf('em construção') > -1) msg = 'Em obras: valor e condições de entrada mudam conforme o avanço da construção. Consulte a tabela vigente.';
    else if(txt.indexOf('pronto') > -1 || txt.indexOf('entrega') > -1) msg = 'Pronto para morar — unidades remanescentes, chaves na entrega. Consulte quais tipologias ainda estão disponíveis.';
    var note = document.createElement('div');
    note.id = 'scarcityNote';
    note.setAttribute('style','display:inline-block;margin-top:10px;font-size:12px;font-weight:600;color:#fff;background:rgba(15,46,54,.55);backdrop-filter:blur(6px);padding:6px 12px;border-radius:20px;max-width:360px;line-height:1.4');
    note.textContent = msg;
    badge.insertAdjacentElement('afterend', note);
  })();

  (function(){
    if(/aprovacao-expressa|simulador|documentos|admin|crm/.test(location.pathname)) return;
    document.addEventListener('click', function(e){
      var link = e.target.closest && e.target.closest('a[href*="wa.me"]');
      if(!link) return;
      if(sessionStorage.getItem('waLeadCaptured')) return;
      if(link.closest('#mcmvPopupOverlay, #exitPopupOverlay, #featuredPopupOverlay')) return;
      e.preventDefault();
      showWaLeadModal(link.href);
    }, true);

    function showWaLeadModal(destino){
      if(document.getElementById('waLeadOverlay')) return;
      var wrap = document.createElement('div');
      wrap.id = 'waLeadOverlay';
      wrap.setAttribute('style','position:fixed;inset:0;z-index:10000;background:rgba(15,46,54,.66);display:flex;align-items:center;justify-content:center;padding:20px;animation:exitFadeIn .25s ease');
      wrap.innerHTML = ''
        +'<style>@keyframes exitFadeIn{from{opacity:0}to{opacity:1}}</style>'
        +'<div style="background:#fff;border-radius:18px;max-width:400px;width:100%;padding:28px 26px 22px;text-align:left;box-shadow:0 30px 80px rgba(0,0,0,.35);font-family:Inter,system-ui,sans-serif">'
        +'  <div style="width:46px;height:46px;border-radius:50%;background:#e7edee;display:flex;align-items:center;justify-content:center;margin-bottom:14px"><svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.373 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div>'
        +'  <h3 style="font-family:Fraunces,Georgia,serif;font-size:19px;font-weight:600;color:#0f2e36;margin-bottom:6px">Antes de ir pro WhatsApp</h3>'
        +'  <p style="font-size:13px;color:#6b7280;line-height:1.55;margin-bottom:16px">Deixe seu nome e WhatsApp pra eu já te chamar com a tabela pronta — ou pule e vá direto pra conversa.</p>'
        +'  <input id="waLeadNome" type="text" placeholder="Seu nome" autocomplete="name" style="width:100%;padding:11px 14px;border:1.5px solid #e8eaed;border-radius:10px;font-size:14px;margin-bottom:9px;font-family:inherit;box-sizing:border-box">'
        +'  <input id="waLeadFone" type="tel" placeholder="Seu WhatsApp (opcional)" autocomplete="tel" style="width:100%;padding:11px 14px;border:1.5px solid #e8eaed;border-radius:10px;font-size:14px;margin-bottom:14px;font-family:inherit;box-sizing:border-box">'
        +'  <div id="waLeadHorarioWrap" style="display:none;margin-bottom:14px">'
        +'    <label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Melhor horário para te ligarmos</label>'
        +'    <select id="waLeadHorario" style="width:100%;padding:11px 14px;border:1.5px solid #e8eaed;border-radius:10px;font-size:14px;font-family:inherit;box-sizing:border-box">'
        +'      <option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option>'
        +'    </select>'
        +'  </div>'
        +'  <button id="waLeadGo" style="width:100%;background:#25D366;color:#fff;border:none;padding:13px;border-radius:10px;font-size:14.5px;font-weight:700;cursor:pointer;margin-bottom:8px">Continuar para o WhatsApp</button>'
        +'  <button id="waLeadCallback" style="width:100%;background:none;border:1.5px solid #e8eaed;color:#0f2e36;font-size:12.5px;font-weight:600;padding:10px;border-radius:10px;cursor:pointer;margin-bottom:8px">Prefiro que me liguem</button>'
        +'  <button id="waLeadSkip" style="width:100%;background:none;border:none;color:#6b7280;font-size:12.5px;padding:6px;cursor:pointer;text-decoration:underline">Pular e continuar</button>'
        +'</div>';
      document.body.appendChild(wrap);
      var wantsCallback = false;
      function go(){
        sessionStorage.setItem('waLeadCaptured','1');
        var nome = (document.getElementById('waLeadNome').value||'').trim();
        var fone = (document.getElementById('waLeadFone').value||'').trim();
        if(wantsCallback){
          var horario = document.getElementById('waLeadHorario').value;
          if(!fone){ document.getElementById('waLeadFone').focus(); return; }
          capture('pedido_de_ligacao', {nome: nome, telefone: fone, horario: horario});
          var msg = 'Olá! Meu nome é ' + (nome||'(não informado)') + ', meu telefone é ' + fone + ' e prefiro ser contatado no período: ' + horario + '. Pode me ligar?';
          wrap.remove();
          window.open('https://wa.me/5521989150864?text=' + encodeURIComponent(msg), '_blank');
          return;
        }
        if(nome || fone) capture('whatsapp_lead_form', {nome: nome, telefone: fone});
        wrap.remove();
        window.location.href = destino;
      }
      document.getElementById('waLeadGo').onclick = go;
      document.getElementById('waLeadSkip').onclick = go;
      document.getElementById('waLeadCallback').onclick = function(){
        var horarioWrap = document.getElementById('waLeadHorarioWrap');
        if(!wantsCallback){
          wantsCallback = true;
          horarioWrap.style.display = '';
          this.textContent = 'Confirmar pedido de ligação';
          this.style.background = '#0f2e36';
          this.style.color = '#fff';
          document.getElementById('waLeadGo').style.display = 'none';
        } else {
          go();
        }
      };
      wrap.addEventListener('click', function(e){ if(e.target===wrap) wrap.remove(); });
    }
  })();

  (function(){
    var items = document.querySelectorAll('.faq-item');
    if(!items.length) return;
    var faq = [];
    items.forEach(function(it){
      var qBtn = it.querySelector('.faq-q');
      var aP = it.querySelector('.faq-a p');
      if(!qBtn || !aP) return;
      var qText = '';
      qBtn.childNodes.forEach(function(n){ if(n.nodeType === 3) qText += n.textContent; });
      qText = qText.trim();
      var aText = aP.textContent.trim();
      if(qText && aText) faq.push({
        '@type': 'Question',
        name: qText,
        acceptedAnswer: { '@type': 'Answer', text: aText }
      });
    });
    if(!faq.length) return;
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq });
    document.head.appendChild(script);

    if(!/guia-do-comprador/.test(location.pathname)){
      var faqWrap = items[0].closest('.wrap') || items[0].parentElement;
      var xlink = document.createElement('p');
      xlink.setAttribute('style', 'margin-top:18px;font-size:13.5px;color:var(--gray,#6b7280)');
      xlink.innerHTML = 'Mais dúvidas sobre financiamento, FGTS ou Minha Casa Minha Vida? <a href="guia-do-comprador.html" style="color:var(--gold,#b8873a);font-weight:600">Leia o Guia completo do Comprador →</a>';
      faqWrap.appendChild(xlink);
    }
  })();

  (function(){
    var existing = document.querySelector('script[type="application/ld+json"]');
    if(!existing) return;
    var base;
    try{ base = JSON.parse(existing.textContent); }catch(e){ return; }
    if(!base || base['@type'] !== 'Residence' || !base.name) return;

    var img = document.querySelector('#heroLb img');
    var priceScope = document.querySelector('.tipo-table');
    var offers;
    if(priceScope){
      var nums = (priceScope.innerText.match(/R\$\s?[\d.,]+/g) || [])
        .map(function(s){ return parseInt(s.replace(/[^\d]/g,''),10); })
        .filter(function(n){ return n > 30000 && n < 20000000; });
      if(nums.length){
        offers = {
          '@type': 'AggregateOffer',
          priceCurrency: 'BRL',
          lowPrice: Math.min.apply(null, nums),
          highPrice: Math.max.apply(null, nums),
          availability: 'https://schema.org/InStock'
        };
      }
    }
    var listing = { '@context': 'https://schema.org', '@type': 'RealEstateListing', name: base.name, url: location.href, address: base.address };
    if(img && img.src) listing.image = img.src;
    if(offers) listing.offers = offers;

    if(priceScope){
      var txt = priceScope.innerText;
      var m2 = (txt.match(/(\d+(?:,\d+)?)\s*m²/g) || []).map(function(s){ return parseFloat(s.replace(',','.').replace(/\s*m²/,'')); }).filter(function(n){ return n > 10 && n < 1000; });
      var quartos = (txt.match(/(\d+)\s*quartos?/gi) || []).map(function(s){ return parseInt(s,10); }).filter(function(n){ return n > 0 && n < 10; });
      if(m2.length || quartos.length){
        var accommodation = { '@type': 'Apartment' };
        if(m2.length) accommodation.floorSize = { '@type': 'QuantitativeValue', minValue: Math.min.apply(null, m2), maxValue: Math.max.apply(null, m2), unitCode: 'MTK' };
        if(quartos.length) accommodation.numberOfRooms = Math.min.apply(null, quartos) === Math.max.apply(null, quartos) ? Math.min.apply(null, quartos) : (Math.min.apply(null, quartos) + '-' + Math.max.apply(null, quartos));
        listing.about = accommodation;
      }
    }

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(listing);
    document.head.appendChild(script);
  })();

  (function(){
    var heroC = document.querySelector('.hero-c');
    var h1 = heroC ? heroC.querySelector('h1') : null;
    if(!heroC || !h1) return;
    var pageName = h1.textContent.trim();
    if(!pageName) return;

    var nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'breadcrumb');
    nav.setAttribute('style', 'margin-bottom:10px;font-size:12px;font-weight:600;color:rgba(255,255,255,.85);text-shadow:0 1px 3px rgba(0,0,0,.4)');
    var home = document.createElement('a');
    home.href = 'index.html';
    home.textContent = 'Início';
    home.setAttribute('style', 'color:inherit;text-decoration:underline');
    var sep = document.createElement('span');
    sep.textContent = ' / ';
    sep.setAttribute('style', 'opacity:.65');
    var current = document.createElement('span');
    current.textContent = pageName;
    nav.appendChild(home);
    nav.appendChild(sep);
    nav.appendChild(current);
    heroC.insertBefore(nav, heroC.firstChild);

    var bc = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: new URL('index.html', location.href).href },
        { '@type': 'ListItem', position: 2, name: pageName, item: location.href }
      ]
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(bc);
    document.head.appendChild(s);
  })();

  (function(){
    var heroC = document.querySelector('.hero-c');
    var h1 = heroC ? heroC.querySelector('h1') : null;
    if(!heroC || !h1) return;
    var pageName = h1.textContent.trim();
    if(!pageName) return;

    try{
      var img = document.querySelector('#heroLb img');
      var list = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      list = list.filter(function(it){ return it.url !== location.pathname; });
      list.unshift({ nome: pageName, url: location.pathname, img: img ? img.src : '' });
      if(list.length > 8) list = list.slice(0, 8);
      localStorage.setItem('recentlyViewed', JSON.stringify(list));
    }catch(e){}

    var shareBtn = document.createElement('button');
    shareBtn.setAttribute('aria-label', 'Compartilhar');
    shareBtn.setAttribute('style', 'margin-left:10px;display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.16);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.3);color:#fff;font-size:11.5px;font-weight:600;padding:5px 11px;border-radius:20px;cursor:pointer;vertical-align:middle');
    shareBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5"/></svg>Compartilhar';
    shareBtn.onclick = function(){
      var shareData = { title: pageName + ' — Paulo Cotrim', text: 'Dá uma olhada nesse empreendimento: ' + pageName, url: location.href };
      if(navigator.share){
        navigator.share(shareData).catch(function(){});
      } else if(navigator.clipboard){
        navigator.clipboard.writeText(location.href).then(function(){
          shareBtn.innerHTML = 'Link copiado!';
          setTimeout(function(){ shareBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5"/></svg>Compartilhar'; }, 2200);
        }).catch(function(){});
      }
    };
    var creciBadge = document.createElement('a');
    creciBadge.href = 'https://servico.creci-rj.gov.br/spw/ConsultaCadastral/TelaConsultaPubCompleta.aspx';
    creciBadge.target = '_blank';
    creciBadge.rel = 'noopener';
    creciBadge.setAttribute('style', 'margin-left:8px;display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.16);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.3);color:#fff;font-size:11.5px;font-weight:600;padding:5px 11px;border-radius:20px;text-decoration:none;vertical-align:middle');
    creciBadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>CRECI-RJ 77677-F verificado';

    var bcNav = heroC.querySelector('nav[aria-label="breadcrumb"]');
    if(bcNav){ bcNav.appendChild(shareBtn); bcNav.appendChild(creciBadge); }
    else { heroC.insertBefore(creciBadge, heroC.firstChild); heroC.insertBefore(shareBtn, heroC.firstChild); }

    function getFavorites(){ try{ return JSON.parse(localStorage.getItem('favoritos')||'[]'); }catch(e){ return []; } }
    function setFavorites(list){ try{ localStorage.setItem('favoritos', JSON.stringify(list)); }catch(e){} window.updateFavCounter && window.updateFavCounter(); }
    var favBtn = document.createElement('button');
    favBtn.setAttribute('aria-label', 'Favoritar');
    var isFav = getFavorites().some(function(it){ return it.url === location.pathname; });
    function renderFavBtn(){
      favBtn.setAttribute('style', 'margin-left:8px;display:inline-flex;align-items:center;gap:5px;background:'+(isFav?'rgba(184,135,58,.85)':'rgba(255,255,255,.16)')+';backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.3);color:#fff;font-size:11.5px;font-weight:600;padding:5px 11px;border-radius:20px;cursor:pointer;vertical-align:middle');
      favBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="'+(isFav?'currentColor':'none')+'" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>' + (isFav?'Favoritado':'Favoritar');
    }
    renderFavBtn();
    favBtn.onclick = function(){
      var img = document.querySelector('#heroLb img');
      var list = getFavorites();
      if(isFav){
        list = list.filter(function(it){ return it.url !== location.pathname; });
      } else {
        list.unshift({ nome: pageName, url: location.pathname, img: img ? img.src : '' });
        capture('imovel_favoritado', { imovel: pageName });
      }
      isFav = !isFav;
      renderFavBtn();
      setFavorites(list);
    };
    if(bcNav) bcNav.appendChild(favBtn);
    else heroC.insertBefore(favBtn, heroC.firstChild);
  })();

  (function(){
    function getFavorites(){ try{ return JSON.parse(localStorage.getItem('favoritos')||'[]'); }catch(e){ return []; } }
    var favStyle = document.createElement('style');
    favStyle.textContent = '#favCounterWrap{position:fixed;z-index:996;bottom:26px;left:20px;display:none}'
      + '@media(max-width:760px){#favCounterWrap{bottom:96px}}';
    document.head.appendChild(favStyle);
    var wrap = document.createElement('div');
    wrap.id = 'favCounterWrap';
    wrap.innerHTML = '<button id="favCounterBtn" aria-label="Meus favoritos" style="display:flex;align-items:center;gap:7px;background:#0f2e36;color:#fff;border:none;padding:11px 16px;border-radius:30px;box-shadow:0 6px 20px rgba(15,46,54,.25);cursor:pointer;font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:700"><svg width="15" height="15" viewBox="0 0 24 24" fill="#b8873a" stroke="#b8873a" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg><span id="favCounterN">0</span> favoritos</button>';
    document.body.appendChild(wrap);

    window.updateFavCounter = function(){
      var list = getFavorites();
      document.getElementById('favCounterN').textContent = list.length;
      wrap.style.display = list.length ? '' : 'none';
    };
    window.updateFavCounter();

    document.getElementById('favCounterBtn').onclick = function(){
      var list = getFavorites();
      if(document.getElementById('favPanelOverlay')) return;
      var overlay = document.createElement('div');
      overlay.id = 'favPanelOverlay';
      overlay.setAttribute('style', 'position:fixed;inset:0;z-index:9998;background:rgba(15,46,54,.6);display:flex;align-items:flex-end;justify-content:center;padding:0');
      var itemsHtml = list.map(function(it){
        return '<a href="'+it.url+'" style="display:flex;align-items:center;gap:12px;padding:10px 4px;text-decoration:none;color:inherit;border-bottom:1px solid #eee">'
          + (it.img ? '<div style="width:56px;height:56px;border-radius:10px;background:url(\''+it.img+'\') center/cover;flex-shrink:0"></div>' : '')
          + '<div style="font-size:13.5px;font-weight:600;color:#0f2e36">'+it.nome+'</div></a>';
      }).join('');
      overlay.innerHTML = '<div style="background:#fff;width:100%;max-width:440px;border-radius:18px 18px 0 0;padding:24px 22px;max-height:70vh;overflow-y:auto;font-family:Inter,system-ui,sans-serif">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><h3 style="font-family:Fraunces,Georgia,serif;font-size:18px;color:#0f2e36">Meus favoritos</h3><button id="favPanelClose" style="background:#f5f6f7;border:none;width:30px;height:30px;border-radius:50%;font-size:16px;color:#6b7280;cursor:pointer">&times;</button></div>'
        + (itemsHtml || '<p style="font-size:13px;color:#6b7280">Você ainda não favoritou nenhum imóvel.</p>')
        + (list.length ? '<a id="favSendWa" href="#" style="display:block;text-align:center;margin-top:16px;background:#25D366;color:#fff;padding:12px;border-radius:10px;font-size:13.5px;font-weight:700;text-decoration:none">Enviar minha lista pelo WhatsApp</a>' : '')
        + '</div>';
      document.body.appendChild(overlay);
      document.getElementById('favPanelClose').onclick = function(){ overlay.remove(); };
      overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
      var sendBtn = document.getElementById('favSendWa');
      if(sendBtn) sendBtn.onclick = function(e){
        e.preventDefault();
        var nomes = list.map(function(it){ return '- ' + it.nome; }).join('\n');
        var msg = 'Olá! Separei esses imóveis no site e quero saber mais:\n' + nomes;
        capture('lista_favoritos_enviada', { qtd: list.length });
        window.open('https://wa.me/5521989150864?text=' + encodeURIComponent(msg), '_blank');
      };
    };
  })();

  (function(){
    try{
      if(document.getElementById('cookie-bar')) return;
      var saved = localStorage.getItem('pc_cookie_consent');
      if(saved === 'all'){ if(window.__initTrackingScripts) window.__initTrackingScripts(); return; }
      if(saved) return;
    }catch(e){ return; }
    var bar = document.createElement('div');
    bar.id = 'cookieConsentBar';
    bar.setAttribute('style', 'position:fixed;left:0;right:0;bottom:0;z-index:9998;background:#0f2e36;color:#fff;padding:16px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:14px;font-family:Inter,system-ui,sans-serif;box-shadow:0 -4px 20px rgba(0,0,0,.15)');
    bar.innerHTML = ''
      + '<p style="margin:0;font-size:12.5px;color:rgba(255,255,255,.85);max-width:520px;line-height:1.5;flex:1 1 260px">Usamos cookies para melhorar sua experiência e, quando você concorda, medir campanhas. Veja nossa <a href="politica-de-privacidade.html" style="color:#fff;text-decoration:underline">Política de Privacidade</a>.</p>'
      + '<div style="display:flex;gap:8px;flex-shrink:0">'
      + '  <button id="cookieDecline" style="background:none;border:1px solid rgba(255,255,255,.35);color:#fff;font-size:12.5px;font-weight:600;padding:9px 16px;border-radius:9px;cursor:pointer">Recusar</button>'
      + '  <button id="cookieAccept" style="background:#b8873a;border:none;color:#fff;font-size:12.5px;font-weight:700;padding:9px 18px;border-radius:9px;cursor:pointer">Aceitar</button>'
      + '</div>';
    document.body.appendChild(bar);
    document.getElementById('cookieAccept').onclick = function(){
      try{ localStorage.setItem('pc_cookie_consent','all'); }catch(e){}
      if(window.__initTrackingScripts) window.__initTrackingScripts();
      bar.remove();
    };
    document.getElementById('cookieDecline').onclick = function(){
      try{ localStorage.setItem('pc_cookie_consent','essential'); }catch(e){}
      bar.remove();
    };
  })();

  (function(){
    if(document.getElementById('personSchemaLd')) return;
    var s = document.createElement('script');
    s.id = 'personSchemaLd';
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: 'Paulo Cotrim',
      description: 'Corretor de imóveis com 18 anos de experiência, especialista em financiamento imobiliário e Minha Casa Minha Vida no Rio de Janeiro.',
      url: 'https://paulocotrim.com/',
      email: 'corretorpaulocotrim@gmail.com',
      areaServed: { '@type': 'City', name: 'Rio de Janeiro' },
      identifier: 'CRECI-RJ 77677-F'
    });
    document.head.appendChild(s);
  })();

  (function(){
    if(document.getElementById('orgSchemaLd')) return;
    var s = document.createElement('script');
    s.id = 'orgSchemaLd';
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Paulo Cotrim — Inteligência Imobiliária',
      url: 'https://paulocotrim.com/',
      logo: 'https://paulocotrim.com/logo-wordmark.png',
      founder: { '@type': 'Person', name: 'Paulo Cotrim' },
      areaServed: { '@type': 'City', name: 'Rio de Janeiro' },
      contactPoint: { '@type': 'ContactPoint', contactType: 'vendas', email: 'corretorpaulocotrim@gmail.com', telephone: '+5521989150864', availableLanguage: 'pt-BR' }
    });
    document.head.appendChild(s);
  })();

  (function(){
    var style = document.createElement('style');
    style.textContent = '@media print {'
      + 'header, .wafloat, .sticky-cta, #waStatusDot, #waStatusBubble, #cookieConsentBar,'
      + '#mcmvPopupOverlay, #exitPopupOverlay, #featuredPopupOverlay, #waLeadOverlay,'
      + 'nav, button, .faq-chev, .reveal-btn, iframe, .hlb { display: none !important; }'
      + 'body { background: #fff !important; }'
      + 'a[href]:not(.no-print-link)::after { content: ""; }'
      + '.wrap { max-width: 100% !important; }'
      + '}';
    document.head.appendChild(style);
  })();

  (function(){
    var heroBg = document.querySelector('.hero-bg');
    if(!heroBg || !heroBg.getAttribute('onclick')) return;
    heroBg.setAttribute('role', 'button');
    heroBg.setAttribute('tabindex', '0');
    heroBg.setAttribute('aria-label', 'Ampliar foto');
    heroBg.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        heroBg.click();
      }
    });
  })();

  (function(){
    var burger = document.querySelector('.burger');
    var mnav = document.getElementById('mnav');
    if(!burger || !mnav) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'mnav');
    burger.addEventListener('click', function(){
      setTimeout(function(){
        burger.setAttribute('aria-expanded', mnav.style.display === 'block' ? 'true' : 'false');
      }, 0);
    });
  })();

  (function(){
    var style = document.createElement('style');
    style.textContent = '@keyframes skeletonShimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}'
      + '#map:empty, #fsimEmbed:empty { min-height:220px; border-radius:14px; background:linear-gradient(90deg,#eef0f1 25%,#f7f8f9 37%,#eef0f1 63%); background-size:800px 100%; animation:skeletonShimmer 1.4s linear infinite; }';
    document.head.appendChild(style);
  })();

  (function(){
    if(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return;
    if(navigator.standalone) return;
    var deferredPrompt = null;
    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

    window.addEventListener('beforeinstallprompt', function(e){
      e.preventDefault();
      deferredPrompt = e;
      if(!/aprovacao-expressa|simulador|documentos|admin|crm/.test(location.pathname) && !localStorage.getItem('pwaInstallDismissed')){
        setTimeout(showInstallBanner, 20000);
      }
    });
    window.addEventListener('appinstalled', function(){
      localStorage.setItem('pwaInstallDismissed','1');
      capture('pwa_instalado');
      var b = document.getElementById('pwaInstallBanner');
      if(b) b.remove();
    });

    function showIOSInstructions(){
      if(document.getElementById('pwaIOSModal')) return;
      var style = document.createElement('style');
      style.textContent = '@keyframes pwaSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}';
      document.head.appendChild(style);
      var overlay = document.createElement('div');
      overlay.id = 'pwaIOSModal';
      overlay.setAttribute('style','position:fixed;inset:0;z-index:9999;background:rgba(9,20,24,.72);display:flex;align-items:flex-end;justify-content:center');
      overlay.innerHTML = '<div style="background:#fff;border-radius:20px 20px 0 0;padding:28px 24px 32px;max-width:440px;width:100%;font-family:Inter,system-ui,sans-serif;animation:pwaSlideUp .35s cubic-bezier(.16,1,.3,1)">'
        + '<div style="font-size:15px;font-weight:800;color:#0f2e36;margin-bottom:16px">Como instalar no iPhone</div>'
        + '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px"><div style="width:26px;height:26px;border-radius:8px;background:#eaf5ee;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:800;color:#1a8f4c">1</div><div style="font-size:13.5px;color:#374151;line-height:1.5">Toque no ícone de compartilhar <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#1a8f4c;fill:none;stroke-width:2;vertical-align:-2px;display:inline-block"><path d="M12 3v13m0-13l-4 4m4-4l4 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg> na barra do Safari</div></div>'
        + '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px"><div style="width:26px;height:26px;border-radius:8px;background:#eaf5ee;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:800;color:#1a8f4c">2</div><div style="font-size:13.5px;color:#374151;line-height:1.5">Escolha <strong>Adicionar à Tela de Início</strong></div></div>'
        + '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:22px"><div style="width:26px;height:26px;border-radius:8px;background:#eaf5ee;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:800;color:#1a8f4c">3</div><div style="font-size:13.5px;color:#374151;line-height:1.5">Toque em <strong>Adicionar</strong> — pronto, o app fica na sua tela</div></div>'
        + '<button type="button" id="pwaIOSClose" style="width:100%;background:#1a8f4c;color:#fff;border:none;padding:13px;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer">Entendi</button>'
        + '</div>';
      document.body.appendChild(overlay);
      capture('pwa_ios_instrucoes_exibidas');
      overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
      document.getElementById('pwaIOSClose').addEventListener('click', function(){ overlay.remove(); });
    }

    window.pcInstallApp = function(){
      capture('pwa_campanha_clicada');
      if(deferredPrompt){
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choice){ capture('pwa_prompt_resultado', {escolha:choice.outcome}); });
        deferredPrompt = null;
        return;
      }
      if(isIOS){ showIOSInstructions(); return; }
      alert('Para instalar, abra o menu do seu navegador (⋮ ou ...) e escolha "Instalar aplicativo" ou "Adicionar à tela inicial".');
    };

    function showInstallBanner(){
      if(document.getElementById('pwaInstallBanner')) return;
      var style = document.createElement('style');
      style.textContent = '@keyframes pwaSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}';
      document.head.appendChild(style);
      var el = document.createElement('div');
      el.id = 'pwaInstallBanner';
      el.setAttribute('style','position:fixed;left:16px;right:16px;bottom:16px;z-index:9998;max-width:420px;margin:0 auto;background:#0f2e36;color:#fff;border-radius:14px;padding:16px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 14px 40px rgba(15,46,54,.4);font-family:Inter,system-ui,sans-serif;animation:pwaSlideUp .4s cubic-bezier(.16,1,.3,1)');
      el.innerHTML = ''
        + '<div style="width:40px;height:40px;border-radius:11px;background:rgba(26,143,76,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3ddc84" stroke-width="2"><path d="M12 3v13m0 0l-4-4m4 4l4-4M5 21h14"/></svg></div>'
        + '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700;margin-bottom:2px">Instalar o site como app</div><div style="font-size:11.5px;color:rgba(255,255,255,.65);line-height:1.4">O app é o próprio site — leve, rápido, sem baixar nada de loja. Acesso em 1 toque na tela inicial.</div></div>'
        + '<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">'
        + '  <button id="pwaInstallBtn" style="background:#1a8f4c;color:#fff;border:none;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">Instalar</button>'
        + '  <button id="pwaInstallClose" aria-label="Fechar" style="background:none;border:none;color:rgba(255,255,255,.5);font-size:11px;cursor:pointer;text-decoration:underline">Agora não</button>'
        + '</div>';
      document.body.appendChild(el);
      capture('pwa_banner_exibido');
      document.getElementById('pwaInstallBtn').addEventListener('click', function(){
        el.remove();
        localStorage.setItem('pwaInstallDismissed','1');
        window.pcInstallApp();
      });
      document.getElementById('pwaInstallClose').addEventListener('click', function(){
        el.remove();
        localStorage.setItem('pwaInstallDismissed','1');
        capture('pwa_banner_dispensado');
      });
    }
  })();

  window.leadCapture = capture;
})();

/* ============================================================
   4 MELHORIAS INDISPENSÁVEIS (Auditoria Técnica Final, Jul/2026)
   Selo de confiança visual · Barra de contato multi-ação ·
   Data de verificação da tabela · Comparador entre páginas
   Roda só em páginas de empreendimento (detecta .trust-bar + .tipo-table)
   ============================================================ */
(function(){
  var isPropertyPage = !!document.querySelector('.trust-bar') && !!document.querySelector('.tipo-table');
  if(!isPropertyPage) return;

  var WA_NUM = '5521989150864';

  (function(){
    var bar = document.querySelector('.trust-bar');
    if(!bar || document.getElementById('trustSealBlock')) return;
    var seal = document.createElement('div');
    seal.id = 'trustSealBlock';
    seal.setAttribute('style','display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:10px 16px;margin-top:12px;max-width:fit-content');
    seal.innerHTML = '<svg viewBox="0 0 24 24" style="width:26px;height:26px;flex-shrink:0;stroke:#cf9f4f;fill:none;stroke-width:1.6"><path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>'
      + '<div style="line-height:1.35"><div style="font-size:12.5px;font-weight:800;color:#fff">Corretor Oficial · CRECI-RJ 77677-F</div>'
      + '<div style="font-size:11px;color:rgba(255,255,255,.68)">18 anos de mercado · 700+ famílias atendidas · Especialista Cury e MCMV</div></div>';
    bar.insertAdjacentElement('afterend', seal);
  })();

  (function(){
    var tabs = document.querySelectorAll('.tipo-table');
    if(!tabs.length) return;
    tabs.forEach(function(t){
      var nxt = t.nextElementSibling;
      if(nxt && nxt.classList && nxt.classList.contains('price-freshness')) return;
      var note = document.createElement('div');
      note.className = 'price-freshness';
      note.setAttribute('style','font-size:11px;color:#6b7280;margin-top:8px;display:flex;align-items:center;gap:5px');
      note.innerHTML = '<svg viewBox="0 0 24 24" style="width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2;flex-shrink:0"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Tabela verificada em Julho/2026 — confirme disponibilidade e valores atualizados com Paulo antes de decidir.';
      t.insertAdjacentElement('afterend', note);
    });
  })();

  (function(){
    var cta = document.querySelector('.sticky-cta');
    if(!cta || cta.dataset.upgraded) return;
    cta.dataset.upgraded = '1';
    var style = document.createElement('style');
    style.textContent = '.sticky-cta{display:flex !important;flex-wrap:wrap;gap:8px}'
      + '.sticky-cta .sc-btn{flex:1;min-width:110px;text-align:center;padding:11px 10px;border-radius:10px;font-size:12.5px;font-weight:700;white-space:nowrap;text-decoration:none}'
      + 'body{padding-bottom:66px}'
      + '@media(min-width:761px){.sticky-cta{max-width:640px;left:50%;right:auto;transform:translateX(-50%);bottom:18px;border-radius:14px;border:1px solid #e8eaed;box-shadow:0 12px 34px rgba(15,46,54,.18)}}';
    document.head.appendChild(style);
    var oldLink = cta.querySelector('a');
    var waHref = oldLink ? oldLink.getAttribute('href') : ('https://wa.me/'+WA_NUM);
    cta.innerHTML = '<a class="sc-btn" style="background:#1a8f4c;color:#fff" href="'+waHref+'" target="_blank">WhatsApp</a>'
      + '<a class="sc-btn" style="background:#0f2e36;color:#fff" href="simulador.html">Simular financiamento</a>'
      + '<a class="sc-btn" style="background:#1a8f4c;color:#fff" href="aprovacao-expressa.html">Aprovação Expressa</a>';
  })();

  (function(){
    var KEY = 'pc_compare_v2';
    function getList(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){ return []; } }
    function setList(l){ localStorage.setItem(KEY, JSON.stringify(l)); }

    var h1 = document.querySelector('h1');
    var nomeAtual = h1 ? h1.textContent.trim() : document.title.split('—')[0].trim();
    var precoEl = document.querySelector('.tipo-table div[style*="color:var(--gold)"]');
    var thisItem = {
      nome: nomeAtual,
      preco: precoEl ? precoEl.textContent.trim() : 'Consulte valores',
      url: window.location.pathname.split('/').pop()
    };

    var btn = document.createElement('button');
    btn.id = 'compareAddBtn';
    btn.type = 'button';
    function renderBtn(){
      var list = getList();
      var on = list.some(function(i){ return i.url === thisItem.url; });
      btn.textContent = on ? '✓ Adicionado à comparação' : '+ Comparar este imóvel';
      btn.setAttribute('style','position:fixed;right:16px;bottom:150px;z-index:650;background:'+(on?'#1a8f4c':'#fff')+';color:'+(on?'#fff':'#0f2e36')+';border:1.5px solid '+(on?'#1a8f4c':'#e8eaed')+';border-radius:30px;padding:9px 16px;font-size:11.5px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(15,46,54,.15)');
    }
    renderBtn();
    btn.addEventListener('click', function(){
      var list = getList();
      var idx = list.findIndex(function(i){ return i.url === thisItem.url; });
      if(idx >= 0){ list.splice(idx,1); }
      else{
        if(list.length >= 3){ alert('Você pode comparar até 3 imóveis por vez. Remova um para adicionar outro.'); return; }
        list.push(thisItem);
      }
      setList(list);
      renderBtn();
      renderBar();
    });
    document.body.appendChild(btn);

    var style = document.createElement('style');
    style.textContent = '.pc-compare-bar{position:fixed;left:0;right:0;bottom:0;z-index:6000;background:#0f2e36;color:#fff;padding:14px 24px;display:none;align-items:center;justify-content:center;gap:20px;box-shadow:0 -10px 30px rgba(0,0,0,.18);flex-wrap:wrap}'
      + '.pc-compare-bar.show{display:flex}'
      + '.pc-compare-bar b{color:#cf9f4f}'
      + '.pc-compare-btn{background:linear-gradient(135deg,#b8873a,#cf9f4f);color:#fff;border:none;border-radius:10px;padding:10px 22px;font-size:13px;font-weight:800;cursor:pointer}'
      + '.pc-compare-clear{background:none;border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:10px;padding:10px 18px;font-size:12.5px;font-weight:600;cursor:pointer}'
      + '.pc-compare-modal{position:fixed;inset:0;z-index:7000;background:rgba(15,46,54,.6);display:none;align-items:center;justify-content:center;padding:24px}'
      + '.pc-compare-modal.show{display:flex}'
      + '.pc-compare-modal-box{background:#fff;border-radius:20px;max-width:720px;width:100%;max-height:86vh;overflow:auto;padding:32px}'
      + '.pc-compare-table{width:100%;border-collapse:collapse;font-size:13px}'
      + '.pc-compare-table td,.pc-compare-table th{padding:8px 10px;border-bottom:1px solid #e8eaed;text-align:left}';
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.className = 'pc-compare-bar';
    bar.id = 'pcCompareBar';
    bar.innerHTML = '<span id="pcCompareBarTxt"></span>'
      + '<button class="pc-compare-btn" id="pcCompareShowBtn" type="button">Comparar agora</button>'
      + '<button class="pc-compare-clear" id="pcCompareClearBtn" type="button">Limpar seleção</button>';
    document.body.appendChild(bar);

    var modal = document.createElement('div');
    modal.className = 'pc-compare-modal';
    modal.id = 'pcCompareModal';
    modal.innerHTML = '<div class="pc-compare-modal-box"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
      + '<h3 style="font-family:Fraunces,Georgia,serif;font-size:20px;color:#0f2e36">Comparação de imóveis</h3>'
      + '<button id="pcCompareCloseBtn" type="button" style="background:#f5f6f7;border:none;width:34px;height:34px;border-radius:50%;cursor:pointer">✕</button></div>'
      + '<div id="pcCompareTableWrap"></div>'
      + '<a id="pcCompareWaBtn" href="#" target="_blank" style="display:inline-block;margin-top:16px;background:#1a8f4c;color:#fff;padding:11px 20px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none">Falar com Paulo sobre esses imóveis</a></div>';
    document.body.appendChild(modal);

    function renderBar(){
      var list = getList();
      if(list.length >= 2){
        bar.classList.add('show');
        document.getElementById('pcCompareBarTxt').innerHTML = '<b>'+list.length+'</b> imóveis selecionados para comparar';
      } else {
        bar.classList.remove('show');
      }
    }
    document.getElementById('pcCompareClearBtn').addEventListener('click', function(){
      setList([]); renderBar(); renderBtn();
    });
    document.getElementById('pcCompareShowBtn').addEventListener('click', function(){
      var list = getList();
      if(list.length < 2) return;
      var rows = [
        ['Empreendimento', list.map(function(i){return i.nome;})],
        ['Valor', list.map(function(i){return i.preco;})]
      ];
      var thead = '<tr><th></th>'+list.map(function(i){return '<th>'+i.nome+'</th>';}).join('')+'</tr>';
      var tbody = rows.map(function(r){return '<tr><td>'+r[0]+'</td>'+r[1].map(function(v){return '<td>'+v+'</td>';}).join('')+'</tr>';}).join('');
      document.getElementById('pcCompareTableWrap').innerHTML = '<table class="pc-compare-table"><thead>'+thead+'</thead><tbody>'+tbody+'</tbody></table>';
      var waMsg = 'Olá Paulo! Estou comparando: '+list.map(function(i){return i.nome;}).join(' x ')+'. Quero saber mais sobre esses imóveis!';
      document.getElementById('pcCompareWaBtn').href = 'https://wa.me/'+WA_NUM+'?text='+encodeURIComponent(waMsg);
      modal.classList.add('show');
    });
    document.getElementById('pcCompareCloseBtn').addEventListener('click', function(){ modal.classList.remove('show'); });
    renderBar();
  })();
})();

// ===== Empreendimentos Relacionados =====
var REL_CATALOG = [
  {nome:'Farol da Guanabara',url:'farol-da-guanabara.html',bairro:'Santo Cristo · Porto Maravilha',primary:'Santo Cristo',secondary:'Porto Maravilha'},
  {nome:'Arcos do Porto',url:'arcos-do-porto.html',bairro:'Porto Maravilha',primary:'Porto Maravilha',secondary:'Porto Maravilha'},
  {nome:'Orla Central',url:'orla-central.html',bairro:'Centro · Niterói',primary:'Centro',secondary:'Niterói'},
  {nome:'Parque Piedade',url:'parque-piedade.html',bairro:'Piedade · Zona Norte',primary:'Piedade',secondary:'Zona Norte'},
  {nome:'Luzes do Rio Lamparina',url:'luzes-do-rio-lamparina.html',bairro:'São Cristóvão',primary:'São Cristóvão',secondary:'São Cristóvão'},
  {nome:'Caminhos da Guanabara',url:'caminhos-da-guanabara.html',bairro:'Pendotiba · Niterói',primary:'Pendotiba',secondary:'Niterói'},
  {nome:'Cartola II',url:'cartola-ii.html',bairro:'São Cristóvão',primary:'São Cristóvão',secondary:'São Cristóvão'},
  {nome:'Luzes do Rio Candeeiro',url:'luzes-do-rio-candeeiro.html',bairro:'São Cristóvão',primary:'São Cristóvão',secondary:'São Cristóvão'},
  {nome:'A Noite',url:'emp-a-noite.html',bairro:'Praça Mauá, 7 · Centro',primary:'Praça Mauá, 7',secondary:'Centro'},
  {nome:'Saudosa Praça Onze',url:'emp-saudosa-praca-onze.html',bairro:'Praça Onze · Centro',primary:'Praça Onze',secondary:'Centro'},
  {nome:'Alma Carioca',url:'emp-alma-carioca.html',bairro:'Vila Valqueire · Zona Norte',primary:'Vila Valqueire',secondary:'Zona Norte'},
  {nome:'Beon Porto Residencial',url:'emp-beon-porto.html',bairro:'São Cristóvão · Zona Norte',primary:'São Cristóvão',secondary:'Zona Norte'},
  {nome:'Brise Studios Design',url:'emp-brise-studios.html',bairro:'Praça Pio X · Centro',primary:'Praça Pio X',secondary:'Centro'},
  {nome:'Conquista Florianópolis',url:'emp-conquista-florianopolis.html',bairro:'Praça Seca · Jacarepaguá',primary:'Praça Seca',secondary:'Jacarepaguá'},
  {nome:'Cores do Rio Residencial',url:'emp-cores-do-rio.html',bairro:'Centro',primary:'Centro',secondary:'Centro'},
  {nome:'CTV Beat',url:'emp-ctv-beat.html',bairro:'Madureira · Zona Norte',primary:'Madureira',secondary:'Zona Norte'},
  {nome:'CTV Vitória',url:'emp-ctv-vitoria.html',bairro:'Campinho · Zona Norte',primary:'Campinho',secondary:'Zona Norte'},
  {nome:'East Side Harmony',url:'emp-east-side-harmony.html',bairro:'Méier · Zona Norte',primary:'Méier',secondary:'Zona Norte'},
  {nome:'Wish Norte (Living)',url:'emp-living-wish-norte.html',bairro:'Cachambi · Zona Norte',primary:'Cachambi',secondary:'Zona Norte'},
  {nome:'Meu Crescer Engenhão',url:'emp-meu-crescer-engenhao.html',bairro:'Engenho de Dentro · Zona Norte',primary:'Engenho de Dentro',secondary:'Zona Norte'},
  {nome:'Only by Living',url:'emp-only-by-living.html',bairro:'Cachambi · Zona Norte',primary:'Cachambi',secondary:'Zona Norte'},
  {nome:'Primor Carioca',url:'emp-primor-carioca.html',bairro:'Inhaúma · Zona Norte',primary:'Inhaúma',secondary:'Zona Norte'},
  {nome:'Sal Rio Residencial',url:'emp-sal-rio.html',bairro:'Saúde · Porto Maravilha',primary:'Saúde',secondary:'Porto Maravilha'},
  {nome:'URB Sole',url:'emp-urb-sole.html',bairro:'Todos os Santos · Zona Norte',primary:'Todos os Santos',secondary:'Zona Norte'},
  {nome:'Village Caribe 1',url:'emp-village-caribe.html',bairro:'Praça Seca · Jacarepaguá',primary:'Praça Seca',secondary:'Jacarepaguá'},
  {nome:'Vivaz Connection',url:'emp-vivaz-connection.html',bairro:'Riachuelo · Zona Norte',primary:'Riachuelo',secondary:'Zona Norte'},
  {nome:'Vivaz Rua Honório',url:'emp-vivaz-honorio.html',bairro:'Todos os Santos · Zona Norte',primary:'Todos os Santos',secondary:'Zona Norte'},
  {nome:'Império do Ouro',url:'emp-imperio-do-ouro.html',bairro:'Rio do Ouro · São Gonçalo',primary:'Rio do Ouro',secondary:'São Gonçalo'},
  {nome:'Ritmos de Pilares',url:'emp-ritmos-de-pilares.html',bairro:'Pilares · Rio de Janeiro',primary:'Pilares',secondary:'Rio de Janeiro'},
  {nome:'Encantos da Zona Norte',url:'emp-encantos-da-zona-norte.html',bairro:'Região de Bonsucesso · Rio de Janeiro',primary:'Região de Bonsucesso',secondary:'Rio de Janeiro'},
  {nome:'Reserva Redentor',url:'emp-reserva-redentor.html',bairro:'Rocha · Rio de Janeiro',primary:'Rocha',secondary:'Rio de Janeiro'},
  {nome:'Jardim das Amoreiras',url:'emp-jardim-das-amoreiras.html',bairro:'Região de Campo Grande · Rio de Janeiro',primary:'Região de Campo Grande',secondary:'Rio de Janeiro'},
  {nome:'Marbelle Residence',url:'emp-marbelle-residence.html',bairro:'Região do Parque Aeroporto · Macaé',primary:'Região do Parque Aeroporto',secondary:'Macaé'},
  {nome:'Mirante da Luz',url:'emp-mirante-da-luz.html',bairro:'Bairro da Luz · Nova Iguaçu',primary:'Bairro da Luz',secondary:'Nova Iguaçu'},
  {nome:'Mirantes do Rio - Rio Mar',url:'emp-mirantes-do-rio-rio-mar.html',bairro:'Santa Cruz · Rio de Janeiro',primary:'Santa Cruz',secondary:'Rio de Janeiro'},
  {nome:'Oceanside Recreio',url:'emp-oceanside-recreio.html',bairro:'Recreio dos Bandeirantes · Rio de Janeiro',primary:'Recreio dos Bandeirantes',secondary:'Rio de Janeiro'},
  {nome:'Parque Ilhabela',url:'emp-parque-ilhabela.html',bairro:'Parque Pecuária · Campos dos Goytacazes',primary:'Parque Pecuária',secondary:'Campos dos Goytacazes'},
  {nome:'Primavera Garden',url:'emp-primavera-garden.html',bairro:'Jardim Primavera · Duque de Caxias',primary:'Jardim Primavera',secondary:'Duque de Caxias'},
  {nome:'Refúgio Camorim',url:'emp-refugio-camorim.html',bairro:'Região do Camorim · Rio de Janeiro',primary:'Região do Camorim',secondary:'Rio de Janeiro'},
  {nome:'Residencial Bálsamo',url:'emp-residencial-balsamo.html',bairro:'Região de Campo Grande · Rio de Janeiro',primary:'Região de Campo Grande',secondary:'Rio de Janeiro'},
  {nome:'Residencial Ipê Amarelo',url:'emp-residencial-ipe-amarelo.html',bairro:'Região de Campo Grande · Rio de Janeiro',primary:'Região de Campo Grande',secondary:'Rio de Janeiro'},
  {nome:'Residencial Mar de Trindade',url:'emp-residencial-mar-de-trindade.html',bairro:'Alcântara · São Gonçalo',primary:'Alcântara',secondary:'São Gonçalo'},
  {nome:'Residencial Monet',url:'emp-residencial-monet.html',bairro:'Região da Vila São Luiz · Duque de Caxias',primary:'Região da Vila São Luiz',secondary:'Duque de Caxias'},
  {nome:'Residencial Morada Real',url:'emp-residencial-morada-real.html',bairro:'Região de Arsenal · São Gonçalo',primary:'Região de Arsenal',secondary:'São Gonçalo'},
  {nome:'Residencial Paineiras',url:'emp-residencial-paineiras.html',bairro:'Vila Nova · Nova Iguaçu',primary:'Vila Nova',secondary:'Nova Iguaçu'},
  {nome:'Sensia Barra',url:'emp-sensia-barra.html',bairro:'Barra da Tijuca · Rio de Janeiro',primary:'Barra da Tijuca',secondary:'Rio de Janeiro'}
];

function renderRelacionados(){
  try{
    var el = document.getElementById('related-empreendimentos');
    if(!el) return;
    var slug = el.getAttribute('data-slug');
    var self = null;
    for(var i=0;i<REL_CATALOG.length;i++){ if(REL_CATALOG[i].url === slug){ self = REL_CATALOG[i]; break; } }
    if(!self) return;
    var picked = [];
    var used = {};
    used[self.url] = true;
    function addFrom(list){
      for(var i=0;i<list.length && picked.length<3;i++){
        if(!used[list[i].url]){ picked.push(list[i]); used[list[i].url]=true; }
      }
    }
    // tier 1: mesma zona (secundária), se não for genérico demais
    if(self.secondary && self.secondary !== 'Rio de Janeiro'){
      addFrom(REL_CATALOG.filter(function(x){ return x.secondary === self.secondary; }));
    }
    // tier 2: mesmo bairro/região primária (cobre casos onde a zona é genérica, ex: Campo Grande)
    if(picked.length < 2){
      addFrom(REL_CATALOG.filter(function(x){ return x.primary === self.primary; }));
    }
    // tier 3: qualquer outro, pra sempre ter pelo menos 2 sugestões
    if(picked.length < 2){
      addFrom(REL_CATALOG);
    }
    if(picked.length === 0){ el.closest('section').style.display='none'; return; }
    el.innerHTML = picked.map(function(p){
      return '<a class="related-card" href="'+p.url+'">'
        + '<img src="emp-img/'+p.url.replace(/^emp-/,'').replace('.html','.jpg')+'" alt="'+p.nome+'" loading="lazy" onerror="this.style.display=\'none\'"/>'
        + '<div><div class="rc-name">'+p.nome+'</div><div class="rc-loc">'+p.bairro+'</div></div>'
        + '</a>';
    }).join('');
  }catch(e){}
}
document.addEventListener('DOMContentLoaded', renderRelacionados);

/* ---------- MARCA D'AGUA: logo real de fundo em TODAS as fotos do site (sitewide, generico + observer p/ conteudo dinamico) ---------- */
(function(){
  function makeWM(size){
    var wm = document.createElement('div');
    wm.className = 'pc-watermark';
    wm.style.cssText = 'position:absolute;right:'+(size>18?'10px':'6px')+';bottom:'+(size>18?'10px':'6px')+';width:auto;height:'+size+'px;opacity:.88;pointer-events:none;z-index:6;filter:drop-shadow(0 1px 3px rgba(0,0,0,.7))';
    var img = document.createElement('img');
    img.src = 'logo-wordmark-light.png';
    img.alt = '';
    img.style.cssText = 'height:100%;width:auto;display:block';
    wm.appendChild(img);
    return wm;
  }
  // Imagens que NUNCA devem levar marca d'agua: logos, favicons/icones, avatares de clientes/equipe, a propria marca.
  var SKIP_SELECTOR = '.pc-watermark, .pc-watermark img, nav img, header img, footer img, .navbar img, .site-logo img, .logo-wordmark, .adc-icon img, .avatar img, .cliente-avatar img, .depo-avatar, .team-avatar img, .step-num img, .rg-card img, .authority-avatar img, .btn-wa-hdr img';
  function shouldSkip(img){
    if(img.dataset.pcWm) return true;
    if(img.matches(SKIP_SELECTOR) || img.closest(SKIP_SELECTOR)) return true;
    var src = (img.getAttribute('src')||'').toLowerCase();
    if(src.indexOf('logo')>-1 || src.indexOf('favicon')>-1 || src.indexOf('avatar')>-1) return true;
    return false;
  }
  function sizeOk(img){
    var w = img.clientWidth || img.naturalWidth || 0;
    var h = img.clientHeight || img.naturalHeight || 0;
    return w >= 90 && h >= 64;
  }
  function place(img){
    var host = img.parentElement;
    if(!host) return;
    if(host.querySelector('.pc-watermark[data-for="'+ (img.dataset.pcId||'') +'"]')) return;
    var cs = window.getComputedStyle(host);
    if(cs.position === 'static') host.style.position = 'relative';
    var h = img.clientHeight || img.naturalHeight || 60;
    var size = Math.max(14, Math.min(26, Math.round(h*0.16)));
    var wm = makeWM(size);
    var id = 'wm'+Math.random().toString(36).slice(2,8);
    img.dataset.pcId = id;
    wm.setAttribute('data-for', id);
    host.appendChild(wm);
    img.dataset.pcWm = '1';
  }
  function applyWatermarkTo(img){
    if(shouldSkip(img)) return;
    if(!sizeOk(img)){
      if(!img.complete){ img.addEventListener('load', function(){ applyWatermarkTo(img); }, {once:true}); }
      return;
    }
    place(img);
  }
  function scan(root){
    var imgs = root.tagName === 'IMG' ? [root] : root.querySelectorAll ? root.querySelectorAll('img') : [];
    imgs.forEach && imgs.forEach(applyWatermarkTo);
    if(!imgs.forEach){ Array.prototype.forEach.call(imgs, applyWatermarkTo); }
  }
  function initialScan(){ scan(document); }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', initialScan);
  } else {
    initialScan();
  }
  // Observer: cobre grids/catalogos/mapas renderizados via JS depois do load (favoritos, agende-sua-visita, relacionados, popups de mapa, resultados do simulador etc.)
  if('MutationObserver' in window){
    var mo = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        m.addedNodes && m.addedNodes.forEach(function(n){
          if(!n || n.nodeType !== 1) return;
          if(n.tagName === 'IMG'){ applyWatermarkTo(n); }
          else if(n.querySelectorAll){ scan(n); }
        });
      });
    });
    var startObserver = function(){ mo.observe(document.body, {childList:true, subtree:true}); };
    if(document.body) startObserver();
    else document.addEventListener('DOMContentLoaded', startObserver);
  }
})();


/* ---------- NEWSLETTER: opt-in de novidades no rodape (sitewide) ---------- */
(function(){
  function emailValido(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  function injectNewsletter(){
    var footer = document.querySelector('footer');
    if(!footer || document.getElementById('nlStrip')) return;
    if(localStorage.getItem('pc_newsletter_ok')) return;

    var wrap = document.createElement('div');
    wrap.id = 'nlStrip';
    wrap.style.cssText = 'background:var(--petrol,#0f2e36);color:#fff;padding:36px 0';
    wrap.innerHTML = ''
      + '<div class="wrap" style="max-width:1100px;margin:0 auto;padding:0 32px;display:flex;gap:22px;align-items:center;justify-content:space-between;flex-wrap:wrap">'
      + '  <div style="max-width:420px">'
      + '    <div style="font-family:Fraunces,Georgia,serif;font-size:19px;font-weight:600;margin-bottom:5px">Novidades de lançamentos e condições MCMV</div>'
      + '    <div style="font-size:13px;color:rgba(255,255,255,.68);line-height:1.5">Receba por e-mail quando eu adicionar novos empreendimentos ou mudar uma tabela de preço. Sem spam, cancele quando quiser.</div>'
      + '  </div>'
      + '  <form id="nlForm" style="display:flex;gap:8px;flex-wrap:wrap;flex:1;max-width:420px;min-width:260px">'
      + '    <input type="email" id="nlEmail" required placeholder="Seu melhor e-mail" style="flex:1;min-width:180px;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font-size:14px;font-family:inherit">'
      + '    <button type="submit" style="background:var(--gold,#b8873a);color:#fff;border:none;padding:12px 20px;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer;white-space:nowrap">Quero receber</button>'
      + '  </form>'
      + '</div>';
    footer.parentNode.insertBefore(wrap, footer);

    var form = wrap.querySelector('#nlForm');
    var input = wrap.querySelector('#nlEmail');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var v = input.value.trim();
      if(!emailValido(v)){
        input.style.borderColor = '#e0736b';
        return;
      }
      if(window.leadNewsletter) window.leadNewsletter(v);
      localStorage.setItem('pc_newsletter_ok', '1');
      wrap.querySelector('.wrap').innerHTML = '<div style="font-size:14.5px;font-weight:600">Inscrito! Você vai receber as novidades em '+v+'.</div>';
    });
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', injectNewsletter);
  } else {
    injectNewsletter();
  }
})();

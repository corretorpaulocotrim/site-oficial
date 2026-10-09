/* crm-treinador.js — coloca Treinador Imobiliário e Central de Atualizações dentro do CRM (menu lateral + painel). */
(function(){
  var base=/\/adm\//.test(location.pathname)?'../':'';
  function painel(url,titulo){
    var p=document.getElementById('pc-pan');
    if(!p){p=document.createElement('div');p.id='pc-pan';p.style.cssText='position:fixed;inset:0;z-index:99990;background:#0b1b33;display:none;flex-direction:column';
      p.innerHTML='<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;color:#fff;font:600 14px system-ui"><span id="pc-pt" style="margin-right:auto"></span><button id="pc-px" style="min-height:40px;padding:0 16px;border-radius:99px;border:0;background:#d9a441;font-weight:700;cursor:pointer">Voltar ao CRM</button></div><iframe id="pc-pf" style="flex:1;border:0;width:100%;background:#fff" title="Painel"></iframe>';
      document.body.appendChild(p);p.querySelector('#pc-px').onclick=function(){p.style.display='none';p.querySelector('iframe').src='about:blank'};}
    p.querySelector('#pc-pt').textContent=titulo;p.querySelector('iframe').src=base+url;p.style.display='flex';
  }
  window.abrirTreinador=function(){painel('treinador/index.html','🎓 Treinador Imobiliário')};
  window.abrirPerformance=function(){painel('painel.html','📈 Performance e Ligações')};
  window.abrirCentral=function(){painel('central.html','📰 Central de Atualizações')};
  function inject(){
    var nav=document.querySelector('.sb-nav');if(!nav||document.getElementById('pc-l0'))return;
    var sec=document.createElement('div');sec.className='sb-sec';sec.textContent='Inteligência';
    function link(id,ic,tx,fn){var a=document.createElement('div');a.className='sb-link';a.id=id;a.innerHTML='<span class="sb-icon">'+ic+'</span> '+tx;a.onclick=fn;return a}
    var f=document.createDocumentFragment();f.appendChild(sec);
    f.appendChild(link('pc-l0','&#128200;','Performance',window.abrirPerformance));
    f.appendChild(link('pc-l1','&#127891;','Treinador',window.abrirTreinador));
    f.appendChild(link('pc-l2','&#128240;','Central (News, Eventos)',window.abrirCentral));
    nav.insertBefore(f,nav.firstChild);
  }
  if(document.readyState!='loading')inject();else document.addEventListener('DOMContentLoaded',inject);
  setTimeout(inject,1500);
})();

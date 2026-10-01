/* Botão WhatsApp fixo com logo — todas as páginas */
(function(){function go(){if(document.getElementById('pc-wa'))return;
var a=document.createElement('a');a.id='pc-wa';a.href='https://wa.me/5521989150864?text='+encodeURIComponent('Olá Paulo, vim pelo site e quero atendimento.');a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','Falar no WhatsApp');
a.innerHTML='<svg viewBox="0 0 32 32" width="30" height="30" fill="#fff"><path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.1c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.2c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.2 1.2-4-.3-.4c-1.1-1.7-1.7-3.6-1.7-5.6C5.3 9.8 10.1 5.1 16 5.1S26.7 9.8 26.7 15.6 21.9 26.2 16 26.2zm5.9-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.4 3.7 5.8 5.1 2.9 1.1 3.4.9 4 .8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg><span>WhatsApp</span>';
a.setAttribute('style','position:fixed;right:18px;bottom:18px;z-index:80;display:flex;align-items:center;gap:8px;background:#25D366;color:#fff;font:600 13px Inter,Arial,sans-serif;padding:12px 18px 12px 14px;border-radius:100px;box-shadow:0 12px 30px -8px rgba(0,0,0,.45);text-decoration:none');
document.body.appendChild(a);if(document.querySelector('.sticky-cta'))document.body.classList.add('has-sticky');var st=document.createElement('style');st.textContent='@media(max-width:1024px){#waHintPill,#waStatusBubble,#v01tag,#compareAddBtn{display:none!important}body.has-sticky #pc-wa{display:none!important}body.has-sticky #pc-rent{bottom:78px!important}#pc-wa{padding:12px!important}#pc-wa span{display:none}}';document.head.appendChild(st);var old=document.querySelector('.wafloat');if(old)old.style.display='none';}
if(document.readyState!=='loading')go();else document.addEventListener('DOMContentLoaded',go);})();
/* Pele premium — identidade nova em todas as páginas antigas */
(function(){function skin(){
 if(document.querySelector('.brandmark .round'))return; // páginas já no padrão novo
 var R='<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="32" y="41" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="26" font-weight="600" fill="currentColor">PC</text></svg>';
 try{var r0=new XMLHttpRequest();r0.open('GET','logo-round.svg',false);r0.send();if(r0.status==200)R=r0.responseText;}catch(e){}
 var css='body{font-family:Inter,system-ui,sans-serif!important}'
 +'h1,h2,h3,h4,[style*="Fraunces"],.serif{font-family:"Cormorant Garamond",Georgia,serif!important;font-weight:500!important;letter-spacing:0!important}'
 +'#pcx-hd{position:sticky;top:0;z-index:60;background:rgba(20,19,17,.96);backdrop-filter:blur(10px);color:#fff}'
 +'#pcx-hd .in{max-width:1180px;margin:0 auto;padding:0 22px;height:72px;display:flex;align-items:center;justify-content:space-between}'
 +'#pcx-hd .b{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none}#pcx-hd .b i{width:40px;height:40px;color:#fff;display:block}#pcx-hd .b i svg{width:100%;height:100%}'
 +'#pcx-hd .b b{white-space:nowrap;font:600 17px "Cormorant Garamond",serif;letter-spacing:.08em}#pcx-hd .b s{width:1px;height:20px;background:rgba(255,255,255,.4)}#pcx-hd .b em{font:600 12px Inter;letter-spacing:.2em;font-style:normal}'
 +'#pcx-hd nav{display:flex;gap:24px}#pcx-hd nav a{color:rgba(255,255,255,.85);text-decoration:none;font:600 13.5px "Cormorant Garamond",serif;letter-spacing:.14em;text-transform:uppercase}'
 +'@media(min-width:1025px){#pcx-hd .in{padding-right:180px}}@media(max-width:1100px){#pcx-hd nav{gap:16px}#pcx-hd nav a{font-size:12px}}'
 +'@media(max-width:1024px){#pcx-hd nav{display:none}#pcx-hd .b s,#pcx-hd .b em{display:none}}'
 +'.pcx-old{display:none!important}';
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 var f=document.createElement('link');f.rel='stylesheet';f.href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@300;400;600&display=swap';document.head.appendChild(f);
 var old=document.querySelector('body > header, header.pc-hd, .pc-hd, body > nav');
 var hasPcHd=!!document.querySelector('.pc-hd');
 if(old&&!hasPcHd)old.classList.add('pcx-old');
 if(!hasPcHd){var h=document.createElement('div');h.id='pcx-hd';
  h.innerHTML='<div class="in"><a class="b" href="index.html"><i>'+R+'</i><b>PAULO COTRIM</b><s></s><em>SAWALA</em></a><nav><a href="index.html#destaques">Lançamentos</a><a href="index.html#portfolio">Imóveis</a><a href="index.html#investidor">Investidor</a><a href="index.html#sobre">Sobre</a><a href="https://wa.me/5521989150864">Contato</a></nav></div>';
  document.body.insertBefore(h,document.body.firstChild);}
 else{var pb=document.querySelector('.pc-hd-brand');if(pb){pb.innerHTML='<i style="width:38px;height:38px;display:block;color:#fff">'+R+'</i><b style="font:600 17px Cormorant Garamond,serif;letter-spacing:.08em;margin-left:10px">PAULO COTRIM</b>';pb.style.display='flex';pb.style.alignItems='center';}}
 [].forEach.call(document.querySelectorAll('img'),function(im){var s=(im.getAttribute('src')||'').toLowerCase();
  if(/logo-wordmark|logo-chave|chave|logo-crest|logo\.png|logo-pc/.test(s)&&!/logo-round|logo-premium|logo-vertical/.test(s)){im.src='logo-round-gold.svg';im.style.width=im.style.height=Math.min(Math.max(im.offsetHeight||48,36),96)+'px';im.style.objectFit='contain';}});
}
if(document.readyState!=='loading')skin();else document.addEventListener('DOMContentLoaded',skin);})();

/* CRM Skin — mesma identidade premium do site (grafite, dourado, marfim, Cormorant/Inter), sem visual infantil */
(function(){
var css=`
:root{--gold:#b0895b;--gold2:#c49a68;--green:#b0895b;--red:#a24b3a;--text:#1a1a19;--muted:#8a857b;--border:#e3ddd1;--radius:4px;--radius-lg:6px}
body{background:#f6f2ea!important;font-family:Inter,system-ui,sans-serif!important;color:#1a1a19}
/* sidebar */
#sidebar,.sidebar,aside{background:#141311!important;border-right:1px solid #2c2b28!important}
.sb-link{border-radius:3px!important;font-family:'Cormorant Garamond',serif!important;font-size:14.5px!important;font-weight:600!important;letter-spacing:.1em!important;text-transform:uppercase!important;color:rgba(255,255,255,.72)!important}
.sb-link.active,.sb-link:hover{background:rgba(176,137,91,.14)!important;color:#fff!important;box-shadow:inset 2px 0 0 #b0895b!important}
.sb-icon,.kpi-icon{display:none!important}
.sb-badge{background:#b0895b!important;color:#1a1a19!important;border-radius:100px!important}
.sb-sec{color:#8a857b!important;letter-spacing:.2em!important}
.sb-av{background:#b0895b!important;color:#1a1a19!important}
/* topo */
.topbar{background:#fbf9f4!important;border-bottom:1px solid #e3ddd1!important;box-shadow:none!important}
.topbar-title,#topbar-title{font-family:'Cormorant Garamond',serif!important;font-size:24px!important;font-weight:500!important;color:#1a1a19!important}
.tsearch,.form-input,.form-select,.filter-select{border:1px solid #e3ddd1!important;border-radius:3px!important;background:#fff!important;font-family:Inter,sans-serif!important}
.form-input:focus,.form-select:focus{border-color:#b0895b!important;box-shadow:0 0 0 3px rgba(176,137,91,.15)!important;outline:none}
/* cards / KPIs */
.card,.kpi,.icard,.pipe-col,.hcard,.modal{border-radius:6px!important;border:1px solid #e3ddd1!important;box-shadow:none!important;background:#fff!important}
.kpi,.kpi.green,.kpi.blue,.kpi.red,.kpi.gold{border-top:2px solid #b0895b!important}.kpi::before,.kpi::after{display:none!important}.funnel-bar-wrap{background:#efe9df!important}
.kpi.green,.kpi.blue,.kpi.red,.kpi.gold{background:#fff!important}
.kpi-label,.form-label,.eyebrow,.card-sub,.lp-key{font:600 10.5px Inter,sans-serif!important;letter-spacing:.14em!important;text-transform:uppercase!important;color:#8a857b!important}
.kpi-val{font-family:'Cormorant Garamond',serif!important;font-weight:500!important;font-size:38px!important;color:#1a1a19!important}
.kpi-delta{color:#8a857b!important;font-weight:400!important}
.card-title,.modal-title,.icard-title,.lead-name,.pipe-card-name{font-family:'Cormorant Garamond',serif!important;font-weight:600!important;letter-spacing:.01em}
.card-header{border-bottom:1px solid #efe9df!important}
[style*="font-weight:900"]{font-family:'Cormorant Garamond',serif!important;font-weight:500!important;font-size:26px!important}
/* botões */
.btn-submit,.btn-primary,.hbtn{background:#1a1a19!important;color:#fff!important;border:1px solid #1a1a19!important;border-radius:3px!important;font:600 11.5px Inter,sans-serif!important;letter-spacing:.1em!important;text-transform:uppercase!important;box-shadow:none!important}
.btn-submit:hover,.btn-primary:hover{background:#b0895b!important;border-color:#b0895b!important;color:#1a1a19!important}
.btn-cancel,.btn-sm,.btn-icard,.filter-btn{border-radius:3px!important;border:1px solid #e3ddd1!important;background:#fff!important;color:#1a1a19!important;font:500 12px Inter,sans-serif!important;box-shadow:none!important}
.btn-icard.dark{background:#1a1a19!important;color:#fff!important;border-color:#1a1a19!important}
.filter-btn.active,.btn-sm.green{background:#1a1a19!important;color:#fff!important;border-color:#1a1a19!important}
/* badges sóbrios */
.temp-badge,.status-badge,.origin-tag,.icard-badge,.itag,.rec-chip,.avail-badge{border-radius:100px!important;font:600 10px Inter,sans-serif!important;letter-spacing:.08em!important;text-transform:uppercase!important;border:1px solid #e3ddd1!important;background:#f6f2ea!important;color:#2c2b28!important}
.temp-quente{background:#1a1a19!important;color:#fff!important;border-color:#1a1a19!important}
.temp-morno{background:#efe4d2!important;color:#6b5434!important;border-color:#e3d2b6!important}
.status-fechado{background:#b0895b!important;color:#1a1a19!important}
.status-perdido{opacity:.6}
.ib-lanc,.ib-obras,.ib-pronto,.ib-mcmv{background:rgba(20,19,17,.82)!important;color:#fff!important;border:none!important}
.icard-img{background-color:#1c1b19!important}
.icard-price,.price-from{font-family:'Cormorant Garamond',serif!important;color:#1a1a19!important}
.pipe-col-header{background:#fbf9f4!important;border-bottom:2px solid #b0895b!important;border-radius:6px 6px 0 0!important}
.pipe-col-header.novo,.pipe-col-header.contato,.pipe-col-header.proposta,.pipe-col-header.visita,.pipe-col-header.fechado,.pipe-col-header.perdido{background:#fbf9f4!important;color:#1a1a19!important}
.pipe-card{border-radius:4px!important;border:1px solid #efe9df!important;box-shadow:none!important}
.funnel-bar{background:#b0895b!important}
.hoje-hero{background:#141311!important;border-radius:6px!important}
.urgency-strip{background:#f6f2ea!important;color:#6b5434!important}
.tl-dot{background:#f6f2ea!important;color:#b0895b!important}
.lead-table th{font:600 10.5px Inter!important;letter-spacing:.12em!important;text-transform:uppercase;color:#8a857b!important;background:#fbf9f4!important}
.lead-table tr:hover td{background:#fbf9f4!important}
.modal-bg{background:rgba(15,14,12,.72)!important;backdrop-filter:blur(3px)}
#pc-login{background:#141311!important}
#pc-login *{font-family:Inter,sans-serif}
`;
css+='@media(max-width:760px){\n.topbar{padding:10px 12px 10px 60px!important;gap:8px!important;min-height:58px}\n.topbar-title,#topbar-title{font-size:19px!important;white-space:nowrap!important;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}\n.tsearch{display:none!important}\n.topbar button,.topbar .btn-primary{padding:9px 12px!important;font-size:10.5px!important;white-space:nowrap}\n.hoje-hero{padding:18px!important}.hbtns{display:grid!important;grid-template-columns:1fr 1fr 1fr;gap:6px!important;width:100%}.hbtn{padding:10px 4px!important;font-size:10px!important;min-width:0}\n#coach>div:nth-child(2){grid-template-columns:1fr!important}#coach button{padding:12px!important}\n.kpi-row{grid-template-columns:1fr 1fr!important;gap:8px!important}.kpi{padding:14px!important}.kpi-val{font-size:30px!important}\n.grid-2{grid-template-columns:1fr!important}\n#c-body .card-body>div:first-child,#page-discador .card-body>div:first-child{grid-template-columns:1fr 1fr!important}\n#c-body>div[style*="repeat(4"]{grid-template-columns:1fr!important}\n#modal-ocr2 .modal-body>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}\n.modal{width:100%!important;max-width:100%!important;max-height:92vh!important;overflow:auto!important;border-radius:10px 10px 0 0!important}\n.modal-bg.open{align-items:flex-end!important;padding:0!important}\n.lead-table td,.lead-table th{white-space:nowrap}\n.page{padding-bottom:84px!important}\n.pipeline{grid-auto-flow:column;grid-auto-columns:82%;overflow-x:auto;display:grid!important;scroll-snap-type:x mandatory}.pipe-col{scroll-snap-align:start}\n#mtab{display:grid!important}\n}\n#mtab{display:none;position:fixed;left:0;right:0;bottom:0;z-index:90;background:#141311;border-top:1px solid #2c2b28;grid-template-columns:repeat(5,1fr);padding:6px 4px calc(6px + env(safe-area-inset-bottom))}\n#mtab button{background:none;border:none;color:rgba(255,255,255,.7);font:600 10px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:8px 2px;display:flex;flex-direction:column;align-items:center;gap:4px}\n#mtab button svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.6}#mtab button.on{color:#b0895b}\n';css+='@media(max-width:760px){\nbody{font-size:15px!important}small{font-size:13px!important}\n.form-input,.form-select,input,select,textarea{font-size:16px!important}\n.lead-name,.pipe-card-name,.icard-title{font-size:17px!important}\n#coach button b{font-size:16px}#coach small{font-size:13.5px!important}\n#sc-res table thead{display:none}#sc-res table,#sc-res tbody,#sc-res tr,#sc-res td{display:block!important;width:100%!important}\n#sc-res tr{position:relative;padding:12px 44px 12px 12px!important;border-bottom:1px solid #e3ddd1}\n#sc-res td{padding:3px 0!important}#sc-res td:first-child{position:absolute;right:10px;top:16px;width:auto!important}\n#sc-res td:first-child input{width:22px!important;height:22px!important}\n#sc-res input:not([type=checkbox]){width:100%!important;font-size:16px!important;padding:10px!important;border:1px solid #e3ddd1;border-radius:4px}\n#sc-res td:nth-child(2) input{font-weight:600;font-size:17px!important}\n#sc-res>div{max-height:none!important}\n#modal-lote b{font-size:16px}#modal-lote small{font-size:14px!important}\n#dc-fila .page-title{font-size:26px!important}#dc-fila{font-size:15px}\n}\n';var st=document.createElement('style');st.id='crm-skin';st.textContent=css;(document.head||document.documentElement).appendChild(st);
/* remove emojis da interface (o visual "infantil") sem tocar em dados */
var RT=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{2B07}\u{2705}\u{274C}]/u;var RE=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{2B07}\u{2705}\u{274C}\u{FE0F}]\s?/gu;
function limpa(root){var w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentNode;if(!p||/SCRIPT|STYLE|TEXTAREA|INPUT/.test(p.nodeName))return 2;return RT.test(n.nodeValue)?1:2}}),n,L=[];while(n=w.nextNode())L.push(n);L.forEach(function(n){RE.lastIndex=0;n.nodeValue=n.nodeValue.replace(RE,'')})}
function go(){tabbar();if(innerWidth<=760){setTimeout(function(){try{goPage('hoje')}catch(e){}},200)}limpa();var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){limpa()},60)}).observe(document.body,{childList:true,subtree:true,characterData:false})}
function tabbar(){if(document.getElementById('mtab'))return;var I={hoje:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',central:'<path d="M4 6h16M4 12h16M4 18h10"/>',discador:'<path d="M5 4h4l2 5-3 2a11 11 0 006 6l2-3 5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2"/>',scan:'<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M8 12h8"/>',imoveis:'<path d="M3 21h18M5 21V8l7-5 7 5v13M10 21v-6h4v6"/>'};
 var b=document.createElement('div');b.id='mtab';b.innerHTML=[['hoje','Hoje'],['central','Leads'],['discador','Ligar'],['scan','Scanner'],['imoveis','Imóveis']].map(function(x){return "<button data-p='"+x[0]+"'><svg viewBox='0 0 24 24'>"+I[x[0]]+"</svg>"+x[1]+"</button>"}).join('');document.body.appendChild(b);
 b.onclick=function(e){var t=e.target.closest('button');if(!t)return;var p=t.dataset.p;if(p==='scan'){window.abrirImportFoto&&abrirImportFoto();return}goPage(p);[].forEach.call(b.children,function(x){x.classList.toggle('on',x===t)});scrollTo(0,0)}}
if(document.readyState!=='loading')go();else document.addEventListener('DOMContentLoaded',go);
})();

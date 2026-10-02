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
.kpi{border-top:2px solid #b0895b!important}
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
var st=document.createElement('style');st.id='crm-skin';st.textContent=css;(document.head||document.documentElement).appendChild(st);
/* remove emojis da interface (o visual "infantil") sem tocar em dados */
var RT=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{2B07}\u{2705}\u{274C}]/u;var RE=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{2B07}\u{2705}\u{274C}\u{FE0F}]\s?/gu;
function limpa(root){var w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentNode;if(!p||/SCRIPT|STYLE|TEXTAREA|INPUT/.test(p.nodeName))return 2;return RT.test(n.nodeValue)?1:2}}),n,L=[];while(n=w.nextNode())L.push(n);L.forEach(function(n){RE.lastIndex=0;n.nodeValue=n.nodeValue.replace(RE,'')})}
function go(){limpa();var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){limpa()},60)}).observe(document.body,{childList:true,subtree:true,characterData:false})}
if(document.readyState!=='loading')go();else document.addEventListener('DOMContentLoaded',go);
})();

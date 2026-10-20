/* pc-mercado.js — barra de mercado financeiro (dados oficiais do Banco Central, SGS). Não inventa valores: se a consulta falhar, mostra "—". */
(function(){
  var S=[['Selic meta',432,'% a.a.',2],['CDI',4389,'% a.a.',2],['IPCA 12m',13522,'%',2],['Dólar',1,'R$',4]];
  var css=document.createElement('style');css.textContent='#pcm{position:fixed;top:0;left:0;right:0;height:30px;z-index:100000;background:#07111f;color:#e8edf5;font:600 12px/30px system-ui,sans-serif;display:flex;gap:18px;align-items:center;padding:0 12px;overflow-x:auto;white-space:nowrap;scrollbar-width:none}#pcm::-webkit-scrollbar{display:none}#pcm a{color:#d9a441;text-decoration:none;margin-left:auto;flex:none}#pcm b{color:#d9a441;font-weight:700}#pcm span{flex:none}body.pcm-on{padding-top:30px}body.pcm-on header,body.pcm-on .site-header,body.pcm-on #hdr{top:30px!important}';document.head.appendChild(css);
  var bar=document.createElement('div');bar.id='pcm';bar.setAttribute('aria-label','Mercado financeiro');
  bar.innerHTML=S.map(function(s){return '<span>'+s[0]+' <b id="pcm'+s[1]+'">—</b></span>'}).join('')+'<a href="escola-investidor.html">Entenda o mercado →</a>';
  function add(){document.body.insertBefore(bar,document.body.firstChild);document.body.classList.add('pcm-on')}
  if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
  function fmt(v,d,u){var n=parseFloat(v);if(isNaN(n))return '—';var t=n.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});return u=='R$'?'R$ '+t:t+(u.charAt(0)=='%'?'%':'%')}
  S.forEach(function(s){
    var ck='pcm_'+s[1];
    fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.'+s[1]+'/dados/ultimos/1?formato=json').then(function(r){return r.json()}).then(function(j){
      var v=j&&j[0]&&j[0].valor;if(v==null)throw 0;try{localStorage.setItem(ck,JSON.stringify({v:v,t:Date.now()}))}catch(e){}
      var el=document.getElementById('pcm'+s[1]);if(el)el.textContent=fmt(v,s[3],s[2]);
    }).catch(function(){try{var c=JSON.parse(localStorage.getItem(ck)||'null');var el=document.getElementById('pcm'+s[1]);if(c&&el)el.textContent=fmt(c.v,s[3],s[2])}catch(e){}});
  });
})();

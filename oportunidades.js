(function(){
var $=function(i){return document.getElementById(i)},D=[],SEL={},REG='',MAP=null,MK={};
var REGS={'Centro':['Centro'],'Zona Sul':['Botafogo','Copacabana','Flamengo','Gávea','Ipanema','Laranjeiras','Leblon','São Conrado'],'Barra e Zona Oeste':['Barra Olímpica','Barra da Tijuca','Recreio dos Bandeirantes','Vargem Grande / Pequena','Jacarepaguá'],'Zona Norte':['Tijuca']};
var COORD={'Barra Olímpica':[-22.978,-43.395],'Barra da Tijuca':[-23.0004,-43.3659],'Botafogo':[-22.9519,-43.1857],'Centro':[-22.9068,-43.1729],'Copacabana':[-22.9711,-43.1863],'Flamengo':[-22.934,-43.1756],'Gávea':[-22.9759,-43.2306],'Ipanema':[-22.9838,-43.2096],'Jacarepaguá':[-22.94,-43.35],'Laranjeiras':[-22.9358,-43.1887],'Leblon':[-22.9847,-43.224],'Recreio dos Bandeirantes':[-23.018,-43.464],'São Conrado':[-22.993,-43.27],'Tijuca':[-22.925,-43.233],'Vargem Grande / Pequena':[-23.02,-43.49]};
var TN={S:'Studio',1:'1 quarto',2:'2 quartos',3:'3 quartos',4:'4+ quartos',L:'Lote'};
var MS=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
var PHONE='(21) 98915-0864',WA='5521989150864',SITE='www.paulocotrim.com';
var TAGS={};try{TAGS=JSON.parse(localStorage.getItem('pc_tip')||'{}')}catch(e){}
function isAdm(){try{return localStorage.getItem('crm_auth')==='1'||!!sessionStorage.getItem('pc_k')}catch(e){return false}}
function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function N(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function R(v){return 'R$ '+Math.round(v).toLocaleString('pt-BR')}
function ent(r){if(r.status==='Pronto')return 'Pronto para morar';if(r.entrega){var a=r.entrega.split('-');return 'Entrega '+MS[+a[1]-1]+'/'+a[0]}return r.status==='Conforme projeto'?'Entrega conforme projeto':'Entrega a confirmar'}
function tips(r){return TAGS[r.nome]||r.tip||[]}
function tipTxt(r){var t=tips(r);return r.plantas&&!TAGS[r.nome]?r.plantas:(t.length?t.map(function(x){return TN[x]}).join(', '):'Tipologia não informada')}
function regOf(b){for(var k in REGS)if(REGS[k].indexOf(b)>-1)return k;return 'Outros'}
function list(){var q=N($('q').value),b=$('b').value,t=$('t').value,v=$('v').value,s=$('s').value,o=$('o').value,lo=0,hi=1e12;
if(v){var x=v.split('-');lo=+x[0];hi=+x[1]}
var a=D.filter(function(r){return(!REG||regOf(r.bairro)===REG)&&(!q||N(r.nome+' '+r.bairro).indexOf(q)>-1)&&(!b||r.bairro===b)&&(!t||tips(r).indexOf(t)>-1)&&r.preco>=lo&&r.preco<hi&&(!s||(s==='pronto'?r.status==='Pronto':r.status!=='Pronto'))});
a.sort(function(x,y){if(o==='p1')return x.preco-y.preco;if(o==='p2')return y.preco-x.preco;if(o==='e')return(x.entrega||'9999').localeCompare(y.entrega||'9999');return x.bairro.localeCompare(y.bairro,'pt')||x.nome.localeCompare(y.nome,'pt')});return a}
function draw(){var a=list(),adm=isAdm();
$('l').innerHTML=a.length?a.map(function(r){var msg=encodeURIComponent('Olá Paulo, vim pelo site e quero informações do '+r.nome+' ('+r.bairro+').');
var tg=adm?'<select class="tg" data-n="'+E(r.nome)+'" aria-label="Marcar tipologia"><option value="">marcar tipologia</option>'+Object.keys(TN).map(function(k){return'<option value="'+k+'">'+TN[k]+'</option>'}).join('')+'</select>':'';
return '<article class="card"><label class="ck"><input type="checkbox" data-s="'+E(r.nome)+'"'+(SEL[r.nome]?' checked':'')+'> Incluir no PDF</label>'+(r.status==='Pronto'?'<span class="tag p">Pronto</span>':'<span class="tag">Na planta / obras</span>')+'<h3>'+E(r.nome)+'</h3><div class="bd">'+E(r.bairro)+' · '+E(ent(r))+'</div><div class="bd">'+E(tipTxt(r))+'</div><div class="bd">A partir de</div><div class="pr">'+R(r.preco)+'</div>'+tg+
(r.url?'<a class="btn s" href="'+E(r.url)+'">Ver apresentação</a>':'')+'<a class="btn" target="_blank" rel="noopener" href="https://wa.me/'+WA+'?text='+msg+'">Quero informações</a></article>'}).join(''):'<p class="m">Nenhum empreendimento com esses filtros. Chame no WhatsApp que eu procuro para você.</p>';
count(a);map(a)}
function chosen(){var a=list(),c=a.filter(function(r){return SEL[r.nome]});return c.length?c:a}
function count(a){var n=Object.keys(SEL).filter(function(k){return SEL[k]}).length;$('cnt').textContent=a.length+' resultados'+(n?' · '+n+' selecionados':'')}
function map(a){if(!window.L||!MAP)return;var c={};a.forEach(function(r){c[r.bairro]=(c[r.bairro]||0)+1});
Object.keys(MK).forEach(function(k){MAP.removeLayer(MK[k]);delete MK[k]});var pts=[];
Object.keys(c).forEach(function(k){var p=COORD[k];if(!p)return;pts.push(p);var m=L.marker(p,{icon:L.divIcon({className:'',html:'<div style="background:#0b1b33;color:#fff;border:2px solid #d9a441;border-radius:99px;min-width:34px;height:34px;display:flex;align-items:center;justify-content:center;font:700 13px system-ui;padding:0 6px">'+c[k]+'</div>',iconSize:[34,34]})}).addTo(MAP);m.bindTooltip(k+': '+c[k]);m.on('click',function(){$('b').value=k;draw()});MK[k]=m});
if(pts.length)MAP.fitBounds(pts,{padding:[30,30],maxZoom:13})}
/* PDF */
function qrdata(url){var q=qrcode(0,'M');q.addData(url);q.make();return q}
function build(rows,nome,filtro){var J=window.jspdf.jsPDF,d=new J({unit:'mm',format:'a4'}),W=210,H=297,M=14,y,pg=0;
var navy=[11,27,51],amb=[217,164,65],gray=[91,102,118];
var wurl='https://wa.me/'+WA+'?text='+encodeURIComponent('Olá Paulo, vi sua seleção de oportunidades e quero conversar.');var qr=qrdata(wurl);
function foot(){var n=qr.getModuleCount(),sz=22,cs=sz/n,x0=W-M-sz,y0=H-M-sz+2;d.setFillColor(255,255,255);d.rect(x0-1,y0-1,sz+2,sz+2,'F');d.setFillColor(0,0,0);
for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(qr.isDark(r,c))d.rect(x0+c*cs,y0+r*cs,cs+.02,cs+.02,'F');
d.setDrawColor.apply(d,amb);d.setLineWidth(.5);d.line(M,H-M-sz,W-M-sz-4,H-M-sz);
d.setTextColor.apply(d,navy);d.setFont('helvetica','bold');d.setFontSize(11);d.text('Corretor Paulo Cotrim',M,H-M-sz+7);
d.setFont('helvetica','normal');d.setFontSize(9);d.setTextColor.apply(d,gray);d.text('CRECI-RJ 77677-F  |  WhatsApp '+PHONE,M,H-M-sz+12);d.text(SITE+'  |  Instagram @corretor.paulocotrim',M,H-M-sz+16.5);
d.setFontSize(7);d.text('Valores "a partir de" da tabela Sawala, outubro/2026, sujeitos a altera\u00e7\u00e3o e disponibilidade. Conte\u00fado informativo.',M,H-M-sz+21);
d.setFontSize(7);d.text('Aponte a c\u00e2mera e fale comigo',W-M,H-M-sz-2,{align:'right'})}
function top(){pg++;d.setFillColor.apply(d,navy);d.rect(0,0,W,pg===1?44:16,'F');d.setFillColor.apply(d,amb);d.rect(0,pg===1?44:16,W,1.2,'F');
d.setTextColor(255,255,255);d.setFont('helvetica','bold');d.setFontSize(pg===1?22:13);d.text('PAULO COTRIM',M,pg===1?18:10);
if(pg===1){d.setFont('helvetica','normal');d.setFontSize(10);d.setTextColor.apply(d,amb);d.text('CORRETOR DE IM\u00d3VEIS  |  RIO DE JANEIRO  |  CRECI-RJ 77677-F',M,25);
d.setTextColor(255,255,255);d.setFontSize(15);d.setFont('helvetica','bold');d.text('Selecao de oportunidades'.replace('Selecao','Seleção'),M,35);
d.setFontSize(9);d.setFont('helvetica','normal');d.text(nome?('Preparado para '+nome):'Preparado para você',W-M,18,{align:'right'});d.text(new Date().toLocaleDateString('pt-BR'),W-M,24,{align:'right'});y=52;
d.setTextColor.apply(d,gray);d.setFontSize(9);var t=d.splitTextToSize('Filtro: '+filtro+'  |  '+rows.length+' empreendimento'+(rows.length>1?'s':''),W-2*M);d.text(t,M,y);y+=t.length*4.4+3}else y=24;foot()}
top();var maxY=H-M-30;
rows.forEach(function(r,i){if(y+15>maxY){d.addPage();top()}
if(i%2===0){d.setFillColor(246,247,249);d.rect(M-2,y-4.5,W-2*M+4,14,'F')}
d.setTextColor.apply(d,navy);d.setFont('helvetica','bold');d.setFontSize(10.5);d.text(r.nome,M,y);
d.setFont('helvetica','normal');d.setFontSize(8.5);d.setTextColor.apply(d,gray);d.text(r.bairro+'  |  '+ent(r),M,y+4.2);if(tips(r).length||r.plantas)d.text(d.splitTextToSize(tipTxt(r),95)[0],M,y+8);
d.setTextColor.apply(d,gray);d.setFontSize(7.5);d.text('a partir de',W-M,y-.5,{align:'right'});d.setTextColor.apply(d,navy);d.setFont('helvetica','bold');d.setFontSize(12);d.text(R(r.preco),W-M,y+5,{align:'right'});y+=14.5});
return d}
function filtroTxt(){var p=[];if(REG)p.push(REG);if($('b').value)p.push($('b').value);if($('t').value)p.push(TN[$('t').value]);if($('v').selectedIndex>0)p.push($('v').options[$('v').selectedIndex].text);if($('s').selectedIndex>0)p.push($('s').options[$('s').selectedIndex].text);if($('q').value)p.push('busca "'+$('q').value+'"');return p.length?p.join(', '):'todas as regiões'}
function fname(n){return 'oportunidades-paulo-cotrim'+(n?'-'+N(n).replace(/[^a-z0-9]+/g,'-'):'')+'.pdf'}
function gerar(nome,share,ph){var rows=chosen();if(!rows.length)return alert('Nenhum empreendimento para o PDF.');var doc=build(rows,nome,filtroTxt()),fn=fname(nome);
if(share){var blob=doc.output('blob'),f=new File([blob],fn,{type:'application/pdf'});
if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:'Paulo Cotrim | oportunidades selecionadas para você'}).catch(function(){});return}
doc.save(fn);var tel=(ph||'').replace(/\D/g,'');setTimeout(function(){window.open('https://wa.me/'+(tel?(tel.length<=11?'55'+tel:tel):'')+'?text='+encodeURIComponent('Segue a seleção de oportunidades que preparei para você. (anexe o PDF baixado)'),'_blank')},400);return}
doc.save(fn)}
function lead(n,e,t,opt){var f=filtroTxt();try{enviarLeadCRM({nome:n,email:e,telefone:t,interesse:'PDF oportunidades: '+f,regiao:REG||'',origem:'site:pdf-oportunidades',temp:'morno',obs:(opt?'Quer atualizacoes por e-mail. ':'')+'Baixou PDF com '+chosen().length+' empreendimentos ('+f+')'})}catch(x){}}
document.addEventListener('DOMContentLoaded',init);if(document.readyState!=='loading')init();var ok=0;
function init(){if(ok)return;ok=1;
fetch('data/sawala-oportunidades.json').then(function(r){return r.json()}).then(function(j){D=j.itens||[];
var rg=$('reg');rg.innerHTML=['Todas'].concat(Object.keys(REGS)).map(function(k){return'<button type="button" data-r="'+(k==='Todas'?'':k)+'"'+(k==='Todas'?' class="on"':'')+'>'+k+'</button>'}).join('');
var bs={};D.forEach(function(r){bs[r.bairro]=1});Object.keys(bs).sort(function(x,y){return x.localeCompare(y,'pt')}).forEach(function(k){var op=document.createElement('option');op.value=k;op.textContent=k;$('b').appendChild(op)});
$('sub').textContent=D.length+' empreendimentos com bairro, entrega e valor a partir de. Escolha a região, filtre e baixe em PDF. Atualizado em outubro de 2026.';$('nt').textContent=j.fonte||'';
if(isAdm()){$('adm').classList.add('on');$('wa').style.display='inline-flex'}
if(window.L){MAP=L.map('mp',{scrollWheelZoom:false}).setView([-22.97,-43.25],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'\u00a9 OpenStreetMap',maxZoom:18}).addTo(MAP)}else $('mp').style.display='none';
['q','b','t','v','s','o'].forEach(function(i){$(i).addEventListener('input',draw)});
rg.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;REG=b.getAttribute('data-r');$('b').value='';[].forEach.call(rg.children,function(x){x.classList.toggle('on',x===b)});draw()});
$('l').addEventListener('change',function(e){var t=e.target;if(t.dataset.s){SEL[t.dataset.s]=t.checked;count(list())}if(t.dataset.n){if(t.value){TAGS[t.dataset.n]=[t.value];try{localStorage.setItem('pc_tip',JSON.stringify(TAGS))}catch(x){}draw()}}});
$('all').onclick=function(){list().forEach(function(r){SEL[r.nome]=1});draw()};$('none').onclick=function(){SEL={};draw()};
$('pdf').onclick=function(){if(isAdm())return gerar($('cn').value.trim());var k=null;try{k=JSON.parse(localStorage.getItem('pc_pdf_ok')||'null')}catch(x){}
if(k&&k.e)return gerar(k.n);$('md').classList.add('on')};
$('wa').onclick=function(){gerar($('cn').value.trim(),1,$('ct').value)};
$('mx').onclick=function(){$('md').classList.remove('on')};
$('fm').onsubmit=function(e){e.preventDefault();var n=$('mn').value.trim(),m=$('me').value.trim(),t=$('mt').value.trim();
try{localStorage.setItem('pc_pdf_ok',JSON.stringify({n:n,e:m}))}catch(x){}lead(n,m,t,$('mc').checked);$('md').classList.remove('on');gerar(n)};
draw()}).catch(function(){$('sub').textContent='Não consegui carregar a lista agora. Chame no WhatsApp.'})}
})();

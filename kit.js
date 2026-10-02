/* Kit do empreendimento: material para download + negociação, segmentado (premium x MCMV), tudo registrado no CRM */
(function(){
var P=(location.pathname.split('/').pop()||'').toLowerCase();
var EXTRA=['farol-da-guanabara.html','arcos-do-porto.html','orla-central.html','parque-piedade.html','luzes-do-rio-lamparina.html','luzes-do-rio-candeeiro.html','cartola-ii.html','caminhos-da-guanabara.html'];
if(!/^emp-.+\.html$/.test(P)&&EXTRA.indexOf(P)<0)return;
var WA='5521989150864';
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function origem(){var q=new URLSearchParams(location.search),u=q.get('utm_source');var r=document.referrer;
 return u?(u+(q.get('utm_campaign')?'/'+q.get('utm_campaign'):'')):(r?(/google/.test(r)?'Google':/instagram|facebook|fb\./.test(r)?'Instagram/Facebook':/paulocotrim/.test(r)?'Site':'Link externo'):'Direto');}
try{if(!sessionStorage.pc_orig)sessionStorage.pc_orig=origem()}catch(e){}
function boot(cat){
 var E=(cat||[]).filter(function(e){return (e.url||'').toLowerCase()===P})[0]||{};
 var nome=E.nome||(document.querySelector('h1')||{}).textContent||document.title.split('·')[0];nome=String(nome).trim();var NOME0=nome;
 var PREM=['emp-marino-by-breton.html','emp-kronos.html','emp-riio-by-lissoni.html','emp-green-view-barra.html','emp-ilha-pura-astra.html','emp-ilha-pura-oro.html','emp-peninsula-singular.html','emp-be-in-rio-barao-jaguaripe.html'];
 var premium=PREM.indexOf(P)>=0||(E.fonte&&E.fonte!=='antigo'&&/Zona Sul|Barra/.test(E.regiao||''));
 var ops=premium?[
  ['resumo','Baixar resumo','Ficha completa em PDF: localização, plantas, diferenciais e valores de referência.'],
  ['fotos','Galeria de fotos','Todas as imagens do empreendimento em alta para baixar.'],
  ['video','Agendar videochamada','Apresentação privada do empreendimento e das unidades disponíveis.'],
  ['reserva','Reservar unidade','Bloqueio da unidade escolhida enquanto avaliamos as condições.'],
  ['negocia','Negociação online','Proposta e condições discutidas 100% online, com sigilo.']]:[
  ['resumo','Baixar resumo','Ficha com localização, plantas, lazer e valores de referência.'],
  ['tabela','Tabela de preços','Receba a tabela vigente com unidades disponíveis.'],
  ['fotos','Fotos do empreendimento','Imagens do projeto e do decorado para baixar.'],
  ['docs','Enviar documentação','Análise de crédito Caixa e Minha Casa Minha Vida sem sair de casa.'],
  ['video','Agendar videochamada','Tire dúvidas de financiamento, entrada e subsídio ao vivo.'],
  ['negocia','Negociação online','Condições e proposta pelo WhatsApp, do início ao contrato.']];
 var css="#pckit{background:#141311;color:#fff;padding:64px 0;font-family:Inter,sans-serif}#pckit .w{max-width:1100px;margin:0 auto;padding:0 22px}"
 +"#pckit h2{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:clamp(28px,4vw,42px);margin:8px 0 6px}#pckit .ey{font:600 11px Inter;letter-spacing:.2em;text-transform:uppercase;color:#b0895b}"
 +"#pckit .g{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px}@media(max-width:820px){#pckit .g{grid-template-columns:1fr 1fr}}@media(max-width:520px){#pckit .g{grid-template-columns:1fr}}"
 +"#pckit button.o{text-align:left;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.14);color:#fff;border-radius:6px;padding:20px;cursor:pointer;transition:.25s}#pckit button.o:hover{border-color:#b0895b;background:rgba(176,137,91,.1)}"
 +"#pckit button.o b{display:block;font:500 21px 'Cormorant Garamond',serif;margin-bottom:6px}#pckit button.o span{font-size:13px;color:rgba(255,255,255,.65);line-height:1.55}"
 +"#pckm{position:fixed;inset:0;z-index:99;background:rgba(10,10,9,.8);display:none;align-items:center;justify-content:center;padding:18px}#pckm.on{display:flex}"
 +"#pckm .bx{background:#fff;color:#1a1a19;max-width:440px;width:100%;border-radius:6px;padding:26px}#pckm h3{font:500 26px 'Cormorant Garamond',serif;margin-bottom:4px}#pckm p{font-size:13px;color:#8a857b;margin-bottom:14px}"
 +"#pckm input,#pckm select{width:100%;border:1px solid #e3ddd1;border-radius:4px;padding:12px;font:400 14px Inter;margin-bottom:10px}#pckm .go{width:100%;background:#b0895b;color:#1a1a19;border:none;border-radius:4px;padding:14px;font:600 12px Inter;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}"
 +"#pckm .x{float:right;background:none;border:none;font-size:24px;cursor:pointer}#pckit-fab{position:fixed;left:16px;bottom:18px;z-index:79;background:#141311;color:#fff;border:1px solid #b0895b;border-radius:100px;padding:12px 18px;font:600 11.5px Inter;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}"
 +"@media(max-width:1024px){body.has-sticky #pckit-fab{bottom:78px}}";
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 var sec=document.createElement('section');sec.id='pckit';
 sec.innerHTML="<div class='w'><span class='ey'>"+(premium?'Atendimento privado':'Material e negociação')+"</span><h2>"+esc(nome)+": tudo para decidir</h2><p style='color:rgba(255,255,255,.7);max-width:60ch'>"+(premium?'Material completo e negociação com discrição — por videochamada ou online, no seu tempo.':'Baixe o material, receba a tabela e faça sua análise de crédito sem sair de casa.')+"</p><div class='g'>"+ops.map(function(o){return "<button class='o' data-k='"+o[0]+"'><b>"+o[1]+"</b><span>"+o[2]+"</span></button>"}).join('')+"</div></div>";
 var ft=document.querySelector('footer');(ft?ft.parentNode.insertBefore(sec,ft):document.body.appendChild(sec));
 var fab=document.createElement('button');fab.id='pckit-fab';fab.textContent=premium?'Material e videochamada':'Baixar material';fab.onclick=function(){sec.scrollIntoView({behavior:'smooth'})};document.body.appendChild(fab);
 var r=document.getElementById('pc-rent');if(r)r.style.bottom=(window.innerWidth<=1024&&document.body.classList.contains('has-sticky'))?'130px':'70px';
 var m=document.createElement('div');m.id='pckm';document.body.appendChild(m);
 var saved={};try{saved=JSON.parse(localStorage.pc_kit_user||'{}')}catch(e){}
 function lead(k,lbl,extra){try{if(localStorage.getItem('crm_auth')==='1')return}catch(e){}var d={nome:saved.nome,telefone:saved.tel,email:saved.email||'',interesse:nome+' · '+lbl+(extra?' · '+extra:''),origem:'kit:'+k+' · '+(sessionStorage.pc_orig||'Direto'),temp:/reserva|negocia|video|docs/.test(k)?'quente':'morno'};
  try{window.enviarLeadCRM&&window.enviarLeadCRM(d)}catch(e){}
  try{var q=JSON.parse(localStorage.pc_kit_log||'[]');q.push({t:Date.now(),p:P,k:k,d:d});localStorage.pc_kit_log=JSON.stringify(q.slice(-50))}catch(e){}
  try{window.gtag&&gtag('event','kit_'+k,{empreendimento:nome});window.fbq&&fbq('track','Lead',{content_name:nome+' '+k})}catch(e){}}
 function wa(t){window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(t),'_blank')}
 function imgs(){var s={};[].forEach.call(document.querySelectorAll('img'),function(i){if(i.naturalWidth>300&&!/logo|favicon|svg/.test(i.src))s[i.src]=1});
  [].forEach.call(document.querySelectorAll('[style*="background-image"]'),function(e){var u=(e.style.backgroundImage.match(/url\(["']?([^"')]+)/)||[])[1];if(u&&!/logo|svg|gradient/.test(u))s[new URL(u,location.href).href]=1});return Object.keys(s)}
 function resumo(){var w=window.open('','_blank');var main=document.querySelector('main')||document.body;
  var txt=[].map.call(main.querySelectorAll('h2,h3,p,li'),function(e){return e.closest('#pckit,footer,header,#pcx-hd,nav')?'':'<'+e.tagName.toLowerCase()+'>'+esc(e.innerText)+'</'+e.tagName.toLowerCase()+'>'}).join('').slice(0,12000);
  var im=imgs().slice(0,4).map(function(u){return "<img src='"+u+"'>"}).join('');
  w.document.write("<html><head><meta charset='utf-8'><title>"+esc(nome)+" · Resumo · Paulo Cotrim</title><link href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Inter:wght@400;600&display=swap' rel='stylesheet'><style>body{font-family:Inter,sans-serif;color:#1a1a19;max-width:800px;margin:30px auto;padding:0 24px;font-size:13px;line-height:1.6}h1,h2,h3{font-family:'Cormorant Garamond',serif;font-weight:500}h1{font-size:38px;margin:4px 0}.top{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #b0895b;padding-bottom:12px}img{width:49%;margin:.5%;border-radius:4px}.ft{border-top:1px solid #e3ddd1;margin-top:24px;padding-top:10px;font-size:11px;color:#8a857b}@media print{.np{display:none}}</style></head><body><div class='top'><img src='"+location.origin+"/logo-premium.svg' style='width:220px;margin:0'><button class='np' onclick='print()' style='background:#b0895b;border:none;padding:10px 16px;border-radius:4px;cursor:pointer'>Salvar PDF</button></div><p style='color:#b0895b;letter-spacing:.2em;font-size:10px;margin-top:18px'>RESUMO DO EMPREENDIMENTO</p><h1>"+esc(nome)+"</h1><p>"+esc([E.local,E.incorporadora,E.status,E.plantas].filter(Boolean).join(' · '))+"</p>"+(E.preco?"<p style='font-size:18px'>A partir de <b>R$ "+Math.round(E.preco).toLocaleString('pt-BR')+"</b> (referência "+(E.ref||'tabela vigente')+")</p>":"")+im+txt+"<div style='display:flex;gap:14px;align-items:center;margin-top:20px;border:1px solid #e3ddd1;padding:12px;border-radius:6px'><img src='https://api.qrserver.com/v1/create-qr-code/?size=140x140&data="+encodeURIComponent(location.origin+location.pathname+'?utm_source=pdf')+"' style='width:90px;margin:0'><div><b>Veja online, simule e fale comigo</b><br>Aponte a câmera para o código ou acesse "+location.host+location.pathname+"</div></div><div class='ft'>Paulo Cotrim · CRECI-RJ 77677-F · WhatsApp (21) 98915-0864 · www.paulocotrim.com<br>Material de apresentação. Valores, áreas e condições sujeitos à tabela oficial vigente e à disponibilidade.</div></body></html>");w.document.close();}
 function fotos(){var L=imgs(),w=window.open('','_blank');w.document.write("<html><head><meta charset='utf-8'><title>Fotos · "+esc(nome)+"</title><style>body{font-family:Inter,sans-serif;background:#141311;color:#fff;margin:0;padding:24px}h1{font-family:Georgia,serif;font-weight:400}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}a{display:block;color:#b0895b;font-size:12px;text-decoration:none}img{width:100%;border-radius:4px;display:block;margin-bottom:6px}</style></head><body><h1>"+esc(nome)+" · fotos</h1><p style='color:#aaa;font-size:12px'>Toque em “baixar” em cada imagem. Imagens ilustrativas.</p><div class='g'>"+(L.length?L.map(function(u,i){return "<div><img src='"+u+"'><a href='"+u+"' download='"+esc(nome).replace(/\W+/g,'-')+"-"+(i+1)+".jpg'>Baixar foto "+(i+1)+" ↓</a></div>"}).join(''):"<p>Peça as fotos pelo WhatsApp.</p>")+"</div></body></html>");w.document.close();}
 var LBL={resumo:'resumo PDF',fotos:'fotos',video:'videochamada',reserva:'reserva de unidade',negocia:'negociação online',tabela:'tabela de preços',docs:'envio de documentação'};
 function act(k){lead(k,LBL[k],k==='video'?(document.getElementById('kd')||{}).value:'');
  if((k==='resumo'||k==='fotos')&&nome!==NOME0){wa('Olá Paulo, quero o '+LBL[k]+' do '+nome+'. (vim pelo site — '+(sessionStorage.pc_orig||'Direto')+')');nome=NOME0;return}
  if(k==='resumo')return resumo();if(k==='fotos')return fotos();
  if(k==='tabela'&&/saudosa/.test(P)){window.open('tabelas/saudosa-praca-onze-agosto-2026.pdf','_blank');return}
  if(k==='docs'){location.href='documentos.html?emp='+encodeURIComponent(nome);return}
  var tx={video:'Olá Paulo, quero agendar uma videochamada sobre o '+nome+' — melhor horário: '+((document.getElementById('kd')||{}).value||'a combinar')+'.',
   reserva:'Olá Paulo, quero reservar uma unidade no '+nome+'. Pode me enviar as unidades disponíveis?',negocia:'Olá Paulo, quero negociar online o '+nome+'.',tabela:'Olá Paulo, quero a tabela de preços atualizada do '+nome+'.'}[k];
  wa(tx+' (vim pelo site — '+(sessionStorage.pc_orig||'Direto')+')')}
 var ADM=false;try{ADM=localStorage.getItem('crm_auth')==='1'}catch(e){}
 if(ADM){var ab=document.createElement('div');ab.style.cssText='margin-top:22px;border:1px dashed #b0895b;border-radius:6px;padding:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center';
  ab.innerHTML="<b style='color:#b0895b;font:600 11px Inter;letter-spacing:.14em'>MODO CORRETOR</b><button class='o' id='adm-cp' style='padding:10px 14px'>Copiar link para o cliente</button><button class='o' id='adm-wa' style='padding:10px 14px'>Enviar no WhatsApp</button><a class='o' href='crm.html' style='padding:10px 14px;color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.14);border-radius:6px'>Abrir CRM</a>";
  sec.querySelector('.w').appendChild(ab);
  var link=location.origin+location.pathname+'?utm_source=paulo&utm_campaign=envio-direto';
  ab.querySelector('#adm-cp').onclick=function(){navigator.clipboard&&navigator.clipboard.writeText(link);this.textContent='Link copiado ✓'};
  ab.querySelector('#adm-wa').onclick=function(){window.open('https://wa.me/?text='+encodeURIComponent('Separei o '+nome+' pra você: '+link+'\nNo link você baixa o resumo, as fotos e pode agendar uma videochamada comigo. — Paulo Cotrim'),'_blank')};}
 sec.addEventListener('click',function(e){var b=e.target.closest('button.o');if(!b)return;var k=b.getAttribute('data-k');
  if(ADM){saved=saved.nome?saved:{nome:'Paulo (corretor)',tel:'',email:''};if(k==='resumo')return resumo();if(k==='fotos')return fotos();}
  m.innerHTML="<div class='bx'><button class='x' aria-label='Fechar'>&times;</button><h3>"+esc(b.querySelector('b').textContent)+"</h3><p>"+esc(nome)+" · informe seu contato para liberar.</p><input id='kn' placeholder='Seu nome' value='"+esc(saved.nome||'')+"'><input id='kt' placeholder='WhatsApp com DDD' inputmode='tel' value='"+esc(saved.tel||'')+"'><input id='ke' type='email' placeholder='Seu e-mail' value='"+esc(saved.email||'')+"'><select id='kc'>"+(cat||[]).map(function(x){return x.nome}).concat([nome]).filter(function(v,i,a){return a.indexOf(v)===i}).sort().map(function(v){return "<option"+(v===nome?' selected':'')+">"+esc(v)+"</option>"}).join('')+"</select><label style='display:flex;gap:8px;font-size:12.5px;align-items:flex-start;margin-bottom:12px'><input type='checkbox' id='kok' style='width:auto;margin:2px 0 0'> Confirmo que quero informações deste condomínio.</label>"+(k==='video'?"<input id='kd' placeholder='Melhor dia e horário'>":"")+"<button class='go'>Continuar</button><p style='margin:10px 0 0;font-size:11px'>Seus dados vão só para o Paulo Cotrim. Sem spam.</p></div>";
  m.classList.add('on');m.querySelector('.x').onclick=function(){m.classList.remove('on')};
  m.querySelector('.go').onclick=function(){var n=m.querySelector('#kn').value.trim(),t=m.querySelector('#kt').value.replace(/\D/g,''),em=m.querySelector('#ke').value.trim(),cc=m.querySelector('#kc').value;
   if(n.length<2){alert('Informe seu nome');return}if(t.length<10){alert('Informe o WhatsApp com DDD');return}if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){alert('Informe um e-mail válido');return}if(!m.querySelector('#kok').checked){alert('Confirme o condomínio desejado');return}
   nome=cc;saved={nome:n,tel:t,email:em};try{localStorage.pc_kit_user=JSON.stringify(saved)}catch(e){}act(k);m.classList.remove('on')}});
}
function go(){fetch('data/catalogo.json').then(function(r){return r.json()}).then(function(d){boot(d.itens)}).catch(function(){boot([])})}
if(document.readyState!=='loading')go();else document.addEventListener('DOMContentLoaded',go);
})();

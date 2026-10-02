/* CRM PRO — scanner de leads (print/lista/foto), fonte obrigatória, bairro, discador inteligente, rotina do dia, envio de material */
(function(){
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hoje(){return new Date().toLocaleDateString('pt-BR')}
function agora(){return new Date().toLocaleString('pt-BR')}
function tnorm(t){t=String(t||'').replace(/\D/g,'');if(t.length>11&&t.indexOf('55')===0)t=t.slice(2);return t}
function fmtTel(t){t=tnorm(t);return t.length===11?'('+t.slice(0,2)+') '+t.slice(2,7)+'-'+t.slice(7):t.length===10?'('+t.slice(0,2)+') '+t.slice(2,6)+'-'+t.slice(6):t}
var BAIRROS=['Ipanema','Leblon','Copacabana','Leme','Botafogo','Flamengo','Laranjeiras','Humaitá','Urca','Gávea','Lagoa','Jardim Botânico','São Conrado','Barra da Tijuca','Recreio','Recreio dos Bandeirantes','Jacarepaguá','Freguesia','Pechincha','Taquara','Vargem Grande','Camorim','Tijuca','Grajaú','Vila Isabel','Maracanã','Andaraí','Méier','Cachambi','Engenho de Dentro','Engenho Novo','Piedade','Pilares','Madureira','Irajá','Penha','Bonsucesso','Ramos','Olaria','Inhaúma','Todos os Santos','Riachuelo','Rocha','São Cristóvão','Benfica','Centro','Lapa','Glória','Catete','Santo Cristo','Saúde','Gamboa','Porto Maravilha','Rio Comprido','Estácio','Praça Seca','Vila Valqueire','Campo Grande','Santa Cruz','Bangu','Realengo','Niterói','Icaraí','São Gonçalo','Nova Iguaçu','Duque de Caxias','Caxias'];
function semAc(s){return String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()}
var BN=BAIRROS.map(semAc).map(function(b,i){return[b,BAIRROS[i]]}).sort(function(a,b){return b[0].length-a[0].length});
function achaBairro(s){var l=semAc(s);for(var i=0;i<BN.length;i++)if(new RegExp('\\b'+BN[i][0]+'\\b').test(l))return BN[i][1];return ''}
var reTel=/(?:\+?55[\s.-]*)?\(?\d{2}\)?[\s.-]*9?\s?\d{4}[\s.-]*\d{4}/g, reMail=/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
var LIXO=/\b(gmail|hotmail|outlook|yahoo|com|br|tel|telefone|whats(app)?|zap|cel(ular)?|fone|contato|nome|e-?mail|bairro|regi[aã]o|cliente|lead|online|digitando|visto por [úu]ltimo|hoje|ontem|mensagem|grupo|você|voce|admin)\b/gi;
var STOP=/\b(oi|ol[aá]|quero|queria|gostaria|saber|bom dia|boa tarde|boa noite|tudo bem|obrigad\w*|sim|n[aã]o|informa\w*|apartamento|im[oó]vel|valor|pre[cç]o|lista|lead|leads|planilha|interessad\w*|vou|pode|preciso|tem|qual|quanto)\b/i;
function soNome(s,keep){if(STOP.test(semAc(s)))return '';var b0=keep?'':achaBairro(s);if(b0)s=String(s).replace(new RegExp(b0.replace(/\s+/g,'\\s+'),'i'),' ').replace(new RegExp(semAc(b0),'i'),' ');var n=String(s).replace(reMail,'').replace(reTel,'').replace(/\b\d{1,2}:\d{2}\b/g,'').replace(LIXO,' ').replace(/[^A-Za-zÀ-ÿ\s'.]/g,' ').replace(/\s+/g,' ').trim();
 
 if(n.length<2||n.split(' ').length>6)return '';return n.split(' ').slice(0,4).map(function(w){return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()}).join(' ')}
/* Leitura inteligente: 3 formatos — (1) linha com nome+telefone, (2) bloco vertical (nome em cima, dados embaixo — prints de WhatsApp), (3) colunas (todos os nomes, depois todos os telefones, depois e-mails) */
window.parseContatosOCR=function(txt){
 var L=String(txt).split(/\n/).map(function(x){return x.trim()}).filter(Boolean),it=[],bairrosLista={};
 L.forEach(function(ln){var tels=(ln.match(reTel)||[]).map(tnorm).filter(function(t){return t.length>=10&&t.length<=11}),mails=ln.match(reMail)||[];var cut=ln.search(/\(?\d{2}\)?[\s.-]*9?\s?\d{4}[\s.-]*\d{4}|[\w.+-]+@/);var antes=cut>0?ln.slice(0,cut):(cut===0?'':ln),depois=cut>=0?ln.slice(cut):'';var nm=(tels.length||mails.length)?soNome(antes,1):soNome(ln),b=(tels.length||mails.length)?achaBairro(depois.replace(reMail,' ').replace(reTel,' ')):achaBairro(ln);
  if(b&&!tels.length&&!mails.length)bairrosLista[b]=(bairrosLista[b]||0)+1;
  if(tels.length||mails.length||nm)it.push({tels:tels,mails:mails,nome:nm,b:b,both:!!(nm&&(tels.length||mails.length))})});
 var bairroUnico=Object.keys(bairrosLista).length===1?Object.keys(bairrosLista)[0]:'';
 var rows=it.filter(function(x){return x.both}).length;
 var names=it.filter(function(x){return x.nome&&!x.tels.length&&!x.mails.length}).map(function(x){return x.nome});
 var tels=[].concat.apply([],it.map(function(x){return x.both?[]:x.tels})),mails=[].concat.apply([],it.map(function(x){return x.both?[]:x.mails}));
 function runs(){var mx={n:0,t:0},cur='',c=0;it.forEach(function(x){var k=x.both?'r':x.tels.length?'t':x.mails.length?'m':'n';if(k===cur)c++;else{cur=k;c=1}if(k==='n'||k==='t')mx[k]=Math.max(mx[k],c)});return mx}
 var R=runs(),out=[];
 if(R.n>=2&&R.t>=2&&rows<names.length/2){ // formato colunas
  var n=Math.max(names.length,tels.length);for(var i=0;i<n;i++)out.push({nome:names[i]||'Contato',tel:tels[i]||'',email:mails[i]||'',regiao:bairroUnico,modo:'colunas'});
 }else{ // linhas + blocos verticais
  var cur=null;function push(){if(cur&&(cur.tel||cur.email))out.push(cur);cur=null}
  it.forEach(function(x){
   if(x.both){push();x.tels.length?x.tels.forEach(function(t,j){out.push({nome:x.nome,tel:t,email:j?'':(x.mails[0]||''),regiao:x.b||bairroUnico,modo:'linha'})}):out.push({nome:x.nome,tel:'',email:x.mails[0],regiao:x.b||bairroUnico,modo:'linha'});return}
   if(x.nome){if(cur&&(cur.tel||cur.email))push();if(!cur||cur.tel||cur.email)cur={nome:x.nome,tel:'',email:'',regiao:bairroUnico,modo:'bloco'};else cur.nome=x.nome;if(x.b)cur.regiao=x.b;return}
   if(!cur)cur={nome:'Contato',tel:'',email:'',regiao:bairroUnico,modo:'bloco'};
   if(x.tels.length){if(cur.tel){var nn=cur.nome;push();cur={nome:nn==='Contato'?'Contato':'Contato',tel:'',email:'',regiao:bairroUnico,modo:'bloco'}}cur.tel=x.tels[0]}
   if(x.mails.length){if(cur.email&&cur.tel){push();cur={nome:'Contato',tel:'',email:'',regiao:bairroUnico,modo:'bloco'}}cur.email=x.mails[0]}
   if(x.b)cur.regiao=x.b});push()}
 var seen={};out=out.filter(function(c){var t=tnorm(c.tel).slice(-9),e=(c.email||'').toLowerCase();if((t&&seen['t'+t])||(!t&&e&&seen['e'+e])||(!t&&!e))return false;if(t)seen['t'+t]=1;if(e)seen['e'+e]=1;return true});out.forEach(function(c){var e=(c.email||'').toLowerCase();if(e&&out.filter(function(x){return (x.email||'').toLowerCase()===e}).length>1&&!c.tel)c.drop=1});out=out.filter(function(c){return !c.drop});
 out.bairroUnico=bairroUnico;return out};

/* Scanner: modal com fonte obrigatória, bairro da lista, data */
var FONTES=['Plantão / stand','Evento / feira','Panfletagem / rua','Indicação','Lista da construtora','Grupo de WhatsApp','Instagram','Facebook / Meta Ads','Google','Portal (Zap/VivaReal/OLX)','Ligação recebida','Outro'];
window.abrirImportFoto=function(){var m=$('modal-ocr2');if(!m){m=document.createElement('div');m.id='modal-ocr2';m.className='modal-bg';document.body.appendChild(m)}
 m.innerHTML="<div class='modal' style='max-width:760px'><div class='modal-head'><div class='modal-title'>&#128247; Scanner de leads</div><button class='modal-x' onclick=\"closeModal('modal-ocr2')\">&times;</button></div><div class='modal-body'>"
 +"<p style='font-size:13px;color:var(--muted);margin-bottom:12px'>Fotografe a lista, envie prints do WhatsApp ou cole (Ctrl+V). Eu leio <b>nome, telefone, e-mail e bairro</b> — em lista, em blocos ou em colunas.</p>"
 +"<div style='display:grid;grid-template-columns:1fr 1fr 150px;gap:10px'><div class='form-group'><label class='form-label'>Fonte do lead *</label><select class='form-input' id='sc-fonte'><option value=''>— de onde veio? —</option>"+FONTES.map(function(f){return '<option>'+f+'</option>'}).join('')+"</select><input class='form-input' id='sc-fonte2' placeholder='Detalhe (ex.: stand Barra, evento X)' style='margin-top:6px'/></div>"
 +"<div class='form-group'><label class='form-label'>Bairro da lista</label><input class='form-input' id='sc-bairro' list='sc-bl' placeholder='Detectado automaticamente'/><datalist id='sc-bl'>"+BAIRROS.map(function(b){return '<option>'+b+'</option>'}).join('')+"</datalist></div>"
 +"<div class='form-group'><label class='form-label'>Data da captação</label><input class='form-input' type='date' id='sc-data' value='"+new Date().toISOString().slice(0,10)+"'/></div></div>"
 +"<div style='display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 12px'><label class='btn-submit' style='cursor:pointer'>&#128247; Tirar foto<input type='file' accept='image/*' capture='environment' style='display:none' onchange='scLer(this.files)'/></label><label class='btn-cancel' style='cursor:pointer'>&#128444; Prints / imagens<input type='file' accept='image/*' multiple style='display:none' onchange='scLer(this.files)'/></label><button class='btn-cancel' onclick='scTexto()'>&#128203; Colar texto</button></div>"
 +"<div id='sc-st' style='font-size:13px;margin-bottom:8px'></div><div id='sc-res'></div></div></div>";
 openModal('modal-ocr2')};
window.importarFoto=window.abrirImportFoto;
var SC=[];
function prep(file){return new Promise(function(res){var img=new Image(),u=URL.createObjectURL(file);img.onload=function(){var s=Math.max(1,Math.min(2.4,2000/Math.max(img.width,img.height))),c=document.createElement('canvas');c.width=img.width*s;c.height=img.height*s;var x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);
 var d=x.getImageData(0,0,c.width,c.height),p=d.data,sum=0;for(var i=0;i<p.length;i+=4)sum+=0.3*p[i]+0.59*p[i+1]+0.11*p[i+2];var avg=sum/(p.length/4),dark=avg<110;
 for(var i=0;i<p.length;i+=4){var g=0.3*p[i]+0.59*p[i+1]+0.11*p[i+2];if(dark)g=255-g;g=g>(dark?140:avg*0.82)?255:0;p[i]=p[i+1]=p[i+2]=g}x.putImageData(d,0,0);URL.revokeObjectURL(u);res(c.toDataURL('image/png'))};img.src=u})}
window.scLer=function(files){files=[].slice.call(files||[]);if(!files.length)return;var st=$('sc-st'),txt='',k=0;
 if(typeof Tesseract==='undefined'){st.textContent='Leitor de imagem carregando… tente de novo em 3 segundos.';return}
 (function nx(){if(k>=files.length)return mostrar(txt);st.textContent='Lendo imagem '+(k+1)+' de '+files.length+'…';prep(files[k]).then(function(s){return Tesseract.recognize(s,'por')}).then(function(r){txt+='\n'+(r.data.text||'');k++;nx()}).catch(function(){k++;nx()})})()};
window.scTexto=function(){var t=prompt('Cole aqui o texto da lista (nomes, telefones, e-mails):');if(t)mostrar(t)};
function mostrar(txt){SC=parseContatosOCR(txt);drawSC()}
function syncSC(){SC.forEach(function(c,i){var g=function(k){var e=$('sc-'+k+i);return e?e:null};if(g('n')){c.nome=g('n').value;c.tel=g('t').value;c.email=g('e').value;c.regiao=g('b').value;c.ck=g('c').checked}})}
window.__mostrarScan=mostrar;window.__addScanRows=function(t){syncSC();(t||['']).forEach(function(x){SC.push({nome:x?'Contato':'',tel:x,email:'',regiao:'',dup:false})});drawSC()};
function drawSC(){var st=$('sc-st');if(SC.bairroUnico&&!$('sc-bairro').value)$('sc-bairro').value=SC.bairroUnico;
 var ex={};getLeads().forEach(function(l){var t=tnorm(l.tel).slice(-9);if(t)ex[t]=1;if(l.email)ex[l.email.toLowerCase()]=1});
 SC.forEach(function(c){c.dup=!!(ex[tnorm(c.tel).slice(-9)]||(c.email&&ex[c.email.toLowerCase()]))});
 if(!SC.length){st.textContent='Não identifiquei contatos. Aproxime a câmera, use boa luz ou envie o print.';$('sc-res').innerHTML='';return}
 var d=SC.filter(function(c){return c.dup}).length;
 st.innerHTML='<b>'+SC.length+' contato(s)</b> encontrados'+(SC[0].modo==='colunas'?' (lista em colunas)':'')+(d?' · '+d+' já estão no CRM (desmarcados)':'')+'. Confira e corrija antes de salvar.';
 $('sc-res').innerHTML="<div style='max-height:360px;overflow:auto;border:1px solid var(--border);border-radius:6px'><table style='width:100%;font-size:12px'><thead><tr style='background:#f6f2ea'><th></th><th style='text-align:left;padding:6px'>Nome</th><th style='text-align:left;padding:6px'>Telefone</th><th style='text-align:left;padding:6px'>E-mail</th><th style='text-align:left;padding:6px'>Bairro</th></tr></thead><tbody>"
 +SC.map(function(c,i){return "<tr style='"+(c.dup?"opacity:.5;":"")+(!c.nome||c.nome==='Contato'||!c.tel&&!c.email?"background:#fbeee6":"")+"'><td style='padding:4px'><input type='checkbox' id='sc-c"+i+"' "+(c.ck===false||c.dup&&c.ck!==true?'':'checked')+"/></td><td style='padding:4px'><input id='sc-n"+i+"' value='"+esc(c.nome)+"' style='width:100%;padding:5px'/></td><td style='padding:4px'><input id='sc-t"+i+"' value='"+esc(fmtTel(c.tel))+"' style='width:130px;padding:5px'/></td><td style='padding:4px'><input id='sc-e"+i+"' value='"+esc(c.email)+"' style='width:160px;padding:5px'/></td><td style='padding:4px'><input id='sc-b"+i+"' value='"+esc(c.regiao)+"' placeholder='(bairro da lista)' list='sc-bl' style='width:120px;padding:5px'/></td></tr>"}).join('')
 +"</tbody></table></div><div style='display:flex;gap:10px;align-items:center;margin-top:12px;flex-wrap:wrap'><select class='form-input' id='sc-temp' style='max-width:160px'><option value='frio'>❄ Frio</option><option value='morno'>Morno</option><option value='quente'>🔥 Quente</option></select><button class='btn-cancel' onclick='__addScanRows([\"\"])'>+ Adicionar linha</button><button class='btn-submit' onclick='scSalvar()'>Cadastrar selecionados</button></div>"}
window.scSalvar=function(){var f=$('sc-fonte').value,f2=$('sc-fonte2').value.trim();if(!f){alert('Informe a FONTE do lead (de onde veio). É obrigatório.');$('sc-fonte').focus();return}
 var fonte=f+(f2?' · '+f2:''),bl=$('sc-bairro').value.trim(),dt=$('sc-data').value?new Date($('sc-data').value+'T12:00').toLocaleDateString('pt-BR'):hoje(),tp=$('sc-temp').value,L=getLeads(),n=0;
 SC.forEach(function(c,i){if(!$('sc-c'+i).checked)return;var nome=$('sc-n'+i).value.trim()||'Contato',tel=tnorm($('sc-t'+i).value),em=$('sc-e'+i).value.trim(),b=$('sc-b'+i).value.trim()||bl;if(!tel&&!em)return;
  L.unshift({id:Date.now()+i,nome:nome,tel:fmtTel(tel),email:em,bairro:b,origem:fonte,fonte:fonte,interesse:b?'Bairro: '+b:'A definir',temp:tp,status:'novo',orcamento:'',obs:'Captado por scanner'+(b?' · '+b:''),data:dt,hora:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),tent:0,hist:[{a:'Lead captado (scanner)',d:'Fonte: '+fonte+(b?' · '+b:''),t:agora()}]});n++});
 saveLeads(L);updateBadge();closeModal('modal-ocr2');toast(n+' lead(s) cadastrado(s) · fonte: '+fonte);try{renderDash();renderLeads()}catch(e){}};
document.addEventListener('paste',function(e){var m=$('modal-ocr2');if(!m||!m.classList.contains('open'))return;var it=[].filter.call((e.clipboardData||{}).items||[],function(x){return x.type.indexOf('image')===0});
 if(it.length){scLer(it.map(function(x){return x.getAsFile()}));return}var t=(e.clipboardData||window.clipboardData).getData('text');if(t&&/\d{4}/.test(t)&&e.target.tagName!=='INPUT')mostrar(t)});

/* Ligação e WhatsApp de verdade, registrados */
function reg(id,a,d,patch){var L=getLeads(),l=L.filter(function(x){return x.id==id})[0];if(!l)return;(l.hist=l.hist||[]).unshift({a:a,d:d||'',t:agora()});l.ult=Date.now();if(patch)for(var k in patch)l[k]=patch[k];saveLeads(L);
 try{var c=JSON.parse(localStorage.crm_dia||'{}'),h=hoje();if(c.d!==h)c={d:h,lig:0,wa:0,ok:0};if(/Liga/.test(a))c.lig++;if(/WhatsApp/.test(a))c.wa++;if(/Atendeu/.test(a))c.ok++;localStorage.crm_dia=JSON.stringify(c)}catch(e){}}
window.ligar=function(id){var l=getLeads().filter(function(x){return x.id==id})[0];if(!l)return;var t=tnorm(l.tel);if(!t){toast('Lead sem telefone');return}
 reg(id,'Ligação realizada','',{tent:(l.tent||0)+1});location.href='tel:+55'+t;setTimeout(function(){if($('page-discador')&&$('page-discador').classList.contains('active'))return;posLig(id)},1200)};
window.zap=function(id,msg){var l=getLeads().filter(function(x){return x.id==id})[0];if(!l)return;var t=tnorm(l.tel);if(!t){toast('Lead sem telefone');return}
 msg=msg||('Olá '+String(l.nome).split(' ')[0]+', tudo bem? Aqui é o Paulo Cotrim, corretor no Rio. '+(l.bairro?'Vi seu interesse em imóveis em '+l.bairro+'. ':'')+'Posso te ajudar a encontrar a melhor opção?');
 reg(id,'WhatsApp enviado',msg.slice(0,60));window.open('https://wa.me/55'+t+'?text='+encodeURIComponent(msg),'_blank')};
function posLig(id){var l=getLeads().filter(function(x){return x.id==id})[0];if(!l)return;var m=$('modal-pos');if(!m){m=document.createElement('div');m.id='modal-pos';m.className='modal-bg';document.body.appendChild(m)}
 m.innerHTML="<div class='modal' style='max-width:420px'><div class='modal-head'><div class='modal-title'>Como foi a ligação?</div><button class='modal-x' onclick=\"closeModal('modal-pos')\">&times;</button></div><div class='modal-body'><b>"+esc(l.nome)+"</b> · "+esc(l.tel)+"<div style='display:grid;gap:8px;margin-top:14px'>"
 +[['int','✅ Atendeu — interessado'],['sem','Atendeu — sem interesse agora'],['nao','✗ Não atendeu'],['ret','📅 Pediu retorno'],['err','Número errado']].map(function(o){return "<button class='btn-cancel' style='text-align:left' onclick=\"resLig("+id+",'"+o[0]+"')\">"+o[1]+"</button>"}).join('')+"</div></div></div>";openModal('modal-pos')}
window.posLig=posLig;
window.resLig=function(id,r){var l=getLeads().filter(function(x){return x.id==id})[0]||{},d=new Date(),dias=r==='nao'?((l.tent||1)>=3?7:(l.tent||1)>=2?3:1):r==='sem'?30:r==='ret'?0:r==='int'?1:null;
 if(r==='ret'){var q=prompt('Retornar em qual data? (dd/mm)','');if(q){var p=q.split('/');d=new Date(d.getFullYear(),(+p[1]||d.getMonth()+1)-1,+p[0]||d.getDate()+1)}else d.setDate(d.getDate()+1)}else if(dias!=null)d.setDate(d.getDate()+dias);
 var patch={retorno:r==='err'?null:d.toISOString().slice(0,10)};if(r==='int'){patch.temp='quente';patch.status='contato'}if(r==='sem'){patch.temp='frio'}if(r==='err'){patch.status='perdido';patch.obs=(l.obs||'')+' · número errado'}
 reg(id,{int:'Atendeu — interessado',sem:'Atendeu — sem interesse',nao:'Não atendeu (tentativa '+(l.tent||1)+')',ret:'Pediu retorno',err:'Número errado'}[r],patch.retorno?'Retorno: '+patch.retorno.split('-').reverse().join('/'):'',patch);
 closeModal('modal-pos');toast('Registrado'+(patch.retorno?' · retorno '+patch.retorno.split('-').reverse().slice(0,2).join('/'):''));if(window.__fila)discProx(1)};

/* Discador inteligente: bairro + temperatura + status + retornos de hoje, ordenado por prioridade */
function prio(l){var s=(l.temp==='quente'?40:l.temp==='morno'?22:8)+(({proposta:20,visita:18,contato:10,novo:12})[l.status||'novo']||0);var h=new Date().toISOString().slice(0,10);if(l.retorno&&l.retorno<=h)s+=30;if(!l.tent)s+=10;s-=(l.tent||0)*4;return s}
function renderDisc(){var pg=$('page-discador');if(!pg)return;var L=getLeads(),bs={};L.forEach(function(l){var b=l.bairro||(l.interesse||'').replace(/^Bairro:\s*/,'');if(l.bairro)bs[l.bairro]=(bs[l.bairro]||0)+1});
 var c={};try{c=JSON.parse(localStorage.crm_dia||'{}')}catch(e){}if(c.d!==hoje())c={lig:0,wa:0,ok:0};
 pg.innerHTML="<div style='margin-bottom:18px'><div class='eyebrow'>Discador</div><div style='font-size:24px;color:var(--navy3)' class='page-title'>Ligações do dia</div></div>"
 +"<div class='kpi-row'><div class='kpi gold'><div class='kpi-label'>Ligações hoje</div><div class='kpi-val'>"+c.lig+"<small style='font-size:14px'> / 30</small></div></div><div class='kpi green'><div class='kpi-label'>Atenderam</div><div class='kpi-val'>"+c.ok+"</div></div><div class='kpi blue'><div class='kpi-label'>WhatsApps</div><div class='kpi-val'>"+c.wa+"</div></div><div class='kpi red'><div class='kpi-label'>Retornos p/ hoje</div><div class='kpi-val'>"+L.filter(function(l){return l.retorno&&l.retorno<=new Date().toISOString().slice(0,10)&&l.status!=='perdido'&&l.status!=='fechado'}).length+"</div></div></div>"
 +"<div class='card'><div class='card-body'><div style='display:grid;grid-template-columns:repeat(4,1fr);gap:10px'>"
 +"<select class='form-input' id='dc-b'><option value=''>Todos os bairros</option>"+Object.keys(bs).sort().map(function(b){return '<option>'+esc(b)+' ('+bs[b]+')</option>'}).join('')+"</select>"
 +"<select class='form-input' id='dc-t'><option value=''>Todas as temperaturas</option><option value='quente'>🔥 Quentes</option><option value='morno'>Mornos</option><option value='frio'>❄ Frios</option></select>"
 +"<select class='form-input' id='dc-s'><option value=''>Todas as etapas</option><option value='novo'>Novos (nunca contatados)</option><option value='ret'>Retornos de hoje</option><option value='contato'>Em contato</option><option value='proposta'>Proposta</option><option value='visita'>Visita</option></select>"
 +"<button class='btn-submit' onclick='discIniciar()'>▶ Montar fila</button></div><div id='dc-fila' style='margin-top:16px'></div></div></div>"}
window.discIniciar=function(){var b=($('dc-b').value||'').replace(/\s\(\d+\)$/,''),t=$('dc-t').value,s=$('dc-s').value,h=new Date().toISOString().slice(0,10);
 window.__fila=getLeads().filter(function(l){if(l.status==='perdido'||l.status==='fechado')return false;if(!tnorm(l.tel))return false;if(b&&l.bairro!==b)return false;if(t&&l.temp!==t)return false;if(s==='ret')return l.retorno&&l.retorno<=h;if(s&&l.status!==s)return false;if(l.retorno&&l.retorno>h&&s!=='ret')return false;return true}).sort(function(a,b){return prio(b)-prio(a)});
 window.__fi=0;discProx(0)};
window.discProx=function(step){var F=window.__fila||[];window.__fi=(window.__fi||0)+(step||0);var l=F[window.__fi],el=$('dc-fila');if(!el)return;
 if(!l){el.innerHTML="<div class='empty-state'><p>Fila concluída ("+F.length+" leads). Excelente trabalho.</p></div>";return}
 var u=(l.hist||[])[0];
 el.innerHTML="<div style='display:flex;justify-content:space-between;font-size:12px;color:var(--muted)'><span>Lead "+(window.__fi+1)+" de "+F.length+"</span><span>Prioridade "+prio(l)+"</span></div>"
 +"<div style='border:1px solid var(--border);border-radius:8px;padding:18px;margin-top:8px;background:#fff'><div style='font-size:22px' class='page-title'>"+esc(l.nome)+"</div><div style='font-size:15px;margin:4px 0'>"+esc(l.tel)+(l.email?' · '+esc(l.email):'')+"</div>"
 +"<div style='font-size:12.5px;color:var(--muted)'>"+[l.bairro,l.temp,l.status,l.fonte||l.origem,'entrada '+(l.data||'')].filter(Boolean).map(esc).join(' · ')+(l.tent?' · '+l.tent+' tentativa(s)':'')+"</div>"
 +(u?"<div style='font-size:12px;margin-top:8px'>Último: "+esc(u.a)+" — "+esc(u.t)+"</div>":"")
 +"<div style='background:#f6f2ea;border-radius:6px;padding:10px;margin-top:10px;font-size:12.5px'><b>Roteiro:</b> "+esc(roteiro(l))+"</div>"
 +"<div style='display:flex;gap:8px;flex-wrap:wrap;margin-top:14px'><button class='btn-submit' onclick='ligar("+l.id+");setTimeout(function(){posLig("+l.id+")},900)'>📞 Ligar</button><button class='btn-cancel' onclick='zap("+l.id+")'>💬 WhatsApp</button><button class='btn-cancel' onclick='posLig("+l.id+")'>Registrar resultado</button><button class='btn-cancel' onclick='discProx(1)'>Pular ›</button><button class='btn-cancel' onclick='verPerfil("+l.id+")'>Ficha</button></div></div>"};
function roteiro(l){var n=String(l.nome).split(' ')[0];if(l.status==='novo')return 'Oi '+n+', aqui é o Paulo Cotrim, corretor. Você demonstrou interesse'+(l.bairro?' em '+l.bairro:'')+'. Pra eu te mandar só o que faz sentido: é pra morar ou investir? Qual faixa de valor e quantos quartos?';
 if(l.retorno)return 'Retomar o combinado com '+n+'. Pergunte se conseguiu ver o material e proponha videochamada de 15 min.';
 if(l.status==='proposta')return 'Conduza para a decisão: confirme condição, prazo da tabela e próximos documentos.';return 'Traga uma novidade (unidade, condição ou estudo de rentabilidade) e marque o próximo passo.'}

/* Rotina do dia (coach) no topo do "Hoje" */
function coach(){var pg=$('page-hoje');if(!pg||$('coach'))return;var L=getLeads(),h=new Date().toISOString().slice(0,10);
 var novos=L.filter(function(l){return l.status==='novo'&&!(l.tent>0)}).length,ret=L.filter(function(l){return l.retorno&&l.retorno<=h&&l.status!=='perdido'}).length,q=L.filter(function(l){return l.temp==='quente'&&l.status!=='fechado'}).length;
 var box=document.createElement('div');box.id='coach';box.style.cssText='border:1px solid var(--border);background:#fff;border-radius:8px;padding:18px;margin-bottom:16px';
 box.innerHTML="<div class='eyebrow'>Rotina do dia</div><div style='display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px'>"
 +[['1. Quentes primeiro','🔥 '+q+' quentes · ligue antes das 11h','quente',''],['2. Retornos combinados','📅 '+ret+' retornos para hoje','','ret'],['3. Novos sem contato','⚡ '+novos+' novos · responda em até 5 min','','novo']].map(function(b){return "<button class='btn-cancel' style='text-align:left;padding:14px' onclick=\"goPage('discador');setTimeout(function(){document.getElementById('dc-t').value='"+b[2]+"';document.getElementById('dc-s').value='"+b[3]+"';discIniciar()},80)\"><b>"+b[0]+"</b><br><small>"+b[1]+"</small></button>"}).join('')
 +"</div><div style='font-size:12.5px;color:var(--muted);margin-top:10px'>Meta: 30 ligações, 10 conversas, 2 visitas/videochamadas. Regra de ouro: todo contato termina com o próximo passo marcado.</div><div style='margin-top:10px;display:flex;gap:8px;flex-wrap:wrap'><button class='btn-submit' onclick='abrirImportFoto()'>📷 Scanner de leads</button></div>";
 pg.insertBefore(box,pg.children[1]||null)}

/* Enviar material do site ao cliente (a partir do imóvel) */
window.enviarMaterial=function(imId){var i=getImoveis().filter(function(x){return x.id==imId})[0];if(!i)return;var L=getLeads().filter(function(l){return tnorm(l.tel)});
 var q=prompt('Enviar '+i.nome+' para qual lead? Digite parte do nome ou telefone:');if(!q)return;q=semAc(q);var l=L.filter(function(x){return semAc(x.nome+' '+x.tel).indexOf(q)>=0})[0];if(!l){toast('Lead não encontrado');return}
 var base='https://www.paulocotrim.com/',pag=i.url?base+i.url:base+'#portfolio',est=base+'estudo.html?emp='+encodeURIComponent(i.url||String(i.nome).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-'));
 zap(l.id,'Olá '+String(l.nome).split(' ')[0]+'! Separei o '+i.nome+' pra você:\n• Apresentação: '+pag+'\n• Estudo de rentabilidade: '+est+'\n'+(i.preco?'• '+i.preco+'\n':'')+'Quer que eu agende uma videochamada de 15 min pra te mostrar?');
 var LL=getLeads(),x=LL.filter(function(y){return y.id==l.id})[0];x.interesse=i.nome;saveLeads(LL)};
var _ri=window.renderImoveis;window.renderImoveis=function(){_ri();var g=$('imovel-grid');if(!g)return;var ims=getImoveis();
 [].forEach.call(g.querySelectorAll('.icard'),function(c,n){var b=c.querySelector('.btn-icard.outline:not(.pe)');if(b&&ims[n]){b.setAttribute('onclick','enviarMaterial('+ims[n].id+')');b.innerHTML='💬 Enviar ao cliente'}})};

/* Hooks de navegação + bairro no editar lead */
var _gp=window.goPage;window.goPage=function(p){_gp.apply(this,arguments);if(p==='discador')renderDisc();if(p==='hoje')setTimeout(coach,50)};
var _el=window.editarLead;if(_el)window.editarLead=function(id){_el(id);var o=$('el-int');if(o&&!$('el-bairro')){var l=getLeads().filter(function(x){return x.id==id})[0]||{};o.closest('.form-group').insertAdjacentHTML('afterend',"<div class='form-group'><label class='form-label'>Bairro</label><input class='form-input' id='el-bairro' list='sc-bl' value='"+esc(l.bairro||'')+"'/></div><div class='form-group'><label class='form-label'>Fonte</label><input class='form-input' id='el-fonte' value='"+esc(l.fonte||l.origem||'')+"'/></div>");
  var ok=$('modal-el-ok'),f=ok.onclick;ok.onclick=function(){var L=getLeads(),x=L.filter(function(y){return y.id==id})[0];if(x){x.bairro=$('el-bairro').value;x.fonte=x.origem=$('el-fonte').value;saveLeads(L)}f()}}};
/* Cadastro manual: bairro e fonte obrigatória */
var _sl=window.salvarLead;window.salvarLead=function(modal){var o=$('fl-origem');if(o&&!o.value){alert('Informe a fonte do lead');return}var tel=$('fl-tel')&&$('fl-tel').value;var dup=getLeads().filter(function(l){return tel&&tnorm(l.tel).slice(-9)===tnorm(tel).slice(-9)})[0];
 if(dup&&!confirm(dup.nome+' já está no CRM com esse telefone. Cadastrar mesmo assim?'))return;var b=$('fl-bairro')?$('fl-bairro').value:'';_sl(modal);if(b){var L=getLeads();L[0].bairro=b;saveLeads(L)}};
var _rf=window.renderFormLead;window.renderFormLead=function(t,m){_rf(t,m);var o=$('fl-obs');if(o&&!$('fl-bairro'))o.closest('.form-group').insertAdjacentHTML('beforebegin',"<div class='form-group'><label class='form-label'>Bairro</label><input class='form-input' id='fl-bairro' list='sc-bl'/></div>")};
document.addEventListener('DOMContentLoaded',function(){});
setInterval(function(){var p=$('page-hoje');if(p&&p.classList.contains('active')&&!$('coach'))coach()},800);setTimeout(function(){coach();if(!$('sc-bl')){var d=document.createElement('datalist');d.id='sc-bl';d.innerHTML=BAIRROS.map(function(b){return '<option>'+b+'</option>'}).join('');document.body.appendChild(d)}},300);
})();

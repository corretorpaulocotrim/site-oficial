/* CRM Plus: editar/adicionar empreendimentos e leads, foto/print (vários de uma vez, colar Ctrl+V), listas grandes */
(function(){
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function modal(id,title,body,btn,fn){var m=$(id);if(!m){m=document.createElement('div');m.id=id;m.className='modal-bg';document.body.appendChild(m)}
 m.innerHTML="<div class='modal' style='max-width:640px'><div class='modal-head'><div class='modal-title'>"+title+"</div><button class='modal-x' onclick=\"closeModal('"+id+"')\">&times;</button></div><div class='modal-body'>"+body+"<div class='form-actions' style='margin-top:14px'><button class='btn-cancel' onclick=\"closeModal('"+id+"')\">Cancelar</button><button class='btn-submit' id='"+id+"-ok'>"+btn+"</button></div></div></div>";
 $(id+'-ok').onclick=fn;openModal(id)}
function fld(id,l,v,t){return "<div class='form-group'><label class='form-label'>"+l+"</label>"+(t==='ta'?"<textarea class='form-input' id='"+id+"' rows='2'>"+esc(v)+"</textarea>":"<input class='form-input' id='"+id+"' value='"+esc(v)+"'/>")+"</div>"}
function sel(id,l,v,opts){return "<div class='form-group'><label class='form-label'>"+l+"</label><select class='form-input' id='"+id+"'>"+opts.map(function(o){return "<option"+(o===v?" selected":"")+">"+o+"</option>"}).join('')+"</select></div>"}
function compress(file,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.72))};im.src=r.result};r.readAsDataURL(file)}

/* ---------- EMPREENDIMENTOS: editar / adicionar / excluir / foto ---------- */
window.editarImovel=function(id){var ims=getImoveis(),i=ims.filter(function(x){return x.id==id})[0]||{};var novo=!i.id;
 var b=fld('ei-nome','Nome',i.nome)+fld('ei-const','Construtora',i.construtora||(i.tags||[])[0])+fld('ei-loc','Endereço / bairro',i.loc)
 +sel('ei-reg','Região',i.regiao||'',['','Zona Sul','Barra e Zona Oeste','Centro e Porto','Grande Tijuca','Zona Norte','Baixada e Grande Rio','Niterói'])
 +sel('ei-st','Status',i.status||'Lançamento',['Lançamento','Em obras','Pronto','Breve lançamento'])
 +fld('ei-preco','Preço a partir de (R$)',i.preco)+fld('ei-roi','Plantas / metragens',i.roi)+fld('ei-renda','Renda mínima (R$)',i.rendaMin)
 +fld('ei-url','Link da página (opcional)',i.url)
 +"<div class='form-group'><label class='form-label'>Foto (tirar foto ou escolher)</label><input type='file' accept='image/*' id='ei-foto'/><div id='ei-prev' style='margin-top:8px;height:120px;border-radius:6px;background:#eee center/cover;"+(i.img?"background-image:url(\""+esc(i.img)+"\")":"")+"'></div></div>";
 var foto=i.img||'';
 modal('modal-ei',novo?'Novo empreendimento':'Editar empreendimento',b+(novo?'':"<button class='btn-cancel' style='color:#b42318;margin-top:6px' id='ei-del'>Excluir empreendimento</button>"),'Salvar',function(){
  var nome=$('ei-nome').value.trim();if(!nome){toast('Nome obrigatório');return}
  var st=$('ei-st').value,p=$('ei-preco').value.trim();if(/^\d[\d.]*$/.test(p))p='A partir de R$ '+p;
  var o={id:i.id||Date.now(),nome:nome,construtora:$('ei-const').value,tags:[$('ei-const').value].filter(Boolean),loc:$('ei-loc').value,regiao:$('ei-reg').value,status:st,badge:/obra/i.test(st)?'ib-obras':/pront/i.test(st)?'ib-pronto':'ib-lanc',preco:p||'Preço a consultar',roi:$('ei-roi').value,rendaMin:parseFloat(($('ei-renda').value||'').replace(/\D/g,''))||null,url:$('ei-url').value,img:foto,icon:i.icon||'&#127970;',end:i.end||$('ei-loc').value};
  var L=getImoveis();var k=L.findIndex(function(x){return x.id==o.id});if(k>=0)L[k]=o;else L.unshift(o);
  try{saveImoveis(L)}catch(e){toast('Foto grande demais para salvar. Use uma menor.');return}
  closeModal('modal-ei');toast(novo?'Empreendimento cadastrado!':'Empreendimento atualizado!');renderImoveis()});
 $('ei-foto').onchange=function(){var f=this.files[0];if(f)compress(f,function(d){foto=d;$('ei-prev').style.backgroundImage='url('+d+')'})};
 var del=$('ei-del');if(del)del.onclick=function(){if(!confirm('Excluir '+i.nome+'?'))return;saveImoveis(getImoveis().filter(function(x){return x.id!=i.id}));closeModal('modal-ei');toast('Excluído');renderImoveis()};
};
var _ri=window.renderImoveis;
window.renderImoveis=function(){_ri();var g=$('imovel-grid');if(!g)return;var ims=getImoveis();
 [].forEach.call(g.querySelectorAll('.icard'),function(c,n){var f=c.querySelector('.icard-foot');if(f&&ims[n]&&!f.querySelector('.pe'))f.insertAdjacentHTML('beforeend',"<button class='btn-icard outline pe' onclick='editarImovel("+ims[n].id+")'>&#9998; Editar</button>")});
 if(!$('ei-top')){g.insertAdjacentHTML('beforebegin',"<div id='ei-top' style='display:flex;gap:10px;margin:0 0 14px;flex-wrap:wrap'><input class='form-input' id='ei-busca' placeholder='Buscar empreendimento…' style='max-width:320px'/><button class='btn-submit' onclick='editarImovel(0)'>+ Novo empreendimento</button></div>");
  $('ei-busca').oninput=function(){var q=this.value.toLowerCase();[].forEach.call(g.querySelectorAll('.icard'),function(c){c.style.display=c.innerText.toLowerCase().indexOf(q)>=0?'':'none'})}}};
window.salvarImovel=function(){editarImovel(0)}; // botão antigo de cadastro abre o novo formulário completo

/* ---------- LEADS: editar com renda/FGTS + recomendação ---------- */
window.editarLead=function(id){var L=getLeads(),l=L.filter(function(x){return x.id==id})[0];if(!l)return;
 var b=fld('el-nome','Nome',l.nome)+fld('el-tel','WhatsApp',l.tel)+fld('el-email','E-mail',l.email)
 +sel('el-temp','Temperatura',l.temp||'frio',['frio','morno','quente'])+sel('el-status','Etapa',l.status||'novo',['novo','contato','proposta','visita','fechado','perdido'])
 +fld('el-int','Interesse',l.interesse)+fld('el-renda','Renda familiar (R$)',l.renda)+fld('el-fgts','FGTS (R$)',l.fgts)+fld('el-orc','Orçamento',l.orcamento)+fld('el-obs','Observações',l.obs,'ta');
 modal('modal-el','Editar lead',b,'Salvar',function(){
  var n=function(x){return parseFloat(String($(x).value).replace(/\D/g,''))||''};
  l.nome=$('el-nome').value;l.tel=$('el-tel').value;l.email=$('el-email').value;l.temp=$('el-temp').value;
  if(l.status!==$('el-status').value)(l.hist=l.hist||[]).push({a:'Etapa: '+$('el-status').value,d:'edição',t:new Date().toLocaleString('pt-BR')});
  l.status=$('el-status').value;l.interesse=$('el-int').value;l.renda=n('el-renda');l.fgts=n('el-fgts');l.orcamento=$('el-orc').value;l.obs=$('el-obs').value;
  saveLeads(L);closeModal('modal-el');toast('Lead atualizado');try{renderLeads();renderPipeline();renderDash()}catch(e){}try{verPerfil(l.id)}catch(e){}});
};
var _vp=window.verPerfil;
window.verPerfil=function(id){_vp(id);var mb=$('modal-profile-body');if(!mb)return;var l=getLeads().filter(function(x){return x.id==id})[0]||{};
 var r=parseFloat(l.renda)||0,h="<div style='margin-top:14px;display:flex;gap:8px;flex-wrap:wrap'><button class='btn-submit' onclick='closeModal(\"modal-profile\");editarLead("+id+")'>&#9998; Editar lead</button><button class='btn-cancel' onclick='if(confirm(\"Excluir lead?\")){saveLeads(getLeads().filter(function(x){return x.id!="+id+"}));closeModal(\"modal-profile\");renderLeads();updateBadge()}'>Excluir</button></div>";
 if(r){var ok=getImoveis().filter(function(i){return i.rendaMin&&i.rendaMin<=r}).sort(function(a,b){return b.rendaMin-a.rendaMin}).slice(0,3);
  h+="<div style='margin-top:14px;font-size:12px;color:var(--muted)'>CABEM NA RENDA DE R$ "+r.toLocaleString('pt-BR')+"</div>"+(ok.length?ok.map(function(i){return "<div style='padding:8px 0;border-bottom:1px solid var(--border)'><b>"+esc(i.nome)+"</b> · "+esc(i.preco)+"<br><small>"+esc(i.loc||'')+"</small></div>"}).join(''):"<div style='font-size:13px'>Nenhum empreendimento com renda mínima cadastrada abaixo dessa renda.</div>")}
 else h+="<div style='margin-top:10px;font-size:12px;color:var(--muted)'>Informe a renda em “Editar lead” para ver os imóveis que cabem no bolso.</div>";
 mb.insertAdjacentHTML('beforeend',h)};

/* ---------- FOTO / PRINT: vários arquivos, colar print, listas grandes ---------- */
var _ab=window.abrirImportFoto;
window.abrirImportFoto=function(){_ab();var inp=$('ocr-file');if(inp&&!inp.multiple){inp.multiple=true;inp.removeAttribute('capture');
 inp.insertAdjacentHTML('afterend',"<div style='display:flex;gap:8px;flex-wrap:wrap;margin:-4px 0 10px'><label class='btn-cancel' style='cursor:pointer'>&#128247; Tirar foto<input type='file' accept='image/*' capture='environment' style='display:none' onchange='rodarOCR(this)'/></label><span style='font-size:12px;color:var(--muted);align-self:center'>Pode escolher vários prints de uma vez ou colar um print com Ctrl+V.</span></div>")}};
window.rodarOCR=function(input){var fs=[].slice.call(input.files||[]);if(!fs.length)return;
 var st=$('ocr-status'),all=[],k=0,tels={};getLeads().forEach(function(l){var t=String(l.tel||'').replace(/\D/g,'').slice(-9);if(t)tels[t]=1});
 function next(){if(k>=fs.length)return done();st.textContent='Lendo imagem '+(k+1)+' de '+fs.length+'…';
  _preprocess(fs[k]).then(function(s){return Tesseract.recognize(s,'por')}).then(function(r){all=all.concat(parseContatosOCR(r.data.text||''));k++;next()}).catch(function(){k++;next()})}
 function done(){var seen={};_ocrParsed=all.filter(function(c){var t=String(c.tel||'').slice(-9),key=t||c.email||c.nome;if(seen[key])return false;seen[key]=1;c.dup=t&&tels[t];return true});
  if(!_ocrParsed.length){st.textContent='Não identifiquei contatos. Tente uma imagem mais nítida.';return}
  var d=_ocrParsed.filter(function(c){return c.dup}).length;
  st.textContent='Encontrei '+_ocrParsed.length+' contato(s)'+(d?' · '+d+' já estão no CRM (desmarcados)':'')+'.';
  $('ocr-result').innerHTML="<div style='max-height:340px;overflow:auto;border:1px solid var(--border);border-radius:6px'><table style='width:100%;font-size:12px'><thead><tr><th></th><th style='text-align:left;padding:6px'>Nome</th><th style='text-align:left;padding:6px'>Telefone</th><th style='text-align:left;padding:6px'>Região</th></tr></thead><tbody>"+_ocrParsed.map(function(c,i){return "<tr><td style='padding:4px'><input type='checkbox' id='oc-c"+i+"' "+(c.dup?'':'checked')+"/></td><td style='padding:4px'><input id='oc-n"+i+"' value='"+esc(c.nome)+"' style='width:100%;padding:5px'/></td><td style='padding:4px'><input id='oc-t"+i+"' value='"+esc(c.tel)+"' style='width:120px;padding:5px'/></td><td style='padding:4px'><input id='oc-r"+i+"' value='"+esc(c.regiao)+"' style='width:110px;padding:5px'/><input type='hidden' id='oc-e"+i+"' value='"+esc(c.email)+"'/></td></tr>"}).join('')+"</tbody></table></div><button class='btn-submit' style='margin-top:12px' onclick='salvarOCR()'>Cadastrar selecionados</button>"}
 next()};
window.salvarOCR=function(){var L=getLeads(),n=0,now=new Date();
 _ocrParsed.forEach(function(c,i){var cb=$('oc-c'+i);if(cb&&!cb.checked)return;
  var nome=($('oc-n'+i)||{}).value||c.nome,tel=($('oc-t'+i)||{}).value||c.tel,reg=($('oc-r'+i)||{}).value||'';if(!nome&&!tel)return;
  L.unshift({id:Date.now()+i,nome:nome||'Contato',tel:tel,email:c.email||'',origem:'Foto/Documento',interesse:reg?'Região: '+reg:'A definir',temp:'frio',status:'novo',orcamento:'',obs:'Importado de foto/print'+(reg?' · '+reg:''),data:now.toLocaleDateString('pt-BR'),hora:now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),hist:[{a:'Lead importado de foto/print',d:'OCR',t:now.toLocaleString('pt-BR')}]});n++});
 saveLeads(L);updateBadge();closeModal('modal-ocr');toast(n+' lead(s) cadastrado(s)!');try{renderDash()}catch(e){}};
document.addEventListener('paste',function(e){var m=$('modal-ocr');if(!m||!m.classList.contains('open'))return;
 var it=[].filter.call((e.clipboardData||{}).items||[],function(x){return x.type.indexOf('image')===0});if(!it.length)return;
 var files=it.map(function(x){return x.getAsFile()});rodarOCR({files:files})});

/* ---------- listas grandes: paginação dos leads ---------- */
var _rl=window.renderLeads;
window.renderLeads=function(){_rl.apply(this,arguments);var tb=document.querySelector('#page-leads tbody');if(!tb)return;var rows=[].slice.call(tb.rows);if(rows.length<=50)return;
 var pg=window.__lp||1,per=50,max=Math.ceil(rows.length/per);if(pg>max)pg=max;rows.forEach(function(r,i){r.style.display=(i>=(pg-1)*per&&i<pg*per)?'':'none'});
 var nav=$('lp-nav');if(!nav){nav=document.createElement('div');nav.id='lp-nav';nav.style.cssText='display:flex;gap:8px;align-items:center;justify-content:flex-end;margin:12px 0';tb.closest('table').after(nav)}
 nav.innerHTML="<button class='btn-cancel' onclick='__lp="+Math.max(1,pg-1)+";renderLeads()'>&#8249;</button><span style='font-size:12px'>Página "+pg+" de "+max+" · "+rows.length+" leads</span><button class='btn-cancel' onclick='__lp="+Math.min(max,pg+1)+";renderLeads()'>&#8250;</button>"};
})();

/* Scanner PRO (estilo CamScanner): recorte por 4 cantos com correção de perspectiva, várias leituras OCR, nada fica de fora */
(function(){
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var Q=[],QI=0,TXT='',RAW=[];
/* ---------- 1. recorte com 4 cantos ---------- */
function abrirRecorte(file){return new Promise(function(done){var u=URL.createObjectURL(file),img=new Image();img.onload=function(){
 var m=$('scan-crop');if(!m){m=document.createElement('div');m.id='scan-crop';document.body.appendChild(m)}
 m.setAttribute('style','position:fixed;inset:0;z-index:200;background:#0f0e0c;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;font-family:Inter,sans-serif;color:#fff');
 var maxW=Math.min(innerWidth-24,900),maxH=innerHeight-150,s=Math.min(maxW/img.width,maxH/img.height),W=Math.round(img.width*s),H=Math.round(img.height*s);
 m.innerHTML="<div style='font-size:13px;margin-bottom:8px;text-align:center'>Arraste os 4 cantos dourados até as bordas da lista · "+(QI+1)+" de "+Q.length+"</div><div id='sc-wrap' style='position:relative;width:"+W+"px;height:"+H+"px;touch-action:none'><canvas id='sc-cv' width='"+W+"' height='"+H+"' style='position:absolute;inset:0'></canvas></div>"
 +"<div style='display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;justify-content:center'><button id='sc-rot' style='padding:11px 14px;border:1px solid #555;background:none;color:#fff;border-radius:3px'>↻ Girar</button><button id='sc-all' style='padding:11px 14px;border:1px solid #555;background:none;color:#fff;border-radius:3px'>Imagem inteira</button><button id='sc-ok' style='padding:11px 18px;border:none;background:#b0895b;color:#1a1a19;border-radius:3px;font-weight:600'>Usar recorte</button><button id='sc-skip' style='padding:11px 14px;border:none;background:none;color:#aaa'>Pular imagem</button></div>";
 var cv=$('sc-cv'),cx=cv.getContext('2d'),rot=0,src=img;
 var P=[[.04,.04],[.96,.04],[.96,.96],[.04,.96]].map(function(p){return[p[0]*W,p[1]*H]});
 function draw(){cx.clearRect(0,0,W,H);cx.drawImage(src,0,0,W,H);cx.fillStyle='rgba(0,0,0,.45)';cx.beginPath();cx.rect(0,0,W,H);cx.moveTo(P[0][0],P[0][1]);for(var i=3;i>=0;i--)cx.lineTo(P[i][0],P[i][1]);cx.closePath();cx.fill('evenodd');
  cx.strokeStyle='#b0895b';cx.lineWidth=2;cx.beginPath();P.forEach(function(p,i){i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])});cx.closePath();cx.stroke();
  P.forEach(function(p){cx.beginPath();cx.arc(p[0],p[1],13,0,7);cx.fillStyle='#b0895b';cx.fill();cx.strokeStyle='#fff';cx.stroke()})}
 var drag=-1;function pos(e){var r=cv.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return[t.clientX-r.left,t.clientY-r.top]}
 function down(e){var p=pos(e),b=1e9;P.forEach(function(q,i){var d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<b&&d<45){b=d;drag=i}});if(drag>=0)e.preventDefault()}
 function move(e){if(drag<0)return;e.preventDefault();var p=pos(e);P[drag]=[Math.max(0,Math.min(W,p[0])),Math.max(0,Math.min(H,p[1]))];draw()}
 function up(){drag=-1}
 cv.addEventListener('mousedown',down);cv.addEventListener('touchstart',down,{passive:false});addEventListener('mousemove',move);cv.addEventListener('touchmove',move,{passive:false});addEventListener('mouseup',up);cv.addEventListener('touchend',up);
 $('sc-rot').onclick=function(){var c=document.createElement('canvas');c.width=src.height;c.height=src.width;var x=c.getContext('2d');x.translate(c.width,0);x.rotate(Math.PI/2);x.drawImage(src,0,0);var n=new Image();n.onload=function(){src=n;URL.revokeObjectURL(u);img=n;m.remove();abrirRecortesrc(n).then(done)};n.src=c.toDataURL('image/jpeg',.95)};
 $('sc-all').onclick=function(){P=[[0,0],[W,0],[W,H],[0,H]];draw()};
 $('sc-skip').onclick=function(){m.remove();done(null)};
 $('sc-ok').onclick=function(){var k=src.width/W,q=P.map(function(p){return[p[0]*k,p[1]*k]});$('sc-ok').textContent='Ajustando…';setTimeout(function(){var out=warp(src,q);m.remove();done(out)},30)};
 draw()};img.src=u})}
function abrirRecortesrc(img){var c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);return new Promise(function(r){c.toBlob(function(b){abrirRecorte(b).then(r)},'image/jpeg',.95)})}
/* correção de perspectiva (homografia) */
function warp(img,q){var dw=Math.round(Math.max(Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1]),Math.hypot(q[2][0]-q[3][0],q[2][1]-q[3][1]))),dh=Math.round(Math.max(Math.hypot(q[3][0]-q[0][0],q[3][1]-q[0][1]),Math.hypot(q[2][0]-q[1][0],q[2][1]-q[1][1])));
 var sc=Math.min(1,2600/Math.max(dw,dh));sc=Math.max(sc,Math.min(2,1800/Math.max(dw,dh)));dw=Math.round(dw*sc);dh=Math.round(dh*sc);
 var H=homog([[0,0],[dw,0],[dw,dh],[0,dh]],q),s=document.createElement('canvas');s.width=img.width;s.height=img.height;var sx=s.getContext('2d');sx.drawImage(img,0,0);var sd=sx.getImageData(0,0,s.width,s.height).data;
 var o=document.createElement('canvas');o.width=dw;o.height=dh;var ox=o.getContext('2d'),od=ox.createImageData(dw,dh),D=od.data,SW=s.width,SH=s.height;
 for(var y=0;y<dh;y++)for(var x=0;x<dw;x++){var z=H[6]*x+H[7]*y+1,u=(H[0]*x+H[1]*y+H[2])/z,v=(H[3]*x+H[4]*y+H[5])/z,ui=u|0,vi=v|0,j=(y*dw+x)*4;if(ui<0||vi<0||ui>=SW||vi>=SH){D[j]=D[j+1]=D[j+2]=255;D[j+3]=255;continue}var i=(vi*SW+ui)*4;D[j]=sd[i];D[j+1]=sd[i+1];D[j+2]=sd[i+2];D[j+3]=255}
 ox.putImageData(od,0,0);return o}
function homog(a,b){var A=[],B=[];for(var i=0;i<4;i++){var x=a[i][0],y=a[i][1],u=b[i][0],v=b[i][1];A.push([x,y,1,0,0,0,-u*x,-u*y]);B.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);B.push(v)}
 for(var c=0;c<8;c++){var p=c;for(var r=c+1;r<8;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;var t=A[c];A[c]=A[p];A[p]=t;t=B[c];B[c]=B[p];B[p]=t;for(var r2=c+1;r2<8;r2++){var f=A[r2][c]/A[c][c];for(var k=c;k<8;k++)A[r2][k]-=f*A[c][k];B[r2]-=f*B[c]}}
 var X=new Array(8);for(var i2=7;i2>=0;i2--){var s=B[i2];for(var k2=i2+1;k2<8;k2++)s-=A[i2][k2]*X[k2];X[i2]=s/A[i2][i2]}return X}
/* ---------- 2. tratamento: contraste adaptativo (CamScanner "documento") ---------- */
function limpar(cv){var c=document.createElement('canvas'),s=Math.min(2.2,Math.max(1,2400/Math.max(cv.width,cv.height)));c.width=cv.width*s;c.height=cv.height*s;var x=c.getContext('2d');x.drawImage(cv,0,0,c.width,c.height);
 var d=x.getImageData(0,0,c.width,c.height),p=d.data,W=c.width,H=c.height,g=new Float32Array(W*H),sum=0;for(var i=0,j=0;i<p.length;i+=4,j++){g[j]=0.3*p[i]+0.59*p[i+1]+0.11*p[i+2];sum+=g[j]}
 var inv=sum/(W*H)<110;if(inv)for(var k=0;k<g.length;k++)g[k]=255-g[k];
 var I=new Float64Array((W+1)*(H+1));for(var y=1;y<=H;y++){var r=0;for(var x2=1;x2<=W;x2++){r+=g[(y-1)*W+x2-1];I[y*(W+1)+x2]=I[(y-1)*(W+1)+x2]+r}}
 var R=Math.max(12,Math.round(Math.min(W,H)/40));for(var y2=0;y2<H;y2++)for(var x3=0;x3<W;x3++){var a=Math.max(0,x3-R),b=Math.max(0,y2-R),c2=Math.min(W,x3+R),e=Math.min(H,y2+R),n=(c2-a)*(e-b),m=(I[e*(W+1)+c2]-I[b*(W+1)+c2]-I[e*(W+1)+a]+I[b*(W+1)+a])/n,v=g[y2*W+x3]<m*0.88?0:255,o=(y2*W+x3)*4;p[o]=p[o+1]=p[o+2]=v}
 x.putImageData(d,0,0);return c}
/* ---------- 3. OCR com várias leituras ---------- */
var WK=null;function worker(){if(WK)return WK;WK=Tesseract.createWorker('por');return WK}
function ler(c,st){return Promise.resolve(worker()).then(function(w){var out='';var modes=['4','6','11'];var k=0;
 function nx(){if(k>=modes.length)return out;st('Lendo… passada '+(k+1)+' de '+modes.length);return w.setParameters({tessedit_pageseg_mode:modes[k],preserve_interword_spaces:'1'}).then(function(){return w.recognize(c)}).then(function(r){out+='\n'+(r.data.text||'');k++;return nx()})}
 return nx()})}
/* ---------- 4. fila de imagens ---------- */
window.scLer=function(files){Q=[].slice.call(files||[]).filter(function(f){return f&&/image/.test(f.type||'image')});if(!Q.length)return;QI=0;TXT='';RAW=[];
 if(typeof Tesseract==='undefined'){alert('O leitor ainda está carregando. Tente em alguns segundos.');return}proxima()};
function proxima(){var st=$('sc-st');if(QI>=Q.length){fim();return}
 abrirRecorte(Q[QI]).then(function(cv){if(!cv){QI++;return proxima()}var lim=limpar(cv);var prev=$('sc-prev');if(prev){prev.innerHTML='';var im=new Image();im.src=cv.toDataURL('image/jpeg',.6);im.style.cssText='max-width:100%;max-height:240px;border:1px solid #e3ddd1;border-radius:4px';prev.appendChild(im)}
  var say=function(t){if(st)st.textContent='Imagem '+(QI+1)+' de '+Q.length+' · '+t};
  ler(lim,say).then(function(t){TXT+='\n'+t;QI++;proxima()}).catch(function(e){say('erro: '+e.message);QI++;proxima()})})}
function fim(){var st=$('sc-st');var lines=TXT.split(/\n/).map(function(x){return x.trim()}).filter(Boolean);var seen={};lines=lines.filter(function(l){var k=l.replace(/\s+/g,' ').toLowerCase();if(seen[k])return false;seen[k]=1;return true});
 /* leitura mais completa = soma das passadas sem repetir */
 var txt=lines.join('\n');if(window.__mostrarScan)window.__mostrarScan(txt);
 /* garantia: todo telefone do texto aparece na lista */
 var re=/(?:\+?55[\s.-]*)?\(?\d{2}\)?[\s.-]*9?\s?\d{4}[\s.-]*\d{4}/g,tels={};(txt.match(re)||[]).forEach(function(t){t=t.replace(/\D/g,'');if(t.length>11&&t.indexOf('55')===0)t=t.slice(2);if(t.length>=10&&t.length<=11)tels[t]=1});
 var falt=Object.keys(tels).filter(function(t){return !document.querySelector('input[id^="sc-t"][value*="'+t.slice(-4)+'"]')});
 if(falt.length&&window.__addScanRows)window.__addScanRows(falt);
 var nt=Object.keys(tels).length,rows=document.querySelectorAll('input[id^="sc-c"]').length;
 if(st)st.innerHTML+='<br><small>Conferência: '+nt+' telefone(s) na imagem · '+rows+' linha(s) na tabela. Linhas sem nome ficam em destaque — corrija antes de salvar. Use “+ Adicionar linha” para incluir algo que não foi lido.</small>';
 var bx=$('sc-raw');if(bx){bx.style.display='block';bx.querySelector('pre').textContent=txt}}
/* ---------- 5. integrar no modal do scanner ---------- */
var _ab=window.abrirImportFoto;window.abrirImportFoto=function(){_ab();var r=$('sc-res');if(r&&!$('sc-prev')){r.insertAdjacentHTML('beforebegin',"<div id='sc-prev' style='margin-bottom:8px'></div>");r.insertAdjacentHTML('afterend',"<div id='sc-raw' style='display:none;margin-top:10px'><details><summary style='cursor:pointer;font-size:12px'>Ver tudo o que foi lido na imagem</summary><pre style='white-space:pre-wrap;font-size:11px;background:#f6f2ea;padding:10px;border-radius:4px;max-height:200px;overflow:auto'></pre></details></div>")}};
window.importarFoto=window.abrirImportFoto;
})();

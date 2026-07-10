/* ==========================================================================
   financing-sim.js — Motor de simulação de financiamento (Paulo Cotrim)
   Reutilizável em qualquer página de empreendimento.

   Regra de negócio (conforme definido por Paulo):
   - Banco libera financiamento com base na renda (SBPE se renda>12k, senão MCMV)
   - Entrada = preço - financiado (ou valor manual informado pelo usuário)
   - Até 20% do valor do imóvel pode ser parcelado sem juros durante a obra
   - O que exceder esses 20%: FGTS entra primeiro para abater
   - Do que ainda sobrar depois do FGTS:
       · MRV: parcelamento pós-chaves em até 72x
       · Direcional · Vivaz: parcelamento pós-chaves em até 48x
       · Demais construtoras: precisa ser pago à vista na assinatura
   - Reforço anual (dezembro) opcional, abate o saldo parcelável da obra
   - Valor na entrega das chaves (opcional), abate a entrada antes de tudo
   ========================================================================== */

function parseBRLnum(v){
  if(!v) return 0;
  v = String(v).replace(/[R$\s]/g,'').replace(/\./g,'').replace(',', '.');
  var n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}
function fmtBRL(n){
  return 'R$ ' + (n||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function isMRVConstrutora(c){ return /mrv/i.test(c||''); }
function isVivazConstrutora(c){ return /vivaz/i.test(c||''); }

/* ---------- CATÁLOGO SLIM (sugestão cruzada) — mesmos dados reais do EMP em index.html ---------- */
var FSIM_CATALOG = [
  {nome:"Farol da Guanabara",tip:"Studio, 1 e 3 quartos",preco:"R$ 402.875",url:"farol-da-guanabara.html",bairro:"Santo Cristo · Porto Maravilha"},
  {nome:"Arcos do Porto",tip:"Studio, 1 e 2 quartos",preco:"R$ 360.588",url:"arcos-do-porto.html",bairro:"Porto Maravilha"},
  {nome:"Orla Central",tip:"1, 2 e 3 quartos",preco:"R$ 402.000",url:"orla-central.html",bairro:"Centro · Niterói"},
  {nome:"Parque Piedade",tip:"2 quartos",preco:"R$ 263.200",url:"parque-piedade.html",bairro:"Piedade · Zona Norte"},
  {nome:"Luzes do Rio Lamparina",tip:"1 e 2 quartos",preco:"R$ 309.000",url:"luzes-do-rio-lamparina.html",bairro:"São Cristóvão"},
  {nome:"Caminhos da Guanabara",tip:"1 e 2 quartos",preco:"R$ 334.999",url:"caminhos-da-guanabara.html",bairro:"Pendotiba · Niterói"},
  {nome:"Cartola II",tip:"1 e 2 quartos",preco:"R$ 302.470",url:"cartola-ii.html",bairro:"São Cristóvão"},
  {nome:"Luzes do Rio Candeeiro",tip:"1 e 2 quartos",preco:"R$ 361.962",url:"luzes-do-rio-candeeiro.html",bairro:"São Cristóvão"},
  {nome:"A Noite",tip:"Studio 44m² e duplex 70m²",preco:"R$ 802.000",url:"emp-a-noite.html",bairro:"Praça Mauá, 7 · Centro"},
  {nome:"Saudosa Praça Onze",tip:"Studio a 2 quartos suíte",preco:"R$ 285.000",url:"emp-saudosa-praca-onze.html",bairro:"Praça Onze · Centro"},
  {nome:"Alma Carioca",tip:"2 quartos",preco:"",url:"emp-alma-carioca.html",bairro:"Vila Valqueire · Zona Norte"},
  {nome:"Beon Porto Residencial",tip:"1 e 2 quartos",preco:"R$ 259.000",url:"emp-beon-porto.html",bairro:"São Cristóvão · Zona Norte"},
  {nome:"Brise Studios Design",tip:"Studios 31-44m²",preco:"",url:"emp-brise-studios.html",bairro:"Praça Pio X · Centro"},
  {nome:"Conquista Florianópolis",tip:"1 e 2 quartos",preco:"R$ 207.500",url:"emp-conquista-florianopolis.html",bairro:"Praça Seca · Jacarepaguá"},
  {nome:"Cores do Rio Residencial",tip:"Studios, 1 e 2 quartos",preco:"R$ 287.000",url:"emp-cores-do-rio.html",bairro:"Centro"},
  {nome:"CTV Beat",tip:"2 quartos",preco:"R$ 229.000",url:"emp-ctv-beat.html",bairro:"Madureira · Zona Norte"},
  {nome:"CTV Vitória",tip:"2 e 3 quartos",preco:"R$ 229.000",url:"emp-ctv-vitoria.html",bairro:"Campinho · Zona Norte"},
  {nome:"East Side Harmony",tip:"2 e 3 quartos",preco:"R$ 411.000",url:"emp-east-side-harmony.html",bairro:"Méier · Zona Norte"},
  {nome:"Wish Norte (Living)",tip:"2 e 3 quartos",preco:"R$ 385.000",url:"emp-living-wish-norte.html",bairro:"Cachambi · Zona Norte"},
  {nome:"Meu Crescer Engenhão",tip:"2 quartos",preco:"R$ 269.000",url:"emp-meu-crescer-engenhao.html",bairro:"Engenho de Dentro · Zona Norte"},
  {nome:"Only by Living",tip:"2 a 4 quartos",preco:"R$ 334.280",url:"emp-only-by-living.html",bairro:"Cachambi · Zona Norte"},
  {nome:"Primor Carioca",tip:"2 quartos",preco:"R$ 262.990",url:"emp-primor-carioca.html",bairro:"Inhaúma · Zona Norte"},
  {nome:"Sal Rio Residencial",tip:"Studios e 1 quarto",preco:"R$ 189.000",url:"emp-sal-rio.html",bairro:"Saúde · Porto Maravilha"},
  {nome:"URB Sole",tip:"1 e 2 quartos",preco:"R$ 259.000",url:"emp-urb-sole.html",bairro:"Todos os Santos · Zona Norte"},
  {nome:"Village Caribe 1",tip:"2 quartos",preco:"",url:"emp-village-caribe.html",bairro:"Praça Seca · Jacarepaguá"},
  {nome:"Vivaz Connection",tip:"2 quartos",preco:"R$ 233.000",url:"emp-vivaz-connection.html",bairro:"Riachuelo · Zona Norte"},
  {nome:"Vivaz Rua Honório",tip:"1 e 2 quartos",preco:"R$ 259.592",url:"emp-vivaz-honorio.html",bairro:"Todos os Santos · Zona Norte"},
  {nome:"Império do Ouro",tip:"2 quartos, até 1 suíte",preco:"",url:"emp-imperio-do-ouro.html",bairro:"Rio do Ouro · São Gonçalo"},
  {nome:"Ritmos de Pilares",tip:"1 ou 2 quartos",preco:"",url:"emp-ritmos-de-pilares.html",bairro:"Pilares · Rio de Janeiro"},
  {nome:"Encantos da Zona Norte",tip:"2 quartos",preco:"",url:"emp-encantos-da-zona-norte.html",bairro:"Região de Bonsucesso · Rio de Janeiro"},
  {nome:"Reserva Redentor",tip:"2 quartos",preco:"",url:"emp-reserva-redentor.html",bairro:"Rocha · Rio de Janeiro"},
];
function fsimParseQuartos(tip){
  tip=(tip||'').toLowerCase();var out={};
  if(tip.indexOf('studio')>=0)out[0]=1;
  var r1=/(\d+)\s*a\s*(\d+)\s*quartos?/g,m;
  while((m=r1.exec(tip))){for(var k=parseInt(m[1],10);k<=parseInt(m[2],10);k++)out[k]=1;}
  var r2=/(\d+)\s*quartos?/g,m2;
  while((m2=r2.exec(tip))){out[parseInt(m2[1],10)]=1;}
  var arr=Object.keys(out).map(Number);
  return arr.length?arr:[-1];
}
function fsimParsePreco(preco){
  var m=(preco||'').match(/R\$\s*([\d.]+)/);
  if(!m) return null;
  return parseInt(m[1].replace(/\./g,''),10);
}
FSIM_CATALOG.forEach(function(e){ e._q=fsimParseQuartos(e.tip); e._p=fsimParsePreco(e.preco); });

function fsimSugestoesHTML(nomeAtual, precoAlvo){
  if(!precoAlvo) return '';
  var atual = FSIM_CATALOG.filter(function(e){ return nomeAtual && e.nome && (nomeAtual.indexOf(e.nome)>=0 || e.nome.indexOf(nomeAtual)>=0); })[0];
  var quartosAlvo = atual ? atual._q : null;
  var candidatos = FSIM_CATALOG.filter(function(e){
    if(atual && e.nome===atual.nome) return false;
    if(!e._p) return false;
    if(Math.abs(e._p - precoAlvo) > 20000) return false;
    if(quartosAlvo && quartosAlvo[0]!==-1 && e._q[0]!==-1){
      var overlap = e._q.some(function(q){ return quartosAlvo.indexOf(q)>=0; });
      if(!overlap) return false;
    }
    return true;
  }).sort(function(a,b){ return Math.abs(a._p-precoAlvo) - Math.abs(b._p-precoAlvo); }).slice(0,3);
  if(!candidatos.length) return '';
  var cards = candidatos.map(function(e){
    return '<a href="'+e.url+'" style="display:block;background:#fff;border:1px solid #e8eaed;border-radius:12px;padding:14px 16px;text-decoration:none;transition:box-shadow .3s ease">'
      +'<b style="display:block;font-size:13.5px;color:#0f2e36;margin-bottom:3px">'+e.nome+'</b>'
      +'<span style="display:block;font-size:11.5px;color:#6b7280;margin-bottom:6px">'+e.bairro+'</span>'
      +'<span style="display:block;font-size:13px;font-weight:700;color:#b8873a">'+e.preco+'</span></a>';
  }).join('');
  return '<div style="margin-top:22px;padding-top:18px;border-top:1px solid #e8eaed">'
    +'<div style="font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#b8873a;margin-bottom:12px">Imóveis parecidos que também cabem no seu orçamento</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">'+cards+'</div></div>';
}

function calcularSimulacao(p){
  var preco = p.preco || 0;
  var renda = p.renda || 0;
  var mod = p.modalidade==='auto' || !p.modalidade ? (renda>12000?'sbpe':'mcmv') : p.modalidade;
  var pctFin = mod==='sbpe' ? 0.90 : 0.80;
  var financiado = Math.min(preco*pctFin, preco);
  var entradaCalc = Math.max(0, preco-financiado);
  var entrada = (p.entradaManual!=null && p.entradaManual>0) ? p.entradaManual : entradaCalc;

  var valorChave = Math.min(p.valorChave||0, entrada);
  var entradaRestante = Math.max(0, entrada - valorChave);

  var limite20 = preco*0.20;
  var parcelavelObra = Math.min(entradaRestante, limite20);
  var excedente = Math.max(0, entradaRestante - limite20);

  var fgtsValor = p.fgtsValor||0;
  var fgtsAplicado = Math.min(fgtsValor, excedente);
  var excedenteFinal = Math.max(0, excedente - fgtsAplicado);

  var construtora = p.construtora||'';
  var mrv = isMRVConstrutora(construtora), vivaz = isVivazConstrutora(construtora);
  var temPosChaves = (mrv || vivaz) && excedenteFinal>0;
  var maxParcelasPosChaves = mrv ? 72 : (vivaz ? 48 : 0);
  var parcelaPosChaves = temPosChaves ? excedenteFinal/maxParcelasPosChaves : 0;
  var aVistaFinal = temPosChaves ? 0 : excedenteFinal;
  var semEntradaAVista = aVistaFinal<=0.005;

  var parcelasObra = p.parcelasObra || 24;
  var reforcoDez = p.reforcoDez||0;
  var anos = Math.max(1, Math.ceil(parcelasObra/12));
  var totalReforcos = Math.min(parcelavelObra, reforcoDez*anos);
  var baseMensalObra = Math.max(0, parcelavelObra-totalReforcos);
  var parcelaObraMensal = parcelasObra>0 ? baseMensalObra/parcelasObra : 0;

  var parcelaChavesMax = renda*0.30;
  var valorChavesMax12x = parcelaChavesMax*12;

  return {
    preco:preco, renda:renda, mod:mod, pctFin:pctFin, financiado:financiado,
    entrada:entrada, valorChave:valorChave, entradaRestante:entradaRestante,
    limite20:limite20, parcelavelObra:parcelavelObra, excedente:excedente,
    fgtsAplicado:fgtsAplicado, excedenteFinal:excedenteFinal,
    construtora:construtora, mrv:mrv, vivaz:vivaz, temPosChaves:temPosChaves,
    maxParcelasPosChaves:maxParcelasPosChaves, parcelaPosChaves:parcelaPosChaves,
    aVistaFinal:aVistaFinal, semEntradaAVista:semEntradaAVista,
    parcelasObra:parcelasObra, reforcoDez:reforcoDez, totalReforcos:totalReforcos,
    parcelaObraMensal:parcelaObraMensal, parcelaChavesMax:parcelaChavesMax,
    valorChavesMax12x:valorChavesMax12x
  };
}

/* ---------- UI reutilizável ---------- */
function fsimHTML(nome, precoConhecido, precoInicial, apresentacao){
  var precoField = precoConhecido
    ? '<input type="hidden" id="fsimPreco" value="'+precoInicial+'">'
    : '<div class="sim-field"><label>Valor do imóvel que você recebeu com o Paulo (R$)</label><input type="text" id="fsimPreco" placeholder="Ex: 300.000" oninput="fsimUpdate()"></div>';
  var btnApresentacao = apresentacao
    ? '    <button class="btn-ghost" onclick="fsimAbrirApresentacao()">'
      +'      <svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15h6M9 11h6"/></svg>'
      +'      Baixar apresentação completa (PDF oficial)'
      +'    </button>'
    : '';
  return ''
    +'<div class="sim-card reveal">'
    +'  <div class="sim-grid">'
    +      precoField
    +'    <div class="sim-field"><label>Sua renda familiar mensal (R$)</label><input type="text" id="fsimRenda" value="3.000" oninput="fsimUpdate()"></div>'
    +'    <div class="sim-field"><label>Tem FGTS disponível?</label><div class="sim-check-row"><input type="checkbox" id="fsimFgts" onchange="fsimUpdate()"> <label for="fsimFgts">Sim, quero usar</label></div><input type="text" id="fsimFgtsValor" placeholder="Valor do FGTS (R$)" style="display:none;margin-top:8px" oninput="fsimUpdate()"></div>'
    +'    <div class="sim-field"><label>Entrada que você quer dar (R$) <span style="font-weight:400">— opcional</span></label><input type="text" id="fsimEntrada" placeholder="Deixe em branco para calcular automaticamente" oninput="fsimUpdate()"></div>'
    +'    <div class="sim-field"><label>Parcelar a entrada em quantos meses (durante a obra)?</label><input type="range" min="1" max="36" value="24" class="sim-range" id="fsimParcelas" oninput="fsimUpdate()"><div class="sim-range-val"><span id="fsimParcelasVal">24</span>x até a entrega das chaves</div></div>'
    +'    <div class="sim-field"><label>Reforço a cada dezembro (opcional)</label><input type="text" id="fsimReforco" placeholder="R$ 0" oninput="fsimUpdate()"></div>'
    +'    <div class="sim-field"><label>Valor extra na entrega das chaves (opcional)</label><input type="text" id="fsimValorChave" placeholder="R$ 0" oninput="fsimUpdate()"></div>'
    +'  </div>'
    +'  <div class="sim-out" id="fsimOut"></div>'
    +'  <div class="sim-note" id="fsimNote"></div>'
    +'  <div id="fsimSugg"></div>'
    +'  <div class="sim-actions">'
    +'    <button class="btn-gold" onclick="fsimWhatsapp(\''+nome.replace(/'/g,"\\'")+'\')">'
    +'      <svg class="ic ic-sm" viewBox="0 0 24 24" style="stroke:#fff"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'
    +'      Confirmar esta simulação com Paulo'
    +'    </button>'
    +'    <button class="btn-ghost" onclick="fsimDownload(\''+nome.replace(/'/g,"\\'")+'\')">'
    +'      <svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>'
    +'      Baixar resumo (com ou sem simulação)'
    +'    </button>'
    + btnApresentacao
    +'  </div>'
    +'</div>';
}

var FSIM_LAST = null, FSIM_NOME='', FSIM_CONSTRUTORA='', FSIM_BAIRRO='', FSIM_APRESENTACAO='';

function fsimAbrirApresentacao(){
  if(!FSIM_APRESENTACAO) return;
  window.open('apresentacoes/'+FSIM_APRESENTACAO, '_blank');
}

function initSimuladorEmbed(containerId, opts){
  var el = document.getElementById(containerId);
  if(!el) return;
  FSIM_NOME = opts.nome||''; FSIM_CONSTRUTORA = opts.construtora||''; FSIM_BAIRRO = opts.bairro||'';
  FSIM_APRESENTACAO = opts.apresentacao||'';
  var precoConhecido = !!(opts.preco && opts.preco>0);
  el.innerHTML = fsimHTML(FSIM_NOME, precoConhecido, opts.preco||'', FSIM_APRESENTACAO);
  fsimUpdate();
}

function fsimUpdate(){
  var fgtsChk = document.getElementById('fsimFgts');
  var fgtsBox = document.getElementById('fsimFgtsValor');
  if(fgtsChk && fgtsBox) fgtsBox.style.display = fgtsChk.checked ? 'block' : 'none';
  var pr = document.getElementById('fsimParcelas');
  if(pr) document.getElementById('fsimParcelasVal').textContent = pr.value;

  var precoEl = document.getElementById('fsimPreco');
  var preco = precoEl ? parseBRLnum(precoEl.value) : 0;
  if(preco<=0){
    document.getElementById('fsimOut').innerHTML = '';
    document.getElementById('fsimNote').innerHTML = '<span style="color:var(--gray)">Informe o valor do imóvel para ver a simulação completa.</span>';
    return;
  }
  var renda = parseBRLnum(document.getElementById('fsimRenda').value);
  var fgtsValor = (fgtsChk && fgtsChk.checked) ? parseBRLnum(fgtsBox.value) : 0;
  var entradaInput = document.getElementById('fsimEntrada').value;
  var entradaManual = entradaInput.trim()!=='' ? Math.max(0,parseBRLnum(entradaInput)) : 0;
  var parcelasObra = parseInt(document.getElementById('fsimParcelas').value,10) || 1;
  var reforcoDez = parseBRLnum(document.getElementById('fsimReforco').value);
  var valorChave = parseBRLnum(document.getElementById('fsimValorChave').value);

  var c = calcularSimulacao({
    preco:preco, renda:renda, fgtsValor:fgtsValor, entradaManual:entradaManual,
    parcelasObra:parcelasObra, reforcoDez:reforcoDez, valorChave:valorChave,
    construtora:FSIM_CONSTRUTORA
  });
  FSIM_LAST = c;

  var out = ''
    +'<div class="sim-out-card hl"><div class="l">Financiamento estimado ('+(c.mod==='sbpe'?'SBPE':'MCMV')+')</div><div class="v">'+fmtBRL(c.financiado)+'</div></div>'
    +'<div class="sim-out-card"><div class="l">Entrada total</div><div class="v">'+fmtBRL(c.entrada)+'</div></div>';
  if(c.valorChave>0) out += '<div class="sim-out-card"><div class="l">Abatido com valor na entrega das chaves</div><div class="v">'+fmtBRL(c.valorChave)+'</div></div>';
  out += '<div class="sim-out-card"><div class="l">Parcelável sem juros na obra (até 20%)</div><div class="v">'+fmtBRL(c.parcelavelObra)+'</div></div>'
    +'<div class="sim-out-card"><div class="l">Parcela da entrada na obra ('+c.parcelasObra+'x)</div><div class="v">'+fmtBRL(c.parcelaObraMensal)+'</div></div>';
  if(c.fgtsAplicado>0) out += '<div class="sim-out-card"><div class="l">FGTS aplicado</div><div class="v">'+fmtBRL(c.fgtsAplicado)+'</div></div>';
  if(c.temPosChaves){
    out += '<div class="sim-out-card hl"><div class="l">Parcelamento pós-chaves ('+c.maxParcelasPosChaves+'x)</div><div class="v">'+fmtBRL(c.parcelaPosChaves)+'</div></div>';
  } else if(!c.semEntradaAVista){
    out += '<div class="sim-out-card sim-warn"><div class="l">Entrada à vista necessária</div><div class="v">'+fmtBRL(c.aVistaFinal)+'</div></div>';
  }
  document.getElementById('fsimOut').innerHTML = out;

  var note = '';
  if(c.semEntradaAVista && !c.temPosChaves){
    note += '<strong>Sua entrada cabe inteira dentro dos 20% do valor do imóvel</strong>, parcelada sem juros em '+c.parcelasObra+'x durante a obra. ';
  } else if(c.temPosChaves){
    var constNome = c.mrv?'MRV':'Direcional · Vivaz';
    note += '<strong>'+constNome+' permite estender o que passar dos 20% parceláveis</strong> para depois da entrega das chaves, em até '+c.maxParcelasPosChaves+'x — por isso você não precisa de entrada à vista aqui. ';
  } else {
    note += 'Sua entrada passa dos 20% do imóvel que podem ser parcelados sem juros na obra ('+fmtBRL(c.limite20)+'). O que exceder — '+fmtBRL(c.aVistaFinal)+' — precisa ser pago à vista na assinatura'+(c.fgtsAplicado>0?' mesmo depois de usar o FGTS':'')+(c.mrv||c.vivaz?'':'. Construtoras como MRV e Vivaz costumam estender esse valor para pós-chaves — vale perguntar ao Paulo se surgiu uma condição assim para este empreendimento')+'. ';
  }
  if(c.totalReforcos>0){
    note += 'Considerado reforço de '+fmtBRL(c.reforcoDez)+' em cada dezembro, reduzindo a parcela mensal da obra. ';
  }
  note += 'Na entrega das chaves, para a parcela caber na sua renda, o ideal é não passar de <strong>'+fmtBRL(c.parcelaChavesMax)+'/mês</strong> (30% de '+fmtBRL(c.renda)+'), equivalente a até <strong>'+fmtBRL(c.valorChavesMax12x)+'</strong> em 12x. ';
  note += '<br><span style="opacity:.85">Simulação educativa com base no valor informado ('+fmtBRL(c.preco)+') — a prestação real do financiamento e as condições finais são calculadas pela Caixa/banco na Aprovação Expressa com o Paulo.</span>';
  document.getElementById('fsimNote').innerHTML = note;
  var suggEl = document.getElementById('fsimSugg');
  if(suggEl) suggEl.innerHTML = fsimSugestoesHTML(FSIM_NOME, c.preco);
}

function fsimWhatsapp(nome){
  var c = FSIM_LAST;
  if(!c){ window.open('https://wa.me/5521989150864?text='+encodeURIComponent('Olá Paulo! Quero simular o financiamento do '+nome+'.'),'_blank'); return; }
  var msg = 'Olá Paulo! Fiz a simulação do '+nome+':\n\n'
    +'Valor: '+fmtBRL(c.preco)+'\nRenda: '+fmtBRL(c.renda)+'\nModalidade: '+c.mod.toUpperCase()
    +'\nFinanciamento estimado: '+fmtBRL(c.financiado)+'\nEntrada total: '+fmtBRL(c.entrada)
    +'\nParcelável na obra: '+fmtBRL(c.parcelavelObra)+' em '+c.parcelasObra+'x de '+fmtBRL(c.parcelaObraMensal)
    +(c.fgtsAplicado>0?'\nFGTS usado: '+fmtBRL(c.fgtsAplicado):'')
    +(c.temPosChaves?'\nPós-chaves: '+c.maxParcelasPosChaves+'x de '+fmtBRL(c.parcelaPosChaves):'')
    +(!c.temPosChaves && !c.semEntradaAVista?'\nEntrada à vista: '+fmtBRL(c.aVistaFinal):'')
    +'\n\nQuero confirmar esses valores com você!';
  if(window.enviarLeadCRM) enviarLeadCRM({
    nome:'Lead Simulador '+nome, telefone:'', interesse:nome, renda:fmtBRL(c.renda),
    regiao:FSIM_BAIRRO, origem:'simulador-imovel',
    extras:{preco:c.preco, entrada:c.entrada, financiado:c.financiado, modalidade:c.mod}
  });
  window.open('https://wa.me/5521989150864?text='+encodeURIComponent(msg),'_blank');
}

function fsimDownload(nome){
  var c = FSIM_LAST;
  var incluirSim = !!c;
  var url = window.location.href;
  var qr = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(url);
  var simRows = '';
  if(incluirSim){
    simRows = ''
      +'<div class="row"><span class="rk">Valor simulado</span><span class="rv">'+fmtBRL(c.preco)+'</span></div>'
      +'<div class="row"><span class="rk">Financiamento estimado</span><span class="rv">'+fmtBRL(c.financiado)+'</span></div>'
      +'<div class="row"><span class="rk">Entrada total</span><span class="rv">'+fmtBRL(c.entrada)+'</span></div>'
      +'<div class="row"><span class="rk">Parcelável na obra</span><span class="rv">'+fmtBRL(c.parcelavelObra)+' em '+c.parcelasObra+'x de '+fmtBRL(c.parcelaObraMensal)+'</span></div>'
      +(c.temPosChaves?'<div class="row"><span class="rk">Pós-chaves</span><span class="rv">'+c.maxParcelasPosChaves+'x de '+fmtBRL(c.parcelaPosChaves)+'</span></div>':'');
  }
  var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Resumo — '+nome+'</title>'
    +'<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">'
    +'<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;color:#0f2e36;background:#fff;padding:44px;max-width:680px;margin:0 auto}'
    +'h1{font-family:Fraunces,serif;font-size:24px;margin-bottom:4px}.sub{font-size:12px;color:#6b7280;margin-bottom:28px}'
    +'.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e8eaed;font-size:14px}.rk{color:#6b7280}.rv{font-weight:600}'
    +'.note{font-size:11.5px;color:#6b7280;margin-top:18px;line-height:1.7;background:#e7edee;padding:14px 16px;border-radius:10px}'
    +'.qrbox{display:flex;align-items:center;gap:16px;margin-top:28px;padding-top:20px;border-top:1px solid #e8eaed}'
    +'.qrbox img{width:110px;height:110px}.qrbox div{font-size:12px;color:#6b7280}.qrbox b{display:block;color:#0f2e36;font-size:13.5px;margin-bottom:4px}'
    +'.brandbar{display:flex;align-items:center;gap:10px;margin-top:24px;padding-top:16px;border-top:1px solid #e8eaed}'
    +'.brandbar b{font-size:13px;color:#0f2e36}.brandbar span{font-size:11.5px;color:#6b7280;display:block}'
    +'.foot{margin-top:24px;font-size:10.5px;color:#94a3b8;text-align:center}@media print{body{padding:20px}}</style></head><body>'
    +'<h1>'+nome+'</h1><div class="sub">Resumo do empreendimento · Paulo Cotrim · CRECI-RJ 77677-F</div>'
    +'<div class="row"><span class="rk">Construtora</span><span class="rv">'+FSIM_CONSTRUTORA+'</span></div>'
    +'<div class="row"><span class="rk">Localização</span><span class="rv">'+FSIM_BAIRRO+'</span></div>'
    + simRows
    +'<div class="note">Valores de tabela pública e simulação educativa — sujeitos a alteração e disponibilidade. Confirme condições atualizadas com Paulo antes de decidir.</div>'
    +(FSIM_APRESENTACAO?'<div class="row"><span class="rk">Apresentação completa</span><span class="rv">'+window.location.origin+window.location.pathname.replace(/[^/]*$/,'')+'apresentacoes/'+FSIM_APRESENTACAO+'</span></div>':'')
    +'<div class="qrbox"><img src="'+qr+'" alt="QR code"/><div><b>Aponte a câmera para voltar à página</b>Reveja fotos, mapa e fale com o Paulo pelo WhatsApp direto do celular.</div></div>'
    +'<div class="brandbar"><div><b>Paulo Cotrim</b><span>CRECI-RJ 77677-F · corretorpaulocotrim@gmail.com · (21) 98915-0864</span></div></div>'
    +'<div class="foot">Paulo Cotrim · Documento informativo, não substitui a tabela oficial e a simulação bancária real</div>'
    +'</body></html>';
  var win=window.open('','_blank');
  if(win){win.document.write(html);win.document.close();win.focus();setTimeout(function(){win.print();},350);}
}

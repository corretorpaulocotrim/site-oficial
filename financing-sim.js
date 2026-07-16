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
function isVitaleConstrutora(c){ return /vitale/i.test(c||''); }

/* ---------- CATÁLOGO SLIM (sugestão cruzada) — mesmos dados reais do EMP em index.html ---------- */
var FSIM_CATALOG = [
  {nome:"Farol da Guanabara",tip:"Studio, 1 e 3 quartos",preco:"R$ 402.875",url:"farol-da-guanabara.html",bairro:"Santo Cristo · Porto Maravilha",endereco:"Rua Sacadura Cabral, 103, Santo Cristo"},
  {nome:"Arcos do Porto",tip:"Studio, 1 e 2 quartos",preco:"R$ 360.588",url:"arcos-do-porto.html",bairro:"Porto Maravilha",endereco:"Av. Rodrigues Alves, Porto Maravilha"},
  {nome:"Orla Central",tip:"1, 2 e 3 quartos",preco:"R$ 402.000",url:"orla-central.html",bairro:"Centro · Niterói",endereco:"Rua Saldanha Marinho, Lote 2, Centro"},
  {nome:"Parque Piedade",tip:"2 quartos",preco:"R$ 263.200",url:"parque-piedade.html",bairro:"Piedade · Zona Norte",endereco:"Rua Piedade, s/n, Piedade"},
  {nome:"Luzes do Rio Lamparina",tip:"1 e 2 quartos",preco:"R$ 309.000",url:"luzes-do-rio-lamparina.html",bairro:"São Cristóvão",endereco:"Rua Campo de São Cristóvão, Imperial São Cristóvão"},
  {nome:"Caminhos da Guanabara",tip:"1 e 2 quartos",preco:"R$ 334.999",url:"caminhos-da-guanabara.html",bairro:"Pendotiba · Niterói",endereco:"Estrada Caetano Monteiro, s/n, Pendotiba"},
  {nome:"Cartola II",tip:"1 e 2 quartos",preco:"R$ 302.470",url:"cartola-ii.html",bairro:"São Cristóvão",endereco:"Rua São Luís Gonzaga, São Cristóvão"},
  {nome:"Luzes do Rio Candeeiro",tip:"1 e 2 quartos",preco:"R$ 361.962",url:"luzes-do-rio-candeeiro.html",bairro:"São Cristóvão",endereco:"Rua Campo de São Cristóvão, Imperial São Cristóvão"},
  {nome:"A Noite",tip:"Studio 44m² e duplex 70m²",preco:"R$ 802.000",url:"emp-a-noite.html",bairro:"Praça Mauá, 7 · Centro",endereco:"Praça Mauá, 7"},
  {nome:"Saudosa Praça Onze",tip:"Studio a 2 quartos suíte",preco:"R$ 285.000",url:"emp-saudosa-praca-onze.html",bairro:"Praça Onze · Centro",endereco:"Rua Benedito Hipólito, 218"},
  {nome:"Alma Carioca",tip:"2 quartos",preco:"",url:"emp-alma-carioca.html",bairro:"Vila Valqueire · Zona Norte",endereco:"Estrada Intendente Magalhães, 279"},
  {nome:"Beon Porto Residencial",tip:"1 e 2 quartos",preco:"R$ 259.000",url:"emp-beon-porto.html",bairro:"São Cristóvão · Zona Norte",endereco:"Rua Monsenhor Manuel Gomes, 175"},
  {nome:"Brise Studios Design",tip:"Studios 31-44m²",preco:"",url:"emp-brise-studios.html",bairro:"Praça Pio X · Centro",endereco:"Praça Pio X, 99"},
  {nome:"Conquista Florianópolis",tip:"1 e 2 quartos",preco:"R$ 207.500",url:"emp-conquista-florianopolis.html",bairro:"Praça Seca · Jacarepaguá",endereco:"Rua Florianópolis"},
  {nome:"Cores do Rio Residencial",tip:"Studios, 1 e 2 quartos",preco:"R$ 287.000",url:"emp-cores-do-rio.html",bairro:"Centro",endereco:"Rua Irineu Marinho, 52"},
  {nome:"CTV Beat",tip:"2 quartos",preco:"R$ 229.000",url:"emp-ctv-beat.html",bairro:"Madureira · Zona Norte",endereco:"Rua Carlos Xavier, 72"},
  {nome:"CTV Vitória",tip:"2 e 3 quartos",preco:"R$ 229.000",url:"emp-ctv-vitoria.html",bairro:"Campinho · Zona Norte",endereco:"Rua Comendador Pinto, 483"},
  {nome:"East Side Harmony",tip:"2 e 3 quartos",preco:"R$ 411.000",url:"emp-east-side-harmony.html",bairro:"Méier · Zona Norte",endereco:"Rua José Bonifácio, 140"},
  {nome:"Wish Norte (Living)",tip:"2 e 3 quartos",preco:"R$ 385.000",url:"emp-living-wish-norte.html",bairro:"Cachambi · Zona Norte",endereco:"Avenida Dom Hélder Câmara, 5123"},
  {nome:"Meu Crescer Engenhão",tip:"2 quartos",preco:"R$ 269.000",url:"emp-meu-crescer-engenhao.html",bairro:"Engenho de Dentro · Zona Norte",endereco:"Avenida Amaro Cavalcanti, 1615"},
  {nome:"Only by Living",tip:"2 a 4 quartos",preco:"R$ 334.280",url:"emp-only-by-living.html",bairro:"Cachambi · Zona Norte",endereco:"Av. Dom Hélder Câmara, 5000"},
  {nome:"Primor Carioca",tip:"2 quartos",preco:"R$ 262.990",url:"emp-primor-carioca.html",bairro:"Inhaúma · Zona Norte",endereco:"Av. Pastor Martin Luther King Jr, 989"},
  {nome:"Sal Rio Residencial",tip:"Studios e 1 quarto",preco:"R$ 189.000",url:"emp-sal-rio.html",bairro:"Saúde · Porto Maravilha",endereco:"Rua Sacadura Cabral, 103"},
  {nome:"URB Sole",tip:"1 e 2 quartos",preco:"R$ 259.000",url:"emp-urb-sole.html",bairro:"Todos os Santos · Zona Norte",endereco:"Rua Geobert de Queiróz, 127"},
  {nome:"Village Caribe 1",tip:"2 quartos",preco:"",url:"emp-village-caribe.html",bairro:"Praça Seca · Jacarepaguá",endereco:"Rua Albano, 219"},
  {nome:"Vivaz Connection",tip:"2 quartos",preco:"R$ 233.000",url:"emp-vivaz-connection.html",bairro:"Riachuelo · Zona Norte",endereco:"Rua Magalhães Castro"},
  {nome:"Vivaz Rua Honório",tip:"1 e 2 quartos",preco:"R$ 259.592",url:"emp-vivaz-honorio.html",bairro:"Todos os Santos · Zona Norte",endereco:"Rua Honório, 419"},
  {nome:"Império do Ouro",tip:"2 quartos, até 1 suíte",preco:"",url:"emp-imperio-do-ouro.html",bairro:"Rio do Ouro · São Gonçalo",endereco:"Av. Abdias José dos Santos"},
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
    return '<a href="'+e.url+'" style="display:block;background:#fff;border:1px solid #e8eaed;border-radius:14px;padding:18px 18px 16px;text-decoration:none;box-shadow:0 1px 2px rgba(15,46,54,.04);transition:box-shadow .3s ease,transform .3s ease" onmouseover="this.style.boxShadow=\'0 12px 28px rgba(15,46,54,.12)\';this.style.transform=\'translateY(-3px)\'" onmouseout="this.style.boxShadow=\'0 1px 2px rgba(15,46,54,.04)\';this.style.transform=\'none\'">'
      +'<span style="display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#3E8E5A;background:rgba(62,142,90,.1);padding:3px 9px;border-radius:20px;margin-bottom:9px">Dentro do orçamento</span>'
      +'<b style="display:block;font-size:15px;color:#0f2e36;margin-bottom:3px;font-weight:700">'+e.nome+'</b>'
      +'<span style="display:block;font-size:12px;color:#6b7280;margin-bottom:2px">'+e.bairro+' · '+e.tip+'</span>'
      +(e.endereco?'<span style="display:block;font-size:11px;color:#9ca3af;margin-bottom:10px">'+e.endereco+'</span>':'<span style="display:block;margin-bottom:10px"></span>')
      +'<span style="display:block;font-size:16px;font-weight:800;color:#b8873a;font-family:Fraunces,Georgia,serif">'+e.preco+'</span></a>';
  }).join('');
  return '<div style="margin-top:24px;padding-top:22px;border-top:1px solid #e8eaed">'
    +'<div style="font-size:11.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#0f2e36;margin-bottom:4px">Imóveis parecidos que também cabem no seu orçamento</div>'
    +'<div style="font-size:12px;color:#6b7280;margin-bottom:16px">Mesma faixa de preço e número de quartos — vale comparar antes de decidir.</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px">'+cards+'</div></div>';
}

function calcularSimulacao(p){
  var preco = p.preco || 0;
  var renda = p.renda || 0;
  var mod = p.modalidade==='auto' || !p.modalidade ? (renda>12000?'sbpe':'mcmv') : p.modalidade;
  var pctFin = mod==='sbpe' ? 0.90 : 0.80;
  var financiado = Math.min(preco*pctFin, preco);
  var entradaCalc = Math.max(0, preco-financiado);
  var entrada = (p.entradaManual!=null && p.entradaManual>0) ? p.entradaManual : entradaCalc;

  var atoEntrada = Math.max(0, Math.min(p.atoEntrada||0, entrada));
  var valorChave = Math.min(p.valorChave||0, Math.max(0, entrada-atoEntrada));
  var entradaRestante = Math.max(0, entrada - atoEntrada - valorChave);

  var limite20 = preco*0.20;
  var parcelavelObra = Math.min(entradaRestante, limite20);
  var excedente = Math.max(0, entradaRestante - limite20);

  var fgtsValor = p.fgtsValor||0;
  var fgtsAplicado = Math.min(fgtsValor, excedente);
  var excedenteFinal = Math.max(0, excedente - fgtsAplicado);

  var construtora = p.construtora||'';
  var mrv = isMRVConstrutora(construtora), vivaz = isVivazConstrutora(construtora), vitale = isVitaleConstrutora(construtora);
  var temPosChaves = (mrv || vivaz || vitale) && excedenteFinal>0;
  var maxParcelasPosChaves = mrv ? 72 : ((vivaz || vitale) ? 48 : 0);
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

  var MAX_MENSAL = 1500;
  var acimaDoTeto = parcelaObraMensal > MAX_MENSAL + 0.01;

  return {
    preco:preco, renda:renda, mod:mod, pctFin:pctFin, financiado:financiado,
    entrada:entrada, atoEntrada:atoEntrada, valorChave:valorChave, entradaRestante:entradaRestante,
    limite20:limite20, parcelavelObra:parcelavelObra, excedente:excedente,
    fgtsAplicado:fgtsAplicado, excedenteFinal:excedenteFinal,
    construtora:construtora, mrv:mrv, vivaz:vivaz, vitale:vitale, temPosChaves:temPosChaves,
    maxParcelasPosChaves:maxParcelasPosChaves, parcelaPosChaves:parcelaPosChaves,
    aVistaFinal:aVistaFinal, semEntradaAVista:semEntradaAVista,
    parcelasObra:parcelasObra, reforcoDez:reforcoDez, totalReforcos:totalReforcos,
    parcelaObraMensal:parcelaObraMensal, parcelaChavesMax:parcelaChavesMax,
    valorChavesMax12x:valorChavesMax12x, MAX_MENSAL:MAX_MENSAL, acimaDoTeto:acimaDoTeto
  };
}

/* Sugere um plano dentro do teto de R$1.500/mês: quantos meses são necessários,
   e quanto precisa ir para reforço de dezembro se mesmo no máximo de meses não bastar. */
function fsimSugerirPlano(preco, entradaAlvo, mesesMax){
  mesesMax = mesesMax || 120;
  var MAX_MENSAL = 1500;
  if(entradaAlvo<=0) return {meses:1, reforco:0, cabeSemReforco:true};
  var mesesNecessarios = Math.ceil(entradaAlvo / MAX_MENSAL);
  if(mesesNecessarios <= mesesMax){
    return {meses:Math.max(1,mesesNecessarios), reforco:0, cabeSemReforco:true};
  }
  // não cabe só em parcela mensal — usa o máximo de meses e joga o resto pra reforços de dezembro
  var viaMensal = mesesMax * MAX_MENSAL;
  var faltante = Math.max(0, entradaAlvo - viaMensal);
  var anos = Math.max(1, Math.ceil(mesesMax/12));
  var reforcoSugerido = faltante / anos;
  return {meses:mesesMax, reforco:reforcoSugerido, cabeSemReforco:false};
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
    +'  </div>'
    +'  <div id="fsimVerdict"></div>'
    +'  <div class="sim-out" id="fsimOut"></div>'
    +'  <div class="sim-note" id="fsimNote"></div>'
    +'  <div class="sim-plano" id="fsimPlano" style="margin-top:22px;padding-top:20px;border-top:1px solid var(--line)">'
    +'    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px">'
    +'      <div><div style="font-family:Fraunces,Georgia,serif;font-size:16.5px;font-weight:600;color:var(--ink)">Monte seu plano de pagamento da entrada</div><div style="font-size:12px;color:var(--gray);margin-top:3px">Ajuste cada parte até fechar o valor — a parcela mensal fica no teto de R$ 1.500</div></div>'
    +'      <button type="button" class="btn-ghost" style="padding:9px 16px;font-size:12px" onclick="fsimMontarAuto()">Montar automaticamente</button>'
    +'    </div>'
    +'    <div class="sim-grid" style="margin-bottom:10px">'
    +'      <div class="sim-field"><label>Ato de entrada — pago na assinatura (R$)</label><input type="text" id="fsimAto" placeholder="R$ 0" oninput="fsimUpdate()"></div>'
    +'      <div class="sim-field"><label>Parcelar o restante em quantos meses?</label><input type="range" min="1" max="120" value="24" class="sim-range" id="fsimParcelas" oninput="fsimUpdate()"><div class="sim-range-val"><span id="fsimParcelasVal">24</span>x até a entrega das chaves</div></div>'
    +'      <div class="sim-field"><label>Reforço a cada dezembro (opcional)</label><input type="text" id="fsimReforco" placeholder="R$ 0" oninput="fsimUpdate()"></div>'
    +'      <div class="sim-field"><label>Valor extra na entrega das chaves (opcional)</label><input type="text" id="fsimValorChave" placeholder="R$ 0" oninput="fsimUpdate()"></div>'
    +'    </div>'
    +'    <div id="fsimPlanoStatus"></div>'
    +'  </div>'
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
    +'    <button class="btn-ghost" onclick="fsimShare(this,\''+nome.replace(/'/g,"\\'")+'\')">'
    +'      <svg class="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5"/></svg>'
    +'      Compartilhar simulação'
    +'    </button>'
    + btnApresentacao
    +'  </div>'
    +'  <div style="font-size:11px;color:var(--gray);margin-top:10px">Esta é uma simulação inicial. A aprovação oficial depende da análise da construtora e da instituição financeira.</div>'
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
  var nome = opts.nome||'';
  var preco = opts.preco||0;
  var precoTxt = preco>0 ? fmtBRL(preco).replace(',00','') : '';
  var qs = preco>0 ? ('?preco='+Math.round(preco)+'&nome='+encodeURIComponent(nome)) : ('?nome='+encodeURIComponent(nome));
  var msg = encodeURIComponent('Olá! Vi o '+nome+' no site e quero simular o financiamento com a sua ajuda.');
  el.innerHTML = ''
    +'<div class="sim-cta-card reveal" style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:32px 28px;text-align:center;max-width:560px;margin:0 auto;box-shadow:0 1px 4px rgba(15,46,54,.05)">'
    +'  <div style="width:52px;height:52px;border-radius:50%;background:var(--mist);display:flex;align-items:center;justify-content:center;margin:0 auto 16px">'
    +'    <svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:var(--gold);fill:none;stroke-width:1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h2M12 10h2M16 10h2M8 14h2M12 14h2M16 14h2M8 18h2"/></svg>'
    +'  </div>'
    +'  <div style="font-family:Fraunces,Georgia,serif;font-size:19px;font-weight:600;color:var(--ink);margin-bottom:8px">Simule o financiamento do '+nome+'</div>'
    +'  <div style="font-size:14px;color:var(--gray);line-height:1.65;margin-bottom:24px;max-width:420px;margin-left:auto;margin-right:auto">'
    +      (precoTxt ? 'A partir de '+precoTxt+'. ' : '')
    +'    Use o simulador oficial do site para ver entrada, parcelas na obra e aprovação estimada — ou já comece sua Aprovação Expressa em 48h.'
    +'  </div>'
    +'  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">'
    +'    <a href="simulador.html'+qs+'" class="btn-gold" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px">'
    +'      <svg class="ic ic-sm" viewBox="0 0 24 24" style="stroke:#fff"><path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z"/></svg>Ir para o simulador</a>'
    +'    <a href="aprovacao-expressa.html" class="btn-ghost" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px">'
    +'      <svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>Aprovação Expressa em 48h</a>'
    +'  </div>'
    +'  <a href="https://wa.me/5521989150864?text='+msg+'" target="_blank" style="display:inline-flex;align-items:center;gap:6px;margin-top:18px;font-size:12.5px;color:var(--gray);text-decoration:underline">Prefere falar direto com o Paulo? Chame no WhatsApp</a>'
    +'</div>';
}

function fsimVerdictHTML(c){
  var headline, tone;
  if(c.acimaDoTeto){
    tone = 'warn';
    headline = 'A parcela da obra ficou em '+fmtBRL(c.parcelaObraMensal)+'/mês — acima do que eu recomendaria pra você dormir tranquilo. Dá pra ajustar o prazo, o ato de entrada ou o reforço de dezembro que eu resolvo isso com você.';
  } else if(c.temPosChaves){
    var constNome = c.mrv?'MRV':(c.vivaz?'Direcional · Vivaz':'a construtora');
    headline = 'Com renda de '+fmtBRL(c.renda)+', esse plano fecha bem: entrada parcelada sem juros na obra e o restante estendido pela '+constNome+' até '+c.maxParcelasPosChaves+'x pós-chaves. Não precisa tirar nada extra do bolso agora.';
  } else if(c.semEntradaAVista){
    headline = 'Boa notícia: com renda de '+fmtBRL(c.renda)+', sua entrada cabe inteira dentro dos 20% parceláveis sem juros — '+fmtBRL(c.parcelaObraMensal)+'/mês até a entrega das chaves, sem surpresa.';
  } else {
    headline = 'Esse plano ainda deixa '+fmtBRL(c.aVistaFinal)+' pra cobrir à vista na assinatura. Antes de descartar o imóvel, vamos ver se o FGTS ou uma entrada maior resolvem — é rápido no WhatsApp.';
    tone = 'neutral';
  }
  var bg = tone==='warn' ? 'linear-gradient(135deg,#7a4a1a,#a5772e)' : 'linear-gradient(135deg,#0f2e36,#173d47)';
  return ''
    +'<div class="reveal" style="display:flex;gap:14px;align-items:flex-start;background:'+bg+';border-radius:16px;padding:20px 22px;margin-bottom:20px;color:#fff">'
    +'  <img src="paulo-cotrim-profissional.jpeg" alt="Paulo Cotrim" style="width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid rgba(255,255,255,.35)" loading="lazy">'
    +'  <div>'
    +'    <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:rgba(255,255,255,.65);margin-bottom:5px">Análise do Paulo pra esse plano</div>'
    +'    <div style="font-family:Fraunces,Georgia,serif;font-size:16px;font-weight:600;line-height:1.45">'+headline+'</div>'
    +'  </div>'
    +'</div>';
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
    var verdictElEmpty = document.getElementById('fsimVerdict');
    if(verdictElEmpty) verdictElEmpty.innerHTML = '';
    return;
  }
  var renda = parseBRLnum(document.getElementById('fsimRenda').value);
  var fgtsValor = (fgtsChk && fgtsChk.checked) ? parseBRLnum(fgtsBox.value) : 0;
  var entradaInput = document.getElementById('fsimEntrada').value;
  var entradaManual = entradaInput.trim()!=='' ? Math.max(0,parseBRLnum(entradaInput)) : 0;
  var atoEl = document.getElementById('fsimAto');
  var atoEntrada = atoEl ? parseBRLnum(atoEl.value) : 0;
  var parcelasObra = parseInt(document.getElementById('fsimParcelas').value,10) || 1;
  var reforcoDez = parseBRLnum(document.getElementById('fsimReforco').value);
  var valorChave = parseBRLnum(document.getElementById('fsimValorChave').value);

  var c = calcularSimulacao({
    preco:preco, renda:renda, fgtsValor:fgtsValor, entradaManual:entradaManual,
    atoEntrada:atoEntrada, parcelasObra:parcelasObra, reforcoDez:reforcoDez, valorChave:valorChave,
    construtora:FSIM_CONSTRUTORA
  });
  FSIM_LAST = c;

  var verdictEl = document.getElementById('fsimVerdict');
  if(verdictEl) verdictEl.innerHTML = fsimVerdictHTML(c);

  var out = ''
    +'<div class="sim-out-card hl"><div class="l">Financiamento estimado ('+(c.mod==='sbpe'?'SBPE':'MCMV')+')</div><div class="v">'+fmtBRL(c.financiado)+'</div></div>'
    +'<div class="sim-out-card"><div class="l">Entrada total</div><div class="v">'+fmtBRL(c.entrada)+'</div></div>';
  out += '<div class="sim-out-card" style="grid-column:1/-1;background:linear-gradient(90deg,#fbf7ee,#fdf9ef);border:1.5px solid #b8873a;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">'
    +'<div><div class="l" style="color:#0f2e36">Compre este imóvel de '+fmtBRL(c.preco)+' sem sair de casa</div>'
    +'<div style="font-size:11.5px;color:#6b7280;margin-top:3px;font-weight:400">Aprovação Expressa: documentação, análise e assinatura 100% online — funciona pra imóveis em obras ou já prontos.</div></div>'
    +'<a href="aprovacao-expressa.html" style="background:#b8873a;color:#fff;font-size:12px;font-weight:700;padding:9px 16px;border-radius:8px;text-decoration:none;white-space:nowrap;flex-shrink:0">Ver como funciona →</a></div>';
  if(c.atoEntrada>0) out += '<div class="sim-out-card"><div class="l">Pago no ato da assinatura</div><div class="v">'+fmtBRL(c.atoEntrada)+'</div></div>';
  if(c.valorChave>0) out += '<div class="sim-out-card"><div class="l">Abatido com valor na entrega das chaves</div><div class="v">'+fmtBRL(c.valorChave)+'</div></div>';
  out += '<div class="sim-out-card"><div class="l">Parcelável sem juros na obra (até 20%)</div><div class="v">'+fmtBRL(c.parcelavelObra)+'</div></div>'
    +'<div class="sim-out-card" style="position:relative"><span style="position:absolute;top:-9px;right:10px;background:#3E8E5A;color:#fff;font-size:9px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:3px 9px;border-radius:20px;box-shadow:0 3px 8px rgba(62,142,90,.35)">Sem juros</span><div class="l">Por mês, até a entrega das chaves ('+c.parcelasObra+'x)</div><div class="v">'+fmtBRL(c.parcelaObraMensal)+'</div></div>';
  if(c.fgtsAplicado>0) out += '<div class="sim-out-card"><div class="l">FGTS aplicado</div><div class="v">'+fmtBRL(c.fgtsAplicado)+'</div></div>';
  if(c.temPosChaves){
    out += '<div class="sim-out-card hl"><div class="l">Parcelamento pós-chaves ('+c.maxParcelasPosChaves+'x)</div><div class="v">'+fmtBRL(c.parcelaPosChaves)+'</div></div>';
  } else if(!c.semEntradaAVista){
    out += '<div class="sim-out-card sim-warn"><div class="l">Entrada à vista necessária</div><div class="v">'+fmtBRL(c.aVistaFinal)+'</div></div>';
  }
  document.getElementById('fsimOut').innerHTML = out;

  var note = '<span style="display:block;margin-bottom:8px">Essa parcela mensal <strong>não é um financiamento extra nem um segundo empréstimo</strong> — é só o jeito de dividir a sua própria entrada em partes menores, sem juros, até a entrega das chaves.</span>';
  if(c.semEntradaAVista && !c.temPosChaves){
    note += '<strong>Sua entrada cabe inteira dentro dos 20% do valor do imóvel</strong>, parcelada sem juros em '+c.parcelasObra+'x durante a obra. ';
  } else if(c.temPosChaves){
    var constNome = c.mrv?'MRV':(c.vivaz?'Direcional · Vivaz':'Vitale');
    note += '<strong>'+constNome+' permite estender o que passar dos 20% parceláveis</strong> para depois da entrega das chaves, em até '+c.maxParcelasPosChaves+'x — por isso você não precisa de entrada à vista aqui. ';
  } else {
    note += 'Sua entrada passa dos 20% do imóvel que podem ser parcelados sem juros na obra ('+fmtBRL(c.limite20)+'). O que exceder — '+fmtBRL(c.aVistaFinal)+' — precisa ser pago à vista na assinatura'+(c.fgtsAplicado>0?' mesmo depois de usar o FGTS':'')+(c.mrv||c.vivaz||c.vitale?'':'. Construtoras como MRV, Direcional/Vivaz e Vitale costumam estender esse valor para pós-chaves — vale perguntar ao Paulo se surgiu uma condição assim para este empreendimento')+'. ';
  }
  if(c.totalReforcos>0){
    note += 'Considerado reforço de '+fmtBRL(c.reforcoDez)+' em cada dezembro, reduzindo a parcela mensal da obra. ';
  }
  note += 'Na entrega das chaves, para a parcela caber na sua renda, o ideal é não passar de <strong>'+fmtBRL(c.parcelaChavesMax)+'/mês</strong> (30% de '+fmtBRL(c.renda)+'), equivalente a até <strong>'+fmtBRL(c.valorChavesMax12x)+'</strong> em 12x. ';
  note += '<br><span style="opacity:.85">Simulação educativa com base no valor informado ('+fmtBRL(c.preco)+') — a prestação real do financiamento e as condições finais são calculadas pela Caixa/banco na Aprovação Expressa com o Paulo.</span>';
  document.getElementById('fsimNote').innerHTML = note;

  var planoEl = document.getElementById('fsimPlanoStatus');
  if(planoEl){
    var planoParts = [];
    if(c.atoEntrada>0) planoParts.push('<div class="row" style="display:flex;justify-content:space-between;padding:6px 0;font-size:12.5px"><span style="color:var(--gray)">Ato de entrada (assinatura)</span><b>'+fmtBRL(c.atoEntrada)+'</b></div>');
    planoParts.push('<div class="row" style="display:flex;justify-content:space-between;padding:6px 0;font-size:12.5px"><span style="color:var(--gray)">'+c.parcelasObra+'x parcelas mensais na obra</span><b>'+fmtBRL(c.parcelaObraMensal)+'/mês</b></div>');
    if(c.totalReforcos>0) planoParts.push('<div class="row" style="display:flex;justify-content:space-between;padding:6px 0;font-size:12.5px"><span style="color:var(--gray)">Reforços de dezembro</span><b>'+fmtBRL(c.reforcoDez)+'/ano</b></div>');
    if(c.valorChave>0) planoParts.push('<div class="row" style="display:flex;justify-content:space-between;padding:6px 0;font-size:12.5px"><span style="color:var(--gray)">Na entrega das chaves</span><b>'+fmtBRL(c.valorChave)+'</b></div>');
    if(c.temPosChaves) planoParts.push('<div class="row" style="display:flex;justify-content:space-between;padding:6px 0;font-size:12.5px"><span style="color:var(--gray)">Pós-chaves ('+c.maxParcelasPosChaves+'x)</span><b>'+fmtBRL(c.parcelaPosChaves)+'/mês</b></div>');
    else if(!c.semEntradaAVista) planoParts.push('<div class="row" style="display:flex;justify-content:space-between;padding:6px 0;font-size:12.5px;color:#b91c1c"><span>Ainda falta cobrir (à vista)</span><b>'+fmtBRL(c.aVistaFinal)+'</b></div>');

    var statusBox = '';
    if(c.acimaDoTeto){
      statusBox = '<div style="margin-top:12px;padding:12px 14px;background:#fef3c7;border-radius:10px;font-size:12px;color:#92400e;display:flex;gap:9px;align-items:flex-start">'
        +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>'
        +'<span>A parcela mensal está em <strong>'+fmtBRL(c.parcelaObraMensal)+'</strong> — acima do teto de <strong>R$ 1.500</strong>. Aumente o número de meses, o ato de entrada ou o reforço de dezembro, ou clique em "Montar automaticamente".</span></div>';
    } else {
      statusBox = '<div style="margin-top:12px;padding:10px 14px;background:#f0fdf4;border-radius:10px;font-size:12px;color:#15803d;display:flex;gap:8px;align-items:center">'
        +'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>'
        +'<span>Plano fechado — parcela mensal dentro do teto de R$ 1.500.</span></div>';
    }
    planoEl.innerHTML = '<div style="display:flex;flex-direction:column">'+planoParts.join('')+'</div>'+statusBox;
  }

  var suggEl = document.getElementById('fsimSugg');
  if(suggEl) suggEl.innerHTML = fsimSugestoesHTML(FSIM_NOME, c.preco);
}

function fsimMontarAuto(){
  var precoEl = document.getElementById('fsimPreco');
  var preco = precoEl ? parseBRLnum(precoEl.value) : 0;
  if(preco<=0) return;
  var renda = parseBRLnum(document.getElementById('fsimRenda').value);
  var fgtsChk = document.getElementById('fsimFgts');
  var fgtsBox = document.getElementById('fsimFgtsValor');
  var fgtsValor = (fgtsChk && fgtsChk.checked) ? parseBRLnum(fgtsBox.value) : 0;
  var entradaInput = document.getElementById('fsimEntrada').value;
  var entradaManual = entradaInput.trim()!=='' ? Math.max(0,parseBRLnum(entradaInput)) : 0;
  var atoAtual = parseBRLnum(document.getElementById('fsimAto').value);
  var valorChave = parseBRLnum(document.getElementById('fsimValorChave').value);

  // roda uma simulação base (sem parcelas ainda) só pra saber o valor a distribuir
  var base = calcularSimulacao({preco:preco, renda:renda, fgtsValor:fgtsValor, entradaManual:entradaManual, atoEntrada:atoAtual, valorChave:valorChave, parcelasObra:1, reforcoDez:0, construtora:FSIM_CONSTRUTORA});
  var alvo = base.parcelavelObra;
  var sugestao = fsimSugerirPlano(preco, alvo, 120);

  document.getElementById('fsimParcelas').value = sugestao.meses;
  document.getElementById('fsimReforco').value = sugestao.reforco>0 ? Math.ceil(sugestao.reforco).toString() : '';
  fsimUpdate();
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

function fsimShare(btn,nome){
  var c=FSIM_LAST;
  var txt=c?('Simulei o financiamento de '+nome+' com o Paulo Cotrim — financiamento estimado '+fmtBRL(c.financiado)+', entrada '+fmtBRL(c.entrada)+'. Dá uma olhada:'):('Simulei o financiamento de '+nome+' com o Paulo Cotrim — dá uma olhada:');
  if(navigator.share){
    navigator.share({title:'Simulação — '+nome,text:txt,url:location.href}).catch(function(){});
  }else if(navigator.clipboard){
    navigator.clipboard.writeText(location.href).then(function(){
      if(btn){var orig=btn.innerHTML;btn.innerHTML='Link copiado!';setTimeout(function(){btn.innerHTML=orig;},2200);}
    }).catch(function(){});
  }
}
function fsimDownload(nome){
  var c = FSIM_LAST;
  var incluirSim = !!c;
  var _dataGer = new Date().toLocaleDateString('pt-BR');
  var url = window.location.href;
  var waMsg = 'Ol\u00e1 Paulo! Baixei o resumo em PDF do '+nome+' e quero continuar a conversa.';
  var waLink = 'https://wa.me/5521989150864?text='+encodeURIComponent(waMsg);
  var qr = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(waLink);
  var simRows = '';
  if(incluirSim){
    simRows = ''
      +'<div class="row"><span class="rk">Valor simulado</span><span class="rv">'+fmtBRL(c.preco)+'</span></div>'
      +'<div class="row"><span class="rk">Financiamento estimado</span><span class="rv">'+fmtBRL(c.financiado)+'</span></div>'
      +'<div class="row"><span class="rk">Entrada total</span><span class="rv">'+fmtBRL(c.entrada)+'</span></div>'
      +(c.atoEntrada>0?'<div class="row"><span class="rk">Ato de entrada (assinatura)</span><span class="rv">'+fmtBRL(c.atoEntrada)+'</span></div>':'')
      +'<div class="row"><span class="rk">Parcelável na obra</span><span class="rv">'+fmtBRL(c.parcelavelObra)+' em '+c.parcelasObra+'x de '+fmtBRL(c.parcelaObraMensal)+'/mês</span></div>'
      +(c.totalReforcos>0?'<div class="row"><span class="rk">Reforço de dezembro</span><span class="rv">'+fmtBRL(c.reforcoDez)+'/ano</span></div>':'')
      +(c.valorChave>0?'<div class="row"><span class="rk">Na entrega das chaves</span><span class="rv">'+fmtBRL(c.valorChave)+'</span></div>':'')
      +(c.temPosChaves?'<div class="row"><span class="rk">Pós-chaves</span><span class="rv">'+c.maxParcelasPosChaves+'x de '+fmtBRL(c.parcelaPosChaves)+'/mês</span></div>':'')
      +'<div class="row" style="border-bottom:none;padding-top:14px"><span class="rk" style="font-weight:700;color:#0f2e36">Total pago por mês até as chaves</span><span class="rv" style="color:#b8873a;font-size:15px">'+fmtBRL(c.parcelaObraMensal)+'</span></div>';
  }
  var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Resumo — '+nome+'</title>'
    +'<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">'
    +'<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;color:#0f2e36;background:#fff;padding:44px;max-width:680px;margin:0 auto}'
    +'h1{font-family:Fraunces,serif;font-size:24px;margin-bottom:4px}.sub{font-size:12px;color:#6b7280;margin-bottom:28px}'
    +'.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e8eaed;font-size:14px}.rk{color:#6b7280}.rv{font-weight:600}'
    +'.note{font-size:11.5px;color:#6b7280;margin-top:18px;line-height:1.7;background:#e7edee;padding:14px 16px;border-radius:10px}'
    +'.legal{font-size:10.5px;color:#94a3b8;margin-top:14px;line-height:1.7;padding:14px 16px;border:1px solid #e8eaed;border-radius:10px}'
    +'.fases{display:flex;gap:6px;margin-top:16px}.fase{flex:1;text-align:center}'
    +'.fase-bar{height:6px;border-radius:6px;background:#e8eaed;margin-bottom:6px}.fase-bar.on{background:linear-gradient(90deg,#b8873a,#cf9f4f)}'
    +'.fase span{font-size:10px;color:#6b7280;font-weight:600}'
    +'.qrbox{display:flex;align-items:center;gap:16px;margin-top:28px;padding-top:20px;border-top:1px solid #e8eaed}'
    +'.qrbox img{width:110px;height:110px}.qrbox div{font-size:12px;color:#6b7280}.qrbox b{display:block;color:#0f2e36;font-size:13.5px;margin-bottom:4px}'
    +'.brandbar{display:flex;align-items:center;gap:10px;margin-top:24px;padding-top:16px;border-top:1px solid #e8eaed}'
    +'.brandbar b{font-size:13px;color:#0f2e36}.brandbar span{font-size:11.5px;color:#6b7280;display:block}'
    +'.foot{margin-top:24px;font-size:10.5px;color:#94a3b8;text-align:center}'
    +'.wm{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:-1}'
    +'.wm div{position:absolute;left:-20%;width:140%;text-align:center;transform:rotate(-27deg);font-family:Inter,sans-serif;font-weight:800;font-size:12.5px;letter-spacing:.16em;color:rgba(15,46,54,.055);white-space:nowrap}'
    +'.pdf-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}'
    +'.pdf-head img{height:24px;display:block}'
    +'.gendate{font-size:10.5px;color:#94a3b8}'
    +'@media print{body{padding:20px}}</style></head><body>'
    +'<div class="wm" aria-hidden="true">'
    +'<div style="top:-40px">PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR</div>'
    +'<div style="top:70px">PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR</div>'
    +'<div style="top:180px">PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR</div>'
    +'<div style="top:290px">PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR</div>'
    +'<div style="top:400px">PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR</div>'
    +'<div style="top:510px">PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR</div>'
    +'<div style="top:620px">PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR &nbsp;&nbsp;&nbsp; PAULO COTRIM \u00b7 PAULOCOTRIM.COM.BR</div>'
    +'</div>'
    +'<div class="pdf-head"><img src="https://corretorpaulocotrim.github.io/site-oficial/logo-wordmark.png" alt="Paulo Cotrim"/><span class="gendate">Gerado em '+_dataGer+'</span></div>'
    +'<h1>'+nome+'</h1><div class="sub">Resumo do empreendimento · Paulo Cotrim · CRECI-RJ 77677-F</div>'
    +'<div class="row"><span class="rk">Construtora</span><span class="rv">'+FSIM_CONSTRUTORA+'</span></div>'
    +'<div class="row"><span class="rk">Localização</span><span class="rv">'+FSIM_BAIRRO+'</span></div>'
    + simRows
    +(incluirSim?(''
      +'<div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-top:20px;margin-bottom:4px">Previsão de fase de obra até as chaves</div>'
      +'<div class="fases">'
        +'<div class="fase"><div class="fase-bar on"></div><span>Fundação</span></div>'
        +'<div class="fase"><div class="fase-bar on"></div><span>Estrutura</span></div>'
        +'<div class="fase"><div class="fase-bar'+(c.parcelasObra>=12?' on':'')+'"></div><span>Acabamento</span></div>'
        +'<div class="fase"><div class="fase-bar'+(c.parcelasObra>=24?' on':'')+'"></div><span>Entrega</span></div>'
      +'</div>'
      +'<div style="font-size:10.5px;color:#9ca3af;margin-top:6px">Estimativa educativa com base no prazo informado ('+c.parcelasObra+' meses) — o cronograma real de obra é definido e atualizado pela construtora.</div>'
    ):'')
    +'<div class="note">Valores de tabela pública e simulação educativa — sujeitos a alteração e disponibilidade. Confirme condições atualizadas com Paulo antes de decidir.</div>'
    +(FSIM_APRESENTACAO?'<div class="row"><span class="rk">Apresentação completa</span><span class="rv">'+window.location.origin+window.location.pathname.replace(/[^/]*$/,'')+'apresentacoes/'+FSIM_APRESENTACAO+'</span></div>':'')
    +'<div class="qrbox"><img src="'+qr+'" alt="QR code do WhatsApp"/><div><b>Fale agora com o Paulo</b>Escaneie para abrir o WhatsApp direto com o Paulo Cotrim sobre este resumo.</div></div>'
    +'<div class="brandbar"><div><b>Paulo Cotrim</b><span>CRECI-RJ 77677-F · corretorpaulocotrim@gmail.com · (21) 98915-0864</span></div></div>'
    +'<div class="legal">Documento meramente informativo e educativo, sem valor contratual. Valores, prazos, condições de pagamento e disponibilidade de unidades são de responsabilidade da construtora/incorporadora e da instituição financeira, podendo ser alterados sem aviso prévio. A aprovação de crédito depende de análise cadastral própria do agente financeiro. Consulte sempre a tabela oficial atualizada e formalize as condições finais com Paulo Cotrim antes de tomar qualquer decisão.</div>'
    +'<div class="foot">Paulo Cotrim · CRECI-RJ 77677-F · Especialista em Financiamento Imobiliário · paulocotrim.com</div>'
    +'</body></html>';
  var win=window.open('','_blank');
  if(win){win.document.write(html);win.document.close();win.focus();setTimeout(function(){win.print();},350);}
}

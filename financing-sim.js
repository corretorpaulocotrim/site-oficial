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
      +'<span style="display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#1a8f4c;background:rgba(26,143,76,.1);padding:3px 9px;border-radius:20px;margin-bottom:9px">Dentro do orçamento</span>'
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
var FSIM_LAST = null, FSIM_NOME='', FSIM_CONSTRUTORA='', FSIM_BAIRRO='', FSIM_APRESENTACAO='';

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

/* ---------- PLANTAS REAIS: extraidas das apresentacoes oficiais das construtoras ---------- */
var PLANTAS_REAIS = {
  "emp-primor-carioca.html": [
    {img:"plantas/primor-carioca-apto112.png", label:"Apto 112 · Torre 02 · 2 quartos"},
    {img:"plantas/primor-carioca-apto110.png", label:"Apto 110 · Torre 02 · 2 quartos"}
  ],
  "emp-ctv-beat.html": [
    {img:"plantas/ctv-beat-tipo02.jpg", label:"Apartamento Tipo 02 · 2 quartos · 46,95m²"},
    {img:"plantas/ctv-beat-cobertura01.jpg", label:"Cobertura Tipo 01 · 2 quartos duplex · até 93,30m²"}
  ],
  "emp-village-caribe.html": [
    {img:"plantas/caribe-tipo-padrao.jpg", label:"Tipo padrão · Quarto + suíte · 60,99 a 61,35m²"},
    {img:"plantas/caribe-cobertura.jpg", label:"Cobertura duplex · Quarto + suíte · até 126,74m²"}
  ],
  "emp-ctv-vitoria.html": [
    {img:"plantas/vitoria-tipo01.jpg", label:"Apartamento Tipo 01 · 2 quartos · 57,04 a 57,45m²"},
    {img:"plantas/vitoria-cobertura01.jpg", label:"Cobertura 01 + Dependência · Terraço 35,20m² · até 114,90m²"}
  ],
  "emp-vivaz-connection.html": [
    {img:"plantas/vivazconn-2q.jpg", label:"2 quartos · 37,55m²"},
    {img:"plantas/vivazconn-1q.jpg", label:"1 quarto (suíte) · 37,55m²"}
  ],
  "parque-piedade.html": [
    {img:"plantas/piedade-planta1.jpg", label:"Pavimento Térreo · 2 quartos com Garden"},
    {img:"plantas/piedade-planta2.jpg", label:"Pavimento Tipo · 2 quartos com varanda"}
  ],
  "emp-saudosa-praca-onze.html": [
    {img:"plantas/saudosa-planta1.jpg", label:"Apartamento Tipo · 2 dormitórios"},
    {img:"plantas/saudosa-planta2.jpg", label:"Studio com varanda"}
  ],
  "farol-da-guanabara.html": [
    {img:"plantas/farol-planta1.jpg", label:"Apartamento Tipo · 1 quarto com varanda"},
    {img:"plantas/farol-planta2.jpg", label:"Studio com varanda"}
  ],
  "arcos-do-porto.html": [
    {img:"plantas/arcos-planta1.jpg", label:"Apartamento Tipo · 1 quarto com varanda"},
    {img:"plantas/arcos-planta2.jpg", label:"Studio com varanda"}
  ],
  "orla-central.html": [
    {img:"plantas/orla-planta1.jpg", label:"Apartamento Tipo · 1 quarto com varanda"},
    {img:"plantas/orla-planta2.jpg", label:"Apartamento Tipo · 2 quartos com varanda"}
  ],
  "luzes-do-rio-lamparina.html": [
    {img:"plantas/lamparina-planta1.jpg", label:"Apartamento Tipo · 2 quartos com suíte"},
    {img:"plantas/lamparina-planta2.jpg", label:"Apartamento Tipo · 1 quarto com varanda"}
  ],
  "luzes-do-rio-candeeiro.html": [
    {img:"plantas/candeeiro-planta1.jpg", label:"Apartamento Tipo · 1 quarto com varanda"},
    {img:"plantas/candeeiro-planta2.jpg", label:"Apartamento Tipo · 2 quartos com suíte"}
  ],
  "cartola-ii.html": [
    {img:"plantas/cartola2-planta1.jpg", label:"Apartamento Tipo · 1 quarto com varanda"},
    {img:"plantas/cartola2-planta2.jpg", label:"Apartamento Tipo · 2 quartos com varanda"}
  ],
  "caminhos-da-guanabara.html": [
    {img:"plantas/caminhos-planta1.jpg", label:"Apartamento Tipo · 2 quartos com suíte"},
    {img:"plantas/caminhos-planta2.jpg", label:"Apartamento Tipo · 1 quarto com varanda"}
  ]
};

function fsimPlantasHTML(entry){
  var slug = (entry && entry.url) || '';
  var reais = PLANTAS_REAIS[slug];
  if(reais && reais.length){
    return '<div class="plantas-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">'
      + reais.map(function(p){
          return '<div style="background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(15,46,54,.05)">'
            + '<img src="'+p.img+'" alt="'+p.label+'" loading="lazy" style="width:100%;height:auto;display:block;cursor:zoom-in" onclick="window.open(this.src,\'_blank\')"/>'
            + '<div style="padding:10px 14px;font-size:12.5px;font-weight:600;color:var(--ink)">'+p.label+'</div>'
            + '</div>';
        }).join('')
      + '</div>'
      + '<p style="font-size:11px;color:var(--gray);margin-top:10px">Plantas de divulgação oficial da construtora — imagem ilustrativa, sujeita a alterações no memorial descritivo.</p>';
  }
  return '<div style="background:var(--mist);border:1px dashed var(--line);border-radius:14px;padding:28px 24px;text-align:center;max-width:520px;margin:0 auto">'
    + '<div style="font-size:14.5px;font-weight:600;color:var(--ink);margin-bottom:6px">Plantas em atualização</div>'
    + '<p style="font-size:13px;color:var(--gray);line-height:1.6;margin-bottom:16px">Ainda não recebi as plantas oficiais deste empreendimento da construtora. Me chama no WhatsApp que eu te envio assim que estiverem disponíveis — ou já te mando a planta-base semelhante de outro imóvel da mesma faixa.</p>'
    + '<a href="https://wa.me/5521989150864?text='+encodeURIComponent('Olá! Quero receber as plantas do imóvel que vi no seu site.')+'" target="_blank" style="display:inline-flex;align-items:center;gap:7px;background:var(--gold);color:#fff;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none">Pedir plantas pelo WhatsApp</a>'
    + '</div>';
}

function fsimInjectPlantas(){
  try{
    var anchor = document.getElementById('related-empreendimentos');
    if(!anchor) return;
    var parentSection = anchor.closest('section');
    if(!parentSection || document.getElementById('fsimPlantasSection')) return;
    var slug = anchor.getAttribute('data-slug') || '';
    var entry = null;
    for(var i=0;i<FSIM_CATALOG.length;i++){ if(FSIM_CATALOG[i].url === slug){ entry = FSIM_CATALOG[i]; break; } }
    var nomeAtual = entry ? entry.nome : (document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : 'este imóvel');
    var sec = document.createElement('section');
    sec.className = 'section';
    sec.id = 'fsimPlantasSection';
    sec.innerHTML = ''
      + '<div class="wrap">'
      + '  <div class="eyebrow reveal">Plantas</div>'
      + '  <h2 class="stitle display reveal" style="margin-bottom:20px">Plantas do '+nomeAtual+'</h2>'
      + '  ' + fsimPlantasHTML({url: slug})
      + '</div>';
    parentSection.parentNode.insertBefore(sec, parentSection);
  }catch(e){}
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', fsimInjectPlantas);
} else {
  fsimInjectPlantas();
}


/* i18n.js — Bandeiras PT/EN/ES/IT. Ao clicar: muda idioma, moeda (BRL/USD/EUR)
   e aplica as duas cores nacionais como acento (faixa no topo + leve tom),
   mantendo a base premium. Nomes próprios, @handles e números permanecem. */
(function(){
  var LS='pc_lang';
  var CONF={
    pt:{loc:'pt-BR', ccy:'BRL', sym:'R$', flag:'br', c1:'#009c3b', c2:'#ffdf00', name:'Português'},
    en:{loc:'en',    ccy:'USD', sym:'US$', flag:'us', c1:'#3c3b6e', c2:'#b22234', name:'English'},
    es:{loc:'es',    ccy:'EUR', sym:'€',  flag:'es', c1:'#c60b1e', c2:'#ffc400', name:'Español'},
    it:{loc:'it',    ccy:'EUR', sym:'€',  flag:'it', c1:'#008c45', c2:'#cd212a', name:'Italiano'}
  };
  var FLAG={
    br:'<svg viewBox="0 0 28 20"><rect width="28" height="20" fill="#009c3b"/><path d="M14 3l11 7-11 7L3 10z" fill="#ffdf00"/><circle cx="14" cy="10" r="4" fill="#002776"/></svg>',
    us:'<svg viewBox="0 0 28 20"><rect width="28" height="20" fill="#fff"/><g fill="#b22234"><rect width="28" height="2.2" y="0"/><rect width="28" height="2.2" y="4.4"/><rect width="28" height="2.2" y="8.8"/><rect width="28" height="2.2" y="13.2"/><rect width="28" height="2.2" y="17.6"/></g><rect width="12" height="11" fill="#3c3b6e"/></svg>',
    es:'<svg viewBox="0 0 28 20"><rect width="28" height="20" fill="#c60b1e"/><rect width="28" height="10" y="5" fill="#ffc400"/></svg>',
    it:'<svg viewBox="0 0 28 20"><rect width="28" height="20" fill="#fff"/><rect width="9.33" height="20" fill="#008c45"/><rect width="9.33" height="20" x="18.66" fill="#cd212a"/></svg>'
  };
  var D={
   "Paulo Cotrim · 18 anos no mercado do Rio":{en:"Paulo Cotrim · 18 years in the Rio market",es:"Paulo Cotrim · 18 años en el mercado de Río",it:"Paulo Cotrim · 18 anni nel mercato di Rio"},
   "Não vendo um apartamento. Ajudo você a decidir.":{en:"I don't sell apartments. I help you decide.",es:"No vendo un apartamento. Te ayudo a decidir.",it:"Non vendo un appartamento. Ti aiuto a decidere."},
   "Comparo preço por m², financiamento e rentabilidade de cada lançamento — de Ipanema e Leblon à Barra — para você comprar certo, com números na mão e sem sair de casa.":{en:"I compare price per m², financing and rental yield for every new development — from Ipanema and Leblon to Barra — so you buy right, with real numbers, from anywhere in the world.",es:"Comparo precio por m², financiación y rentabilidad de cada lanzamiento — de Ipanema y Leblon a Barra — para que compres bien, con números reales y sin salir de casa.",it:"Confronto prezzo al m², finanziamento e rendimento di ogni nuova costruzione — da Ipanema e Leblon a Barra — perché tu compri bene, con numeri reali e senza muoverti da casa."},
   "Buscar imóvel":{en:"Search property",es:"Buscar propiedad",it:"Cerca immobile"},
   "Quero morar":{en:"I want to live",es:"Quiero vivir",it:"Voglio viverci"},
   "Quero lucrar":{en:"I want to invest",es:"Quiero invertir",it:"Voglio investire"},
   "Prontos":{en:"Ready to move",es:"Listos",it:"Pronti"},
   "Mapa":{en:"Map",es:"Mapa",it:"Mappa"},
   "Investidor":{en:"Investor",es:"Inversor",it:"Investitore"},
   "Sobre":{en:"About",es:"Sobre mí",it:"Chi sono"},
   "Inteligência imobiliária":{en:"Real estate intelligence",es:"Inteligencia inmobiliaria",it:"Intelligenza immobiliare"},
   "Não escolha apenas pelo preço.":{en:"Don't choose by price alone.",es:"No elijas solo por el precio.",it:"Non scegliere solo in base al prezzo."},
   "Todo empreendimento do site tem um estudo de rentabilidade. Você vê o que realmente importa antes de assinar.":{en:"Every development on this site has a rental yield study. You see what really matters before you sign.",es:"Cada emprendimiento del sitio tiene un estudio de rentabilidad. Ves lo que realmente importa antes de firmar.",it:"Ogni progetto del sito ha uno studio di rendimento. Vedi ciò che conta davvero prima di firmare."},
   "Preço por m²":{en:"Price per m²",es:"Precio por m²",it:"Prezzo al m²"},
   "Financiamento":{en:"Financing",es:"Financiación",it:"Finanziamento"},
   "Rentabilidade":{en:"Rental yield",es:"Rentabilidad",it:"Rendimento"},
   "Riscos":{en:"Risks",es:"Riesgos",it:"Rischi"},
   "Ver estudos de rentabilidade":{en:"See yield studies",es:"Ver estudios de rentabilidad",it:"Vedi studi di rendimento"},
   "Em destaque":{en:"Featured",es:"Destacados",it:"In evidenza"},
   "Lançamentos em destaque":{en:"Featured new developments",es:"Lanzamientos destacados",it:"Nuove costruzioni in evidenza"},
   "Imóveis especiais":{en:"Special properties",es:"Propiedades especiales",it:"Immobili speciali"},
   "Escolha pela apresentação":{en:"Choose by presentation",es:"Elige por la presentación",it:"Scegli dalla presentazione"},
   "Todos":{en:"All",es:"Todos",it:"Tutti"},
   "Residências de assinatura":{en:"Signature residences",es:"Residencias de autor",it:"Residenze d'autore"},
   "Primeiro imóvel & financiamento":{en:"First home & financing",es:"Primera vivienda y financiación",it:"Prima casa e finanziamento"},
   "Ver prévia":{en:"Preview",es:"Vista previa",it:"Anteprima"},
   "Rentabilidade →":{en:"Yield →",es:"Rentabilidad →",it:"Rendimento →"},
   "Analisar rentabilidade →":{en:"Analyze yield →",es:"Analizar rentabilidad →",it:"Analizza rendimento →"},
   "Ver imóvel":{en:"View property",es:"Ver propiedad",it:"Vedi immobile"},
   "Falar":{en:"Contact",es:"Contactar",it:"Contatta"},
   "Preço a consultar":{en:"Price on request",es:"Precio a consultar",it:"Prezzo su richiesta"},
   "A consultar":{en:"On request",es:"A consultar",it:"Su richiesta"},
   "Para investidor":{en:"For investors",es:"Para inversores",it:"Per investitori"},
   "Tabela comparativa do investidor":{en:"Investor comparison table",es:"Tabla comparativa del inversor",it:"Tabella comparativa dell'investitore"},
   "Empreendimento":{en:"Development",es:"Emprendimiento",it:"Progetto"},
   "Região":{en:"Region",es:"Región",it:"Zona"},
   "Estágio":{en:"Stage",es:"Etapa",it:"Fase"},
   "A partir de":{en:"From",es:"Desde",it:"Da"},
   "Aluguel est.*":{en:"Est. rent*",es:"Alquiler est.*",it:"Affitto stim.*"},
   "Estudo →":{en:"Study →",es:"Estudio →",it:"Studio →"},
   "Guia completo do investidor →":{en:"Full investor guide →",es:"Guía completa del inversor →",it:"Guida completa dell'investitore →"},
   "Prova real":{en:"Real proof",es:"Prueba real",it:"Prova reale"},
   "Quem já comprou com Paulo Cotrim":{en:"Clients who bought with Paulo Cotrim",es:"Quienes ya compraron con Paulo Cotrim",it:"Chi ha già comprato con Paulo Cotrim"},
   "Agendar visita ou videochamada":{en:"Book a visit or video call",es:"Agendar visita o videollamada",it:"Prenota visita o videochiamata"},
   "Atuações":{en:"Career",es:"Trayectoria",it:"Percorso"},
   "Gerente":{en:"Manager",es:"Gerente",it:"Manager"},
   "Coordenador":{en:"Coordinator",es:"Coordinador",it:"Coordinatore"},
   "Supervisor":{en:"Supervisor",es:"Supervisor",it:"Supervisore"},
   "Corretor":{en:"Broker",es:"Corredor",it:"Agente"},
   "Fechador":{en:"Closer",es:"Cerrador",it:"Closer"},
   "Construtoras com que já atuei":{en:"Developers I have worked with",es:"Constructoras con las que trabajé",it:"Costruttori con cui ho lavorato"},
   "18 anos de mercado":{en:"18 years in the market",es:"18 años de mercado",it:"18 anni di mercato"},
   "Ipanema, Barra e Leblon":{en:"Ipanema, Barra and Leblon",es:"Ipanema, Barra y Leblon",it:"Ipanema, Barra e Leblon"},
   "Ver imóveis →":{en:"View properties →",es:"Ver propiedades →",it:"Vedi immobili →"},
   "O endereço mais valorizado do Rio, entre o mar e a Lagoa.":{en:"Rio's most prized address, between the sea and the Lagoon.",es:"La dirección más valorada de Río, entre el mar y la Laguna.",it:"L'indirizzo più pregiato di Rio, tra il mare e la Laguna."},
   "Praia icônica, cultura e vida a pé na Zona Sul.":{en:"Iconic beach, culture and walkable life in the South Zone.",es:"Playa icónica, cultura y vida a pie en la Zona Sur.",it:"Spiaggia iconica, cultura e vita a piedi nella Zona Sud."},
   "Condomínios completos, orla extensa e lançamentos com lazer de clube.":{en:"Full-service condos, a long shoreline and club-style amenities.",es:"Condominios completos, costa extensa y lanzamientos con ocio de club.",it:"Condomini completi, lungomare esteso e servizi da club."},
   "Com Paulo Cotrim você tem a certeza do melhor negócio.":{en:"With Paulo Cotrim you are sure of the best deal.",es:"Con Paulo Cotrim tienes la certeza del mejor negocio.",it:"Con Paulo Cotrim hai la certezza del miglior affare."},
   "Acesso ao CRM":{en:"CRM access",es:"Acceso al CRM",it:"Accesso al CRM"},
   "Acesso exclusivo do corretor":{en:"Broker-only access",es:"Acceso exclusivo del corredor",it:"Accesso riservato all'agente"},
   "No mapa":{en:"On the map",es:"En el mapa",it:"Sulla mappa"},
   "Onde estão os empreendimentos":{en:"Where the developments are",es:"Dónde están los emprendimientos",it:"Dove sono i progetti"},
   "Comprar":{en:"Buy",es:"Comprar",it:"Comprare"},
   "Lançamentos":{en:"New Developments",es:"Lanzamientos",it:"Nuove Costruzioni"},
   "Alto Padrão":{en:"Luxury",es:"Alto Standing",it:"Alto Livello"},
   "Bairros":{en:"Neighborhoods",es:"Barrios",it:"Quartieri"},
   "Sobre Paulo":{en:"About Paulo",es:"Sobre Paulo",it:"Chi è Paulo"},
   "Contato":{en:"Contact",es:"Contacto",it:"Contatti"},
   "Consultoria · Alto Padrão":{en:"Consultancy · Luxury",es:"Consultoría · Alto Standing",it:"Consulenza · Alto Livello"},
   "Viver o extraordinário começa pelo endereço.":{en:"Living the extraordinary begins with the address.",es:"Vivir lo extraordinario empieza por la dirección.",it:"Vivere lo straordinario comincia dall'indirizzo."},
   "Uma curadoria imobiliária para quem busca exclusividade, arquitetura e novas perspectivas de viver no Rio de Janeiro.":{en:"A curated real estate selection for those seeking exclusivity, architecture and new perspectives on living in Rio de Janeiro.",es:"Una curaduría inmobiliaria para quienes buscan exclusividad, arquitectura y nuevas perspectivas de vivir en Río de Janeiro.",it:"Una selezione immobiliare curata per chi cerca esclusività, architettura e nuove prospettive di vita a Rio de Janeiro."},
   "Explorar imóveis":{en:"Explore properties",es:"Explorar propiedades",it:"Esplora gli immobili"},
   "Atendimento personalizado":{en:"Personalized service",es:"Atención personalizada",it:"Servizio personalizzato"},
   "Role para descobrir":{en:"Scroll to discover",es:"Desliza para descubrir",it:"Scorri per scoprire"},
   "Bairro":{en:"Neighborhood",es:"Barrio",it:"Quartiere"},
   "Tipo":{en:"Type",es:"Tipo",it:"Tipo"},
   "Quartos":{en:"Bedrooms",es:"Habitaciones",it:"Camere"},
   "Faixa de investimento":{en:"Investment range",es:"Rango de inversión",it:"Fascia d'investimento"},
   "Buscar":{en:"Search",es:"Buscar",it:"Cerca"},
   "Todos":{en:"All",es:"Todos",it:"Tutti"},
   "Apartamento":{en:"Apartment",es:"Apartamento",it:"Appartamento"},
   "Cobertura":{en:"Penthouse",es:"Ático",it:"Attico"},
   "Casa em condomínio":{en:"Gated house",es:"Casa en condominio",it:"Villa in complesso"},
   "Lançamento":{en:"New development",es:"Lanzamiento",it:"Nuova costruzione"},
   "Pronto":{en:"Ready to move",es:"Listo",it:"Pronto"},
   "Indiferente":{en:"Any",es:"Indiferente",it:"Indifferente"},
   "A consultar":{en:"On request",es:"A consultar",it:"Su richiesta"},
   "Curadoria":{en:"Curation",es:"Curaduría",it:"Selezione"},
   "Imóveis selecionados":{en:"Selected properties",es:"Propiedades seleccionadas",it:"Immobili selezionati"},
   "Ver seleção completa":{en:"See full selection",es:"Ver selección completa",it:"Vedi selezione completa"},
   "Alto padrão · Orla":{en:"Luxury · Beachfront",es:"Alto standing · Frente al mar",it:"Alto livello · Lungomare"},
   "Alto padrão · Lançamento":{en:"Luxury · New development",es:"Alto standing · Lanzamiento",it:"Alto livello · Nuova costruzione"},
   "Exclusivo · À beira da lagoa":{en:"Exclusive · Lakeside",es:"Exclusivo · Frente a la laguna",it:"Esclusivo · Sul lago"},
   "Alto padrão à beira-mar, na orla da Barra, com assinatura internacional de design.":{en:"Beachfront luxury on the Barra shoreline, with international design signature.",es:"Alto standing frente al mar en la orla de Barra, con firma internacional de diseño.",it:"Lusso fronte mare sul litorale di Barra, con firma internazionale di design."},
   "Assinatura de design e plantas amplas na Barra, para quem busca metragem generosa.":{en:"Design signature and spacious layouts in Barra, for those seeking generous floor areas.",es:"Firma de diseño y plantas amplias en Barra, para quienes buscan gran superficie.",it:"Firma di design e planimetrie ampie a Barra, per chi cerca grandi metrature."},
   "Exclusividade em um dos endereços mais valorizados da Barra, à beira da lagoa.":{en:"Exclusivity at one of Barra's most prized addresses, by the lagoon.",es:"Exclusividad en una de las direcciones más valoradas de Barra, junto a la laguna.",it:"Esclusività in uno degli indirizzi più pregiati di Barra, sulla laguna."},
   "Localização":{en:"Location",es:"Ubicación",it:"Posizione"},
   "Regiões exclusivas":{en:"Exclusive areas",es:"Zonas exclusivas",it:"Zone esclusive"},
   "Explorar →":{en:"Explore →",es:"Explorar →",it:"Esplora →"},
   "Arquitetura contemporânea, condomínios exclusivos e uma nova dimensão de conforto.":{en:"Contemporary architecture, exclusive condominiums and a new dimension of comfort.",es:"Arquitectura contemporánea, condominios exclusivos y una nueva dimensión de confort.",it:"Architettura contemporanea, condomini esclusivi e una nuova dimensione di comfort."},
   "Endereços reconhecidos pela localização e pela integração com a vida carioca.":{en:"Addresses renowned for their location and their integration with carioca life.",es:"Direcciones reconocidas por su ubicación y su integración con la vida carioca.",it:"Indirizzi noti per la posizione e l'integrazione con la vita carioca."},
   "Um estilo de vida que combina sofisticação, cultura e a proximidade do mar.":{en:"A lifestyle blending sophistication, culture and the closeness of the sea.",es:"Un estilo de vida que combina sofisticación, cultura y la cercanía del mar.",it:"Uno stile di vita che unisce raffinatezza, cultura e la vicinanza del mare."},
   "Consultor":{en:"Advisor",es:"Asesor",it:"Consulente"},
   "Cada imóvel representa uma escolha de vida — e uma decisão patrimonial.":{en:"Every property is a life choice — and a wealth decision.",es:"Cada propiedad representa una elección de vida — y una decisión patrimonial.",it:"Ogni immobile è una scelta di vita — e una decisione patrimoniale."},
   "Conhecer meu trabalho":{en:"Discover my work",es:"Conocer mi trabajo",it:"Scopri il mio lavoro"},
   "Seu próximo imóvel merece uma escolha personalizada.":{en:"Your next home deserves a personalized choice.",es:"Su próxima propiedad merece una elección personalizada.",it:"Il tuo prossimo immobile merita una scelta su misura."},
   "Converse com Paulo Cotrim":{en:"Talk to Paulo Cotrim",es:"Hable con Paulo Cotrim",it:"Parla con Paulo Cotrim"},
   "Navegar":{en:"Navigate",es:"Navegar",it:"Naviga"},
   "Consultoria imobiliária de alto padrão":{en:"Luxury real estate consultancy",es:"Consultoría inmobiliaria de alto standing",it:"Consulenza immobiliare di alto livello"},
   "ver outras oportunidades":{en:"see other opportunities",es:"ver otras oportunidades",it:"vedi altre opportunità"}
  };
  function walk(cb){
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      var p=n.parentNode; if(!p)return NodeFilter.FILTER_REJECT;
      var t=p.nodeName; if(t==='SCRIPT'||t==='STYLE'||t==='TEXTAREA')return NodeFilter.FILTER_REJECT;
      if(p.closest&&p.closest('#pc-lang'))return NodeFilter.FILTER_REJECT;
      if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    var n; while(n=w.nextNode())cb(n);
  }
  function translate(lang){
    walk(function(n){
      var raw=n.nodeValue, trimmed=raw.trim();
      if(n.__pt===undefined){ if(D[trimmed]) n.__pt=trimmed; else return; }
      var pt=n.__pt, target=(lang==='pt')?pt:((D[pt]&&D[pt][lang])||pt);
      n.nodeValue=raw.replace(trimmed,target);
    });
  }
  function theme(cf){
    var rb=document.getElementById('pc-ribbon');
    if(!rb){rb=document.createElement('div');rb.id='pc-ribbon';
      rb.setAttribute('style','position:fixed;top:0;left:0;right:0;height:4px;z-index:70;pointer-events:none');
      document.body.appendChild(rb);}
    rb.style.background='linear-gradient(90deg,'+cf.c1+' 0 50%,'+cf.c2+' 50% 100%)';
    var wash=document.getElementById('pc-wash');
    if(!wash){wash=document.createElement('div');wash.id='pc-wash';
      wash.setAttribute('style','position:fixed;inset:0;z-index:-1;pointer-events:none');
      document.body.insertBefore(wash,document.body.firstChild);}
    wash.style.background='radial-gradient(60% 50% at 0% 0%,'+cf.c1+'14,transparent 60%),radial-gradient(60% 50% at 100% 100%,'+cf.c2+'12,transparent 60%)';
  }
  function apply(lang){
    var cf=CONF[lang]||CONF.pt;
    CUR=lang;
    translate(lang);
    theme(cf);
    document.documentElement.lang=cf.loc;
    window.PC_CCY={code:cf.ccy,sym:cf.sym,lang:lang};
    try{localStorage.setItem(LS,lang);localStorage.setItem('pc_ccy',cf.ccy);}catch(e){}
    try{document.dispatchEvent(new CustomEvent('pc-ccy',{detail:window.PC_CCY}));}catch(e){}
    var box=document.getElementById('pc-lang');
    if(box)[].forEach.call(box.children,function(b){b.className=(b.dataset.l===lang)?'on':'';});
    if(window.trackEvent)trackEvent('idioma_'+lang,{});
  }
  function ui(){
    if(document.getElementById('pc-lang'))return;
    var box=document.createElement('div'); box.id='pc-lang';
    box.setAttribute('style','position:fixed;top:auto;bottom:18px;left:16px;right:auto;z-index:75;display:flex;gap:4px;background:rgba(26,26,25,.5);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.2);border-radius:100px;padding:4px');
    Object.keys(CONF).forEach(function(l){
      var b=document.createElement('button'); b.dataset.l=l; b.title=CONF[l].name; b.innerHTML=FLAG[CONF[l].flag];
      b.setAttribute('style','border:none;background:none;padding:2px;width:30px;height:22px;border-radius:4px;cursor:pointer;opacity:.55;transition:.2s;overflow:hidden;display:flex');
      b.firstChild.setAttribute('style','width:100%;height:100%;border-radius:3px;display:block');
      b.onclick=function(){apply(l);};
      box.appendChild(b);
    });
    var st=document.createElement('style');
    st.textContent='#pc-lang button.on{opacity:1;box-shadow:0 0 0 2px #b0895b}#pc-lang button:hover{opacity:1}@media(max-width:1024px){#pc-lang{top:auto!important;bottom:84px!important;left:10px!important;right:auto!important;transform:scale(.85);transform-origin:top right}}';
    document.head.appendChild(st);
    document.body.appendChild(box);
  }
  var CUR='pt',tmr;
  function boot(){
    ui();
    try{new MutationObserver(function(){clearTimeout(tmr);tmr=setTimeout(function(){if(CUR!=='pt')translate(CUR);},150);}).observe(document.body,{childList:true,subtree:true});}catch(e){}
    var saved='pt'; try{saved=localStorage.getItem(LS)||'pt';}catch(e){}
    apply(saved);
  }
  if(document.readyState!=='loading')boot(); else document.addEventListener('DOMContentLoaded',boot);
})();

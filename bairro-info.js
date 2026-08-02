/* ============================================================
   BAIRRO-INFO — "No dia a dia do bairro" (dados REAIS pesquisados)
   Transporte · Saúde · Educação · Compras · Lazer & Gastronomia.
   Fontes: SuperVia, MetrôRio, BRT Rio/Motiva, Moovit, Prefeitura do
   Rio, UFRRJ/UENF/UERJ, guias de bairro (ago/2026).
   Chave = trecho do nome do bairro (minúsculo, sem acento).
   Ordem importa: chaves de cidade (niterói, são gonçalo...) antes de
   "centro". Só renderiza o que existe — nunca inventa.
   ============================================================ */
window.BAIRRO_INFO = {
  "santo cristo": {
    transporte: ["VLT Carioca (Linha 2) — paradas Santo Cristo e Gamboa", "Central do Brasil e Rodoviária do Novo Rio a poucos minutos", "Linha Vermelha e Av. Rodrigues Alves"],
    saude: ["Hospital da Gamboa", "Santa Casa e Souza Aguiar (Centro) próximos"],
    educacao: ["Faculdades do Centro a poucos minutos de VLT", "Escolas na Saúde, Gamboa e Centro"],
    compras: ["Comércio do Centro e Praça Mauá", "Supermercados e serviços na Região Portuária"],
    lazer: ["Museu do Amanhã, MAR e AquaRio", "Boulevard Olímpico e Pier Mauá", "Bares e cultura da Pedra do Sal e Lapa"]
  },
  "porto maravilha": {
    transporte: ["VLT Carioca (Linha 2) cruzando toda a orla revitalizada", "Central do Brasil e Metrô Uruguaiana próximos", "Linha Vermelha e Ponte Rio-Niterói de fácil acesso"],
    saude: ["Hospital da Gamboa", "Santa Casa e Souza Aguiar (Centro)"],
    educacao: ["Diversas faculdades no Centro, a poucos minutos", "Escolas na Saúde e Gamboa"],
    compras: ["Comércio do Centro e feiras da Praça Mauá", "Supermercados na Região Portuária"],
    lazer: ["Museu do Amanhã, AquaRio e MAR", "Boulevard Olímpico (arte urbana)", "Pedra do Sal, Lapa e vida noturna do Centro"]
  },
  "saude": {
    transporte: ["VLT Carioca (Linha 2)", "Central do Brasil a poucos minutos", "Av. Rodrigues Alves e Linha Vermelha"],
    saude: ["Hospital da Gamboa", "Santa Casa de Misericórdia (Centro)"],
    educacao: ["Faculdades do Centro próximas por VLT"],
    compras: ["Comércio do Centro e Praça Mauá"],
    lazer: ["Morro da Conceição (bares e história)", "MAR e Boulevard Olímpico", "Pedra do Sal — samba e roda carioca"]
  },
  "centro": {
    transporte: ["Metrô Linha 1 e 2 (Praça Onze, Central, Carioca, Uruguaiana)", "VLT Carioca — Parada dos Museus", "Central do Brasil e Aeroporto Santos Dumont a minutos"],
    saude: ["Hospital Municipal Souza Aguiar (~8 min)", "UFRJ — Hospital São Francisco de Assis", "Santa Casa de Misericórdia"],
    educacao: ["UFRJ, UERJ e faculdades no Centro", "Ampla rede de escolas e cursos técnicos"],
    compras: ["SAARA (maior comércio popular do Rio)", "Comércio de rua e shoppings do Centro"],
    lazer: ["Lapa, Cinelândia e Theatro Municipal", "Museu do Amanhã e Boulevard Olímpico", "Aterro do Flamengo próximo"]
  },
  "piedade": {
    transporte: ["Estação Piedade (SuperVia — ramais Deodoro, Japeri e Santa Cruz)", "Mais de 20 linhas de ônibus", "Av. Dom Hélder Câmara ligando a Zona Norte"],
    saude: ["Hospital Municipal da Piedade (ao lado da estação)"],
    educacao: ["Anhanguera (Av. Dom Hélder Câmara)", "FAETERJ-Rio em Quintino, ao lado"],
    compras: ["Comércio de rua consolidado", "Shopping Nova América e NorteShopping próximos"],
    lazer: ["Parque Madureira a poucos minutos", "Bares e boteco tradicional da Zona Norte", "Quintino e Cavalcanti com praças e clubes"]
  },
  "cachambi": {
    transporte: ["Metrô Nova América / Del Castilho", "Estação Engenho de Dentro (SuperVia) próxima", "Linha Amarela e Av. Dom Hélder Câmara"],
    saude: ["Hospital Salgado Filho (Méier) a poucos minutos", "Clínicas na região do NorteShopping"],
    educacao: ["Estácio e Centro Universitário IBMR no NorteShopping"],
    compras: ["NorteShopping ao lado", "Shopping Nova América em Del Castilho"],
    lazer: ["Cinemas e praça de alimentação do NorteShopping", "Bares do Méier e Todos os Santos", "Parque Madureira próximo"]
  },
  "meier": {
    transporte: ["Estação Méier (SuperVia — ramal Deodoro)", "Metrô Linha 2 (Maria da Graça próxima)", "Diversas linhas de ônibus"],
    saude: ["Hospital Salgado Filho", "Hospital da Ordem Terceira do Carmo"],
    educacao: ["Universidade Cândido Mendes (unidade Méier)", "Ampla rede de escolas"],
    compras: ["Shopping do Méier e NorteShopping", "Centro comercial de rua completo"],
    lazer: ["Bares e gastronomia tradicionais do Méier", "Cinemas do Shopping do Méier", "Praças e clubes do bairro"]
  },
  "madureira": {
    transporte: ["BRT TransCarioca — Terminal Paulo da Portela e Mercadão", "Estação Madureira (SuperVia — Deodoro e Japeri)", "Um dos maiores hubs de ônibus da Zona Norte"],
    saude: ["Hospital Estadual Carlos Chagas", "UPA Madureira"],
    educacao: ["Faculdades e escolas técnicas na região"],
    compras: ["Shopping Madureira e Mercadão de Madureira", "Maior polo de comércio popular da Zona Norte"],
    lazer: ["Parque Madureira (skate, shows e chafariz)", "Portela e Império Serrano (samba)", "Bares e feiras culturais"]
  },
  "sao cristovao": {
    transporte: ["Metrô Linha 2 — São Cristóvão (integra SuperVia)", "Acesso rápido ao Maracanã e ao Centro", "Diversas linhas de ônibus"],
    saude: ["Hospitais do Centro e da Tijuca a poucos minutos"],
    educacao: ["UNIRIO e Museu Nacional / BioParque", "Escolas tradicionais no bairro"],
    compras: ["Feira de São Cristóvão (nordestina)", "Comércio de rua e Shopping do Méier próximo"],
    lazer: ["Quinta da Boa Vista e BioParque", "Feira de São Cristóvão (música e gastronomia)", "Maracanã a poucos minutos"]
  },
  "engenho de dentro": {
    transporte: ["Estação Engenho de Dentro (SuperVia)", "Estádio Nilton Santos (Engenhão) no bairro", "Av. Dom Hélder Câmara e ônibus"],
    saude: ["Hospital Salgado Filho (Méier) a poucos minutos"],
    educacao: ["Estácio no NorteShopping próximo", "Rede de escolas da Zona Norte"],
    compras: ["NorteShopping a poucos minutos", "Comércio local consolidado"],
    lazer: ["Estádio Nilton Santos (Engenhão)", "Parque Madureira próximo", "Bares e praças do Méier ao lado"]
  },
  "inhauma": {
    transporte: ["Metrô Linha 2 — Inhaúma", "Av. Dom Hélder Câmara e linhas de ônibus", "Linha Amarela de fácil acesso"],
    saude: ["Hospital Salgado Filho (Méier) próximo"],
    educacao: ["Faculdades no NorteShopping e no Méier próximos"],
    compras: ["NorteShopping e Shopping Nova América próximos", "Comércio de rua do bairro"],
    lazer: ["Parque Madureira e Quinta da Boa Vista próximos", "Bares tradicionais da Zona Norte"]
  },
  "riachuelo": {
    transporte: ["Estação Riachuelo (SuperVia — ramal Deodoro)", "Metrô Linha 2 (São Cristóvão/Maracanã próximos)", "Diversas linhas de ônibus para o Centro"],
    saude: ["Hospital Salgado Filho e unidades da Tijuca próximos"],
    educacao: ["Faculdades da Tijuca e do Méier próximas"],
    compras: ["Comércio de rua e Shopping do Méier próximo"],
    lazer: ["Maracanã e Quinta da Boa Vista próximos", "Bares do Méier e da Tijuca"]
  },
  "campinho": {
    transporte: ["Estação Campinho (SuperVia)", "BRT TransCarioca — Estação Campinho", "Integração trem + BRT no mesmo ponto"],
    saude: ["Hospital Carlos Chagas (Madureira) próximo", "UPA Madureira a poucos minutos"],
    educacao: ["Faculdades de Madureira próximas"],
    compras: ["Shopping Madureira e Mercadão próximos", "Comércio de rua do Campinho"],
    lazer: ["Parque Madureira a poucos minutos", "Samba da Portela e Império Serrano"]
  },
  "todos os santos": {
    transporte: ["Estações Tomás Coelho e Méier (SuperVia) próximas", "Metrô Linha 2 no Méier", "Av. Amaro Cavalcanti e ônibus"],
    saude: ["Hospital Salgado Filho próximo"],
    educacao: ["Universidade Cândido Mendes (Méier) próxima"],
    compras: ["Shopping do Méier e NorteShopping próximos"],
    lazer: ["Bares e gastronomia do Méier ao lado", "Praças arborizadas do bairro"]
  },
  "pilares": {
    transporte: ["Estação Pilares (SuperVia — ramal Belford Roxo)", "Av. Dom Hélder Câmara e diversas linhas de ônibus", "Linha Amarela de fácil acesso"],
    saude: ["Hospital Salgado Filho (Méier) próximo"],
    educacao: ["Faculdades do Méier e do NorteShopping próximas"],
    compras: ["NorteShopping e comércio da Dom Hélder Câmara", "Comércio de rua do bairro"],
    lazer: ["Parque Madureira próximo", "Bares tradicionais e praças da Zona Norte"]
  },
  "rocha": {
    transporte: ["Estação Rocha (SuperVia)", "Metrô Linha 2 (São Cristóvão próximo)", "Diversas linhas de ônibus para o Centro"],
    saude: ["Hospital Salgado Filho e unidades de São Cristóvão próximos"],
    educacao: ["UNIRIO (São Cristóvão) e faculdades do Méier próximas"],
    compras: ["Comércio do Engenho Novo e Méier próximos"],
    lazer: ["Quinta da Boa Vista e BioParque próximos", "Bares do Engenho Novo e Méier"]
  },
  "bonsucesso": {
    transporte: ["Metrô Linha 2 — Bonsucesso / Ramos", "Linha Vermelha e Amarela de fácil acesso", "Ligação rápida ao Galeão e à Ilha do Governador"],
    saude: ["Hospital Geral de Bonsucesso (HGB) — maior hospital federal do estado"],
    educacao: ["Escolas públicas e privadas no bairro", "Faculdades da Ilha e do Centro próximas"],
    compras: ["Comércio de rua consolidado", "Shoppings da Ilha do Governador próximos"],
    lazer: ["Praia de Ramos e Piscinão de Ramos", "Bares e praças da Leopoldina", "Ilha do Governador a poucos minutos"]
  },
  "vila valqueire": {
    transporte: ["Diversas linhas de ônibus para Centro, Barra e Madureira", "Acesso pela Linha Amarela", "Estação Madureira (SuperVia + BRT) próxima"],
    saude: ["Hospitais e UPAs de Jacarepaguá e Madureira próximos"],
    educacao: ["Faculdades de Jacarepaguá e Madureira próximas"],
    compras: ["Comércio local completo e Shopping Madureira próximo"],
    lazer: ["Parque da Cidade e praças arborizadas", "Bares e gastronomia do bairro (um dos points da Zona Oeste)"]
  },
  "barra da tijuca": {
    transporte: ["Metrô Linha 4 — Jardim Oceânico", "BRT TransOeste, TransCarioca e TransOlímpica", "Av. das Américas e Linha Amarela"],
    saude: ["Rede de hospitais privados de referência na Barra"],
    educacao: ["Universidades e escolas internacionais na Barra"],
    compras: ["BarraShopping, VillageMall e Downtown", "Polos gastronômicos e supermercados"],
    lazer: ["Praia da Barra (18 km de orla)", "Lagoa de Marapendi e ciclovias", "Restaurantes e vida noturna da Barra"]
  },
  "camorim": {
    transporte: ["BRT TransOlímpica e TransCarioca (Jacarepaguá)", "Acesso rápido à Barra e ao Recreio", "Av. Salvador Allende e ligação com toda a Zona Oeste"],
    saude: ["Hospitais e UPAs de Jacarepaguá e da Barra próximos"],
    educacao: ["Unisuam, Cândido Mendes e faculdades de Jacarepaguá"],
    compras: ["BarraShopping e VillageMall próximos", "Comércio de Jacarepaguá e Recreio"],
    lazer: ["Parque Estadual da Pedra Branca (trilhas e cachoeiras)", "Praias da Barra e do Recreio próximas", "Reserva verde — refúgio tranquilo na cidade"]
  },
  "praca seca": {
    transporte: ["BRT TransCarioca (Jacarepaguá)", "Diversas linhas de ônibus para Centro e Barra", "Acesso pela Linha Amarela"],
    saude: ["Hospitais e UPAs de Jacarepaguá próximos"],
    educacao: ["Unisuam e Cândido Mendes (Jacarepaguá)", "Faculdades da Taquara próximas"],
    compras: ["Comércio da Praça Seca e Taquara", "Shopping de Jacarepaguá próximo"],
    lazer: ["Bares e vida noturna da Praça Seca (point da Zona Oeste)", "Parque da Pedra Branca próximo"]
  },
  "santa cruz": {
    transporte: ["Estação Santa Cruz (SuperVia — ramal Santa Cruz)", "BRT TransOeste (liga a Campo Grande e à Barra)", "Novo Terminal Bairro Imperial em construção"],
    saude: ["Hospital Municipal Pedro II", "UPA e rede de saúde da Zona Oeste"],
    educacao: ["Faculdades e escolas técnicas da Zona Oeste"],
    compras: ["Comércio de rua completo do Centro de Santa Cruz", "Shoppings de Campo Grande próximos pelo BRT"],
    lazer: ["Orla e praia de Sepetiba próximas", "Praças e clubes do bairro"]
  },
  "campo grande": {
    transporte: ["Estação Campo Grande (SuperVia)", "BRT TransOeste e TransCarioca", "Grande hub de ônibus da Zona Oeste"],
    saude: ["Hospital Oeste D'Or", "Casa de Saúde Nossa Senhora do Carmo e Hospital Di Campi"],
    educacao: ["UERJ — Campus Zona Oeste (ex-UEZO)", "Estácio no West Shopping e faculdades da região"],
    compras: ["West Shopping, Passeio e Park Shopping Campo Grande", "Calçadão — maior comércio de rua da Zona Oeste"],
    lazer: ["Maciço do Mendanha (trilhas e cachoeira)", "Cinemas e praças de alimentação dos shoppings", "Bares e clubes do bairro"]
  },
  "niteroi": {
    transporte: ["Barcas na Praça Araribóia (15 min ao Centro do Rio)", "Terminais de ônibus e Ponte Rio-Niterói", "Ligação rápida com São Gonçalo e Região dos Lagos"],
    saude: ["Hospital Universitário Antônio Pedro (HUAP-UFF)", "Rede hospitalar do Centro de Niterói"],
    educacao: ["Universidade Federal Fluminense (UFF)", "Ampla rede de escolas e faculdades"],
    compras: ["Plaza Shopping e Campo de São Bento", "Comércio do Centro de Niterói"],
    lazer: ["Praias de Icaraí, São Francisco, Itaipu e Camboinhas", "MAC de Niterói (Niemeyer) e Caminho Niemeyer", "Orla, bares e gastronomia de Icaraí"]
  },
  "sao goncalo": {
    transporte: ["Alcântara — um dos maiores polos de ônibus do estado", "Acesso rápido a Niterói e às Barcas para o Rio", "Futura Linha 3 do metrô (Praça XV–Alcântara) no PAC"],
    saude: ["Hospital Estadual Alberto Torres (HEAT)", "Rede municipal de saúde de São Gonçalo"],
    educacao: ["UERJ — Faculdade de Formação de Professores (FFP)", "Faculdades e escolas técnicas da região"],
    compras: ["Partage Shopping São Gonçalo", "Calçadão de Alcântara — grande comércio popular"],
    lazer: ["Praias de Itaipu e Camboinhas (Niterói) próximas", "Praças, clubes e bares de Alcântara"]
  },
  "nova iguacu": {
    transporte: ["Estação Nova Iguaçu (SuperVia — ramal Japeri)", "35 km da Central do Brasil, com trens expressos", "Grande hub de ônibus da Baixada"],
    saude: ["Hospital Geral de Nova Iguaçu (Hospital da Posse)", "Rede municipal e UPAs"],
    educacao: ["UFRRJ — Campus Nova Iguaçu (ao lado da estação)", "Faculdades e escolas técnicas da região"],
    compras: ["Shopping Nova Iguaçu e Top Shopping", "Calçadão — grande comércio popular"],
    lazer: ["Parque Municipal de Nova Iguaçu e Reserva da Tinguá", "Bares e praças do Centro"]
  },
  "duque de caxias": {
    transporte: ["Estações Jardim Primavera e Saracuruna (SuperVia — ramal Saracuruna)", "Acesso rápido pela Av. Brasil e Rodovia Washington Luís", "Grande malha de ônibus da Baixada"],
    saude: ["Hospital Municipal Moacyr do Carmo", "Rede municipal e UPAs de Caxias"],
    educacao: ["UNIGRANRIO — Universidade do Grande Rio (sede em Caxias)", "Faculdades e escolas técnicas da região"],
    compras: ["Shopping Caxias e Bar Shopping", "Calçadão — grande comércio popular"],
    lazer: ["Parque Natural Municipal da Taquara", "Praças, clubes e bares do bairro"]
  },
  "campos": {
    transporte: ["Centro de Campos e grande malha de ônibus urbanos", "Acesso pela BR-101 e Aeroporto Bartolomeu Lisandro", "Ligação com a Região Norte e dos Lagos"],
    saude: ["Hospital Ferreira Machado e Hospital dos Plantadores de Cana", "Rede pública e privada consolidada"],
    educacao: ["UENF — Universidade Estadual do Norte Fluminense", "UFF Campos, IFF e faculdades particulares"],
    compras: ["Boulevard Shopping Campos e Shopping Estrada", "Centro comercial e calçadão completos"],
    lazer: ["Praia do Farol de São Thomé", "Praças históricas e teatro do Centro", "Bares e gastronomia regional"]
  },
  "macae": {
    transporte: ["Centro de Macaé e malha de ônibus urbanos", "Aeroporto de Macaé e acesso pela BR-101", "Ligação com a Região dos Lagos e Norte Fluminense"],
    saude: ["Hospital Público Municipal de Macaé", "Rede privada ligada ao setor de óleo e gás"],
    educacao: ["UFRJ — Campus Macaé e UENF", "Faculdades particulares e cursos técnicos"],
    compras: ["Plaza Shopping Macaé", "Comércio do Centro e orla"],
    lazer: ["Praia dos Cavaleiros e orla de Macaé", "Costa do Sol e lagoas próximas", "Bares e restaurantes da orla"]
  }
};

/* ============================================================
   BAIRRO-INFO — "No dia a dia do bairro" (dados REAIS pesquisados)
   Transporte, saúde, educação e compras que fazem diferença na
   decisão de compra. Fonte: SuperVia, MetrôRio, BRT Rio, Moovit,
   Prefeitura do Rio, guias de bairro (ago/2026).
   Chave = trecho do nome do bairro (case-insensitive, sem acento).
   Só renderiza se houver dado real — nunca inventa.
   ============================================================ */
window.BAIRRO_INFO = {
  "santo cristo": {
    transporte: ["VLT Carioca (Linha 2) — paradas Santo Cristo e Gamboa", "Central do Brasil e Rodoviária do Novo Rio a poucos minutos", "Acesso rápido pela Linha Vermelha e Av. Rodrigues Alves"],
    saude: ["Hospital da Gamboa", "Santa Casa e hospitais do Centro a poucos minutos"],
    educacao: ["Faculdades do Centro a poucos minutos de VLT", "Rede de escolas na Região Portuária e Centro"],
    compras: ["Museu do Amanhã, MAR e Boulevard Olímpico", "Comércio do Centro e Praça Mauá"]
  },
  "porto maravilha": {
    transporte: ["VLT Carioca (Linha 2) cruzando toda a orla revitalizada", "Central do Brasil e Metrô Uruguaiana próximos", "Linha Vermelha e Ponte Rio-Niterói de fácil acesso"],
    saude: ["Hospital da Gamboa", "Hospitais do Centro (Santa Casa, Souza Aguiar) próximos"],
    educacao: ["Diversas faculdades no Centro, a poucos minutos", "Escolas na Saúde, Gamboa e Centro"],
    compras: ["Museu do Amanhã, AquaRio e Boulevard Olímpico", "Comércio do Centro e feiras da Praça Mauá"]
  },
  "saude": {
    transporte: ["VLT Carioca (Linha 2)", "Central do Brasil a poucos minutos", "Acesso pela Av. Rodrigues Alves e Linha Vermelha"],
    saude: ["Hospital da Gamboa", "Santa Casa de Misericórdia (Centro)"],
    educacao: ["Faculdades do Centro próximas por VLT"],
    compras: ["Morro da Conceição, MAR e Praça Mauá", "Comércio do Centro"]
  },
  "piedade": {
    transporte: ["Estação Piedade (SuperVia — ramais Deodoro, Japeri e Santa Cruz)", "Mais de 20 linhas de ônibus", "Av. Dom Hélder Câmara ligando toda a Zona Norte"],
    saude: ["Hospital Municipal da Piedade (ao lado da estação)"],
    educacao: ["Anhanguera (Av. Dom Hélder Câmara)", "FAETERJ-Rio em Quintino, ao lado"],
    compras: ["Comércio de rua consolidado", "Shopping Nova América e NorteShopping próximos"]
  },
  "cachambi": {
    transporte: ["Metrô Nova América / Del Castilho", "Estação Engenho de Dentro (SuperVia) a poucos minutos", "Linha Amarela e Av. Dom Hélder Câmara"],
    saude: ["Hospital Salgado Filho (Méier) a poucos minutos", "Rede de clínicas na região do NorteShopping"],
    educacao: ["Estácio e Centro Universitário IBMR no NorteShopping"],
    compras: ["NorteShopping ao lado", "Shopping Nova América em Del Castilho"]
  },
  "meier": {
    transporte: ["Estação Méier (SuperVia — ramal Deodoro)", "Metrô Linha 2 (Maria da Graça próxima)", "Diversas linhas de ônibus"],
    saude: ["Hospital Salgado Filho", "Hospital da Ordem Terceira do Carmo"],
    educacao: ["Universidade Cândido Mendes (unidade Méier)", "Ampla rede de escolas de educação básica"],
    compras: ["Shopping do Méier e NorteShopping", "Centro comercial de rua completo"]
  },
  "madureira": {
    transporte: ["BRT TransCarioca — Terminal Paulo da Portela e Mercadão", "Estação Madureira (SuperVia — Deodoro e Japeri)", "Um dos maiores hubs de ônibus da Zona Norte"],
    saude: ["Hospital Estadual Carlos Chagas", "UPA Madureira"],
    educacao: ["Faculdades e escolas técnicas na região", "Ampla rede de escolas"],
    compras: ["Shopping Madureira e Mercadão de Madureira", "Parque Madureira (lazer, skate e shows)"]
  },
  "sao cristovao": {
    transporte: ["Metrô Linha 2 — São Cristóvão (integrada à SuperVia)", "Acesso rápido ao Maracanã e ao Centro", "Diversas linhas de ônibus"],
    saude: ["Hospitais do Centro e Tijuca a poucos minutos"],
    educacao: ["UNIRIO e Museu Nacional / BioParque", "Escolas tradicionais no bairro"],
    compras: ["Quinta da Boa Vista para lazer", "Comércio de rua e Shopping do Méier próximo"]
  },
  "engenho de dentro": {
    transporte: ["Estação Engenho de Dentro (SuperVia)", "Estádio Nilton Santos (Engenhão) no bairro", "Av. Dom Hélder Câmara e diversas linhas de ônibus"],
    saude: ["Hospital Salgado Filho (Méier) a poucos minutos"],
    educacao: ["Estácio no NorteShopping próximo", "Rede de escolas da Zona Norte"],
    compras: ["NorteShopping a poucos minutos", "Comércio local consolidado"]
  },
  "inhauma": {
    transporte: ["Metrô Linha 2 — Inhaúma", "Av. Dom Hélder Câmara e diversas linhas de ônibus", "Linha Amarela de fácil acesso"],
    saude: ["Hospital Salgado Filho (Méier) próximo"],
    educacao: ["Faculdades no NorteShopping e no Méier próximos"],
    compras: ["NorteShopping e Shopping Nova América próximos", "Comércio de rua do bairro"]
  },
  "riachuelo": {
    transporte: ["Estação Riachuelo (SuperVia — ramal Deodoro)", "Metrô Linha 2 (São Cristóvão/Maracanã próximos)", "Diversas linhas de ônibus para o Centro"],
    saude: ["Hospital Salgado Filho e unidades da Tijuca próximos"],
    educacao: ["Faculdades da Tijuca e do Méier próximas"],
    compras: ["Comércio de rua e Shopping do Méier próximo"]
  },
  "campinho": {
    transporte: ["Estação Campinho (SuperVia)", "BRT TransCarioca — Estação Campinho", "Integração trem + BRT no mesmo ponto"],
    saude: ["Hospital Carlos Chagas (Madureira) próximo", "UPA Madureira a poucos minutos"],
    educacao: ["Faculdades de Madureira próximas"],
    compras: ["Shopping Madureira e Mercadão próximos", "Comércio de rua do Campinho"]
  },
  "todos os santos": {
    transporte: ["Estação Tomás Coelho/Méier (SuperVia) próximas", "Metrô Linha 2 no Méier", "Av. Amaro Cavalcanti e linhas de ônibus"],
    saude: ["Hospital Salgado Filho próximo"],
    educacao: ["Universidade Cândido Mendes (Méier) próxima"],
    compras: ["Shopping do Méier e NorteShopping próximos"]
  },
  "barra da tijuca": {
    transporte: ["Metrô Linha 4 — Jardim Oceânico", "BRT TransOeste e TransCarioca", "Av. das Américas e Linha Amarela"],
    saude: ["Rede de hospitais privados de referência na Barra"],
    educacao: ["Universidades e escolas internacionais na Barra"],
    compras: ["BarraShopping, VillageMall e Downtown", "Orla e polos gastronômicos"]
  },
  "praca seca": {
    transporte: ["BRT TransCarioca (Jacarepaguá)", "Diversas linhas de ônibus para o Centro e Barra", "Acesso pela Linha Amarela"],
    saude: ["Hospitais e UPAs de Jacarepaguá próximos"],
    educacao: ["Faculdades de Jacarepaguá e Taquara próximas"],
    compras: ["Comércio da Praça Seca e Taquara", "Shopping de Jacarepaguá próximo"]
  },
  "niteroi": {
    transporte: ["Barcas na Praça Araribóia (15 min ao Centro do Rio)", "Terminais de ônibus e futuras estações", "Ponte Rio-Niterói de fácil acesso"],
    saude: ["Hospital Universitário Antônio Pedro (HUAP-UFF)", "Rede hospitalar do Centro de Niterói"],
    educacao: ["Universidade Federal Fluminense (UFF)", "Ampla rede de escolas e faculdades"],
    compras: ["Plaza Shopping e Campo de São Bento", "Orla e MAC de Niterói"]
  }
};

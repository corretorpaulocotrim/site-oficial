# Pesquisa: o que prende o cliente em vídeo imobiliário (e como o estúdio aplica)

**Data da pesquisa:** 25/10/2026. **Fontes analisadas:** 3 vídeos de referência enviados pelo Paulo (formato "corretor + IA" com etiquetas de capítulo e legenda; tutorial de edição com legenda palavra a palavra e cortes de pausa; drone com marcação de terreno e virada para casa pronta), o site paulocotrim.com e os books oficiais na pasta `apresentacoes/`.

**Limitações (registradas por honestidade):**
- O Instagram (perfil @brunocassarolla e o reel enviado) e a Biblioteca de Anúncios da Meta **não estavam acessíveis** no ambiente de desenvolvimento (bloqueio de rede). Por isso nenhum número de desempenho deles foi usado.
- Os padrões abaixo são princípios recorrentes do formato vertical. Não são comparações de conversão: **visualização não é venda**. Meça no seu funil (seção 4).
- A biblioteca de presets (pasta `presets/`) é onde novos padrões entram sem mexer no motor.

## 00. Varredura de ferramentas de código aberto (GitHub, 11/11/2026)

Busca na API do GitHub, ordenada por estrelas, com licença e data do último commit. Critério para entrar no estúdio: roda localmente, sem GPU e sem assinatura, é testável aqui e tem licença compatível.

| Ferramenta (estrelas, licença) | O que faz | Decisão |
|---|---|---|
| PeterL1n/**RobustVideoMatting** (9,6 mil, GPL-3.0) | Recorte de pessoa em vídeo, sem tela verde | ✅ **Integrado**: modelo ONNX via onnxruntime-node (~30 ms/quadro no processador; vídeo de 30 s ≈ 30 s). Baixado do GitHub no 1º uso |
| georgmartius/**vid.stab** (1 mil) | Estabilização de vídeo | ✅ **Integrado** (filtros vidstabdetect/vidstabtransform do FFmpeg, 2 passadas) |
| xiph/**rnnoise** (6 mil, BSD-3) + richardpl/arnndn-models | Redução de ruído da voz por rede neural | ✅ **Integrado** (filtro arnndn; modelo `std.rnnn` original da Xiph) |
| FFmpeg **minterpolate** (equivalente simples a RIFE/FILM) | Interpolação de quadros | ✅ **Integrado** como "câmera lenta suave" |
| CPJKU/beat_this (MIT), mjhydri/BeatNet | Detecção de batida | ✅ **Implementado em JavaScript** (fluxo de energia + autocorrelação + regressão; 120 BPM detectado exato no teste). "Cortar as cenas no ritmo da música" |
| Looks/LUT (.cube) | Correção de cor cinematográfica | ✅ **4 looks gerados pelo próprio estúdio** (sem licença de terceiros) + cor automática (filtro normalize) |
| htekdev/**vidpipe** (ISC) | Legendas karaokê, limite de corte, capítulos | ✅ Ideias integradas na versão anterior |
| CutScript / Rescript | Editar o vídeo pelo texto | ✅ Integrado na versão anterior (aba Transcrição) |
| WyattBlue/**auto-editor** (5,8 mil, Unlicense) | Cortes automáticos por áudio e movimento | ✅ A ideia já está no corte de pausas; detecção de trechos parados (freezedetect) fica como próximo passo |
| m-bain/**whisperX** (25 mil, BSD-2), SYSTRAN/**faster-whisper** (26,6 mil, MIT) | Transcrição com tempo por palavra | 🟡 Mais precisos que o Whisper do estúdio, mas exigem Python. O estúdio usa o Whisper em JavaScript (`_timestamped`) |
| remotion-dev/template-tiktok | Legendas estilo TikTok | Referência visual; o estúdio já faz com libass |
| gl-transitions (2,2 mil), scriptituk/xfade-easing (MIT) | Transições GLSL e suavização (easing) | 🟠 Exigem FFmpeg recompilado ou expressões muito pesadas; o estúdio usa as 18 transições nativas do xfade |
| k4yt3x/video2x (22 mil, AGPL-3.0), Real-ESRGAN | Aumento de resolução por IA | ⬜ Pedem GPU e binário externo; fica fora |
| Depth-Anything V2/3 (Apache-2.0) | Profundidade para efeito parallax 2.5D | ⬜ Fica fora por decisão: distorce a arquitetura (regra do estúdio: nunca alterar o imóvel) |
| openhouse-3d, snapstager, decor8ai | Decoração virtual / 3D a partir de fotos | ⬜ Generativo; só com aviso de "imagem ilustrativa" e serviço pago. Não integrado |
| gyroflow (9,7 mil, GPL-3.0) | Estabilização por giroscópio | ⬜ Exige dados de giroscópio da câmera; o vid.stab cobre celular comum |

## 0. Atualização da pesquisa (10/11/2026)

**Fontes consultadas** (a maioria é blog de ferramenta de vídeo ou de quem vende serviço; os números delas não foram auditados e não são usados como promessa):
- Rafael Terra, *15 tendências de marketing digital para o mercado imobiliário em 2026* (rafaelterra.com.br): lote mensal de **12 variações por empreendimento**, cruzando 4 ângulos de promessa (localização, planta/uso, condição financeira, prova social) com 3 formatos; Reels de 20 a 35 s; condição de pagamento contada como **previsibilidade**, não como "a partir de".
- BIGVU, *Creator Decoder: how top realtors get views in 2026* e *25 real estate video ideas* (bigvu.tv): ganchos de afirmação ousada, cortes frequentes, **CTA de comentário com palavra-código**, rosto do corretor em cena (amostra pequena), guias de bairro/mudança e comparativos "o que esse valor compra".
- Luxury Presence, Krista Mashore, videoguru.ai e vprop.ai (guias de Reels 2026): 15 a 60 s, legenda sempre, CTA específico ("siga para mais" raramente gera lead), enquete "você compraria?".
- Portas: o "corretor creator"; YouTube de 8 a 12 min para lead mais quente.
- GitHub, editores de vídeo com IA de código aberto:
  - **vidpipe** (htekdev, ISC): corte de pausas com limite de 20%, legenda karaokê palavra a palavra, capítulos;
  - **CutScript** e **Rescript**: editar o vídeo apagando o texto da transcrição;
  - **Auto-Cut AI** (faster-whisper).

**Limitações:** os sites bigvu.tv e rafaelterra.com.br foram lidos só pelo resumo da busca, porque o ambiente de desenvolvimento bloqueia o acesso direto. O Instagram e a Biblioteca de Anúncios da Meta continuam inacessíveis daqui. A estatística "403% mais contatos com vídeo", muito repetida, **não foi confirmada** em fonte primária e não é usada.

**O que virou função no estúdio (nesta versão):**
| Padrão encontrado | Função |
|---|---|
| Lote de variações por ângulo (Rafael Terra) | **Variações**, no editor: 4 ângulos de promessa, cada um com gancho, CTA e palavra-código próprios, já na fila de render |
| CTA de comentário com palavra-código (BIGVU) | Campo **palavra-código** (ex.: "Comente PLANTA que eu te mando a planta completa"), que também mostra de qual vídeo veio cada lead |
| Guia de bairro / "por que morar aqui" | Formato **3 motivos para morar no bairro**, com os dados reais do site (`bairro-info.js`, 36 bairros); sem dado do bairro, o estúdio avisa e não inventa |
| Condição como previsibilidade | Formato **Entrada → obra → chaves**: mostra a estrutura sem valor; preço só aparece se estiver informado no projeto |
| "O que esse valor compra" / comparativo | Formato **comparativo**: 2 ou 3 lançamentos da mesma região, tirados do catálogo do site, com a capa oficial de cada um |
| Enquete "você compraria?" | Formato **Você compraria?**: o gancho pede SIM ou NÃO nos comentários |
| Tour com gancho de curiosidade | Formato **tour (POV)** |
| Limite de corte (vidpipe) | **Corte máximo de pausas** no preset (padrão 35%; 20% na edição conservadora): tira primeiro as pausas mais longas e para no limite |
| Editar pelo texto (CutScript, Rescript) | Aba **Transcrição** no editor: marque frases → "Cortar" → o vídeo, as legendas e os textos se ajustam sozinhos |
| Corretor na frente do material (chroma) | **Fundo verde**: grave com tela verde, marque a opção e você aparece recortado sobre o book ou as fotos, em vez de num círculo |
| Capítulos (vidpipe) | Arquivo **capítulos** para a descrição do YouTube (vídeos com 30 s ou mais e 3 ou mais cenas) e legenda **.vtt** além da .srt |

## 1. Padrões que funcionam → o que o app faz sozinho
| Padrão do mercado | Por que retém | No app |
|---|---|---|
| Gancho escrito nos primeiros 3s | Quem rola o feed decide em 1,5s se para | Campo **Gancho** + sugestões automáticas a partir do catálogo |
| Legenda grande, palavra a palavra, com destaque | O feed começa sem som: sem legenda, a mensagem se perde | Legenda IA local com a palavra falada no dourado da marca e palavras-chave/números destacados |
| Corte seco sem pausas + zoom alternado | Ritmo rápido sem parecer cortado | Corte de pausas + zoom de 12% em um corte sim, outro não |
| Corretor em círculo sobre o material | Une rosto (confiança) e imóvel (desejo) | **Modo Apresentação** com você em círculo e aro dourado |
| Material aparece quando o corretor fala dele | Parece editado à mão, frase a frase | O app ouve "planta", "lazer", "metrô"... e põe a cena certa nesse segundo |
| Book/planta como cartão com sombra | Ar premium, estilo keynote da Apple | PDF vira cartão arredondado sobre o petróleo da marca |
| Planta com aproximação lenta | O cliente "entra" no apartamento | Zoom mais forte quando a página é de planta |
| Etiqueta de capítulo ("● LAZER") | Organiza o tour e dá sensação de conteúdo completo | Etiqueta automática a partir do PDF ou digitada por você |
| Fichas com dados (quartos, m², construtora) | Qualifica o lead antes do WhatsApp | Fichas animadas com dados **reais** do catálogo Sawala + PDF |
| Transições com som (whoosh) | Marcam a troca de cena e prendem a atenção | 8 transições rotativas, cada uma com efeito sonoro |
| Barra de progresso | O cliente vê que falta pouco e fica até o fim | Barra dourada no topo |
| Fechamento com marca e CTA | Converte a atenção em conversa | Cartão final com logo oficial, WhatsApp, site e CRECI |
| Preço escondido | Gera a conversa no WhatsApp (sua regra de captação) | Páginas de tabela de preço ficam **fora** do vídeo automaticamente |

Fora do alcance do app (precisa de IA paga na nuvem ou edição manual): desenhar o contorno do terreno no drone, transformar um terreno vazio em casa pronta e gerar número 3D animado. Use o app para 90% do vídeo e, se quiser, finalize esses detalhes no CapCut.

## 2. Sua apresentação padrão (serve para todos os projetos)
Grave **uma fala de 30 a 50 s** seguindo o roteiro abaixo. Diga as **palavras em negrito**: são elas que fazem o app colocar o material certo na hora certa.

1. **Gancho (0 a 3 s)**: "Dá pra morar no [bairro] usando o FGTS?" ou "Esse lançamento no [bairro] pouca gente conhece."
2. **Quem sou (3 a 6 s)**: "Sou o Paulo Cotrim, corretor independente, CRECI 77677."
3. **O projeto**: "Esse é o **empreendimento** [nome], da [construtora]." → entra a **fachada** (capa do site ou book)
4. **Localização**: "Ele **fica** a X **minutos** do **metrô**/VLT..." → entra a página de **localização**
5. **Planta**: "A **planta** tem [1 e 2] **quartos**, com **varanda**..." → entra a **planta** com aproximação
6. **Lazer**: "No **lazer** tem **piscina**, **academia**..." → entra o **lazer**
7. **Condição**: "Dá pra usar o **FGTS** na **entrada** e financiar pela **Caixa**." → texto de tela "FGTS + Financiamento CAIXA" (em lançamentos econômicos)
8. **CTA (últimos 3 s)**: "Comenta **QUERO** ou me chama no WhatsApp que eu te mando a simulação." → cartão final

## 3. Os 4 vídeos de cada lançamento (1 gravação = 1 semana de conteúdo)
| Dia | Como fazer no estúdio | Material | Objetivo |
|---|---|---|---|
| Seg | Auto Edit · objetivo "interesse" · preset do posicionamento | Sua fala + book PDF + capa do site | Lead qualificado |
| Qua | Auto Edit · objetivo "desejo" · edição criativa | Vídeos do decorado + fotos | Desejo |
| Sex | PDF Intelligence → roteiro → "Montar no editor" (sem apresentador) | Book/planta/fotos + música | Alcance |
| Dom | Auto Edit · objetivo "objeções" · preset Clean Corporate | Sua resposta a uma dúvida ("dá pra usar FGTS?") | Autoridade |

## 4. O que medir (toda semana)
As metas abaixo são pontos de partida, não dados de mercado: ajuste com os seus números depois de 4 semanas.
- **Retenção de 3 s** acima de 60% → o gancho funciona. Se ficar abaixo, troque o gancho.
- **Assistiu até o fim** acima de 30% → o ritmo funciona.
- **Mensagens no WhatsApp por vídeo** → a métrica que paga a conta. Meta: 3 ou mais.
- **Comentários "QUERO"** → responda em até 10 minutos com o link da simulação no site.

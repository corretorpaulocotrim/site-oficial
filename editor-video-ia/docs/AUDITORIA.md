# Auditoria e matriz de funcionalidades

Data: 25/10/2026.

## Ponto de partida (antes desta versão)
- `editor-video-ia/` v1/v2: um gerador de um clique (Node + FFmpeg) **sem** linha do tempo editável, **sem** projetos salvos, **sem** fila com cancelamento, **sem** prévia e com marca antiga (petróleo/verde, sem as fontes do site).
- Funcionava: corte de pausas, transições, legenda Whisper (não validada offline), PDF em cartão, círculo do apresentador e exportação em 4 formatos.
- Identidade real do site (paulocotrim.com): marfim `#F6F2EA`, tinta `#1A1A19`, ouro `#B0895B`, Cormorant Garamond + Inter, monograma "PC" (`logo-round-gold.svg`), slogan "Não vendo um apartamento. Ajudo você a decidir." Posicionamento: lançamentos e alto padrão, **não** MCMV como identidade.

## Matriz atual
Legenda: ✅ implementada e testada · 🟡 implementada, não validada · 🟠 parcial · ⬜ ausente

| Área | Funcionalidade | Estado | Evidência / observação |
|---|---|---|---|
| Instalação | Execução local fora do ambiente de desenvolvimento (`npm start`, .bat/.command) | ✅ | servidor sobe e responde `/api/status` (teste `servidor`) |
| Instalação | Docker / Docker Compose | 🟡 | arquivos entregues; Docker não disponível no ambiente de desenvolvimento |
| Projetos | Criar, salvar, reabrir, duplicar, excluir, versões, restaurar | ✅ | teste `fluxo` + navegador |
| Projetos | Salvamento automático, conflito de edição | ✅ | navegador (Playwright): alterações persistem em 1,2 s |
| Mídia | Upload com limite, validação por ffprobe, miniatura, proxy H.264 para HEVC/MOV | ✅ / 🟡 proxy | proxy não exercitado com arquivo HEVC real |
| Editor | Prévia ao vivo, 5 faixas, mover, aparar, dividir, duplicar, apagar | ✅ | navegador: dividir/desfazer/refazer/texto conferidos no servidor |
| Editor | Undo/redo, atalhos, zoom da linha do tempo, inspetor | ✅ | |
| Editor | Transições e cor exatas na prévia ao vivo | 🟠 | aparecem na "Prévia renderizada" (FFmpeg); a prévia ao vivo mostra cortes secos |
| Render | MP4 H.264/AAC 9:16, 4:5, 1:1, 16:9 com validação | ✅ | testes: 1080×1920, 1080×1080, 1920×1080, duração ±0,35 s |
| Render | Cache por trecho, fila, progresso, cancelamento, repetição, recuperação após reinício | ✅ | teste de cancelamento; recuperação por código (jobs.json) |
| Render | Reenquadramento por ponto de foco | ✅ | o foco é **manual** (sem detecção de rosto) |
| Legendas | Transcrição Whisper local, tempo por palavra | 🟡 | sem acesso ao HuggingFace neste ambiente; sem o modelo, o app avisa e continua |
| Legendas | Agrupamento, destaque da palavra, palavras-chave, emojis do assunto, correção manual, SRT | ✅ | testes + render conferido quadro a quadro |
| Presets | 5 presets reais, editar, duplicar, importar, exportar, amostra | ✅ | |
| Efeitos | Biblioteca com busca, categorias, favoritos, ouvir sons | ✅ | |
| PDF | Texto, classificação, fatos com página, alertas, resumo | ✅ | teste `pdf` + book real Beon Porto (31 págs.) |
| PDF | OCR offline | ✅ | book real: páginas só com imagem passaram pelo OCR |
| PDF | Extração de imagens embutidas, sem fundos repetidos | ✅ | book real |
| PDF | Identificação de tabelas | 🟠 | por palavras e cifras (classifica a página); não reconstrói linhas/colunas |
| Roteiro | Roteirista por regras (posicionamento, objetivo, duração, fontes) | ✅ | |
| Roteiro | Refinamento com Claude | 🟡 | sem chave neste ambiente |
| Auto Edit | Fala, corte de pausas, zoom alternado, encaixe por contexto, gancho, fichas, CTA, trilha, sugestões | ✅ | teste `fluxo` (com tom sintético; o encaixe por palavra depende da transcrição) |
| Auto Edit | Detecção de cenas em vídeos sem fala | ✅ | FFmpeg scene detection |
| Auto Edit | Encurtar a fala para a duração alvo escolhendo trechos | ⬜ | decisão: não corta frases (preserva o sentido); mostra sugestão |
| AI Presenter | Voz ElevenLabs | 🟡 | sem chave |
| AI Presenter | Avatar, troca de roupa e de cenário | ⬜ | sem fornecedor contratado; documentado em INTEGRACOES.md |
| Movimento | Ken Burns, panorâmica sem distorção, aproximação de planta, cartão | ✅ | |
| Movimento | Parallax 2.5D / câmera generativa | ⬜ | evitado: deforma a arquitetura |
| Mapas | Cena de mapa da localização | ⬜ | usa a página de localização do book; mapa gerado fica para a próxima fase |
| Segurança | Login obrigatório fora do localhost, cookie HttpOnly, bloqueio de path traversal, limite de upload, sem shell | ✅ | teste `servidor` (path traversal) |
| Marca | Identidade central (logo, cores, contatos, tela final) editável | ✅ | |

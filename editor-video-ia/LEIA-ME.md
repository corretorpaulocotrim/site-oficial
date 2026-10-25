# Atlas Editor de Vídeo — Paulo Cotrim

Você grava, arrasta os arquivos, e recebe o vídeo **editado, legendado e com a sua marca** em 4 formatos. Roda no seu computador, **sem Claude, sem mensalidade e sem internet** (a internet só é usada na 1ª vez, para baixar a IA de legenda).

## Como usar (3 passos)
1. Instale o **Node.js 20+** (nodejs.org) — você já tem.
2. Dê dois cliques em **`INICIAR-WINDOWS.bat`** (no Mac: `INICIAR-MAC.command`). Na 1ª vez ele instala tudo sozinho.
3. O navegador abre em `http://localhost:3333`. Arraste **vídeos, fotos e PDFs** (book, decorado, planta, tabela), preencha o gancho e clique em **Editar meu vídeo**.

Os arquivos prontos ficam na pasta `saida/`.

## O que ele faz sozinho
| Etapa | O que acontece | Por que vende |
|---|---|---|
| Corte de pausas | Remove silêncios e respiros da fala | Ritmo de reels, mais retenção |
| Corte com zoom | Na fala, um corte sim e outro não ganha zoom de 12% | Parece gravado com 2 câmeras |
| Tour dinâmico | Vídeo sem fala fica 1.25x mais rápido, com a música por baixo | Tour sem enrolação |
| Melhoria de imagem | Contraste, cor, nitidez e vinheta leve | Imóvel com cara de profissional |
| Fotos → vídeo | Foto horizontal faz panorâmica; foto vertical ganha zoom suave | Foto parada vira cena |
| PDF/book | Cada página vira cena inteira (sem cortar texto), com fundo desfocado | Usa o material do condomínio |
| Transições | Deslizar, círculo, zoom e cortina, alternando; fala→fala é corte seco | Padrão atual do mercado |
| Gancho | Frase grande nos 3 primeiros segundos | Segura quem está rolando o feed |
| Ficha | Empreendimento, bairro e preço (se você informar) | Qualifica o lead |
| Etiquetas | "● FACHADA", "● LAZER"... no canto de cada trecho | Mostra a organização do tour |
| Legenda IA | Palavra a palavra, palavra ativa em verde, FGTS/Caixa/valores destacados | 85% assistem sem som |
| Revisão | Você corrige a legenda antes de exportar | Nada de "Curi" ou "efe gê tê esse" |
| Áudio | Tira ruído, nivela o volume em -14 LUFS e baixa a música quando você fala | Som limpo em qualquer celular |
| Marca | Chave dourada no canto, barra de progresso verde, cartão final com WhatsApp/site/CRECI | Identidade e prova de credibilidade |
| Formatos | 9:16 (Reels/TikTok/Shorts), 4:5 (Feed), 1:1, 16:9 (YouTube) | Um vídeo vira 4 publicações |
| Extras | Capa .jpg, legenda .srt e **texto do post pronto** com CTA e hashtags | Posta em 1 minuto |

## Os 3 modelos
- **Tour do imóvel** — vídeos do decorado/obra + fotos + book. Música e transições.
- **Paulo falando** — corta pausas, zoom nos cortes, legenda palavra a palavra.
- **Só fotos** — fotos e PDF viram vídeo com movimento e música.

## Personalizar (arquivo `config.json`)
- `whatsapp`, `site`, `creci`, `instagram` → aparecem no cartão final.
- `cores` → petróleo, verde, azul Caixa, destaque da legenda.
- `palavrasDestaque` → palavras que sempre aparecem coloridas.
- `correcoes` → como a IA deve escrever (ex.: `"cury": "Cury"`).
- `modeloWhisper` → troque para `onnx-community/whisper-small_timestamped` para legenda mais precisa (mais lenta).
- Músicas: coloque `.mp3` **sem direitos autorais** na pasta `musicas/` (ex.: Biblioteca de Áudio do YouTube).

## Fluxo recomendado (gravar uma vez, postar em tudo)
1. Grave na vertical, 4K/1080p, celular apoiado, 3 a 6 trechos curtos (fachada, lazer, sala, vista, você falando).
2. Junte as fotos e o book oficial do empreendimento.
3. Edite no app → revise a legenda → exporte.
4. Poste: 9:16 no Reels/TikTok/Shorts, 4:5 no Feed, 16:9 no YouTube, 1:1 no Facebook/WhatsApp Status.
5. Se quiser, ajuste o vídeo pronto no CapCut (ele já sai 90% finalizado).

## Problemas comuns
- **Legenda não apareceu**: a 1ª vez precisa de internet para baixar a IA (~150 MB). Depois funciona offline.
- **Demorou**: um vídeo de 1 minuto leva de 2 a 5 minutos (são 4 formatos). Deixe a janela preta aberta.
- **Fonte diferente**: a legenda usa Arial Black e Georgia (já vêm no Windows e no Mac). Troque em `config.json`.

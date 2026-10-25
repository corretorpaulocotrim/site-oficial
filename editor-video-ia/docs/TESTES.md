# Testes executados

Ambiente: Linux, Node 22.22, FFmpeg 6.1 (`ffmpeg-static`), Chromium/Playwright para a interface. Data: 25/10/2026.

## Automatizados (`npm test`): 10/10 passando
| Teste | Resultado |
|---|---|
| layout: sobreposição exata nas transições, velocidade 2x | ok |
| layout: tela final e fim do conteúdo | ok |
| legendas: agrupamento, quebra em pausa, correções, emoji contextual, reescrita | ok |
| PDF Intelligence: 3 páginas classificadas (planta/lazer/condições), metragem p.1, tipologia p.1, preço p.3, endereço p.2, alerta de tabela vencida, nome só como "confirmar" | ok |
| importar vídeo/PDF/foto/música + análise de PDF como tarefa | ok |
| Auto Edit: pausas viram cortes, gancho, sugestões, roteiro, tabela de preço fora | ok |
| edição manual + render prévia 9:16 e final 1:1 validados (resolução, duração, H.264/AAC, capa) | ok |
| cancelamento de renderização | ok |
| salvar, versionar, reabrir, duplicar | ok |
| API HTTP: status, criar, upload, salvar, render, Range 206, path traversal bloqueado | ok |

## Manuais com material real
- Book **Beon Porto** (31 páginas, 9,8 MB): 31 páginas lidas, OCR nas páginas só com imagem, categorias (9 planta, 9 lazer, 1 localização, 2 ficha, 1 fachada), fatos com página (tipologias p.5/23/25, metragens p.23–25, endereço p.3, distâncias p.3), imagens embutidas extraídas.
- Vídeo de referência (28,6 s) como apresentador: Auto Edit + renderização 9:16 final 1080×1920 validada (31,77 s, esperado 31,75 s) e 16:9 final 1920×1080 validada. Quadros conferidos: gancho, fichas, emojis, apresentador em círculo com aro dourado, legenda com destaque, logo oficial, barra de progresso, tela final.
- Login com `APP_SENHA`: sem login 401; senha errada 401; login 200 com cookie HttpOnly/SameSite=Strict; com login 200; servidor recusa iniciar em `HOST=0.0.0.0` sem senha.
- Extração de imagens do book Beon Porto: 48 fotos reais (vista aérea, VLT, mapa, fachadas); fundos repetidos e lisos descartados; 92 s para 31 páginas com OCR.
- Interface no Chromium: todas as páginas carregam sem erro de JavaScript; no editor, dividir (S), desfazer, refazer e novo texto foram persistidos no servidor.

## Não testado neste ambiente (depende de rede ou credencial)
- Download do modelo Whisper (HuggingFace bloqueado aqui). Sem ele, o app registra a sugestão "Legenda automática não gerada" e segue.
- Claude (sem `ANTHROPIC_API_KEY`) e ElevenLabs (sem chave).
- Docker (sem daemon no ambiente).
- Proxy de vídeo HEVC de iPhone (sem arquivo de teste HEVC).

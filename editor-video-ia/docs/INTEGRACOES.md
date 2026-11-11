# Integrações

## Locais e gratuitas (já funcionam)
| Recurso | Tecnologia | Observações |
|---|---|---|
| Renderização e composição | FFmpeg (pacote `ffmpeg-static` ou o do sistema) | Transições (xfade), sobreposições, libass para textos, loudnorm −14 LUFS e abaixamento da música na fala (ducking) |
| Legendas | Whisper via `@huggingface/transformers` | Na 1ª vez baixa o modelo (`WHISPER_MODELO`) do HuggingFace e depois roda offline. Tempo por palavra quando o modelo `_timestamped` está disponível; senão, tempo por frase (menos preciso). |
| OCR | `tesseract.js` + idioma `por` incluído no pacote | 100% offline. Só é usado em página com menos de 25 caracteres de texto. |
| PDF | `pdfjs-dist` (texto, imagens embutidas) + `pdf-to-img` (página renderizada) | |
| Catálogo | `data/catalogo.json` do site (Sawala) | Usa a cópia local do repositório e atualiza do site quando há internet |
| Efeitos sonoros | Sintetizados pelo FFmpeg | Sem direitos de terceiros |

## Opcionais pagas
### Roteiro com Claude (Anthropic)
- Ative com `ANTHROPIC_API_KEY` no `.env`. Modelo padrão: `claude-opus-5-5` (troque em `ANTHROPIC_MODELO`).
- O que faz: reescreve **apenas os textos** (gancho, falas, texto de tela, CTA, legenda do post) do roteiro gerado pelas regras locais. As mídias, a ordem das cenas e as fontes dos dados continuam vindo das regras.
- Proteções: só recebe os fatos extraídos (com a página); a instrução proíbe inventar preço, desconto, rentabilidade e escassez. A resposta tem formato JSON obrigatório. Se o modelo recusar ou falhar, o roteiro local é mantido.
- Usa o fallback de servidor (`fallbacks: "default"`): se o modelo recusar o pedido, a API tenta de novo com outro modelo dentro da mesma chamada.
- Custo: cobrado por token pela Anthropic (veja https://www.anthropic.com/pricing). Um roteiro usa poucos milhares de tokens.
- **Status:** implementado, **não validado** neste ambiente (sem chave). Teste com uma chave antes de usar em produção.

### Voz sintética (ElevenLabs)
- Ative com `ELEVENLABS_API_KEY` e `ELEVENLABS_VOZ` (ID de uma voz **sua e autorizada**).
- Gera a narração em MP3 a partir do texto e coloca na biblioteca do projeto. O projeto fica marcado como "contém conteúdo gerado por IA".
- Custo: por caractere (https://elevenlabs.io/pricing).
- **Status:** implementado, **não validado** neste ambiente (sem chave).

### Avatar, troca de roupa, troca de cenário, vídeo generativo
- **Não implementados.** Fornecedores avaliados: HeyGen, Synthesia e Runway (links na tela AI Presenter). Exigem contrato pago, e cada um tem API e regras próprias de consentimento.
- Para incluir um deles, crie `src/ia/<fornecedor>.js` seguindo o padrão de `tts.js`, registre uma tarefa em `src/server.js` e um botão no AI Presenter.
- A interface não mostra botão para recurso sem serviço configurado.

## Desligar serviços externos
Deixe as chaves vazias no `.env`. Edição, renderização, legendas e OCR continuam funcionando sem internet (depois do 1º download do modelo de legenda).

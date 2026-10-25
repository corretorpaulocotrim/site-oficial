# Paulo Cotrim AI Studio

Estúdio audiovisual imobiliário com IA. Você envia o vídeo, o PDF do empreendimento e as fotos. O estúdio lê o material, escreve o roteiro e monta a campanha na linha do tempo: legendas palavra a palavra, cortes, transições, sobreposições, emojis do assunto, trilha e a sua marca. Você revisa num editor de verdade e exporta em 9:16, 4:5, 1:1 e 16:9.

O estúdio é independente: roda no seu computador ou no seu servidor, com código, dependências, testes e documentação incluídos. A edição, a renderização, as legendas e o OCR são **locais e gratuitos**. O Claude (roteiro) e a ElevenLabs (voz) são **opcionais** e pagos por uso.

---

## 1. Instalar e abrir

**Requisito:** Node.js 20 ou superior (https://nodejs.org). O FFmpeg vem junto.

| Sistema | Como abrir |
|---|---|
| Windows | Dois cliques em `INICIAR-WINDOWS.bat` |
| Mac | Dois cliques em `INICIAR-MAC.command` |
| Terminal | `npm install` e depois `npm start` |
| Servidor (Docker) | `cp .env.example .env` → defina `APP_SENHA` → `docker compose up -d` |

O navegador abre em **http://localhost:3333**. Na primeira legenda automática, o app baixa o modelo de IA (cerca de 150 MB). Depois disso, tudo funciona sem internet.

## 2. Fluxo de trabalho

1. **Auto Edit**: crie o projeto (pode escolher o empreendimento direto do catálogo do site), arraste o vídeo em que você fala, o PDF, as fotos e a música.
2. Escolha **objetivo** (interesse, diferenciais, desejo, objeções, institucional), **posicionamento** (econômico, médio-alto, luxo, institucional), **duração** (15 a 90 s), **estilo** e **edição** (criativa ou conservadora).
3. O estúdio:
   - detecta a sua fala e corta as pausas, com zoom alternado nos cortes;
   - transcreve e sincroniza a legenda palavra a palavra;
   - coloca a planta, o lazer e a localização **no segundo em que você fala do assunto**, com você num círculo por cima;
   - adiciona gancho, fichas com dados reais, chamada para ação e tela final.
4. Cada decisão automática aparece em **Sugestões** para você revisar. Ajuste o que quiser no **Editor** e clique em **Prévia renderizada** ou **Exportar**.

### Editor (uso manual)
- Faixas: **Vídeo principal**, **Sobreposição**, **Textos**, **Legendas** e **Áudio**.
- Arraste uma mídia para uma faixa; arraste um bloco para mover; puxe a borda do bloco para aparar.
- Atalhos: <kbd>Espaço</kbd> reproduz · <kbd>S</kbd> divide · <kbd>Del</kbd> apaga · <kbd>Ctrl+D</kbd> duplica · <kbd>Ctrl+Z</kbd>/<kbd>Ctrl+Shift+Z</kbd> desfaz/refaz · <kbd>←</kbd>/<kbd>→</kbd> avança um quadro · <kbd>Ctrl+roda do mouse</kbd> dá zoom na linha do tempo.
- Inspetor: entrada e duração, velocidade, volume, zoom, enquadramento (preencher, inteiro com fundo desfocado ou cartão), **ponto de foco** (reenquadra cada formato sem cortar o apresentador), movimento, transição, brilho, contraste e saturação.
- O projeto salva sozinho a cada alteração. Uma versão é guardada a cada 2 minutos e antes de cada exportação (botão **Versões**).

### PDF Intelligence
- Extrai o texto de cada página. Página escaneada passa por OCR em português, que roda offline.
- Extrai as fotos embutidas do book em resolução original e descarta fundos e molduras repetidos.
- Classifica cada página como planta, lazer, localização, ficha técnica, fachada, decorado ou condições.
- Tira os fatos **com a página de origem**: tipologias, metragens, preços, endereço, distâncias, lazer, entrega e validade da tabela.
- Separa **extraído** (veio do texto) de **confirmar** (inferência).
- Alerta quando a tabela está vencida, quando há valores "a partir de" diferentes e quando há preço sem validade.
- O roteirista monta gancho, cenas, falas para gravar, texto de tela, fonte de cada dado, CTA e legenda do post, e manda tudo para o editor.

## 3. Arquitetura

```
Navegador (public/)  ──HTTP/JSON──►  Servidor Node (src/server.js)
  editor.js  linha do tempo,          ├─ projetos.js   projetos em disco + versões
             inspetor, undo/redo      ├─ jobs.js       fila de tarefas: progresso, cancelamento, repetição
  preview.js prévia ao vivo           ├─ render/       FFmpeg: trechos em cache, xfade, overlays, libass, áudio
  app.js     páginas                  ├─ ia/           pdf.js · transcricao.js · diretor.js · llm.js · tts.js
  modelo.js  ◄── mesmo código ──►     ├─ presets.js    biblioteca de estilos (JSON)
             da linha do tempo        └─ marca.js      identidade oficial
                                      dados/  projetos/<id>/{projeto.json, midia/, cache/, export/, versoes/}
```

**Escolhas e por quê**

| Escolha | Motivo |
|---|---|
| Node.js + JavaScript sem etapa de build | Roda com um duplo clique, sem compilar; você já tem Node. Cada arquivo é editável direto. |
| FFmpeg para compor e renderizar (não Remotion) | Render no servidor, sem navegador aberto; muito mais leve. O Remotion exige Chromium e tem licença paga para empresas. |
| Projetos em JSON no disco (não PostgreSQL) | Um usuário, poucos projetos: backup é copiar a pasta `dados/`. O caminho para banco de dados fica aberto se virar uma equipe. |
| `modelo.js` compartilhado entre navegador e servidor | A prévia e o arquivo final usam a mesma matemática da linha do tempo. |
| Whisper (transformers.js) e Tesseract locais | Gratuitos, privados e offline depois do primeiro download. |
| Adaptadores de IA separados (`src/ia/`) | Trocar ou incluir fornecedor sem mexer no editor. |

## 4. Configuração

Copie `.env.example` para `.env`. Os principais campos:

- `HOST` / `PORT`: `127.0.0.1` deixa o estúdio acessível só neste computador. Com `0.0.0.0`, o app **exige** `APP_SENHA`.
- `DADOS_DIR`: onde ficam projetos, mídias e renders. É a pasta do backup.
- `WHISPER_MODELO`, `OCR`, `CONCORRENCIA`, `MAX_UPLOAD_MB`.
- Opcionais pagos: `ANTHROPIC_API_KEY` (roteiro com Claude, modelo padrão `claude-opus-5-5`) e `ELEVENLABS_API_KEY` + `ELEVENLABS_VOZ` (voz autorizada).

As correções de palavras na legenda (ex.: `fgts` → `FGTS`) ficam em `config.json`. A identidade (logo, cores, contatos, tela final) é editada em **Configurações**.

## 5. Testes

```
npm test
```
São 10 testes, que geram os próprios arquivos de teste sem dados pessoais. Eles cobrem a matemática da linha do tempo, as legendas, o PDF Intelligence, o fluxo importar → Auto Edit → editar → renderizar 9:16 e 1:1 com validação → cancelar → salvar/reabrir/duplicar, e a API HTTP (upload, render, Range e bloqueio de path traversal). Os resultados estão em `docs/TESTES.md`.

## 6. Documentação
- `docs/IMPLANTACAO.md`: servidor próprio, Docker, HTTPS, atualização.
- `docs/BACKUP.md`: backup e restauração.
- `docs/INTEGRACOES.md`: IA local e serviços externos, custos e como ativar.
- `docs/LICENCAS.md`: fontes, emojis, sons, bibliotecas e direitos de uso.
- `docs/AUDITORIA.md`: matriz de funcionalidades (testada / não validada / parcial / ausente).
- `docs/PESQUISA-E-ROTEIROS.md`: padrões de mercado aplicados e roteiro de gravação.
- `docs/TESTES.md`: o que foi testado e os resultados.

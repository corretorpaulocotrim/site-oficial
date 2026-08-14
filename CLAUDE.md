# CLAUDE.md — Cérebro do projeto (Site Oficial Paulo Cotrim)

> Este arquivo é lido primeiro em toda sessão. Ele existe para a IA **navegar sem reler o site inteiro** (economiza tokens) e **não repetir erros**. Aplica o ensinamento dos vídeos: índice/navegação (graphity), regras anti-erro (Karpathy) e mentalidade de review/segurança (plugins).

## 0. REGRAS DE OURO (não quebrar nunca)
1. **NÃO marque tarefa como feita sem ter feito e verificado.** Prove com `grep`/render/`node --check`.
2. **NÃO invente** arquivo, função, empreendimento, valor, telefone, API ou dado de imóvel. Se não existe/você não sabe: pergunte ou use "consulte disponibilidade". Fonte real sempre (books, tabelas, sites oficiais).
3. **Sempre valide JS inline browser-style** antes de publicar: separe cada `<script>` (split em `</script>`) e rode `node --check`. `</body>`/`</script>` dentro de string JS quebra o site todo. Isto já causou site travado — é obrigatório.
4. **Leia só o que precisa.** Use este índice + `grep`/`Grep` para localizar. Não abra arquivos inteiros sem necessidade.
   - **Navegação do conteúdo — SEMPRE consulte primeiro o grafo em `_grafo-projeto/00-MAPA.md`** (cofre Obsidian). Ele mapeia arquivos e dependências (`[[links]]`); navegue por ele antes de reler qualquer HTML/JS inteiro. (Ensinamento do Grafiphy: consultar o mapa reduz drasticamente o uso de tokens.)
5. **Antes de reconstruir um HTML** (truncação), diffe contra o último commit bom (fetch via API) — features somem em reconstrução.

## 0.5. COMPORTAMENTO (Karpathy — anti-erro de IA)
> Derivado das observações do Andrej Karpathy sobre onde a IA erra ao programar. Viés: cautela > velocidade (em tarefa trivial, bom senso).
1. **Pensar antes de codar.** Diga suas suposições. Se houver duas interpretações, apresente as duas — não escolha calado. Se existe caminho mais simples, fale. Se algo está confuso, pare e pergunte.
2. **Simplicidade primeiro.** O mínimo de código que resolve. Nada especulativo: sem feature além do pedido, sem abstração pra uso único, sem "flexibilidade" não pedida. Se escreveu 200 linhas e dava em 50, reescreva.
3. **Mudança cirúrgica.** Toque só no necessário. Não "melhore" código/comentário/formatação ao lado; não refatore o que não está quebrado; siga o estilo existente. Cada linha alterada tem que rastrear direto ao pedido do Paulo. (Isto protege contra perder features em reconstrução — ver Regra de Ouro 5.)
4. **Executar por meta verificável.** Vire a tarefa em critério de sucesso ("funcionar" é fraco). Ex.: "arrumar bug" → prove com `grep`/render/`node --check` que sumiu. Enuncie um plano curto: passo → verificação.

## 1. O QUE É / STACK
- Site imobiliário independente de Paulo Cotrim (corretor RJ, CRECI-RJ 77677-F, 18 anos, MCMV/financiamento). Domínio **paulocotrim.com.br** (CNAME) via **GitHub Pages** (repo `corretorpaulocotrim/site-oficial`).
- HTML/CSS/JS puro (sem build). ~66 páginas + ~11 JS. Leaflet p/ mapas. Tesseract.js no CRM.
- Telefone oficial: **(21) 98915-0864**. Instagram: **@corretor.paulocotrim**.

## 2. MAPA DOS ARQUIVOS (índice de navegação)
- `index.html` — home. Contém `var EMP=[...]` (**52 empreendimentos** do mapa) e a maior parte da UI.
- `simulador.html` — simulador standalone. Contém `CATALOG=[...]` (mesmos 52) + motor Caixa 2026 (FAIXAS_MCMV, prazo 420). `render()` preserva foco; gate de renda com botão Continuar.
- `financing-sim.js` — motor de simulação embutido nas páginas de empreendimento (`initSimuladorEmbed('fsimEmbed',{preco,construtora,nome,bairro})`).
- `leads.js` — **roda em todas as páginas**. Faz: lead-gate (`pcLeadGate`), trava de tabela+simulador até WhatsApp (cai no CRM), injeta "No dia a dia do bairro" (usa `bairro-info.js`), logo-chave nos CTAs "Falar com Paulo Cotrim", sticky-cta, painel transparência, tracking bridge, carrega `crm-config.js`.
- `bairro-info.js` — `window.BAIRRO_INFO` (36 bairros, dado real pesquisado: transporte/saúde/educação/compras/lazer). Match por substring; **cidade antes de "centro"** (longest-match). Nunca inventar.
- `crm-config.js` — `enviarLeadCRM` (POST text/plain p/ Apps Script) + `crmBackendGet`. webhookUrl LIVE (token `pcotrim2026`).
- `crm.html` = `adm.html` = `adm/index.html` — CRM (login **paulo/102030**). `var defaultIm=[...]` (**40 imóveis**, seed versão `real52-2026`). OCR inteligente (`parseContatosOCR` + `_preprocess`). `recomenda(renda)` sugere por rendaMin.
- `imovel-template.js` — componentes renderizados nas páginas de empreendimento.
- `sw.js` — service worker **network-first p/ HTML**. `CACHE_NAME` = `paulocotrim-vNN` — **incrementar a cada push** (senão o usuário vê versão velha).
- `tracking-config.js` — ponte real de GA4/Pixel/GSC (NÃO leads.js). Editar analytics AQUI.
- `emp-*.html` / `farol-da-guanabara.html` etc. — páginas de empreendimento (padrão: hero, ficha, lazer, mapa, simulador embed, análise, FAQ, CTA).
- `emp-img/` — capas. `tabelas/` — PDFs oficiais (ex: Saudosa agosto).

## 3. IDENTIDADE / REGRAS DE MARCA
- Clicáveis/CTA de ação = **VERDE #1a8f4c** + fonte **Fraunces** (títulos). Fluxo de documentos = **dourado #b8873a**. Corpo = Inter. Petróleo #0f2e36.
- **Sem verde antigo #3E8E5A, sem roxo, sem rosa/arco-íris.** Paleta = petróleo + verde + dourado + neutro.
- **De-Cury:** remover identidade de Paulo como Cury ("Coordenador/Equipe/especialista Cury", "nossa equipe"); manter dado factual de construtora. Paulo é **independente**.
- **Nada de número de marketing sem base** (ex.: "700+/721 famílias" foi removido). Promessa responsável: "análise inicial em até 48h úteis", não "aprovado em 48h".
- Logo: a chave (selo `00-MARCA/LOGO-2026`). Marca d'água nas peças = **só a chave dourada, discreta, canto superior direito** (a identidade da arte já prevalece).
- **CRECI-RJ (autoridade):** Paulo atua na rua com o **cordão do CRECI-RJ**. O **logo/selo do CRECI-RJ 77677-F** deve aparecer no **app do corretor** e nas peças, pra passar credibilidade. (Falta o PNG oficial do CRECI — usar selo estilizado até o Paulo enviar; NÃO clonar a marca.)
- **"Financiamento Caixa" (regra fixa):** todo lugar que fala **"financiamento"** usa o **botão/selo "Financiamento CAIXA"** — azul Caixa #0058A3, texto branco. Paulo aprovou esse padrão. (Sem logo oficial da Caixa nos arquivos → selo estilizado "CAIXA" até ele enviar o PNG.)

## 4. WORKFLOW DE PUBLICAÇÃO (só com token do Paulo)
- Push via **GitHub Data API** com **tree inline-content** (evita timeout de blobs individuais). Binários (jpg/pdf) via blob+base64.
- Token: `umask 077; printf '%s' 'TOKEN' > ~/.tok; chmod 600 ~/.tok` → usa `Authorization: token $(cat ~/.tok)` → `rm -f ~/.tok` **imediatamente**. Nunca ecoar o token. Sempre lembrar o Paulo de **revogar** após uso.
- Todo push: **incrementar `CACHE_NAME` do sw.js** e avisar "feche e reabra o site 1x".
- OneDrive/mount é LENTO p/ muitos arquivos → gerar em `/tmp` e entregar **1 ZIP** (não copiar centenas de arquivos no mount).

## 5. VERIFICAÇÃO (obrigatória antes de "pronto")
- `node --check` em todo `.js` e nos `<script>` inline de todo `.html`.
- Render headless (Chromium sandbox: `LD_LIBRARY_PATH=~/locallibs/...`, `--no-sandbox --disable-dev-shm-usage --disable-gpu`) para conferir visual/pins/erros de página.
- Conferir: 52 no mapa e no simulador · 0 link interno quebrado · 0 identidade Cury · 0 número de família de marketing.

## 6. HISTÓRICO / DECISÕES (não refazer discussões já fechadas)
- Home rejeitou hero cinematográfico ("bruto") — ousado só no splash/region-gate; home conservadora.
- "Sem sair de casa" = posicionamento central. Jornada 100% digital.
- Valores só após WhatsApp (lead-gate) — captação é prioridade comercial.
- Marketing: pasta por tipo (POST/REELS/CARROSSEL/AUTORIDADE) + provas reais intercaladas; legendas do pacote 250.

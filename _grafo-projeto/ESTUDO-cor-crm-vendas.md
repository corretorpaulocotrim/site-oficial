---
tipo: project
fonte: pedido do Paulo — auditoria de cor + melhorias CRM + estudo dos melhores vendedores
---
# Estudo — Auditoria de cor · Melhorias do CRM · Cérebros de vendas

## PARTE 1 — Auditoria de cor (o site está colorido demais?)
Dados reais (contagem de cores no site):

**Núcleo da marca — MANTER:** petróleo `#0f2e36`, verde `#1a8f4c`, dourado `#b8873a`, branco, e 1 escala de neutro.

**Fora da paleta — TIRAR / UNIFICAR (é o que deixa "arco-íris"):**
- **Roxo `#8b5c8f`** e **azul-petróleo `#0f6e8c`** — são cores de **pin de construtora no mapa**. Deixam o mapa colorido. → Unificar todos os pins a **dourado + 1 cinza** (só isso já limpa muito).
- **Verde WhatsApp `#25d366`** e **verde vivo `#4ade80`** → trocar pelo **verde da marca `#1a8f4c`** (sua regra antiga: todo WhatsApp no verde da marca).
- **Variações de dourado** (`#cf9f4f`, `#a5772e`, `#a5691f`, `#8a5c1c`) → padronizar em `#b8873a` (no máx. 1 tom claro).
- **Excesso de cinzas diferentes** (`#6b7280`, `#94a3b8`, `#64748b`, `#475569`, `#9ca3af`, `#42565b`) → reduzir a **3 cinzas** só.
- **Azul Caixa `#0058a3`** → MANTER (é regra sua, o selo Caixa).

**Resultado:** menos "colorido", mais premium e sério — combina com decisão de dinheiro/financiamento.
**Como aplicar:** trocar tokens no `:root` (CSS) + o campo `cor` dos 52 no `EMP` (de 4 cores → 2). Mudança cirúrgica, pronta pro próximo publish.

## PARTE 2 — Melhorias do CRM (observação)
- **Fonte única dos 52** — o CRM puxar imóveis/valores do site (hoje é cadastro separado → divergência de preço).
- **Simulador na rua, não no CRM padrão** — simular com o cliente pelo Modo Corretor; o CRM fica pra gestão. (alinhado)
- **Funil visual (kanban)** por status: novo → contatado → simulação → docs → aprovação → fechado.
- **Follow-up automático** — lembrete de retomar lead frio (o campo "próxima ação").
- **Temperatura visível/ordenável** (quente/morno/frio — já existe).
- **Origem do lead** (site, rua, OCR, indicação) medida — saber o que converte.
- **Consentimento LGPD por lead** (já implementado no quiz de rua).

## PARTE 3 — Cérebros de vendas (técnicas aplicadas às ferramentas)
- **SPIN Selling (Neil Rackham):** Situação → Problema → Implicação → Necessidade. O quiz de rua já segue: "paga aluguel?" (problema), "prazo?" (implicação).
- **Venda consultiva:** perguntar antes de oferecer (quiz). Não empurrar imóvel.
- **Gatilhos do Cialdini (éticos):** prova social (depoimentos reais), autoridade (CRECI + 18 anos), reciprocidade (entregar valor: os 2 QR), escassez **só se real** (unidades limitadas de verdade).
- **Dor do aluguel** = âncora emocional central (já no posicionamento).
- **Follow-up é onde a venda acontece:** sequência de WhatsApp dia 0 / 2 / 7 — a montar no CRM.
- **Confiança > pressão:** nunca prometer aprovação (blindagem 48h já feita).

## PARTE 4 — Adicionar contatos do celular como clientes + mensagem em grupo (CAUTELA — ler antes)
O que você quer (importar todos os contatos do WhatsApp como clientes pra disparar em grupo depois) tem **dois riscos sérios** que eu preciso te falar:
1. **Banimento do WhatsApp:** disparo em massa pra quem **não pediu** contato viola a política do WhatsApp e **bane o número** (inclusive o Business). É a causa nº1 de conta derrubada.
2. **LGPD:** mandar marketing pra contato sem **consentimento** é infração — multa e reclamação.

**O caminho certo (que eu te ajudo a montar):**
- Importar os contatos como **lista privada no CRM** (é seu dado, tudo bem organizar).
- Mensagem em grupo **só** para quem **consentiu** (ex.: os leads do quiz que aceitaram) — e via **Lista de Transmissão** do WhatsApp (não grupo), com opção de sair.
- Aquecer aos poucos, mensagem pessoal, não robótica — assim não cai em spam.

Ou seja: organizar seus contatos — **sim**. Disparar em massa pra todo mundo — **não**, te protejo disso.

Liga em: [[00-MAPA]] · [[ESTUDO-abordagem-de-rua]] · [[site_oficial_crm_backend_appsscript]]

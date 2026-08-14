---
tipo: regra
fonte: Andrej Karpathy — LLM coding pitfalls (multica-ai/andrej-karpathy-skills)
---
# Comportamento da IA (Karpathy)

Regras que impedem os erros mais comuns de IA ao mexer no site. Viés: cautela > velocidade.

1. **Pensar antes de codar** — dizer suposições; se há duas interpretações, mostrar as duas; se há caminho mais simples, falar; se confuso, parar e perguntar.
2. **Simplicidade primeiro** — mínimo de código que resolve; nada especulativo. 200 linhas que davam 50 → reescrever.
3. **Mudança cirúrgica** — tocar só no necessário; não refatorar o que não quebrou; seguir o estilo existente. Protege contra perder feature em reconstrução (ver [[REGRAS-DE-OURO]] item 5).
4. **Meta verificável** — "funcionar" é fraco; provar com `grep`/render/`node --check`. Enunciar plano curto: passo → verificação.

## Método spec-driven (GitHub Spec Kit — vídeo 18)
Para tarefa grande: **1) especificação** (deixar claro o que precisa ser feito) → **2) plano** → **3) quebrar em tarefas menores** → **4) só então executar**. Guia a IA em vez de torcer pra ela acertar. Extensão prática do item 1 (pensar antes de codar) + item 4 (meta verificável).

Liga em: [[00-MAPA]] · [[REGRAS-DE-OURO]] · [[ECONOMIA-DE-TOKENS]]

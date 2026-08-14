---
tipo: project
fonte: pedido do Paulo — quiz/entrevista de captação presencial (tablet na rua)
---
# Estudo completo — Abordagem de Rua (quiz de captação) no Modo Corretor

## 1. O que é e por que funciona
Uma tela leve, tipo **entrevista guiada**, que o Paulo usa no tablet ao abordar alguém na rua (ou em stand/feira). Em vez de "quer ver um apê?", vira uma conversa curta que **qualifica** a pessoa e **captura o contato** com naturalidade. No fim, ela sai com **dois QR Codes**: o contato do Paulo e o condomínio/site que ela viu. O "vou ver depois" deixa de ser perda — vira lead no CRM.

Por que converte: a pessoa **responde** (compromisso psicológico), o Paulo **escuta** (entende renda/região/intenção) e a saída é **útil pra ela** (QR que ela leva). Ninguém sente que está "dando o telefone pra um vendedor".

## 2. Contexto de uso (importante pro desenho)
- **Tablet na mão, na rua** → pode ter **internet ruim**. A ferramenta tem que **funcionar offline** e **sincronizar depois** (salva local, manda pro CRM quando tiver sinal).
- **Rápido** → a abordagem inteira em **30–60 segundos**. Máximo 5–6 toques.
- **Tela grande e botões grandes** → a pessoa às vezes toca junto. Interface objetiva, letra grande.

## 3. O fluxo em 4 momentos
1. **Abertura (gancho)** — tela com 1 pergunta que prende. Ex.: *"Você sabia que dá pra sair do aluguel pagando parecido com o que já paga?"* → botões **Sim / Como assim?**
2. **Entrevista curta (quiz)** — 4 a 5 perguntas de toque único (sem digitar). Cada resposta qualifica.
3. **Captação** — só aqui pede **nome + WhatsApp**, com **consentimento** (ver seção 7). Enquadra: *"Te mando as opções da sua região no WhatsApp, pode ser?"*
4. **Entrega** — tela final com **2 QR Codes** + botão "Abrir no WhatsApp agora".

## 4. Roteiro do quiz (perguntas propostas — todas de toque)
Pensado como especialista em financiamento/MCMV. Ordem do leve → pro específico:

1. **Região** — "Onde você sonha em morar?" → chips por região (Centro, Porto Maravilha, Zona Norte, Niterói, Jacarepaguá, São Gonçalo, Baixada...). *(usa as mesmas regiões do site)*
2. **Objetivo** — "É pra **morar** ou **investir**?" → 2 botões.
3. **Momento** — "Hoje você **paga aluguel**?" → Sim / Não / Moro com família. *(aluguel = dor forte)*
4. **Renda (faixa, não valor exato)** — "Sua renda familiar fica em qual faixa?" → faixas (até 2.640 / 2.640–4.400 / 4.400–8.000 / 8.000+). *(define enquadramento MCMV e o que recomendar)*
5. **FGTS** — "Você tem **FGTS** ou tempo de carteira?" → Sim / Não / Não sei. *(entrada/subsídio)*
6. **(opcional) Prazo** — "Pensa em resolver isso em quanto tempo?" → Agora / 3–6 meses / Só olhando.

> Regra de ouro: **nunca inventar** número de subsídio/parcela na tela. O quiz **qualifica e recomenda um caminho** ("você provavelmente se enquadra no MCMV — eu confirmo pra você"), a conta real fica pra simulação/análise. Isso protege a promessa (mesma lógica do 48h blindado).

## 5. Qualificação automática (o que o CRM faz com as respostas)
- Cruza **renda + região + objetivo** e já **recomenda o condomínio** certo (reaproveita o `recomenda(renda)` que o CRM já tem, por `rendaMin`).
- Marca a **temperatura** do lead: paga aluguel + prazo "agora" = **quente**; "só olhando" = morno/frio.
- Preenche `origem: "abordagem-rua"` e a região escolhida → dá pra medir depois quantas vendas vieram da rua.

## 6. Os dois QR Codes da tela final
- **QR 1 — Contato do Paulo**: abre o WhatsApp já com mensagem pronta ("Oi Paulo, conversamos na rua sobre [região]"). Opcionalmente um **vCard** (salva o contato na agenda).
- **QR 2 — Condomínio/site**: leva à página do condomínio que ela viu (ou à home), **com rastreamento** (utm_source=qr&medium=rua&content=<condo>).
- Gerados **localmente** (biblioteca leve, offline) — não depende de site de terceiro.

## 7. LGPD / Consentimento (OBRIGATÓRIO — não pular)
Capturar telefone/WhatsApp é **dado pessoal**. Pela LGPD, precisa de **consentimento claro**:
- Na tela de captação, um texto curto + caixa: *"Autorizo o Paulo Cotrim a me chamar no WhatsApp com opções de imóveis."* Só habilita o "Enviar" com o aceite.
- Registrar **data/hora do consentimento** junto do lead.
- Não pedir CPF/renda exata na rua (faixa basta). Menos dado sensível = menos risco.
Isso protege o Paulo juridicamente e passa seriedade.

## 8. Segurança e dados
- Lead salvo **local (offline-first)** e sincronizado com o backend do CRM (Apps Script/Sheets) quando houver sinal — nada se perde por falta de internet.
- Nada de dado sensível trafegando em URL (o WhatsApp/telefone vai no corpo, não no link).

## 9. Integração no CRM (onde isso vive)
- Botão **"Abordagem de Rua"** dentro do **Modo Corretor** (que por sua vez está dentro do CRM, login paulo/102030).
- Cada abordagem finalizada cai na **lista de leads** do CRM com origem, região, faixa de renda, temperatura e recomendação — pronto pro follow-up.

## 10. Plano de construção (fases)
- **Fase 1 (MVP):** quiz de 5 telas + captação com consentimento + 2 QR + salvar lead local. Funciona offline. *(entrega rápida, já usável na rua)*
- **Fase 2:** sync automático com o backend do CRM + recomendação de condomínio na tela final.
- **Fase 3:** métricas (quantas abordagens, taxa de captura, quantas viraram WhatsApp) no painel do CRM.

## 11. O que medir (pra saber se vale)
Abordagens iniciadas · % que chega ao fim · % que deixa WhatsApp · % que abre o WhatsApp na hora · leads-rua que viraram atendimento.

---
Liga em: [[00-MAPA]] · [[site_oficial_crm_backend_appsscript]] · [[PROMPTS-PODEROSOS]]

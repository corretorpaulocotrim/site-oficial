---
tipo: regra
fonte: Anthropic frontend-design skill (oficial) + padrão ORYZO do projeto
---
# Design cinematográfico (capacidade + trava)

A IA sabe gerar hero premium: vídeo/imagem de fundo em tela cheia, efeito "liquid glass",
tipografia display refinada, letter-spacing apertado, sensação cinematográfica.

## Onde PODE usar (ousado)
- **Splash / portão de região** — abertura cinematográfica.
- **Páginas de empreendimento** — seguir o **padrão ORYZO** (modelo: experiencia-primor-carioca.html).
  Rollout às demais páginas ainda pendente.

## Onde NÃO usar (trava — decisão fechada do Paulo)
- **[[index.html]] (home)** fica **conservadora**. Paulo rejeitou hero cinematográfico na home ("bruto").
  Ver [[00-MAPA]] §Histórico.

## Regras de design "de verdade" (Apple Design skill — vídeo 25)
Pra ficar premium e NÃO ter cara de "AI slop" (genérico de IA):
- **Espaçamento** consistente e generoso; hierarquia clara.
- **Movimento com física** — molas/ease naturais, não linear robótico; a animação segue o gesto.
- **Rubber-banding** — nas bordas, resistir de forma progressiva (não travar seco).
- **Profundidade em movimento** — animar transform/opacity (não layout/paint), leve e fluido.
- Sinalizar a direção do gesto antes do movimento acontecer.

## "Cadeia de vídeo" no site (ref.: vídeo Nova Leopoldina / KlingAI)
A IA NÃO gera vídeo por IA (Kling/drone = produção de vídeo, fora do escopo). MAS replica a experiência no site:
- **Embutir** o vídeo do Paulo como fundo do hero: `<video autoplay muted loop playsinline poster>`.
- **Recriar o efeito** em web: contorno do lote que acende (SVG stroke animado), título surgindo em Fraunces, callout dourado (ex.: estação BRT), card final de lançamento com CTA verde.
- Demo pronto: `outputs/demo-cinematografico.html` (identidade petróleo/verde/dourado + chave).

## Regras de marca que valem sempre
Verde #1a8f4c + Fraunces nos CTAs; dourado nos docs; petróleo #0f2e36. Ver [[IDENTIDADE-MARCA]].
Aplicar sempre com **mudança cirúrgica** ([[COMPORTAMENTO-KARPATHY]]) — não perder feature em redesign.

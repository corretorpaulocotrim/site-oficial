# Auditoria Final e Refinamento Premium — Relatório

Site: paulocotrim.com (GitHub Pages) · Data: 14/07/2026

## O que foi corrigido nesta rodada

**Favicon/PWA** — favicon novo (monograma "PC" nas cores do site), gerado em todos os formatos (ico, PNGs 16/32/192/512, apple-touch-icon) e aplicado nas 59 páginas do site, incluindo `obras-decorados.html`, que não tinha favicon nenhum. `manifest.json` atualizado.

**PDFs (resumo, tabela de vendas, análise do investidor)** — todos os PDFs gerados pelo site (simulador, páginas de empreendimento, Primor Carioca, investidor) agora trazem os 7 itens obrigatórios: logo Paulo Cotrim, marca d'água discreta, texto do site, QR code, nome do empreendimento, data de geração e aviso de estimativa. Antes, só nome e aviso apareciam — faltavam logo, marca d'água, data e o site por escrito. Corrigido: o QR code agora abre o WhatsApp direto com o Paulo (antes voltava só para a página). Como o `fsimDownload()` do `financing-sim.js` é compartilhado, a correção vale para todas as ~46 páginas de empreendimento de uma vez.

**Home** — reordenada conforme a sequência pedida (Busca → Destaque → Mapa → Aprovação Expressa → Simulador → Lançamentos → Área do Investidor → Contato), estatísticas antigas ("31 empreendimentos", "16 construtoras") corrigidas para os números reais (46 e 15).

## Achados que ainda precisam de decisão sua

**1. Ordem das 14 etapas nas páginas de empreendimento — não bate com o padrão pedido.**
Conferi a ordem real (ex: Oceanside Recreio) contra a sequência que você definiu (Hero → Resumo → Faixa de preço → Diferenciais → Mapa → Por que comprar → Lazer → Plantas → Simulador → Fluxo → Aprovação Expressa → FAQ → Relacionados → WhatsApp). Duas seções inteiras não existem em nenhuma das 47 páginas: **galeria de Plantas** e **Empreendimentos relacionados** (0/47 em ambos). FAQ visível existe em 42/47 — falta em 5 páginas mais novas (Oceanside Recreio, Ritmos de Pilares, Reserva Redentor, Encantos da Zona Norte, Porto Maravilha). A ordem das seções existentes também varia bastante de página pra página.
Isso é trabalho grande — criar 2 tipos de seção novos e reordenar 47 arquivos. Criei a tarefa (#302) mas não comecei a construir sozinho: prefiro confirmar com você antes de mexer em todas as páginas de uma vez, já que você pediu pra não reconstruir a arquitetura do site.

**2. Aprovação Expressa não está enviando e-mail — falta um passo seu.**
O código que salva os documentos no Google Drive e manda e-mail de aviso pra você (`google-apps-script-upload-documentos.gs`) já está pronto e correto — nome, WhatsApp, pasta do Drive, links dos arquivos. Mas ele nunca foi publicado: o campo `uploadUrl` em `doc-upload-config.js` está vazio. Sem isso, quando alguém envia documento pela Aprovação Expressa, o site cai automaticamente no fallback e abre o WhatsApp pra pessoa mandar o arquivo direto pra você por lá — então nada se perde, mas você não tem os documentos organizados no Drive nem o e-mail de aviso.
Pra ativar: abra o Google Apps Script, cole o conteúdo de `google-apps-script-upload-documentos.gs`, publique como app da Web (executar como você, acesso "qualquer pessoa"), copie o link gerado e cole no `uploadUrl` de `doc-upload-config.js`. Isso só pode ser feito por você, é uma ação na sua conta Google.

## Bloqueado, aguardando você

**Modelo de mapa** — você disse que vai mandar um modelo padrão de mapa pra usar em todo o site. Não fiz nada aqui ainda porque não quero adivinhar o design.

**Domínio paulocotrim.com** — segue fora do ar (erro de DNS/registro, não é do site). O GitHub Pages está funcionando normalmente.

## O que já estava certo (não precisou mexer)

Simulador com renda obrigatória, cálculo de financiamento, plano de entrada editável, Aprovação Expressa item-por-item, Área do Investidor, emojis removidos, SEO (schema, sitemap, meta tags), acessibilidade básica, 46 empreendimentos cadastrados e sincronizados entre catálogo e simulador.

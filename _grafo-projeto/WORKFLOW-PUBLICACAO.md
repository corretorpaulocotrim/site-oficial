---
tipo: regra
---
# Workflow de Publicação
- Push via GitHub Data API (tree inline-content p/ texto; blob+base64 p/ binário).
- Token no `~/.tok`, usar e `rm -f` na hora; nunca ecoar; lembrar de revogar.
- Todo push: incrementar `CACHE_NAME` no [[sw.js]] + avisar "feche e reabra o site 1x".
- OneDrive lento p/ muitos arquivos → gerar em /tmp e entregar 1 ZIP.

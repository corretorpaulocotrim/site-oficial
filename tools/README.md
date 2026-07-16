# tools/smoke_test.py

Roda antes de qualquer push para o site. Verifica, em todas as paginas do sitemap:

- HTTP 200
- Sintaxe valida de todo <script> inline (via `node --check`)
- Balanceamento de tags <div>/<section>/<script>/<style>

## Uso

```
python3 tools/smoke_test.py
```

Se `RESULTADO: tudo OK`, e seguro fazer push. Se falhar, ele aponta a pagina e a linha do problema — NAO faca push ate corrigir.

Criado em 2026-07-15 depois de o smoke test pegar uma <div> nao fechada no hero do index.html (bug real, ja corrigido).

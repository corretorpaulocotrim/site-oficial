# Backup e restauração

Tudo o que importa fica em **uma pasta**: `dados/` (ou a pasta definida em `DADOS_DIR`).

| Subpasta | Conteúdo | Precisa de backup? |
|---|---|---|
| `projetos/<id>/projeto.json` | linha do tempo, textos, legendas, roteiro | **sim** |
| `projetos/<id>/midia/` | vídeos, fotos, PDFs e páginas extraídas | **sim** |
| `projetos/<id>/export/` | MP4 finais, capas, SRT | sim |
| `projetos/<id>/versoes/` | versões anteriores do projeto | recomendado |
| `projetos/<id>/cache/`, `tmp/` | trechos pré-renderizados | não (são refeitos) |
| `presets/`, `marca.json`, `marca/` | seus presets e identidade | **sim** |
| `modelos/` | modelos de IA baixados | não (são baixados de novo) |
| `jobs.json` | histórico de tarefas | não |

## Fazer backup
- **Windows:** copie a pasta `dados` para um HD externo ou uma pasta sincronizada (OneDrive/Google Drive). Pode excluir `cache`, `tmp` e `modelos`.
- **Linux/Docker:**
  `tar --exclude='*/cache' --exclude='tmp' --exclude='modelos' -czf backup-studio-$(date +%F).tgz dados/`

## Restaurar
1. Pare o estúdio.
2. Coloque a pasta `dados` de volta no lugar (ou extraia o `.tgz`).
3. Inicie o estúdio. Os projetos aparecem em **Projetos**.

## Voltar uma versão de um projeto
No editor, clique em **Versões** e depois em **Restaurar**. A versão atual também é guardada antes da troca.

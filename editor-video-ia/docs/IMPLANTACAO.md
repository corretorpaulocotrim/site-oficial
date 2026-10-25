# Implantação e atualização

## A) No seu computador (recomendado para começar)
1. Instale o Node.js 20+.
2. Copie a pasta `editor-video-ia` para o computador (ou `git clone` do repositório).
3. Windows: `INICIAR-WINDOWS.bat` · Mac: `INICIAR-MAC.command` · Linux: `npm install && npm start`.
4. Acesse http://localhost:3333. Por padrão, só este computador enxerga o estúdio.

## B) Servidor próprio com Docker (VPS, servidor do escritório)
```bash
git clone <repositório> && cd site-oficial/editor-video-ia
cp .env.example .env        # defina APP_SENHA (obrigatório na rede)
docker compose up -d --build
```
- O container escuta em `0.0.0.0:3333` e exige login com `APP_SENHA`.
- Os dados ficam em `./dados` (volume) e sobrevivem a atualizações.
- **HTTPS:** coloque o estúdio atrás de um proxy reverso (Caddy, Nginx ou Traefik) com certificado. Exemplo com Caddy:
  `estudio.seudominio.com.br { reverse_proxy 127.0.0.1:3333 }`.
- Requisitos sugeridos: 4 vCPU, 8 GB de RAM e disco de acordo com o volume de vídeos (cerca de 1 GB por projeto típico).

## C) Servidor sem Docker (Linux)
```bash
sudo apt install ffmpeg            # opcional: usa o FFmpeg do sistema
npm ci --omit=dev
HOST=0.0.0.0 APP_SENHA=... FFMPEG_PATH=/usr/bin/ffmpeg FFPROBE_PATH=/usr/bin/ffprobe node src/server.js
```
Para manter rodando, use um serviço `systemd` ou o `pm2`.

## Atualizar
- **Docker:** `git pull && docker compose up -d --build`.
- **Local:** `git pull && npm install`, depois reinicie.
- Projetos antigos continuam abrindo: o formato do projeto tem campo `versao`, e os presets são completados com os valores padrão.

## Encerrar tarefas e limpeza
- As tarefas (renderização, PDF, Auto Edit) rodam no servidor e continuam com a página fechada.
- Se o servidor reiniciar no meio de uma tarefa, ela é marcada como "interrompida" e pode ser repetida em **Renderizações**.
- Arquivos temporários com mais de `RETENCAO_TMP_DIAS` dias são apagados automaticamente. O cache de trechos fica em `dados/projetos/<id>/cache` e pode ser apagado a qualquer momento: ele é refeito na próxima renderização.

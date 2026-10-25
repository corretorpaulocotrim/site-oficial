# Paulo Cotrim AI Studio — imagem para servidor próprio
FROM node:22-bookworm-slim
# ffmpeg do sistema (com libass/fontconfig para legendas) + fontconfig
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fontconfig ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV FFMPEG_PATH=/usr/bin/ffmpeg FFPROBE_PATH=/usr/bin/ffprobe HOST=0.0.0.0 PORT=3333 DADOS_DIR=/app/dados NO_OPEN=1
EXPOSE 3333
VOLUME ["/app/dados"]
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:3333/api/status').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]

#!/bin/bash
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Instale o Node.js 20+ em https://nodejs.org"; read; exit 1; }
[ -d node_modules ] || npm install --no-audit --no-fund
node server.js

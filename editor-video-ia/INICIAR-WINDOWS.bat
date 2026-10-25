@echo off
title Atlas Editor de Video - Paulo Cotrim
cd /d "%~dp0"
where node >nul 2>nul || (echo Instale o Node.js 20+ em https://nodejs.org e rode de novo. & pause & exit /b)
if not exist node_modules (echo Primeira vez: instalando... aguarde 1-3 min & call npm install --no-audit --no-fund)
node server.js
pause

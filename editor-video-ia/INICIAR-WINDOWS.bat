@echo off
title Paulo Cotrim AI Studio
cd /d "%~dp0"
where node >nul 2>nul || (echo Instale o Node.js 20 ou superior em https://nodejs.org e rode de novo. & pause & exit /b)
if not exist node_modules (echo Primeira vez: instalando dependencias, aguarde 1-3 min... & call npm install --no-audit --no-fund)
node src\server.js
pause

@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "NODE=node"
where node >nul 2>nul || set "NODE=%USERPROFILE%\.aside\runtime\node\node.exe"
echo 한양여대 항공과 사이트 로컬 서버 시작: http://localhost:4000/hywu-aviation/
echo (종료하려면 이 창을 닫거나 Ctrl+C)
start "" http://localhost:4000/hywu-aviation/
"%NODE%" serve.js "%~dp0." 4000
pause

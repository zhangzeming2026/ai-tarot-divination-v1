@echo off
chcp 65001 >nul
cd /d %~dp0
if not exist .env if exist .env.example copy /Y .env.example .env >nul
echo.
echo 正在启动 AI 占卜程序...
echo.
start "" ai-diviner.exe
timeout /t 2 /nobreak

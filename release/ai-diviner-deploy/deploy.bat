@echo off
chcp 65001 >nul
cd /d %~dp0
if not exist .env if exist .env.example copy /Y .env.example .env >nul
echo Installing dependencies...
call npm.cmd install --omit=dev
if errorlevel 1 (
  echo Dependency installation failed.
  pause
  exit /b 1
)
echo Starting AI Diviner...
call npm.cmd run start
pause

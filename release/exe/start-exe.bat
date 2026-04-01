@echo off
if /I "%~1" neq "__min" (
  start "" /min cmd /c "%~f0" __min
  exit /b
)
chcp 65001 >nul
cd /d %~dp0
if not exist .env if exist .env.example copy /Y .env.example .env >nul
start "" wscript.exe "%~dp0start-exe.vbs"

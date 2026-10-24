@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20 or newer is required. Install it from https://nodejs.org/ and reopen this file.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing project dependencies. This requires an internet connection the first time...
  call npm install
  if errorlevel 1 (echo Dependency installation failed.& pause & exit /b 1)
)
echo Starting Study Desk. Keep this window open while using the app.
call npm run dev
pause

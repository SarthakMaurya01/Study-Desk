@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (echo Install Node.js 20 or newer from https://nodejs.org/ first.& pause & exit /b 1)
if not exist node_modules call npm install
if errorlevel 1 (echo Dependency installation failed.& pause & exit /b 1)
call npm run build
if errorlevel 1 (echo Build failed. See the error above.& pause & exit /b 1)
echo Build complete: dist folder created.
pause

@echo off
REM One-command frontend setup + run for Windows.
REM Usage: start_frontend.bat
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies - first run only, may take a minute...
  npm install
)

echo Starting frontend on http://localhost:5173 ...
npm run dev

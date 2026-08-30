@echo off
REM One-command backend setup + run for Windows.
REM Usage: start_backend.bat
cd /d "%~dp0"

if not exist venv (
  echo Creating virtual environment...
  python -m venv venv
)

call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
  echo Full install failed - likely pyzbar/Pillow which are optional on Windows.
  echo Retrying without them...
  findstr /v /i "pyzbar Pillow" requirements.txt > requirements_min.txt
  pip install -r requirements_min.txt
)

if not exist .env (
  copy .env.example .env
)

if not exist scamshield.db (
  echo Seeding demo data...
  python -m app.seed_data
)

echo Starting backend on http://localhost:8000 (docs at /docs)...
uvicorn app.main:app --reload --port 8000

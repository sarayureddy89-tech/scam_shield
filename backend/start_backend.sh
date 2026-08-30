#!/usr/bin/env bash
# One-command backend setup + run for macOS/Linux.
# Usage: ./start_backend.sh
set -e
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate
echo "Installing dependencies..."
pip install -r requirements.txt || {
  echo "Full install failed (likely pyzbar/Pillow, which are optional)."
  echo "Retrying without them..."
  grep -v -E "pyzbar|Pillow" requirements.txt > /tmp/req_min.txt
  pip install -r /tmp/req_min.txt
}

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

if [ ! -f "scamshield.db" ]; then
  echo "Seeding demo data..."
  python -m app.seed_data
fi

echo "Starting backend on http://localhost:8000 (docs at /docs)..."
uvicorn app.main:app --reload --port 8000

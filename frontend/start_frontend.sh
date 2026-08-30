#!/usr/bin/env bash
# One-command frontend setup + run for macOS/Linux.
# Usage: ./start_frontend.sh
set -e
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies (first run only, may take a minute)..."
  npm install
fi

echo "Starting frontend on http://localhost:5173 ..."
npm run dev

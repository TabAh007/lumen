#!/usr/bin/env bash
# Start the backend and frontend together. Ctrl-C stops both.
set -e
cd "$(dirname "$0")"

echo "Starting backend (http://localhost:5050)…"
( cd backend && npm start ) &
BACKEND_PID=$!

# Stop the backend whenever this script exits (Ctrl-C, error, etc.)
trap 'echo; echo "Stopping backend…"; kill "$BACKEND_PID" 2>/dev/null' EXIT

echo "Starting frontend (http://localhost:5173)…"
cd frontend && npm run dev

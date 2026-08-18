#!/usr/bin/env bash
# ==============================================================================
# OmniEnglish Frontier — One-Click Local Runner
# Starts both FastAPI Backend (port 8000) and Next.js Frontend (port 3001)
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 Starting OmniEnglish Frontier..."

# 1. Start Backend in background
echo "📦 Starting FastAPI Backend on http://localhost:8000..."
cd "$DIR/backend"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Trap SIGINT to kill backend when user stops script
trap "kill $BACKEND_PID; exit" SIGINT SIGTERM EXIT

# 2. Start Frontend
echo "🌐 Starting Next.js Frontend on http://localhost:3001..."
cd "$DIR/frontend"
npm run dev -- -p 3001

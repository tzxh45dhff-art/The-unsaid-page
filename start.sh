#!/bin/bash

# Change to the directory of the script
cd "$(dirname "$0")"

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    # Hard kill any remaining processes on the ports just in case
    kill -9 $(lsof -t -i:8000 -i:5173) 2>/dev/null || true
    exit 0
}

# Trap SIGINT, SIGTERM, and EXIT to run cleanup
trap cleanup SIGINT SIGTERM EXIT

echo "Cleaning up existing processes on ports 8000 and 5173..."
kill -9 $(lsof -t -i:8000 -i:5173) 2>/dev/null || true

# Setup frontend dependencies if node_modules is missing
if ! command -v npm &>/dev/null; then
    echo "❌ Error: Node.js/npm is not installed or not in PATH."
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Frontend dependencies (node_modules) missing. Installing..."
    (cd frontend && npm install)
fi

# Setup backend virtual environment
VENV_DIR="backend/.venv"
VENV_PYTHON="$VENV_DIR/bin/python"
VENV_PIP="$VENV_DIR/bin/pip"

# Find system Python executable
if command -v python3 &>/dev/null; then
    SYSTEM_PYTHON="python3"
elif command -v python &>/dev/null; then
    SYSTEM_PYTHON="python"
else
    echo "❌ Error: Python is not installed or not in PATH."
    exit 1
fi

if [ ! -d "$VENV_DIR" ] || [ ! -f "$VENV_PYTHON" ] || [ ! -f "$VENV_PIP" ]; then
    echo "Backend virtual environment missing or corrupted. Creating..."
    rm -rf "$VENV_DIR"
    $SYSTEM_PYTHON -m venv "$VENV_DIR"
    $VENV_PIP install -r backend/requirements.txt
else
    # Check if dependencies are installed
    if ! $VENV_PYTHON -c "import fastapi, uvicorn, psycopg, jose, passlib, dotenv, slowapi, pydantic_settings, httpx" &>/dev/null; then
        echo "Backend dependencies missing or incomplete. Installing/repairing..."
        $VENV_PIP install -r backend/requirements.txt
    fi
fi

echo "Starting Backend..."
(cd backend && .venv/bin/python -u main.py > backend.log 2>&1) &
BACKEND_PID=$!

echo "Starting Frontend..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "Waiting for servers to initialize..."
BACKEND_STARTED=false
FRONTEND_STARTED=false

for i in {1..30}; do
    if lsof -i :5173 >/dev/null; then
        FRONTEND_STARTED=true
    fi
    if lsof -i :8000 >/dev/null; then
        BACKEND_STARTED=true
    fi
    if [ "$FRONTEND_STARTED" = true ] && [ "$BACKEND_STARTED" = true ]; then
        echo "Servers are up!"
        break
    fi
    sleep 0.5
done

if [ "$BACKEND_STARTED" = false ]; then
    echo "❌ Backend failed to start on port 8000. Showing backend.log:"
    if [ -f "backend/backend.log" ]; then
        tail -n 20 backend/backend.log
    else
        echo "backend.log not found."
    fi
fi

if [ "$FRONTEND_STARTED" = false ]; then
    echo "❌ Frontend failed to start on port 5173."
fi

if [ "$FRONTEND_STARTED" = true ] && [ "$BACKEND_STARTED" = true ]; then
    echo "Opening application in default browser..."
    if command -v open &> /dev/null; then
        open http://localhost:5173
    elif command -v start &> /dev/null; then
        start http://localhost:5173
    elif command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:5173
    fi
fi

# Keep script running and wait for background processes
wait

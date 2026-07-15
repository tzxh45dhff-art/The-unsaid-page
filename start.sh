#!/bin/bash

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
if [ ! -d "frontend/node_modules" ]; then
    echo "Frontend dependencies (node_modules) missing. Installing..."
    (cd frontend && npm install)
fi

# Setup backend virtual environment if missing
if [ ! -d "backend/.venv" ]; then
    echo "Backend virtual environment (.venv) missing. Creating..."
    python3 -m venv backend/.venv
    backend/.venv/bin/pip install -r backend/requirements.txt
fi

echo "Starting Backend..."
(cd backend && .venv/bin/python -u main.py > backend.log 2>&1) &
BACKEND_PID=$!

echo "Starting Frontend..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "Waiting for servers to initialize..."
for i in {1..30}; do
    if lsof -i :5173 >/dev/null && lsof -i :8000 >/dev/null; then
        echo "Servers are up!"
        break
    fi
    sleep 0.5
done

echo "Opening application in default browser..."
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v start &> /dev/null; then
    start http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

# Keep script running and wait for background processes
wait

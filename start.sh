#!/bin/bash

echo "Starting Backend..."
(cd backend && source .venv/Scripts/activate && python main.py) &
BACKEND_PID=$!

echo "Starting Frontend..."
(cd frontend && bun run dev) &
FRONTEND_PID=$!

echo "Waiting for servers to initialize..."
sleep 5

echo "Opening application in default browser..."
# Use 'start' for Windows (Git Bash), 'open' for macOS, 'xdg-open' for Linux
if command -v start &> /dev/null; then
    start http://localhost:5173
elif command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

# Wait for all background processes to keep script running
wait

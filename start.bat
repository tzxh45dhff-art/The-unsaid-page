@echo off
setlocal enabledelayedexpansion

echo Cleaning up existing processes on ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a 2>nul

:: Setup frontend dependencies if node_modules is missing
if not exist "frontend\node_modules\" (
    echo Frontend dependencies (node_modules) missing. Installing...
    cd frontend && call npm install && cd ..
)

:: Setup backend virtual environment if missing
if not exist "backend\.venv\" (
    echo Backend virtual environment (.venv) missing. Creating...
    python -m venv backend\.venv
    call backend\.venv\Scripts\activate.bat
    pip install -r backend\requirements.txt
)

echo Starting Backend...
start "The Unsaid Page - Backend" cmd /k "cd backend && call .venv\Scripts\activate.bat && python main.py"

echo Starting Frontend...
start "The Unsaid Page - Frontend" cmd /k "cd frontend && npm run dev"

echo Waiting for servers to initialize...
:poll
timeout /t 1 /nobreak >nul
netstat -aon | findstr :5173 >nul
if errorlevel 1 goto poll
netstat -aon | findstr :8000 >nul
if errorlevel 1 goto poll

echo Servers are up!
echo Opening application in default browser...
start http://localhost:5173

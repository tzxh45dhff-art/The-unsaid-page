@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo Cleaning up existing processes on ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a 2>nul

:: Setup frontend dependencies if node_modules is missing
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js/npm is not installed or not in PATH.
    pause
    exit /b 1
)

if not exist "frontend\node_modules\" (
    echo Frontend dependencies (node_modules) missing. Installing...
    cd frontend && call npm install && cd ..
)

:: Setup backend virtual environment
set VENV_DIR=backend\.venv
set VENV_PYTHON=%VENV_DIR%\Scripts\python.exe
set VENV_PIP=%VENV_DIR%\Scripts\pip.exe

python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed or not in PATH.
    pause
    exit /b 1
)

if not exist "%VENV_DIR%" (
    set RECREATE_VENV=1
) else if not exist "%VENV_PYTHON%" (
    set RECREATE_VENV=1
) else if not exist "%VENV_PIP%" (
    set RECREATE_VENV=1
) else (
    set RECREATE_VENV=0
)

if !RECREATE_VENV!==1 (
    echo Backend virtual environment missing or corrupted. Creating...
    if exist "%VENV_DIR%" rd /s /q "%VENV_DIR%"
    python -m venv %VENV_DIR%
    call %VENV_DIR%\Scripts\activate.bat
    pip install -r backend\requirements.txt
) else (
    :: Check if dependencies are installed
    %VENV_PYTHON% -c "import fastapi, uvicorn, psycopg, jose, passlib, dotenv, slowapi, pydantic_settings, httpx" >nul 2>&1
    if errorlevel 1 (
        echo Backend dependencies missing or incomplete. Installing/repairing...
        call %VENV_DIR%\Scripts\activate.bat
        pip install -r backend\requirements.txt
    )
)

echo Starting Backend...
start "The Unsaid Page - Backend" cmd /k "cd backend && call .venv\Scripts\activate.bat && python main.py"

echo Starting Frontend...
start "The Unsaid Page - Frontend" cmd /k "cd frontend && npm run dev"

echo Waiting for servers to initialize...
set /a count=0
:poll
set /a count+=1
if !count! gtr 30 (
    echo.
    echo ❌ Timeout waiting for servers to start.
    echo Please check if there are errors in the backend or frontend terminal windows.
    pause
    exit /b 1
)
timeout /t 1 /nobreak >nul
netstat -aon | findstr :5173 >nul
if errorlevel 1 goto poll
netstat -aon | findstr :8000 >nul
if errorlevel 1 goto poll

echo Servers are up!
echo Opening application in default browser...
start http://localhost:5173

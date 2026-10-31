@echo off
echo ===================================================
echo   Brightloop 360 - Local Full Stack Launcher
echo   Database, FastAPI Backend, Next.js Frontend
echo ===================================================
echo.

:: 1. Check Python virtual environment
if not exist ".venv\Scripts\python.exe" (
    echo [!] Virtual environment not found. Setting up .venv...
    python -m venv .venv
    call .venv\Scripts\pip install -r requirements.txt
)

:: 2. Initialize database
echo [*] Initializing database tables and seed data...
call .venv\Scripts\python test_database.py
if %ERRORLEVEL% NEQ 0 (
    echo [!] Database check warning, continuing with SQLite fallback...
)

:: 3. Launch Backend in new window
echo [*] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Brightloop 360 - FastAPI Backend" cmd /k "call .venv\Scripts\uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

:: 4. Launch Frontend in new window
echo [*] Starting Next.js Frontend on http://localhost:3000 ...
start "Brightloop 360 - Next.js Frontend" cmd /k "npm.cmd run dev --prefix frontend"

echo.
echo ===================================================
echo  [SUCCESS] All systems launched for local testing!
echo  - Frontend: http://localhost:3000
echo  - Backend API: http://127.0.0.1:8000
echo  - API Docs: http://127.0.0.1:8000/docs
echo ===================================================

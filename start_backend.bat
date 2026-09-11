@echo off
echo ========================================================
echo Starting ULPF FastAPI Backend Engine (Port 8000)...
echo ========================================================
cd /d "%~dp0"
py -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause

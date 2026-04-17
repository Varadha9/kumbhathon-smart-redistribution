@echo off
echo ==========================================
echo   Smart Redistribution App - Kumbhathon
echo ==========================================
echo.

echo [1/2] Starting Flask Backend on http://localhost:5001 ...
start "Backend - Flask" cmd /k "cd /d %~dp0backend && "C:\Users\varad\AppData\Local\Programs\Python\Python313\python.exe" app.py"

timeout /t 4 /nobreak >nul

echo [2/2] Starting React Frontend on http://localhost:3000 ...
start "Frontend - React" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ==========================================
echo  Backend  -> http://localhost:5001
echo  Frontend -> http://localhost:3000
echo ==========================================
echo  Both windows must stay open!
echo ==========================================

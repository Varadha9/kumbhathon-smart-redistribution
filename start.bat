@echo off
echo Starting Smart Redistribution App...

echo.
echo [1/2] Starting Flask Backend on http://localhost:5000
start "Backend" cmd /k "cd /d %~dp0backend && C:\Users\varad\AppData\Local\Programs\Python\Python313\python.exe app.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Frontend on http://localhost:3000
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo App is starting! Open http://localhost:3000 in your browser.

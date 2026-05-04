@echo off
echo Iniciando FAMED (sem reinstalar dependencias)...
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Admin: admin@famed.edu.br / Admin@123
echo.

start "FAMED Backend" cmd /k "cd /d "%~dp0backend" && "C:\Program Files\nodejs\node.exe" src/server.js"
timeout /t 2 /nobreak >nul
start "FAMED Frontend" cmd /k "cd /d "%~dp0frontend" && "C:\Program Files\nodejs\npm.cmd" run dev"
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"

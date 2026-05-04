@echo off
SET NPM="C:\Program Files\nodejs\npm.cmd"
SET NODE="C:\Program Files\nodejs\node.exe"

echo ===============================================
echo   FAMED - Portal Academico
echo ===============================================
echo.

echo [1/2] Instalando dependencias do backend...
cd /d "%~dp0backend"
call %NPM% install
if errorlevel 1 (echo ERRO no backend! & pause & exit /b 1)

echo.
echo [2/2] Instalando dependencias do frontend...
cd /d "%~dp0frontend"
call %NPM% install
if errorlevel 1 (echo ERRO no frontend! & pause & exit /b 1)

echo.
echo ===============================================
echo   Iniciando servidores...
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo ===============================================
echo.
echo Login admin:
echo   Email: admin@famed.edu.br
echo   Senha: Admin@123
echo.

start "FAMED Backend" cmd /k "cd /d "%~dp0backend" && "C:\Program Files\nodejs\node.exe" src/server.js"
timeout /t 2 /nobreak >nul
start "FAMED Frontend" cmd /k "cd /d "%~dp0frontend" && "C:\Program Files\nodejs\npm.cmd" run dev"
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"

echo Servidores iniciados! Abrindo navegador...
pause

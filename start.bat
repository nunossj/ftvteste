@echo off
echo ==========================================
echo   FEDERACAO DE FUTEBOL VIRTUAL
echo ==========================================
echo.

echo Verificando instalacao do Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Erro: Node.js nao encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)

echo Node.js instalado
echo.

if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
    echo.
)

echo Iniciando servidor...
echo O sistema estara disponivel em: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo ==========================================
echo.

call npm start
pause

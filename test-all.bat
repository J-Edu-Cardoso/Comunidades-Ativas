@echo off
echo 🧪 Teste Completo - Comunidade Ativa
echo ====================================

REM 1. Verificar servidor
echo 1️⃣ Testando servidor...
curl -s http://localhost:8000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Servidor rodando

    REM 2. Testar API
    echo.
    echo 2️⃣ Testando APIs...
    curl -s http://localhost:8000/api/users | findstr /C:"error" /C:"users" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    Usuários: ✅ OK
    ) else (
        echo    Usuários: ❌ Falha
    )

    curl -s http://localhost:8000/api/categories | findstr /C:"error" /C:"categories" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    Categorias: ✅ OK
    ) else (
        echo    Categorias: ❌ Falha
    )

    curl -s http://localhost:8000/api/ideas | findstr /C:"error" /C:"ideas" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    Ideias: ✅ OK
    ) else (
        echo    Ideias: ❌ Falha
    )

    REM 3. Testar uploads
    echo.
    echo 3️⃣ Testando uploads...
    curl -s http://localhost:8000/uploads/ >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Diretório de uploads acessível
    ) else (
        echo ❌ Diretório de uploads não acessível
    )

    REM 4. URLs disponíveis
    echo.
    echo 🌐 URLs disponíveis:
    echo    Frontend: http://localhost:8000/app
    echo    Perfil: http://localhost:8000/Profile.html
    echo    API: http://localhost:8000/api
    echo    Uploads: http://localhost:8000/uploads/

    REM 5. Funcionalidades
    echo.
    echo ✅ Funcionalidades implementadas:
    echo    • Cadastro de usuários com nome
    echo    • Upload de avatar com preview
    echo    • Edição de perfil (modal)
    echo    • Compartilhamento de perfil
    echo    • Sistema de ideias com votos
    echo    • Categorias dinâmicas
    echo    • Autenticação JWT

) else (
    echo ❌ Servidor não está rodando
    echo 💡 Execute: npm run dev
)

echo.
echo 🎯 Para debug detalhado:
echo    • Console (F12) no navegador
echo    • Network tab para requisições
echo    • Backend logs no terminal

pause

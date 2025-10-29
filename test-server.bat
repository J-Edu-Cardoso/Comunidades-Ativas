@echo off
echo 🔍 Testando se o servidor está funcionando...

REM Verificar se backend existe
if not exist "backend" (
    echo ❌ Diretório backend não encontrado
    pause
    exit /b 1
)

REM Navegar para backend
cd backend

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

REM Verificar se PostgreSQL está rodando
echo 🗄️ Verificando PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL não encontrado. Instale o PostgreSQL.
    pause
    exit /b 1
) else (
    echo ✅ PostgreSQL encontrado
)

REM Criar banco se não existir
echo 🗄️ Criando banco de dados...
createdb upx4_development 2>nul || echo ✅ Banco já existe

REM Executar migrations
echo 🗄️ Executando migrations...
npm run db:migrate 2>nul || echo ⚠️ Migrations podem já ter sido executadas

REM Executar seeds
echo 🗄️ Executando seeds...
npm run db:seed 2>nul || echo ⚠️ Seeds podem já ter sido executados

REM Testar se servidor inicia
echo 🚀 Testando servidor...
echo.
echo 📱 URLs de teste:
echo    Frontend: http://localhost:8000/app
echo    API: http://localhost:8000/api
echo    API Health: http://localhost:8000/api/health
echo.
echo 💡 Para parar o servidor: Ctrl+C
echo.

REM Iniciar servidor
npm run dev

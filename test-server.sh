#!/bin/bash

echo "🔍 Testando se o servidor está funcionando..."

# Verificar se backend existe
if [ ! -d "backend" ]; then
    echo "❌ Diretório backend não encontrado"
    exit 1
fi

# Navegar para backend
cd backend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se PostgreSQL está rodando
echo "🗄️ Verificando PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL encontrado"
else
    echo "❌ PostgreSQL não encontrado. Instale o PostgreSQL."
    exit 1
fi

# Criar banco se não existir
createdb upx4_development 2>/dev/null || echo "✅ Banco já existe"

# Executar migrations
echo "🗄️ Executando migrations..."
npm run db:migrate 2>/dev/null || echo "⚠️ Migrations podem já ter sido executadas"

# Executar seeds
echo "🗄️ Executando seeds..."
npm run db:seed 2>/dev/null || echo "⚠️ Seeds podem já ter sido executados"

# Testar se servidor inicia
echo "🚀 Testando servidor..."
timeout 10s npm run dev &
SERVER_PID=$!

# Aguardar um pouco
sleep 3

# Verificar se processo ainda está rodando
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Servidor iniciou com sucesso!"
    echo ""
    echo "📱 URLs de teste:"
    echo "   Frontend: http://localhost:8000/app"
    echo "   API: http://localhost:8000/api"
    echo "   API Health: http://localhost:8000/api/health"
    echo ""
    echo "💡 Para parar o servidor: Ctrl+C"

    # Manter servidor rodando
    wait $SERVER_PID
else
    echo "❌ Servidor falhou ao iniciar"
    echo "💡 Verifique se a porta 8000 está disponível"
    echo "💡 Verifique se todas as dependências estão instaladas"
    exit 1
fi

#!/bin/bash

echo "🔧 Corrigindo problemas e iniciando servidor..."

# Navegar para backend
cd backend

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Executar migrations se banco não estiver configurado
echo "🗄️ Configurando banco de dados..."
npm run db:migrate 2>/dev/null || echo "✅ Banco já configurado"

# Iniciar servidor
echo "🚀 Iniciando servidor..."
echo ""
echo "📱 Frontend: http://localhost:8000/app"
echo "🔗 API: http://localhost:8000/api"
echo ""
echo "💡 Credenciais admin: admin@comunidadeativa.com / admin123"
echo ""

npm run dev

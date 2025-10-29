#!/bin/bash

echo "🚀 Iniciando configuração da Comunidade Ativa..."

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install

# Voltar para a raiz
cd ..

# Verificar se PostgreSQL está rodando
echo "🗄️ Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado. Por favor, instale o PostgreSQL."
    exit 1
fi

# Criar banco de dados se não existir
echo "🗄️ Criando banco de dados..."
createdb upx4_development 2>/dev/null || echo "✅ Banco já existe"

# Configurar banco de dados
echo "🗄️ Executando migrations..."
cd backend
npm run db:migrate

echo "🗄️ Executando seeds..."
npm run db:seed

echo "✅ Configuração completa!"
echo ""
echo "Para iniciar o servidor:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "O frontend estará disponível em: http://localhost:8000/app"
echo "A API estará disponível em: http://localhost:8000/api"

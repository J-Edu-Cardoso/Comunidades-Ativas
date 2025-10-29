#!/bin/bash

echo "🔄 Executando migration para adicionar campo avatar..."
echo "======================================================"

# Navegar para backend
cd backend

# Executar migration
echo "📊 Executando migration..."
npm run db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migration executada com sucesso!"
    echo ""
    echo "📋 Campo 'avatar' adicionado à tabela user_profiles"
    echo "🔧 Agora o sistema suporta upload de foto de perfil"
    echo ""
    echo "💡 Próximos passos:"
    echo "   1. Inicie o servidor: npm run dev"
    echo "   2. Teste o cadastro e upload de avatar"
    echo "   3. Verifique se a URL do avatar é salva no banco"
else
    echo "❌ Erro na migration"
    echo "💡 Verifique se PostgreSQL está rodando"
    echo "💡 Verifique as credenciais do banco de dados"
fi

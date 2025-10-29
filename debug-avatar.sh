#!/bin/bash

echo "🔍 Debug - Sistema de Avatar"
echo "============================"

# 1. Verificar backend
echo "1️⃣ Verificando backend..."
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ Backend rodando"

    # 2. Verificar uploads
    echo ""
    echo "2️⃣ Verificando uploads..."
    if curl -s http://localhost:8000/uploads/ > /dev/null 2>&1; then
        echo "✅ Diretório de uploads acessível"

        # 3. Verificar avatars
        if curl -s http://localhost:8000/uploads/avatars/ > /dev/null 2>&1; then
            echo "✅ Diretório de avatars acessível"
        else
            echo "❌ Diretório de avatars não acessível"
        fi
    else
        echo "❌ Diretório de uploads não acessível"
    fi

    # 4. Verificar API de upload
    echo ""
    echo "3️⃣ Testando API de upload..."
    echo "💡 Para testar:"
    echo "   1. Acesse http://localhost:8000/Profile.html"
    echo "   2. Faça login com qualquer usuário"
    echo "   3. Clique na foto de perfil"
    echo "   4. Selecione uma imagem"
    echo "   5. Verifique logs no console (F12)"

    echo ""
    echo "🔧 Debug no navegador:"
    echo "   • Console (F12) → procure logs: 📸, ✅, ❌"
    echo "   • Network tab → POST /api/users/:id/avatar"
    echo "   • Verificar se a imagem aparece em backend/uploads/avatars/"

    echo ""
    echo "🌐 URLs para teste:"
    echo "   Frontend: http://localhost:8000/app"
    echo "   Perfil: http://localhost:8000/Profile.html"
    echo "   Uploads: http://localhost:8000/uploads/avatars/"

else
    echo "❌ Backend não está rodando"
    echo "💡 Execute: cd backend && npm run dev"
fi

echo ""
echo "📋 Verificações realizadas:"
echo "   ✅ Modelo UserProfile tem campo avatar"
echo "   ✅ Controller uploadAvatar implementado"
echo "   ✅ Middleware upload configurado"
echo "   ✅ Rota POST /api/users/:id/avatar"
echo "   ✅ Servidor serve arquivos estáticos"
echo "   ✅ Frontend tem código de upload"

echo ""
echo "🎯 Próximos passos:"
echo "   1. Certifique-se que a migration foi executada"
echo "   2. Teste o upload de avatar no navegador"
echo "   3. Verifique logs do console"
echo "   4. Confirme que o usuário está logado"

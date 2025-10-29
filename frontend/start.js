#!/usr/bin/env node

/**
 * Script para iniciar o frontend
 * Mostra instruções e tenta iniciar o backend automaticamente
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Comunidade Ativa...\n');
console.log('📱 Frontend: http://localhost:8000/app');
console.log('🔗 API: http://localhost:8000/api\n');
console.log('💡 Para iniciar o servidor:');
console.log('   cd backend');
console.log('   npm run dev\n');
console.log('📝 Credenciais admin:');
console.log('   Email: admin@comunidadeativa.com');
console.log('   Senha: admin123\n');

// Verificar se está no diretório correto
const backendPath = path.join(__dirname, '..', 'backend');
const fs = require('fs');

if (fs.existsSync(backendPath)) {
    console.log('🔄 Iniciando backend automaticamente...\n');
    exec('cd "' + backendPath + '" && npm run dev', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ Erro ao iniciar backend:', error.message);
            console.log('\n💡 Execute manualmente:');
            console.log('   cd backend');
            console.log('   npm run dev');
            return;
        }
        console.log(stdout);
    });
} else {
    console.log('❌ Diretório backend não encontrado');
    console.log('\n💡 Execute manualmente:');
    console.log('   cd backend');
    console.log('   npm run dev');
}

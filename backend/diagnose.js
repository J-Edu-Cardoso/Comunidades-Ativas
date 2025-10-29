#!/usr/bin/env node

console.log('🔍 Diagnóstico do Backend - Comunidades Ativas');
console.log('================================================\n');

// Verificar se estamos no diretório correto
console.log('1. 📁 Diretório atual:', process.cwd());

// Verificar Node.js
console.log('2. 🟢 Node.js:', process.version);

// Verificar se package.json existe
const fs = require('fs');
const path = require('path');

if (fs.existsSync('package.json')) {
    console.log('3. ✅ package.json encontrado');

    const packageJson = require('./package.json');
    console.log('   📦 Nome do projeto:', packageJson.name);
    console.log('   🔖 Versão:', packageJson.version);
} else {
    console.log('3. ❌ package.json não encontrado');
}

// Verificar se node_modules existe
if (fs.existsSync('node_modules')) {
    console.log('4. ✅ node_modules encontrado');
} else {
    console.log('4. ❌ node_modules não encontrado - execute: npm install');
}

// Verificar se .env existe
if (fs.existsSync('.env')) {
    console.log('5. ✅ .env encontrado');
} else {
    console.log('5. ❌ .env não encontrado - configure as variáveis de ambiente');
}

// Verificar se server.js existe
if (fs.existsSync('server.js')) {
    console.log('6. ✅ server.js encontrado');
} else {
    console.log('6. ❌ server.js não encontrado');
}

console.log('\n📋 Próximos passos:');
console.log('1. Certifique-se de que está no diretório backend/');
console.log('2. Execute: npm install');
console.log('3. Execute: npm run dev');
console.log('\n🚀 Servidor deve rodar em: http://localhost:8000');

#!/usr/bin/env node

console.log('🚀 Teste Básico do Backend');
console.log('==========================\n');

// Testar se Node.js está funcionando
try {
    console.log('✅ Node.js está funcionando');
    console.log('📦 Versão:', process.version);
} catch (error) {
    console.log('❌ Erro no Node.js:', error.message);
}

// Testar se os arquivos essenciais existem
const fs = require('fs');
const path = require('path');

const filesToCheck = [
    'package.json',
    'server.js',
    '.env',
    'config/database.js',
    'routes/index.js'
];

filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} encontrado`);
    } else {
        console.log(`❌ ${file} não encontrado`);
    }
});

// Testar se as dependências estão instaladas
if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules encontrado');
    console.log('📦 Tentando carregar dependências...');

    try {
        const express = require('express');
        console.log('✅ Express carregado com sucesso');

        const sequelize = require('sequelize');
        console.log('✅ Sequelize carregado com sucesso');

        console.log('\n🎉 Dependências carregadas com sucesso!');
        console.log('💡 Agora tente executar: npm run dev');

    } catch (error) {
        console.log('❌ Erro ao carregar dependências:', error.message);
        console.log('💡 Execute: npm install');
    }
} else {
    console.log('❌ node_modules não encontrado');
    console.log('💡 Execute: npm install');
}

console.log('\n📋 Resumo:');
console.log('- Se todas as dependências estiverem OK, execute: npm run dev');
console.log('- Se node_modules não existir, execute primeiro: npm install');
console.log('- Verifique se o PostgreSQL está rodando');
console.log('- Verifique as configurações no arquivo .env');

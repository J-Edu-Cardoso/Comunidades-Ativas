#!/usr/bin/env node

console.log('🚀 Iniciando servidor simplificado...');
console.log('===================================\n');

// Testar se Node.js está funcionando
try {
    console.log('✅ Node.js está funcionando');
    console.log('📦 Versão:', process.version);
} catch (error) {
    console.log('❌ Erro no Node.js:', error.message);
    process.exit(1);
}

// Carregar dependências básicas
try {
    const express = require('express');
    const path = require('path');
    console.log('✅ Express carregado');
} catch (error) {
    console.log('❌ Erro ao carregar Express:', error.message);
    console.log('💡 Execute: npm install');
    process.exit(1);
}

const app = express();

// Configuração básica
app.use(express.json());

// Rota de teste simples
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor básico funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota de saúde
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`\n🎉 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🏠 Página inicial: http://localhost:${PORT}/`);
    console.log('\n💡 Para parar: Ctrl+C');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Porta ${PORT} já está em uso`);
        console.log('💡 Feche outros servidores ou use uma porta diferente');
    } else {
        console.log('❌ Erro ao iniciar servidor:', err.message);
    }
    process.exit(1);
});

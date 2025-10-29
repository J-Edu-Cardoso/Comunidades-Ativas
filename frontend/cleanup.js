/**
 * Cleanup Script - Remove arquivos desnecessários do frontend
 * Execute: node cleanup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Iniciando limpeza de arquivos desnecessários...');

// Arquivos e diretórios a remover
const itemsToRemove = [
    'src',
    'build',
    'controllers',
    'server',
    'generate_og_image.py',
    'package-lock.json'
];

let removedCount = 0;

itemsToRemove.forEach(item => {
    const itemPath = path.join(__dirname, item);

    try {
        if (fs.existsSync(itemPath)) {
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                fs.rmSync(itemPath, { recursive: true, force: true });
                console.log(`📁 Removido diretório: ${item}`);
            } else {
                fs.unlinkSync(itemPath);
                console.log(`📄 Removido arquivo: ${item}`);
            }

            removedCount++;
        }
    } catch (error) {
        console.log(`⚠️  Erro ao remover ${item}: ${error.message}`);
    }
});

console.log(`\n✅ Limpeza concluída! ${removedCount} itens removidos.`);
console.log('\n📁 Estrutura final do frontend:');
console.log('  frontend/');
console.log('  ├── public/          # HTML, CSS, JS da aplicação ✅');
console.log('  ├── .env.example     # Configurações ✅');
console.log('  ├── package.json     # Scripts básicos ✅');
console.log('  └── cleanup.js       # Este script ✅');

console.log('\n💡 O frontend agora está limpo e otimizado!');

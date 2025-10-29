require('dotenv').config();
const { sequelize } = require('./config/database');
const path = require('path');

async function runSeeder() {
    try {
        console.log('🔄 Conectando ao banco de dados...');
        await sequelize.authenticate();
        console.log('✅ Conexão estabelecida');

        console.log('📊 Executando migrations...');
        await sequelize.sync({ alter: true });
        console.log('✅ Migrations executadas');

        console.log('🌱 Executando seeders...');
        const Umzug = require('umzug');
        const umzug = new Umzug({
            migrations: {
                path: path.resolve('../database/migrations'),
                params: [sequelize.getQueryInterface(), sequelize.constructor]
            },
            storage: 'sequelize',
            storageOptions: {
                sequelize: sequelize,
                tableName: 'SequelizeMeta'
            }
        });

        // Executar migrations
        await umzug.up();
        console.log('✅ Migrations concluídas');

        // Executar seeders
        const seederUmzug = new Umzug({
            migrations: {
                path: path.resolve('../database/seeders'),
                params: [sequelize.getQueryInterface(), sequelize.constructor]
            },
            storage: 'sequelize',
            storageOptions: {
                sequelize: sequelize,
                tableName: 'SequelizeMetaSeeders'
            }
        });

        await seederUmzug.up();
        console.log('✅ Seeders executados com sucesso!');

        console.log('🎉 Banco de dados configurado!');
        console.log('📋 Categorias inseridas:');
        console.log('   - Infraestrutura');
        console.log('   - Segurança');
        console.log('   - Meio Ambiente');
        console.log('   - Educação');
        console.log('   - Saúde');
        console.log('   - Lazer');
        console.log('   - Outros');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

runSeeder();

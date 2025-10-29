// Configuração do ambiente de teste
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';

// Configuração global para o Jest
global.afterEach(async () => {
  // Limpar dados de teste após cada teste
  const { sequelize } = require('../../config/database');
  if (sequelize) {
    await sequelize.close();
  }
});

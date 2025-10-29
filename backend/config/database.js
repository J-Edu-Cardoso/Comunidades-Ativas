require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'upx4_development',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'ADM@321',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida');

    // Executar migrations se em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Executando sync...');
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados com o banco de dados');
    }

    return sequelize;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error.message);
    console.log('💡 Verificações:');
    console.log('   - PostgreSQL está rodando?');
    console.log('   - Banco upx4_development existe?');
    console.log('   - Credenciais no .env estão corretas?');
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
  Sequelize,
};

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: console.log
});

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    await sequelize.authenticate();
    console.log('Conexão bem-sucedida!');
    
    // Testar uma consulta simples
    const [results] = await sequelize.query('SELECT 1+1 as result');
    console.log('Resultado da consulta:', results[0]);
    
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();

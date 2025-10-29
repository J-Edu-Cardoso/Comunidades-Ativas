const { sequelize, connectDB } = require('../config/database');

describe('Database Connection', () => {
  beforeAll(async () => {
    // Conecta ao banco de dados antes de todos os testes
    await connectDB();
  });

  afterAll(async () => {
    // Fecha a conexão após todos os testes
    await sequelize.close();
  });

  it('deve se conectar ao banco de dados com sucesso', async () => {
    // Tenta autenticar a conexão
    await expect(sequelize.authenticate())
      .resolves
      .not
      .toThrow();
  });

  it('deve ter as configurações corretas de ambiente de teste', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.DB_NAME).toBe('test_db');
    expect(process.env.DB_USER).toBe('postgres');
    expect(process.env.DB_PASSWORD).toBe('postgres');
    expect(process.env.DB_HOST).toBe('localhost');
    expect(process.env.DB_PORT).toBe('5432');
  });
});

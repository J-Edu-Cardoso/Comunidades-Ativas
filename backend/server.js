require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/database');

// Importar models
require('./models');

// Importar rotas
const routes = require('./routes');

const app = express();

// Configuração básica do servidor
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Caminhos para arquivos estáticos
const frontendPath = path.join(__dirname, '../frontend/public');
const uploadsPath = path.join(__dirname, 'uploads');

// Rota para a aplicação principal - ANTES dos arquivos estáticos
app.get('/app', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Servir arquivos estáticos (HTML, CSS, JS) - depois da rota /app
console.log('📁 Servindo arquivos estáticos de:', frontendPath);
app.use(express.static(frontendPath));

// Servir uploads de avatars
console.log('📁 Servindo uploads de:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));


// Rotas da API - depois dos arquivos estáticos
app.use('/api', routes);

// Rota de teste
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API da Comunidade Ativa está funcionando!' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// 404 handler - deixar por último
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Configuração da porta
const PORT = process.env.PORT || 8000;

// Conectar ao banco e iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Conexão com o banco de dados estabelecida');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📱 Frontend disponível em http://localhost:${PORT}/app`);
      console.log(`🔗 API disponível em http://localhost:${PORT}/api`);
      console.log(`📄 Arquivos estáticos servidos de: ${frontendPath}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Erro: A porta ${PORT} já está em uso.`);
        console.log('💡 Dica: Encerre o processo que está usando esta porta ou mude a porta no arquivo .env');
      } else {
        console.error('❌ Erro ao iniciar o servidor:', err);
      }
      process.exit(1);
    });

    // Lidar com encerramento gracioso do servidor
    process.on('SIGTERM', () => {
      console.log('🛑 Encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();

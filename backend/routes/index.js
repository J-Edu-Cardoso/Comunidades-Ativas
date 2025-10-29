const express = require('express');
const router = express.Router();

// Importar controllers
const UserController = require('../controllers/UserController');
const CategoryController = require('../controllers/CategoryController');
const IdeaController = require('../controllers/IdeaController');
const CommentController = require('../controllers/CommentController');
const StatsController = require('../controllers/StatsController');

// Importar middleware
const { authenticate, optionalAuthenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ideaUpload = require('../middleware/ideaUpload');

// Rotas de autenticação (públicas)
router.post('/auth/register', UserController.create);
router.post('/auth/login', UserController.login);

// Rotas de usuários
router.get('/users/:id', authenticate, UserController.getProfile);
router.put('/users/:id', authenticate, UserController.updateProfile);
router.post('/users/:id/avatar', authenticate, upload.single('avatar'), UserController.uploadAvatar);
router.delete('/users/:id', authenticate, UserController.delete);
router.get('/users', authenticate, requireAdmin, UserController.list);

// Rotas de categorias (públicas para leitura, protegidas para escrita)
router.get('/categories', CategoryController.list);
router.post('/categories', authenticate, requireAdmin, CategoryController.create);
router.get('/categories/:id', CategoryController.getById);
router.put('/categories/:id', authenticate, requireAdmin, CategoryController.update);
router.delete('/categories/:id', authenticate, requireAdmin, CategoryController.delete);

// Rotas de ideias (públicas para leitura, protegidas para escrita)
router.get('/ideas', optionalAuthenticate, IdeaController.list);
router.get('/users/:id/ideas', optionalAuthenticate, IdeaController.listByUser);
router.post('/ideas', authenticate, ideaUpload.single('image'), IdeaController.create);
router.get('/ideas/:id', optionalAuthenticate, IdeaController.getById);
router.put('/ideas/:id', authenticate, IdeaController.update);
router.delete('/ideas/:id', authenticate, IdeaController.delete);
router.post('/ideas/:id/vote', authenticate, IdeaController.vote);
router.get('/search', optionalAuthenticate, IdeaController.globalSearch);

// Rotas de comentários (públicas para leitura, protegidas para escrita)
router.get('/ideas/:idea_id/comments', optionalAuthenticate, CommentController.list);
router.post('/ideas/:idea_id/comments', authenticate, CommentController.create);
router.put('/comments/:id', authenticate, CommentController.update);
router.delete('/comments/:id', authenticate, CommentController.delete);

// Rotas de estatísticas (apenas admin)
router.get('/stats', authenticate, requireAdmin, StatsController.getGeneralStats);
router.get('/stats/ideas/:id', optionalAuthenticate, StatsController.getIdeaStats);
router.get('/stats/users/:id', optionalAuthenticate, StatsController.getUserStats);

// Rota de saúde da API (pública)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

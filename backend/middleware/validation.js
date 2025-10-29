const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware de validação para todas as rotas
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

/**
 * Validações para rotas de usuários
 */
const userValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome deve conter apenas letras e espaços'),

    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),

    validate
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),

    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio deve ter no máximo 500 caracteres'),

    body('location')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Localização deve ter no máximo 100 caracteres'),

    body('website')
      .optional()
      .trim()
      .isURL()
      .withMessage('Website deve ser uma URL válida'),

    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Telefone deve conter apenas números e símbolos válidos'),

    body('occupation')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Ocupação deve ter no máximo 100 caracteres'),

    validate
  ],

  uploadAvatar: [
    // Validação será feita no middleware multer
  ]
};

/**
 * Validações para rotas de ideias
 */
const ideaValidations = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Título deve ter entre 5 e 200 caracteres'),

    body('description')
      .trim()
      .isLength({ min: 20, max: 2000 })
      .withMessage('Descrição deve ter entre 20 e 2000 caracteres'),

    body('location')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Localização deve ter no máximo 200 caracteres'),

    body('category_id')
      .isUUID()
      .withMessage('ID da categoria inválido'),

    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude deve estar entre -90 e 90'),

    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude deve estar entre -180 e 180'),

    validate
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('ID da ideia inválido'),

    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Título deve ter entre 5 e 200 caracteres'),

    body('description')
      .optional()
      .trim()
      .isLength({ min: 20, max: 2000 })
      .withMessage('Descrição deve ter entre 20 e 2000 caracteres'),

    validate
  ]
};

/**
 * Validações para rotas de comentários
 */
const commentValidations = {
  create: [
    body('content')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Comentário deve ter entre 5 e 1000 caracteres'),

    body('parent_id')
      .optional()
      .isUUID()
      .withMessage('ID do comentário pai inválido'),

    validate
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('ID do comentário inválido'),

    body('content')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Comentário deve ter entre 5 e 1000 caracteres'),

    validate
  ]
};

/**
 * Validações para rotas de categorias
 */
const categoryValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Nome da categoria deve ter entre 2 e 50 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-]+$/)
      .withMessage('Nome da categoria deve conter apenas letras, números, espaços e hífens'),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Descrição deve ter no máximo 200 caracteres'),

    body('icon')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Ícone deve ter no máximo 50 caracteres'),

    body('color')
      .optional()
      .trim()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Cor deve ser um hexadecimal válido (#RRGGBB)'),

    validate
  ]
};

/**
 * Validações para parâmetros de rota
 */
const paramValidations = {
  userId: [
    param('id')
      .isUUID()
      .withMessage('ID do usuário inválido'),
    validate
  ],

  ideaId: [
    param('id')
      .isUUID()
      .withMessage('ID da ideia inválido'),
    validate
  ],

  categoryId: [
    param('id')
      .isUUID()
      .withMessage('ID da categoria inválido'),
    validate
  ],

  commentId: [
    param('id')
      .isUUID()
      .withMessage('ID do comentário inválido'),
    validate
  ]
};

/**
 * Validações para queries
 */
const queryValidations = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número positivo'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve estar entre 1 e 100'),

    validate
  ],

  search: [
    query('q')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Termo de busca deve ter entre 2 e 100 caracteres'),

    query('type')
      .optional()
      .isIn(['all', 'ideas', 'users', 'comments', 'categories'])
      .withMessage('Tipo de busca inválido'),

    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número positivo'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limite deve estar entre 1 e 50'),

    validate
  ]
};

module.exports = {
  userValidations,
  ideaValidations,
  commentValidations,
  categoryValidations,
  paramValidations,
  queryValidations,
  validate
};

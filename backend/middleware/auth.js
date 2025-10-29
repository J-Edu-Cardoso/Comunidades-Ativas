const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Usuário inválido ou inativo' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
      });

      if (user && user.is_active) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Em caso de erro, apenas continua sem usuário autenticado
    next();
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticação necessária' });
  }

  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Acesso de administrador necessário' });
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireAdmin
};

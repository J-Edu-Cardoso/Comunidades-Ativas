const { User, UserProfile } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

class UserController {
  // Criar usuário
  static async create(req, res) {
    try {
      console.log('Recebida requisição de cadastro:', {
        body: req.body,
        headers: req.headers
      });

      const { name, email, password } = req.body;

      // Validar campos obrigatórios
      if (!name || !email || !password) {
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        
        console.error('Campos obrigatórios ausentes:', missingFields);
        return res.status(400).json({ 
          error: 'Campos obrigatórios ausentes',
          missing: missingFields
        });
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error('Formato de email inválido:', email);
        return res.status(400).json({ 
          error: 'Formato de email inválido',
          field: 'email'
        });
      }

      // Verificar se usuário já existe
      console.log('Verificando se o email já existe:', email);
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.error('Email já cadastrado:', email);
        return res.status(400).json({ 
          error: 'Email já cadastrado',
          field: 'email'
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      // Criar perfil do usuário
      await UserProfile.create({
        user_id: user.id,
      });

      // Buscar usuário com perfil para incluir avatar
      const userWithProfile = await User.findByPk(user.id, {
        include: [{
          model: UserProfile,
          as: 'profile'
        }],
        attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
      });

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: userWithProfile.id,
          name: userWithProfile.name,
          email: userWithProfile.email,
          is_admin: userWithProfile.is_admin,
          avatar: userWithProfile.profile && userWithProfile.profile.avatar ? userWithProfile.profile.avatar : null,
        },
        token,
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuário
      const user = await User.findOne({
        where: {
          email,
          is_active: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Atualizar último login
      await user.update({ last_login: new Date() });

      // Buscar usuário com perfil para incluir avatar
      const userWithProfile = await User.findByPk(user.id, {
        include: [{
          model: UserProfile,
          as: 'profile'
        }],
        attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
      });

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Login realizado com sucesso',
        user: {
          id: userWithProfile.id,
          name: userWithProfile.name,
          email: userWithProfile.email,
          is_admin: userWithProfile.is_admin,
          avatar: userWithProfile.profile && userWithProfile.profile.avatar ? userWithProfile.profile.avatar : null,
        },
        token,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter perfil do usuário
  static async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [{
          model: UserProfile,
          as: 'profile'
        }],
        attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({
        user: {
          ...user.toJSON(),
          avatar: user.profile && user.profile.avatar ? user.profile.avatar : null
        }
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar perfil
  static async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const { name, bio, location, website, phone, occupation, interests, avatar } = req.body;

      // Verificar se usuário existe
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se o usuário está atualizando seu próprio perfil ou se é admin
      if (user.id !== req.user.id && !req.user.is_admin) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Atualizar dados do usuário
      if (name) {
        await user.update({ name });
      }

      // Atualizar perfil
      const profile = await UserProfile.findOne({ where: { user_id: id } });
      if (profile) {
        await profile.update({
          bio,
          location,
          website,
          phone,
          occupation,
          interests: interests ? interests.split(',').map(i => i.trim()) : undefined,
          avatar,
        });
      }

      // Retornar dados atualizados
      const updatedUser = await User.findByPk(id, {
        include: [{
          model: UserProfile,
          as: 'profile'
        }],
        attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
      });

      res.json({
        message: 'Perfil atualizado com sucesso',
        user: {
          ...updatedUser.toJSON(),
          avatar: updatedUser.profile && updatedUser.profile.avatar ? updatedUser.profile.avatar : null
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Upload de avatar
  static async uploadAvatar(req, res) {
    try {
      const { id } = req.params;

      // Verificar se usuário existe
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se o usuário está atualizando seu próprio avatar ou se é admin
      if (user.id !== req.user.id && !req.user.is_admin) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Verificar se arquivo foi enviado
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      // Construir URL do avatar
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Atualizar avatar no perfil
      const profile = await UserProfile.findOne({ where: { user_id: id } });
      if (profile) {
        // Remover avatar antigo se existir
        if (profile.avatar) {
          const oldAvatarPath = path.join(__dirname, '../', profile.avatar);
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }

        await profile.update({ avatar: avatarUrl });
      }

      // Buscar usuário atualizado com perfil
      const updatedUser = await User.findByPk(id, {
        include: [{
          model: UserProfile,
          as: 'profile'
        }],
        attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
      });

      res.json({
        message: 'Avatar atualizado com sucesso',
        avatar: avatarUrl,
        user: {
          ...updatedUser.toJSON(),
          avatar: updatedUser.profile && updatedUser.profile.avatar ? updatedUser.profile.avatar : null
        }
      });
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Excluir usuário (apenas admin)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se o usuário está excluindo a si mesmo ou se é admin
      if (user.id !== req.user.id && !req.user.is_admin) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Soft delete - marcar como inativo em vez de excluir
      await user.update({
        is_active: false,
        email: 'deleted_' + Date.now() + '_' + user.email // Para evitar conflitos de email
      });

      res.json({ message: 'Usuário desativado com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar usuários (apenas admin)
  static async list(req, res) {
    try {
const { page = 1, limit = 10, search, sort = 'recent' } = req.query;

    const offset = (page - 1) * limit;
    let where = { is_active: true };

    // Filtro de busca
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Ordenação
    let order = [];
    switch (sort) {
      case 'oldest':
        order = [['created_at', 'ASC']];
        break;
      case 'name':
        order = [['name', 'ASC']];
        break;
      default: // recent
        order = [['created_at', 'DESC']];
    }

    const users = await User.findAndCountAll({
      where,
      include: [{
        model: UserProfile,
        as: 'profile'
      }],
      attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      distinct: true
    });

    res.json({
      users: users.rows.map(user => ({
        ...user.toJSON(),
        avatar: user.profile && user.profile.avatar ? user.profile.avatar : null
      })),
      total: users.count,
      page: parseInt(page),
      totalPages: Math.ceil(users.count / limit)
    });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
}


}

module.exports = UserController;

const { Idea, Category, User, Vote, Comment, UserProfile, IdeaImage } = require('../models');
const { Op } = require('sequelize');

class IdeaController {
  // Listar ideias com filtros e paginação
  static async list(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category_id,
        user_id,
        status,
        sort = 'recent',
        search
      } = req.query;

      const offset = (page - 1) * limit;
      let where = { is_active: true };

      // Filtros
      if (category_id) where.category_id = category_id;
      if (user_id) where.user_id = user_id;
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Ordenação
      let order = [];
      switch (sort) {
        case 'votes':
          order = [[{ model: Vote, as: 'votes' }, 'created_at', 'DESC']];
          break;
        case 'comments':
          order = [['comment_count', 'DESC']];
          break;
        case 'oldest':
          order = [['created_at', 'ASC']];
          break;
        default: // recent
          order = [['created_at', 'DESC']];
      }

      const ideas = await Idea.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'icon', 'color']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Vote,
            as: 'votes',
            attributes: ['id', 'vote_type', 'user_id']
          },
          {
            model: IdeaImage,
            as: 'images',
            attributes: ['id', 'url', 'is_primary']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order,
        distinct: true
      });

      // Calcular votos para cada ideia
      const ideasWithVoteCounts = ideas.rows.map(idea => {
        const upvotes = idea.votes.filter(vote => vote.vote_type === 'up').length;
        const downvotes = idea.votes.filter(vote => vote.vote_type === 'down').length;

        return {
          ...idea.toJSON(),
          upvotes,
          downvotes,
          userVote: idea.votes.find(vote => vote.user_id === (req.user ? req.user.id : null)) ? idea.votes.find(vote => vote.user_id === (req.user ? req.user.id : null)).vote_type : null
        };
      });

      res.json({
        ideas: ideasWithVoteCounts,
        total: ideas.count,
        page: parseInt(page),
        totalPages: Math.ceil(ideas.count / limit)
      });
    } catch (error) {
      console.error('Erro ao listar ideias:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar ideia
  static async create(req, res) {
    console.log('=== INÍCIO DA CRIAÇÃO DE IDEIA ===');
    console.log(' Dados recebidos:', {
      body: req.body,
      files: req.files,
      user: req.user ? { id: req.user.id } : 'Nenhum usuário autenticado',
      headers: req.headers
    });

    try {
      const { 
        title, 
        description, 
        location, 
        latitude, 
        longitude, 
        category_id,
        tags 
      } = req.body;

      console.log(' Validando campos obrigatórios...');
      if (!title || !description || !location || !category_id) {
        const error = {
          title: !title,
          description: !description,
          location: !location,
          category_id: !category_id
        };
        console.error(' Campos obrigatórios faltando:', error);
        return res.status(400).json({ 
          error: 'Campos obrigatórios faltando',
          missing: error
        });
      }

      console.log(' Validando category_id...');
      console.log(' Tipo do category_id:', typeof category_id);
      console.log(' Valor do category_id:', category_id);

      // Validar se é um UUID válido (usando regex mais flexível)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(category_id)) {
        console.error('❌ Formato de UUID inválido:', category_id);
        return res.status(400).json({ 
          error: 'Formato de ID de categoria inválido',
          details: 'O ID da categoria deve estar no formato UUID (ex: 550e8400-e29b-41d4-a716-446655440001)',
          received: category_id,
          expected_format: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        });
      }

      // Verificar se a categoria existe
      console.log('🔍 Verificando se a categoria existe...');
      const category = await Category.findByPk(category_id);
      console.log('📌 Categoria encontrada:', category ? category.id : 'Não encontrada');

      if (!category) {
        console.error('❌ Categoria não encontrada:', category_id);
        return res.status(400).json({ 
          error: 'Categoria não encontrada',
          details: 'A categoria selecionada não existe',
          category_id: category_id
        });
      }

      console.log('✅ Dados validados com sucesso');
      console.log('🔄 Criando nova ideia...');

      const idea = await Idea.create({
        title,
        description,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        category_id, // UUID vindo do frontend
        user_id: req.user.id,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : null,
        status: 'pending'
      });

      console.log('✅ Ideia criada com sucesso:', idea.id);

      // Se houver imagem, salvar na tabela de imagens
      if (req.file) {
        console.log('📷 Salvando imagem da ideia...', {
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype
        });
        
        try {
          const image = await IdeaImage.create({
            idea_id: idea.id,
            filename: req.file.filename,
            original_name: req.file.originalname,
            mime_type: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            url: `/uploads/ideas/${req.file.filename}`,
            is_primary: true,
            sort_order: 0
          });
          console.log('🖼️ Imagem salva com sucesso:', image.id);
        } catch (imageError) {
          console.error('❌ Erro ao salvar imagem:', imageError);
          // Continuar mesmo com erro na imagem
        }
      }

      console.log('🔄 Buscando dados completos da ideia...');
      const fullIdea = await Idea.findByPk(idea.id, {
        include: [
          { model: Category, as: 'category' },
          { model: User, as: 'user' },
          { model: IdeaImage, as: 'images' }
        ]
      });

      console.log('✅ Resposta final preparada');
      console.log('=== FIM DA CRIAÇÃO DE IDEIA COM SUCESSO ===');
      
      return res.status(201).json({
        message: 'Ideia criada com sucesso',
        idea: fullIdea
      });
    } catch (error) {
      console.error('❌ ERRO AO CRIAR IDEIA ==================');
      console.error('📌 Tipo de erro:', error.name);
      console.error('📌 Mensagem:', error.message);
      console.error('📌 Stack:', error.stack);
      
      // Log detalhado para erros de validação do Sequelize
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => ({
          field: err.path,
          message: err.message,
          type: err.type,
          value: err.value
        }));
        
        console.error('📌 Erros de validação:', errors);
        
        return res.status(400).json({
          error: 'Erro de validação',
          details: errors,
          type: 'VALIDATION_ERROR'
        });
      }
      
      // Log detalhado para erros de chave estrangeira
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        console.error('📌 Erro de chave estrangeira:', {
          table: error.table,
          fields: error.fields,
          value: error.value
        });
        
        return res.status(400).json({
          error: 'Erro de referência',
          details: 'Referência inválida em um ou mais campos',
          type: 'FOREIGN_KEY_ERROR',
          table: error.table,
          fields: error.fields
        });
      }
      
      // Para outros tipos de erros
      console.error('❌ Erro inesperado:', {
        name: error.name,
        message: error.message,
        stack: error.stack.split('\n').slice(0, 5).join('\n') + '...'
      });
      
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Ocorreu um erro inesperado',
        type: 'INTERNAL_SERVER_ERROR',
        requestId: req.id
      });
    }
  }

  // Obter ideia por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const idea = await Idea.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'icon', 'color']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Vote,
            as: 'votes',
            attributes: ['id', 'vote_type', 'user_id']
          },
          {
            model: Comment,
            as: 'comments',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }],
            where: { is_active: true },
            required: false
          },
          {
            model: IdeaImage,
            as: 'images',
            attributes: ['id', 'url', 'filename', 'is_primary', 'original_name']
          }
        ]
      });

      if (!idea) {
        return res.status(404).json({ error: 'Ideia não encontrada' });
      }

      // Calcular votos
      const upvotes = idea.votes.filter(vote => vote.vote_type === 'up').length;
      const downvotes = idea.votes.filter(vote => vote.vote_type === 'down').length;
      const userVote = idea.votes.find(vote => vote.user_id === (req.user ? req.user.id : null)) ? idea.votes.find(vote => vote.user_id === (req.user ? req.user.id : null)).vote_type : null;

      res.json({
        idea: {
          ...idea.toJSON(),
          upvotes,
          downvotes,
          userVote,
          comments: idea.comments || []
        }
      });
    } catch (error) {
      console.error('Erro ao buscar ideia:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar ideia
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        location,
        latitude,
        longitude,
        category_id,
        tags,
        status
      } = req.body;

      const idea = await Idea.findByPk(id);
      if (!idea) {
        return res.status(404).json({ error: 'Ideia não encontrada' });
      }

      // Verificar se o usuário é o dono da ideia ou admin
      if (idea.user_id !== req.user.id && !req.user.is_admin) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await idea.update({
        title,
        description,
        location,
        latitude: latitude ? parseFloat(latitude) : idea.latitude,
        longitude: longitude ? parseFloat(longitude) : idea.longitude,
        category_id,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : idea.tags,
        status: req.user.is_admin ? status : idea.status // Apenas admin pode alterar status
      });

      res.json({
        message: 'Ideia atualizada com sucesso',
        idea: await Idea.findByPk(id, {
          include: [
            { model: Category, as: 'category' },
            { model: User, as: 'user' }
          ]
        })
      });
    } catch (error) {
      console.error('Erro ao atualizar ideia:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Excluir ideia
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const idea = await Idea.findByPk(id);
      if (!idea) {
        return res.status(404).json({ error: 'Ideia não encontrada' });
      }

      // Verificar se o usuário é o dono da ideia ou admin
      if (idea.user_id !== req.user.id && !req.user.is_admin) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await idea.update({ is_active: false });

      res.json({ message: 'Ideia excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir ideia:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Votar em uma ideia
  static async vote(req, res) {
    try {
      const { id } = req.params;
      const { vote_type } = req.body;

      const idea = await Idea.findByPk(id);
      if (!idea) {
        return res.status(404).json({ error: 'Ideia não encontrada' });
      }

      // Verificar se o usuário já votou
      const existingVote = await Vote.findOne({
        where: {
          idea_id: id,
          user_id: req.user.id
        }
      });

      if (existingVote) {
        if (existingVote.vote_type === vote_type) {
          // Remover voto se for o mesmo tipo
          await existingVote.destroy();
        } else {
          // Alterar tipo do voto
          await existingVote.update({ vote_type });
        }
      } else {
        // Criar novo voto
        await Vote.create({
          idea_id: id,
          user_id: req.user.id,
          vote_type
        });
      }

      // Recalcular votos
      await IdeaController.recalculateVotes(id);

      res.json({ message: 'Voto registrado com sucesso' });
    } catch (error) {
      console.error('Erro ao votar:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar ideias de um usuário específico
  static async listByUser(req, res) {
    try {
      const { id: userId } = req.params;
      const {
        page = 1,
        limit = 10,
        status,
        sort = 'recent'
      } = req.query;

      const offset = (page - 1) * limit;
      let where = {
        user_id: userId,
        is_active: true
      };

      // Filtro por status
      if (status) where.status = status;

      // Ordenação
      let order = [];
      switch (sort) {
        case 'votes':
          order = [[{ model: Vote, as: 'votes' }, 'created_at', 'DESC']];
          break;
        case 'oldest':
          order = [['created_at', 'ASC']];
          break;
        default: // recent
          order = [['created_at', 'DESC']];
      }

      const ideas = await Idea.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'icon', 'color']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      // Contadores para paginação
      const totalPages = Math.ceil(ideas.count / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      res.json({
        ideas: ideas.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: ideas.count,
          totalPages,
          hasNext,
          hasPrev
        }
      });
    } catch (error) {
      console.error('Erro ao listar ideias do usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
  // Busca global (ideias, usuários, comentários)
  static async globalSearch(req, res) {
    try {
      const { q: query, type = 'all', page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Termo de busca deve ter pelo menos 2 caracteres' });
      }

      const searchTerm = `%${query}%`;
      let results = {
        ideas: [],
        users: [],
        comments: [],
        categories: []
      };

      // Buscar ideias
      if (type === 'all' || type === 'ideas') {
        const ideas = await Idea.findAll({
          where: {
            [Op.and]: [
              { is_active: true },
              {
                [Op.or]: [
                  { title: { [Op.iLike]: searchTerm } },
                  { description: { [Op.iLike]: searchTerm } },
                  { location: { [Op.iLike]: searchTerm } }
                ]
              }
            ]
          },
          include: [
            { model: Category, as: 'category' },
            { model: User, as: 'user', attributes: ['id', 'name'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']]
        });
        results.ideas = ideas;
      }

      // Buscar usuários (apenas admin)
      if ((type === 'all' || type === 'users') && req.user?.is_admin) {
        const users = await User.findAll({
          where: {
            is_active: true,
            [Op.or]: [
              { name: { [Op.iLike]: searchTerm } },
              { email: { [Op.iLike]: searchTerm } }
            ]
          },
          include: [{
            model: UserProfile,
            as: 'profile'
          }],
          attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] },
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']]
        });
        results.users = users;
      }

      // Buscar comentários (apenas admin)
      if ((type === 'all' || type === 'comments') && req.user?.is_admin) {
        const comments = await Comment.findAll({
          where: {
            is_active: true,
            content: { [Op.iLike]: searchTerm }
          },
          include: [
            { model: User, as: 'user', attributes: ['id', 'name'] },
            { model: Idea, as: 'idea', attributes: ['id', 'title'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']]
        });
        results.comments = comments;
      }

      // Buscar categorias
      if (type === 'all' || type === 'categories') {
        const categories = await Category.findAll({
          where: {
            is_active: true,
            [Op.or]: [
              { name: { [Op.iLike]: searchTerm } },
              { description: { [Op.iLike]: searchTerm } }
            ]
          },
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['name', 'ASC']]
        });
        results.categories = categories;
      }

      res.json({
        query,
        type,
        results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: results.ideas.length + results.users.length + results.comments.length + results.categories.length
        }
      });
    } catch (error) {
      console.error('Erro na busca global:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Recalcular votos de uma ideia
  static async recalculateVotes(ideaId) {
    try {
      const upvotes = await Vote.count({
        where: {
          idea_id: ideaId,
          vote_type: 'up'
        }
      });

      const downvotes = await Vote.count({
        where: {
          idea_id: ideaId,
          vote_type: 'down'
        }
      });

      await Idea.update(
        {
          upvotes: upvotes,
          downvotes: downvotes
        },
        {
          where: { id: ideaId }
        }
      );
    } catch (error) {
      console.error('Erro ao recalcular votos:', error);
    }
  }
}
module.exports = IdeaController;

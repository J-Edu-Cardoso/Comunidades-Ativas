const { User, UserProfile, Idea, Category, Vote, Comment } = require('../models');
const { Op } = require('sequelize');

class StatsController {
  // Estatísticas gerais do sistema
  static async getGeneralStats(req, res) {
    try {
      const [
        totalUsers,
        activeUsers,
        totalIdeas,
        activeIdeas,
        totalCategories,
        activeCategories,
        totalVotes,
        totalComments,
        recentIdeas,
        topCategories,
        topUsers
      ] = await Promise.all([
        // Total de usuários
        User.count(),

        // Usuários ativos
        User.count({ where: { is_active: true } }),

        // Total de ideias
        Idea.count(),

        // Ideias ativas
        Idea.count({ where: { is_active: true } }),

        // Total de categorias
        Category.count(),

        // Categorias ativas
        Category.count({ where: { is_active: true } }),

        // Total de votos
        Vote.count(),

        // Total de comentários
        Comment.count({ where: { is_active: true } }),

        // Ideias recentes (últimos 7 dias)
        Idea.count({
          where: {
            created_at: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // Categorias mais usadas
        Idea.findAll({
          attributes: [
            'category_id',
            [Idea.sequelize.fn('COUNT', Idea.sequelize.col('category_id')), 'count']
          ],
          include: [{
            model: Category,
            as: 'category',
            attributes: ['name', 'icon', 'color'],
            where: { is_active: true },
            required: true
          }],
          where: { is_active: true },
          group: ['category_id', 'category.id'],
          order: [[Idea.sequelize.literal('count'), 'DESC']],
          limit: 5
        }),

        // Usuários mais ativos
        Idea.findAll({
          attributes: [
            'user_id',
            [Idea.sequelize.fn('COUNT', Idea.sequelize.col('user_id')), 'idea_count']
          ],
          include: [{
            model: User,
            as: 'user',
            attributes: ['name', 'email'],
            include: [{
              model: UserProfile,
              as: 'profile',
              attributes: ['avatar']
            }],
            where: { is_active: true },
            required: true
          }],
          where: { is_active: true },
          group: ['user_id', 'user.id', 'user->profile.id'],
          order: [[Idea.sequelize.literal('idea_count'), 'DESC']],
          limit: 5
        })
      ]);

      // Calcular taxa de engajamento
      const engagementRate = totalIdeas > 0 ? ((totalVotes + totalComments) / totalIdeas).toFixed(2) : 0;

      res.json({
        overview: {
          totalUsers,
          activeUsers,
          totalIdeas,
          activeIdeas,
          totalCategories,
          activeCategories,
          totalVotes,
          totalComments,
          recentIdeas,
          engagementRate
        },
        topCategories: topCategories.map(item => ({
          category: item.category,
          count: parseInt(item.dataValues.count)
        })),
        topUsers: topUsers.map(item => ({
          user: {
            ...item.user.toJSON(),
            avatar: item.user.profile?.avatar || null
          },
          ideaCount: parseInt(item.dataValues.idea_count)
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Estatísticas de uma ideia específica
  static async getIdeaStats(req, res) {
    try {
      const { id } = req.params;

      const idea = await Idea.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: User, as: 'user', attributes: ['name'] }
        ]
      });

      if (!idea) {
        return res.status(404).json({ error: 'Ideia não encontrada' });
      }

      const [votes, comments] = await Promise.all([
        Vote.findAll({ where: { idea_id: id } }),
        Comment.findAll({
          where: { idea_id: id, is_active: true },
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        })
      ]);

      const upvotes = votes.filter(v => v.vote_type === 'up').length;
      const downvotes = votes.filter(v => v.vote_type === 'down').length;

      res.json({
        idea: {
          id: idea.id,
          title: idea.title,
          status: idea.status,
          created_at: idea.created_at
        },
        stats: {
          upvotes,
          downvotes,
          totalVotes: votes.length,
          totalComments: comments.length,
          engagement: votes.length + comments.length
        },
        recentActivity: comments.slice(-5).map(comment => ({
          user: comment.user.name,
          content: comment.content.substring(0, 100),
          created_at: comment.created_at
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas da ideia:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Estatísticas de um usuário
  static async getUserStats(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        include: [{
          model: UserProfile,
          as: 'profile'
        }]
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const [
        totalIdeas,
        totalVotes,
        totalComments,
        recentIdeas,
        userVotes
      ] = await Promise.all([
        Idea.count({ where: { user_id: id, is_active: true } }),
        Vote.count({ where: { user_id: id } }),
        Comment.count({ where: { user_id: id, is_active: true } }),
        Idea.findAll({
          where: { user_id: id, is_active: true },
          order: [['created_at', 'DESC']],
          limit: 3,
          attributes: ['id', 'title', 'status', 'created_at']
        }),
        Vote.findAll({
          where: { user_id: id },
          include: [{
            model: Idea,
            as: 'idea',
            attributes: ['id', 'title', 'status'],
            include: [{
              model: Category,
              as: 'category',
              attributes: ['name']
            }]
          }],
          order: [['created_at', 'DESC']],
          limit: 5
        })
      ]);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.profile?.avatar || null,
          memberSince: user.created_at
        },
        stats: {
          totalIdeas,
          totalVotes,
          totalComments,
          reputation: (totalIdeas * 10) + (totalVotes * 2) + (totalComments * 1)
        },
        recentIdeas,
        recentVotes: userVotes.map(vote => ({
          idea: vote.idea,
          vote_type: vote.vote_type,
          created_at: vote.created_at
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = StatsController;

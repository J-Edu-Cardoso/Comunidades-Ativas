const { Comment, User, Idea } = require('../models');

class CommentController {
  // Listar comentários de uma ideia
  static async list(req, res) {
    try {
      const { idea_id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const comments = await Comment.findAndCountAll({
        where: {
          idea_id,
          is_active: true,
          parent_id: null // Apenas comentários principais
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Comment,
            as: 'replies',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }],
            where: { is_active: true },
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'ASC']]
      });

      res.json({
        comments: comments.rows,
        total: comments.count,
        page: parseInt(page),
        totalPages: Math.ceil(comments.count / limit)
      });
    } catch (error) {
      console.error('Erro ao listar comentários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar comentário
  static async create(req, res) {
    try {
      const { idea_id } = req.params;
      const { content, parent_id } = req.body;

      // Verificar se ideia existe
      const idea = await Idea.findByPk(idea_id);
      if (!idea) {
        return res.status(404).json({ error: 'Ideia não encontrada' });
      }

      const comment = await Comment.create({
        content,
        idea_id,
        user_id: req.user.id,
        parent_id: parent_id || null
      });

      // Atualizar contador de comentários da ideia
      const commentCount = await Comment.count({
        where: { idea_id, is_active: true }
      });

      await idea.update({ comment_count: commentCount });

      res.status(201).json({
        message: 'Comentário criado com sucesso',
        comment: await Comment.findByPk(comment.id, {
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        })
      });
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar comentário
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }

      // Verificar se o usuário é o dono do comentário
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await comment.update({ content });

      res.json({
        message: 'Comentário atualizado com sucesso',
        comment: await Comment.findByPk(id, {
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        })
      });
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Excluir comentário
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }

      // Verificar se o usuário é o dono do comentário
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Em vez de excluir, marcar como inativo
      await comment.update({ is_active: false });

      // Atualizar contador de comentários da ideia
      const idea = await Idea.findByPk(comment.idea_id);
      if (idea) {
        const commentCount = await Comment.count({
          where: { idea_id: comment.idea_id, is_active: true }
        });
        await idea.update({ comment_count: commentCount });
      }

      res.json({ message: 'Comentário excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = CommentController;

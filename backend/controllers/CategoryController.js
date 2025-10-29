const { Category } = require('../models');

class CategoryController {
  // Listar todas as categorias ativas
  static async list(req, res) {
    try {
      const categories = await Category.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });

      res.json({ categories });
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar categoria (apenas admin)
  static async create(req, res) {
    try {
      const { name, description, icon, color } = req.body;

      const category = await Category.create({
        name,
        description,
        icon,
        color
      });

      res.status(201).json({
        message: 'Categoria criada com sucesso',
        category
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ error: 'Nome da categoria já existe' });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  // Obter categoria por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json({ category });
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar categoria (apenas admin)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, icon, color, is_active } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      await category.update({
        name,
        description,
        icon,
        color,
        is_active
      });

      res.json({
        message: 'Categoria atualizada com sucesso',
        category
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Excluir categoria (apenas admin)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Verificar se há ideias usando esta categoria
      const ideasCount = await category.countIdeas();
      if (ideasCount > 0) {
        return res.status(400).json({
          error: 'Não é possível excluir categoria que possui ideias'
        });
      }

      await category.destroy();

      res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = CategoryController;

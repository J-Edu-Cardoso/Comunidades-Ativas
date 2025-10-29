'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Idea extends Model {
    static associate(models) {
      // Uma ideia pertence a um usuário
      Idea.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Uma ideia pertence a uma categoria
      Idea.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });

      // Uma ideia pode ter muitos votos
      Idea.hasMany(models.Vote, {
        foreignKey: 'idea_id',
        as: 'votes'
      });

      // Uma ideia pode ter muitos comentários
      Idea.hasMany(models.Comment, {
        foreignKey: 'idea_id',
        as: 'comments'
      });

      // Uma ideia pode ter muitas imagens
      Idea.hasMany(models.IdeaImage, {
        foreignKey: 'idea_id',
        as: 'images'
      });
    }
  }

  Idea.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.TEXT, // Alterado de STRING para TEXT para permitir textos maiores
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'O local é obrigatório'
        },
        len: {
          args: [1, 2000],
          msg: 'O local deve ter no máximo 2000 caracteres'
        }
      }
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'implemented'),
      defaultValue: 'pending',
    },
    upvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    downvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    comment_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'Idea',
    tableName: 'ideas',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Idea;
};

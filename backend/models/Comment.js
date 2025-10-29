'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // Um comentário pertence a uma ideia
      Comment.belongsTo(models.Idea, {
        foreignKey: 'idea_id',
        as: 'idea'
      });

      // Um comentário pertence a um usuário
      Comment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Um comentário pode ter um comentário pai (respostas)
      Comment.belongsTo(models.Comment, {
        foreignKey: 'parent_id',
        as: 'parent'
      });

      // Um comentário pode ter muitos comentários filhos (respostas)
      Comment.hasMany(models.Comment, {
        foreignKey: 'parent_id',
        as: 'replies'
      });
    }
  }

  Comment.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    idea_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ideas',
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
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Comment;
};

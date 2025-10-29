'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class IdeaImage extends Model {
    static associate(models) {
      // Uma imagem pertence a uma ideia
      IdeaImage.belongsTo(models.Idea, {
        foreignKey: 'idea_id',
        as: 'idea'
      });
    }
  }

  IdeaImage.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    idea_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ideas',
        key: 'id',
      },
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'IdeaImage',
    tableName: 'idea_images',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return IdeaImage;
};

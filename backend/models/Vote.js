'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vote extends Model {
    static associate(models) {
      // Um voto pertence a uma ideia
      Vote.belongsTo(models.Idea, {
        foreignKey: 'idea_id',
        as: 'idea'
      });

      // Um voto pertence a um usuário
      Vote.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  Vote.init({
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    vote_type: {
      type: DataTypes.ENUM('up', 'down'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Vote',
    tableName: 'votes',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['idea_id', 'user_id'],
        name: 'unique_idea_user_vote'
      }
    ]
  });

  return Vote;
};

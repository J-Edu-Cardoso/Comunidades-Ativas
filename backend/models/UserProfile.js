'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    static associate(models) {
      // Um perfil pertence a um usuário
      UserProfile.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  UserProfile.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL da foto de perfil do usuário',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interests: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    total_ideas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    reputation_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'UserProfile',
    tableName: 'user_profiles',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return UserProfile;
};

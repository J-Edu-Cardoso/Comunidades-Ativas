'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Um usuário pode ter muitas ideias
      User.hasMany(models.Idea, {
        foreignKey: 'user_id',
        as: 'ideas'
      });

      // Um usuário pode ter muitos votos
      User.hasMany(models.Vote, {
        foreignKey: 'user_id',
        as: 'votes'
      });

      // Um usuário pode ter muitos comentários
      User.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments'
      });

      // Um usuário tem um perfil
      User.hasOne(models.UserProfile, {
        foreignKey: 'user_id',
        as: 'profile'
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_admin',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    last_login: {
      type: DataTypes.DATE,
      field: 'last_login',
    },
    password_reset_token: {
      type: DataTypes.STRING,
      field: 'password_reset_token',
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      field: 'password_reset_expires',
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return User;
};

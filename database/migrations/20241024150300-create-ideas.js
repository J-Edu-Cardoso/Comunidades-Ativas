'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ideas', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'implemented'),
        defaultValue: 'pending',
      },
      upvotes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      downvotes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      comment_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Adicionar índices para melhorar performance
    await queryInterface.addIndex('ideas', ['category_id']);
    await queryInterface.addIndex('ideas', ['user_id']);
    await queryInterface.addIndex('ideas', ['status']);
    await queryInterface.addIndex('ideas', ['created_at']);
    await queryInterface.addIndex('ideas', ['upvotes']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ideas');
  },
};

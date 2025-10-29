'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Criar enum para tipo de voto
    await queryInterface.createTable('votes', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      idea_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ideas',
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
      vote_type: {
        type: Sequelize.ENUM('up', 'down'),
        allowNull: false,
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

    // Verificar se índice único já existe antes de criar
    const indexes = await queryInterface.showIndex('votes');
    const uniqueIndexExists = indexes.some(index => index.name === 'unique_idea_user_vote');

    if (!uniqueIndexExists) {
      // Um usuário só pode votar uma vez por ideia
      await queryInterface.addIndex('votes', ['idea_id', 'user_id'], {
        unique: true,
        name: 'unique_idea_user_vote'
      });
    }

    // Adicionar outros índices
    await queryInterface.addIndex('votes', ['idea_id']);
    await queryInterface.addIndex('votes', ['user_id']);
    await queryInterface.addIndex('votes', ['vote_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('votes');
  },
};

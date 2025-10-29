'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_profiles', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL da foto de perfil do usuário'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_profiles', 'avatar');
  }
};

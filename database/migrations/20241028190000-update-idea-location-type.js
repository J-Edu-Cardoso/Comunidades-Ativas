'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Alterar o tipo da coluna location para TEXT
    await queryInterface.sequelize.query(
      'ALTER TABLE ideas ALTER COLUMN location TYPE TEXT;'
    );
    
    console.log('✅ Tipo da coluna location alterado para TEXT com sucesso!');
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter para o tipo original (STRING com 255 caracteres)
    await queryInterface.sequelize.query(
      'ALTER TABLE ideas ALTER COLUMN location TYPE VARCHAR(255);'
    );
    
    console.log('✅ Tipo da coluna location revertido para VARCHAR(255)');
  },
};

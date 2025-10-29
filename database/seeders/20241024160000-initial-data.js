'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Inserir categorias iniciais
    await queryInterface.bulkInsert('categories', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Infraestrutura',
        description: 'Melhorias em estradas, pontes, calçadas e outros elementos urbanos',
        icon: 'fas fa-hard-hat',
        color: '#FF6B35',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Segurança',
        description: 'Propostas para melhorar a segurança pública e privada',
        icon: 'fas fa-shield-alt',
        color: '#F7931E',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Meio Ambiente',
        description: 'Ideias para preservação ambiental e sustentabilidade',
        icon: 'fas fa-leaf',
        color: '#4CAF50',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Educação',
        description: 'Melhorias no sistema educacional e espaços de aprendizagem',
        icon: 'fas fa-graduation-cap',
        color: '#2196F3',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Saúde',
        description: 'Propostas para melhorar os serviços de saúde',
        icon: 'fas fa-heartbeat',
        color: '#E91E63',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Lazer',
        description: 'Ideias para espaços de recreação e entretenimento',
        icon: 'fas fa-futbol',
        color: '#9C27B0',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        name: 'Outros',
        description: 'Outras sugestões e ideias gerais',
        icon: 'fas fa-lightbulb',
        color: '#607D8B',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);

    // Inserir usuário administrador
    const hashedPassword = await require('bcryptjs').hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Administrador',
        email: 'admin@comunidadeativa.com',
        password: hashedPassword,
        is_admin: true,
        is_active: true,
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);

    // Inserir perfil do administrador
    await queryInterface.bulkInsert('user_profiles', [
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        bio: 'Administrador da plataforma Comunidade Ativa',
        location: 'Brasil',
        occupation: 'Administrador',
        total_ideas: 0,
        total_votes: 0,
        reputation_score: 100,
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  }
};

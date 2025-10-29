// Sistema de dados mockado para desenvolvimento
class IdeaService {
  constructor() {
    this.ideas = this.getMockIdeas();
  }

  getMockIdeas() {
    return [
      {
        id: 1,
        title: "Reforma da Praça Central",
        description: "Proposta de revitalização da praça com bancos novos, iluminação LED e área para crianças.",
        category: "Infraestrutura",
        location: "Vila Mariana, SP",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        upvotes: 245,
        downvotes: 12,
        comments: 43,
        author: "Maria Silva",
        date: "2024-01-15"
      },
      {
        id: 2,
        title: "Hortas Comunitárias",
        description: "Criação de hortas comunitárias em terrenos ociosos do bairro para promover alimentação saudável.",
        category: "Meio Ambiente",
        location: "Pinheiros, SP",
        image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        upvotes: 189,
        downvotes: 5,
        comments: 27,
        author: "João Santos",
        date: "2024-01-12"
      },
      {
        id: 3,
        title: "Mais Iluminação Pública",
        description: "Instalação de postes de iluminação nas ruas escuras do bairro para maior segurança.",
        category: "Segurança",
        location: "Moema, SP",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        upvotes: 312,
        downvotes: 8,
        comments: 56,
        author: "Ana Costa",
        date: "2024-01-10"
      },
      {
        id: 4,
        title: "Ciclovia na Avenida Principal",
        description: "Construção de ciclovia segura para incentivar o uso de bicicletas como meio de transporte.",
        category: "Infraestrutura",
        location: "Jardins, SP",
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        upvotes: 198,
        downvotes: 15,
        comments: 34,
        author: "Carlos Oliveira",
        date: "2024-01-08"
      },
      {
        id: 5,
        title: "Ponto de Coleta Seletiva",
        description: "Instalação de pontos de coleta seletiva de resíduos para melhorar a reciclagem no bairro.",
        category: "Meio Ambiente",
        location: "Itaim Bibi, SP",
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        upvotes: 156,
        downvotes: 3,
        comments: 22,
        author: "Fernanda Lima",
        date: "2024-01-05"
      },
      {
        id: 6,
        title: "Academia ao Ar Livre",
        description: "Instalação de equipamentos de ginástica ao ar livre para promover a saúde da população.",
        category: "Saúde",
        location: "Vila Madalena, SP",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        upvotes: 278,
        downvotes: 7,
        comments: 41,
        author: "Roberto Alves",
        date: "2024-01-03"
      }
    ];
  }

  async getIdeas(filters = {}) {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredIdeas = [...this.ideas];

    // Aplicar filtros
    if (filters.category && filters.category.length > 0) {
      filteredIdeas = filteredIdeas.filter(idea =>
        filters.category.includes(idea.category.toLowerCase())
      );
    }

    if (filters.sort) {
      switch (filters.sort) {
        case 'votes':
          filteredIdeas.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
          break;
        case 'recent':
          filteredIdeas.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case 'location':
          // Em um sistema real, calcularia distância do usuário
          filteredIdeas.sort((a, b) => a.location.localeCompare(b.location));
          break;
      }
    }

    return filteredIdeas;
  }

  async submitIdea(ideaData) {
    // Simular envio para API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newIdea = {
      id: Date.now(),
      ...ideaData,
      upvotes: 0,
      downvotes: 0,
      comments: 0,
      author: "Você",
      date: new Date().toISOString().split('T')[0]
    };

    this.ideas.unshift(newIdea);
    return newIdea;
  }

  async voteIdea(ideaId, voteType) {
    // Simular voto
    await new Promise(resolve => setTimeout(resolve, 200));

    const idea = this.ideas.find(i => i.id === ideaId);
    if (idea) {
      if (voteType === 'up') {
        idea.upvotes++;
      } else {
        idea.downvotes++;
      }
    }

    return true;
  }
}

// Estender a classe principal
class ExtendedApp extends ComunidadeAtiva {
  constructor() {
    super();
    this.ideaService = new IdeaService();
    this.currentFilters = {
      category: [],
      sort: 'votes'
    };
  }

  async loadIdeas() {
    try {
      const ideas = await this.ideaService.getIdeas(this.currentFilters);
      this.renderIdeas(ideas);
    } catch (error) {
      console.error('Erro ao carregar ideias:', error);
      this.showNotification('Erro ao carregar ideias', 'danger');
    }
  }

  renderIdeas(ideas) {
    const container = document.getElementById('ideas-container');
    const template = document.getElementById('idea-card-template');

    if (!container || !template) return;

    container.innerHTML = '';

    ideas.forEach(idea => {
      const ideaElement = this.createIdeaElement(template, idea);
      container.appendChild(ideaElement);
    });

    // Re-setup do sistema de votação
    this.setupVotingSystem();
  }

  createIdeaElement(template, idea) {
    const element = template.content.cloneNode(true);

    // Substituir placeholders
    element.querySelector('.idea-image').style.backgroundImage = `url('${idea.image}')`;
    element.querySelector('.idea-category').textContent = idea.category;
    element.querySelector('.idea-location span').textContent = idea.location;
    element.querySelector('.idea-content h3').textContent = idea.title;
    element.querySelector('.idea-content p').textContent = idea.description;
    element.querySelector('.upvote span').textContent = idea.upvotes;
    element.querySelector('.downvote span').textContent = idea.downvotes;
    element.querySelector('.comments span').textContent = idea.comments;

    // Adicionar data attributes
    element.querySelector('.idea-card').dataset.ideaId = idea.id;

    return element;
  }

  async handleVote(button) {
    const ideaCard = button.closest('.idea-card');
    const ideaId = parseInt(ideaCard.dataset.ideaId);
    const isUpvote = button.classList.contains('upvote');

    try {
      await this.ideaService.voteIdea(ideaId, isUpvote ? 'up' : 'down');
      await this.loadIdeas(); // Recarregar para mostrar votos atualizados

      this.showNotification(
        isUpvote ? 'Voto positivo registrado!' : 'Feedback registrado!',
        'success'
      );
    } catch (error) {
      console.error('Erro ao votar:', error);
      this.showNotification('Erro ao registrar voto', 'danger');
    }
  }

  setupIdeaFilters() {
    // Setup do filtro de ordenação
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', async () => {
        this.currentFilters.sort = sortSelect.value;
        await this.loadIdeas();
      });
    }

    // Setup do botão carregar mais
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', async () => {
        loadMoreBtn.textContent = 'Carregando...';
        loadMoreBtn.disabled = true;

        // Simular carregamento de mais ideias
        setTimeout(async () => {
          await this.loadIdeas();
          loadMoreBtn.textContent = 'Ver Mais Ideias';
          loadMoreBtn.disabled = false;
        }, 1000);
      });
    }
  }

  async submitIdeaForm(formData) {
    try {
      // Preparar dados da ideia
      const ideaData = {
        title: formData.get('title') || document.getElementById('idea-title').value,
        category: formData.get('category') || document.getElementById('idea-category').value,
        location: formData.get('location') || document.getElementById('idea-location').value,
        description: formData.get('description') || document.getElementById('idea-description').value,
        tags: formData.get('tags') || document.getElementById('idea-tags').value,
        images: [] // Em um sistema real, faria upload das imagens
      };

      // Validar dados
      if (!ideaData.title || !ideaData.category || !ideaData.location || !ideaData.description) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }

      // Enviar ideia
      const newIdea = await this.ideaService.submitIdea(ideaData);

      this.showNotification('Ideia enviada com sucesso! 🎉', 'success');

      // Resetar formulário
      document.getElementById('idea-form').reset();

      // Recarregar ideias
      await this.loadIdeas();

      // Scroll para o topo das ideias
      document.getElementById('explorar').scrollIntoView({ behavior: 'smooth' });

      return newIdea;
    } catch (error) {
      console.error('Erro ao enviar ideia:', error);
      this.showNotification(error.message || 'Erro ao enviar ideia', 'danger');
      throw error;
    }
  }
}

// Substituir a classe principal
window.ComunidadeAtiva = ExtendedApp;

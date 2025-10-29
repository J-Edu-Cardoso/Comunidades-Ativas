// Configuração de rotas e navegação do site
const SiteConfig = {
  // Informações básicas do site
  site: {
    name: 'Comunidade Ativa',
    description: 'Plataforma colaborativa para melhorias comunitárias',
    url: 'https://comunidade-ativa.com',
    email: 'contato@comunidadeativa.com.br'
  },

  // Páginas do site
  pages: {
    home: {
      path: '/',
      file: 'index-novo.html',
      title: 'Comunidade Ativa - Sua Voz, Nossa Cidade',
      description: 'Participe e ajude a melhorar nossa cidade com suas ideias e sugestões.'
    },
    login: {
      path: '/login',
      file: 'login.html',
      title: 'Entrar - Comunidade Ativa',
      description: 'Faça login para participar da comunidade'
    },
    register: {
      path: '/register',
      file: 'register.html',
      title: 'Cadastrar - Comunidade Ativa',
      description: 'Junte-se à comunidade e comece a fazer a diferença'
    },
    newIdea: {
      path: '/nova-ideia',
      file: 'nova-ideia.html',
      title: 'Nova Ideia - Comunidade Ativa',
      description: 'Compartilhe suas ideias para melhorar a cidade'
    },
    profile: {
      path: '/profile',
      file: 'Profile.html',
      title: 'Meu Perfil - Comunidade Ativa',
      description: 'Gerencie suas ideias e acompanhe seu progresso'
    }
  },

  // Configurações de API (para futuro)
  api: {
    baseUrl: 'https://api.comunidade-ativa.com',
    endpoints: {
      ideas: '/api/ideas',
      users: '/api/users',
      votes: '/api/votes'
    }
  },

  // Configurações de recursos externos
  external: {
    maps: {
      key: '', // Adicionar chave do Google Maps quando necessário
      embedUrl: 'https://www.google.com/maps/embed'
    },
    images: {
      defaultAvatar: 'https://via.placeholder.com/100x100?text=Avatar',
      ideaPlaceholder: 'https://via.placeholder.com/400x200?text=Ideia'
    }
  },

  // Configurações de funcionalidades
  features: {
    voting: true,
    comments: true,
    imageUpload: true,
    locationServices: true,
    notifications: true,
    darkMode: false
  },

  // Categorias de ideias
  categories: {
    infraestrutura: { name: 'Infraestrutura', icon: 'fas fa-road', color: '#4F46E5' },
    seguranca: { name: 'Segurança', icon: 'fas fa-shield-alt', color: '#EF4444' },
    'meio-ambiente': { name: 'Meio Ambiente', icon: 'fas fa-leaf', color: '#10B981' },
    educacao: { name: 'Educação', icon: 'fas fa-graduation-cap', color: '#F59E0B' },
    saude: { name: 'Saúde', icon: 'fas fa-heart', color: '#EC4899' },
    lazer: { name: 'Lazer', icon: 'fas fa-futbol', color: '#8B5CF6' },
    outros: { name: 'Outros', icon: 'fas fa-ellipsis-h', color: '#6B7280' }
  },

  // Configurações de recompensas
  rewards: {
    firstPlace: {
      title: '1º Lugar',
      description: 'Desconto de até 30% na conta de energia por 3 meses',
      icon: 'fas fa-medal'
    },
    secondPlace: {
      title: '2º Lugar',
      description: 'Vale-compras no comércio local no valor de R$ 500,00',
      icon: 'fas fa-trophy'
    },
    thirdPlace: {
      title: '3º Lugar',
      description: 'Isenção da taxa de lixo por 6 meses',
      icon: 'fas fa-award'
    }
  },

  // Configurações de navegação
  navigation: {
    showAuthButtons: true,
    showUserMenu: true,
    enableMobileMenu: true,
    smoothScroll: true,
    scrollOffset: 80
  },

  // Configurações de animações
  animations: {
    enableScrollEffects: true,
    enableHoverEffects: true,
    enableLoadingAnimations: true,
    duration: 300
  }
};

// Sistema de rotas SPA
class RouteManager {
  constructor() {
    this.currentRoute = this.getCurrentRoute();
    this.routes = SiteConfig.pages;
    this.init();
  }

  init() {
    // Handle navegação por links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && this.isInternalRoute(link.href)) {
        e.preventDefault();
        this.navigate(link.href, link.textContent);
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.route) {
        this.loadRoute(e.state.route, false);
      }
    });

    // Handle formulários
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.matches('[data-route]')) {
        e.preventDefault();
        this.handleFormSubmission(form);
      }
    });
  }

  isInternalRoute(href) {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  }

  getCurrentRoute() {
    const path = window.location.pathname;
    const hash = window.location.hash;

    // Encontrar rota correspondente
    for (const [key, route] of Object.entries(this.routes)) {
      if (route.path === path || route.file.includes(path.substring(1))) {
        return key;
      }
    }

    return 'home';
  }

  navigate(path, title = '') {
    const route = this.findRouteByPath(path);
    if (route) {
      this.loadRoute(route, true, title);
    }
  }

  findRouteByPath(path) {
    // Remove query parameters e hash
    const cleanPath = path.split('?')[0].split('#')[0];

    for (const [key, route] of Object.entries(this.routes)) {
      if (route.path === cleanPath ||
          route.file === cleanPath.substring(1) ||
          cleanPath.includes(route.file)) {
        return route;
      }
    }

    return this.routes.home; // fallback
  }

  async loadRoute(route, updateHistory = true, pageTitle = '') {
    try {
      // Mostrar loading
      this.showLoading();

      // Carregar conteúdo da página
      const response = await fetch(route.file);
      if (!response.ok) throw new Error('Página não encontrada');

      const html = await response.text();

      // Extrair conteúdo principal
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Atualizar head
      this.updatePageHead(doc, route, pageTitle);

      // Atualizar conteúdo
      this.updatePageContent(doc);

      // Atualizar histórico
      if (updateHistory) {
        history.pushState({ route: route.key }, route.title, route.path);
      }

      // Recarregar componentes
      if (window.ComponentLoader) {
        const componentLoader = new window.ComponentLoader();
      }

      // Executar scripts específicos da página
      this.executePageScripts(route.key);

      this.currentRoute = route.key;

      // Esconder loading
      this.hideLoading();

    } catch (error) {
      console.error('Erro ao carregar página:', error);
      this.showError('Erro ao carregar página');
      this.hideLoading();
    }
  }

  updatePageHead(doc, route, customTitle) {
    // Atualizar título
    document.title = customTitle || route.title;

    // Atualizar meta description
    const metaDescription = doc.querySelector('meta[name="description"]');
    if (metaDescription) {
      const currentMeta = document.querySelector('meta[name="description"]');
      if (currentMeta) {
        currentMeta.content = metaDescription.content;
      }
    }

    // Atualizar Open Graph
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      const currentOgTitle = document.querySelector('meta[property="og:title"]');
      if (currentOgTitle) {
        currentOgTitle.content = ogTitle.content;
      }
    }
  }

  updatePageContent(doc) {
    // Atualizar conteúdo principal
    const newContent = doc.querySelector('main') || doc.querySelector('body > :not(script):not(style)');
    const currentContent = document.querySelector('main');

    if (newContent && currentContent) {
      currentContent.innerHTML = newContent.innerHTML;
    }

    // Atualizar header se necessário
    const newHeader = doc.querySelector('header');
    const currentHeader = document.querySelector('header');

    if (newHeader && currentHeader) {
      currentHeader.innerHTML = newHeader.innerHTML;
    }

    // Atualizar footer se necessário
    const newFooter = doc.querySelector('footer');
    const currentFooter = document.querySelector('footer');

    if (newFooter && currentFooter) {
      currentFooter.innerHTML = newFooter.innerHTML;
    }
  }

  executePageScripts(routeKey) {
    // Scripts específicos por página
    switch (routeKey) {
      case 'home':
        this.initHomePage();
        break;
      case 'newIdea':
        this.initNewIdeaPage();
        break;
      case 'login':
      case 'register':
        this.initAuthPage();
        break;
      case 'profile':
        this.initProfilePage();
        break;
    }
  }

  initHomePage() {
    // Inicializar funcionalidades da página inicial
    if (window.app) {
      window.app.loadIdeas();
    }
  }

  initNewIdeaPage() {
    // Inicializar funcionalidades da página de nova ideia
    if (window.locationPicker) {
      window.locationPicker.init();
    }

    if (window.imageUploader) {
      window.imageUploader.init();
    }
  }

  initAuthPage() {
    // Melhorar UX dos formulários de auth
    document.querySelectorAll('.auth-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAuthSubmission(form);
      });
    });
  }

  initProfilePage() {
    // Inicializar funcionalidades do perfil
    if (window.profileManager) {
      window.profileManager.loadUserData();
    }
  }

  handleAuthSubmission(form) {
    const formData = new FormData(form);
    const isLogin = form.classList.contains('login-form');

    // Simular autenticação
    setTimeout(() => {
      if (isLogin) {
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: 'Usuário Teste',
          email: formData.get('email'),
          avatar: SiteConfig.external.images.defaultAvatar
        }));
        this.showNotification('Login realizado com sucesso!', 'success');
        this.navigate('/');
      } else {
        this.showNotification('Cadastro realizado com sucesso!', 'success');
        this.navigate('/login');
      }
    }, 1000);
  }

  showLoading() {
    let loading = document.querySelector('.page-loading');
    if (!loading) {
      loading = document.createElement('div');
      loading.className = 'page-loading';
      loading.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Carregando...</p>
        </div>
      `;
      document.body.appendChild(loading);
    }
    loading.style.display = 'flex';
  }

  hideLoading() {
    const loading = document.querySelector('.page-loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  showError(message) {
    this.showNotification(message, 'danger');
  }

  showNotification(message, type = 'info') {
    if (window.app && window.app.showNotification) {
      window.app.showNotification(message, type);
    } else {
      // Fallback para notificação simples
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Inicializar sistema de rotas
const routeManager = new RouteManager();

// Exportar para uso global
window.SiteConfig = SiteConfig;
window.RouteManager = RouteManager;

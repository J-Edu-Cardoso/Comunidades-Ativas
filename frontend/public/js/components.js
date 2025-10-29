// Componentes HTML reutilizáveis
class ComponentLoader {
  constructor() {
    this.components = new Map();
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.loadAllComponents();
    });
  }

  async loadAllComponents() {
    await this.loadHeader();
    await this.loadFooter();
    this.setupComponents();
  }

  async loadHeader() {
    const headerContainer = document.querySelector('#header-container');
    if (headerContainer) {
      const isLoggedIn = this.getAuthState();

      headerContainer.innerHTML = `
        <nav class="navbar">
          <div class="container">
            <div class="logo">
              <i class="fas fa-hands-helping"></i>
              <span>Comunidade Ativa</span>
            </div>

            <div class="nav-links" id="navLinks">
              <a href="#como-funciona">Como Funciona</a>
              <a href="#explorar">Explorar Ideias</a>
              <a href="#criar-ideia" class="btn btn-primary">+ Nova Ideia</a>
              ${isLoggedIn ? this.getUserMenu() : this.getAuthButtons()}
            </div>

            <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu" aria-expanded="false">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </nav>
      `;
    }
  }

  async loadFooter() {
    const footerContainer = document.querySelector('#footer-container');
    if (footerContainer) {
      footerContainer.innerHTML = `
        <footer>
          <div class="container">
            <div class="footer-content">
              <div class="footer-about">
                <div class="logo">
                  <i class="fas fa-hands-helping"></i>
                  <span>Comunidade Ativa</span>
                </div>
                <p>Plataforma colaborativa para melhorias comunitárias com recompensas.</p>
                <div class="social-links">
                  <a href="#" title="Facebook"><i class="fab fa-facebook"></i></a>
                  <a href="#" title="Twitter"><i class="fab fa-twitter"></i></a>
                  <a href="#" title="Instagram"><i class="fab fa-instagram"></i></a>
                  <a href="#" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
                </div>
              </div>

              <div class="footer-links">
                <h3>Links Rápidos</h3>
                <ul>
                  <li><a href="#sobre">Sobre Nós</a></li>
                  <li><a href="#como-funciona">Como Funciona</a></li>
                  <li><a href="#explorar">Ideias em Destaque</a></li>
                  <li><a href="#recompensas">Recompensas</a></li>
                  <li><a href="#contato">Contato</a></li>
                </ul>
              </div>

              <div class="footer-contact">
                <h3>Contato</h3>
                <p><i class="fas fa-envelope"></i> contato@comunidadeativa.com.br</p>
                <p><i class="fas fa-phone"></i> (31) 98765-4321</p>
                <p><i class="fas fa-map-marker-alt"></i> Belo Horizonte, MG</p>
              </div>

              <div class="footer-map">
                <h3>Localização</h3>
                <div class="map-container">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3750.8796568999997!2d-43.9385!3d-19.9312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa6999ed5da6f1d%3A0x6f0f0f0f0f0f0f0f!2sPra%C3%A7a%20da%20Liberdade%2C%20Belo%20Horizonte%20-%20MG!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr"
                    width="100%"
                    height="150"
                    style="border:0; border-radius: 8px;"
                    allowfullscreen=""
                    loading="lazy"
                    title="Nossa localização">
                  </iframe>
                </div>
              </div>
            </div>

            <div class="footer-bottom">
              <p>&copy; ${new Date().getFullYear()} Comunidade Ativa. Todos os direitos reservados.</p>
              <div class="footer-legal">
                <a href="#termos">Termos de Uso</a>
                <a href="#privacidade">Política de Privacidade</a>
                <a href="#cookies">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      `;
    }
  }

  setupComponents() {
    // Setup do menu mobile
    this.setupMobileMenu();

    // Setup dos links de navegação
    this.setupNavigation();

    // Setup dos botões de autenticação
    this.setupAuthButtons();
  }

  setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const isExpanded = navLinks.classList.contains('active');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded.toString());
      });

      // Fechar menu ao clicar em link (mobile)
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            navLinks.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  }

  setupNavigation() {
    // Smooth scroll para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const headerHeight = document.querySelector('.navbar')?.offsetHeight || 80;
            const targetPosition = target.offsetTop - headerHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  setupAuthButtons() {
    // Botões de autenticação
    const authButtons = document.querySelectorAll('.auth-buttons a, .mobile-auth-buttons a');

    authButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const href = btn.getAttribute('href');

        if (href.includes('login')) {
          this.navigateTo('login.html');
        } else if (href.includes('register')) {
          this.navigateTo('register.html');
        }
      });
    });
  }

  getAuthState() {
    // Verificar se usuário está logado (simplificado)
    return localStorage.getItem('user') !== null;
  }

  getUserMenu() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return `
      <div class="user-menu">
        <button class="user-btn" id="userBtn">
          <img src="${user.avatar || 'https://via.placeholder.com/32'}" alt="Avatar" class="user-avatar">
          <span>${user.name || 'Usuário'}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <a href="Profile.html" class="dropdown-item">
            <i class="fas fa-user"></i> Perfil
          </a>
          <a href="#minhas-ideias" class="dropdown-item">
            <i class="fas fa-lightbulb"></i> Minhas Ideias
          </a>
          <a href="#configuracoes" class="dropdown-item">
            <i class="fas fa-cog"></i> Configurações
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item" id="logoutBtn">
            <i class="fas fa-sign-out-alt"></i> Sair
          </a>
        </div>
      </div>
    `;
  }

  getAuthButtons() {
    return `
      <div class="auth-buttons">
        <a href="login.html" class="btn btn-outline">Entrar</a>
        <a href="register.html" class="btn btn-primary">Cadastrar</a>
      </div>
    `;
  }

  navigateTo(page) {
    // Sistema de navegação entre páginas
    if (page.startsWith('#')) {
      // Navegação interna
      const target = document.querySelector(page);
      if (target) {
        const headerHeight = document.querySelector('.navbar')?.offsetHeight || 80;
        const targetPosition = target.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // Navegação para outras páginas
      window.location.href = page;
    }
  }

  // Método para carregar componentes dinamicamente
  static async loadComponent(selector, componentName) {
    const container = document.querySelector(selector);
    if (container && !container.dataset.loaded) {
      try {
        const response = await fetch(`components/${componentName}.html`);
        const html = await response.text();
        container.innerHTML = html;
        container.dataset.loaded = 'true';
        return true;
      } catch (error) {
        console.error(`Erro ao carregar componente ${componentName}:`, error);
        return false;
      }
    }
    return false;
  }
}

// Sistema de navegação SPA
class SPANavigation {
  constructor() {
    this.currentPage = window.location.pathname;
    this.init();
  }

  init() {
    // Interceptar links internos
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && this.isInternalLink(link.href)) {
        e.preventDefault();
        this.navigate(link.href);
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.loadPage(e.state.page, false);
      }
    });
  }

  isInternalLink(href) {
    return href.startsWith(window.location.origin) ||
           href.startsWith('/') ||
           href.startsWith('#');
  }

  navigate(url) {
    if (url.startsWith('#')) {
      // Navegação por âncora
      const target = document.querySelector(url);
      if (target) {
        const headerHeight = document.querySelector('.navbar')?.offsetHeight || 80;
        const targetPosition = target.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // Navegação para outras páginas
      this.loadPage(url, true);
    }
  }

  async loadPage(url, updateHistory = true) {
    try {
      const response = await fetch(url);
      const html = await response.text();

      // Extrair conteúdo principal
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Atualizar conteúdo
      const newContent = doc.querySelector('main') || doc.querySelector('body');
      const currentContent = document.querySelector('main') || document.querySelector('body');

      if (newContent && currentContent) {
        currentContent.innerHTML = newContent.innerHTML;
      }

      // Atualizar título
      document.title = doc.title;

      // Atualizar histórico
      if (updateHistory) {
        history.pushState({ page: url }, doc.title, url);
      }

      // Recarregar componentes
      const componentLoader = new ComponentLoader();

      this.currentPage = url;
    } catch (error) {
      console.error('Erro ao carregar página:', error);
      window.location.href = url; // Fallback
    }
  }
}

// Inicializar componentes
const componentLoader = new ComponentLoader();
const spaNavigation = new SPANavigation();

// Exportar para uso global
window.ComponentLoader = ComponentLoader;
window.SPANavigation = SPANavigation;

/**
 * Navigation Component
 * Gerencia a navegação do site de forma consistente em todas as páginas
 */

class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.navLinks = document.querySelector('.nav-links');
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Inicializa imediatamente se o DOM já estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        // Inicializa o menu mobile
        this.setupMobileMenu();
        
        // Adiciona a classe 'scrolled' ao rolar a página
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Fecha o menu ao clicar em um link
        this.setupNavigationLinks();
        
        // Marca a aba ativa
        this.setActiveLink();
        
        // Configura o estado de login
        this.setupAuthState();
    }
    
    setupAuthState() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userMenu = document.querySelector('.user-menu');
        const authButtons = document.querySelector('.auth-buttons');
        
        if (userMenu && authButtons) {
            userMenu.style.display = isLoggedIn ? 'block' : 'none';
            authButtons.style.display = isLoggedIn ? 'none' : 'flex';
        }
        
        // Configura o botão de logout
        const logoutBtn = document.querySelector('.dropdown-item[href*="login.html"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'login.html';
            });
        }
    }
    
    setupNavigationLinks() {
        // Configura links de navegação
        document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
            if (link.getAttribute('href') && !link.getAttribute('href').startsWith('http') && 
                !link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', (e) => {
                    if (this.navLinks && this.navLinks.classList.contains('active')) {
                        this.toggleMobileMenu();
                    }
                    
                    // Verifica se é um link interno
                    const href = link.getAttribute('href');
                    if (href && href.endsWith('.html')) {
                        e.preventDefault();
                        window.location.href = this.getFullPath(href);
                    }
                });
            }
        });
    }
    
    getFullPath(relativePath) {
        // Obtém o caminho base do site
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
        // Remove barras duplas e constrói o caminho completo
        return `${basePath}/${relativePath}`.replace(/\/+/g, '/');
    }
    
    setupMobileMenu() {
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }
    }
    
    toggleMobileMenu() {
        if (this.navLinks) {
            this.navLinks.classList.toggle('active');
            this.mobileMenuBtn.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            // Atualiza o atributo aria-expanded
            const isExpanded = this.mobileMenuBtn.getAttribute('aria-expanded') === 'true' || false;
            this.mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        }
    }
    
    handleScroll() {
        if (!this.navbar) return;
        
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
    
    setActiveLink() {
        const links = document.querySelectorAll('.nav-link');
        if (!links.length) return;
        
        const currentPath = window.location.pathname;
        let activeFound = false;
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Remove a classe ativa de todos os links
            link.classList.remove('active');
            
            // Verifica se o link corresponde à página atual
            if (currentPath.endsWith(href) || 
                (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('/index.html')))) {
                link.classList.add('active');
                activeFound = true;
            }
        });
        
        // Se nenhum link estiver ativo, marca o primeiro link como ativo (geralmente a página inicial)
        if (!activeFound && links.length > 0) {
            links[0].classList.add('active');
        }
    }
}

// Inicializa o gerenciador de navegação quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new NavigationManager());
} else {
    new NavigationManager();
}

// Função para carregar o cabeçalho em todas as páginas
function loadNavigation() {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        fetch('components/header.html')
            .then(response => response.text())
            .then(html => {
                headerContainer.innerHTML = html;
                // Inicializa o menu após carregar o cabeçalho
                new NavigationManager();
            })
            .catch(error => console.error('Erro ao carregar o cabeçalho:', error));
    }
}

// Carrega o cabeçalho se o container existir
if (document.getElementById('header-container')) {
    loadNavigation();
}

/**
 * Controle do menu móvel responsivo
 */

class MobileMenu {
    constructor() {
        this.menuToggle = document.getElementById('menuToggle');
        this.navLinks = document.getElementById('navLinks');
        this.menuOverlay = document.getElementById('menuOverlay');
        this.navLinksItems = document.querySelectorAll('.nav-links a, .auth-buttons a');
        this.navbar = document.getElementById('navbar');
        this.isMenuOpen = false;
        
        this.init();
    }
    
    init() {
        // Verificar se os elementos existem
        if (!this.menuToggle || !this.navLinks || !this.menuOverlay || !this.navbar) {
            console.warn('Elementos do menu móvel não encontrados');
            return;
        }
        
        this.bindEvents();
        this.setActiveLink();
    }
    
    bindEvents() {
        // Adicionar eventos
        this.menuToggle.addEventListener('click', (e) => this.toggleMenu(e));
        this.menuOverlay.addEventListener('click', () => this.closeMenu());
        
        // Fechar menu ao clicar em um link
        this.navLinksItems.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Fechar menu ao rolar ou redimensionar
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('scroll', () => this.handleResize(), { passive: true });
    }
    
    // Alternar menu móvel
    toggleMenu(event) {
        if (event) event.preventDefault();
        
        this.isMenuOpen = !this.isMenuOpen;
        
        // Atualizar classes
        this.menuToggle.classList.toggle('active', this.isMenuOpen);
        this.navLinks.classList.toggle('active', this.isMenuOpen);
        this.menuOverlay.classList.toggle('active', this.isMenuOpen);
        document.body.classList.toggle('menu-open', this.isMenuOpen);
        
        // Melhorar acessibilidade
        this.menuToggle.setAttribute('aria-expanded', this.isMenuOpen);
        this.navLinks.setAttribute('aria-hidden', !this.isMenuOpen);
        
        // Bloquear scroll quando o menu estiver aberto
        if (this.isMenuOpen) {
            this.scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${this.scrollY}px`;
            document.body.style.width = '100%';
        } else {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, this.scrollY || 0);
        }
    }
    
    // Fechar menu
    closeMenu() {
        if (this.isMenuOpen) {
            this.toggleMenu();
        }
    }
    
    // Fechar menu ao redimensionar a tela para desktop
    handleResize() {
        if (window.innerWidth >= 1024) {
            this.closeMenu();
        }
        
        // Atualizar estado do menu baseado no tamanho da tela
        const isMobile = window.innerWidth < 1024;
        this.menuToggle.style.display = isMobile ? 'block' : 'none';
        this.navLinks.style.display = isMobile ? 'none' : 'flex';
        
        // Atualizar classe do navbar ao rolar
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
    
    // Ativar link ativo na navegação
    setActiveLink() {
        const currentLocation = window.location.pathname;
        
        this.navLinksItems.forEach(link => {
            const linkPath = link.getAttribute('href');
            
            if (currentLocation === linkPath) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }
}

// Inicializar o menu móvel quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileMenu = new MobileMenu();
    });
} else {
    window.mobileMenu = new MobileMenu();
}

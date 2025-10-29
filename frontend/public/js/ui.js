/**
 * UI Service - Gerencia interface do usuário, navegação e elementos visuais
 */
class UIService {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupScrollEffects();
    }

    bindEvents() {
        // Fechar modais
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    auth.closeModal(modal.id);
                }
            }

            // Fechar modal ao clicar fora
            if (e.target.classList.contains('modal')) {
                auth.closeModal(e.target.id);
            }
        });

        // Fechar modais com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal[style*="display: block"]');
                openModals.forEach(modal => {
                    auth.closeModal(modal.id);
                });
            }
        });
    }

    setupNavigation() {
        // Smooth scroll para links de navegação
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Atualizar navegação ativa
                    this.updateActiveNav(targetId);
                }
            });
        });

        // Atualizar navegação ativa baseado no scroll
        window.addEventListener('scroll', () => this.updateActiveNavOnScroll());
    }

    updateActiveNav(targetId) {
        // Remover classe active de todos os links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Adicionar classe active ao link correto
        const activeLink = document.querySelector(`a[href="${targetId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.updateActiveNav(`#${sectionId}`);
            }
        });
    }

    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const nav = document.getElementById('nav');

        if (mobileToggle && nav) {
            mobileToggle.addEventListener('click', () => {
                nav.classList.toggle('mobile-open');
                mobileToggle.classList.toggle('active');
            });

            // Fechar menu ao clicar em um link
            nav.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('mobile-open');
                    mobileToggle.classList.remove('active');
                });
            });
        }
    }

    setupScrollEffects() {
        // Header scroll effect
        const header = document.getElementById('header');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }

        // Scroll to top button
        this.createScrollToTopButton();
    }

    createScrollToTopButton() {
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.id = 'scrollToTopBtn';
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollToTopBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border: none;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
        `;

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        document.body.appendChild(scrollToTopBtn);

        // Mostrar/esconder botão baseado no scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.visibility = 'visible';
            } else {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.visibility = 'hidden';
            }
        });
    }

    // Funções de formulário
    resetForm() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.reset();

            // Limpar validações visuais
            form.querySelectorAll('.form-group.error').forEach(group => {
                group.classList.remove('error');
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            if (!field.value.trim()) {
                this.markFieldError(formGroup);
                isValid = false;
            } else {
                this.clearFieldError(formGroup);
            }
        });

        return isValid;
    }

    markFieldError(formGroup) {
        formGroup.classList.add('error');
        const errorMsg = formGroup.querySelector('.error-message');
        if (!errorMsg) {
            const error = document.createElement('span');
            error.className = 'error-message';
            error.textContent = 'Este campo é obrigatório';
            formGroup.appendChild(error);
        }
    }

    clearFieldError(formGroup) {
        formGroup.classList.remove('error');
        const errorMsg = formGroup.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    // Loading states
    setButtonLoading(button, loading = true) {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText;
        }
    }

    // Animações
    animateElement(element, animation) {
        element.classList.add(`animate-${animation}`);
        setTimeout(() => {
            element.classList.remove(`animate-${animation}`);
        }, 600);
    }

    // Utilitários
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Instância global do serviço de UI
const ui = new UIService();

/**
 * Main Application - Ponto de entrada da aplicação
 * Gerencia a inicialização, autenticação e roteamento da aplicação
 */
console.log('🔄 app.js carregado com sucesso!');

class App {
    // Propriedades estáticas
    static isInitialized = false;
    static currentUser = null;
    static config = window.APP_CONFIG || {};
    
    // Serviços da aplicação
    static services = {
        api: { name: 'API', loaded: false, instance: null },
        auth: { name: 'Autenticação', loaded: false, instance: null },
        router: { name: 'Roteador', loaded: false, instance: null }
    };
    
    // Rotas protegidas (requerem autenticação)
    static protectedRoutes = [
        '/profile.html',
        '/dashboard.html',
        '/minhas-ideias.html'
    ];
    
    // Rotas públicas (não requerem autenticação)
    static publicRoutes = [
        '/login.html',
        '/register.html',
        '/recuperar-senha.html'
    ];

    /**
     * Inicializa a aplicação
     */
    static async init() {
        // Evitar inicialização duplicada
        if (this.isInitialized) {
            console.log('ℹ️ Aplicação já foi inicializada');
            return true;
        }

        console.log('🚀 Iniciando Comunidade Ativa...');
        
        try {
            // Inicializar serviços essenciais
            await this.initializeServices();
            
            // Configurar gerenciamento de autenticação
            this.setupAuthHandlers();
            
            // Verificar autenticação atual
            await this.checkAuthStatus();
            
            // Configurar roteamento
            this.setupRouting();
            
            this.isInitialized = true;
            console.log('✅ Aplicação inicializada com sucesso!');
            
            // Disparar evento de inicialização
            this.triggerEvent('app:initialized');
            
            return true;
        } catch (error) {
            console.error('❌ Erro durante a inicialização:', error);
            this.showError('Erro ao inicializar a aplicação');
            throw error;
        }
    }
    
    /**
     * Inicializa os serviços da aplicação
     */
    static async initializeServices() {
        try {
            console.log('🔧 Inicializando serviços...');
            
            // 1. Inicializar API
            if (!this.services.api.loaded) {
                this.services.api.instance = window.api || new ApiService();
                window.api = this.services.api.instance;
                this.services.api.loaded = true;
                console.log('✅ API inicializada');
            }
            
            // 2. Inicializar Autenticação
            if (!this.services.auth.loaded && window.api) {
                this.services.auth.instance = window.auth || new AuthService(window.api);
                window.auth = this.services.auth.instance;
                this.services.auth.loaded = true;
                console.log('✅ Autenticação inicializada');
            }
            
            // 3. Inicializar Roteador
            if (!this.services.router.loaded) {
                this.services.router.instance = window.router || this.setupRouter();
                window.router = this.services.router.instance;
                this.services.router.loaded = true;
                console.log('✅ Roteador inicializado');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar serviços:', error);
            throw error;
        }
    }
    
    /**
     * Configura os manipuladores de autenticação
     */
    static setupAuthHandlers() {
        if (!this.services.auth.loaded) return;
        
        // Ouvir eventos de autenticação
        document.addEventListener('auth:login', (e) => {
            this.currentUser = e.detail.user;
            this.updateUIForAuthState(true);
            this.redirectAfterLogin();
        });
        
        document.addEventListener('auth:logout', () => {
            this.currentUser = null;
            this.updateUIForAuthState(false);
            this.redirectToLogin();
        });
        
        document.addEventListener('auth:error', (e) => {
            console.error('Erro de autenticação:', e.detail.error);
            this.showError('Erro de autenticação. Tente novamente.');
        });
    }
    
    /**
     * Verifica o status de autenticação
     */
    static async checkAuthStatus() {
        try {
            if (!this.services.auth.loaded) return false;
            
            const isAuthenticated = await this.services.auth.instance.isAuthenticated();
            
            if (isAuthenticated) {
                this.currentUser = await this.services.auth.instance.getCurrentUser();
                this.updateUIForAuthState(true);
                return true;
            } else {
                this.updateUIForAuthState(false);
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            this.updateUIForAuthState(false);
            return false;
        }
    }

    /**
     * Configura o roteamento da aplicação
     */
    static setupRouting() {
        // Verificar rota atual
        const currentPath = window.location.pathname;
        const isProtectedRoute = this.protectedRoutes.some(route => currentPath.endsWith(route));
        const isPublicRoute = this.publicRoutes.some(route => currentPath.endsWith(route));
        
        // Se for uma rota protegida e o usuário não estiver autenticado, redirecionar para login
        if (isProtectedRoute && !this.currentUser) {
            this.redirectToLogin(currentPath);
            return;
        }
        
        // Se for uma rota pública e o usuário estiver autenticado, redirecionar para o painel
        if ((isPublicRoute && this.currentUser) && !currentPath.endsWith('/profile.html')) {
            this.redirectToDashboard();
            return;
        }
        
        // Atualizar a UI com base no estado de autenticação
        this.updateUIForAuthState(!!this.currentUser);
    }
    
    /**
     * Atualiza a interface com base no estado de autenticação
     * @param {boolean} isAuthenticated - Indica se o usuário está autenticado
     */
    static updateUIForAuthState(isAuthenticated) {
        // Elementos que devem ser mostrados apenas para usuários autenticados
        const authElements = document.querySelectorAll('[data-auth]');
        const guestElements = document.querySelectorAll('[data-guest]');
        
        authElements.forEach(el => {
            el.style.display = isAuthenticated ? '' : 'none';
        });
        
        guestElements.forEach(el => {
            el.style.display = isAuthenticated ? 'none' : '';
        });
        
        // Atualizar informações do usuário se estiver autenticado
        if (isAuthenticated && this.currentUser) {
            this.updateUserUI(this.currentUser);
        }
    }
    
    /**
     * Atualiza a interface com as informações do usuário
     * @param {Object} user - Dados do usuário
     */
    static updateUserUI(user) {
        // Atualizar avatar
        const avatarElements = document.querySelectorAll('[data-user-avatar]');
        if (user.avatar) {
            avatarElements.forEach(el => {
                el.src = user.avatar;
                el.alt = user.name || 'Usuário';
            });
        }
        
        // Atualizar nome do usuário
        const nameElements = document.querySelectorAll('[data-user-name]');
        if (user.name) {
            nameElements.forEach(el => {
                el.textContent = user.name;
            });
        }
        
        // Atualizar email do usuário
        const emailElements = document.querySelectorAll('[data-user-email]');
        if (user.email) {
            emailElements.forEach(el => {
                el.textContent = user.email;
                if (el.tagName === 'A') {
                    el.href = `mailto:${user.email}`;
                }
            });
        }
    }
    
    /**
     * Redireciona para a página de login
     * @param {string} [redirectTo] - URL para redirecionar após o login
     */
    static redirectToLogin(redirectTo) {
        const loginUrl = '/login.html';
        if (redirectTo) {
            window.location.href = `${loginUrl}?redirect=${encodeURIComponent(redirectTo)}`;
        } else {
            window.location.href = loginUrl;
        }
    }
    
    /**
     * Redireciona para o painel após o login
     */
    static redirectToDashboard() {
        window.location.href = '/profile.html';
    }
    
    /**
     * Redireciona após o login com base na URL de redirecionamento
     */
    static redirectAfterLogin() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect');
        
        if (redirectTo) {
            window.location.href = decodeURIComponent(redirectTo);
        } else {
            this.redirectToDashboard();
        }
    }
    
    /**
     * Exibe uma mensagem de erro para o usuário
     * @param {string} message - Mensagem de erro
     * @param {HTMLElement} [container] - Container onde a mensagem será exibida
     */
    static showError(message, container) {
        console.error('Erro:', message);
        
        // Se não for especificado um container, tenta encontrar um padrão
        if (!container) {
            container = document.getElementById('error-messages') || 
                       document.querySelector('.error-message') || 
                       document.body;
        }
        
        // Cria o elemento de erro se não existir
        let errorElement = document.getElementById('app-error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'app-error-message';
            errorElement.className = 'alert alert-danger';
            errorElement.style.margin = '10px';
            errorElement.style.padding = '10px';
            errorElement.style.borderRadius = '4px';
            errorElement.style.backgroundColor = '#f8d7da';
            errorElement.style.color = '#721c24';
            errorElement.style.border = '1px solid #f5c6cb';
            
            // Insere no início do container
            if (container.firstChild) {
                container.insertBefore(errorElement, container.firstChild);
            } else {
                container.appendChild(errorElement);
            }
        }
        
        // Atualiza a mensagem
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    /**
     * Dispara um evento personalizado
     * @param {string} eventName - Nome do evento
     * @param {Object} [detail] - Dados adicionais do evento
     */
    /**
     * Dispara um evento personalizado
     * @param {string} eventName - Nome do evento
     * @param {Object} [detail] - Dados adicionais do evento
     */
    /**
     * Dispara um evento personalizado
     * @param {string} eventName - Nome do evento
     * @param {Object} [detail] - Dados adicionais do evento
     */
    static triggerEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * Verifica se os serviços essenciais estão disponíveis
     * @param {number} [maxRetries=5] - Número máximo de tentativas
     * @param {number} [delay=100] - Atraso entre tentativas em ms
     * @returns {Promise<boolean>} True se todos os serviços estiverem disponíveis
     */
    static async checkEssentialServices(maxRetries = 5, delay = 100) {
        const essentialServices = ['api', 'auth'];
        let attempts = 0;
        
        return new Promise((resolve) => {
            const checkServices = () => {
                attempts++;
                const missingServices = essentialServices.filter(svc => !window[svc]);
                
                if (missingServices.length === 0 || attempts >= maxRetries) {
                    if (missingServices.length > 0) {
                        console.warn(`⚠️ Serviços ausentes após ${attempts} tentativas:`, missingServices);
                    }
                    resolve(missingServices.length === 0);
                    return;
                }
                
                console.log(`⏳ Aguardando serviços... (tentativa ${attempts}/${maxRetries})`);
                setTimeout(checkServices, delay);
            };
            
            checkServices();
        });
    }
    
    /**
     * Atualiza o status dos serviços na interface
     */
    static updateServicesStatus() {
        Object.entries(this.services).forEach(([key, service]) => {
            const statusElement = document.getElementById(`status-${key}`);
            if (statusElement) {
                statusElement.textContent = service.loaded ? '✅' : '❌';
                statusElement.title = service.loaded ? 'Carregado' : 'Falha ao carregar';
            }
        });
    }
    
    /**
     * Configura o roteador da aplicação
     * @returns {Object} Instância do roteador
     */
    static setupRouter() {
        return {
            navigate: (path) => {
                window.history.pushState({}, '', path);
                this.setupRouting();
            },
            getCurrentPath: () => window.location.pathname
        };
    }
    
    /**
     * Verifica a autenticação e redireciona conforme necessário
     */
    static async checkAndHandleAuth() {
        const currentPath = window.location.pathname;
        const isPublicRoute = this.publicRoutes.some(route => currentPath.endsWith(route));
        const isProtectedRoute = this.protectedRoutes.some(route => currentPath.endsWith(route));
        
        // Se for uma rota protegida e o usuário não estiver autenticado
        if (isProtectedRoute && !this.currentUser) {
            this.redirectToLogin(currentPath);
            return false;
        }
        
        // Se for uma rota pública e o usuário estiver autenticado
        if (isPublicRoute && this.currentUser) {
            this.redirectToDashboard();
            return false;
        }
        
        return true;
    }
    
    /**
     * Inicializa os manipuladores de eventos globais
     */
    static setupGlobalEventHandlers() {
        // Manipulador para links com data-navigate
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-navigate]');
            if (link) {
                e.preventDefault();
                const path = link.getAttribute('data-navigate');
                this.services.router.instance.navigate(path);
            }
        });
        
        // Manipulador para o botão de logout
        document.addEventListener('click', (e) => {
            const logoutBtn = e.target.closest('[data-action="logout"]');
            if (logoutBtn && this.services.auth.instance) {
                e.preventDefault();
                this.services.auth.instance.logout();
            }
        });
    }
        }
        
        // Se chegou aqui, alguns serviços não foram carregados
        console.warn(`⚠️ Alguns serviços essenciais não foram carregados: ${missingServices.join(', ')}`);
        this.updateServicesStatus();
        return false;
    }
    
    static updateServicesStatus() {
        // Atualizar status dos serviços
        Object.keys(this.services).forEach(service => {
            const isAvailable = !!window[service];
            this.services[service].loaded = isAvailable;
            console.log(`ℹ️ ${service}: ${isAvailable ? '✅' : '❌'}`);
        });
    }
    
    static async initializeApp() {
        try {
            console.log('🔄 Inicializando aplicação...');
            
            // Configurações iniciais
            this.setupGlobalErrorHandling();
            this.setupAvatarUpdateListener();
            this.updatePageTitle();
            
            // Verificar se estamos em uma página que precisa carregar dados
            const needsData = document.querySelector('#ideasContainer, #categoriesGrid');
            if (needsData) {
                await this.loadInitialData();
            }
            
            this.isInitialized = true;
            console.log('✅ Aplicação inicializada com sucesso!');
            
            // Disparar evento de inicialização
            document.dispatchEvent(new Event('app:initialized'));
            
        } catch (error) {
            console.error('❌ Erro ao inicializar a aplicação:', error);
            // Mostrar mensagem de erro para o usuário
            this.showError('Erro ao carregar a aplicação. Por favor, recarregue a página.');
        }
    }
    
    static showError(message) {
        const errorContainer = document.getElementById('error-container') || this.createErrorContainer();
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        
        // Esconder após 5 segundos
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }
    
    static createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'error-container';
        container.style = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ffebee; color: #c62828; padding: 10px 20px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000; display: none;';
        document.body.appendChild(container);
        return container;
    }
    
    static setupAvatarUpdateListener() {
        console.log('🔔 Configurando listener para atualização de avatar...');
        console.log('🔍 Verificando se o listener já está configurado...');
        
        // Remover listener existente para evitar duplicação
        window.removeEventListener('avatarUpdated', this.handleAvatarUpdate);
        
        // Adicionar o novo listener
        window.addEventListener('avatarUpdated', this.handleAvatarUpdate);
        
        console.log('✅ Listener de atualização de avatar configurado com sucesso!');
    }
    
    static handleAvatarUpdate(e) {
        console.log('🔄 Evento avatarUpdated recebido no App.handleAvatarUpdate:', e);
        console.log('🔄 Evento avatarUpdated recebido:', e.detail);
        const { avatar, name } = e.detail || {};
        console.log('📝 Dados recebidos - Avatar:', avatar, 'Nome:', name);
        
        // Atualizar avatar no menu principal
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userMenu = document.getElementById('userMenu');
        const authButtons = document.getElementById('authButtons');
        
        console.log('🔍 Elementos encontrados:', {
            userAvatar: !!userAvatar,
            userName: !!userName,
            userMenu: !!userMenu,
            authButtons: !!authButtons
        });
        
        if (userAvatar && userName && userMenu && authButtons) {
            if (avatar) {
                // Se tiver avatar, atualiza a imagem
                userAvatar.src = avatar;
                userAvatar.style.display = 'block';
                userAvatar.alt = name || 'Foto de perfil';
            } else if (name) {
                // Se não tiver avatar mas tiver nome, mostra as iniciais
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                const userAvatarPlaceholder = document.createElement('div');
                userAvatarPlaceholder.className = 'avatar-initials';
                userAvatarPlaceholder.textContent = initials;
                userAvatar.replaceWith(userAvatarPlaceholder);
            }
            
            if (name) {
                userName.textContent = name;
            }
            
            // Mostrar menu do usuário e esconder botões de autenticação
            userMenu.style.display = 'block';
            authButtons.style.display = 'none';
        }
    }

    static setupGlobalErrorHandling() {
        // Capturar erros não tratados
        window.addEventListener('error', (e) => {
            console.error('Erro global:', e.error);
        });

        // Capturar promessas rejeitadas
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promessa rejeitada:', e.reason);
        });
    }

    static updatePageTitle() {
        const currentHash = window.location.hash || '#home';
        const pageTitles = {
            '#home': 'Comunidade Ativa - Início',
            '#ideas': 'Comunidade Ativa - Ideias',
            '#submit': 'Comunidade Ativa - Enviar Ideia',
            '#about': 'Comunidade Ativa - Sobre',
            '#profile': 'Comunidade Ativa - Meu Perfil',
            '#my-ideas': 'Comunidade Ativa - Minhas Ideias'
        };

        const title = pageTitles[currentHash] || 'Comunidade Ativa - Sua Voz, Nossa Cidade';
        document.title = title;
    }

    static async loadInitialData() {
        console.log('🔄 Carregando dados iniciais...');
        
        // Verificar se estamos na página de ideias
        const ideasContainer = document.getElementById('ideasContainer');
        const categoriesGrid = document.getElementById('categoriesGrid');
        
        // Carregar categorias se o grid existir
        if (categoriesGrid) {
            try {
                console.log('📂 Carregando categorias...');
                await categories.loadCategories();
                console.log('✅ Categorias carregadas com sucesso');
            } catch (error) {
                console.error('❌ Erro ao carregar categorias:', error);
                this.showError('Não foi possível carregar as categorias');
            }
        }
        
        // Carregar ideias se o container existir
        if (ideasContainer) {
            try {
                console.log('💡 Carregando ideias...');
                await ideas.loadIdeas();
                
                // Atualizar estatísticas
                if (typeof ideas.updateStats === 'function') {
                    ideas.updateStats();
                }
                console.log('✅ Ideias carregadas com sucesso');
            } catch (error) {
                console.error('❌ Erro ao carregar ideias:', error);
                this.showError('Não foi possível carregar as ideias');
            }
        }
        
        console.log('✅ Dados iniciais carregados');
    }

    static showSuccess(message) {
        auth.showToast(message, 'success');
    }

    static showError(message) {
        auth.showToast(message, 'error');
    }

    static showWarning(message) {
        auth.showToast(message, 'warning');
    }

    static showInfo(message) {
        auth.showToast(message, 'info');
    }

    // Função global para resetar formulários
    static resetForm() {
        ui.resetForm();
    }

    // Função global para fechar modais
    static closeModal(modalId) {
        auth.closeModal(modalId);
    }

    // Função global para mostrar login
    static showLogin() {
        auth.showLogin();
    }

    // Função global para mostrar registro
    static showRegister() {
        auth.showRegister();
    }
}

// Classe App finalizada

// Função para atualizar a interface com base na autenticação
function updateAuthUI(userData) {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const profileNav = document.getElementById('profileNav');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
    const userInitials = document.getElementById('userInitials');

    // Verificar se os elementos existem antes de acessá-los
    if (!authButtons || !userMenu) {
        console.warn('Elementos de autenticação não encontrados na página');
        return;
    }

    if (userData && userData.token) {
        // Usuário autenticado
        authButtons.style.display = 'none';
        userMenu.style.display = 'block';
        profileNav.style.display = 'none'; // Ocultar botão de perfil separado
        
        // Atualizar nome do usuário
        if (userData.user && userData.user.name) {
            userName.textContent = userData.user.name;
            
            // Definir iniciais do avatar
            if (userData.user.name) {
                const names = userData.user.name.split(' ');
                let initials = names[0].charAt(0).toUpperCase();
                if (names.length > 1) {
                    initials += names[names.length - 1].charAt(0).toUpperCase();
                }
                userInitials.textContent = initials;
                
                // Gerar cor de fundo baseada no nome do usuário
                const colors = [
                    'from-blue-500 to-indigo-600',
                    'from-purple-500 to-pink-500',
                    'from-green-500 to-teal-500',
                    'from-yellow-500 to-orange-500',
                    'from-red-500 to-pink-600',
                    'from-indigo-500 to-purple-600'
                ];
                
                // Gerar um índice de cor baseado no nome do usuário
                let hash = 0;
                for (let i = 0; i < userData.user.name.length; i++) {
                    hash = userData.user.name.charCodeAt(i) + ((hash << 5) - hash);
                }
                const colorIndex = Math.abs(hash) % colors.length;
                
                // Aplicar a classe de gradiente
                userAvatarPlaceholder.className = 'flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm ' + colors[colorIndex];
            }
        }
        
        // Atualizar avatar se existir
        if (userData.user && userData.user.avatar) {
            userAvatar.src = userData.user.avatar;
            userAvatar.style.display = 'block';
            userAvatarPlaceholder.style.display = 'none';
        } else {
            userAvatar.style.display = 'none';
            userAvatarPlaceholder.style.display = 'flex';
        }
        
        // Configurar evento de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = function(e) {
                e.preventDefault();
                // Mostrar confirmação
                if (confirm('Tem certeza que deseja sair?')) {
                    // Limpar dados de autenticação
                    localStorage.removeItem('userData');
                    // Redirecionar para a página inicial
                    window.location.href = 'index.html';
                }
            };
        }
    } else {
        // Usuário não autenticado
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
        profileNav.style.display = 'none';
    }
}

// Funções globais para compatibilidade
window.resetForm = () => App.resetForm();
window.closeModal = (modalId) => App.closeModal();
window.showLogin = () => App.showLogin();
window.showRegister = () => App.showRegister();

// Exportar a classe App para o escopo global
window.App = App;

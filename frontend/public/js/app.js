/**
 * Main Application - Ponto de entrada da aplicação
 */
console.log('🔄 app.js carregado com sucesso!');

class App {
    static isInitialized = false;
    static services = {
        api: { name: 'API', loaded: false },
        auth: { name: 'Autenticação', loaded: false },
        ideas: { name: 'Ideias', loaded: false },
        categories: { name: 'Categorias', loaded: false }
    };

    static async init() {
        // Evitar inicialização duplicada
        if (this.isInitialized) {
            console.log('ℹ️ Aplicação já foi inicializada');
            return;
        }

        console.log('🚀 Iniciando Comunidade Ativa...');
        
        try {
            // Verificar serviços essenciais com tentativas
            const servicesReady = await this.checkEssentialServices(10, 200);
            
            if (!servicesReady) {
                console.warn('⚠️ Iniciando aplicação com alguns serviços indisponíveis');
            }

            // Inicializar a aplicação
            await this.initializeApp();
            
            // Verificar novamente os serviços após a inicialização
            if (!servicesReady) {
                await this.checkEssentialServices();
            }
            
            this.isInitialized = true;
            console.log('✅ Aplicação inicializada com sucesso!');
        } catch (error) {
            console.error('❌ Erro durante a inicialização:', error);
            throw error;
        }
    }

    static async checkEssentialServices(maxRetries = 5, delay = 100) {
        const essentialServices = ['api', 'auth'];
        let missingServices = [];
        
        // Função para verificar se todos os serviços essenciais estão disponíveis
        const checkServices = () => {
            missingServices = essentialServices.filter(svc => !window[svc]);
            return missingServices.length === 0;
        };
        
        // Tenta verificar os serviços imediatamente
        if (checkServices()) {
            this.updateServicesStatus();
            return true;
        }
        
        // Se não estiverem disponíveis, tenta novamente algumas vezes
        for (let i = 0; i < maxRetries; i++) {
            console.log(`🔄 Aguardando serviços essenciais... Tentativa ${i + 1}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            if (checkServices()) {
                this.updateServicesStatus();
                return true;
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

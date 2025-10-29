/**
 * Authentication Service - Gerencia login, registro e sessão do usuário
 */
class AuthService {
    constructor() {
        this.initializeService();
    }
    
    async initializeService() {
        // Aguardar a API estar disponível
        await this.waitForAPI();
        this.api = window.api;
        this.init();
    }
    
    waitForAPI(maxAttempts = 10, interval = 100) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const checkAPI = () => {
                attempts++;
                if (window.api) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('API não disponível após várias tentativas'));
                } else {
                    setTimeout(checkAPI, interval);
                }
            };
            checkAPI();
        });
    }

    init() {
        console.log('🔑 Inicializando serviço de autenticação...');
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout buttons
        const logoutBtns = document.querySelectorAll('#logoutBtn, #logoutBtn2');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleLogout(e));
        });

        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLogin());
        }

        // Register button
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegister());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('🔑 Iniciando processo de login...');

        // Detectar contexto: modal (index.html) ou página standalone (login.html)
        const emailField = document.getElementById('loginEmail') || document.getElementById('email');
        const passwordField = document.getElementById('loginPassword') || document.getElementById('password');

        const email = emailField ? emailField.value.trim() : '';
        const password = passwordField ? passwordField.value : '';

        console.log('📧 Email:', email ? 'fornecido' : 'não fornecido');

        if (!email || !password) {
            const errorMsg = !email && !password ? 'Por favor, preencha todos os campos' : 
                             !email ? 'Por favor, informe o e-mail' : 'Por favor, informe a senha';
            console.log('❌', errorMsg);
            this.showToast(errorMsg, 'error');
            return;
        }

        this.showLoading();

        try {
            console.log('🔑 Enviando credenciais para o servidor...');
            const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('📥 Resposta do servidor:', data);

            if (!response.ok) {
                throw new Error(data.message || `Erro ao fazer login (${response.status})`);
            }

            if (!data.token || !data.user) {
                throw new Error('Dados de autenticação inválidos na resposta do servidor');
            }

            // Salvar token e dados do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            console.log('✅ Login realizado com sucesso!');
            this.showToast('Login realizado com sucesso!', 'success');
            this.hideLoading();

            // Atualizar a interface
            this.updateAuthUI(data.user);

            // Redirecionar após um pequeno atraso
            setTimeout(() => {
                // Se estiver em modal, fechar modal
                if (document.getElementById('loginModal')) {
                    this.closeModal('loginModal');
                    // Recarregar a página para atualizar a interface
                    window.location.reload();
                } else {
                    // Se estiver na página de login, redirecionar para a página de origem ou perfil
                    const urlParams = new URLSearchParams(window.location.search);
                    let redirectUrl = urlParams.get('redirect') || 'Profile.html';
                    
                    // Garantir que a URL de redirecionamento seja relativa ao domínio atual
                    try {
                        const fullUrl = new URL(redirectUrl, window.location.origin);
                        redirectUrl = fullUrl.pathname + fullUrl.search + fullUrl.hash;
                    } catch (e) {
                        console.error('URL de redirecionamento inválida:', redirectUrl);
                        redirectUrl = 'Profile.html';
                    }
                    
                    console.log('🔄 Redirecionando para:', redirectUrl);
                    window.location.href = redirectUrl;
                }
            }, 1000);

        } catch (error) {
            console.error('❌ Erro no login:', error);
            this.hideLoading();
            
            // Mensagens de erro mais amigáveis
            let errorMessage = error.message || 'Erro ao fazer login. Tente novamente.';
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
            } else if (error.message.includes('401') || error.message.includes('credenciais')) {
                errorMessage = 'E-mail ou senha incorretos. Por favor, tente novamente.';
            }
            
            this.showToast(errorMessage, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        // Detectar contexto: modal (index.html) ou página standalone (register.html)
        const nameField = document.getElementById('registerName') || document.getElementById('firstName');
        const emailField = document.getElementById('registerEmail') || document.getElementById('email');
        const passwordField = document.getElementById('registerPassword') || document.getElementById('password');
        const confirmPasswordField = document.getElementById('registerConfirmPassword') || document.getElementById('confirmPassword');

        const name = nameField ? nameField.value : '';
        const email = emailField ? emailField.value : '';
        const password = passwordField ? passwordField.value : '';
        const confirmPassword = confirmPasswordField ? confirmPasswordField.value : '';

        if (!name || !email || !password || !confirmPassword) {
            this.showToast('Por favor, preencha todos os campos', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showToast('As senhas não coincidem', 'error');
            return;
        }

        if (password.length < 6) {
            this.showToast('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        this.showLoading();

        try {
            const response = await this.api.register(name, email, password);

            this.showToast('Cadastro realizado com sucesso!', 'success');
            this.hideLoading();

            // Se estiver em modal, fechar modal
            if (document.getElementById('registerModal')) {
                this.closeModal('registerModal');
            } else {
                // Se estiver na página standalone, redirecionar
                window.location.href = 'index.html';
            }

            this.updateAuthUI(response.user);

            // Redirecionar para ideias
            window.location.hash = '#ideas';

        } catch (error) {
            this.hideLoading();
            this.showToast(error.message || 'Erro no cadastro', 'error');
        }
    }

    handleLogout(e) {
        e.preventDefault();

        this.api.logout();
        this.updateAuthUI(null);
        this.showToast('Logout realizado com sucesso!', 'success');

        // Redirecionar para home
        window.location.hash = '#home';
    }

    checkAuthStatus() {
        if (this.api.isAuthenticated()) {
            const user = this.api.getCurrentUser();
            this.updateAuthUI(user);
        } else {
            this.updateAuthUI(null);
        }
    }

    updateAuthUI(user) {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const profileNav = document.getElementById('profileNav');

        if (user) {
            // Usuário logado
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (userMenu) {
                userMenu.style.display = 'flex';
                if (userName) userName.textContent = user.name || 'Usuário';
            }
            if (profileNav) profileNav.style.display = 'block';
        } else {
            // Usuário não logado
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = 'none';
            if (profileNav) profileNav.style.display = 'none';
        }
    }

    // Atualizar dados do usuário
    updateUser(userData) {
        if (userData) {
            // Salvar no localStorage
            localStorage.setItem('user', JSON.stringify(userData));

            // Atualizar interface
            this.updateAuthUI(userData);
        }
    }

    showLogin() {
        this.closeModal('registerModal');
        this.openModal('loginModal');
    }

    showRegister() {
        this.closeModal('loginModal');
        this.openModal('registerModal');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';

            // Limpar formulários
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'flex';
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        container.appendChild(toast);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Verificar se usuário precisa estar logado para uma ação
    requireAuth() {
        if (!this.api.isAuthenticated()) {
            this.showToast('Você precisa estar logado para realizar esta ação', 'warning');
            this.showLogin();
            return false;
        }
        return true;
    }

    // Verificar se usuário é admin
    isAdmin() {
        const user = this.api.getCurrentUser();
        return user && user.is_admin;
    }
}

// Instância global do serviço de autenticação
const auth = new AuthService();
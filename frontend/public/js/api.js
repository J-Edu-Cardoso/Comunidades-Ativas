/**
 * Serviço de API - Gerencia todas as chamadas para a API RESTful
 */
class ApiService {
    constructor() {
        // Configuração inicial
        this.config = window.APP_CONFIG || {};
        this.baseURL = this.config.API_BASE_URL || 'http://localhost:8000/api';
        this.token = localStorage.getItem(this.config.AUTH?.TOKEN_KEY || 'auth_token');
        this.refreshToken = localStorage.getItem(this.config.AUTH?.REFRESH_TOKEN_KEY || 'refresh_token');
        this.tokenExpiry = localStorage.getItem(this.config.AUTH?.TOKEN_EXPIRY_KEY || 'token_expiry');
        
        // Configuração de logs
        this.debug = this.config.DEBUG || false;
        this.log('🔧 Inicializando serviço de API');
        this.log(`🌐 Ambiente: ${this.config.ENV || 'desconhecido'}`);
        this.log(`🔗 URL Base: ${this.baseURL}`);
        this.log(`🔑 Token: ${this.token ? 'presente' : 'não encontrado'}`);
        
        // Configurar interceptadores
        this.setupInterceptors();
    }
    
    // Método para logs condicionais
    log(...args) {
        if (this.debug) {
            console.log('[API]', ...args);
        }
    }
    
    // Método para logs de erro
    error(...args) {
        console.error('[API Error]', ...args);
    }
    
    // Método para exibir notificações
    showNotification(message, type = 'info') {
        // Implementação básica - pode ser substituída por uma biblioteca de notificações
        console.log(`[${type.toUpperCase()}] ${message}`);
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Configurar interceptadores
    setupInterceptors() {
        // Interceptor de requisição
        this.requestInterceptor = (config) => {
            this.log(`➡️ ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
            if (this.debug && config.data) {
                this.log('📤 Dados da requisição:', config.data);
            }
            return config;
        };

        // Interceptor de resposta
        this.responseInterceptor = (response) => {
            this.log(`⬅️ ${response.status} ${response.config?.url}`);
            if (this.debug && response.data) {
                this.log('📥 Dados da resposta:', response.data);
            }
            return response;
        };

        // Interceptor de erro
        this.errorInterceptor = (error) => {
            const { config, response } = error;
            const errorMessage = response?.data?.message || error.message || 'Erro na requisição';
            
            this.error(`❌ Erro ${response?.status || ''}: ${errorMessage}`);
            
            // Tratamento de erros comuns
            if (response?.status === 401) {
                this.handleUnauthorized();
            } else if (response?.status === 403) {
                this.handleForbidden();
            } else if (response?.status === 404) {
                this.handleNotFound();
            }
            
            return Promise.reject(error);
        };
    }

    // Tratamento de erros 401 - Não autorizado
    async handleUnauthorized() {
        this.log('🔐 Sessão expirada ou inválida');
        // Limpar dados de autenticação
        this.clearAuthData();
        
        // Redirecionar para a página de login
        if (window.location.pathname !== '/login') {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
    }
    
    // Tratamento de erros 403 - Acesso negado
    handleForbidden() {
        this.log('⛔ Acesso negado');
        // Mostrar mensagem para o usuário
        this.showNotification('Você não tem permissão para acessar este recurso', 'error');
    }
    
    // Tratamento de erros 404 - Recurso não encontrado
    handleNotFound() {
        this.log('🔍 Recurso não encontrado');
        // Mostrar mensagem para o usuário
        this.showNotification('O recurso solicitado não foi encontrado', 'warning');
    }
    
    // Limpar dados de autenticação
    clearAuthData() {
        const { AUTH } = this.config;
        localStorage.removeItem(AUTH?.TOKEN_KEY || 'auth_token');
        localStorage.removeItem(AUTH?.REFRESH_TOKEN_KEY || 'refresh_token');
        localStorage.removeItem(AUTH?.TOKEN_EXPIRY_KEY || 'token_expiry');
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
    }
    
    // Configurar headers para requisições autenticadas
    getHeaders(contentType = 'application/json') {
        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        
        // Só adiciona Content-Type se não for FormData
        if (contentType && !(options?.body instanceof FormData)) {
            headers['Content-Type'] = contentType;
        }

        // Adiciona token de autenticação se existir
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }
    
    // Verificar se o token está expirado
    isTokenExpired() {
        if (!this.tokenExpiry) return true;
        return Date.now() >= parseInt(this.tokenExpiry);
    }
    
    // Renovar token de acesso
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('Nenhum token de atualização disponível');
        }
        
        try {
            const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });
            
            if (!response.ok) {
                throw new Error('Falha ao renovar o token de acesso');
            }
            
            const data = await response.json();
            this.setAuthData(data);
            return data.accessToken;
            
        } catch (error) {
            this.error('Erro ao renovar token:', error);
            this.clearAuthData();
            throw error;
        }
    }
    
    // Definir dados de autenticação
    setAuthData({ accessToken, refreshToken, expiresIn }) {
        const { AUTH } = this.config;
        const expiryTime = Date.now() + (expiresIn * 1000);
        
        this.token = accessToken;
        this.refreshToken = refreshToken || this.refreshToken;
        this.tokenExpiry = expiryTime;
        
        localStorage.setItem(AUTH?.TOKEN_KEY || 'auth_token', accessToken);
        if (refreshToken) {
            localStorage.setItem(AUTH?.REFRESH_TOKEN_KEY || 'refresh_token', refreshToken);
        }
        localStorage.setItem(AUTH?.TOKEN_EXPIRY_KEY || 'token_expiry', expiryTime);
    }

    // Método genérico para fazer requisições
    async request(endpoint, options = {}) {
        // Garantir que o endpoint comece com /
        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }
        
        const url = `${this.baseURL}${endpoint}`;
        const isAuthRequest = endpoint.includes('/auth/');
        
        // Verificar se precisa renovar o token
        if (!isAuthRequest && this.isTokenExpired() && this.refreshToken) {
            try {
                await this.refreshAccessToken();
            } catch (error) {
                this.log('Não foi possível renovar o token:', error);
                this.handleUnauthorized();
                throw error;
            }
        }
        
        // Configuração da requisição
        const config = {
            method: options.method || 'GET',
            headers: this.getHeaders(options.contentType),
            ...options
        };
        
        // Converter dados para JSON se não for FormData
        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }
        
        try {
            // Aplicar interceptador de requisição
            const requestConfig = this.requestInterceptor({ ...config, url }) || config;
            
            const response = await fetch(url, requestConfig);
            let data;
            
            // Tentar fazer parse da resposta como JSON
            try {
                data = await response.json();
            } catch (e) {
                data = await response.text();
            }
            
            // Verificar se a resposta foi bem-sucedida
            if (!response.ok) {
                const error = new Error(data.message || 'Erro na requisição');
                error.response = { status: response.status, data };
                throw error;
            }
            
            // Aplicar interceptador de resposta
            const processedResponse = this.responseInterceptor({
                data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                config: requestConfig
            });
            
        };

        console.log('🌐 Fazendo requisição:', {
            url,
            method: config.method,
            headers: config.headers,
            hasBody: !!config.body,
            body: config.body ? (config.body instanceof FormData ? '[FormData]' : config.body) : undefined
        });

        try {
            const response = await fetch(url, config);
            const responseText = await response.text();
            
            console.log('📥 Resposta:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                body: responseText
            });

            // Se não estiver autenticado, redirecionar para login
            if (response.status === 401) {
                console.log('🔒 Acesso não autorizado, redirecionando para login...');
                this.logout();
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
                throw new Error('Não autenticado');
            }

            // Tentar fazer parse do JSON apenas se houver conteúdo
            let responseData;
            try {
                responseData = responseText ? JSON.parse(responseText) : {};
            } catch (e) {
                console.error('Erro ao fazer parse da resposta JSON:', e);
                throw new Error('Resposta inválida do servidor');
            }

            if (!response.ok) {
                const errorMessage = responseData.message || 
                                   responseData.error || 
                                   `Erro HTTP: ${response.status} ${response.statusText}`;
                console.error('❌ Erro na resposta:', errorMessage);
                throw new Error(errorMessage);
            }

            console.log('✅ Resposta bem-sucedida:', responseData);
            return responseData;
            
        } catch (error) {
            console.error(`❌ Erro na requisição [${endpoint}]:`, error);
            
            // Melhorar mensagens de erro comuns
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
            }
            
            if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
                throw new Error('Erro de rede. Verifique sua conexão com a internet.');
            }
            
            // Se a mensagem de erro for muito genérica, substituir por algo mais amigável
            if (error.message === 'Failed to fetch') {
                throw new Error('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
            }
            
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        console.log('📡 GET:', endpoint);
        return this.request(endpoint);
    }

    // POST request
    async post(endpoint, data) {
        console.log('📡 POST:', endpoint, data);
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // Login
    async login(email, password) {
        const response = await this.post('/auth/login', { email, password });
        if (response.token) {
            this.token = response.token;
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    }

    // Registrar usuário
    async register(name, email, password) {
        const response = await this.post('/auth/register', { name, email, password });
        if (response.token) {
            this.token = response.token;
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    }

    // Logout
    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Verificar se está autenticado
    isAuthenticated() {
        return !!this.token;
    }

    // Obter usuário atual
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Categorias
    async getCategories() {
        console.log('🏷️ Buscando categorias...');
        return this.get('/categories');
    }

    // Upload de avatar
    async uploadAvatar(userId, avatarFile) {
        console.log('📤 Fazendo upload de avatar...');
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        return this.request(`/users/${userId}/avatar`, {
            method: 'POST',
            body: formData,
            headers: {} // Não incluir Content-Type para FormData
        });
    }

    // Ideias
    async getIdeas(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/ideas${queryString ? `?${queryString}` : ''}`;
        return this.get(endpoint);
    }

    async createIdea(ideaData) {
        return this.post('/ideas', ideaData);
    }

    async getIdeaById(id) {
        return this.get(`/ideas/${id}`);
    }

    async updateIdea(id, ideaData) {
        return this.put(`/ideas/${id}`, ideaData);
    }

    async deleteIdea(id) {
        return this.delete(`/ideas/${id}`);
    }

    async voteIdea(id, voteType) {
        return this.post(`/ideas/${id}/vote`, { vote_type: voteType });
    }

    // Comentários
    async getComments(ideaId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/ideas/${ideaId}/comments${queryString ? `?${queryString}` : ''}`;
        return this.get(endpoint);
    }

    async createComment(ideaId, content, parentId = null) {
        return this.post(`/ideas/${ideaId}/comments`, { content, parent_id: parentId });
    }

    async updateComment(id, content) {
        return this.put(`/comments/${id}`, { content });
    }

    async deleteComment(id) {
        return this.delete(`/comments/${id}`);
    }

    // Perfil do usuário
    async getUserProfile(id) {
        return this.get(`/users/${id}`);
    }

    async updateUserProfile(id, profileData) {
        return this.put(`/users/${id}`, profileData);
    }

    // Busca global
    async globalSearch(query, type = 'all', page = 1, limit = 10) {
        const params = new URLSearchParams({ q: query, type, page, limit });
        return this.get(`/search?${params.toString()}`);
    }

    // Estatísticas
    async getStats() {
        return this.get('/stats');
    }

    async getIdeaStats(id) {
        return this.get(`/stats/ideas/${id}`);
    }

    async getUserStats(id) {
        return this.get(`/stats/users/${id}`);
    }

    // Excluir usuário (apenas admin)
    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    // Excluir ideia
    async deleteIdea(id) {
        return this.delete(`/ideas/${id}`);
    }

    // Excluir comentário
    async deleteComment(id) {
        return this.delete(`/comments/${id}`);
    }

    // Saúde da API
    async healthCheck() {
        return this.get('/health');
    }
}

// Instância global da API
const api = new ApiService();

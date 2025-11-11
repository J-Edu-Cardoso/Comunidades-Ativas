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
        this.showNotification('Você não tem permissão para acessar este recurso', 'error');
    }
    
    // Tratamento de erros 404 - Recurso não encontrado
    handleNotFound() {
        this.log('🔍 Recurso não encontrado');
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
        if (contentType) {
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
            
            return processedResponse?.data || data;
            
        } catch (error) {
            // Aplicar interceptador de erro
            const processedError = this.errorInterceptor(error) || error;
            throw processedError;
        }
    }
    
    // Métodos HTTP auxiliares
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }
    
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }
    
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }
    
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    // Métodos de autenticação
    async login(credentials) {
        try {
            const response = await this.post('/auth/login', credentials);
            this.setAuthData({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresIn: response.expiresIn || 3600
            });
            return response.user;
        } catch (error) {
            this.error('Falha no login:', error);
            throw error;
        }
    }
    
    async register(userData) {
        try {
            const response = await this.post('/auth/register', userData);
            if (response.accessToken) {
                this.setAuthData({
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    expiresIn: response.expiresIn || 3600
                });
            }
            return response.user || response;
        } catch (error) {
            this.error('Falha no registro:', error);
            throw error;
        }
    }
    
    async logout() {
        try {
            await this.post('/auth/logout');
        } catch (error) {
            this.error('Erro ao fazer logout:', error);
        } finally {
            this.clearAuthData();
        }
    }
    
    // Verificar autenticação
    isAuthenticated() {
        return !!this.token && !this.isTokenExpired();
    }
    
    // Obter informações do usuário atual
    async getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        try {
            const response = await this.get('/auth/me');
            return response.user || null;
        } catch (error) {
            this.error('Erro ao obter informações do usuário:', error);
            return null;
        }
    }
}

// Instância global da API
const api = new ApiService();

// Exportar para uso global
window.api = api;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}

/**
 * API Service - Gerencia todas as chamadas para a API RESTful
 */
class ApiService {
    constructor() {
        this.baseURL = window.API_BASE_URL || 'http://localhost:8000/api';
        this.token = localStorage.getItem('token');
        console.log('🌐 API Service inicializado com baseURL:', this.baseURL);
        console.log('🔑 Token:', this.token ? 'presente' : 'não encontrado');
        
        // Garantir que a URL base termine com /api
        if (!this.baseURL.endsWith('/api')) {
            this.baseURL = this.baseURL.endsWith('/') 
                ? this.baseURL + 'api' 
                : this.baseURL + '/api';
            console.log('🔧 URL da API ajustada para:', this.baseURL);
        }
    }

    // Configurar headers para requisições autenticadas
    getHeaders(contentType = 'application/json') {
        const headers = {};
        
        // Só adiciona Content-Type se não for FormData
        if (contentType) {
            headers['Content-Type'] = contentType;
        }

        // Adiciona token de autenticação se existir
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    // Método genérico para fazer requisições
    async request(endpoint, options = {}) {
        // Garantir que o endpoint comece com /
        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }
        
        const url = `${this.baseURL}${endpoint}`;
        
        // Determinar o tipo de conteúdo com base no corpo da requisição
        let contentType = 'application/json';
        if (options.body) {
            if (options.body instanceof FormData) {
                contentType = null; // O navegador irá definir o Content-Type com o boundary
            } else if (typeof options.body === 'string') {
                try {
                    JSON.parse(options.body);
                    contentType = 'application/json';
                } catch (e) {
                    contentType = 'application/x-www-form-urlencoded';
                }
            }
        }
        
        const config = {
            method: 'GET',
            headers: this.getHeaders(contentType),
            ...options
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

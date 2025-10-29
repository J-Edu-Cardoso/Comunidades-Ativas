/**
 * Ideas Service - Gerencia ideias, votos e comentários
 */

// Definir a classe globalmente
console.log('🔧 Inicializando IdeasService...');

class IdeasService {
    constructor() {
        console.log('🔧 Construtor do IdeasService chamado');
        this.api = api;
        this.ideas = [];
        this.currentPage = 1;
        this.hasMorePages = true;
        this.currentFilters = {
            category_id: '',
            sort: 'recent',
            search: ''
        };
        this.onIdeaCreatedCallbacks = []; // Array para armazenar callbacks de atualização
        this.init();
    }

    async init() {
        console.log('🔧 Inicializando IdeasService...');
        this.bindEvents();
        
        // Verificar se o container existe antes de carregar as ideias
        const container = document.getElementById('ideasContainer');
        if (container) {
            console.log('✅ Container de ideias encontrado, carregando ideias...');
            await this.loadIdeas();
            this.updateStats();
        } else {
            console.warn('⚠️ Container de ideias (ideasContainer) não encontrado na inicialização');
        }
    }

    bindEvents() {
        // Formulário de nova ideia
        const ideaForm = document.getElementById('ideaForm');
        if (ideaForm) {
            ideaForm.addEventListener('submit', (e) => this.handleSubmitIdea(e));
        }

        // Botão carregar mais
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreIdeas());
        }

        // Botão ver ideias
        const viewIdeasBtn = document.getElementById('viewIdeasBtn');
        if (viewIdeasBtn) {
            viewIdeasBtn.addEventListener('click', () => {
                window.location.hash = '#ideas';
            });
        }

        // Botão enviar ideia
        const submitIdeaBtn = document.getElementById('submitIdeaBtn');
        if (submitIdeaBtn) {
            submitIdeaBtn.addEventListener('click', () => {
                if (window.auth && window.auth.requireAuth && window.auth.requireAuth()) {
                    window.location.hash = '#submit';
                }
            });
        }

        // Filtros
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                this.currentFilters.sort = sortFilter.value;
                this.resetAndLoadIdeas();
            });
        }

        // Botão de geolocalização
        const getLocationBtn = document.getElementById('getLocationBtn');
        if (getLocationBtn) {
            getLocationBtn.addEventListener('click', () => this.getCurrentLocation());
        }
    }

    async loadIdeas(reset = false) {
        try {
            console.log(' Carregando ideias...');
            
            if (reset) {
                this.currentPage = 1;
                this.ideas = [];
                console.log(' Resetando lista de ideias');
            }

            const params = {
                page: this.currentPage,
                ...this.currentFilters
            };

            console.log(' Parâmetros da requisição:', params);
            const response = await this.api.getIdeas(params);
            console.log(' Resposta da API:', response);
            
            const newIdeas = response.ideas || [];
            console.log(` ${newIdeas.length} novas ideias recebidas`);

            if (reset) {
                this.ideas = newIdeas;
            } else {
                this.ideas = [...this.ideas, ...newIdeas];
            }

            this.hasMorePages = this.currentPage < response.totalPages;
            console.log(` Total de ideias: ${this.ideas.length}, Página atual: ${this.currentPage}, Tem mais páginas: ${this.hasMorePages}`);
            
            // Verificar se o container existe antes de tentar renderizar
            const container = document.getElementById('ideasContainer');
            if (container) {
                this.renderIdeas();
                this.updatePagination();
            } else {
                console.warn(' Container de ideias não encontrado, pulando renderização');
            }

        } catch (error) {
            console.error(' Erro ao carregar ideias:', error);
            if (reset) {
                this.showErrorState('Erro ao carregar ideias. Tente novamente mais tarde.');
            }
        }
    }

    async loadMoreIdeas() {
        this.currentPage++;
        await this.loadIdeas(false);
    }

    resetAndLoadIdeas() {
        this.currentPage = 1;
        this.loadIdeas(true);
    }

    applyFilters() {
        this.resetAndLoadIdeas();
    }

    renderIdeas() {
        console.log('🖥️ Renderizando ideias...');
        const container = document.getElementById('ideasContainer');
        
        if (!container) {
            console.error('❌ Container de ideias não encontrado! Verifique se existe um elemento com id="ideasContainer" no HTML.');
            return;
        }

        console.log(`📋 ${this.ideas.length} ideias para renderizar`);
        
        if (this.ideas.length === 0) {
            console.log('ℹ️ Nenhuma ideia para exibir, mostrando estado vazio');
            this.showEmptyState();
            return;
        }

        try {
            const ideasHTML = this.ideas.map(idea => {
                console.log(`🖼️ Renderizando ideia: ${idea.id} - ${idea.title}`);
                return this.createIdeaCard(idea);
            }).join('');
            
            console.log('📝 HTML gerado para as ideias:', ideasHTML);
            container.innerHTML = ideasHTML;
            this.bindIdeaEvents();
            console.log('✅ Ideias renderizadas com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao renderizar ideias:', error);
            this.showErrorState('Ocorreu um erro ao carregar as ideias. Por favor, tente novamente.');
        }
    }

    createIdeaCard(idea) {
        const category = categories.getCategoryById(idea.category_id);
        const categoryName = category ? category.name : 'Sem categoria';
        const categoryColor = category ? category.color : '#607D8B';
        const categoryIcon = category ? category.icon : 'fas fa-lightbulb';

        // Verificar se o usuário atual é o dono da ideia
        const currentUser = window.auth && window.auth.getCurrentUser ? window.auth.getCurrentUser() : null;
        const isOwner = currentUser && idea.user_id === currentUser.id;
        const isAdmin = currentUser && currentUser.is_admin;
        
        // Obter a URL da imagem principal (se existir)
        let imageUrl = '';
        if (idea.images && idea.images.length > 0) {
            const primaryImage = idea.images.find(img => img.is_primary) || idea.images[0];
            imageUrl = primaryImage.url;
        }

        return `
            <div class="idea-card card" data-idea-id="${idea.id}">
                ${imageUrl ? `
                    <div class="idea-image" style="background-image: url('${imageUrl}');">
                        <div class="idea-category" style="background-color: ${categoryColor}">
                            <i class="${categoryIcon}"></i>
                            <span>${categoryName}</span>
                        </div>
                    </div>
                ` : `
                    <div class="idea-header">
                        <div class="idea-category" style="background-color: ${categoryColor}">
                            <i class="${categoryIcon}"></i>
                            <span>${categoryName}</span>
                        </div>
                        <div class="idea-status status-${idea.status}">
                            ${this.getStatusText(idea.status)}
                        </div>
                    </div>
                `}

                <div class="idea-content">
                    <h3 class="idea-title">${idea.title}</h3>
                    <p class="idea-description">${this.truncateText(idea.description, 150)}</p>
                    <div class="idea-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${idea.location}</span>
                    </div>
                </div>

                <div class="idea-footer">
                    <div class="idea-stats">
                        <div class="stat-item votes">
                            <button class="vote-btn upvote ${idea.userVote === 'up' ? 'active' : ''}" data-vote="up">
                                <i class="fas fa-arrow-up"></i>
                                <span>${idea.upvotes || 0}</span>
                            </button>
                            <button class="vote-btn downvote ${idea.userVote === 'down' ? 'active' : ''}" data-vote="down">
                                <i class="fas fa-arrow-down"></i>
                                <span>${idea.downvotes || 0}</span>
                            </button>
                        </div>
                        <div class="stat-item comments">
                            <i class="far fa-comment"></i>
                            <span>${idea.comment_count || 0}</span>
                        </div>
                    </div>

                    <div class="idea-actions">
                        <button class="btn btn-outline btn-sm view-details" data-idea-id="${idea.id}">
                            Ver Detalhes
                        </button>
                        ${(isOwner || isAdmin) ? `
                            <button class="btn btn-danger btn-sm delete-idea" data-idea-id="${idea.id}">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    bindIdeaEvents() {
        // Botões de voto
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.auth && window.auth.requireAuth && window.auth.requireAuth()) {
                    const ideaId = btn.closest('.idea-card').dataset.ideaId;
                    const voteType = btn.dataset.vote;
                    this.voteIdea(ideaId, voteType);
                }
            });
        });

        // Botões ver detalhes
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const ideaId = btn.dataset.ideaId;
                this.showIdeaDetails(ideaId);
            });
        });

        // Botões de exclusão
        document.querySelectorAll('.delete-idea').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const ideaId = btn.dataset.ideaId;
                this.confirmDeleteIdea(ideaId);
            });
        });

        // Clique na ideia para ver detalhes
        document.querySelectorAll('.idea-card').forEach(card => {
            card.addEventListener('click', () => {
                const ideaId = card.dataset.ideaId;
                this.showIdeaDetails(ideaId);
            });
        });
    }

    async confirmDeleteIdea(ideaId) {
        const idea = this.ideas.find(i => i.id === ideaId);
        if (!idea) return;

        // Confirmar exclusão
        const confirmed = confirm(`Tem certeza que deseja excluir a ideia "${idea.title}"?\n\nEsta ação não pode ser desfeita.`);

        if (confirmed) {
            await this.deleteIdea(ideaId);
        }
    }

    async deleteIdea(ideaId) {
        try {
            await this.api.deleteIdea(ideaId);
            if (window.auth && window.auth.showToast) window.auth.showToast('Ideia excluída com sucesso!', 'success');

            // Remover da lista local
            this.ideas = this.ideas.filter(idea => idea.id !== ideaId);
            this.renderIdeas();

            // Atualizar estatísticas
            this.updateStats();

        } catch (error) {
            console.error('Erro ao excluir ideia:', error);
            if (window.auth && window.auth.showToast) window.auth.showToast(error.message || 'Erro ao excluir ideia', 'error');
        }
    }

    async showIdeaDetails(ideaId) {
        try {
            const response = await this.api.getIdeaById(ideaId);
            const idea = response.idea;

            const modal = document.getElementById('ideaModal');
            const modalTitle = document.getElementById('ideaModalTitle');
            const modalContent = document.getElementById('ideaModalContent');

            if (!modal || !modalTitle || !modalContent) return;

            modalTitle.textContent = idea.title;

            modalContent.innerHTML = this.createIdeaDetailModal(idea);

            if (window.auth && window.auth.openModal) window.auth.openModal('ideaModal');

        } catch (error) {
            console.error('Erro ao carregar detalhes da ideia:', error);
            if (window.auth && window.auth.showToast) window.auth.showToast('Erro ao carregar detalhes da ideia', 'error');
        }
    }

    createIdeaDetailModal(idea) {
        const category = categories.getCategoryById(idea.category_id);
        const categoryName = category ? category.name : 'Sem categoria';
        const categoryColor = category ? category.color : '#607D8B';

        return `
            <div class="idea-detail">
                <div class="idea-detail-header">
                    <div class="idea-category" style="background-color: ${categoryColor}">
                        <i class="${category.icon}"></i>
                        <span>${categoryName}</span>
                    </div>
                    <div class="idea-status status-${idea.status}">
                        ${this.getStatusText(idea.status)}
                    </div>
                </div>

                <div class="idea-detail-content">
                    <h3>${idea.title}</h3>
                    <p class="idea-description">${idea.description}</p>

                    <div class="idea-meta">
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${idea.location}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <span>${idea.user ? idea.user.name : 'Usuário'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatDate(idea.created_at)}</span>
                        </div>
                    </div>

                    ${idea.tags && idea.tags.length > 0 ? `
                        <div class="idea-tags">
                            ${idea.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="idea-detail-actions">
                    <div class="vote-section">
                        <button class="vote-btn upvote ${idea.userVote === 'up' ? 'active' : ''}" data-vote="up">
                            <i class="fas fa-arrow-up"></i>
                            <span>Concordo (${idea.upvotes || 0})</span>
                        </button>
                        <button class="vote-btn downvote ${idea.userVote === 'down' ? 'active' : ''}" data-vote="down">
                            <i class="fas fa-arrow-down"></i>
                            <span>Discordo (${idea.downvotes || 0})</span>
                        </button>
                    </div>

                    <div class="comments-section">
                        <h4>Comentários (${idea.comment_count || 0})</h4>
                        <div class="comments-list" id="commentsList">
                            ${idea.comments && idea.comments.length > 0 ?
                                idea.comments.map(comment => this.createCommentItem(comment)).join('') :
                                '<p>Nenhum comentário ainda.</p>'
                            }
                        </div>

                        ${window.auth && window.auth.api && window.auth.api.isAuthenticated && window.auth.api.isAuthenticated() ? `
                            <form class="comment-form" data-idea-id="${idea.id}">
                                <div class="form-group">
                                    <textarea class="form-control" placeholder="Escreva um comentário..." required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Comentar</button>
                            </form>
                        ` : `
                            <p><a href="#" onclick="window.auth && window.auth.showLogin && window.auth.showLogin(); return false;">Faça login</a> para comentar.</p>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    createCommentItem(comment) {
        return `
            <div class="comment-item">
                <div class="comment-header">
                    <strong>${comment.user ? comment.user.name : 'Usuário'}</strong>
                    <span>${this.formatDate(comment.created_at)}</span>
                </div>
                <div class="comment-content">
                    ${comment.content}
                </div>
                ${window.auth && window.auth.api && window.auth.api.isAuthenticated && window.auth.api.isAuthenticated() ? `
                    <div class="comment-actions">
                        <button class="reply-btn" data-comment-id="${comment.id}">Responder</button>
                    </div>
                ` : ''}
            </div>
        `;
    }


    // Notificar todos os callbacks registrados
    notifyIdeaCreated(idea) {
        console.log('📢 Notificando sobre nova ideia criada:', idea);
        this.onIdeaCreatedCallbacks.forEach(callback => {
            try {
                callback(idea);
            } catch (error) {
                console.error('Erro ao executar callback de nova ideia:', error);
            }
        });
    }

    async handleSubmitIdea(e) {
        e.preventDefault();

        if (window.auth && window.auth.requireAuth && !window.auth.requireAuth()) return;

        const form = e.target;
        const formData = new FormData(form);
        
        // Validar campos obrigatórios
        const title = formData.get('title');
        const description = formData.get('description');
        const location = formData.get('location');
        const category_id = formData.get('category_id');
        
        if (!title || !description || !location || !category_id) {
            if (window.auth && window.auth.showToast) window.auth.showToast('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (window.auth && window.auth.showLoading) window.auth.showLoading();

        try {
            // Criar um novo FormData para enviar os dados
            const submitData = new FormData();
            submitData.append('title', title);
            submitData.append('description', description);
            submitData.append('location', location);
            submitData.append('category_id', category_id);
            
            // Adicionar tags se existirem
            const tags = formData.get('tags');
            if (tags) {
                submitData.append('tags', tags);
            }
            
            // Adicionar a imagem se existir
            const imageInput = form.querySelector('input[type="file"]');
            if (imageInput && imageInput.files.length > 0) {
                submitData.append('image', imageInput.files[0]);
            }
            
            // Obter o token de autenticação
            const token = localStorage.getItem('token');
            
            // Enviar para a API
            const response = await fetch(`${window.API_BASE_URL}/ideas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Não definir Content-Type, o navegador fará isso automaticamente com o boundary
                },
                body: submitData
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao enviar ideia');
            }
            
            const responseData = await response.json();
            const newIdea = responseData.idea;
            
            if (window.auth) {
                if (window.auth.hideLoading) window.auth.hideLoading();
                if (window.auth.showToast) window.auth.showToast('Ideia enviada com sucesso!', 'success');
            }

            // Limpar formulário
            form.reset();

            // Notificar sobre a nova ideia criada
            this.notifyIdeaCreated(newIdea);

            // Recarregar ideias
            this.resetAndLoadIdeas();

            // Fechar o modal se estiver em um
            const modal = form.closest('.modal');
            if (modal) {
                if (window.auth && window.auth.closeModal) window.auth.closeModal(modal.id);
            }

            // Scroll para ideias
            window.location.hash = '#ideas';

            // Atualizar contadores no perfil se estiver na página de perfil
            if (window.location.pathname.includes('profile.html')) {
                this.updateUserIdeasCount();
            }

        } catch (error) {
            console.error('Erro ao enviar ideia:', error);
            if (window.auth) {
                if (window.auth.hideLoading) window.auth.hideLoading();
                if (window.auth.showToast) window.auth.showToast(error.message || 'Erro ao enviar ideia', 'error');
            }
        }
    }

    // Atualiza a contagem de ideias do usuário no perfil
    updateUserIdeasCount() {
        try {
            const userIdeasCount = document.getElementById('userIdeasCount');
            if (userIdeasCount) {
                const currentCount = parseInt(userIdeasCount.textContent) || 0;
                userIdeasCount.textContent = currentCount + 1;
            }
            
            // Atualiza a lista de ideias no perfil se estiver na página de perfil
            if (window.location.pathname.includes('profile.html')) {
                this.loadUserIdeas();
            }
        } catch (error) {
            console.error('Erro ao atualizar contagem de ideias:', error);
        }
    }

    // Carrega as ideias do usuário no perfil
    async loadUserIdeas() {
        try {
            const currentUser = window.auth && window.auth.getCurrentUser ? window.auth.getCurrentUser() : null;
            if (!currentUser) return;

            const response = await this.api.get(`/users/${currentUser.id}/ideas`);
            const userIdeas = response.ideas || [];
            
            // Atualiza a lista de ideias no perfil
            const userIdeasList = document.getElementById('userIdeasList');
            if (userIdeasList) {
                if (userIdeas.length === 0) {
                    userIdeasList.innerHTML = '<p>Você ainda não publicou nenhuma ideia.</p>';
                } else {
                    userIdeasList.innerHTML = userIdeas.map(idea => `
                        <div class="user-idea-item">
                            <h4>${idea.title}</h4>
                            <p>${this.truncateText(idea.description, 100)}</p>
                            <div class="idea-meta">
                                <span class="status status-${idea.status}">${this.getStatusText(idea.status)}</span>
                                <span class="date">${this.formatDate(idea.created_at)}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar ideias do usuário:', error);
        }
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            if (window.auth && window.auth.showToast) window.auth.showToast('Geolocalização não é suportada pelo seu navegador', 'error');
            return;
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                });
            });

            const { latitude, longitude } = position.coords;
            const locationInput = document.getElementById('ideaLocation');

            // Usar geocoding reverso simples (pode ser melhorado)
            locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        } catch (error) {
            console.error('Erro ao obter localização:', error);
            if (window.auth && window.auth.showToast) window.auth.showToast('Erro ao obter sua localização', 'error');
        }
    }

    updatePagination() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            // Implementação da paginação aqui
            // Exemplo simplificado:
            const hasMore = this.currentPage * this.itemsPerPage < this.totalIdeas;
            loadMoreBtn.style.display = hasMore ? 'block' : 'none';
        }
    }

    async updateStats() {
        try {
            // Para simplificar, usar dados mock por enquanto
            const stats = {
                totalIdeas: this.ideas.length,
                totalUsers: 0,
                totalVotes: this.ideas.reduce((sum, idea) => sum + (idea.upvotes || 0) + (idea.downvotes || 0), 0)
            };

            this.updateStatsDisplay(stats);
        } catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
        }
    }

    updateStatsDisplay(stats) {
        const totalIdeasEl = document.getElementById('totalIdeas');
        const totalUsersEl = document.getElementById('totalUsers');
        const totalVotesEl = document.getElementById('totalVotes');

        if (totalIdeasEl) totalIdeasEl.textContent = stats.totalIdeas;
        if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers;
        if (totalVotesEl) totalVotesEl.textContent = stats.totalVotes;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendente',
            'approved': 'Aprovada',
            'rejected': 'Rejeitada',
            'implemented': 'Implementada'
        };
        return statusMap[status] || status;
    }
}

// Criar e exportar a instância global imediatamente
console.log('🔧 Inicializando IdeasService...');

// Criar a instância e atribuir ao escopo global
const ideasService = new IdeasService();

// Tornar a instância disponível globalmente
window.ideasService = ideasService;
window.IdeasService = IdeasService; // Opcional: exportar a classe também

console.log('✅ IdeasService inicializado:', window.ideasService);

// Exportar para uso em outros módulos
const ideas = ideasService;

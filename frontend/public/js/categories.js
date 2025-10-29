/**
 * Categories Service - Gerencia categorias e suas funcionalidades
 */
console.log('🔍 Iniciando carregamento do CategoriesService...');
console.log('🔍 window.ideasService disponível?', !!window.ideasService);

class CategoriesService {
    constructor() {
        console.log('🏗️ CategoriesService construtor chamado');
        this.api = api;
        this.categories = [];
        console.log('🔗 API baseURL:', this.api?.baseURL);
        
        // Iniciar imediatamente, sem esperar pelo ideasService
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando CategoriesService...');
        await this.loadCategories();
        this.bindEvents();
        this.populateCategorySelects();
        console.log('✅ CategoriesService inicializado');
    }

    async loadCategories() {
        try {
            console.log('🔄 Carregando categorias...');
            console.log('📡 Fazendo requisição para:', `${this.api.baseURL}/categories`);

            const response = await this.api.getCategories();
            console.log('✅ Resposta da API:', response);

            this.categories = response.categories || [];
            console.log('📊 Categorias carregadas:', this.categories.length);

            // Se não há categorias do backend, usar categorias padrão
            if (this.categories.length === 0) {
                console.log('⚠️ Nenhuma categoria encontrada no backend, usando categorias padrão...');
                this.categories = this.getDefaultCategories();
            }

            this.renderCategories();
        } catch (error) {
            console.error('❌ Erro ao carregar categorias:', error);
            console.log('💡 Usando categorias padrão devido ao erro...');

            // Em caso de erro, usar categorias padrão
            this.categories = this.getDefaultCategories();
            this.renderCategories();
        }
    }

    getDefaultCategories() {
        // Usar os mesmos UUIDs que estão no banco de dados
        return [
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Infraestrutura',
                description: 'Melhorias em estradas, pontes, calçadas e outros elementos urbanos',
                icon: 'fas fa-hard-hat',
                color: '#FF6B35',
                isDefault: true
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440002',
                name: 'Segurança',
                description: 'Propostas para melhorar a segurança pública e privada',
                icon: 'fas fa-shield-alt',
                color: '#F7931E',
                isDefault: true
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440003',
                name: 'Meio Ambiente',
                description: 'Ideias para preservação ambiental e sustentabilidade',
                icon: 'fas fa-leaf',
                color: '#4CAF50',
                isDefault: true
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440004',
                name: 'Educação',
                description: 'Melhorias no sistema educacional e espaços de aprendizagem',
                icon: 'fas fa-graduation-cap',
                color: '#2196F3',
                isDefault: true
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440005',
                name: 'Saúde',
                description: 'Propostas para melhorar os serviços de saúde',
                icon: 'fas fa-heartbeat',
                color: '#E91E63',
                isDefault: true
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440006',
                name: 'Lazer',
                description: 'Ideias para espaços de recreação e entretenimento',
                icon: 'fas fa-futbol',
                color: '#9C27B0',
                isDefault: true
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440007',
                name: 'Outros',
                description: 'Outras sugestões e ideias gerais',
                icon: 'fas fa-lightbulb',
                color: '#607D8B',
                isDefault: true
            }
        ];
    }

    renderCategories() {
        console.log('🎨 Iniciando renderização de categorias...');
        
        // Verificar se temos categorias para renderizar
        if (!Array.isArray(this.categories) || this.categories.length === 0) {
            console.warn('⚠️ Nenhuma categoria disponível para renderização');
            this.categories = this.getDefaultCategories();
        }

        const container = document.getElementById('categoriesGrid');
        if (!container) {
            console.warn('⚠️ Elemento categoriesGrid não encontrado!');
            console.log('💡 A seção de categorias pode não estar presente na página atual.');
            return;
        }
        
        console.log(`🔄 Renderizando ${this.categories.length} categorias...`);

        if (this.categories.length === 0) {
            console.log('⚠️ Nenhuma categoria para renderizar');
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <h3>Nenhuma categoria encontrada</h3>
                    <p>As categorias podem não ter sido criadas no banco de dados.</p>
                    <button class="btn btn-outline" onclick="location.reload()">Atualizar</button>
                </div>
            `;
            return;
        }

        console.log('✅ Renderizando', this.categories.length, 'categorias');
        container.innerHTML = this.categories.map(category => `
            <div class="category-card card" data-category-id="${category.id}">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <h3>${category.name}</h3>
                <p>${category.description || ''}</p>
                <div class="category-color" style="background-color: ${category.color}"></div>
            </div>
        `).join('');

        // Adicionar eventos de clique
        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.categoryId;
                console.log('🖱️ Categoria clicada:', categoryId);
                this.filterByCategory(categoryId);
            });
        });

        console.log('✅ Categorias renderizadas com sucesso');
    }

    populateCategorySelects() {
        console.log('📝 Populando selects de categoria...');
        const selects = document.querySelectorAll('#ideaCategory, #categoryFilter, #category');
        console.log('🎯 Selects encontrados:', selects.length);

        if (selects.length === 0) {
            console.log('💡 Nenhum select de categoria encontrado na página atual.');
            return;
        }

        selects.forEach(select => {
            console.log('📝 Populando select:', select.id);

            // Limpar opções existentes (exceto a primeira)
            while (select.children.length > 0) {
                select.removeChild(select.lastChild);
            }

            // Adicionar opção padrão
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Selecione uma categoria';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            // Adicionar categorias
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                option.style.color = category.color;
                option.dataset.color = category.color;
                select.appendChild(option);
            });

            console.log('✅ Select populado com', this.categories.length, 'categorias');
            
            // Disparar evento de mudança para atualizar a UI se necessário
            select.dispatchEvent(new Event('change'));
        });
    }

    filterByCategory(categoryId) {
        const filterSelect = document.getElementById('categoryFilter');
        if (filterSelect) {
            filterSelect.value = categoryId;
            filterSelect.dispatchEvent(new Event('change'));
        }

        // Scroll para seção de ideias
        const ideasSection = document.getElementById('ideas');
        if (ideasSection) {
            ideasSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    bindEvents() {
        // Filtro de categoria
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        console.log('🔄 Aplicando filtros...');
        
        // Função auxiliar para chamar um método se existir
        const callIfExists = (obj, method, ...args) => {
            if (obj && typeof obj[method] === 'function') {
                console.log(`✅ Chamando ${method} do serviço de ideias`);
                return obj[method](...args);
            }
            return false;
        };
        
        // Tenta chamar resetAndLoadIdeas ou applyFilters
        if (!callIfExists(window.ideasService, 'resetAndLoadIdeas') && 
            !callIfExists(window.ideasService, 'applyFilters')) {
            
            console.warn('⚠️ Serviço de ideias não está disponível ou não possui os métodos necessários');
            
            // Se não conseguiu chamar, tenta novamente após um curto atraso
            setTimeout(() => {
                if (!callIfExists(window.ideasService, 'resetAndLoadIdeas') && 
                    !callIfExists(window.ideasService, 'applyFilters')) {
                    console.error('❌ Não foi possível acessar o serviço de ideias');
                }
            }, 100);
        }
    }

    getCategoryById(id) {
        return this.categories.find(cat => cat.id === id);
    }

    getCategoryName(id) {
        const category = this.getCategoryById(id);
        return category ? category.name : 'Categoria não encontrada';
    }

    getCategoryColor(id) {
        const category = this.getCategoryById(id);
        return category ? category.color : '#607D8B';
    }

    getCategoryIcon(id) {
        const category = this.getCategoryById(id);
        return category ? category.icon : 'fas fa-question';
    }
}

// Instância global do serviço de categorias
const categories = new CategoriesService();

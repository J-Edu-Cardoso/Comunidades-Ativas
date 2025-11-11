/**
 * Inicialização da aplicação
 * Gerencia o carregamento e inicialização de todos os serviços
 */

// Configuração global
window.APP_CONFIG = window.APP_CONFIG || {};
window.APP_CONFIG.API_BASE_URL = window.APP_CONFIG.API_BASE_URL || 'http://localhost:8000/api';
window.APP_CONFIG.DEBUG = true;

// Objeto para armazenar os serviços
window.appServices = window.appServices || {};

/**
 * Classe para gerenciar a inicialização dos serviços
 */
class AppInitializer {
    constructor() {
        this.services = {};
        this.initialized = false;
        this.initPromise = null;
    }

    /**
     * Registra um serviço para inicialização
     * @param {string} name - Nome do serviço
     * @param {Function} initFn - Função de inicialização que retorna uma Promise
     * @param {Array} dependencies - Lista de dependências do serviço
     */
    registerService(name, initFn, dependencies = []) {
        this.services[name] = {
            init: initFn,
            dependencies,
            initialized: false,
            instance: null
        };
        console.log(`✅ Serviço registrado: ${name}`);
    }

    /**
     * Inicializa um serviço e suas dependências
     * @param {string} serviceName - Nome do serviço a ser inicializado
     * @returns {Promise} Promessa que resolve quando o serviço estiver pronto
     */
    async initializeService(serviceName) {
        const service = this.services[serviceName];
        
        if (!service) {
            throw new Error(`Serviço não encontrado: ${serviceName}`);
        }
        
        // Se já foi inicializado, retorna a instância
        if (service.initialized) {
            return service.instance;
        }
        
        console.log(`🔄 Inicializando serviço: ${serviceName}`);
        
        // Inicializa as dependências primeiro
        for (const dep of service.dependencies) {
            await this.initializeService(dep);
        }
        
        // Inicializa o serviço
        try {
            service.instance = await service.init();
            service.initialized = true;
            console.log(`✅ Serviço inicializado: ${serviceName}`);
            return service.instance;
        } catch (error) {
            console.error(`❌ Erro ao inicializar serviço ${serviceName}:`, error);
            throw error;
        }
    }

    /**
     * Inicializa todos os serviços registrados
     * @returns {Promise} Promessa que resolve quando todos os serviços estiverem prontos
     */
    async initializeAll() {
        if (this.initialized) {
            return;
        }
        
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = (async () => {
            try {
                console.log('🚀 Iniciando inicialização dos serviços...');
                
                // Inicializa os serviços na ordem correta
                for (const serviceName in this.services) {
                    await this.initializeService(serviceName);
                }
                
                this.initialized = true;
                console.log('🎉 Todos os serviços foram inicializados com sucesso!');
                
                // Dispara evento de inicialização concluída
                const event = new CustomEvent('app:initialized', { 
                    detail: { services: this.services } 
                });
                window.dispatchEvent(event);
                
                return this.services;
            } catch (error) {
                console.error('❌ Erro durante a inicialização dos serviços:', error);
                throw error;
            }
        })();
        
        return this.initPromise;
    }
    
    /**
     * Obtém uma instância de um serviço
     * @param {string} serviceName - Nome do serviço
     * @returns {Object} Instância do serviço
     */
    getService(serviceName) {
        const service = this.services[serviceName];
        if (!service || !service.initialized) {
            throw new Error(`Serviço não disponível ou não inicializado: ${serviceName}`);
        }
        return service.instance;
    }
}

// Cria uma instância global do inicializador
window.appInitializer = new AppInitializer();

// Função para registrar serviços
window.registerService = (name, initFn, dependencies = []) => {
    return window.appInitializer.registerService(name, initFn, dependencies);
};

// Inicializa a aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.appInitializer.initializeAll().catch(error => {
            console.error('Falha crítica na inicialização da aplicação:', error);
            // Mostra mensagem de erro para o usuário
            alert('Ocorreu um erro ao carregar a aplicação. Por favor, recarregue a página.');
        });
    });
} else {
    window.appInitializer.initializeAll().catch(error => {
        console.error('Falha crítica na inicialização da aplicação:', error);
        // Mostra mensagem de erro para o usuário
        alert('Ocorreu um erro ao carregar a aplicação. Por favor, recarregue a página.');
    });
}

// Exporta para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.appInitializer;
}

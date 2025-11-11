/**
 * Inicialização dos serviços da aplicação
 * Garante que os serviços sejam carregados na ordem correta
 */

// Configuração global
window.APP_CONFIG = window.APP_CONFIG || {};
window.APP_CONFIG.API_BASE_URL = window.location.origin + '/api';
window.APP_CONFIG.DEBUG = true;

console.log('🚀 Inicializando aplicação...');
console.log('🌐 API Base URL:', window.APP_CONFIG.API_BASE_URL);

// Função para carregar scripts na ordem correta
function loadScripts(scripts, callback) {
    let loaded = 0;
    const total = scripts.length;

    function loadScript(src, onLoad) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`✅ Script carregado: ${src}`);
                onLoad();
                resolve();
            };
            script.onerror = (error) => {
                console.error(`❌ Erro ao carregar script: ${src}`, error);
                onLoad();
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    function loadNext() {
        if (loaded < total) {
            const script = scripts[loaded++];
            console.log(`⏳ Carregando script: ${script}`);
            loadScript(script, loadNext);
        } else if (callback) {
            callback();
        }
    }

    loadNext();
}

// Ordem de carregamento dos scripts
const scriptsToLoad = [
    // Bibliotecas
    'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
    
    // Serviços principais
    '/js/api.js',
    '/js/auth.js',
    '/js/categories.js',
    
    // Outros serviços
    // Adicione outros serviços aqui na ordem correta
];

// Iniciar carregamento dos scripts
loadScripts(scriptsToLoad, () => {
    console.log('🎉 Todos os scripts foram carregados com sucesso!');
    
    // Inicializar serviços após o carregamento
    if (window.api && window.auth) {
        console.log('🚀 Inicializando serviços...');
        
        // Inicializar serviços na ordem correta
        window.api.init();
        window.auth.init();
        
        // Verificar autenticação
        const token = localStorage.getItem('token');
        if (token) {
            window.auth.checkAuthStatus();
        }
        
        // Inicializar categorias se disponível
        if (window.categories) {
            window.categories.init();
        }
        
        console.log('✅ Serviços inicializados com sucesso!');
    } else {
        console.error('❌ Falha ao inicializar serviços: api ou auth não estão disponíveis');
    }
});

// Tratamento de erros global
window.addEventListener('error', function(event) {
    console.error('Erro não tratado:', event.error || event.message, event);
    
    // Mostrar mensagem de erro amigável
    const errorMessage = event.message || 'Ocorreu um erro inesperado';
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = `Erro: ${errorMessage}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
});

// Exportar para uso global
window.initializeApp = function() {
    console.log('🔄 Inicializando aplicação...');
    // Inicialização adicional pode ser feita aqui
};

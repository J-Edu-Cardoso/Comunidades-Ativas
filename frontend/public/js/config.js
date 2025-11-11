// Configurações da aplicação
const ENV = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  STAGING: 'staging'
};

// Configurações por ambiente
const configs = {
  [ENV.DEVELOPMENT]: {
    API_BASE_URL: 'http://localhost:8000/api',
    GOOGLE_MAPS_API_KEY: 'AIzaSyDj2HnAiZ-ukWC2wiQRJJphTgbNU8ogARo',
    DEBUG: true
  },
  [ENV.STAGING]: {
    API_BASE_URL: 'https://YOUR-API-GATEWAY-URL/staging',
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
    DEBUG: true
  },
  [ENV.PRODUCTION]: {
    API_BASE_URL: 'https://YOUR-API-GATEWAY-URL/prod',
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
    DEBUG: false
  }
};

// Determinar o ambiente atual
const getCurrentEnv = () => {
  const hostname = window.location.hostname;
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return ENV.DEVELOPMENT;
  } else if (hostname.includes('staging.')) {
    return ENV.STAGING;
  }
  return ENV.PRODUCTION;
};

// Configuração ativa
const currentEnv = getCurrentEnv();
const APP_CONFIG = {
  ...configs[currentEnv],
  ENV: currentEnv,
  VERSION: '1.0.0',
  // Tempo máximo de requisição em milissegundos
  REQUEST_TIMEOUT: 30000,
  // Configurações de autenticação
  AUTH: {
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    TOKEN_EXPIRY_KEY: 'token_expiry',
    // Tempo de expiração do token em segundos
    TOKEN_EXPIRY: 3600, // 1 hora
    // Tempo para renovar o token antes de expirar (em segundos)
    REFRESH_THRESHOLD: 300 // 5 minutos
  }
};

// Adicionar ao escopo global
window.APP_CONFIG = APP_CONFIG;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    APP_CONFIG,
    ENV,
    getCurrentEnv
  };
}

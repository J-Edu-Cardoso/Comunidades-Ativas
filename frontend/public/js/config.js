/**
 * Configurações da aplicação
 * Gerencia as configurações de ambiente e constantes globais
 */

// Constantes de ambiente
const ENV = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  STAGING: 'staging'
};

// Configurações específicas por ambiente
const configs = {
  [ENV.DEVELOPMENT]: {
    API_BASE_URL: 'http://localhost:8000/api',
    GOOGLE_MAPS_API_KEY: 'AIzaSyDj2HnAiZ-ukWC2wiQRJJphTgbNU8ogARo',
    DEBUG: true,
    LOG_LEVEL: 'debug',
    ENABLE_ANALYTICS: false
  },
  [ENV.STAGING]: {
    API_BASE_URL: 'https://api-staging.comunidadesativas.com/api',
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
    DEBUG: true,
    LOG_LEVEL: 'info',
    ENABLE_ANALYTICS: true
  },
  [ENV.PRODUCTION]: {
    API_BASE_URL: 'https://api.comunidadesativas.com/api',
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
    DEBUG: false,
    LOG_LEVEL: 'warn',
    ENABLE_ANALYTICS: true
  }
};

/**
 * Determina o ambiente atual com base no hostname
 * @returns {string} Ambiente atual (development, staging, production)
 */
const getCurrentEnv = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return ENV.DEVELOPMENT;
  } else if (hostname.includes('staging.') || hostname.includes('-staging.')) {
    return ENV.STAGING;
  } else if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
    return ENV.STAGING;
  }
  
  return ENV.PRODUCTION;
};

// Configuração ativa
const currentEnv = getCurrentEnv();

/**
 * Configuração principal da aplicação
 * @type {Object}
 */
const APP_CONFIG = {
  ...configs[currentEnv],
  // Informações do ambiente
  ENV: currentEnv,
  VERSION: '1.1.0',
  BUILD_DATE: '2025-03-15',
  
  // Configurações de rede
  REQUEST_TIMEOUT: 30000, // 30 segundos
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 segundo
  
  // Configurações de autenticação
  AUTH: {
    TOKEN_KEY: 'comunidades_ativas_auth_token',
    REFRESH_TOKEN_KEY: 'comunidades_ativas_refresh_token',
    TOKEN_EXPIRY_KEY: 'comunidades_ativas_token_expiry',
    USER_KEY: 'comunidades_ativas_user',
    TOKEN_REFRESH_THRESHOLD: 300, // 5 minutos em segundos
    TOKEN_EXPIRY: 3600, // 1 hora em segundos
    // Configurações de expiração
    TOKEN_EXPIRY: 3600, // 1 hora em segundos
    REFRESH_TOKEN_EXPIRY: 2592000, // 30 dias em segundos
    REFRESH_THRESHOLD: 300, // 5 minutos antes de expirar para renovar
    
    // Configurações de armazenamento
    STORAGE_TYPE: 'localStorage', // ou 'sessionStorage'
    
    // Configurações de segurança
    TOKEN_PREFIX: 'comunidades_ativas_',
    
    // Rotas de autenticação
    ROUTES: {
      LOGIN: '/login',
      REGISTER: '/register',
      PROFILE: '/profile',
      LOGOUT: '/logout',
      REFRESH_TOKEN: '/auth/refresh-token'
    }
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

export const env = {
    PORT: parseInt(import.meta.env.VITE_PORT) || 3000,
    HOST: import.meta.env.VITE_HOST === 'true',
    API_BASE_URL: '/api/',
    JWT_SECRET: import.meta.env.VITE_JWT_SECRET || 'default-secret',
    JWT_EXPIRES_IN: import.meta.env.VITE_JWT_EXPIRES_IN || '24h',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'MyApp',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    APP_ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
    COOKIE_DOMAIN: import.meta.env.VITE_COOKIE_DOMAIN || 'localhost',
    COOKIE_SECURE: import.meta.env.VITE_COOKIE_SECURE === 'true',
    COOKIE_SAME_SITE: import.meta.env.VITE_COOKIE_SAME_SITE || 'lax',
    WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
    DEBUG: import.meta.env.VITE_DEBUG === 'true',
    LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
} as const;

export type EnvConfig = typeof env;
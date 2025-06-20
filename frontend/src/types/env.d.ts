/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PORT: string
    readonly VITE_HOST: string
    readonly VITE_API_URL: string
    readonly VITE_API_BASE_URL: string
    readonly VITE_JWT_SECRET: string
    readonly VITE_JWT_EXPIRES_IN: string
    readonly VITE_APP_NAME: string
    readonly VITE_APP_VERSION: string
    readonly VITE_APP_ENVIRONMENT: string
    readonly VITE_COOKIE_DOMAIN: string
    readonly VITE_COOKIE_SECURE: string
    readonly VITE_COOKIE_SAME_SITE: string
    readonly VITE_WS_URL: string
    readonly VITE_DEBUG: string
    readonly VITE_LOG_LEVEL: string
    readonly DEV: boolean
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
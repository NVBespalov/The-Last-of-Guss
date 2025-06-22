import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        external: ['@socket.io/component-emitter']
      },
      outDir: 'build',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@widgets': path.resolve(__dirname, './src/widgets'),
        '@features': path.resolve(__dirname, './src/features'),
        '@entities': path.resolve(__dirname, './src/entities'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@socket.io/component-emitter': '/node_modules/@socket.io/component-emitter/index.js'
      },
    },
    optimizeDeps: {
      include: ['socket.io-client', '@socket.io/component-emitter']
    },
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
      host: env.VITE_HOST === 'true' || true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    preview: {
      port: parseInt(env.VITE_PORT) || 3000,
      host: env.VITE_HOST === 'true' || true,
    },
  }
})
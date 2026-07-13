import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // Allow constrained environments to keep Vite's generated dependency
    // cache outside node_modules (for example VITE_CACHE_DIR=/tmp/proxy-judge-vite).
    cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',
    server: {
        port: 3000,
    },
    preview: {
        port: 3000,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                    gsap: ['gsap'],
                    react: ['react', 'react-dom'],
                },
            },
        },
    },
})

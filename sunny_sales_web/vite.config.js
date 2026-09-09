import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Em produção, remove chamadas console.* e instruções debugger do bundle
  // (mantém-nas em desenvolvimento para depuração).
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
  server: {
    proxy: {
      '/vendors': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true },
      '/api': 'http://localhost:8000',
    },
  },
}))

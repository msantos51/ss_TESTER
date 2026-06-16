import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/vendors': 'http://localhost:8000',
      '/login': 'http://localhost:8000',
      '/token': 'http://localhost:8000',
      '/confirm-email': 'http://localhost:8000',
      '/password-reset': 'http://localhost:8000',
      '/password-reset-request': 'http://localhost:8000',
      '/admin': 'http://localhost:8000',
      '/stripe': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true },
      '/api': 'http://localhost:8000',
    },
  },
})

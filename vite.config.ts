import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    outDir: mode === 'standalone' ? 'dist-combat' : 'dist',
    rollupOptions: {
      input: mode === 'standalone'
        ? resolve(import.meta.dirname, 'combat.html')
        : { hotel: resolve(import.meta.dirname, 'index.html'), combat: resolve(import.meta.dirname, 'combat.html') },
    },
  },
  server: {
    port: 3000,
    open: true
  }
}))

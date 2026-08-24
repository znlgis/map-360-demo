import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@photo-sphere-viewer/core')) {
            return 'psv-core'
          }
          if (
            id.includes('node_modules/@photo-sphere-viewer/markers-plugin') ||
            id.includes('node_modules/@photo-sphere-viewer/plan-plugin')
          ) {
            return 'psv-plugins'
          }
          if (id.includes('node_modules/leaflet')) {
            return 'leaflet'
          }
        },
      },
    },
  },
})

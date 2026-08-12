import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/21-dias-gratidao/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '21 Dias de Gratidão',
        short_name: 'Gratidão',
        description: 'Uma jornada de 21 dias para desenvolver o hábito da gratidão.',
        theme_color: '#5b8a72',
        background_color: '#f7f3ea',
        display: 'standalone',
        start_url: '/21-dias-gratidao/',
        scope: '/21-dias-gratidao/',
        lang: 'pt-BR',
        icons: [
          { src: '/21-dias-gratidao/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/21-dias-gratidao/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}']
      }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8645'
    }
  }
})

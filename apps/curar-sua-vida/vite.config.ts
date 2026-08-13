import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/curar-sua-vida/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '20 Dias para Curar a Sua Vida',
        short_name: 'Curar Vida',
        description: 'Uma jornada de 21 dias para aprender a se amar trabalhando com o espelho.',
        theme_color: '#c89b8a',
        background_color: '#faf6f0',
        display: 'standalone',
        start_url: '/curar-sua-vida/',
        scope: '/curar-sua-vida/',
        lang: 'pt-BR',
        icons: [
          { src: '/curar-sua-vida/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/curar-sua-vida/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}']
      }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8646'
    }
  }
})

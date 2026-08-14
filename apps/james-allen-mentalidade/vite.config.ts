import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'James Allen: Mentalidade',
          short_name: 'Mentalidade',
          description: 'Jornada de 21 dias para cultivar disciplina mental pelo pensamento, baseada na obra de James Allen.',
          theme_color: '#1e3a5f',
          background_color: '#f7f4ed',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%231e3a5f"/><text x="50" y="65" font-family="Georgia,serif" font-size="50" font-weight="bold" fill="%23b8893e" text-anchor="middle">M</text></svg>',
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%231e3a5f"/><text x="50" y="65" font-family="Georgia,serif" font-size="50" font-weight="bold" fill="%23b8893e" text-anchor="middle">M</text></svg>',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/preview\.automacaojs\.us\/james-allen-mentalidade\/api\/content\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'james-allen-content-cache',
                expiration: {
                  maxEntries: 25,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

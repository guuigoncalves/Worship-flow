import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('firebase')) return 'vendor-firebase';
          if (id.includes('chordsheetjs')) return 'vendor-chordsheetjs';
          if (id.includes('jspdf') || id.includes('xlsx') || id.includes('html2canvas')) return 'vendor-exportar';
          if (id.includes('pdfjs-dist')) return 'vendor-pdf';
          if (id.includes('tesseract.js')) return 'vendor-ocr';
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) return 'vendor-react';
          return undefined;
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['offline.html', 'icons/icon.svg'],
      manifest: {
        name: 'WorshipFlow',
        short_name: 'WorshipFlow',
        description: 'Assistente de louvor ao vivo para músicos de igreja.',
        theme_color: '#F0C040',
        background_color: '#09090F',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Busca Rápida',
            short_name: 'Busca',
            description: 'Abrir busca instantânea de músicas.',
            url: '/busca-rapida',
            icons: [{ src: '/icons/icon.svg', sizes: '192x192', type: 'image/svg+xml' }]
          }
        ]
      },
      workbox: {
        navigateFallback: '/offline.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'font' || request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'worshipflow-assets',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
});

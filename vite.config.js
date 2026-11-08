import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',

  plugins: [
    vue(),

    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      devOptions: {
        enabled: true,
      },

      manifest: {
        name: 'Global Academy',
        short_name: 'Global',
        description: 'Global Academy Management System',

        theme_color: '#2563eb',
        background_color: '#ffffff',

        display: 'standalone',
        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Workbox Service Worker যেন /api রাউটগুলোকে ফ্রন্টএন্ড স্ট্যাটিক ক্যাশ থেকে ইগノール করে সরাসরি ব্যাকএন্ডে পাঠায়
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],

  // Localhost (XAMPP / Dev Server) এর জন্য প্রক্সি কনফিগারেশন
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // আপনার লোকাল ল্যারাভেল/XAMPP পোর্ট (যেমন 8000 বা localhost/your-project)
        changeOrigin: true,
        secure: false,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

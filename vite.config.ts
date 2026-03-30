import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    include: ['react-player'],
    exclude: ['lucide-react'],
  },

  server: {
    force: true,
  },

  build: {
    target: 'es2015',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'form-vendor': ['react-hook-form', 'react-select'],
          'ui-vendor': ['framer-motion', 'react-hot-toast', 'lucide-react'],
          'media-vendor': ['react-player', 'react-image-crop', 'html2canvas'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});

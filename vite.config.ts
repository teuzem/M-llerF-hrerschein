import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],

    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    },

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
  };
});

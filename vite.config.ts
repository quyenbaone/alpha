import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@supabase/supabase-js'
    ],
  },
  server: {
    hmr: {
      overlay: false, // Disable the HMR overlay to improve performance
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['sonner', 'lucide-react'],
          'data-vendor': ['@supabase/supabase-js', 'zustand'],
        },
      },
    },
  },
});

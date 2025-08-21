import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime to prevent JSX runtime errors
      jsxRuntime: 'automatic',
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'components': fileURLToPath(new URL('./src/components', import.meta.url)),
      'pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      'utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      'styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Make Supabase external to prevent build errors when not installed
        if (id.includes('@supabase/supabase-js')) {
          return true;
        }
        return false;
      },
      output: {
        globals: {
          '@supabase/supabase-js': 'supabase'
        }
      }
    }
  },
  optimizeDeps: {
    // Exclude Supabase from pre-bundling to allow dynamic imports
    exclude: ['@supabase/supabase-js']
  },
  server: {
    port: 5173,
    host: true,
  },
});

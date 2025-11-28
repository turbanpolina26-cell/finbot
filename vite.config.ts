import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'supabase-vendor': ['@supabase/supabase-js'],
              'recharts-vendor': ['recharts'],
            }
          }
        },
        chunkSizeWarningLimit: 600,
        target: 'esnext',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
          }
        }
      }
    };
});

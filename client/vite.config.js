import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.js',
    css: true,
    clearMocks: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/]react/,
              priority: 20,
            },
            {
              name: 'router-vendor',
              test: /node_modules[\\/]react-router/,
              priority: 18,
            },
            {
              name: 'ui-vendor',
              test: /node_modules[\\/](@headlessui|lucide-react|sonner)/,
              priority: 15,
            },
            {
              name: 'validation-vendor',
              test: /node_modules[\\/]zod/,
              priority: 12,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});

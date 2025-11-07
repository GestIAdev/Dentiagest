/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Vitest test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'], // Only unit tests
    exclude: ['tests/e2e/**', 'node_modules/', 'build/'], // Exclude E2E Playwright tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'build/']
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@graphql': path.resolve(__dirname, './src/graphql'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
    },
  },

  server: {
    port: 3000,
    host: true, // Listen on all addresses
    proxy: {
      '/graphql': {
        target: 'http://localhost:8005', // Selene GraphQL
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8000', // Python backend REST
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8005', // GraphQL subscriptions
        ws: true,
      },
    },
  },

  build: {
    outDir: 'build',
    sourcemap: true,
    target: 'esnext', // ESM perfecto
    minify: 'esbuild', // 10x más rápido que terser
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'apollo-vendor': ['@apollo/client', 'graphql'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
        },
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', '@apollo/client'],
  },

  define: {
    'process.env': {},
  },
});

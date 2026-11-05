import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // O Next resolve "server-only" internamente; nos testes vira um módulo vazio.
      'server-only': path.resolve(__dirname, './src/test/server-only-vazio.ts'),
    },
  },
});

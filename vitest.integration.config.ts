import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [path.resolve(__dirname, './packages/commerce/src/vitest.integration.setup.ts')],
    alias: {
      '@corecart/commerce': path.resolve(__dirname, './packages/commerce/src'),
      '@corecart/shared': path.resolve(__dirname, './packages/shared/src'),
      '@corecart/types': path.resolve(__dirname, './packages/types/src'),
      '@corecart/database': path.resolve(__dirname, './packages/database/src'),
      '@prisma/client': path.resolve(__dirname, './packages/database/src/client'),
      '@': path.resolve(__dirname, './'),
    },
    include: [
      'packages/**/*.integration.spec.ts',
      'apps/**/*.integration.spec.ts'
    ],
    exclude: [
      'packages/**/__mocks__/**',
      'packages/commerce/src/index.ts',
      'packages/shared/src/index.ts',
      'packages/database/**',
      '**/node_modules/**'
    ],
    testTimeout: 20000,
  },
});

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['**/node_modules/**', '**/e2e/**', '**/*.integration.spec.ts', '**/.next/**'],
    setupFiles: [path.resolve(__dirname, './packages/commerce/src/vitest.setup.ts')],
    alias: {
      '@corecart/commerce': path.resolve(__dirname, './packages/commerce/src'),
      '@corecart/shared': path.resolve(__dirname, './packages/shared/src'),
      '@corecart/types': path.resolve(__dirname, './packages/types/src'),
      '@corecart/database': path.resolve(__dirname, './packages/database/src'),
      '@prisma/client': path.resolve(__dirname, './packages/database/src/index.ts'),
      '@': path.resolve(__dirname, './'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      include: [
        'packages/commerce/src/checkout/checkout.service.ts',
        'packages/commerce/src/order/order.service.ts',
        'packages/commerce/src/inventory/inventory.service.ts',
        'packages/commerce/src/shopping/recommendation.service.ts',
        'packages/commerce/src/payment/refund.service.ts',
        'packages/shared/src/utils/jwt.ts',
      ],
      exclude: [
        'e2e/**',
        'packages/**/*.d.ts',
        'packages/**/*.spec.ts',
        'packages/**/*.test.ts',
        'packages/**/__mocks__/**',
        'packages/commerce/src/index.ts',
        'packages/shared/src/index.ts',
        'packages/database/**',
      ],
    },
  },
});

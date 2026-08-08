import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    settings: {
      next: {
        rootDir: ['apps/admin/', 'apps/merchant/', 'apps/storefront/'],
      },
    },
  },
  globalIgnores([
    '**/.next/**',
    '**/dist/**',
    '**/coverage/**',
    'node_modules/**',
    'packages/database/src/client/**',
    'next-env.d.ts',
  ]),
])

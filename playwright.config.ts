import { defineConfig, devices } from '@playwright/test';

const STOREFRONT_PORT = process.env.STOREFRONT_PORT || 3001;
const MERCHANT_PORT = process.env.MERCHANT_PORT || 3002;
const ADMIN_PORT = process.env.ADMIN_PORT || 3003;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: `http://localhost:${STOREFRONT_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter storefront start',
      url: `http://localhost:${STOREFRONT_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter merchant start',
      url: `http://localhost:${MERCHANT_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter admin start',
      url: `http://localhost:${ADMIN_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});

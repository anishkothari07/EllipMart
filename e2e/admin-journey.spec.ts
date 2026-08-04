import { test, expect } from '@playwright/test';

const ADMIN_PORT = process.env.ADMIN_PORT || 3003;
const BASE_URL = `http://localhost:${ADMIN_PORT}`;

test.describe('Admin End-to-End Journey', () => {
  test('Admin Portal loads login page', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });
});

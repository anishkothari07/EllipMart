import { test, expect } from '@playwright/test';

const MERCHANT_PORT = process.env.MERCHANT_PORT || 3002;
const BASE_URL = `http://localhost:${MERCHANT_PORT}`;

test.describe('Merchant End-to-End Journey', () => {
  test('Merchant Portal loads login page', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Merchant Products Dashboard loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await expect(page.locator('body')).toBeVisible();
  });
});

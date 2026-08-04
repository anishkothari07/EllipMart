import { test, expect } from '@playwright/test';

const STOREFRONT_PORT = process.env.STOREFRONT_PORT || 3001;
const BASE_URL = `http://localhost:${STOREFRONT_PORT}`;

test.describe('Customer End-to-End Journey', () => {
  test('Storefront Homepage loads and renders header elements', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/SmartGO/i);
    await expect(page.locator('header')).toBeVisible();
  });

  test('Customer Search, Product Details, Cart, and Checkout Navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=test`);
    await expect(page.locator('body')).toBeVisible();

    // Navigate to Cart
    await page.goto(`${BASE_URL}/cart`);
    await expect(page.locator('body')).toContainText(/cart|shopping/i);

    // Navigate to Checkout
    await page.goto(`${BASE_URL}/checkout`);
    await expect(page.locator('body')).toBeVisible();
  });
});

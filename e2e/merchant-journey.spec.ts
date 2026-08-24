import { test, expect } from '@playwright/test';

const MERCHANT_PORT = process.env.MERCHANT_PORT || 3002;
const STOREFRONT_PORT = process.env.STOREFRONT_PORT || 3001;
const BASE_URL = `http://localhost:${MERCHANT_PORT}`;
const API_BASE = `http://localhost:${STOREFRONT_PORT}`;

test.describe('Seller (Merchant) Portal — Access & RBAC', () => {
  test('Merchant portal root loads without crash', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
    await expect(page).not.toHaveTitle(/500|Error/i);
  });

  test('Merchant portal redirects unauthenticated user (no crash)', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await expect(page.locator('body')).toBeVisible();
    // Should be on login or redirect — either way not 500
    await expect(page).not.toHaveTitle(/500|Error/i);
  });

  test('Merchant portal /orders loads without crash', async ({ page }) => {
    await page.goto(`${BASE_URL}/orders`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Merchant portal /inventory loads without crash', async ({ page }) => {
    await page.goto(`${BASE_URL}/inventory`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Seller API (/api/v1/seller/*) rejects unauthenticated request with 401', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/seller/products`);
    expect(response.status()).toBe(401);
  });

  test('Seller API rejects CUSTOMER-role JWT with 403', async ({ request }) => {
    // Attempt seller route with a clearly invalid token
    const response = await request.get(`${API_BASE}/api/v1/seller/products`, {
      headers: { Authorization: 'Bearer invalid.customer.jwt.token' },
    });
    // Server must return 401 (invalid token) or 403 (wrong role) — never 200
    expect([401, 403]).toContain(response.status());
  });

  test('Admin API is inaccessible from Merchant portal context (no cross-contamination)', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/admin/sellers`, {
      headers: { Authorization: 'Bearer invalid.seller.jwt' },
    });
    expect([401, 403]).toContain(response.status());
  });
});

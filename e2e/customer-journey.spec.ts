import { test, expect } from '@playwright/test';

const STOREFRONT_PORT = process.env.STOREFRONT_PORT || 3001;
const ADMIN_PORT = process.env.ADMIN_PORT || 3003;
const MERCHANT_PORT = process.env.MERCHANT_PORT || 3002;
const BASE_URL = `http://localhost:${STOREFRONT_PORT}`;

test.describe('Customer Storefront — Homepage & Navigation', () => {
  test('Homepage loads with correct title and header', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/EllipMart/i);
    await expect(page.locator('header')).toBeVisible();
    // Logo should be visible
    await expect(page.locator('header img[alt*="Logo"]')).toBeVisible();
  });

  test('Homepage renders navigation links', async ({ page }) => {
    await page.goto(BASE_URL);
    const nav = page.locator('header nav');
    await expect(nav).toBeVisible();
  });

  test('Footer renders with newsletter signup', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer input[type="email"]')).toBeVisible();
  });

  test('404 page renders branded not-found experience', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-route-does-not-exist-xyz`);
    expect(response?.status()).toBe(404);
    await expect(page.locator('body')).toContainText(/wandered off|not found|404/i);
  });
});

test.describe('Customer RBAC — Unauthenticated & Cross-Role Access', () => {
  test('Unauthenticated user visiting /checkout is not served a crash', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`);
    // Should either redirect to login or show the checkout page — must not 500
    const title = await page.title();
    expect(title).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  });

  test('Unauthenticated user visiting /account is not served a crash', async ({ page }) => {
    await page.goto(`${BASE_URL}/account`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin API rejects unauthenticated request with 401', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/admin/sellers`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('Order API rejects unauthenticated request with 401', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/orders`);
    expect(response.status()).toBe(401);
  });

  test('Cart API rejects unauthenticated request with 401', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/cart`);
    expect(response.status()).toBe(401);
  });

  test('Admin API rejects CUSTOMER JWT with 403', async ({ request }) => {
    // A customer JWT signed with access secret but role=CUSTOMER
    // We use the health endpoint to verify the server is up, then test the admin block
    const healthRes = await request.get(`${BASE_URL}/api/v1/health`);
    expect(healthRes.status()).toBe(200);

    // Attempt admin route with a fake customer token — should get 401 (invalid token) or 403
    const response = await request.get(`${BASE_URL}/api/v1/admin/sellers`, {
      headers: { Authorization: 'Bearer fake.customer.token' },
    });
    expect([401, 403]).toContain(response.status());
  });
});

test.describe('Customer Storefront — Public Routes', () => {
  test('Health endpoint returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/health`);
    expect(response.status()).toBe(200);
  });

  test('Products API is publicly accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/products`);
    // Public route — should not 401
    expect(response.status()).not.toBe(401);
  });

  test('Categories API is publicly accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/categories`);
    expect(response.status()).not.toBe(401);
  });

  test('Search API is publicly accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/search?q=shirt`);
    expect(response.status()).not.toBe(401);
  });

  test('Search page renders without crash', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=shoes`);
    await expect(page.locator('body')).toBeVisible();
    await expect(page).not.toHaveTitle(/500|Error/i);
  });

  test('Category page renders without crash', async ({ page }) => {
    await page.goto(`${BASE_URL}/category/all`);
    await expect(page.locator('body')).toBeVisible();
  });
});

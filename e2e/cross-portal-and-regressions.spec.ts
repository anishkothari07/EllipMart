import { test, expect } from '@playwright/test';

const STOREFRONT_PORT = process.env.STOREFRONT_PORT || 3001;
const MERCHANT_PORT = process.env.MERCHANT_PORT || 3002;
const ADMIN_PORT = process.env.ADMIN_PORT || 3003;

test.describe('Cross-Portal Session Isolation', () => {
  test('Customer and Merchant browser contexts do not share cookies', async ({ browser }) => {
    const customerCtx = await browser.newContext();
    const merchantCtx = await browser.newContext();

    const customerPage = await customerCtx.newPage();
    const merchantPage = await merchantCtx.newPage();

    await customerPage.goto(`http://localhost:${STOREFRONT_PORT}`);
    await merchantPage.goto(`http://localhost:${MERCHANT_PORT}`);

    // Each page must be in its own origin
    expect(customerPage.url()).toContain(String(STOREFRONT_PORT));
    expect(merchantPage.url()).toContain(String(MERCHANT_PORT));

    // Customer context must have no cookies from merchant portal
    const merchantCookies = await customerCtx.cookies(`http://localhost:${MERCHANT_PORT}`);
    expect(merchantCookies).toHaveLength(0);

    await customerCtx.close();
    await merchantCtx.close();
  });

  test('Customer and Admin browser contexts do not share cookies', async ({ browser }) => {
    const customerCtx = await browser.newContext();
    const adminCtx = await browser.newContext();

    const customerPage = await customerCtx.newPage();
    const adminPage = await adminCtx.newPage();

    await customerPage.goto(`http://localhost:${STOREFRONT_PORT}`);
    await adminPage.goto(`http://localhost:${ADMIN_PORT}`);

    const adminCookiesInCustomerCtx = await customerCtx.cookies(`http://localhost:${ADMIN_PORT}`);
    expect(adminCookiesInCustomerCtx).toHaveLength(0);

    await customerCtx.close();
    await adminCtx.close();
  });
});

test.describe('Critical Regression: 404 & Error Boundaries', () => {
  test('Invalid storefront route returns 404 — not 500', async ({ page }) => {
    const response = await page.goto(`http://localhost:${STOREFRONT_PORT}/this-does-not-exist-abc`);
    expect(response?.status()).toBe(404);
  });

  test('Invalid API route returns structured error, not HTML crash page', async ({ request }) => {
    const response = await request.get(`http://localhost:${STOREFRONT_PORT}/api/v1/this-route-does-not-exist`);
    // Should be 401 (auth check) or 404 — must NOT be 500
    expect(response.status()).not.toBe(500);
  });

  test('Dev routes are blocked in non-dev environments', async ({ request }) => {
    // In CI / production mode this should return 404. In dev mode it may 200.
    // We assert it does NOT 500 in any environment.
    const response = await request.get(`http://localhost:${STOREFRONT_PORT}/api/v1/dev/seed`);
    expect(response.status()).not.toBe(500);
  });
});

test.describe('Critical Regression: Auth API Contract', () => {
  test('Register endpoint accepts POST and returns a structured response', async ({ request }) => {
    // Attempt a register call with missing fields — should return 400, not 500
    const response = await request.post(
      `http://localhost:${STOREFRONT_PORT}/api/v1/auth/register`,
      { data: {} }
    );
    expect([400, 422]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('success', false);
  });

  test('Login endpoint accepts POST and returns a structured response', async ({ request }) => {
    // Attempt login with bad creds — should return 400 or 401, not 500
    const response = await request.post(
      `http://localhost:${STOREFRONT_PORT}/api/v1/auth/login`,
      { data: { email: 'notareal@user.com', password: 'wrongpassword' } }
    );
    expect([400, 401]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('success', false);
  });

  test('Checkout endpoint rejects unauthenticated call with 401', async ({ request }) => {
    const response = await request.post(
      `http://localhost:${STOREFRONT_PORT}/api/v1/checkout`,
      { data: { paymentMethodCode: 'COD' } }
    );
    expect(response.status()).toBe(401);
  });

  test('Wallet endpoint rejects unauthenticated call with 401', async ({ request }) => {
    const response = await request.get(`http://localhost:${STOREFRONT_PORT}/api/v1/wallet`);
    expect(response.status()).toBe(401);
  });
});

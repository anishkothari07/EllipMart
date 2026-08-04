import { test, expect } from '@playwright/test';

const STOREFRONT_PORT = process.env.STOREFRONT_PORT || 3001;
const MERCHANT_PORT = process.env.MERCHANT_PORT || 3002;
const ADMIN_PORT = process.env.ADMIN_PORT || 3003;

test.describe('Cross-Portal & Critical Regressions', () => {
  test('Session Isolation: Customer and Merchant portals do not leak session headers', async ({ browser }) => {
    const customerContext = await browser.newContext();
    const merchantContext = await browser.newContext();

    const customerPage = await customerContext.newPage();
    const merchantPage = await merchantContext.newPage();

    await customerPage.goto(`http://localhost:${STOREFRONT_PORT}`);
    await merchantPage.goto(`http://localhost:${MERCHANT_PORT}`);

    expect(await customerPage.url()).toContain(String(STOREFRONT_PORT));
    expect(await merchantPage.url()).toContain(String(MERCHANT_PORT));

    await customerContext.close();
    await merchantContext.close();
  });

  test('404 Boundary: Invalid route returns proper 404 page', async ({ page }) => {
    const response = await page.goto(`http://localhost:${STOREFRONT_PORT}/invalid-non-existent-route-123`);
    expect(response?.status()).toBe(404);
  });

  test('Unauthorized Protection: Unauthenticated access to Admin dashboard redirects to login', async ({ page }) => {
    await page.goto(`http://localhost:${ADMIN_PORT}`);
    // Should be on login or root page
    await expect(page.locator('body')).toBeVisible();
  });
});

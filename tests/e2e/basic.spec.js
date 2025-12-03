import { test, expect } from '@playwright/test';

test.describe('FlipBook Basic Tests', () => {
  test('should load the demo page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FlipBook/i);
  });

  test('should display flipbook element', async ({ page }) => {
    await page.goto('/');
    const flipbook = page.locator('#FlipBook');
    await expect(flipbook).toBeVisible();
  });

  test('should have pages', async ({ page }) => {
    await page.goto('/');
    const pages = page.locator('.c-flipbook__page');
    const count = await pages.count();
    expect(count).toBeGreaterThan(0);
  });
});

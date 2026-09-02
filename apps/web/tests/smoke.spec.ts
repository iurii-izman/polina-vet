import { expect, test } from '@playwright/test';

for (const path of [
  '/ru/',
  '/ru/pets/',
  '/ru/farm/',
  '/ru/urgent/',
  '/ru/pets/urgent/',
  '/ru/farm/urgent/',
]) {
  test(`renders ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a[href="/ru/urgent/"]').first()).toBeVisible();
  });
}

test('mobile menu retains urgent action', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/ru/');
  await expect(page.locator('.urgent-action')).toBeVisible();
  await page.locator('.mobile-menu summary').click();
  await expect(page.getByRole('navigation', { name: 'Мобильная навигация' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Мобильная навигация' })).toBeHidden();
});

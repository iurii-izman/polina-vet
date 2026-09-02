import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of [
  '/ru/',
  '/ru/pets/',
  '/ru/farm/',
  '/ru/urgent/',
  '/ru/pets/urgent/',
  '/ru/farm/urgent/',
]) {
  test(`has no automatic accessibility violations: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

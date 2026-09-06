import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of [
  '/ru/',
  '/ru/pets/',
  '/ru/farm/',
  '/ru/farm/group-problem/',
  '/ru/farm/before-vet-arrives/',
  '/ru/task/animal-sick/',
  '/ru/task/prepare/',
  '/ru/urgent/',
  '/ru/pets/urgent/',
  '/ru/farm/urgent/',
  '/ru/pets/before-visit/',
  '/ru/knowledge/',
  '/ru/about/',
  '/ru/contact/',
  '/ru/contact/request/',
  '/ru/editorial-policy/',
  '/404.html',
]) {
  test(`has no automatic accessibility violations: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

for (const locale of ['ro', 'uk'] as const) {
  for (const path of [
    '',
    'pets',
    'farm',
    'urgent',
    'pets/urgent',
    'farm/urgent',
    'about',
    'contact',
    'contact/request',
    'pets/before-visit',
    'farm/before-vet-arrives',
    'knowledge',
    'editorial-policy',
    'task/animal-sick',
    'task/prepare',
    'farm/group-problem',
  ]) {
    test(`has no automatic accessibility violations: /${locale}/${path}`, async ({ page }) => {
      await page.goto(`/${locale}/${path}`);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

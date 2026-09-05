import { expect, test } from '@playwright/test';

const routes = {
  home: '/ru/',
  pets: '/ru/pets/',
  farm: '/ru/farm/',
  knowledge: '/ru/knowledge/',
  about: '/ru/about/',
  contact: '/ru/contact/',
  urgent: '/ru/urgent/',
  article: '/ru/pets/vaccination-basics-dogs-cats/',
} as const;

const viewports = [
  { name: '1440', width: 1440, height: 1000 },
  { name: '390', width: 390, height: 844 },
] as const;

const cases = Object.entries(routes).flatMap(([routeName, path]) =>
  viewports.map(
    ({ name, width, height }) => [`${routeName}-${name}`, path, width, height] as const,
  ),
);

for (const [name, path, width, height] of cases) {
  test(`visual baseline: ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await expect(page).toHaveScreenshot(`${name}.png`, {
      animations: 'disabled',
      fullPage: false,
    });
  });
}

test('visual baseline: language-menu-open-1440', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ru/');
  await page.locator('.language-menu summary').click();
  await expect(page).toHaveScreenshot('language-menu-open-1440.png', {
    animations: 'disabled',
    fullPage: false,
  });
});

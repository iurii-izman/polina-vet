import { expect, test } from '@playwright/test';

const cases = [
  ['home-1440', '/ru/', 1440, 1000],
  ['home-390', '/ru/', 390, 844],
  ['knowledge-1440', '/ru/knowledge/', 1440, 1000],
  ['knowledge-390', '/ru/knowledge/', 390, 844],
  ['about-1440', '/ru/about/', 1440, 1000],
  ['contact-390', '/ru/contact/', 390, 844],
  ['urgent-390', '/ru/urgent/', 390, 844],
  ['article-1440', '/ru/pets/vaccination-basics-dogs-cats/', 1440, 1000],
  ['article-390', '/ru/pets/vaccination-basics-dogs-cats/', 390, 844],
] as const;

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

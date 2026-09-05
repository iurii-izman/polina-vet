import { expect, test } from '@playwright/test';

const routes = [
  '/ru/',
  '/ru/pets/',
  '/ru/farm/',
  '/ru/knowledge/',
  '/ru/about/',
  '/ru/contact/',
  '/ru/urgent/',
  '/ru/pets/vaccination-basics-dogs-cats/',
];

for (const width of [320, 390, 768, 1024, 1280, 1440]) {
  test(`M12.6: no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of routes) {
      await page.goto(path);
      const widths = await page.evaluate(() => ({
        viewport: window.innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(widths, path).toMatchObject({ scroll: width });
    }
  });
}

test('M12.6: structured grids use intentional responsive columns', async ({ page }) => {
  const columns = async (path: string, selector: string, width: number) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    return page
      .locator(selector)
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  };

  await expect(columns('/ru/knowledge/', '.knowledge-grid', 1440)).resolves.toBe(2);
  await expect(columns('/ru/knowledge/', '.knowledge-grid', 768)).resolves.toBe(1);
  await expect(columns('/ru/contact/', '.contact-grid', 1440)).resolves.toBe(3);
  await expect(columns('/ru/contact/', '.contact-grid', 768)).resolves.toBe(2);
  await expect(columns('/ru/contact/', '.contact-grid', 390)).resolves.toBe(1);
});

test('M12.6: About has one visible page-title label', async ({ page }) => {
  await page.goto('/ru/about/');
  await expect(page.locator('.page-intro .eyebrow')).toHaveCount(0);
  await expect(page.locator('.page-intro h1')).toHaveText('О Полине');
});

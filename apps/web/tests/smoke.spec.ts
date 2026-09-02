import { expect, test } from '@playwright/test';

for (const path of [
  '/ru/',
  '/ru/pets/',
  '/ru/farm/',
  '/ru/farm/group-problem/',
  '/ru/task/animal-sick/',
  '/ru/task/prepare/',
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

test('homepage routes generic tasks through context routers', async ({ page }) => {
  await page.goto('/ru/');
  await page.getByRole('link', { name: /Животное заболело/ }).click();
  await expect(page).toHaveURL(/\/ru\/task\/animal-sick\/$/);
  await expect(
    page.locator('.task-router-grid').getByRole('link', { name: /Домашнее животное/ }),
  ).toBeVisible();
  await expect(
    page.locator('.task-router-grid').getByRole('link', { name: /Ферма/ }),
  ).toBeVisible();
  await expect(
    page.locator('.task-router-urgent').getByRole('link', { name: /Срочно: что делать/ }),
  ).toBeVisible();

  await page.goto('/ru/');
  await page.getByRole('link', { name: /Подготовиться к обращению/ }).click();
  await expect(page).toHaveURL(/\/ru\/task\/prepare\/$/);
  await expect(
    page.locator('.task-router-grid').getByRole('link', { name: /Визит с собакой или кошкой/ }),
  ).toBeVisible();
  await expect(
    page.locator('.task-router-grid').getByRole('link', { name: /Приезд ветеринара в хозяйство/ }),
  ).toBeVisible();
});

test('farm exposes the group-problem route in its first-action zone', async ({ page }) => {
  await page.goto('/ru/farm/');
  const groupProblem = page
    .locator('.farm-actions')
    .getByRole('link', { name: /Заболели несколько животных/ });
  await expect(groupProblem).toBeVisible();
  await groupProblem.click();
  await expect(page).toHaveURL(/\/ru\/farm\/group-problem\/$/);
});

test('urgent gateway routes to pet and farm urgent paths', async ({ page }) => {
  await page.goto('/ru/urgent/');
  await page.locator('.gateway-grid a').first().click();
  await expect(page).toHaveURL(/\/ru\/pets\/urgent\/$/);

  await page.goto('/ru/urgent/');
  await page.locator('.gateway-grid a').nth(1).click();
  await expect(page).toHaveURL(/\/ru\/farm\/urgent\/$/);
});

test('RU navigation is locale-prefixed and conditional homepage blocks are absent', async ({
  page,
}) => {
  await page.goto('/ru/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  const hrefs = await page
    .locator('.desktop-nav a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs.every((href) => href?.startsWith('/ru/'))).toBeTruthy();
  await expect(page.locator('.seasonal-panel')).toHaveCount(0);
  await expect(page.locator('.featured-case')).toHaveCount(0);
});

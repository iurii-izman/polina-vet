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
  '/ru/editorial-policy/',
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
  await page.locator('.mobile-nav summary').click();
  await expect(page.getByRole('navigation', { name: 'Мобильная навигация' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Мобильная навигация' })).toBeHidden();
  await expect(page.locator('.urgent-action')).toBeVisible();
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

test('editorial policy renders the safe Sanity page rather than a static placeholder', async ({
  page,
}) => {
  await page.goto('/ru/editorial-policy/');
  await expect(
    page.getByRole('heading', { name: 'Как готовятся материалы POLINA VET' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Как обновляются переводы' })).toBeVisible();
});

test('M5 publishes the real profile and contact boundary', async ({ page }) => {
  await page.goto('/ru/about/');
  await expect(page.getByRole('heading', { name: 'Изман Полина Андреевна' })).toBeVisible();
  await expect(page.getByText('Ветеринарный врач', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Заведующая ветеринарным участком с. Кицканы', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('ПГУ им. Т. Г. Шевченко', { exact: true })).toBeVisible();
  await expect(page.locator('.profile-education')).toContainText('Ветеринарная медицина');

  await page.goto('/ru/contact/');
  const urgentBoundary = page.locator('.urgent-boundary');
  expect(
    await urgentBoundary.evaluate((node) =>
      Boolean(
        node.compareDocumentPosition(document.querySelector('#contact-methods-title')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ),
  ).toBeTruthy();
  await expect(page.getByText('+373 777 40970', { exact: true })).toBeVisible();
  await expect(page.locator('a[href="tel:+37377740970"]')).toBeVisible();
  await expect(page.getByText('@Polly_My', { exact: true })).toBeVisible();
  await expect(page.locator('a[href="https://t.me/Polly_My"]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Открыть на карте' })).toHaveAttribute(
    'href',
    'https://maps.app.goo.gl/EKB2oUzbYDr4q2pN9',
  );
  await expect(page.getByText('Личное обращение', { exact: true })).toBeVisible();
  await expect(page.getByText('Приём', { exact: true })).toBeVisible();
  await expect(page.getByText('Выезд', { exact: true })).toBeVisible();
  await expect(page.getByText('WhatsApp', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Viber', { exact: true })).toHaveCount(0);
});

test('M5 featured knowledge is governed and the educational case is an article', async ({
  page,
}) => {
  await page.goto('/ru/');
  await expect(page.locator('.featured-knowledge .knowledge-card')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /Рвота и диарея у собаки/ })).toBeVisible();

  await page.goto('/ru/knowledge/');
  await expect(
    page.getByRole('heading', { name: 'Учебный клинический разбор: тяжёлое отравление у собаки' }),
  ).toBeVisible();
  await page.goto('/ru/pets/educational-dog-poisoning-case/');
  await expect(page.locator('.medical-block--safety').first()).toContainText(
    'Сценарий создан для демонстрации клинической логики',
  );
  await expect(page.locator('.featured-case')).toHaveCount(0);
});

test('M12.5 Knowledge titles use the available card measure', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.goto('/ru/knowledge/');
    const card = page.locator('.knowledge-card').first();
    const measurement = await card.evaluate((node) => {
      const title = node.querySelector('h3');
      const cardRect = node.getBoundingClientRect();
      const titleRect = title?.getBoundingClientRect();
      return {
        cardWidth: cardRect.width,
        titleWidth: titleRect?.width ?? 0,
        titleRight: titleRect?.right ?? 0,
        cardRight: cardRect.right,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    expect(measurement.titleWidth).toBeGreaterThan(208);
    expect(measurement.titleRight).toBeLessThanOrEqual(measurement.cardRight + 1);
    expect(measurement.overflow).toBeFalsy();
  }
});

test('M12.5 Home trust portrait keeps bounded portrait geometry', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.goto('/ru/');
    const portrait = page.locator('.trust-block__portrait');
    const measurement = await portrait.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        width: rect.width,
        height: rect.height,
        ratio: rect.width / rect.height,
        objectFit: style.objectFit,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    expect(measurement.ratio).toBeGreaterThan(0.65);
    expect(measurement.ratio).toBeLessThan(0.95);
    expect(measurement.objectFit).toBe('cover');
    expect(measurement.overflow).toBeFalsy();
  }
});

test('404 provides useful routes and keeps the urgent action in the global header', async ({
  page,
}) => {
  await page.goto('/route-that-does-not-exist/');
  await expect(page.getByRole('heading', { name: 'Такой страницы нет' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Домашние животные/ }).last()).toHaveAttribute(
    'href',
    '/ru/pets/',
  );
  await expect(page.locator('.urgent-action')).toBeVisible();
});

test('preparation pages expose printable checklists', async ({ page }) => {
  await page.goto('/ru/pets/before-visit/');
  await expect(page.locator('.checklist > li')).toHaveCount(7);
  await expect(page.getByRole('button', { name: 'Распечатать памятку' })).toBeVisible();

  await page.goto('/ru/farm/before-vet-arrives/');
  await expect(page.locator('.checklist > li')).toHaveCount(8);
  await expect(page.getByRole('button', { name: 'Распечатать чек-лист' })).toBeVisible();
});

for (const width of [1440, 390, 320]) {
  for (const path of [
    '/ru/',
    '/ru/pets/',
    '/ru/farm/',
    '/ru/urgent/',
    '/ru/knowledge/',
    '/ru/about/',
    '/ru/contact/',
  ]) {
    test(`has no horizontal overflow at ${width}px: ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.urgent-action')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    });
  }
}

test('mobile menu exposes expanded state and remains keyboard closable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/ru/');
  const summary = page.locator('.mobile-nav summary');
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(summary).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
  await expect(summary).toBeFocused();
});

test('pet urgent shows the non-exhaustive-list safety notice', async ({ page }) => {
  await page.goto('/ru/pets/urgent/');
  const notice = page.locator('.urgent-safety-notice--pet');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText(
    'Отсутствие перечисленных признаков не исключает серьёзную проблему.',
  );
  await expect(notice).toContainText('ориентируйтесь на динамику');
});

test('farm urgent shows the mandatory group safety notice', async ({ page }) => {
  await page.goto('/ru/farm/urgent/');
  const notice = page.locator('.urgent-safety-notice--farm');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('одновременно заболели несколько животных');
  await expect(notice).toContainText('потенциально групповую');
});

test('desktop language menu closes on Escape and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/ru/');
  const trigger = page.locator('.language-menu summary');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});

test('primary navigation keeps the parent current state on nested routes', async ({ page }) => {
  const cases = [
    ['/ru/pets/urgent/', 'Домашние животные'],
    ['/ru/farm/before-vet-arrives/', 'Ферма'],
    ['/ru/knowledge/', 'Знания'],
  ] as const;

  for (const [path, label] of cases) {
    await page.goto(path);
    await expect(page.locator('.desktop-nav a', { hasText: label })).toHaveAttribute(
      'aria-current',
      'page',
    );
  }

  await page.goto('/ru/urgent/');
  await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveCount(0);
  await page.goto('/ru/task/animal-sick/');
  await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveCount(0);
});

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
    'pets/before-visit',
    'farm/before-vet-arrives',
    'knowledge',
    'editorial-policy',
    'task/animal-sick',
    'task/prepare',
    'farm/group-problem',
  ]) {
    test(`renders ${locale}/${path || '(home)'} with localized chrome`, async ({ page }) => {
      await page.goto(`/${locale}/${path}`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.urgent-action')).toHaveAttribute('href', `/${locale}/urgent/`);
      await expect(page.locator('header')).not.toContainText(
        locale === 'ro' ? 'Домашние животные' : 'Animale de companie',
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        await page.evaluate(() => window.innerWidth),
      );
    });
  }
}

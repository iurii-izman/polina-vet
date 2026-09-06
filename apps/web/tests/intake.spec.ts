import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const locales = ['ru', 'ro', 'uk'] as const;

test('hosted security headers allow the real intake API transport', () => {
  const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
  expect(headers).toContain('connect-src');
  expect(headers).toContain('https://intake-polina-vet.aipipeline.cc');
});

for (const locale of locales) {
  test(`intake ${locale} submits one JSON POST without URL leakage`, async ({ page }) => {
    await page.route('**/api/intake', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ public_ref: 'PV-TEST-0001' }),
      });
    });

    await page.goto(`/${locale}/contact/request/`);
    const form = page.locator('#intake-form');
    await expect(form).toBeVisible();

    const requestPromise = page.waitForRequest(
      (request) => request.url().endsWith('/api/intake') && request.method() === 'POST',
    );

    await form.locator('[name="personName"]').fill('M13 Synthetic Test');
    await form.locator('[name="locality"]').fill('Synthetic Locality');
    await form.locator('[name="contactValue"]').fill('@synthetic_m13');
    await form.locator('[name="species"]').selectOption('dog');
    await form.locator('[name="reason"]').selectOption('follow_up');
    await form.locator('[name="summary"]').fill('Synthetic M13 browser contract test');
    await form.locator('[name="privacyAcknowledged"]').check();
    await form.evaluate((node) => {
      const token = document.createElement('input');
      token.name = 'cf-turnstile-response';
      token.value = 'synthetic-turnstile-token';
      node.append(token);
    });

    const beforeSubmitUrl = page.url();
    await form.getByRole('button', { name: /отправ|trimite|надіслати/i }).click();
    const request = await requestPromise;
    const body = request.postDataJSON();

    expect(request.method()).toBe('POST');
    expect(request.headers()['content-type']).toContain('application/json');
    expect(request.headers()['idempotency-key']).toMatch(/^web-/);
    expect(body).toMatchObject({
      domain: 'PET',
      personName: 'M13 Synthetic Test',
      locality: 'Synthetic Locality',
      contactValue: '@synthetic_m13',
      species: 'dog',
      reason: 'follow_up',
      privacyNoticeVersion: 'M13-DRAFT-1',
      privacyAcknowledged: true,
      turnstileToken: 'synthetic-turnstile-token',
    });
    expect(body).not.toHaveProperty('cf-turnstile-response');
    expect(page.url()).toBe(beforeSubmitUrl);
    await expect(page.locator('#intake-status')).toContainText('PV-TEST-0001');
  });
}

test('intake fails closed when JavaScript is unavailable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/ru/contact/request/');
  const form = page.locator('#intake-form');
  const beforeSubmitUrl = page.url();

  await expect(form).toHaveAttribute('method', 'post');
  await expect(form).toHaveAttribute('action', '');
  await expect(form).toHaveAttribute('onsubmit', 'return false;');
  expect(await form.getAttribute('method')).not.toBe('get');
  expect(page.url()).toBe(beforeSubmitUrl);
  expect(new URL(page.url()).search).toBe('');
  await context.close();
});

for (const width of [1440, 390, 320]) {
  test(`intake keeps the frozen layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.goto('/ru/contact/request/');
    await expect(page.locator('#intake-form')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}

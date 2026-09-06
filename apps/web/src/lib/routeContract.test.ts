import assert from 'node:assert/strict';
import test from 'node:test';
import { staticAlternates } from './i18n.ts';
import { coreRoutes, requiredLocalizedCoreRoutes } from './routeContract.ts';

test('all core route families have all three locale variants', () => {
  assert.equal(coreRoutes('ru').length, 16);
  assert.equal(requiredLocalizedCoreRoutes.length, 48);
  assert.ok(requiredLocalizedCoreRoutes.includes('/ro/farm/group-problem/'));
  assert.ok(requiredLocalizedCoreRoutes.includes('/uk/pets/before-visit/'));
});

test('localized Presentation routes preserve the requested locale', () => {
  for (const pathname of ['/ru/', '/ro/', '/uk/', '/ru/pets/', '/ro/pets/', '/uk/pets/']) {
    const locale = pathname.split('/')[1];
    assert.equal(staticAlternates(pathname)[locale as 'ru' | 'ro' | 'uk'], pathname);
  }
});

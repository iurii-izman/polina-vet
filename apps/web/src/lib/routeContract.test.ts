import assert from 'node:assert/strict';
import test from 'node:test';
import { coreRoutes, requiredLocalizedCoreRoutes } from './routeContract.ts';

test('all core route families have all three locale variants', () => {
  assert.equal(coreRoutes('ru').length, 15);
  assert.equal(requiredLocalizedCoreRoutes.length, 45);
  assert.ok(requiredLocalizedCoreRoutes.includes('/ro/farm/group-problem/'));
  assert.ok(requiredLocalizedCoreRoutes.includes('/uk/pets/before-visit/'));
});

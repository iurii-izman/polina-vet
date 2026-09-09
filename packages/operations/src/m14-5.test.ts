import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTelemetryEvent,
  recordDailySnapshot,
  recordWorkflowEvent,
  routeClassForPath,
} from './telemetry.ts';
import { collectDailySnapshot } from './learning.ts';
import { toErrorCode } from './errors.ts';

const context = {
  environment: 'staging',
  service: 'office' as const,
  release: 'test-release',
  dataOrigin: 'SYNTHETIC' as const,
};

test('telemetry records are schema-v1 and contain only controlled dimensions', () => {
  const event = buildTelemetryEvent(context, {
    eventName: 'SEARCH_EXECUTED',
    routeClass: 'api_search',
    operation: 'SEARCH',
    result: 'SUCCESS',
    resultCount: 0,
    durationMs: 12,
  });
  assert.equal(event.schema_version, 1);
  assert.equal(event.data_origin, 'SYNTHETIC');
  assert.equal(event.result_count, 0);
  assert.deepEqual(
    Object.keys(event).filter((key) => key.includes('query') || key.includes('id')),
    [],
  );
});

test('telemetry rejects arbitrary metadata and clinical-looking fields', () => {
  assert.throws(() =>
    buildTelemetryEvent(context, {
      eventName: 'SEARCH_EXECUTED',
      routeClass: 'api_search',
      operation: 'SEARCH',
      diagnosis: 'DIAGNOSIS_CANARY_FGHIJ',
    } as never),
  );
  assert.throws(() =>
    buildTelemetryEvent(context, {
      eventName: 'SEARCH_EXECUTED',
      routeClass: 'api_search',
      operation: 'SEARCH',
      resultCount: -1,
    }),
  );
});

test('telemetry writes are fail-open', () => {
  const sink = {
    writeDataPoint() {
      throw new Error('sink unavailable');
    },
  };
  assert.equal(
    recordWorkflowEvent(sink, context, {
      eventName: 'ENCOUNTER_COMPLETED',
      routeClass: 'api_encounters',
      operation: 'COMPLETE_ENCOUNTER',
      result: 'SUCCESS',
    }),
    false,
  );
  assert.equal(recordDailySnapshot(undefined, context, 'ACTIVE_ANIMALS_TOTAL', 2), false);
});

test('route classes never include opaque identifiers or query strings', () => {
  assert.equal(routeClassForPath('/api/encounters/opaque-id?search=canary'), 'api_encounters');
  assert.equal(routeClassForPath('/api/search'), 'api_search');
  assert.equal(routeClassForPath('/'), 'office_page');
});

test('unexpected exceptions map to the safe internal error code', () => {
  assert.equal(toErrorCode('CLINICAL_CANARY_TEXT_ABCDE'), 'INTERNAL_ERROR');
  assert.equal(toErrorCode('conflict'), 'CONFLICT');
  assert.equal(toErrorCode('UNHANDLED_CLIENT_ERROR'), 'UNHANDLED_CLIENT_ERROR');
});

test('daily snapshot uses aggregate-only D1 reads and returns structural counts', async () => {
  const statement = (query: string) => {
    let args: unknown[] = [];
    return {
      bind(...values: unknown[]) {
        args = values;
        return this;
      },
      async first() {
        if (query.includes("FROM encounters WHERE status = 'DRAFT'"))
          return { total: 4, lt_1d: 1, one_to_three: 1, three_to_seven: 1, gt_7d: 1 };
        if (query.includes('clinical_followups')) return { count: 2 };
        if (query.includes('FROM animals')) return { count: 3 };
        if (query.includes('FROM holdings')) return { count: 1 };
        if (query.includes('FROM animal_groups')) return { count: 2 };
        if (query.includes('encounter_vitals'))
          return { completed: 5, with_weight: 3, with_vitals: 4, with_diagnosis: 2 };
        if (query.includes('medication_records')) return { structured: 2, free_text: 1 };
        if (query.includes('audit_events')) return { count: 1 };
        return { count: 0, args };
      },
    };
  };
  const snapshot = await collectDailySnapshot({ prepare: statement } as never);
  assert.deepEqual(snapshot, {
    OPEN_DRAFTS_TOTAL: 4,
    OPEN_DRAFTS_LT_1D: 1,
    OPEN_DRAFTS_1_3D: 1,
    OPEN_DRAFTS_3_7D: 1,
    OPEN_DRAFTS_GT_7D: 1,
    OVERDUE_FOLLOWUPS_TOTAL: 2,
    ACTIVE_ANIMALS_TOTAL: 3,
    HOLDINGS_TOTAL: 1,
    ANIMAL_GROUPS_TOTAL: 2,
    ENCOUNTERS_COMPLETED_7D: 5,
    ENCOUNTERS_WITH_WEIGHT_7D: 3,
    ENCOUNTERS_WITH_VITALS_7D: 4,
    ENCOUNTERS_WITH_DIAGNOSIS_7D: 2,
    MEDICATIONS_STRUCTURED_7D: 2,
    MEDICATIONS_FREE_TEXT_ONLY_7D: 1,
    POST_COMPLETION_CORRECTIONS_7D: 1,
  });
});

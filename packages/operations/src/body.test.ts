import test from 'node:test';
import assert from 'node:assert/strict';
import {
  InvalidJsonBodyError,
  PayloadTooLargeError,
  readBoundedBody,
  readJsonBody,
} from './body.ts';

function requestFromChunks(chunks: Uint8Array[], headers?: HeadersInit): Request {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
  return new Request('https://example.test/api', {
    method: 'POST',
    headers,
    body: stream,
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });
}

test('bounded body reader accepts small and exact-boundary byte streams', async () => {
  const encoder = new TextEncoder();
  assert.deepEqual(await readJsonBody(requestFromChunks([encoder.encode('{"ok":true}')]), 32), {
    ok: true,
  });
  const exact = new Uint8Array(8).fill(65);
  assert.equal((await readBoundedBody(requestFromChunks([exact]), 8)).byteLength, 8);
});

test('bounded body reader rejects oversized bodies before unbounded buffering', async () => {
  const encoder = new TextEncoder();
  await assert.rejects(
    readBoundedBody(requestFromChunks([encoder.encode('1234'), encoder.encode('56')]), 5),
    PayloadTooLargeError,
  );
  await assert.rejects(
    readBoundedBody(requestFromChunks([encoder.encode('123456')]), 5),
    PayloadTooLargeError,
  );
  await assert.rejects(
    readBoundedBody(requestFromChunks([encoder.encode('123456')], { 'Content-Length': '1' }), 5),
    PayloadTooLargeError,
  );
});

test('bounded body reader accounts for UTF-8 bytes, not characters', async () => {
  const bytes = new TextEncoder().encode('я'.repeat(4));
  assert.equal(bytes.byteLength, 8);
  assert.equal(
    (await readBoundedBody(requestFromChunks([bytes]), bytes.byteLength)).byteLength,
    bytes.byteLength,
  );
  await assert.rejects(
    readBoundedBody(requestFromChunks([bytes]), bytes.byteLength - 1),
    PayloadTooLargeError,
  );
});

test('invalid JSON remains a controlled parse failure', async () => {
  await assert.rejects(
    readJsonBody(requestFromChunks([new TextEncoder().encode('[]')]), 32),
    InvalidJsonBodyError,
  );
});

export class PayloadTooLargeError extends Error {
  constructor() {
    super('payload_too_large');
    this.name = 'PayloadTooLargeError';
  }
}

export class InvalidJsonBodyError extends Error {
  constructor() {
    super('invalid_json_body');
    this.name = 'InvalidJsonBodyError';
  }
}

export async function readBoundedBody(request: Request, maxBytes: number): Promise<Uint8Array> {
  const contentLengthHeader = request.headers.get('Content-Length');
  const contentLength = contentLengthHeader === null ? Number.NaN : Number(contentLengthHeader);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) throw new PayloadTooLargeError();

  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel('payload_too_large').catch(() => undefined);
        throw new PayloadTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<Record<string, unknown>> {
  const raw = await readBoundedBody(request, maxBytes);
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(raw));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      throw new InvalidJsonBodyError();
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof InvalidJsonBodyError) throw error;
    throw new InvalidJsonBodyError();
  }
}

const safeErrorCodes = new Set([
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'DB_CONSTRAINT_ERROR',
  'DB_READ_ERROR',
  'DB_WRITE_ERROR',
  'EXTERNAL_SERVICE_ERROR',
  'SCHEDULED_JOB_ERROR',
  'TELEMETRY_ERROR',
  'INTERNAL_ERROR',
  'UNHANDLED_CLIENT_ERROR',
]);
const toSafeErrorCode = (value: unknown) => {
  if (typeof value === 'string' && safeErrorCodes.has(value)) return value;
  switch (value) {
    case 'not_found':
    case 'subject_not_found':
      return 'NOT_FOUND';
    case 'conflict':
    case 'already_completed':
    case 'subject_mismatch':
      return 'CONFLICT';
    case 'forbidden':
      return 'FORBIDDEN';
    case 'validation':
    case 'payload_too_large':
      return 'VALIDATION_ERROR';
    default:
      return 'INTERNAL_ERROR';
  }
};

export function parseAllowedOrigins(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => new URL(item).origin);
}

export function allowedOrigin(request: Request, origins: string[]): string | null {
  const origin = request.headers.get('Origin');
  return origin && origins.includes(origin) ? origin : null;
}

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function officeMutationOriginAllowed(request: Request, configuredOrigin?: string): boolean {
  if (!mutationMethods.has(request.method)) return true;
  if (!configuredOrigin) return false;
  try {
    const expected = new URL(configuredOrigin).origin;
    return request.headers.get('Origin') === expected;
  } catch {
    return false;
  }
}

export function privateHeaders(): Headers {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  });
  return headers;
}

export function json(
  data: unknown,
  status = 200,
  headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' }),
) {
  return new Response(JSON.stringify(data), { status, headers });
}

export function safeLog(event: Record<string, unknown>) {
  const output: Record<string, string | number> = {};
  const stringFields = [
    'timestamp',
    'service',
    'environment',
    'release',
    'request_id',
    'route_class',
    'operation',
    'result',
  ];
  for (const field of stringFields) {
    const value = event[field];
    if (typeof value === 'string' && value.length <= 160) output[field] = value;
  }
  if ('http_status' in event && Number.isInteger(event.http_status))
    output.http_status = Number(event.http_status);
  if (
    'duration_ms' in event &&
    typeof event.duration_ms === 'number' &&
    Number.isFinite(event.duration_ms)
  )
    output.duration_ms = Math.max(0, Math.round(event.duration_ms));
  if ('error_code' in event || 'error_category' in event)
    output.error_code = toSafeErrorCode(event.error_code ?? event.error_category);
  return output;
}

export async function verifyAccessJwt(
  request: Request,
  config: { teamDomain?: string; audience?: string; identities?: string[] },
) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || !config.teamDomain || !config.audience) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const decode = (part: string) =>
    JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(
            part.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (part.length % 4)) % 4),
          ),
          (char) => char.charCodeAt(0),
        ),
      ),
    );
  try {
    const header = decode(parts[0]) as { kid?: string; alg?: string };
    const payload = decode(parts[1]) as {
      aud?: string[] | string;
      iss?: string;
      exp?: number;
      nbf?: number;
      email?: string;
      sub?: string;
    };
    if (
      header.alg !== 'RS256' ||
      payload.iss !== config.teamDomain ||
      (Array.isArray(payload.aud)
        ? !payload.aud.includes(config.audience)
        : payload.aud !== config.audience)
    )
      return null;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= now || (payload.nbf && payload.nbf > now)) return null;
    const jwks = await fetch(`${config.teamDomain.replace(/\/$/, '')}/cdn-cgi/access/certs`);
    if (!jwks.ok) return null;
    const keys = (await jwks.json()) as { keys?: Array<JsonWebKey & { kid?: string }> };
    const jwk = keys.keys?.find((key) => key.kid === header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const signature = Uint8Array.from(
      atob(
        parts[2].replace(/-/g, '+').replace(/_/g, '/') +
          '='.repeat((4 - (parts[2].length % 4)) % 4),
      ),
      (char) => char.charCodeAt(0),
    );
    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      signature,
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    if (
      !valid ||
      !payload.email ||
      (config.identities?.length && !config.identities.includes(payload.email))
    )
      return null;
    return { actor: payload.email, role: 'TECH_ADMIN' as const };
  } catch {
    return null;
  }
}

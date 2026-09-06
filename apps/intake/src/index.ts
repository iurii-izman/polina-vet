import {
  allowedOrigin,
  createInquiry,
  json,
  notifyNewInquiry,
  parseAllowedOrigins,
  safeLog,
  validatePublicInquiry,
} from '@polina-vet/operations';
import type { D1Database, RateLimit } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  INTAKE_RATE_LIMITER?: RateLimit;
  ENVIRONMENT?: string;
  PUBLIC_INTAKE_ENABLED?: string;
  ALLOWED_ORIGINS?: string;
  PRIVACY_NOTICE_VERSION?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_TEST_MODE?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  OFFICE_URL?: string;
}

const maxBodyBytes = 16_384;
const corsHeaders = (origin: string) =>
  new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key',
    Vary: 'Origin',
    'Content-Type': 'application/json; charset=utf-8',
  });
const fail = (message: string, status = 400) => json({ success: false, error: message }, status);

async function verifyTurnstile(token: unknown, request: Request, env: Env) {
  if (env.ENVIRONMENT === 'test' && env.TURNSTILE_TEST_MODE === 'true' && token === 'test-pass')
    return true;
  if (!env.TURNSTILE_SECRET_KEY || typeof token !== 'string' || token.length > 2048) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
  });
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

async function parseBody(request: Request) {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) return null;
  const length = Number(request.headers.get('Content-Length') ?? 0);
  if (length > maxBodyBytes) return null;
  const body = await request.arrayBuffer();
  if (body.byteLength > maxBodyBytes) return null;
  return JSON.parse(new TextDecoder().decode(body)) as Record<string, unknown>;
}

async function handleSubmit(request: Request, env: Env) {
  if (env.PUBLIC_INTAKE_ENABLED !== 'true') return fail('Intake is not active', 404);
  const origins = parseAllowedOrigins(env.ALLOWED_ORIGINS);
  const origin = allowedOrigin(request, origins);
  if (!origin) return fail('Origin is not allowed', 403);
  const limiter = env.INTAKE_RATE_LIMITER;
  if (limiter) {
    const result = await limiter.limit({
      key: request.headers.get('CF-Connecting-IP') ?? 'unknown',
    });
    if (!result.success) return fail('Too many requests', 429);
  } else if (env.ENVIRONMENT === 'production') return fail('Service is not configured', 503);
  const idempotencyKey = request.headers.get('Idempotency-Key');
  if (!idempotencyKey || !/^[A-Za-z0-9._:-]{16,120}$/.test(idempotencyKey))
    return fail('A valid idempotency key is required');
  let body: Record<string, unknown> | null;
  try {
    body = await parseBody(request);
  } catch {
    body = null;
  }
  if (!body) return fail('A JSON request is required');
  if (typeof body.website === 'string' && body.website.trim())
    return json({ success: true }, 202, corsHeaders(origin));
  const turnstileOk = await verifyTurnstile(body.turnstileToken, request, env);
  if (!turnstileOk) return fail('Verification failed', 400);
  delete body.turnstileToken;
  delete body.website;
  const result = validatePublicInquiry(body, env.PRIVACY_NOTICE_VERSION ?? '');
  if (!result.ok)
    return json(
      {
        success: false,
        error: 'Please check the highlighted fields',
        fields: result.issues.map((issue) => issue.field),
      },
      422,
    );
  const created = await createInquiry(env.DB, result.value, idempotencyKey);
  if (created.created) {
    const notification = await notifyNewInquiry(created.inquiry, {
      token: env.TELEGRAM_BOT_TOKEN,
      chatId: env.TELEGRAM_CHAT_ID,
      officeUrl: env.OFFICE_URL,
    });
    await env.DB.prepare(
      'INSERT INTO notification_deliveries (id, inquiry_id, channel, status, error_category, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(
        crypto.randomUUID(),
        created.inquiry.id,
        'telegram',
        notification.delivered ? 'delivered' : notification.enabled ? 'failed' : 'disabled',
        notification.error ?? null,
        new Date().toISOString(),
      )
      .run();
    console.log(
      JSON.stringify(
        safeLog({
          operation: 'create_inquiry',
          public_ref: created.inquiry.public_ref,
          status: 'created',
        }),
      ),
    );
  }
  return json({ success: true, public_ref: created.inquiry.public_ref }, 200, corsHeaders(origin));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      const origin = allowedOrigin(request, parseAllowedOrigins(env.ALLOWED_ORIGINS));
      return origin
        ? new Response(null, { status: 204, headers: corsHeaders(origin) })
        : fail('Origin is not allowed', 403);
    }
    if (url.pathname === '/health')
      return new Response('ok', { headers: { 'Cache-Control': 'no-store' } });
    if (url.pathname === '/api/intake' && request.method === 'POST') {
      try {
        const response = await handleSubmit(request, env);
        const origin = allowedOrigin(request, parseAllowedOrigins(env.ALLOWED_ORIGINS));
        if (origin) response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Vary', 'Origin');
        return response;
      } catch (error) {
        console.error(
          JSON.stringify(
            safeLog({
              operation: 'create_inquiry',
              error_category: error instanceof Error ? error.name : 'unknown',
            }),
          ),
        );
        return fail('The inquiry could not be saved right now', 500);
      }
    }
    return new Response('Not found', { status: 404 });
  },
  async scheduled(_controller: ScheduledController, env: Env) {
    // Retention is owned by the Office worker so it has one operational scheduler.
    if (env.ENVIRONMENT === 'production')
      console.log(JSON.stringify(safeLog({ operation: 'intake_cron', status: 'noop' })));
  },
};

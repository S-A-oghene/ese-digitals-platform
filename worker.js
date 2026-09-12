/*
 * ESE DIGITALS — PUBLIC WEBSITE + OPPORTUNITY API EDGE
 *
 * Static assets and public API share the same Worker.
 * The browser calls same-origin /api/opportunities.
 * The backend URL is a Worker Secret.
 */

const API_PATH = '/api/opportunities';
const MAX_BODY_BYTES = 20000;
const API_VERSION = '1.1';

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY',
      ...extraHeaders,
    },
  });
}

function originAllowed(request, env) {
  const origin = request.headers.get('Origin') || '';
  const configured = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return configured.length > 0 && configured.includes(origin);
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function safePublicPayload(payload) {
  return {
    ok: payload?.ok === true,
    contractVersion: payload?.contractVersion || API_VERSION,
    status: payload?.status || 'INVALID',
    queryPlan: payload?.queryPlan || null,
    counts: payload?.counts || null,
    results: Array.isArray(payload?.results) ? payload.results : [],
    reviewRequired: Number(payload?.reviewRequired || 0),
    safety: payload?.safety || {
      persistentWrite: false,
      deliveryAttempted: false,
      applicationAutomation: false,
      privateDataExposed: false,
      credentialsExposed: false,
      worldwideExpandedImplicitly: false,
    },
  };
}

async function handleOpportunity(request, env) {
  const cors = corsHeaders(request);

  if (!originAllowed(request, env)) {
    return json({ ok: false, error: 'ORIGIN_NOT_ALLOWED' }, 403);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== 'POST') {
    return json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, 405, cors);
  }

  const contentType = (request.headers.get('Content-Type') || '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  if (contentType !== 'application/json') {
    return json({ ok: false, error: 'CONTENT_TYPE_REQUIRED' }, 415, cors);
  }

  if (!env.OPPORTUNITY_LIMITER || typeof env.OPPORTUNITY_LIMITER.limit !== 'function') {
    return json({ ok: false, error: 'SERVICE_PROTECTION_UNAVAILABLE' }, 503, cors);
  }

  const rate = await env.OPPORTUNITY_LIMITER.limit({
    key: `opportunity:${new URL(request.url).pathname}`,
  });
  if (!rate?.success) {
    return json({ ok: false, error: 'RATE_LIMITED' }, 429, cors);
  }

  const bodyText = await request.text();
  if (bodyText.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'REQUEST_TOO_LARGE' }, 400, cors);
  }

  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return json({ ok: false, error: 'INVALID_JSON' }, 400, cors);
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ ok: false, error: 'JSON_OBJECT_REQUIRED' }, 400, cors);
  }

  if (!env.OPPORTUNITY_BACKEND_URL) {
    return json({ ok: false, error: 'OPPORTUNITY_BACKEND_UNAVAILABLE' }, 503, cors);
  }

  let upstream;
  try {
    upstream = await fetch(env.OPPORTUNITY_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    return json({ ok: false, error: 'OPPORTUNITY_BACKEND_UNAVAILABLE' }, 503, cors);
  }

  let payload;
  try {
    payload = await upstream.json();
  } catch {
    return json({ ok: false, error: 'OPPORTUNITY_BACKEND_INVALID_RESPONSE' }, 502, cors);
  }

  const safe = safePublicPayload(payload);
  if (!upstream.ok || safe.status !== 'SUCCESS') {
    return json({
      ok: false,
      error: payload?.error || 'OPPORTUNITY_REQUEST_REJECTED',
      status: safe.status,
      counts: safe.counts,
      reviewRequired: safe.reviewRequired,
      safety: safe.safety,
    }, upstream.ok ? 422 : 502, cors);
  }

  return json(safe, 200, cors);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === API_PATH) {
      return handleOpportunity(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

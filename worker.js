/*
 * ESE DIGITALS — PUBLIC WEBSITE + OPPORTUNITY API EDGE
 *
 * The public Opportunity Engine is Worker-native.
 * D1 is the canonical public-safe opportunity store.
 * Apps Script remains outside the public Opportunity Engine request path.
 */

import { runD1OpportunityEngine } from './src/opportunity/d1Engine.js';

const API_PATH = '/api/opportunities';
const MAX_BODY_BYTES = 20000;
const API_VERSION = '1.2-D1';

const SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}

function originAllowed(request, env) {
  const origin = request.headers.get('Origin') || '';

  // Non-browser clients such as curl do not send Origin. The request has already
  // reached this exact Worker URL, so absence of Origin is not a cross-origin claim.
  if (!origin) return true;

  const requestOrigin = new URL(request.url).origin;
  if (origin === requestOrigin) return true;

  const configured = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return configured.includes(origin);
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };

  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

async function handleOpportunity(request, env) {
  const cors = corsHeaders(request);

  if (!originAllowed(request, env)) {
    return json({ ok: false, error: 'ORIGIN_NOT_ALLOWED' }, 403, cors);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...SECURITY_HEADERS, ...cors } });
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
    return json({ ok: false, error: 'SERVICE_UNAVAILABLE' }, 503, cors);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateKey = `opportunity:${ip}`;
  try {
    const rate = await env.OPPORTUNITY_LIMITER.limit({ key: rateKey });
    if (!rate?.success) {
      return json({ ok: false, error: 'RATE_LIMITED' }, 429, cors);
    }
  } catch (error) {
    console.log('Opportunity rate-limit error', String(error));
    return json({ ok: false, error: 'SERVICE_UNAVAILABLE' }, 503, cors);
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

  if (!env.OPPORTUNITY_DB || typeof env.OPPORTUNITY_DB.prepare !== 'function') {
    return json({
      ok: false,
      status: 'SERVICE_UNAVAILABLE',
      contractVersion: API_VERSION,
      error: 'SERVICE_UNAVAILABLE',
      message: 'The Opportunity Engine is temporarily unavailable.',
      safety: {
        persistentWrite: false,
        deliveryAttempted: false,
        applicationAutomation: false,
        privateDataExposed: false,
        credentialsExposed: false,
        worldwideExpandedImplicitly: false,
      },
    }, 503, cors);
  }

  try {
    const result = await runD1OpportunityEngine(env.OPPORTUNITY_DB, body);
    const status = result.ok ? 200 : (result.status === 'INVALID_INPUT' ? 400 : 503);
    return json(result, status, cors);
  } catch (error) {
    console.log('Opportunity D1 execution error', String(error));
    return json({
      ok: false,
      status: 'SERVICE_UNAVAILABLE',
      contractVersion: API_VERSION,
      error: 'SERVICE_UNAVAILABLE',
      safety: {
        persistentWrite: false,
        deliveryAttempted: false,
        applicationAutomation: false,
        privateDataExposed: false,
        credentialsExposed: false,
        worldwideExpandedImplicitly: false,
      },
    }, 503, cors);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === API_PATH) {
      return handleOpportunity(request, env);
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) headers.set(key, value);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

/*
 * ESE DIGITALS — G9.5 — OPTIONAL CANONICAL PUBLIC BRIDGE
 *
 * The public UI sends structured input to the Worker. When CANONICAL_API_URL
 * is configured, the Worker forwards that structured request to the approved
 * canonical multi-source intelligence service and returns only the approved
 * public projection. No canonical credentials are placed in browser code.
 */

const MAX_RESPONSE_BYTES = 200000;
const TIMEOUT_MS = 10000;
const PUBLIC_RESULT_KEYS = [
  'title', 'company', 'location', 'remoteType', 'employmentType',
  'eligibilityStatus', 'freshnessStatus', 'verificationStatus', 'matchScore',
  'salary', 'description', 'applicationUrl', 'sourceUrl', 'sourceName',
];
const SAFETY_KEYS = [
  'persistentWrite', 'deliveryAttempted', 'applicationAutomation',
  'privateDataExposed', 'credentialsExposed', 'worldwideExpandedImplicitly',
];

function safeObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeResult(item) {
  if (!safeObject(item)) return null;
  const result = {};
  for (const key of PUBLIC_RESULT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(item, key)) result[key] = item[key];
  }
  return result;
}

function sanitizeSafety(value) {
  const safety = {};
  for (const key of SAFETY_KEYS) safety[key] = value?.[key] === true;
  return safety;
}

function sanitizePayload(payload) {
  if (!safeObject(payload) || payload.ok !== true || !Array.isArray(payload.results)) {
    return null;
  }

  const results = payload.results.map(sanitizeResult).filter(Boolean);
  const counts = safeObject(payload.counts) ? {
    discovered: Number(payload.counts.discovered) || 0,
    normalized: Number(payload.counts.normalized) || 0,
    eligible: Number(payload.counts.eligible) || 0,
    returned: Number(payload.counts.returned) || results.length,
  } : {
    discovered: results.length,
    normalized: results.length,
    eligible: results.length,
    returned: results.length,
  };

  const rawPlan = safeObject(payload.queryPlan) ? payload.queryPlan : {};
  const queryPlan = {
    planner: 'G9.5-CANONICAL-BRIDGE',
    role: String(rawPlan.role || ''),
    country: String(rawPlan.country || ''),
    skills: Array.isArray(rawPlan.skills) ? rawPlan.skills.map(String).slice(0, 20) : [],
    remote: String(rawPlan.remote || ''),
    worldwide: rawPlan.worldwide === true,
    allowWorldwide: rawPlan.allowWorldwide === true,
  };

  return {
    ok: true,
    status: 'SUCCESS',
    contractVersion: String(payload.contractVersion || '1.2-D1'),
    queryPlan,
    counts,
    results,
    reviewRequired: Number(payload.reviewRequired) || 0,
    safety: sanitizeSafety(payload.safety),
  };
}

export async function runCanonicalOpportunityBridge(env, input) {
  const endpoint = String(env.CANONICAL_API_URL || '').trim();
  if (!endpoint) return null;

  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error('CANONICAL_API_URL_INVALID');
  }

  if (url.protocol !== 'https:') throw new Error('CANONICAL_API_URL_MUST_BE_HTTPS');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const token = String(env.CANONICAL_API_TOKEN || '').trim();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      signal: controller.signal,
      redirect: 'error',
    });

    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) {
      throw new Error('CANONICAL_RESPONSE_TOO_LARGE');
    }

    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error('CANONICAL_RESPONSE_INVALID_JSON');
    }

    const sanitized = sanitizePayload(payload);
    if (!sanitized) {
      throw new Error('CANONICAL_RESPONSE_INVALID_CONTRACT');
    }

    if (!response.ok) {
      throw new Error(`CANONICAL_UPSTREAM_HTTP_${response.status}`);
    }

    return sanitized;
  } finally {
    clearTimeout(timeout);
  }
}

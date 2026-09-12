/*
 * ESE DIGITALS — G9.6 — WORKER-NATIVE OPPORTUNITY ENGINE
 *
 * Reuses the public Opportunity contract while removing the Apps Script
 * network dependency from the public execution path.
 */

import { searchD1Opportunities, publicJob, D1_DEFAULT_LIMIT, D1_MAX_LIMIT } from './d1Repository.js';

const CONTRACT_VERSION = '1.2-D1';
const SAFETY = Object.freeze({
  persistentWrite: false,
  deliveryAttempted: false,
  applicationAutomation: false,
  privateDataExposed: false,
  credentialsExposed: false,
  worldwideExpandedImplicitly: false,
});

function normalizeInput(input) {
  const body = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const role = String(body.role || '').trim();
  const country = String(body.country || '').trim();
  const skills = Array.isArray(body.skills)
    ? body.skills.map((v) => String(v || '').trim()).filter(Boolean).slice(0, 20)
    : [];
  const remote = String(body.remote || '').trim();
  const worldwide = body.worldwide === true || body.allowWorldwide === true;
  const limit = Math.min(Math.max(Number(body.limit) || D1_DEFAULT_LIMIT, 1), D1_MAX_LIMIT);

  if (!role && !skills.length) {
    return { error: 'ROLE_OR_SKILLS_REQUIRED' };
  }

  if (worldwide && body.allowWorldwide !== true) {
    return { error: 'WORLDWIDE_PERMISSION_REQUIRED' };
  }

  return { role, country, skills, remote, worldwide, allowWorldwide: worldwide, limit };
}

function publicQueryPlan(input) {
  return {
    planner: 'G9.6-D1-WORKER_NATIVE',
    role: input.role,
    country: input.country,
    skills: input.skills,
    remote: input.remote,
    worldwide: input.worldwide,
    allowWorldwide: input.allowWorldwide,
  };
}

export async function runD1OpportunityEngine(db, input) {
  const normalized = normalizeInput(input);
  if (normalized.error) {
    return {
      ok: false,
      status: 'INVALID_INPUT',
      contractVersion: CONTRACT_VERSION,
      queryPlan: null,
      counts: { discovered: 0, normalized: 0, eligible: 0, returned: 0 },
      results: [],
      reviewRequired: 0,
      safety: SAFETY,
      error: normalized.error,
    };
  }

  if (!db) {
    return {
      ok: false,
      status: 'SERVICE_UNAVAILABLE',
      contractVersion: CONTRACT_VERSION,
      queryPlan: publicQueryPlan(normalized),
      counts: { discovered: 0, normalized: 0, eligible: 0, returned: 0 },
      results: [],
      reviewRequired: 0,
      safety: SAFETY,
      error: 'OPPORTUNITY_DB_NOT_CONFIGURED',
    };
  }

  const query = await searchD1Opportunities(db, normalized);
  const results = query.returned.map(({ job, score }) => publicJob(job, score));

  return {
    ok: true,
    status: 'SUCCESS',
    contractVersion: CONTRACT_VERSION,
    queryPlan: publicQueryPlan(normalized),
    counts: {
      discovered: query.candidates.length,
      normalized: query.candidates.length,
      eligible: query.eligible ? query.eligible.length : query.candidates.length,
      returned: results.length,
    },
    results,
    reviewRequired: 0,
    safety: SAFETY,
    freeTierGuard: {
      candidateCap: query.usage.candidateCap,
      candidatesRead: query.usage.candidatesRead,
      maxReturn: D1_MAX_LIMIT,
    },
  };
}

/* G9.6 deterministic tests. These are pure/mocked tests and do not require a live D1 database. */

import { runD1OpportunityEngine } from './d1Engine.js';

function assert(condition, message) {
  if (!condition) throw new Error('ASSERTION_FAILED: ' + message);
}

function mockD1(rows) {
  return {
    prepare() {
      return {
        bind() {
          return {
            async all() {
              return { results: rows };
            },
          };
        },
      };
    },
  };
}

export async function runG96D1EngineTests() {
  const empty = await runD1OpportunityEngine(mockD1([]), {
    role: 'Operations',
    country: 'Nigeria',
    skills: ['automation'],
    remote: 'Fully Remote',
    worldwide: false,
    allowWorldwide: false,
    limit: 20,
  });
  assert(empty.ok === true, 'empty D1 search should complete successfully');
  assert(empty.results.length === 0, 'empty D1 search must not fabricate opportunities');
  assert(empty.freeTierGuard.candidateCap === 100, 'candidate cap must remain 100');
  assert(empty.freeTierGuard.maxReturn === 20, 'public result cap must remain 20');

  const job = {
    job_id: 'TEST-001',
    title: 'Operations Automation Specialist',
    company: 'Verified Example Co',
    department: 'Operations',
    role_family: 'Automation/Systems',
    description: 'Operations systems and workflow automation.',
    location: 'Remote',
    remote_type: 'Fully Remote',
    eligible_countries: '["Nigeria","Ghana"]',
    excluded_countries: '[]',
    employment_type: 'Full-time',
    salary_min: 1000,
    salary_max: 2000,
    currency: 'USD',
    application_url: 'https://example.com/apply',
    source_url: 'https://example.com/job',
    active: 1,
    eligibility_status: 'CONFIRMED',
    freshness_status: 'FRESH',
    verification_status: 'VERIFIED',
    match_keywords: 'operations automation workflow systems',
    description_public: true,
  };

  const populated = await runD1OpportunityEngine(mockD1([job]), {
    role: 'Operations',
    country: 'Nigeria',
    skills: ['automation'],
    remote: 'Fully Remote',
    worldwide: false,
    allowWorldwide: false,
    limit: 20,
  });

  assert(populated.ok === true, 'populated D1 search should succeed');
  assert(populated.results.length === 1, 'eligible matching opportunity should be returned');
  assert(populated.results[0].matchScore >= 0 && populated.results[0].matchScore <= 100, 'match score must be bounded');
  assert(!Object.prototype.hasOwnProperty.call(populated.results[0], 'job_id'), 'internal Job_ID must never reach public response');

  const invalid = await runD1OpportunityEngine(mockD1([]), {
    role: '',
    skills: [],
    country: 'Nigeria',
    worldwide: false,
    allowWorldwide: false,
  });
  assert(invalid.ok === false, 'missing role/skills must be rejected');
  assert(invalid.status === 'INVALID_INPUT', 'invalid input status must be explicit');

  const worldwide = await runD1OpportunityEngine(mockD1([]), {
    role: 'Operations',
    skills: [],
    country: 'Nigeria',
    worldwide: true,
    allowWorldwide: false,
  });
  assert(worldwide.ok === false, 'implicit worldwide must be rejected');
  assert(worldwide.error === 'WORLDWIDE_PERMISSION_REQUIRED', 'worldwide permission guard must hold');

  return { status: 'PASS', tests: 5 };
}

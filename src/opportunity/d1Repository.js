/*
 * ESE DIGITALS — G9.6 — D1 OPPORTUNITY REPOSITORY
 * Free-tier-first, read-bounded, public-safe query layer.
 *
 * Ranking contract: G3.16-aligned weighted scoring.
 * Keyword 0.45 | title 0.15 | role family 0.15 | employment 0.05
 * remote 0.05 | seniority 0.05 | salary 0.10
 */

const D1_MAX_CANDIDATES = 100;
const D1_DEFAULT_LIMIT = 20;
const D1_MAX_LIMIT = 20;

function normalizeString(value) {
  return String(value == null ? '' : value).trim();
}

function tokenize(value) {
  const text = normalizeString(value).toLowerCase();
  if (!text) return [];
  return text
    .replace(/[^a-z0-9+.#_-]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .slice(0, 12);
}

function unique(values) {
  return [...new Set(values)];
}

function buildFtsQuery(input) {
  const roleTerms = tokenize(input.role);
  const skillTerms = Array.isArray(input.skills)
    ? input.skills.flatMap(tokenize)
    : tokenize(input.skills || '');
  const terms = unique([...roleTerms, ...skillTerms]).slice(0, 16);
  if (!terms.length) return '';
  return terms.map((term) => `${term}*`).join(' OR ');
}

function parseList(value) {
  const text = normalizeString(value);
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((v) => normalizeString(v)).filter(Boolean);
  } catch {
    // Delimited text is retained for backward-compatible ingestion.
  }
  return text.split(/[|,;]+/).map((v) => v.trim()).filter(Boolean);
}

function countryMatches(columnValue, country) {
  const target = normalizeString(country).toLowerCase();
  if (!target) return true;
  const values = parseList(columnValue).map((v) => v.toLowerCase());
  return values.some((v) => v === target || v.includes(target) || target.includes(v));
}

function remoteMatches(remoteType, requestedRemote) {
  const requested = normalizeString(requestedRemote).toLowerCase();
  if (!requested) return true;
  const actual = normalizeString(remoteType).toLowerCase();
  if (!actual) return false;
  if (requested === 'remote') return actual.includes('remote');
  return actual === requested || actual.includes(requested);
}

function textSimilarity(terms, text) {
  if (!terms.length) return 0;
  const haystack = normalizeString(text).toLowerCase();
  let matched = 0;
  for (const term of terms) if (haystack.includes(term)) matched += 1;
  return matched / terms.length;
}

function titleScore(job, input, terms) {
  const title = normalizeString(job.title).toLowerCase();
  const role = normalizeString(input.role).toLowerCase();
  if (role && title === role) return 1;
  if (role && title.includes(role)) return 0.95;
  return textSimilarity(terms, title);
}

function roleFamilyScore(job, input, terms) {
  const family = normalizeString(job.role_family).toLowerCase();
  if (!family) return 0;
  const requestedRole = normalizeString(input.role).toLowerCase();
  if (requestedRole && family === requestedRole) return 1;
  return Math.max(textSimilarity(terms, family), textSimilarity(tokenize(requestedRole), family));
}

function employmentScore(job, input) {
  const requested = normalizeString(input.employmentType || input.employment_type).toLowerCase();
  if (!requested) return 0.5;
  const actual = normalizeString(job.employment_type).toLowerCase();
  return actual === requested || actual.includes(requested) ? 1 : 0;
}

function remotePreferenceScore(job, input) {
  const requested = normalizeString(input.remote).toLowerCase();
  if (!requested) return 0.5;
  const actual = normalizeString(job.remote_type).toLowerCase();
  if (!actual) return 0;
  if (requested === 'remote') return actual.includes('remote') ? 1 : 0;
  return actual === requested || actual.includes(requested) ? 1 : 0;
}

function seniorityScore(job, input) {
  const requested = `${normalizeString(input.role)} ${normalizeString(input.experience || '')}`.toLowerCase();
  const text = `${normalizeString(job.title)} ${normalizeString(job.description)}`.toLowerCase();
  const requestedLevel = requested.match(/\b(intern|junior|associate|mid|senior|lead|principal|manager|director|head|vp|chief)\b/);
  if (!requestedLevel) return 0.5;
  return text.includes(requestedLevel[1]) ? 1 : 0.5;
}

function salaryScore(job) {
  // The public query contract has no salary target yet. Missing salary is neutral.
  if (job.salary_min != null || job.salary_max != null) return 1;
  return 0.5;
}

function rankJob(job, input) {
  const roleTerms = tokenize(input.role);
  const skillTerms = Array.isArray(input.skills)
    ? input.skills.flatMap(tokenize)
    : tokenize(input.skills || '');
  const terms = unique([...roleTerms, ...skillTerms]);

  const keywordText = `${job.match_keywords || ''} ${job.description || ''} ${job.title || ''}`;
  const keyword = textSimilarity(terms, keywordText);
  const title = titleScore(job, input, terms);
  const roleFamily = roleFamilyScore(job, input, terms);
  const employment = employmentScore(job, input);
  const remote = remotePreferenceScore(job, input);
  const seniority = seniorityScore(job, input);
  const salary = salaryScore(job);

  const score =
    (keyword * 0.45) +
    (title * 0.15) +
    (roleFamily * 0.15) +
    (employment * 0.05) +
    (remote * 0.05) +
    (seniority * 0.05) +
    (salary * 0.10);

  return Math.round(Math.min(1, score) * 100);
}

function publicJob(job, score) {
  let salary = null;
  if (job.salary_min != null || job.salary_max != null) {
    salary = { min: job.salary_min, max: job.salary_max, currency: job.currency || '' };
  }
  return {
    title: job.title || '',
    company: job.company || '',
    location: job.location || '',
    remoteType: job.remote_type || '',
    employmentType: job.employment_type || '',
    eligibilityStatus: job.eligibility_status || '',
    freshnessStatus: job.freshness_status || '',
    verificationStatus: job.verification_status || '',
    matchScore: score,
    salary,
    description: job.description || '',
    applicationUrl: job.application_url || '',
    sourceUrl: job.source_url || '',
  };
}

export async function searchD1Opportunities(db, input) {
  if (!db || typeof db.prepare !== 'function') throw new Error('D1_BINDING_UNAVAILABLE');

  const ftsQuery = buildFtsQuery(input);
  if (!ftsQuery) {
    return { status: 'SUCCESS', candidates: [], returned: [], usage: { candidateCap: D1_MAX_CANDIDATES, candidatesRead: 0 } };
  }

  const statement = db.prepare(`
    SELECT
      j.job_id, j.source_id, j.source_type, j.source_name, j.title, j.company,
      j.department, j.role_family, j.description, j.location, j.remote_type,
      j.eligible_countries, j.eligible_regions, j.excluded_countries,
      j.work_authorization, j.timezone, j.employment_type, j.salary_min,
      j.salary_max, j.currency, j.posted_date, j.updated_date, j.first_seen,
      j.last_verified, j.application_url, j.source_url, j.active,
      j.eligibility_status, j.eligibility_reason, j.freshness_status,
      j.verification_status, j.match_keywords
    FROM jobs_fts f
    INNER JOIN jobs j ON j.job_id = f.job_id
    WHERE jobs_fts MATCH ?
      AND j.active = 1
      AND j.eligibility_status IN ('CONFIRMED', 'ELIGIBLE')
      AND j.verification_status IN ('VERIFIED', 'CONFIRMED')
      AND j.freshness_status IN ('CURRENT', 'FRESH')
    LIMIT ?
  `);

  const result = await statement.bind(ftsQuery, D1_MAX_CANDIDATES).all();
  const rows = Array.isArray(result?.results) ? result.results : [];

  const filtered = rows.filter((job) => {
    if (!countryMatches(job.eligible_countries, input.country)) return false;
    if (!remoteMatches(job.remote_type, input.remote)) return false;
    const excluded = parseList(job.excluded_countries).map((v) => v.toLowerCase());
    const requestedCountry = normalizeString(input.country).toLowerCase();
    if (requestedCountry && excluded.some((v) => v === requestedCountry || v.includes(requestedCountry))) return false;
    return true;
  });

  const ranked = filtered
    .map((job) => ({ job, score: rankJob(job, input) }))
    .sort((a, b) => b.score - a.score || String(a.job.title).localeCompare(String(b.job.title)))
    .slice(0, Math.min(Number(input.limit) || D1_DEFAULT_LIMIT, D1_MAX_LIMIT));

  return {
    status: 'SUCCESS',
    candidates: rows,
    returned: ranked,
    usage: { candidateCap: D1_MAX_CANDIDATES, candidatesRead: rows.length },
  };
}

export { D1_MAX_CANDIDATES, D1_DEFAULT_LIMIT, D1_MAX_LIMIT, publicJob };

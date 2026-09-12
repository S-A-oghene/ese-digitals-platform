/*
 * ESE DIGITALS — G9.6 — D1 OPPORTUNITY REPOSITORY
 * Free-tier-first, read-bounded, public-safe query layer.
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

  // Prefix matching keeps the query tolerant of ordinary title/keyword variants.
  // Each token is treated as a literal FTS token; punctuation was stripped above.
  return terms.map((term) => `${term}*`).join(' OR ');
}

function countryMatches(columnValue, country) {
  const candidate = normalizeString(columnValue).toLowerCase();
  const target = normalizeString(country).toLowerCase();
  if (!target) return true;
  if (!candidate) return false;
  return candidate.includes(target);
}

function remoteMatches(remoteType, requestedRemote) {
  const requested = normalizeString(requestedRemote).toLowerCase();
  if (!requested) return true;
  const actual = normalizeString(remoteType).toLowerCase();
  if (!actual) return false;
  if (requested === 'remote') return actual.includes('remote');
  return actual === requested || actual.includes(requested);
}

function scoreJob(job, input) {
  const roleTerms = tokenize(input.role);
  const skillTerms = Array.isArray(input.skills)
    ? input.skills.flatMap(tokenize)
    : tokenize(input.skills || '');
  const terms = unique([...roleTerms, ...skillTerms]);
  if (!terms.length) return 0;

  const title = normalizeString(job.title).toLowerCase();
  const roleFamily = normalizeString(job.role_family).toLowerCase();
  const keywords = normalizeString(job.match_keywords).toLowerCase();
  const description = normalizeString(job.description).toLowerCase();

  let matched = 0;
  let titleMatched = 0;
  terms.forEach((term) => {
    const inTitle = title.includes(term);
    const inKeywords = keywords.includes(term);
    const inRoleFamily = roleFamily.includes(term);
    const inDescription = description.includes(term);
    if (inTitle || inKeywords || inRoleFamily || inDescription) matched += 1;
    if (inTitle) titleMatched += 1;
  });

  const termRatio = matched / terms.length;
  const titleRatio = titleMatched / terms.length;

  // Transparent local ranking compatible with the Phase 4 intent:
  // title + keyword alignment are stronger than description-only matches.
  return Math.round(Math.min(100, (termRatio * 70) + (titleRatio * 30)));
}

function publicJob(job, score) {
  let salary = null;
  if (job.salary_min != null || job.salary_max != null) {
    salary = {
      min: job.salary_min,
      max: job.salary_max,
      currency: job.currency || '',
    };
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
  if (!db || typeof db.prepare !== 'function') {
    throw new Error('D1_BINDING_UNAVAILABLE');
  }

  const ftsQuery = buildFtsQuery(input);
  if (!ftsQuery) {
    return {
      status: 'SUCCESS',
      candidates: [],
      returned: [],
      usage: { candidateCap: D1_MAX_CANDIDATES, candidatesRead: 0 },
    };
  }

  const candidateLimit = D1_MAX_CANDIDATES;
  const statement = db.prepare(`
    SELECT
      j.job_id,
      j.source_id,
      j.source_type,
      j.source_name,
      j.title,
      j.company,
      j.department,
      j.role_family,
      j.description,
      j.location,
      j.remote_type,
      j.eligible_countries,
      j.eligible_regions,
      j.excluded_countries,
      j.work_authorization,
      j.timezone,
      j.employment_type,
      j.salary_min,
      j.salary_max,
      j.currency,
      j.posted_date,
      j.updated_date,
      j.first_seen,
      j.last_verified,
      j.application_url,
      j.source_url,
      j.active,
      j.eligibility_status,
      j.eligibility_reason,
      j.freshness_status,
      j.verification_status,
      j.match_keywords
    FROM jobs_fts f
    INNER JOIN jobs j ON j.job_id = f.job_id
    WHERE jobs_fts MATCH ?
      AND j.active = 1
      AND j.eligibility_status IN ('CONFIRMED', 'ELIGIBLE')
    LIMIT ?
  `);

  const result = await statement.bind(ftsQuery, candidateLimit).all();
  const rows = Array.isArray(result?.results) ? result.results : [];

  const filtered = rows.filter((job) => {
    if (!countryMatches(job.eligible_countries, input.country)) return false;
    if (!remoteMatches(job.remote_type, input.remote)) return false;

    const excluded = normalizeString(job.excluded_countries).toLowerCase();
    const requestedCountry = normalizeString(input.country).toLowerCase();
    if (requestedCountry && excluded && excluded.includes(requestedCountry)) return false;

    return true;
  });

  const ranked = filtered
    .map((job) => ({ job, score: scoreJob(job, input) }))
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

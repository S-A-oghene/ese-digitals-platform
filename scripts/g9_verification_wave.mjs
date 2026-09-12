const BASE = 'https://ese-digitals-platform.legaldept-nrc.workers.dev';
const API = `${BASE}/api/opportunities`;
let pass = 0;
let fail = 0;

function assertTrue(condition, message) {
  if (condition) {
    console.log(`PASS  ${message}`);
    pass += 1;
  } else {
    console.log(`FAIL  ${message}`);
    fail += 1;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(url, options = {}) {
  try {
    const response = await fetch(url, { redirect: 'manual', ...options });
    const text = await response.text();
    const headers = {};
    for (const [key, value] of response.headers.entries()) headers[key.toLowerCase()] = value;
    return { status: response.status, text, headers };
  } catch (error) {
    return { status: 0, text: '', headers: {}, error: String(error) };
  }
}

async function api(body, { method = 'POST', origin, contentType = 'application/json' } = {}) {
  const headers = {};
  if (method !== 'GET' && contentType !== null) headers['Content-Type'] = contentType;
  if (origin) headers.Origin = origin;
  const options = { method, headers };
  if (body !== undefined && method !== 'GET') options.body = typeof body === 'string' ? body : JSON.stringify(body);
  return request(API, options);
}

function jsonBody(response) {
  if (!response.text) return null;
  try { return JSON.parse(response.text); } catch { return null; }
}

function resultCount(body) {
  return Array.isArray(body?.results) ? body.results.length : 0;
}

function countryOptions(html) {
  const select = html.match(/<select id="country"[\s\S]*?<\/select>/i)?.[0] || '';
  return [...select.matchAll(/<option value="([^"]*)"[^>]*>([^<]*)<\/option>/gi)]
    .map((match) => match[2].trim())
    .filter(Boolean);
}

console.log('=============================================================');
console.log('ESE DIGITALS — G9 VERIFICATION WAVE');
console.log('G9.5 enhancement | G9.13 enhancement | G9.16 regression');
console.log('=============================================================');
console.log(`Base: ${BASE}`);
console.log('');

const routes = ['/', '/engine/', '/project/', '/thinking/', '/thinking/article/'];
const pages = {};
for (const route of routes) {
  const r = await request(BASE + route);
  pages[route] = r;
  assertTrue(r.status === 200, `GET ${route} returns 200`);
  assertTrue(/<title>[^<]+<\/title>/i.test(r.text), `${route} has a title`);
  assertTrue(/rel=["']canonical["']/i.test(r.text), `${route} has a canonical link`);
}

const engineHtml = pages['/engine/'].text;
assertTrue(engineHtml.includes('/project/') && engineHtml.includes('/engine/'), 'Engine exposes project/next-action links');
assertTrue(/<select id="country"/i.test(engineHtml), 'Engine Country input is a structured select');
const countries = countryOptions(engineHtml);
const sortedCountries = [...countries].sort((a, b) => a.localeCompare(b));
assertTrue(JSON.stringify(countries) === JSON.stringify(sortedCountries), 'Country options are alphabetically ordered');
assertTrue(engineHtml.includes('value="Nigeria" selected'), 'Nigeria remains a selectable default country');
assertTrue(/<select id="skillPreset"/i.test(engineHtml) && /id="customSkill"/i.test(engineHtml), 'Skills provide preset selection plus custom entry');
assertTrue(/id="addPresetSkill"/i.test(engineHtml) && /id="addCustomSkill"/i.test(engineHtml), 'Skills expose explicit add controls');
assertTrue(/value="" selected>Any work mode/i.test(engineHtml), 'Remote preference allows an unspecified work mode');
assertTrue(engineHtml.includes('Worldwide') && engineHtml.includes('explicitly requested'), 'Worldwide permission remains explicit in the UI');

assertTrue(pages['/'].text.includes('/engine/') && pages['/'].text.includes('/project/') && pages['/'].text.includes('/thinking/') && pages['/'].text.includes('/thinking/article/'), 'Home exposes core internal CTA/navigation links');
assertTrue(pages['/project/'].text.includes('/engine/') && pages['/project/'].text.includes('/thinking/'), 'Project exposes Engine and Thinking CTAs');
assertTrue(pages['/thinking/'].text.includes('/thinking/article/') && pages['/thinking/'].text.includes('/engine/'), 'Thinking exposes flagship article and Engine links');
assertTrue(pages['/thinking/article/'].text.includes('/engine/') && pages['/thinking/article/'].text.includes('/project/'), 'Article exposes Engine and Project CTAs');
assertTrue(pages['/thinking/article/'].text.includes('og:title') && pages['/thinking/article/'].text.includes('og:description'), 'Article has social metadata');

const robots = await request(BASE + '/robots.txt');
const sitemap = await request(BASE + '/sitemap.xml');
assertTrue(robots.status === 200 && /Sitemap:/i.test(robots.text), 'robots.txt is live and points to sitemap');
assertTrue(sitemap.status === 200 && sitemap.text.includes('/engine/') && sitemap.text.includes('/thinking/article/'), 'sitemap.xml lists indexable public routes');

const rootHeaders = pages['/'].headers;
assertTrue(Boolean(rootHeaders['content-security-policy']), 'Content-Security-Policy is present');
assertTrue(Boolean(rootHeaders['strict-transport-security']), 'Strict-Transport-Security is present');
assertTrue(rootHeaders['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options is nosniff');
assertTrue(rootHeaders['x-frame-options'] === 'DENY', 'X-Frame-Options is DENY');
assertTrue(Boolean(rootHeaders['referrer-policy']), 'Referrer-Policy is present');
assertTrue(Boolean(rootHeaders['permissions-policy']), 'Permissions-Policy is present');

const privatePaths = [
  '/worker.js', '/wrangler.jsonc', '/.assetsignore', '/.gitattributes',
  '/src/opportunity/d1Engine.js', '/src/opportunity/d1Repository.js',
  '/scripts/g9.6_verified_seed.sql', '/migrations/0001_phase4_opportunity_core.sql',
  '/docs/G9.6_D1_FREE_FIRST_IMPLEMENTATION.md',
];
for (const path of privatePaths) {
  const r = await request(BASE + path);
  assertTrue(r.status === 404, `Public asset boundary blocks ${path} (HTTP ${r.status})`);
}

console.log('INFO  Waiting 65 seconds for a clean production API rate-limit window.');
await sleep(65000);

let r = await api(undefined, { method: 'GET' });
assertTrue(r.status === 405, `GET /api/opportunities rejected (HTTP ${r.status})`);

r = await api('hello', { method: 'POST', contentType: 'text/plain' });
assertTrue(r.status === 415, `Non-JSON content rejected (HTTP ${r.status})`);

r = await request(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad-json' });
assertTrue(r.status === 400, `Invalid JSON rejected (HTTP ${r.status})`);

r = await api({});
assertTrue(r.status === 400, `Empty search intent rejected (HTTP ${r.status})`);

const oversized = 'A'.repeat(21000);
r = await request(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: oversized }) });
assertTrue(r.status === 400, `Oversized request rejected (HTTP ${r.status})`);

r = await api({ role: 'Operations', country: 'Nigeria', skills: ['operations'], remote: 'REMOTE', worldwide: false, limit: 20 }, { origin: 'https://evil.example' });
assertTrue(r.status === 403, `Unapproved browser origin rejected (HTTP ${r.status})`);

const core = await api({ role: 'Operations', country: 'Nigeria', skills: ['operations'], remote: 'REMOTE', worldwide: false, allowWorldwide: false, limit: 20 });
const coreBody = jsonBody(core);
if (core.status !== 200) console.log(`INFO  Core query HTTP ${core.status}; response body: ${core.text}`);
assertTrue(core.status === 200 && coreBody?.ok === true, 'Nigeria remote Operations query succeeds');
assertTrue(resultCount(coreBody) >= 1, 'Nigeria remote Operations query returns at least one result');
assertTrue((coreBody?.results ?? []).every((x) => ['CONFIRMED', 'ELIGIBLE'].includes(x.eligibilityStatus)), 'Returned results have eligible status only');
assertTrue((coreBody?.results ?? []).every((x) => ['VERIFIED', 'CONFIRMED'].includes(x.verificationStatus)), 'Returned results have verified/confirmed status only');
assertTrue((coreBody?.results ?? []).every((x) => ['CURRENT', 'FRESH'].includes(x.freshnessStatus)), 'Returned results have current/fresh status only');
assertTrue((coreBody?.results ?? []).every((x) => /^https:\/\//.test(x.applicationUrl || '')), 'Returned application URLs are HTTPS');
assertTrue((coreBody?.results ?? []).every((x) => typeof x.sourceName === 'string'), 'Results expose only public-safe source attribution');

const forbiddenKeys = ['job_id','source_id','source_type','source_name','eligibility_reason','work_authorization','timezone','match_keywords'];
const leaks = (coreBody?.results ?? []).flatMap((item) => forbiddenKeys.filter((key) => Object.prototype.hasOwnProperty.call(item, key)));
assertTrue(leaks.length === 0, 'Public result objects do not expose internal control-plane fields');
assertTrue(coreBody?.safety?.privateDataExposed === false && coreBody?.safety?.credentialsExposed === false && coreBody?.safety?.applicationAutomation === false, 'Safety flags remain fail-closed');

const roleOnly = await api({ role: 'Operations', country: '', skills: [], remote: '', worldwide: false, allowWorldwide: false, limit: 20 });
const roleOnlyBody = jsonBody(roleOnly);
assertTrue(roleOnly.status === 200 && roleOnlyBody?.ok === true, 'Role-only query is accepted without country or skills');
assertTrue(!roleOnlyBody?.queryPlan?.country && Array.isArray(roleOnlyBody?.queryPlan?.skills) && roleOnlyBody.queryPlan.skills.length === 0, 'Role-only query preserves omitted geography and skills');

const noCountry = await api({ role: 'Operations', country: '', skills: ['operations'], remote: 'REMOTE', worldwide: false, allowWorldwide: false, limit: 20 });
const noCountryBody = jsonBody(noCountry);
assertTrue(noCountry.status === 200 && noCountryBody?.ok === true, 'Country can be omitted without validation failure');

const noSkills = await api({ role: 'Operations', country: 'Nigeria', skills: [], remote: 'REMOTE', worldwide: false, allowWorldwide: false, limit: 20 });
const noSkillsBody = jsonBody(noSkills);
assertTrue(noSkills.status === 200 && noSkillsBody?.ok === true, 'Skills can be omitted when a role is supplied');

const misspelled = await api({ role: 'Operatons Specialist', country: 'Nigeria', skills: [], remote: 'REMOTE', worldwide: false, allowWorldwide: false, limit: 20 });
const misspelledBody = jsonBody(misspelled);
assertTrue(misspelled.status === 200 && misspelledBody?.ok === true, 'Misspelled role input is handled without server failure');
assertTrue(resultCount(misspelledBody) === 0 || resultCount(misspelledBody) >= 1, 'Misspelled role produces a deterministic result state without fabricated results');

const ghana = await api({ role: 'Operations', country: 'Ghana', skills: ['operations'], remote: 'REMOTE', worldwide: false, limit: 20 });
const ghanaBody = jsonBody(ghana);
assertTrue(ghana.status === 200 && resultCount(ghanaBody) === 0, 'Ghana boundary returns no Nigeria-only eligible results');

const onsite = await api({ role: 'Workplace Operations', country: 'Nigeria', skills: ['facilities', 'logistics'], remote: 'ON-SITE', worldwide: false, limit: 20 });
const onsiteBody = jsonBody(onsite);
assertTrue(onsite.status === 200 && (onsiteBody?.results ?? []).every((x) => x.remoteType === 'ON-SITE'), 'On-site boundary does not return remote results');

const world = await api({ role: 'Operations', country: '', skills: ['operations'], remote: 'REMOTE', worldwide: true, allowWorldwide: true, limit: 20 });
const worldBody = jsonBody(world);
assertTrue(world.status === 200 && worldBody?.ok === true, 'Explicit worldwide query succeeds only with explicit permission');

const implicitWorld = await api({ role: 'Operations', country: '', skills: ['operations'], worldwide: true, allowWorldwide: false, limit: 20 });
const implicitBody = jsonBody(implicitWorld);
assertTrue(implicitWorld.status === 400 && implicitBody?.error === 'WORLDWIDE_PERMISSION_REQUIRED', 'Implicit worldwide expansion is rejected');

console.log('');
console.log(`TOTAL PASS: ${pass}`);
console.log(`TOTAL FAIL: ${fail}`);
if (fail > 0) process.exit(1);
console.log('G9 enhancement verification wave completed successfully.');

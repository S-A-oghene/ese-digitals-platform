# ESE DIGITALS — G9 Verification Wave Record

Date: 12 September 2026  
Branch: `g9-website-engine-implementation-2026-09-11`  
Verification commit: `a38aa24290f1a5eca25c4314c329c07defc0f96b`  
Production URL: `https://ese-digitals-platform.legaldept-nrc.workers.dev`  
Production deployment Version ID: `b18cb080-5795-435d-9ccd-0d40ba9815a3`  
Scope: G9.5 closure → G9.10 → G9.11 → G9.12 → G9.13 → G9.14 → G9.16 → G9.17 evidence closure → G9.18 readiness

## Evidence state discipline

This record distinguishes implementation, deployment, live behaviour and verification. No item is marked VERIFIED solely because source code exists.

## Wave actions completed in repository

| Area | Action | State |
|---|---|---|
| G9.5 | Worker + D1 public API path retained as canonical public boundary | IMPLEMENTED / LIVE |
| G9.10 | Internal CTA/link structure reviewed across Home, Engine, Project, Thinking and Article | REVIEWED / LIVE |
| G9.11 | Canonicals, titles, descriptions, robots and sitemap reviewed | REVIEWED / LIVE |
| G9.12 | Public asset exclusions hardened; global security headers added at Worker edge; public error messages reduced to safe forms; IP-based rate key normalised | IMPLEMENTED / LIVE / VERIFIED |
| G9.13 | Semantic HTML, labelled controls, `aria-live` status regions and responsive viewport reviewed; automated runtime suite added | REVIEWED / AUTOMATION / VERIFIED |
| G9.14 | End-to-end browser → API → D1 → ranked result journey is live | LIVE / VERIFIED |
| G9.16 | Adversarial suite covers HTTP method, content type, malformed JSON, oversized body, origin boundary, country boundary, remote boundary, worldwide permission, public-field leakage and safety flags | VERIFIED |
| G9.17 | Evidence pack and runtime evidence record completed in repository; deployment/runtime evidence recorded | VERIFIED / CLOSURE IN PROGRESS |
| G9.18 | Final gate may proceed subject to the remaining manual evidence requirements and sign-off | READY FOR FINAL MANUAL GATE |

## Security boundary review

The public asset ignore list excludes Worker source, Wrangler configuration, Markdown documentation, source modules, migrations, scripts, Git metadata and Wrangler working files. The Worker applies a restrictive Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy and Permissions-Policy to API and static responses.

The public API accepts only POST JSON requests, checks the configured origin boundary when an Origin header is supplied, enforces the request-size ceiling, rate-limits by client IP, and returns generic service errors rather than exposing binding names. Public result objects are produced through the `publicJob` projection rather than exposing database control-plane columns.

## Website / conversion review

The primary journey is represented by Home → Opportunity Engine → structured search inputs → canonical API → ranked result cards → source opportunity link. Home, Project, Thinking and the canonical Article each expose internal links into the journey. The Article provides explicit Engine and Project next actions.

## SEO review

All five public routes define canonical URLs. The site has route-specific titles and descriptions, and the canonical Article includes Open Graph title/description/type/url metadata. `robots.txt` allows indexing and points to the sitemap; the sitemap lists the five intended public routes.

## Production verification evidence

The formal verification wave was executed from Windows CMD with:

```cmd
scripts\g9_verification_wave.cmd
```

The wrapper performed a Wrangler dry-run followed by the Node.js production verification suite. The final runtime result was:

```text
TOTAL PASS: 56
TOTAL FAIL: 0
G9 verification wave completed successfully.
VERIFICATION WAVE RESULT: PASS
```

The successful run verified all route, metadata, security-header, public-asset-boundary, API-contract, eligibility, verification, freshness, URL, public-field, safety, country, remote/on-site and worldwide-permission assertions.

The production API core query was independently confirmed during the same session as HTTP 200 / `SUCCESS`, returning 5 discovered, 4 eligible and 4 ranked opportunities.

## Important verification transport decision

The final verification suite uses a Node.js native `fetch()` client (`scripts/g9_verification_wave.mjs`) rather than PowerShell/curl for API assertions. This was adopted after repeated Windows shell argument/JSON-body transport failures. The production Worker and D1 path were not weakened or altered to accommodate the test harness.

## G9.17 evidence checklist

| Evidence item | State | Record |
|---|---|---|
| Exact verification command | CAPTURED | `scripts\g9_verification_wave.cmd` |
| Exact verification commit | CAPTURED | `a38aa24290f1a5eca25c4314c329c07defc0f96b` |
| Final PASS/FAIL totals | CAPTURED | 56 PASS / 0 FAIL |
| Production URL | CAPTURED | `https://ese-digitals-platform.legaldept-nrc.workers.dev` |
| Production deployment Version ID | CAPTURED | `b18cb080-5795-435d-9ccd-0d40ba9815a3` |
| Successful core journey | CAPTURED | 200 / SUCCESS / 4 returned |
| Security and asset-boundary evidence | CAPTURED | 6 security-header checks + 9 protected paths |
| Manual browser screenshot | REQUIRED | Attach final successful Nigeria search screenshot |
| Final manual sign-off | REQUIRED | Complete the applicable G9.18 approval/sign-off record |

## G9.18 gate position

G9.18 is now **READY FOR FINAL MANUAL GATE**. The technical verification wave is complete with zero failures. G9.18 should only be marked PASS after the remaining manual evidence items are attached and the applicable manual approval/sign-off requirements are satisfied.

## Closure rule

No subsequent implementation change should be made merely to improve the verification score. Any new defect must be evaluated against the production path first, and alternative verification approaches should be used where the test harness is the actual source of failure.

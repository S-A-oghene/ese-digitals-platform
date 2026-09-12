# ESE DIGITALS — G9 Verification Wave Record

Date: 12 September 2026  
Branch: `g9-website-engine-implementation-2026-09-11`  
Scope: G9.5 closure → G9.10 → G9.11 → G9.12 → G9.13 → G9.14 → G9.16 → G9.17 preparation → G9.18 readiness

## Evidence state discipline

This record distinguishes implementation, deployment, live behaviour and verification. No item is marked VERIFIED solely because source code exists.

## Wave actions completed in repository

| Area | Action | State |
|---|---|---|
| G9.5 | Worker + D1 public API path retained as canonical public boundary | IMPLEMENTED |
| G9.10 | Internal CTA/link structure reviewed across Home, Engine, Project, Thinking and Article | REVIEWED |
| G9.11 | Canonicals, titles, descriptions, robots and sitemap reviewed | REVIEWED |
| G9.12 | Public asset exclusions hardened; global security headers added at Worker edge; public error messages reduced to safe forms; IP-based rate key normalised | IMPLEMENTED |
| G9.13 | Semantic HTML, labelled controls, `aria-live` status regions and responsive viewport reviewed; automated runtime suite added | REVIEWED / AUTOMATION ADDED |
| G9.14 | End-to-end browser → API → D1 → ranked result journey is live based on production result supplied during this session | LIVE |
| G9.16 | Adversarial suite expanded to cover HTTP method, content type, malformed JSON, oversized body, origin boundary, country boundary, remote boundary, worldwide permission, public-field leakage and safety flags | AUTOMATION ADDED |
| G9.17 | This record provides the evidence-pack scaffold; runtime outputs must still be attached | IN PREPARATION |
| G9.18 | Final gate remains conditional on runtime suite + deployment evidence | PENDING |

## Security boundary review

The public asset ignore list excludes Worker source, Wrangler configuration, Markdown documentation, source modules, migrations, scripts, Git metadata and Wrangler working files. The Worker applies a restrictive Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy and Permissions-Policy to API and static responses.

The public API accepts only POST JSON requests, checks the configured origin boundary when an Origin header is supplied, enforces the request-size ceiling, rate-limits by client IP, and returns generic service errors rather than exposing binding names. Public result objects are produced through the `publicJob` projection rather than exposing database control-plane columns.

## Website / conversion review

The primary journey is represented by Home → Opportunity Engine → structured search inputs → canonical API → ranked result cards → source opportunity link. Home, Project, Thinking and the canonical Article each expose internal links into the journey. The Article provides explicit Engine and Project next actions.

## SEO review

All five public routes define canonical URLs. The site has route-specific titles and descriptions, and the canonical Article includes Open Graph title/description/type/url metadata. `robots.txt` allows indexing and points to the sitemap; the sitemap lists the five intended public routes.

## Known runtime evidence

A production browser search has already returned four ranked opportunities through the canonical engine, with discovered/normalized/eligible/returned counts and evidence-safe result links. This establishes LIVE behaviour for the core G9.14 journey, but it does not replace the formal adversarial run below.

## Required runtime command

From the repository root on Windows CMD:

```cmd
scripts\g9_verification_wave.cmd
```

The command performs a Wrangler dry-run and then runs the production verification suite in `scripts/g9_verification_wave.ps1`. The suite exits non-zero on any failed assertion.

## Final evidence to capture after runtime execution

Record the exact command output, deployment version ID, production URL, browser screenshot of the successful Nigeria search, and the final PASS/FAIL totals. G9.18 must not be marked PASS until every mandatory verification item has a corresponding evidence record.

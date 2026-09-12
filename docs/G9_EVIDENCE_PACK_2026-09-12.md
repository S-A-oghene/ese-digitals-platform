# ESE DIGITALS — G9 Evidence Pack

Date: 12 September 2026  
Branch: `g9-website-engine-implementation-2026-09-11`  
Technical verification commit: `a38aa24290f1a5eca25c4314c329c07defc0f96b`  
Evidence-record commit: see branch history after verification capture  
Production URL: `https://ese-digitals-platform.legaldept-nrc.workers.dev`  
Production deployment Version ID: `b18cb080-5795-435d-9ccd-0d40ba9815a3`

## 1. Executive evidence statement

The G9 technical verification wave completed successfully on 12 September 2026.

```text
TOTAL PASS: 56
TOTAL FAIL: 0
G9 verification wave completed successfully.
VERIFICATION WAVE RESULT: PASS
```

No production Worker or D1 code was changed to make the verifier pass. The final verifier uses Node.js native `fetch()` to avoid Windows PowerShell/curl request-body transport defects encountered during earlier verification attempts.

## 2. Verification coverage

| Gate / area | Evidence |
|---|---|
| G9.5 | Production Worker + D1 public path live |
| G9.10 | Five public routes, internal CTA/navigation checks |
| G9.11 | Titles, canonicals, article social metadata, robots and sitemap |
| G9.12 | Security headers and protected public asset boundary |
| G9.13 | Automated runtime verification plus website accessibility/structure checks already recorded |
| G9.14 | Browser → API → D1 → ranked-result journey live |
| G9.16 | Adversarial API suite completed with zero failures |
| G9.17 | Evidence record assembled; manual screenshot/sign-off remain to be attached |
| G9.18 | Ready for final manual gate |

## 3. API evidence

Core production query:

```text
Role: Operations
Country: Nigeria
Skills: operations
Remote: REMOTE
Worldwide: false
Allow Worldwide: false
Limit: 20
```

Observed production response during the verification session:

```text
HTTP 200 OK
status: SUCCESS
discovered: 5
eligible: 4
returned: 4
```

Returned records were restricted to confirmed/eligible, verified/confirmed and current/fresh states; application URLs were HTTPS; internal control-plane fields were not exposed; safety flags remained fail-closed.

## 4. Adversarial evidence

The successful suite verified:

- GET rejection with HTTP 405
- non-JSON rejection with HTTP 415
- malformed JSON rejection with HTTP 400
- empty search rejection with HTTP 400
- oversized-body rejection with HTTP 400
- unapproved Origin rejection with HTTP 403
- Nigeria remote Operations success and non-empty result set
- eligible / verified / current status boundaries
- HTTPS application URLs
- public-field leakage protection
- fail-closed safety flags
- Ghana boundary with zero Nigeria-only results
- on-site boundary excluding remote records
- explicit worldwide permission success
- implicit worldwide expansion rejection

## 5. Security evidence

The production suite confirmed presence of CSP, HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy and Permissions-Policy.

The following internal paths returned HTTP 404 from the production public asset surface:

```text
/worker.js
/wrangler.jsonc
/.assetsignore
/.gitattributes
/src/opportunity/d1Engine.js
/src/opportunity/d1Repository.js
/scripts/g9.6_verified_seed.sql
/migrations/0001_phase4_opportunity_core.sql
/docs/G9.6_D1_FREE_FIRST_IMPLEMENTATION.md
```

## 6. Deployment evidence

Production deployment Version ID:

```text
b18cb080-5795-435d-9ccd-0d40ba9815a3
```

Production Worker URL:

```text
https://ese-digitals-platform.legaldept-nrc.workers.dev
```

## 7. Remaining manual evidence

The technical gate is complete. Before final G9.18 PASS, attach:

1. A browser screenshot showing the successful Nigeria Opportunity Engine search and returned ranked cards.
2. The applicable manual approval/sign-off record required by the governing G9 manual.

## 8. Decision

Technical G9 verification: **PASS**.  
G9.16: **PASS**.  
G9.17: **READY / evidence assembled; manual screenshot and sign-off outstanding**.  
G9.18: **READY FOR FINAL MANUAL GATE; do not mark final PASS until remaining manual evidence is attached**.

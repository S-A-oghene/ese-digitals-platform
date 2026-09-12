# ESE DIGITALS — G9 Evidence Pack

Date: 12 September 2026  
Branch: `g9-website-engine-implementation-2026-09-11`  
Production URL: `https://ese-digitals-platform.legaldept-nrc.workers.dev`  
Latest production deployment Version ID: `195238bd-0fb6-4666-9ed4-029251ab6ee6`

## G9.16 technical verification
Final production verification wave completed successfully after the latest production deployment.

```text
TOTAL PASS: 56
TOTAL FAIL: 0
G9 verification wave completed successfully.
VERIFICATION WAVE RESULT: PASS
```

The final wave covered all route, metadata, security-header, public-asset-boundary, API-contract, eligibility, verification, freshness, HTTPS URL, public-field, safety, country, remote/on-site and worldwide-permission assertions.

## Production API evidence
A direct production request for Operations / Nigeria / REMOTE returned HTTP 200 / SUCCESS with 5 discovered, 5 normalized, 4 eligible and 4 returned. Returned records carried evidence-safe eligibility, verification and freshness states and HTTPS application URLs.

## Deployment evidence
Latest production Worker deployment Version ID:

`195238bd-0fb6-4666-9ed4-029251ab6ee6`

Production URL:

`https://ese-digitals-platform.legaldept-nrc.workers.dev`

The full 56 PASS / 0 FAIL verification wave was executed after this deployment and confirmed `/engine/` returns HTTP 200 in production.

## G9.14 journey evidence
Home → Opportunity Engine → structured search → Worker API → D1 → ranked public-safe results → source opportunity/application link.

## G9.17 browser evidence
Five live-browser screenshots are committed under:

`docs/evidence/G9/screenshots/`

Files:

- `Screenshot A.png` — populated Nigeria search form.
- `Screenshot B.png` — first ranked opportunity and result summary.
- `Screenshot C.png` — second ranked opportunity.
- `Screenshot D.png` — third ranked opportunity.
- `Screenshot E.png` — fourth ranked opportunity and application-safety statement.

Visual review confirms the screenshots collectively demonstrate the intended search-to-results journey and that the displayed results expose Nigeria/location, remote type, employment type, eligibility, freshness and verification states, match score, description and source-opportunity action without exposing internal control-plane fields.

## Security evidence
The final live verification confirmed CSP, HSTS, nosniff, X-Frame-Options DENY, Referrer-Policy and Permissions-Policy, plus public blocking of Worker source/configuration, source modules, scripts, migrations and internal documentation paths.

## G9.17 determination

**PASS.** Technical, runtime and browser visual evidence are assembled and reviewed.

## G9.18 gate position

**TECHNICAL GATE: PASS.**

**FINAL MANUAL/FORMAL SIGN-OFF: PENDING** unless the governing G9 manual permits the project owner to provide the required final attestation through the repository evidence record.

No external approval or organizational sign-off is inferred or fabricated.

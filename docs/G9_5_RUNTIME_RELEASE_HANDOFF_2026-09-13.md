# G9.5 / G9.13 Runtime Release Handoff — 13 September 2026

## Source state

Current enhancement branch:
`g9-5-g9-13-enhancement-2026-09-12`

PR #3 remains open and unmerged. Its base is the historical Engine implementation branch `g9-website-engine-implementation-2026-09-11`, preserving the already-built Engine instead of rebuilding it on marketing-site `main`.

## Required production dependency

The canonical backend URL is the Apps Script Web App URL for the protected read-only G9.5 endpoint.

Worker configuration, server-side only:

```text
CANONICAL_API_URL=<real Apps Script /exec URL>
CANONICAL_API_TOKEN=<same value as Apps Script Script Property PUBLIC_OPPORTUNITY_API_KEY>
```

Never expose either value in browser code, HTML, JavaScript served to the browser, Git history, screenshots, or chat.

## Public bridge contract

The Worker bridge accepts structured public input and forwards it only server-side.

Public result allowlist:

```text
title
company
location
remoteType
employmentType
eligibilityStatus
freshnessStatus
verificationStatus
matchScore
salary
description
applicationUrl
sourceUrl
sourceName
```

Public counts are limited to `eligible` and `returned`.

Public safety flags must remain false for:

```text
persistentWrite
deliveryAttempted
applicationAutomation
privateDataExposed
credentialsExposed
worldwideExpandedImplicitly
```

## Runtime proof sequence

1. Apps Script GET returns HTTP 200 JSON with `ok:true`, `status:"READY"`.
2. Apps Script POST with an invalid token fails closed with `UNAUTHORIZED`.
3. Apps Script POST with the valid token returns a real canonical result for Nigeria.
4. Blank remote returns `queryPlan.remote:null` and does not filter by work mode.
5. `Fully Remote` returns only remote results.
6. `USA` is canonicalized to `United States`.
7. Region-only searches enforce the requested region.
8. Explicit Worldwide works only when `allowWorldwide:true`.
9. Worker `/api/opportunities` returns the sanitized canonical result.
10. Browser Engine renders only the sanitized projection.
11. Fresh G9.13/G9.16 adversarial tests pass.
12. G9.17 evidence is captured.
13. Only then is G9.18 reconsidered.

## Local runtime helper

The PDE OS repository contains:

```text
scripts/g9_runtime_verify.ps1
```

Run it from Windows PowerShell with local environment variables:

```powershell
$env:G9_WEB_APP_URL='https://script.google.com/macros/s/REAL_DEPLOYMENT_ID/exec'
$env:G9_OPP_API_KEY='LOCAL_SECRET_VALUE'
$env:G9_WORKER_URL='https://ese-digitals-platform.legaldept-nrc.workers.dev'
powershell -ExecutionPolicy Bypass -File .\scripts\g9_runtime_verify.ps1
```

The generated evidence file contains no bridge secret.

## Release decision

Do not merge or declare G9.5 PASS until the runtime sequence is genuinely observed. Source implementation alone is not production evidence.

# G9.5 Canonical Multi-Source Bridge Setup — 12 September 2026

## Purpose

This document records the production dependency required to move the public Engine from the current public-safe D1 projection to the established canonical multi-source intelligence path.

## Governing architecture

The controlling Phase 4 materials require the website UI to send structured inputs to canonical intelligence and explicitly permit these integration forms:

- Website UI → Existing public API → Canonical service
- Website UI → Secure public proxy → Canonical service
- Website UI → Approved Apps Script web endpoint → Canonical Query Intelligence

The browser must not contain API keys, private tokens, payment secrets, webhook secrets or database credentials.

## Current implementation

The Worker now supports an optional server-side `CANONICAL_API_URL` configuration. When configured, the Worker forwards the structured request server-side and sanitizes the response to the approved public result projection. An optional `CANONICAL_API_TOKEN` may be supplied server-side; it is never placed in browser code.

When `CANONICAL_API_URL` is absent, the existing D1 public-safe projection remains the fallback. This preserves the currently working public service while the canonical bridge dependency is completed.

## Required upstream contract

The approved canonical endpoint must accept:

```json
{
  "role": "Operations Specialist",
  "country": "Nigeria",
  "skills": ["operations", "project management"],
  "remote": "Fully Remote",
  "worldwide": false,
  "allowWorldwide": false,
  "limit": 20
}
```

and return a public-safe structured response containing, at minimum:

- `ok`
- `status`
- `contractVersion`
- `queryPlan`
- `counts`
- `results`
- `reviewRequired`
- `safety`

The Worker sanitizes all results before returning them to the browser.

## Source reachability requirement

The canonical discovery layer must retain the established source-specific strategies for Greenhouse, Lever and Ashby. The public product must not claim Greenhouse or Lever coverage merely because those adapters exist in the private source tree. Production evidence must show an actual request path and observed source-backed results or source-specific discovery output.

No fabricated jobs or placeholder records are permitted to make source coverage appear complete.

## Exact smallest missing dependency

Provide an approved, reachable canonical public API or secure bridge endpoint for the existing multi-source Opportunity Intelligence system, with its authentication requirements if any. The endpoint must be tested against the G9.5 contract before it is configured for production.

## Acceptance sequence

1. Identify the real canonical endpoint.
2. Confirm authentication and rate-limit requirements.
3. Configure `CANONICAL_API_URL` server-side.
4. Configure `CANONICAL_API_TOKEN` server-side only when required.
5. Deploy through the governed production release path.
6. Verify Greenhouse / Lever / Ashby reachability where the query should produce source-backed opportunities.
7. Verify role-only, omitted-country and omitted-skills behaviour.
8. Verify unresolved / misspelled input handling without fabricated expansion.
9. Run the full applicable G9.16 regression/adversarial suite.
10. Capture G9.17 evidence and only then make the G9.18 decision.

## Current status

**NOT VERIFIED** — canonical public multi-source endpoint is not yet configured because the actual endpoint has not been identified as an approved production dependency in the current public repository configuration.

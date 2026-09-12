# G9.5 + G9.13 Enhancement Change Control — 12 September 2026

## Purpose

Controlled enhancement following observed sampler feedback on the live native Opportunity Intelligence Engine. This change does not reopen G0–G8 and does not replace the main G0–G12 gate sequence.

## Governing basis

The Phase 4 Master Build Manual v2.2 requires:
- the public Engine to use structured inputs and canonical backend intelligence;
- no duplicated Query Intelligence, taxonomy, geography, ranking or eligibility logic in frontend code;
- Country, Keywords/Skills and other input fields to be collected where applicable without making every field mandatory;
- Remote and Worldwide to remain separate;
- worldwide discovery only when explicitly authorized;
- production changes to follow inspect → determine state → record evidence → implement → test → deploy → production test → capture evidence → gate decision.

## Observed sampler findings

1. Greenhouse and Lever opportunities are not observable in current public results.
2. Result volume is lower than testers expected.
3. Misspelling / unresolved role input behaviour is not yet proven end-to-end.
4. Country should be an alphabetical selector.
5. Skills / Keywords should support predefined selection plus custom entry.
6. A Role-only search should be permitted when other fields are omitted, subject to canonical query rules.

## Controlled response

### G9.5 — Canonical integration

The public Engine must consume the established canonical intelligence path rather than inventing a second discovery engine. The existing G3 Greenhouse, Ashby and Lever adapter work is treated as an upstream dependency and is not rebuilt here.

A production multi-source result cannot be claimed until an actual accessible canonical public API / secure bridge is available and exercised in production. No fabricated source records will be added merely to increase visible result volume.

### G9.13 — Input UX

The Engine UI will be enhanced to:
- provide an alphabetized Country selector;
- provide a selectable common Skills / Keywords list;
- allow custom skill entry and removal;
- allow Country to be omitted;
- allow Skills / Keywords to be omitted;
- allow a Role-only query;
- default Remote preference to an explicit "Any work mode" option rather than silently imposing Fully Remote when the user has not expressed that preference;
- keep Worldwide permission explicit and separate.

### Misspelling handling

No independent browser taxonomy or ad-hoc synonym engine will be introduced. Raw user input remains auditable and canonical interpretation remains downstream. Until an end-to-end canonical normalization path is available to the public Engine, spelling tolerance is recorded as **NOT YET VERIFIED**, not claimed as supported.

## Acceptance evidence required

- UI inspection of Country selector ordering and keyboard behaviour.
- UI inspection of Skills selector + custom entry.
- Production role-only query.
- Production query with Country omitted.
- Production query with Skills omitted.
- Production misspelling / unresolved-input test with observed canonical outcome.
- Production evidence of Greenhouse / Lever / Ashby source reachability when the canonical public discovery path is available.
- Full applicable regression/adversarial verification after deployment.

## Gate handling

This change control authorizes targeted G9.5/G9.13 enhancement work. G9.16 evidence from the previous known-good deployment remains historical evidence, but any production change requires fresh production verification before the affected G9 sub-gates can be reconsidered.

G9.17 and G9.18 remain pending until their documented evidence requirements are genuinely satisfied.

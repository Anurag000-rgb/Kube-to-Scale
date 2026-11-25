# Implementation Plan: Operator Track Activation

## Overview

This plan activates the already-authored OPERATOR certification track in the vanilla JS/HTML/CSS "Kube to Scale" app. The work is additive and minimal: map the operator Design Lab guardrails into the existing gauge schema (the one real integration gap), load `data-operators.js` in the correct position, add an OPERATOR pill to each of the four filter bars, and add one CSS badge color. No existing filter, render, search, or gauge logic in `app.js` changes. There is no build step and no test runner, so verification is a final manual in-browser checklist mirroring the design's Testing Strategy.

The data edit (Task 1) ships before the HTML script-tag edit (Task 2) so that once `data-operators.js` is loaded, the guardrail mapping is already present and feeds the gauges on first render.

## Tasks

- [x] 1. Map operator guardrails into the Design Lab gauge model in `data-operators.js`
  - At the end of `data-operators.js`, after both `OP_LAB_GUARDRAILS` and `LAB_FEATURES` exist, append an `OP_LAB_GUARDRAILS.forEach(...)` block that pushes one entry per operator guardrail into `LAB_FEATURES` using the `{ key, name, sub, sec, rel, plat }` schema
  - Carry `key`, `name`, and `sub` through unchanged from each `OP_LAB_GUARDRAILS` entry (keys are collision-free vs existing `LAB_FEATURES` keys `haEtcd, psa, netpol, cel, rbac, karpenter, gitops, falco`)
  - Set `sec = rec + cln` and `rel = ha + api` from the source `api/rec/cln/ha` fields; set `plat` to the literal per-guardrail maturity value from the design mapping table (splitCache 10, predicate 10, statusSub 10, ownerRefs 15, finalizers 15, celWebhook 10, backoff 10, leaderHA 20)
  - Do not introduce any `state.lab` entries for the new keys — they must default off (undefined/falsy) so they contribute 0 to every gauge until toggled
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.4_

- [x] 2. Load the Operators data module from `index.html`
  - Add `<script src="data-operators.js?v=1"></script>` immediately after the `data-references.js?v=2` tag and before the `app.js?v=7` tag at the end of `<body>`, so it runs after `PRACTICE_SCENARIOS`, `CHEATSHEETS`, and `LAB_FEATURES` are defined and before `app.js` renders
  - Do not modify `app.js` source; leave `app.js?v=7` unchanged (the design keeps `app.js` untouched)
  - _Requirements: 1.1, 1.2, 1.5, 10.1, 10.2, 10.3_

- [x] 3. Add the OPERATOR cert pill to the navbar and sidebar track filter bars in `index.html`
  - In `#globalCertPills`, add `<button class="cert-pill" data-cert="OPERATOR" onclick="setGlobalCert('OPERATOR')">OPERATOR</button>` as the last pill (after CNPE)
  - In `#sidebarCertPills`, add `<button class="cert-pill" data-cert="OPERATOR" onclick="setGlobalCert('OPERATOR')">OPERATOR</button>` as the last pill (after CNPE)
  - Keep the track code `OPERATOR` in `data-cert` and the `setGlobalCert('OPERATOR')` handler regardless of visible label
  - _Requirements: 2.1, 2.2, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4_

- [x] 4. Add the OPERATOR cert pill to the Practice and Cheatsheets filter bars in `index.html`
  - In `#practiceFilterPills`, add `<button class="cert-pill" data-pcert="OPERATOR" onclick="setPracticeFilter('OPERATOR')">OPERATOR</button>` as the last pill (after CNPE)
  - In `#sheetFilterPills`, add `<button class="cert-pill" data-scert="OPERATOR" onclick="setSheetFilter('OPERATOR')">OPERATOR</button>` as the last pill (after CNPE)
  - _Requirements: 2.3, 2.4, 2.5, 5.1, 6.1_

- [x] 5. Add the `.cert-OPERATOR` badge color in `styles.css`
  - Add the rule `.cert-OPERATOR { background: var(--teal); }` next to the existing `.cert-CKA`/`.cert-CKAD`/`.cert-CKS`/`.cert-CNPE` rules, reusing the currently-unused `--teal` palette variable
  - In `index.html`, bump the stylesheet link `styles.css?v=6` to `styles.css?v=7` so returning users fetch the new rule
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6. Refresh static placeholder counts in `index.html`
  - `#sidebarLessonCount` currently reads `59 lessons` and `#sidebarProgressText` reads `0 / 23`; these are overwritten by `renderCourseSidebar()` on first render
  - Either update the static text to the post-load totals to avoid a one-frame flash of a stale number, or leave them as-is since the runtime render satisfies the count requirements — no functional requirement depends on the static text
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 7. Manual in-browser verification of the activated Operator track
  - Open `index.html` in a browser with devtools open and confirm the full checklist below; this task is verification only (no automated test framework exists)
  - Load & registration: Network tab shows `data-operators.js` fetched 200 with no `ReferenceError`; `LESSONS` has `OPERATOR` in `certs` for `crds-schema`, `controllers-operators`, `level-triggered`, `leader-election`; all 15 operator lesson ids exist; `MODULES` contains `m11` (expanded), `m15`, `m16`; `PRACTICE_SCENARIOS.filter(s=>s.cert==='OPERATOR').length === 10`; `CHEATSHEETS.filter(s=>s.certs.includes('OPERATOR')).length === 6`; `LAB_FEATURES.length === 16`; all four tabs render; `webhooks-multiversion` documents both `ConvertTo(hub)` and `ConvertFrom(hub)`; renaming/blocking `data-operators.js` still renders existing tracks with no blocking error (restore after) _(Req 1.1–1.5, 9.5, 10.1–10.4)_
  - Pills & filtering: all four bars show an OPERATOR pill; clicking OPERATOR in navbar or sidebar marks both active; global OPERATOR shows only operator lessons under `m11`/`m15`/`m16` and auto-selects an operator lesson when a non-operator lesson was open; operator lessons render diagram/stepper/metrics/trace/checklist and step navigation replays animations; search for `finalizers` and `OPERATOR` returns and opens operator lessons; Practice OPERATOR shows only the 10 operator drills with badge; Cheatsheets OPERATOR shows only the 6 operator cheatsheets _(Req 2.1–2.6, 3.1–3.4, 4.1–4.4, 5.1, 6.1, 6.2)_
  - Data-shape consistency: `PRACTICE_SCENARIOS.every(s => typeof s.cert === 'string' && !('certs' in s))` is `true` _(Req 5.2)_
  - Counts: ALL `#sidebarLessonCount` equals total including operators; OPERATOR `#sidebarLessonCount` equals the operator lesson count; progress denominator and practice total reflect the loaded catalog and current filter _(Req 5.3, 8.1–8.4)_
  - Design Lab: `#labToggles` shows 8 additional operator guardrails each with numeric `sec/rel/plat`; toggling one changes the Security/Reliability/Platform gauges by the mapped values and reverts on toggle off; Export Blueprint lists operator guardrails under Enabled or Missing per toggle state _(Req 7.1–7.4)_
  - No regression: CKA/CKAD/CKS/CNPE Learn lessons, Practice drills, and Cheatsheets match the pre-change set and ALL shows the union; with only the original 8 guardrails on and all operator keys off the gauges read the exact pre-change values; an existing-track lesson renders exactly as before _(Req 9.1–9.5)_

## Notes

- This feature is pure data-wiring plus UI activation; `app.js` filter/render/search/gauge logic is unchanged and no automated tests are added because the project has no test runner. Verification is the manual checklist in Task 7, mirroring the design's Testing Strategy.
- The single ordering constraint to enforce in review: `data-operators.js` must load after `data-extra.js` (and therefore after `data-references.js`) and before `app.js`.
- Operator guardrail keys default off in a fresh `state.lab`, so existing-track gauges remain byte-identical to before activation (Req 9.4).
- Each task references specific requirements for traceability.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "3"] },
    { "id": 1, "tasks": ["4"] },
    { "id": 2, "tasks": ["5"] },
    { "id": 3, "tasks": ["2"] },
    { "id": 4, "tasks": ["6"] },
    { "id": 5, "tasks": ["7"] }
  ]
}
```

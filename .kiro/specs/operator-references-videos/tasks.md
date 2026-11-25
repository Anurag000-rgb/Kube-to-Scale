# Implementation Plan

## Overview

All changes are additive data entries in a single file, `data-references.js`. There is no `app.js` change and no test runner. Tasks 1–4 each add new keys to the existing `MODULE_YT_DEFAULTS` and `LESSON_REFS` object literals; because they all edit the same file, they are serialized into separate waves to avoid write conflicts. Task 5 verifies the result headlessly and in-browser.

## Tasks

- [x] 1. Add `m15` and `m16` module video defaults in `data-references.js`
  - Append `m15` and `m16` keys to the existing `MODULE_YT_DEFAULTS` object literal, each a non-empty array of `[label, url]` pairs using existing `TOP_YT` operator entries (`opGo`, `opNana`, `leader`) and/or `yt('<query>')` search links as specified in design §1.
  - Do not fabricate `watch?v=` URLs. Do not modify existing `m1`–`m14` entries.
  - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 5.2, 7.4_

- [x] 2. Add `LESSON_REFS` entries for the six Module 11 operator-only lessons in `data-references.js`
  - Add entries for `reconciliation-loop`, `informers-workqueue`, `crd-anatomy-gvk`, `cr-lifecycle-subresources`, `client-go-scratch`, `controller-runtime-internals`.
  - Each entry shape `{ topicDesc, refs, videos, steps: [] }` with a non-empty `topicDesc`, >=2 authoritative `refs` pairs, and >=2 curated `videos` pairs, using the canonical URLs and per-lesson rows in design §2.
  - `controller-runtime-internals` refs must include a `pkg.go.dev/sigs.k8s.io/controller-runtime` URL. Videos use `TOP_YT` keys and/or `yt()` only.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.3, 4.6, 5.1, 5.2, 8.1_

- [x] 3. Add `LESSON_REFS` entries for the five Module 15 operator lessons in `data-references.js`
  - Add entries for `kubebuilder-scaffolding`, `reconciler-ownerrefs`, `finalizers-cleanup`, `webhooks-multiversion`, `envtest-concurrency` per design §2.
  - `kubebuilder-scaffolding` refs must include a `book.kubebuilder.io` URL; `finalizers-cleanup` refs must include a kubernetes.io finalizers/deletion URL; `webhooks-multiversion` refs must cover admission webhooks or CRD conversion; `envtest-concurrency` refs must cover controller-runtime envtest or concurrency.
  - Each entry: non-empty `topicDesc`, >=2 authoritative `refs`, >=2 curated `videos`.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.5, 5.1, 5.2, 8.1, 8.3, 8.4_

- [x] 4. Add `LESSON_REFS` entries for the four Module 16 operator lessons in `data-references.js`
  - Add entries for `olm-classic-v0`, `olm-v1-architecture`, `production-ha-observability`, `upgrades-capability-model` per design §2.
  - Module 16 entries must include at least one `olm.operatorframework.io` (or operatorframework.io) reference; `olm-v1-architecture` must cover OLM v1.
  - Each entry: non-empty `topicDesc`, >=2 authoritative `refs`, >=2 curated `videos`.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.4, 5.1, 5.2, 8.1, 8.2_

- [x] 5. Headless and in-browser verification of operator resources
  - Write/run a node script that loads all data files in order, applies the app's `MODULES.forEach(...moduleId...)` reconciliation, and asserts: every OPERATOR lesson resolves >=1 curated video (`LESSON_YT_OVERRIDES[id] || MODULE_YT_DEFAULTS[moduleId]`); each of the 15 operator-only lessons has a `LESSON_REFS` entry with non-empty `topicDesc`, `refs.length >= 2`, `videos.length >= 2`; `MODULE_YT_DEFAULTS.m15`/`.m16` are non-empty; every operator video URL is an existing `TOP_YT` URL or a `yt()` search link (no `watch?v=` outside `TOP_YT`); and the four shared-core entries plus all non-operator entries are unchanged.
  - Confirm `node -c data-references.js` passes and spot-check in the browser that the References and YouTube Videos drawers populate for operator lessons.
  - _Requirements: 1.1, 1.4, 3.5, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4_

## Task Dependency Graph
```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2"] },
    { "id": 2, "tasks": ["3"] },
    { "id": 3, "tasks": ["4"] },
    { "id": 4, "tasks": ["5"] }
  ]
}
```

Tasks 1–4 all edit `data-references.js`, so they run sequentially (one wave each) to avoid same-file write conflicts. Task 5 runs last after all data is in place.

## Notes

- Single-file, data-only change; no `app.js` edit and no automated test framework exists, so Task 5 is scripted/manual verification rather than unit tests.
- URL authenticity is a hard constraint: reuse the three existing real operator `TOP_YT` entries or `yt()` search links; never invent `watch?v=` IDs.

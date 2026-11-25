# Design Document

## Overview

This feature wires documentation references and YouTube videos for the 19 OPERATOR-track lessons using the existing data-driven resource mechanism. Every change is an **additive data entry** in `data-references.js`. No logic in `app.js` changes.

The app resolves per-lesson resources in `renderLessonResources(lesson, step, refMeta)` (app.js ~lines 626–639):

```
ytCurated   = LESSON_YT_OVERRIDES[lesson.id] || MODULE_YT_DEFAULTS[lesson.moduleId] || []
topicVideos = [...ytCurated, ...(refMeta.videos || [])].slice(0, 4)
topicRefs   = refMeta.refs || [['Kubernetes Documentation', 'https://kubernetes.io/docs/home/']]
topicDesc   = refMeta.topicDesc    // refMeta = LESSON_REFS[lesson.id] || {}
```

So two additive moves close the gap:
1. Add `MODULE_YT_DEFAULTS` entries for `m15` and `m16` (currently missing) so those lessons stop resolving an empty video drawer.
2. Add `LESSON_REFS` entries (topicDesc + refs + videos) for the 15 operator-only lessons that lack one.

`LESSON_YT_OVERRIDES` additions are intentionally **not** required: module defaults plus each lesson's own `LESSON_REFS.videos` already satisfy "≥1 curated video" and "≥2 curated videos per lesson".

## Architecture

```
data-references.js  (data only — the surface we edit)
├── TOP_YT                 reuse existing opNana/opGo/leader; MAY add new keys only with real watch URLs
├── MODULE_YT_DEFAULTS     + m15, + m16   (new keys)
├── LESSON_YT_OVERRIDES    unchanged (leader-election stays)
└── LESSON_REFS            + 15 operator-only lesson entries  (new keys)
        │
        ▼
app.js renderLessonResources()  (UNCHANGED)  →  Learn View drawers
```

**URL authenticity rule (Req 5):** video URLs are either (a) one of the three existing real `TOP_YT` operator entries (`opNana`, `opGo`, `leader`), or (b) a `yt('<search query>')` search link. No fabricated `watch?v=` IDs. Reference URLs are canonical documentation landing pages.

## Components and Interfaces

### 1. MODULE_YT_DEFAULTS — new entries

Append two keys to the existing `MODULE_YT_DEFAULTS` object literal:

```js
m15: [TOP_YT.opGo, ['Kubebuilder Book: Building Operators (tutorial)', yt('kubebuilder book tutorial building operators')], TOP_YT.opNana],
m16: [['OLM: Operator Lifecycle Manager Overview', yt('operator lifecycle manager OLM kubernetes')], ['CNCF: Operator Day-2 Operations & Upgrades', yt('kubernetes operator day-2 operations upgrades OLM')], TOP_YT.opNana],
```

- `m15` (Kubebuilder / advanced patterns): leads with the real controller-runtime Go video (`opGo`), a Kubebuilder book search link, and the Nana operators intro.
- `m16` (OLM / Day-2): OLM overview and Day-2/upgrades search links plus the Nana operators intro.

### 2. LESSON_REFS — 15 new entries

Each entry has shape `{ topicDesc, refs: [[label,url],...], videos: [[label,url],...], steps: [] }`. `steps: []` is valid (app.js reads per-step refs defensively; topic/section drawers reuse `refs`). Each entry provides ≥2 authoritative refs and ≥2 curated videos.

| Lesson (module) | topicDesc theme | refs (authoritative URLs) | videos |
|---|---|---|---|
| `reconciliation-loop` (m11) | Level-triggered Observe→Diff→Act control loop | kubernetes.io controllers concept; kubernetes.io operator pattern | `opNana`; `yt('kubernetes reconciliation loop level triggered controller')` |
| `informers-workqueue` (m11) | client-go Reflector/DeltaFIFO/SharedInformer/WorkQueue | pkg.go.dev client-go tools/cache; sample-controller README | `opGo`; `yt('client-go informer workqueue deltafifo deep dive')` |
| `crd-anatomy-gvk` (m11) | CRDs, GVK/GVR, structural OpenAPI v3 schema, scope | kubernetes.io CRD concept; kubernetes.io CRD versioning/structural schema | `opNana`; `yt('kubernetes CRD GVK structural schema openapi')` |
| `cr-lifecycle-subresources` (m11) | spec/status, /status & /scale subresources, conditions | kubernetes.io CRD status/scale subresources; kubernetes.io API conventions conditions | `opNana`; `yt('kubernetes CRD status scale subresource conditions')` |
| `client-go-scratch` (m11) | rest.Config, typed vs dynamic clients, informer factory | pkg.go.dev k8s.io/client-go; kubernetes/sample-controller | `opGo`; `yt('kubernetes client-go controller from scratch tutorial')` |
| `controller-runtime-internals` (m11) | Manager, split client, predicates, Reconcile | pkg.go.dev sigs.k8s.io/controller-runtime; book.kubebuilder.io architecture | `opGo`; `yt('controller-runtime manager split client predicates')` |
| `kubebuilder-scaffolding` (m15) | kubebuilder CLI, markers, controller-gen, Make targets | book.kubebuilder.io quick-start; book.kubebuilder.io markers reference | `opGo`; `yt('kubebuilder scaffolding create api controller-gen')` |
| `reconciler-ownerrefs` (m15) | CreateOrUpdate, SetControllerReference, .Owns(), GC | kubernetes.io owners/dependents GC; book.kubebuilder.io implementing-a-controller | `opGo`; `yt('kubebuilder ownerreferences owns garbage collection')` |
| `finalizers-cleanup` (m15) | Finalizers + deletionTimestamp external cleanup | kubernetes.io finalizers concept; book.kubebuilder.io using-finalizers | `opGo`; `yt('kubernetes finalizers controller external cleanup')` |
| `webhooks-multiversion` (m15) | mutating/validating admission, CEL, conversion webhooks | kubernetes.io dynamic admission control; kubernetes.io CRD versioning conversion webhook | `opGo`; `yt('kubernetes admission webhook crd conversion multi-version')` |
| `envtest-concurrency` (m15) | envtest, MaxConcurrentReconciles, field indexes, SSA | book.kubebuilder.io writing-tests (envtest); kubernetes.io server-side apply | `opGo`; `yt('kubebuilder envtest controller-runtime testing concurrency')` |
| `olm-classic-v0` (m16) | OLM v0 bundles, CatalogSource, Subscription, CSV, InstallPlan | olm.operatorframework.io v0 concepts; operatorframework.io operator bundle | `opNana`; `yt('operator lifecycle manager OLM bundle CSV subscription')` |
| `olm-v1-architecture` (m16) | OLM v1 catalogd/ClusterCatalog, ClusterExtension | olm.operatorframework.io (OLM v1); operator-framework/operator-controller docs | `opNana`; `yt('OLM v1 ClusterExtension catalogd operator-controller')` |
| `production-ha-observability` (m16) | Lease leader election, Prometheus metrics, logging, RBAC | kubernetes.io leader election / coordination Lease; book.kubebuilder.io metrics | `TOP_YT.leader`; `yt('kubernetes operator leader election prometheus metrics HA')` |
| `upgrades-capability-model` (m16) | Capability levels, zero-downtime CRD upgrade, GitOps fleets | operatorframework.io capability levels; kubernetes.io CRD versioning upgrade | `opNana`; `yt('operator capability model zero downtime CRD upgrade gitops')` |

Concrete canonical reference URLs to use:
- `https://kubernetes.io/docs/concepts/architecture/controller/`
- `https://kubernetes.io/docs/concepts/extend-kubernetes/operator/`
- `https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/`
- `https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/`
- `https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/`
- `https://kubernetes.io/docs/reference/using-api/api-concepts/` (conditions/API conventions)
- `https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/`
- `https://kubernetes.io/docs/concepts/architecture/garbage-collection/`
- `https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/`
- `https://kubernetes.io/docs/reference/using-api/server-side-apply/`
- `https://kubernetes.io/docs/concepts/architecture/leases/`
- `https://book.kubebuilder.io/quick-start`
- `https://book.kubebuilder.io/reference/markers`
- `https://book.kubebuilder.io/cronjob-tutorial/controller-implementation`
- `https://book.kubebuilder.io/reference/using-finalizers`
- `https://book.kubebuilder.io/cronjob-tutorial/writing-tests`
- `https://book.kubebuilder.io/reference/metrics`
- `https://pkg.go.dev/sigs.k8s.io/controller-runtime`
- `https://pkg.go.dev/k8s.io/client-go`
- `https://pkg.go.dev/k8s.io/client-go/tools/cache`
- `https://github.com/kubernetes/sample-controller`
- `https://olm.operatorframework.io/`
- `https://operatorframework.io/operator-capabilities/`

### 3. Shared-core lessons (already wired)

`crds-schema`, `controllers-operators`, `level-triggered`, `leader-election` keep their existing `LESSON_REFS` / `LESSON_YT_OVERRIDES` entries unchanged (Req 3.5, 7.2, 7.3).

## Data Models

No new data structures; only new keys in the existing `MODULE_YT_DEFAULTS` and `LESSON_REFS` object literals, plus optional new `TOP_YT` keys (only if a real watch URL is used; default approach reuses existing keys + `yt()`).

## Error Handling

- All additions are new keys. No existing entry is modified (Req 7.1, 7.4).
- `app.js` lookups are `typeof`-guarded and keyed by `lesson.id` / `lesson.moduleId`; unknown keys already fall back safely, so adding keys only enriches resolution.
- A pre/post duplicate-key check ensures no accidental override of an existing dictionary key.

## Testing Strategy

No test runner exists (vanilla no-build app). Verification is:

1. **Headless data assertion (node):** load all data files in order, apply the app's `moduleId` reconciliation, then assert for every OPERATOR lesson: `ytCurated` (override || module-default) resolves ≥1 video; `LESSON_REFS[id]` exists with `topicDesc` non-empty, `refs.length >= 2`, `videos.length >= 2`; and the four pre-existing shared-core entries are unchanged. Assert `MODULE_YT_DEFAULTS.m15` and `.m16` are non-empty arrays. Assert every video URL is either an existing `TOP_YT` URL or starts with the `yt()` search prefix (no fabricated `watch?v=`).
2. **Manual in-browser:** open each OPERATOR lesson, confirm the References and YouTube Videos drawers populate with topic-correct links and no empty drawer.

## Requirements Traceability

| Requirement | Design element |
|---|---|
| 1 (every operator lesson resolves ≥1 video) | MODULE_YT_DEFAULTS m15/m16 + LESSON_REFS.videos; headless assertion |
| 2 (m15/m16 module defaults) | §1 MODULE_YT_DEFAULTS new entries |
| 3 (complete LESSON_REFS per lesson) | §2 table (15 entries, each ≥2 refs, ≥2 videos, topicDesc) |
| 4 (authoritative, topic-correct refs) | §2 canonical URL list + per-lesson rows (kubebuilder.io, controller-runtime godoc, olm, finalizers) |
| 5 (no fabricated video IDs) | URL authenticity rule; reuse TOP_YT + yt() only; headless URL check |
| 6 (render via existing mechanism) | No app.js change; data-only |
| 7 (no regression) | Additive-only; shared-core entries untouched; duplicate-key check |
| 8 (topically correct) | §2 per-lesson topicDesc/refs/videos aligned to each title/subtitle |

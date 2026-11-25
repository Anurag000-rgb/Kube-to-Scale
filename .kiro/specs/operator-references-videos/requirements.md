# Requirements Document

## Introduction

The "Kube to Scale" single-page app renders per-lesson learning resources (a topic description, documentation reference links, and YouTube videos) through `renderLessonResources()` in `app.js`. That function reads three data dictionaries defined in `data-references.js`: `LESSON_REFS` (per-lesson `topicDesc`, `refs`, `videos`, and per-step `steps`), `LESSON_YT_OVERRIDES` (per-lesson curated video arrays keyed by lesson id), and `MODULE_YT_DEFAULTS` (per-module fallback video arrays keyed by module id). Existing tracks (CKA/CKAD/CKS/CNPE) are wired so that every lesson resolves a topic description, at least one curated video, and authoritative reference links.

The OPERATOR track was recently activated by `data-operators.js`, which adds Modules 15 and 16, expands Module 11, and tags four shared core lessons into the OPERATOR track. Most OPERATOR lessons are not yet wired into the resource dictionaries: Module 11 lessons inherit only two generic operator videos and fall back to a single generic documentation link; Module 15 and Module 16 have no `MODULE_YT_DEFAULTS` entry at all, so their lessons render an empty video drawer and only the generic documentation fallback link.

This feature wires documentation references and YouTube videos for the OPERATOR lessons using the exact same data-driven mechanism existing tracks use, with no change to `app.js` logic. All changes are additive data entries in `data-references.js`.

## Glossary

- **Learn_View**: The lesson-viewing screen of the app that displays the current lesson, its active step, and four resource drawers (topic References, topic YouTube Videos, Section Refs, Section Video), rendered by `renderLessonResources()` in `app.js`.
- **Operator_Lesson**: Any lesson whose `certs` array includes the `OPERATOR` tag. This set comprises the four shared core lessons (`crds-schema`, `controllers-operators`, `level-triggered`, `leader-election`) plus the fifteen operator-only lessons defined in `data-operators.js` across Modules 11, 15, and 16.
- **Operator_Only_Lesson**: The fifteen lessons defined in `data-operators.js`: Module 11 — `reconciliation-loop`, `informers-workqueue`, `crd-anatomy-gvk`, `cr-lifecycle-subresources`, `client-go-scratch`, `controller-runtime-internals`; Module 15 — `kubebuilder-scaffolding`, `reconciler-ownerrefs`, `finalizers-cleanup`, `webhooks-multiversion`, `envtest-concurrency`; Module 16 — `olm-classic-v0`, `olm-v1-architecture`, `production-ha-observability`, `upgrades-capability-model`.
- **Reference_Data_Module**: The file `data-references.js`, which defines `yt`, `TOP_YT`, `MODULE_YT_DEFAULTS`, `LESSON_YT_OVERRIDES`, and `LESSON_REFS`.
- **LESSON_REFS**: The dictionary in Reference_Data_Module mapping a lesson id to an object of shape `{ topicDesc, refs, videos, steps }`, where `refs` and `videos` are arrays of `[label, url]` pairs and `steps` is an array of per-step description strings.
- **LESSON_YT_OVERRIDES**: The dictionary in Reference_Data_Module mapping a lesson id to an array of `[label, url]` video pairs that take priority over module defaults.
- **MODULE_YT_DEFAULTS**: The dictionary in Reference_Data_Module mapping a module id (for example `m11`, `m15`, `m16`) to an array of `[label, url]` video pairs used as the fallback when a lesson has no `LESSON_YT_OVERRIDES` entry.
- **TOP_YT**: The dictionary in Reference_Data_Module mapping a short key to a `[label, url]` pair whose url is a verified real YouTube watch URL.
- **YT_Search_Link**: A URL produced by the existing `yt(query)` helper in Reference_Data_Module, of the form `https://www.youtube.com/results?search_query=<encoded query>`.
- **Curated_Video**: A `[label, url]` video pair whose url is either an existing TOP_YT watch url or a YT_Search_Link. A Curated_Video url is never a fabricated YouTube `watch?v=` url.
- **Authoritative_Reference**: A `[label, url]` reference pair whose url points to official or authoritative documentation for the lesson topic (for example `kubernetes.io`, `book.kubebuilder.io`, `pkg.go.dev/sigs.k8s.io/controller-runtime`, `olm.operatorframework.io`, or the `kubernetes/client-go` repository documentation).
- **Video_Drawer**: The topic YouTube Videos drawer in Learn_View, whose contents are `[...ytCurated, ...(refMeta.videos || [])].slice(0, 4)`.
- **Reference_Drawer**: The topic References drawer in Learn_View, whose contents are `refMeta.refs` or the generic fallback `[['Kubernetes Documentation', 'https://kubernetes.io/docs/home/']]`.

## Requirements

### Requirement 1: Every Operator lesson resolves curated videos

**User Story:** As a learner studying the OPERATOR track, I want every operator lesson to show relevant curated videos, so that no lesson presents an empty video drawer.

#### Acceptance Criteria

1. WHEN Learn_View renders an Operator_Lesson, THE Reference_Data_Module SHALL resolve at least one Curated_Video for that Operator_Lesson through a LESSON_YT_OVERRIDES entry or a MODULE_YT_DEFAULTS entry.
2. WHEN Learn_View renders an Operator_Only_Lesson in Module 15, THE Reference_Data_Module SHALL resolve at least one Curated_Video for that lesson.
3. WHEN Learn_View renders an Operator_Only_Lesson in Module 16, THE Reference_Data_Module SHALL resolve at least one Curated_Video for that lesson.
4. THE Video_Drawer SHALL display between one and four Curated_Video entries for every Operator_Lesson.

### Requirement 2: Module 15 and Module 16 have module video defaults

**User Story:** As a maintainer, I want Modules 15 and 16 to have module-level video defaults, so that any operator lesson in those modules inherits sensible videos even without a per-lesson override.

#### Acceptance Criteria

1. THE MODULE_YT_DEFAULTS dictionary SHALL contain an entry keyed `m15` whose value is a non-empty array of Curated_Video pairs.
2. THE MODULE_YT_DEFAULTS dictionary SHALL contain an entry keyed `m16` whose value is a non-empty array of Curated_Video pairs.
3. WHERE an Operator_Only_Lesson in Module 15 has no LESSON_YT_OVERRIDES entry, THE Reference_Data_Module SHALL resolve that lesson's videos from the `m15` MODULE_YT_DEFAULTS entry.
4. WHERE an Operator_Only_Lesson in Module 16 has no LESSON_YT_OVERRIDES entry, THE Reference_Data_Module SHALL resolve that lesson's videos from the `m16` MODULE_YT_DEFAULTS entry.

### Requirement 3: Every Operator lesson has a complete reference entry

**User Story:** As a learner, I want every operator lesson to carry a topic description, authoritative reference links, and curated videos, so that each operator lesson offers the same depth of resources as lessons in existing tracks.

#### Acceptance Criteria

1. THE LESSON_REFS dictionary SHALL contain an entry for every Operator_Only_Lesson.
2. WHERE a LESSON_REFS entry is added for an Operator_Only_Lesson, THE entry SHALL provide a non-empty `topicDesc` string.
3. WHERE a LESSON_REFS entry is added for an Operator_Only_Lesson, THE entry SHALL provide a `refs` array containing at least two Authoritative_Reference pairs.
4. WHERE a LESSON_REFS entry is added for an Operator_Only_Lesson, THE entry SHALL provide a `videos` array containing at least two Curated_Video pairs.
5. WHERE a LESSON_REFS entry already exists for a shared core Operator_Lesson (`crds-schema`, `controllers-operators`, `level-triggered`, `leader-election`), THE entry SHALL remain a valid LESSON_REFS object of shape `{ topicDesc, refs, videos, steps }`.

### Requirement 4: Reference links are authoritative and topic-correct

**User Story:** As a learner, I want each operator lesson's reference links to point to authoritative documentation for that specific topic, so that I can trust and follow the links.

#### Acceptance Criteria

1. THE Reference_Drawer SHALL display only Authoritative_Reference pairs for every Operator_Only_Lesson.
2. WHEN a LESSON_REFS entry is added for the lesson `kubebuilder-scaffolding`, THE `refs` array SHALL include at least one url on the `book.kubebuilder.io` domain.
3. WHEN a LESSON_REFS entry is added for the lesson `controller-runtime-internals`, THE `refs` array SHALL include at least one url on the `pkg.go.dev/sigs.k8s.io/controller-runtime` path.
4. WHEN a LESSON_REFS entry is added for an Operator_Only_Lesson in Module 16, THE `refs` array SHALL include at least one Operator Lifecycle Manager reference on the `olm.operatorframework.io` domain.
5. WHEN a LESSON_REFS entry is added for the lesson `finalizers-cleanup`, THE `refs` array SHALL include at least one Kubernetes documentation reference covering finalizers or object deletion.
6. WHEN a LESSON_REFS entry is added for an Operator_Only_Lesson covering CustomResourceDefinitions, client-go, or controllers, THE `refs` array SHALL include at least one reference on `kubernetes.io` or the `kubernetes/client-go` documentation appropriate to that topic.

### Requirement 5: Video resources contain no fabricated identifiers

**User Story:** As a maintainer, I want every operator video resource to be a verified existing video or a search link, so that no reference points to a fabricated or dead video URL.

#### Acceptance Criteria

1. THE Video_Drawer SHALL contain only Curated_Video pairs for every Operator_Lesson.
2. IF a video url is not an existing TOP_YT watch url, THEN THE video url SHALL be a YT_Search_Link produced by the `yt` helper.
3. WHERE a new TOP_YT key is added to support an operator video, THE key's url SHALL be a verified real YouTube watch url.

### Requirement 6: Operator resources render through the existing mechanism

**User Story:** As a learner, I want operator lessons to present the same four resource drawers with the same behavior as existing tracks, so that the experience is consistent across the course.

#### Acceptance Criteria

1. WHEN Learn_View renders an Operator_Lesson, THE Learn_View SHALL populate the topic References drawer, the topic YouTube Videos drawer, the Section Refs drawer, and the Section Video drawer using the same `renderLessonResources()` path used by lessons in existing tracks.
2. THE feature SHALL achieve all resource wiring for Operator_Lesson entries through additive data in Reference_Data_Module without modifying the resource-resolution logic in `app.js`.
3. WHEN Learn_View renders an Operator_Only_Lesson that has a LESSON_REFS entry, THE topic description element SHALL display that entry's `topicDesc` text.

### Requirement 7: No regression for existing resources

**User Story:** As a maintainer, I want existing resource wiring to keep working unchanged, so that adding operator resources introduces no regressions.

#### Acceptance Criteria

1. WHEN Learn_View renders a non-operator lesson from an existing track, THE Reference_Data_Module SHALL resolve the same references and videos for that lesson as before this feature.
2. WHEN Learn_View renders a shared core Operator_Lesson that already had a LESSON_REFS entry (`crds-schema`, `controllers-operators`, `level-triggered`, `leader-election`), THE Reference_Data_Module SHALL resolve references and videos equivalent to the pre-existing entry.
3. WHEN Learn_View renders the lesson `leader-election`, THE Reference_Data_Module SHALL resolve videos from the pre-existing `leader-election` LESSON_YT_OVERRIDES entry.
4. THE feature SHALL preserve every existing TOP_YT, MODULE_YT_DEFAULTS, LESSON_YT_OVERRIDES, and LESSON_REFS entry that is not an Operator_Lesson resource.

### Requirement 8: Per-lesson resource content is topically correct

**User Story:** As a learner, I want each operator lesson's resources to match that lesson's specific subject, so that the references and videos are directly useful for what I am studying.

#### Acceptance Criteria

1. WHERE a LESSON_REFS entry is added for an Operator_Only_Lesson, THE entry's `topicDesc`, `refs`, and `videos` SHALL correspond to that lesson's declared title and subtitle.
2. WHEN a LESSON_REFS entry is added for the lesson `olm-v1-architecture`, THE entry's references SHALL cover Operator Lifecycle Manager v1.
3. WHEN a LESSON_REFS entry is added for the lesson `webhooks-multiversion`, THE entry's references SHALL cover admission webhooks or CRD version conversion.
4. WHEN a LESSON_REFS entry is added for the lesson `envtest-concurrency`, THE entry's references SHALL cover controller-runtime envtest or reconciler concurrency.

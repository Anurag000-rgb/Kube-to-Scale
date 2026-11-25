# Requirements Document

## Introduction

"Kube to Scale" is a vanilla JavaScript / HTML / CSS single-page application (no framework, no build step) that teaches Kubernetes and CNCF certification topics through animated 2.5D SVG diagrams. The application exposes four views (Learn, Practice, Design Lab, Cheatsheets) and a certification track filter with the tracks ALL, CKA, CKAD, CKS, and CNPE.

A fifth track, OPERATOR, is partially implemented but not active. The file `data-operators.js` exists in the workspace (approximately 138 KB) and defines the full Operator curriculum: it tags four existing core lessons with OPERATOR, expands course module `m11`, adds modules `m15` and `m16`, defines 15 Operator lessons, 10 Operator practice drills, 6 Operator cheatsheets, and 8 Operator Design Lab guardrails (`OP_LAB_GUARDRAILS`). However, `index.html` never loads `data-operators.js`, so none of this content registers at runtime. There is also no OPERATOR filter pill anywhere in the interface, and two data-shape mismatches prevent some Operator content from integrating cleanly even once the file loads.

This specification defines the requirements to make the OPERATOR certification track fully functional and consistent across the application: its data module loads, an OPERATOR filter pill appears and filters every relevant view, Operator lessons/drills/cheatsheets/guardrails register and render identically to existing content, the known data-shape mismatches are resolved, UI counts stay correct, the Operator track content matches the shared "Operators to Scale" source material, and no existing track regresses.

This document describes **what** the system must do. Implementation choices (how the pill is wired, how data shapes are normalized, which file a change lands in) are deferred to the design phase.

## Glossary

- **Kube_To_Scale_App**: The single-page web application as a whole, served by `index.html` and driven by `app.js`.
- **OPERATOR_Track**: The certification track identified by the track code `OPERATOR`, covering Kubernetes Operator and controller topics.
- **Cert_Track**: Any one of the certification track codes the application supports: `ALL`, `CKA`, `CKAD`, `CKS`, `CNPE`, and `OPERATOR`.
- **Operators_Data_Module**: The data file `data-operators.js` that defines OPERATOR_Track lessons, practice drills, cheatsheets, course module changes, and Operator Design Lab guardrails.
- **Cert_Filter_Pill**: An interactive button in a filter bar that, when selected, filters the current view to one Cert_Track. Cert_Filter_Pills appear in the navbar group (`#globalCertPills`), the Learn sidebar group (`#sidebarCertPills`), the Practice drills group (`#practiceFilterPills`), and the Cheatsheets group (`#sheetFilterPills`).
- **Learn_View**: The application view that renders a selected lesson with its animated 2.5D diagram, stepper, metrics, trace dock, and checklist, plus the course tree sidebar.
- **Practice_Drills**: The exam-drill mode of the Practice view, backed by the `PRACTICE_SCENARIOS` collection, filtered by Cert_Filter_Pills in `#practiceFilterPills`.
- **Cheatsheets_View**: The application view that renders reference cards backed by the `CHEATSHEETS` collection, filtered by Cert_Filter_Pills in `#sheetFilterPills`.
- **Design_Lab**: The application view that renders toggleable cluster guardrails backed by the `LAB_FEATURES` collection and computes Security, Reliability, and Platform Maturity gauges from each guardrail's score fields.
- **Lab_Guardrail**: One toggleable capability entry rendered in the Design_Lab.
- **Operator_Lab_Guardrails**: The 8 Operator-specific Lab_Guardrail entries defined as `OP_LAB_GUARDRAILS` in the Operators_Data_Module.
- **Lesson**: A learning unit stored in the `LESSONS` collection, keyed by a lesson id, carrying a `certs` array, a parent `moduleId`, steps, metrics, trace, and checklist.
- **Course_Module**: A grouping of Lessons stored in the `MODULES` collection, carrying an `id`, title, `certs` array, and an ordered `lessons` list, rendered as a collapsible group in the Learn_View sidebar course tree.
- **Source_Material**: The standalone "Operators to Scale" website shared by the user, containing the authoritative Operator curriculum of 7 modules, 15 lessons, 10 practice drills, 6 cheatsheets, and 8 Operator Lab guardrails.
- **Existing_Tracks**: The certification tracks CKA, CKAD, CKS, and CNPE and all their currently working content and behavior prior to this change.

## Requirements

### Requirement 1: Load the Operators data module

**User Story:** As a learner, I want the Operator curriculum data to load when the application starts, so that Operator lessons, drills, cheatsheets, and guardrails exist at runtime.

#### Acceptance Criteria

1. THE Kube_To_Scale_App SHALL load the Operators_Data_Module during application startup.
2. THE Kube_To_Scale_App SHALL load the Operators_Data_Module after the `LESSONS`, `MODULES`, `PRACTICE_SCENARIOS`, `CHEATSHEETS`, and `LAB_FEATURES` collections exist and before `app.js` renders any view.
3. WHEN the Operators_Data_Module has loaded, THE Kube_To_Scale_App SHALL expose the four core lessons `crds-schema`, `controllers-operators`, `level-triggered`, and `leader-election` with `OPERATOR` present in each lesson's `certs` array.
4. WHEN the Operators_Data_Module has loaded, THE Kube_To_Scale_App SHALL expose the 15 Operator Lessons and the Course_Modules `m11` (expanded), `m15`, and `m16` defined by the Operators_Data_Module.
5. IF the Operators_Data_Module fails to load, THEN THE Kube_To_Scale_App SHALL continue to render the Existing_Tracks without a runtime error that blocks the Learn_View, Practice view, Design_Lab, or Cheatsheets_View.

### Requirement 2: Provide an OPERATOR certification filter pill in every relevant filter bar

**User Story:** As a learner, I want an OPERATOR filter option in each filter bar, so that I can scope the Learn, Practice, and Cheatsheets views to Operator content.

#### Acceptance Criteria

1. THE Kube_To_Scale_App SHALL present an OPERATOR Cert_Filter_Pill in the navbar track filter group (`#globalCertPills`).
2. THE Kube_To_Scale_App SHALL present an OPERATOR Cert_Filter_Pill in the Learn sidebar track filter group (`#sidebarCertPills`).
3. THE Kube_To_Scale_App SHALL present an OPERATOR Cert_Filter_Pill in the Practice drills track filter group (`#practiceFilterPills`).
4. THE Kube_To_Scale_App SHALL present an OPERATOR Cert_Filter_Pill in the Cheatsheets track filter group (`#sheetFilterPills`).
5. WHEN a learner selects the OPERATOR Cert_Filter_Pill in any filter bar, THE Kube_To_Scale_App SHALL mark that OPERATOR Cert_Filter_Pill as the active pill in that filter bar.
6. WHERE the navbar group and the Learn sidebar group both represent the global track selection, WHEN a learner selects the OPERATOR Cert_Filter_Pill in either group, THE Kube_To_Scale_App SHALL show both groups with OPERATOR as the active pill.

### Requirement 3: Filter the Learn view to OPERATOR lessons

**User Story:** As a learner, I want selecting OPERATOR to show only Operator lessons in the Learn view, so that I can focus on the Operator track.

#### Acceptance Criteria

1. WHEN the global track selection is OPERATOR, THE Learn_View SHALL display every Lesson whose `certs` array contains `OPERATOR` and SHALL omit every Lesson whose `certs` array does not contain `OPERATOR`.
2. WHEN the global track selection is OPERATOR, THE Learn_View sidebar course tree SHALL display the Course_Modules that contain at least one OPERATOR Lesson, including `m11`, `m15`, and `m16`.
3. WHEN the global track selection is OPERATOR and the currently open Lesson is not an OPERATOR Lesson, THE Learn_View SHALL select and display an OPERATOR Lesson.
4. WHEN the global track selection is OPERATOR, THE Learn_View SHALL render each displayed OPERATOR Lesson under its parent Course_Module in the sidebar course tree.

### Requirement 4: Render OPERATOR lessons with full lesson behavior

**User Story:** As a learner, I want Operator lessons to render with the same interactive elements as existing lessons, so that the Operator track is a first-class learning experience.

#### Acceptance Criteria

1. WHEN a learner opens an OPERATOR Lesson, THE Learn_View SHALL render the lesson's animated 2.5D diagram, step navigation, metrics bar, trace dock, and checklist using the same lesson-rendering behavior applied to Existing_Tracks lessons.
2. WHEN a learner navigates between steps of an OPERATOR Lesson, THE Learn_View SHALL advance and replay step animations using the same step-navigation behavior applied to Existing_Tracks lessons.
3. WHEN a learner opens the search modal and enters a query that matches an OPERATOR Lesson title, subtitle, or track code, THE Kube_To_Scale_App SHALL include that OPERATOR Lesson in the search results.
4. WHEN a learner selects an OPERATOR Lesson from the search results, THE Kube_To_Scale_App SHALL open that OPERATOR Lesson in the Learn_View.

### Requirement 5: Filter Practice drills to OPERATOR and resolve the drill track-shape mismatch

**User Story:** As a learner, I want selecting OPERATOR in the Practice drills to show only Operator drills, so that I can practice Operator troubleshooting.

#### Acceptance Criteria

1. WHEN the Practice drills track selection is OPERATOR, THE Practice_Drills SHALL display every Operator practice drill defined by the Operators_Data_Module and SHALL omit every drill that is not an Operator practice drill.
2. THE Kube_To_Scale_App SHALL apply one consistent track-identification shape across all entries in the `PRACTICE_SCENARIOS` collection so that the Practice drills filter selects Operator drills by the same mechanism it uses for Existing_Tracks drills.
3. WHEN the Practice drills track selection is OPERATOR, THE Practice_Drills SHALL report the count of visible Operator drills in the drill count and score totals shown in the Practice view.
4. WHEN the Practice drills track selection is an Existing_Tracks code, THE Practice_Drills SHALL display the same drills that were displayed for that track before the Operators_Data_Module was loaded.

### Requirement 6: Filter Cheatsheets to OPERATOR

**User Story:** As a learner, I want selecting OPERATOR in the Cheatsheets to show only Operator cheatsheets, so that I have an Operator field reference.

#### Acceptance Criteria

1. WHEN the Cheatsheets track selection is OPERATOR, THE Cheatsheets_View SHALL display every cheatsheet whose `certs` array contains `OPERATOR` and SHALL omit every cheatsheet whose `certs` array does not contain `OPERATOR`.
2. WHEN the Cheatsheets track selection is OPERATOR, THE Cheatsheets_View SHALL render each displayed Operator cheatsheet using the same cheatsheet-rendering behavior applied to Existing_Tracks cheatsheets.

### Requirement 7: Make Operator Design Lab guardrails available and consistent with the gauge model

**User Story:** As a learner, I want the Operator-specific guardrails available in the Design Lab, so that I can explore Operator reliability and correctness trade-offs.

#### Acceptance Criteria

1. THE Kube_To_Scale_App SHALL make the 8 Operator_Lab_Guardrails available as Lab_Guardrail entries in the Design_Lab.
2. THE Kube_To_Scale_App SHALL represent each Operator_Lab_Guardrail using the same score-field schema that the Design_Lab gauge calculation reads for Existing_Tracks guardrails, so that each Operator_Lab_Guardrail contributes defined numeric values to the Security, Reliability, and Platform Maturity gauges.
3. WHEN a learner toggles an Operator_Lab_Guardrail on or off in the Design_Lab, THE Design_Lab SHALL recompute the Security, Reliability, and Platform Maturity gauges from the set of enabled Lab_Guardrail entries.
4. WHEN a learner exports the Design_Lab blueprint, THE Design_Lab SHALL list each Operator_Lab_Guardrail under the enabled or missing guardrail section according to the guardrail's toggle state.

### Requirement 8: Keep interface counts correct after Operator content loads

**User Story:** As a learner, I want lesson and progress counts to stay accurate after Operator content loads, so that the interface reflects the real catalog.

#### Acceptance Criteria

1. WHEN the global track selection is ALL, THE Learn_View sidebar lesson count SHALL equal the total number of Lessons across all tracks, including the OPERATOR Lessons.
2. WHEN the global track selection is OPERATOR, THE Learn_View sidebar lesson count SHALL equal the number of Lessons whose `certs` array contains `OPERATOR`.
3. THE Learn_View sidebar progress indicator SHALL compute completed and total lesson figures from the Lessons present at runtime after the Operators_Data_Module has loaded.
4. THE Practice view drill total SHALL equal the number of Practice_Drills visible for the current Practice drills track selection after the Operators_Data_Module has loaded.

### Requirement 9: Preserve existing tracks, lessons, and the Design Lab without regression

**User Story:** As a learner on an existing track, I want the CKA, CKAD, CKS, and CNPE tracks to keep working exactly as before, so that activating the Operator track does not break what already works.

#### Acceptance Criteria

1. WHEN the global track selection is an Existing_Tracks code, THE Learn_View SHALL display the same set of Lessons that it displayed for that track before the Operators_Data_Module was loaded.
2. WHEN a learner opens a Lesson that belongs to an Existing_Tracks track, THE Learn_View SHALL render that Lesson with the same diagram, steps, metrics, trace, and checklist behavior it had before this change.
3. WHEN the global track selection is ALL, THE Learn_View, Practice_Drills, and Cheatsheets_View SHALL display all Existing_Tracks content in addition to the OPERATOR_Track content.
4. WHEN a learner uses the Design_Lab with only Existing_Tracks guardrails enabled, THE Design_Lab SHALL compute the Security, Reliability, and Platform Maturity gauges to the same values produced before the Operator_Lab_Guardrails were added.
5. THE Kube_To_Scale_App SHALL retain the four existing views (Learn_View, Practice, Design_Lab, Cheatsheets_View) and their navigation after the Operators_Data_Module has loaded.

### Requirement 10: Make the Operator track content complete and consistent with the shared source material

**User Story:** As a learner, I want the Operator track content to match the shared "Operators to Scale" curriculum, so that the track covers the intended topics completely.

#### Acceptance Criteria

1. THE OPERATOR_Track SHALL include Lessons covering every lesson topic in the Source_Material, specifically: reconciliation-loop, informers-workqueue, crd-anatomy-gvk, cr-lifecycle-subresources, client-go-scratch, controller-runtime-internals, kubebuilder-scaffolding, reconciler-ownerrefs, finalizers-cleanup, webhooks-multiversion, envtest-concurrency, olm-classic-v0, olm-v1-architecture, production-ha-observability, and upgrades-capability-model.
2. THE OPERATOR_Track SHALL include the Practice_Drills, cheatsheets, and Operator_Lab_Guardrails topics present in the Source_Material.
3. THE Kube_To_Scale_App SHALL organize the OPERATOR_Track Lessons into Course_Modules consistent with the module grouping in the Source_Material.
4. WHERE a lesson topic in the Source_Material is a parser, serializer, or round-trip transformation between Custom Resource specifications and their stored or serialized form, THE OPERATOR_Track SHALL cover both the forward transformation and the inverse transformation for that topic.

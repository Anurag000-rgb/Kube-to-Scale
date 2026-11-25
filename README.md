# Kube to Scale

**Interactive Kubernetes & CNCF visual learning platform.**

Kube to Scale teaches Kubernetes and CNCF certification topics through animated 2.5D isometric diagrams, hands-on practice drills, a live cluster simulator, and copy-ready cheatsheets. It runs entirely in the browser with **zero build step** — plain HTML, CSS, and vanilla JavaScript.

Open `index.html` in any modern browser and it just works.

## Certification tracks

Content is tagged across five tracks, filterable from any view:

| Track | Lessons | Focus |
|-------|--------:|-------|
| **CKA** | 49 | Certified Kubernetes Administrator — architecture, workloads, networking, maintenance |
| **CKAD** | 25 | Certified Kubernetes Application Developer — pods, config, deployments |
| **CKS** | 27 | Certified Kubernetes Security Specialist — hardening, policies, runtime security, supply chain |
| **CNPE** | 50 | Cloud Native Platform Engineering — scaling, GitOps, system design patterns |
| **OPERATOR** | 19 | Operators & controllers — control loops, CRDs, Kubebuilder, OLM, Day-2 ops |

Totals at runtime: **74 lessons across 16 modules**, **53 exam drills**, a **24-item scenario Q&A bank**, **19 cheatsheets**, and **13 curated learning channels**.

## Views

- **Learn** — The core experience. A course-tree sidebar, a center stage with an animated 2.5D SVG diagram of the architecture being taught, and a step-by-step guide panel. Each lesson has animated packets (request / response / watch / blocked), per-step metrics, a diagnostic trace, YAML/code snippets, "good to know" tips, and linked documentation references and YouTube videos. Supports autoplay, speed control, replay, pause, and keyboard shortcuts.
- **Practice** — Two modes: exam-grade troubleshooting/CKA-style drills with scoring, and a scenario Q&A bank filterable by category and search.
- **Design Lab** — A live cluster simulator. Toggle production guardrails, inject chaos / security attacks, and watch Security / Reliability / Platform Maturity gauges and the SVG react in real time. Export a cluster blueprint.
- **Cheatsheets** — Copy-ready YAML manifests, imperative `kubectl` shortcuts, architecture patterns, and CNCF exam weights, filterable by track.
- **Resources** — Curated YouTube channels and learning resources mapped to relevant lessons.

## Keyboard shortcuts (Learn view)

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / next step |
| `R` | Replay the current step animation |
| `Space` | Pause / resume animations |
| `⌘K` / `Ctrl+K` | Open the search modal |

## Project structure

```
kube-to-scale/
├── index.html              # Single-page shell: layout, nav, four+one views, script tags
├── styles.css              # All styling (design tokens, 2.5D diagram, responsive layout)
├── app.js                  # Rendering, SVG engine, animation loop, state, search, Design Lab
├── logo.png                # Brand logo / favicon
│
├── data-lessons.js         # MODULES array + core LESSONS map (lesson factories: Z/N/E)
├── data-lessons-extra.js   # Additional lessons
├── data-lessons-workloads.js
├── data-lessons-ops.js
├── data-lessons-cks.js
├── data-operators.js       # OPERATOR track: modules m11/m15/m16, lessons, drills, lab guardrails
├── data-extra.js           # Practice drills, cheatsheets, Design Lab features
├── data-scenarios.js       # Scenario Q&A bank
├── data-references.js      # Per-lesson/module doc references & curated YouTube videos
├── data-channels.js        # Curated YouTube channels for the Resources view

```

### Data model

Content lives in plain JavaScript objects, kept separate from rendering logic:

- **`MODULES`** — ordered course modules, each with an `id`, `title`, `certs` array, and a `lessons` list.
- **`LESSONS`** — a map keyed by lesson id. Each lesson carries `certs`, `moduleId`, `title`, `subtitle`, `checklist`, and `steps`. Every step defines SVG `zones`, `nodes` (`N(...)`), `edges` (`E(...)`), `metrics`, a `trace`, and guidance copy — built via the compact `Z` / `N` / `E` factory helpers.
- **`PRACTICE_SCENARIOS`**, **`PRACTICE_SCENARIO_BANK`**, **`CHEATSHEETS`**, **`LAB_FEATURES`**, **`CURATED_YOUTUBE_CHANNELS`** — back the Practice, Cheatsheets, Design Lab, and Resources views.
- **`LESSON_REFS` / `LESSON_YT_OVERRIDES` / `MODULE_YT_DEFAULTS` / `TOP_YT`** (in `data-references.js`) — resolve per-lesson documentation links and videos, consumed by `renderLessonResources()`.

Script load order matters: data files populate the global collections first, then `app.js` renders on `DOMContentLoaded`.

## Running locally

No dependencies and no build. Either:

- **Open directly** — double-click `index.html`, or
- **Serve over HTTP** (recommended, avoids any `file://` quirks):

  ```bash
  python3 -m http.server 8000
  # then visit http://localhost:8000
  ```

## Tech notes

- Pure vanilla JS / HTML / CSS; no framework, bundler, or package manager.
- Diagrams are hand-built SVG rendered by the engine in `app.js` (`renderIsoScene`, `drawIsoGlyph`) with a `requestAnimationFrame` packet-animation loop.
- Progress and UI state persist to `localStorage`.
- Script and stylesheet tags use `?v=` cache-busting query params for manual static deploys.
- External video resources are either verified channel links or YouTube search links — no fabricated video IDs.

## Development

Feature work is tracked as specs under `.kiro/specs/` (requirements → design → tasks). Adding content is additive data: define new entries in the relevant `data-*.js` file and tag lessons with the appropriate `certs`.

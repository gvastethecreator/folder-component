# Playground Release Hardening

Status: ready-for-human

Resolution: implementation and automated release-candidate gates complete; maintainer review,
commit, and any release action remain intentionally external.

## Mission contract

- Artifact and user outcome: a trustworthy, maintainable five-engine animation playground ready for a public release candidate.
- Mission mode: change.
- In scope: every actionable finding from the 2026-07-13 audit: engine truth, shared configuration, contrast, responsive density, image recovery, truthful code sample, control capability disclosure, browser coverage, CI/toolchain reproducibility, dependency maintenance, and readiness docs.
- Out of scope: Git push, GitHub metadata changes, deployment, tags, releases, new product features, TypeScript 7 migration, and replacing the five selected animation engines.
- Baseline: 32/32 Vitest tests; build 402.50 kB JS / 137.33 kB gzip; no dependency vulnerabilities; five engines animate, but CSS/WAAPI header labels fail, tertiary text contrast fails, remote image failure has no fallback, mobile is one 6k-pixel column, and browser tests are temporary only.
- Stop condition: no in-scope blocker/P1 remains; systemic P2 items are fixed or explicitly rejected with evidence; all required gates pass; final adversarial autopsy finds no unresolved blocker/P1.

## Product and architecture decisions

1. One typed engine catalog owns id, label, status label, description, and spring capability notes. No nested engine-label ternaries.
2. One typed playground config and default value own reset behavior. `App` state uses a reducer or equivalent single transition seam.
3. CSS and WAAPI remain honest approximations of spring controls; UI must say so. Tween mode keeps spring values but disables irrelevant controls accessibly.
4. Engine adapters stay behind the existing controller contract. Split adapters/shared helpers where it reduces ownership ambiguity; do not add an async abstraction unless measured bundle value justifies it.
5. Remote Pexels assets remain licensed inputs, but every visible image gets a deterministic neutral fallback and no broken-image chrome.
6. Mobile: one column at 320 px; two compact columns when width safely permits (target 390 px); no horizontal overflow.
7. Browser smoke uses Playwright + Chromium and covers the public behavior that jsdom missed.
8. Pin Bun. Apply safe patch/minor dependency updates only when the full gate stays green; keep major migrations deferred.

## Work slices

| Slice | Owner               | Deliverable                                                                                                                                      | Acceptance proof                                                                                                        |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 01    | engine/config agent | Single engine catalog, shared config/reset seam, truthful header/status/code sample, capability-aware motion controls, adapter ownership cleanup | Focused unit tests for all five labels, reset, snippet, tween disabled state, CSS/WAAPI explanation; typecheck          |
| 02    | UI/resilience agent | AA text tokens, usable slider targets, 320/390 responsive density, recoverable truncation, deterministic image fallback                          | Component tests plus rendered dark/light/mobile/offline states; no overflow; computed contrast >= 4.5:1 for normal text |
| 03    | e2e/toolchain agent | Playwright config/specs, CI browser gate, pinned Bun, safe dependency refresh, docs/readiness updates                                            | E2E five-engine/theme/mobile/reduced-motion/network-failure suite; frozen install; all standard scripts                 |
| 04    | root integration    | Reconcile parallel edits, close remaining findings, run evidence gates, pressure review, final release-candidate report                          | Full verification manifest, browser artifacts, diff audit, bundle comparison, independent review reconciliation         |

## Gate manifest

| Gate                                | Applicability | Safe proof surface                                                                    | Final state |
| ----------------------------------- | ------------- | ------------------------------------------------------------------------------------- | ----------- |
| Scope                               | required      | `git diff --stat`, `git diff --check`, ownership audit                                | pass        |
| Acceptance/baseline                 | required      | audit baseline above + like-for-like browser states                                   | pass        |
| Claim provenance                    | required      | source pointers, command logs, screenshots                                            | pass        |
| Regression                          | required      | format, lint, typecheck, Vitest, build, Playwright                                    | pass        |
| Runtime behavior                    | required      | five engine selections + hover/touch + cleanup                                        | pass        |
| Hostile input/recovery              | required      | abort Pexels requests and verify fallback                                             | pass        |
| User states                         | required      | dark/light, spring/tween, CSS/WAAPI, code tab, reset                                  | pass        |
| Viewport/platform                   | required      | Chromium 1440x900, 390x844, 320x800                                                   | pass        |
| Accessibility                       | required      | contrast math, keyboard, focus, reduced motion, accessible disabled state             | pass        |
| Performance                         | conditional   | production gzip and focused interaction trace; no engine ranking without stable trace | pass        |
| Independent judgment                | required      | fresh agent reviews raw diff + runtime artifacts                                      | pass        |
| Adversarial autopsy                 | required      | final skeptical pass with strongest remaining objection                               | pass        |
| Firefox/Safari/manual screen reader | conditional   | unavailable unless installed; name limitation if still absent                         | deferred    |

## Quality loop record

Use compact entries only for valid deltas:

`N | source finding | artifact/proof delta | verdict | next`

Do not create filler loops. Epoch review every five valid loops. Loop 30 verdict is required only while meaningful in-scope risks remain; evidence saturation may justify an earlier stop.

1 | audit truth gaps | mission contract and four slices recorded | continue | engine/config
2 | duplicated engine semantics | typed engine catalog and shared config reducer | pass | capability UI
3 | misleading spring controls | native/approximation disclosure and disabled tween physics | pass | snippet
4 | incomplete example | copyable five-engine snippet from shared deployment tuple | pass | adapter behavior
5 | epoch 1 review | focused engine/control unit suite green | continue | UI resilience
6 | remote image failure | deterministic neutral fallback on all visible image surfaces | pass | contrast
7 | low-contrast tertiary text | dark/light tokens reach measured 5.74:1 minimum | pass | touch targets
8 | narrow layout overflow | 320 one-column and 390 two-column rules | pass | expanded state
9 | responsive geometry risk | expanded Lock state preserves zero horizontal overflow | pass | browser gate
10 | epoch 2 review | fallback, contrast, touch, and responsive evidence green | continue | tooling
11 | missing reproducibility | Bun/Playwright pins, frozen install, CI browser job | pass | diagnostics
12 | discarded failure proof | CI uploads Playwright report/test-results always | pass | dependency audit
13 | stale dependencies | safe patch/minor refresh with zero audit vulnerabilities | pass | runtime seam
14 | interrupted feedback leak | GSAP/Motion/Anime/CSS/WAAPI cleanup normalized | pass | race proof
15 | epoch 3 review | Pulse/Flash handoff and transform assertions green | continue | adversarial review
16 | Anime paused orphan | Anime animations cancel and CSS timers retire | pass | source drift
17 | deployment copy drift | UI/snippet/runtime derive from shared tuple and labels | pass | reset race
18 | pending slider override | reset remount cancels scheduled range writes | pass | clipboard
19 | clipboard denial | local copy fallback plus browser confirmation | pass | final matrix
20 | epoch 4 review | 39 unit + 9 E2E + visual/runtime proof, no blocker/P1/P2 | stop | evidence saturated

Stop rationale: every required gate is green, independent review findings were reconciled,
and further loops would only repeat evidence. Cross-browser/manual screen-reader coverage stays
as an explicit conditional limitation rather than an unproven claim.

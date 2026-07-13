# 03 — Browser gate, reproducible toolchain, and release docs

Status: ready-for-human

Resolution: completed and verified; awaiting maintainer review/commit.

## Tasks

1. Add Playwright Chromium smoke coverage for five engine labels/data markers, hover or touch state, code tab, reset, themes, reduced motion, 320/390 layout, and Pexels failure recovery.
2. Add scripts and CI steps for deterministic browser execution.
3. Pin Bun to the locally verified version in package metadata and CI.
4. Apply safe patch/minor dependency updates; do not cross React/TypeScript/Node major boundaries. Revert any update that makes a gate worse.
5. Update README, project readiness, and technical debt to match five engines, current browser proof, image fallback, supported browser baseline, and remaining explicit tradeoffs.
6. Record eager engine loading as an intentional comparison-playground tradeoff unless a measured, simple split improves initial bundle without interaction regressions.

## Acceptance

- `bun install --frozen-lockfile` succeeds.
- Playwright suite is locally green and wired into CI.
- Standard format/lint/typecheck/unit/build scripts remain green.
- Docs contain no stale `Chrome inspection pending`, Unsplash, or one-engine claims.
- Package and CI use the same pinned Bun version.
- `bun audit` reports no known vulnerabilities.

# Technical Debt Register — Image Style Folder Playground

> Living register of deferred/rejected/resolved work, severity, impact, and the recommended
> next step. Updated whenever work is deferred or closed during the readiness pass.

## Deferred

### TD-1 — `vite-plus` / `vp` aggregator unavailable

- **Severity:** low.
- **Impact:** The `web-project-readiness` skill's reference workflow centers on
  `@voidzero-dev/vite-plus` and its `vp` CLI (`vp dev/build/test/lint/check`). That package
  is **not published on npm** as of this pass (`npm view @voidzero-dev/vite-plus` → 404), so
  the project uses Vite 8, oxlint, oxfmt, and Vitest directly via `package.json` scripts and
  `.vscode/tasks.json`.
- **Recommended next step:** If/when `@voidzero-dev/vite-plus` ships on npm, swap the
  scripts to the `vp` equivalents and adopt `vp check` as the single aggregate gate.

### TD-3 — `lucide-react` bumped 0.x → 1.x

- **Severity:** low.
- **Impact:** Major version bump on the icon library. All imported icons (`Settings2`,
  `Copy`, `Check`, `Layout`, `RefreshCw`, `Code`, `Info`, `Sparkles`) still resolve and the
  build/typecheck pass, but a full visual diff of icon glyphs was not performed.
- **Recommended next step:** Eyeball the icons in the controls panel after `bun run dev`; if
  any glyph regressed, pin `lucide-react` back to `^0.546.0`.

## Resolved

### TD-2 — `motion`-based components are not unit-tested (resolved)

- **Resolution:** Added `src/components/StyleFolder.test.tsx` (3 tests: cover image + title,
  one card image per visible file, hidden files not rendered) and `src/App.test.tsx` (2
  tests: mount + controls panel, all 5 folder titles render). Motion 12 renders cleanly under
  jsdom using the `ResizeObserver`/`IntersectionObserver`/`matchMedia`/`clipboard` stubs
  already in `src/test/setup.ts`. Suite is now 15/15 across 4 files.

### TD-4 — Google Fonts loaded via render-blocking CSS `@import` (resolved)

- **Resolution:** Removed the `@import url('https://fonts.googleapis.com/…')` line from
  `src/index.css` and moved font loading to `<link rel="preconnect">` + `<link rel="stylesheet">`
  in `index.html` (`fonts.googleapis.com` + `fonts.gstatic.com` crossorigin). Verified the
  production build still emits the links into `dist/index.html`. The `@theme` `--font-sans` /
  `--font-mono` tokens are unaffected (they reference font names loaded by the stylesheet).

### TD-5 — `setup-project` not run; no `AGENTS.md` / issue-tracker wiring (resolved)

- **Resolution:** Ran the `setup-project` skill. Created `AGENTS.md` at the repo root with the
  `## Agent skills` block, and `docs/agents/{issue-tracker,triage-labels,domain}.md`. Issue
  tracker = local markdown under `.scratch/`; triage labels = the five canonical defaults
  (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`); domain docs
  = single-context (`CONTEXT.md` + `docs/adr/` at root, created lazily by `/grill-with-docs`).

## Rejected

### TD-6 — No AI Studio server capability, but app may still deploy via AI Studio (rejected)

- **Reason:** AI Studio is being dropped; this project is now a **standalone web project** with
  no AI Studio deployment path, so there is no server capability to restore and no AI Studio
  target to redeploy to. The remaining AI Studio remnants were removed in a follow-up: deleted
  `metadata.json` and `assets/.aistudio/`, removed the `DISABLE_HMR` toggle from
  `vite.config.ts` and the matching paragraph from `README.md`. Re-add a server capability
  only if a real server-side feature is implemented later.

# Project Readiness — Image Style Folder Playground

> Working record for the `web-project-readiness` pass. Updated as work progresses.
> This is the source of truth for what changed, what was validated, and what still hurts.

## Project summary

A static React 19 + Vite + Tailwind v4 single-page app that renders curated image
styles inside interactive, animated folders (hover-to-fan, toggle, flash). The right
panel exposes a live "playground" of animation controls (deployment style, spring
physics, stagger, shape, etc.) and a copy-paste reusable code snippet.

The app is **purely a static frontend**. Despite the original `package.json` listing a
GenAI/Express server stack, **none of it is imported or used**. The catalog uses a curated
set of optimized Pexels images in `src/data/stylesData.ts`.

## Current release-candidate contract

- **Engines:** GSAP, Motion, Anime.js, CSS, and WAAPI share one folder contract and are
  selectable at runtime. CSS/WAAPI expose spring values as documented easing/duration
  approximations because those APIs do not provide a physical spring primitive.
- **Recovery:** Pexels image failures resolve to deterministic neutral-tone fallbacks; the
  UI does not leave broken-image chrome.
- **Browser baseline:** Playwright 1.61.1 + Chromium is the required automated gate. The
  app targets evergreen browsers with Pointer Events, ResizeObserver, and WAAPI support;
  Firefox/Safari and manual screen-reader coverage are conditional, not CI requirements.
- **Loading tradeoff:** all five adapters load eagerly so engine comparison and switching
  stay immediate. Code splitting is deferred until a measured bundle reduction preserves
  interaction and browser-gate results.
- **Toolchain:** Bun 1.3.14 is pinned in `package.json` and CI; installs use the committed
  `bun.lock`.

## Baseline (before this pass)

- **Runtime/framework:** React 19.0.1, Vite 6.2.3, `@vitejs/plugin-react` 5.0.4, Tailwind
  CSS v4 (`@tailwindcss/vite` + `@theme`), `motion` (Framer Motion successor) 12.x,
  `lucide-react` icons.
- **Package manager:** npm (`package-lock.json` was **0 bytes / empty** — broken).
- **Tooling:** no linter, no formatter, no test runner. `lint` script was just
  `tsc --noEmit` with a non-strict `tsconfig.json`.
- **Dead dependencies (never imported):** `@google/genai`, `express`, `dotenv`,
  `@types/express`, `tsx`, `esbuild`, `autoprefixer`.
- **Misleading metadata:** `metadata.json` declared `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`;
  `.env.example`/`README` documented a `GEMINI_API_KEY` that no code reads.
- **Windows-hostile scripts:** `clean` used `rm -rf dist server.js` (fails on win32; also
  referenced a nonexistent `server.js`). `dev` bound `--host=0.0.0.0` (EACCES risk on Windows).
- **Config debt:** `tsconfig.json` had `allowJs`, `experimentalDecorators`,
  `useDefineForClassFields`, and an `@/*` path alias that was **never imported** (all
  imports are relative). `vite.config.ts` mirrored the same unused alias and contained a
  mojibake comment + arrow-function `defineConfig(() => …)` form.
- **Source issues:** 5 unused icon imports in `PlaygroundControls.tsx`; `StyleFolderProps`
  declared a bogus `key?: any` and an `onClick` prop never passed by `App`.
- **Docs/infra:** no `docs/`, no task definitions, no `logs/` convention.

## Chosen remediation lane

**Lane B — In-place modernization** (user-confirmed: "Full modernization").

Target profile (per the `web-project-readiness` skill): Bun, Vite 8, OXC (oxlint + oxfmt),
Vitest, React 19, and Tailwind v4. Motion was retained during the original readiness pass;
follow-up #3 replaced that hot path with GSAP and removed Motion from the dependency graph.

## Notable deviation from the skill profile

The skill's reference docs center on `vite-plus` (`@voidzero-dev/vite-plus`, `vp` CLI) as the
task aggregator. **`@voidzero-dev/vite-plus` is not published on npm** (verified: `npm view`
returns 404). We therefore use the underlying tools directly — Vite 8 (Rolldown built in),
standalone `oxlint`/`oxfmt`, and Vitest 4 — orchestrated via `package.json` scripts and a
`.vscode/tasks.json`. This satisfies the same toolchain goals without the unpublished
aggregator. See `docs/technical-debt.md`.

## Ordered implementation slices

1. Write this working record + `docs/technical-debt.md`.
2. Rewrite `package.json`: drop dead deps, move build-time deps to `devDependencies`,
   add Vite 8 / Vitest 4 / OXC / TS 6 / testing-library, add atomic scripts.
3. Delete broken `package-lock.json`; `bun install` → `bun.lock` (Bun 1.2+ text lockfile).
4. Rewrite `tsconfig.json` (strict, drop unused flags/alias, scoped `include`).
5. Rewrite `vite.config.ts` (object form, `localhost`, drop unused alias, fix mojibake).
6. Add `vitest.config.ts` + `src/test/setup.ts` + smoke tests.
7. Add `.oxlintrc.json` + oxfmt scripts.
8. Fix source: remove unused imports, remove bogus `key`/`onClick` props, fix strict-mode
   type errors surfaced by tsc/oxlint.
9. Fix `metadata.json`, delete `.env.example`, rewrite `README.md`, update `index.html`
   title, tighten `.gitignore`, add `.vscode/tasks.json` + `logs/.gitkeep`.
10. Validate: install → typecheck → lint → format → test → build → dev smoke.
11. Finalize these docs with evidence.

## Tasks completed

- Wrote this working record and `docs/technical-debt.md`.
- Rewrote `package.json`: dropped dead deps (`@google/genai`, `express`, `dotenv`,
  `@types/express`, `tsx`, `esbuild`, `autoprefixer`); moved build-time deps to
  `devDependencies`; added Vite 8 / Vitest 4 / oxlint + oxfmt / TypeScript 6 /
  testing-library / `@types/react` / `@types/react-dom` / `jsdom`; added atomic scripts
  (`dev`, `build`, `preview`, `typecheck`, `lint`, `lint:fix`, `format`, `format:check`,
  `test`, `test:watch`, `test:coverage`, `clean`).
- Deleted the 0-byte `package-lock.json`; `bun install` produced `bun.lock` (178 packages).
- Rewrote `tsconfig.json`: enabled `strict` + `noUnusedLocals`/`noUnusedParameters`/
  `noFallthroughCasesInSwitch`/`resolveJsonModule`; dropped unused `allowJs`,
  `experimentalDecorators`, `useDefineForClassFields`, and the never-used `@/*` `paths`
  alias; scoped `include` to `src` + the config/script files.
- Rewrote `vite.config.ts`: static `defineConfig({...})` object form (required for OXC),
  `host: "localhost"` (Windows-safe), dropped the unused `path`/`__dirname`/`@` alias,
  fixed the mojibake comment. The AI Studio `DISABLE_HMR` toggle kept at the time was removed in follow-up #2 when AI Studio was dropped.
- Added `vitest.config.ts` (jsdom, Istanbul coverage, explicit imports) + `src/test/setup.ts`
  (jest-dom matchers, `afterEach(cleanup)`, and `matchMedia`/`ResizeObserver`/
  `IntersectionObserver`/`clipboard` stubs for future component tests).
- Added `src/vite-env.d.ts` (`/// <reference types="vite/client" />`) so the CSS side-effect
  import and Vite client types resolve under strict TS.
- Added `.oxlintrc.json` (`correctness: error`, `suspicious: warn`, `no-unused-vars: error`).
- Added smoke tests: `src/data/stylesData.test.ts` (5 — data contract) and
  `src/components/PlaygroundControls.test.tsx` (5 — tab switch, deployment-style click,
  preset application, reset, code snippet).
- Fixed source: removed 5 unused `lucide-react` imports from `PlaygroundControls.tsx`;
  removed the bogus `key?: any` and never-passed `onClick` prop from `StyleFolderProps`
  (+ its destructuring/handler usage); extracted `EASE_OUT_QUINT` as a typed
  `[number, number, number, number]` so Motion's `Easing` type accepts it under strict TS.
- Fixed `metadata.json` (removed false `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`);
  deleted the misleading `.env.example`; rewrote `README.md`; updated `index.html` title +
  meta description; tightened `.gitignore` (`logs/*` + `!.gitkeep`, `*.tsbuildinfo`);
  added `.vscode/tasks.json` (`check` = lint+format:check+typecheck; `verify` adds test+build);
  added `logs/.gitkeep`; added cross-platform `scripts/clean.ts` (Bun-native TS).
- Ran `oxfmt .` to normalize formatting across all files (code, JSON, HTML, Markdown).

## Validation log

Final pass (all green), Bun 1.3.14 on Windows:

| Command                                    | Result                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `bun install`                              | 178 packages, `bun.lock` written                                                                       |
| `bun run typecheck` (`tsc --noEmit`)       | exit 0                                                                                                 |
| `bun run lint` (`oxlint .`)                | exit 0                                                                                                 |
| `bun run format:check` (`oxfmt --check .`) | exit 0 — all files correctly formatted                                                                 |
| `bun run test` (`vitest run`)              | exit 0 — 15/15 tests pass (4 files)                                                                    |
| `bun run build` (`vite build`, Rolldown)   | exit 0 — 439 modules, `dist/` 372.84 kB JS / 41.79 kB CSS                                              |
| `bun run dev` smoke                        | HTTP 200 at `http://localhost:3000`; title + `/src/main.tsx` entry present; Vite 8.1.0 ready in 443 ms |

Notable fix during validation: the first `tsc` run surfaced ~200 errors all cascading from
two root causes — missing `@types/react`/`@types/react-dom` (never installed; the old loose
config masked it) and no `vite-env.d.ts` for the CSS side-effect import. Adding both cleared
all but one error (the Motion `ease` tuple), fixed via the typed `EASE_OUT_QUINT` constant.
The first `vitest` run had 4 failures caused by `@testing-library/react` auto-cleanup not
running under `globals: false`; fixed by registering `afterEach(cleanup)` in `setup.ts`.

**Follow-up pass** (recommended next slices): added `StyleFolder` + `App` render tests
(TD-2; suite 15/15), moved Google Fonts to preconnect `<link>`s in `index.html` (TD-4), and
ran `setup-project` → `AGENTS.md` + `docs/agents/` (TD-5). Re-ran `format` / `format:check`
/ `test` / `build` — all green; `dist/index.html` now contains the font `preconnect` links.

**Follow-up #2** (AI Studio dropped): the project is now a standalone web project. Removed
the remaining AI Studio remnants — deleted `metadata.json` and `assets/.aistudio/`, removed
the `DISABLE_HMR` toggle from `vite.config.ts` and the matching paragraph from `README.md`.
TD-6 moved to Rejected.

**Follow-up #3** (rendering + motion system): migrated the interactive folder hot path from
Motion to GSAP 3.15.0 + `@gsap/react` 2.1.2, with scoped cleanup, interruptible transform-only
animation, reduced-motion handling, deferred offscreen card rendering, reusable paused
timelines, and a neutral Geist-inspired grayscale UI. Motion was removed after the last import
was retired. Verification: typecheck and lint pass; 23/23 tests pass; the production build is
301.15 kB JS (101.71 kB gzip) + 29.64 kB CSS (6.65 kB gzip). Chromium checks cover the five
stack geometries, dark/light modes, image-free tones, optional noise, mobile overflow, and
reduced motion. The prior Motion notes above remain as historical baseline.

**Follow-up #4** (standalone project): confirmed the project remains a standalone React SPA
(no Custom Element packaging). `git init` ran (repo at `D:/DEV/folders`, default branch
`master`); `node_modules` ignored via `.gitignore`, `bun.lock` trackable. No initial commit
made (commit when ready). `README.md` / `AGENTS.md` reworded to "standalone static … SPA".

**Follow-up #5** (multi-engine animation playground): restored Motion and added Anime.js 4,
pure CSS transitions/keyframes, and native WAAPI alongside the existing GSAP integration.
`src/animation/folderEngines.ts` now owns five interruptible adapters behind one
folder-animation contract; the playground exposes a live GSAP / Motion / Anime.js / CSS /
WAAPI selector and keeps deployment geometry, spring/tween controls, stagger, reduced-motion
behavior, click feedback, and cleanup consistent across engines. CSS and WAAPI translate the
spring controls into duration plus an overshooting cubic-bezier because neither platform API
includes a physical spring primitive. Verification: format, lint, typecheck, 32/32 tests,
production build, and HTTP 200 from the Vite development server are green. The release gate
now uses a pinned Playwright Chromium project for engine markers, interaction, controls,
responsive viewports, reduced motion, and Pexels failure recovery.

**Follow-up #6** (toolchain + browser gate): pinned Bun 1.3.14 in package metadata and CI,
added exact Playwright 1.61.1 Chromium coverage, and refreshed safe patch/minor tooling
updates only (`lucide-react`, `@types/node`, `@vitest/coverage-istanbul`, `oxlint`, Vite,
Vitest). Major TypeScript, Node, and React migrations remain deferred. Eager loading of all
five adapters is recorded as an intentional comparison-playground tradeoff.

### Slice 03 verification snapshot (2026-07-13, Windows)

| Command                         | Result                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `bun --version`                 | `1.3.14`                                                                                      |
| `bun install --frozen-lockfile` | pass; lockfile unchanged                                                                      |
| `bun audit`                     | pass; no vulnerabilities                                                                      |
| `bun run typecheck`             | pass                                                                                          |
| `bun run lint`                  | pass                                                                                          |
| `bun run test`                  | pass; 39/39 tests across 4 unit files (script targets `src/`)                                 |
| `bun run build`                 | pass; 407.92 kB JS / 139.01 kB gzip, 31.34 kB CSS / 7.10 kB gzip                              |
| `bun run test:e2e`              | pass; 9/9 Chromium tests, including interrupted Pulse/Flash cleanup across controller changes |
| `bun run format:check`          | pass; all matched files use the correct format                                                |

## Recommended next slices

See `docs/technical-debt.md` for the full register.

**Follow-up pass executed** (the three items originally recommended here are now resolved —
see the "Resolved" section of `docs/technical-debt.md`): TD-2 (`StyleFolder` + `App` render
tests; suite now 15/15), TD-4 (Google Fonts moved to preconnect `<link>`s in `index.html`),
TD-5 (`setup-project` run → `AGENTS.md` + `docs/agents/`).

Still open:

1. **TD-1** — adopt the `vp` CLI if/when `@voidzero-dev/vite-plus` ships on npm.

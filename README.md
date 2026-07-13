# Image Style Folder Playground

A standalone static React + Vite single-page app that renders curated image styles inside
interactive, animated folders. Hover a folder to fan out its style cards, or use the
right-hand **Playground** panel to tune deployment style, spring physics, stagger, shape,
click behavior, and the active animation engine live. The same folder geometry can run on
**GSAP**, **Motion**, **Anime.js**, pure **CSS**, or native **WAAPI**, then be copied as a
reusable component snippet.

All imagery uses optimized, fixed assets covered by the [Pexels license](https://www.pexels.com/legal-pages/license/). Failed Pexels requests fall back to deterministic neutral tones, so broken-image chrome never blocks the playground. There is **no backend and no API key required**.

## Prerequisites

- [Bun](https://bun.sh) **1.3.14** (package manager + runtime; pinned in `package.json` and CI)

## Setup

```sh
bun install
```

## Scripts

| Script                     | What it does                                         |
| -------------------------- | ---------------------------------------------------- |
| `bun run dev`              | Start the Vite dev server on `http://localhost:3000` |
| `bun run build`            | Production build to `dist/` (Vite 8 / Rolldown)      |
| `bun run preview`          | Preview the production build locally                 |
| `bun run typecheck`        | Type-check with `tsc --noEmit` (strict)              |
| `bun run lint`             | Lint with oxlint                                     |
| `bun run lint:fix`         | Auto-fix lint issues                                 |
| `bun run format`           | Format the codebase with oxfmt                       |
| `bun run format:check`     | Verify formatting without writing                    |
| `bun run test`             | Run the Vitest suite once                            |
| `bun run test:watch`       | Run Vitest in watch mode                             |
| `bun run test:coverage`    | Run tests with Istanbul coverage                     |
| `bun run test:e2e`         | Run the Playwright Chromium release gate             |
| `bun run test:e2e:install` | Install the pinned Playwright Chromium binary        |
| `bun run clean`            | Remove `dist/`, `coverage/`, and the Vite cache      |

Tip: in VS Code, run `.vscode/tasks.json` tasks via the Command Palette
(`Tasks: Run Task`). The `check` task runs lint + format:check + typecheck; `verify`
adds tests and a build.

## Project structure

```
src/
  App.tsx                  Layout: folders grid (left) + controls panel (right)
  main.tsx                 React 19 root mount
  index.css                Tailwind v4 entry + theme tokens + slider styles
  types.ts                 FolderData / StyleFile / SpringSettings contracts
  data/
    stylesData.ts          Curated folders + optimized Pexels imagery
  components/
    StyleFolder.tsx        Shared interactive folder rendering + engine lifecycle
    PlaygroundControls.tsx Live animation tuner + reusable code snippet
  animation/
    folderEngines.ts       GSAP, Motion, Anime.js, CSS, and WAAPI adapters
  test/
    setup.ts               jsdom stubs (matchMedia, ResizeObserver, clipboard)
docs/
  project-readiness.md     Readiness baseline, decisions, validation log
  technical-debt.md        Deferred work + recommended next steps
e2e/
  playground.spec.ts       Chromium release smoke coverage
playwright.config.ts      Pinned Chromium project + local web server
scripts/
  clean.ts                 Cross-platform clean (Bun-native TS)
```

## Environment

No environment variables are required. The app is fully static.

## Browser baseline

The release gate runs Playwright **1.61.1** against Chromium (Chrome for Testing 149 in
the verified local environment). The app targets evergreen browsers with Pointer Events,
ResizeObserver, and Web Animations API support. CI installs Chromium only; Firefox, Safari,
and manual screen-reader passes remain outside this automated baseline.

## Intentional tradeoffs

All five animation adapters load eagerly. This keeps engine comparison and switching
instant in a small playground and avoids interaction regressions from a split boundary.
Revisit only with a measured bundle win plus a green interaction/browser gate.

## Stack

React 19, Vite 8 (Rolldown), Tailwind CSS v4, GSAP 3 + `@gsap/react`, Motion 12,
Anime.js 4, CSS transitions/keyframes, WAAPI, TypeScript 6 (strict), oxlint + oxfmt,
Vitest 4, Bun.

## License

MIT — see [LICENSE](LICENSE).

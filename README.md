# Image Style Folder Playground

A standalone static React + Vite single-page app that renders curated image styles inside
interactive, animated folders. Hover a folder to fan out its style cards, or use the
right-hand **Playground** panel to tune deployment style, spring physics, stagger, shape,
and click behavior live, then copy the reusable component snippet.

All imagery is hardcoded (Unsplash). There is **no backend and no API key required**.

## Prerequisites

- [Bun](https://bun.sh) 1.x (package manager + runtime)

## Setup

```sh
bun install
```

## Scripts

| Script                  | What it does                                         |
| ----------------------- | ---------------------------------------------------- |
| `bun run dev`           | Start the Vite dev server on `http://localhost:3000` |
| `bun run build`         | Production build to `dist/` (Vite 8 / Rolldown)      |
| `bun run preview`       | Preview the production build locally                 |
| `bun run typecheck`     | Type-check with `tsc --noEmit` (strict)              |
| `bun run lint`          | Lint with oxlint                                     |
| `bun run lint:fix`      | Auto-fix lint issues                                 |
| `bun run format`        | Format the codebase with oxfmt                       |
| `bun run format:check`  | Verify formatting without writing                    |
| `bun run test`          | Run the Vitest suite once                            |
| `bun run test:watch`    | Run Vitest in watch mode                             |
| `bun run test:coverage` | Run tests with Istanbul coverage                     |
| `bun run clean`         | Remove `dist/`, `coverage/`, and the Vite cache      |

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
    stylesData.ts          Curated folders + style cards (Unsplash imagery)
  components/
    StyleFolder.tsx        Animated folder (Motion): fan/skew3d/cascade/scatter/stack
    PlaygroundControls.tsx Live animation tuner + reusable code snippet
  test/
    setup.ts               jsdom stubs (matchMedia, ResizeObserver, clipboard)
docs/
  project-readiness.md     Readiness baseline, decisions, validation log
  technical-debt.md        Deferred work + recommended next steps
scripts/
  clean.ts                 Cross-platform clean (Bun-native TS)
```

## Environment

No environment variables are required. The app is fully static.

## Stack

React 19, Vite 8 (Rolldown), Tailwind CSS v4, Motion, TypeScript 6 (strict),
oxlint + oxfmt, Vitest 4, Bun.

## License

MIT — see [LICENSE](LICENSE).

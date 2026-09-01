# Agent Guide — Folder Component

Static React 19 + Vite 8 (Rolldown) + Tailwind v4 playground. Five animation engines share one folder contract. No backend, no secrets, no env files.

Package manager: **pnpm@12.0.0**. Runtime: Node.js baseline 24.15.0 (`engines.node` >=22.22.2). Do not swap pnpm, Vite, React, or Tailwind.

Public entry: `README.md`.

## Hard rules

- Keep shared folder geometry. Do not add engine-specific geometry.
- Motion and Anime.js stay behind dynamic imports. GSAP, CSS, and WAAPI stay in the initial path.
- Grid / Single preview is playground chrome. It is not part of `PlaygroundConfig` or the generated export.
- GitHub Pages uses base `/folder-component/`. Local `dev` and `build` stay root-hosted.
- Never print or commit secrets. This app has none by design.

## Commands

- `pnpm install --frozen-lockfile`
- `pnpm run dev` — http://localhost:3000
- `pnpm run check` — format, lint, typecheck, unit tests, build
- `pnpm run test:e2e` — Chromium
- `pnpm run build:pages` — Pages artifact

## Code map

`docs/codemap/` is generated. Refresh it with `maintain-code-map`. Do not hand-edit one artifact.

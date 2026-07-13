# Project Readiness

Current local baseline: 2026-07-13.

## Release gates

| Gate                  | Command or evidence    | Baseline                                   |
| --------------------- | ---------------------- | ------------------------------------------ |
| Type safety           | `bun run typecheck`    | Required                                   |
| Lint                  | `bun run lint`         | Required                                   |
| Format                | `bun run format:check` | Required                                   |
| Unit behavior         | `bun run test`         | 47 tests                                   |
| Chromium flows        | `bun run test:e2e`     | 12 scenarios                               |
| Production artifact   | `bun run build`        | Required                                   |
| GitHub Pages artifact | `bun run build:pages`  | Required                                   |
| Dependency audit      | `bun audit`            | Required; production findings must be zero |

Browser proof covers all five animation engines, pointer/touch interaction, presets, palettes,
random and fixed deployments, responsive 320/390/1440/2560 layouts, density changes, tab and
border geometry, active-folder stacking, label visibility/opacity/backdrop/clip, configurable SVG
noise, image fallbacks, and reduced motion. Green E2E runs emit viewport and active-folder
screenshots under `test-results/`; CI uploads them with the Playwright diagnostics artifact.

## Release shape

- Static React/Vite application; no backend, secrets, API keys, or runtime environment variables.
- GitHub Pages publishes through `.github/workflows/pages.yml` from `main`.
- Project-page base path is `/folder-component/`; the local build remains root-hosted.
- Remote Pexels images degrade to deterministic local tone surfaces when unavailable.

## Known limits

- Automated browser coverage is Chromium-only.
- Safari, Firefox, and manual screen-reader checks remain release follow-ups.
- All animation adapters are eagerly bundled; see `docs/technical-debt.md`.

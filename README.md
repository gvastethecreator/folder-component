# Folder Component

A browser playground for comparing five animation engines on the same interactive folder
component: **GSAP**, **Motion**, **Anime.js**, pure **CSS**, and native **WAAPI**.

[Open the live playground](https://gvastethecreator.github.io/folder-component/)

## Features

- Switch animation engines without changing folder geometry or content.
- Browse 20 curated folders with a different cover image on every folder.
- Toggle between the responsive grid and a full-size single-folder preview with collection browsing.
- Randomize the grid or force one of nine expansion layouts across every folder.
- Scale a responsive 1–9 column grid through one folder-size/density control.
- Switch between classic, diagonal, rounded, and Windows 11 folder silhouettes.
- Apply six color palettes or a custom color from the native picker.
- Tune tab size/alignment, cover opacity/blur, label glass, border weight/opacity/radius, and SVG
  noise.
- Load complete design and behavior presets from the top dropdown.
- Copy a live single-file React component from the Code panel; styles and demo data are embedded,
  with no project-local file imports.
- Use keyboard, pointer, or touch interactions with reduced-motion support.
- Keep working when remote Pexels images fail through deterministic neutral fallbacks.

## Quick start

Requires [Bun](https://bun.sh) 1.3.14.

```sh
bun install
bun run dev
```

Open `http://localhost:3000`.

## Verify

```sh
bun run typecheck
bun run lint
bun run format:check
bun run test
bun run test:e2e
bun run build
```

## Documentation

- [Project readiness baseline](docs/project-readiness.md)
- [Architecture and engine contract](docs/architecture.md)
- [GitHub Pages deployment](docs/deployment.md)
- [Known tradeoffs](docs/technical-debt.md)

The app is fully static. It has no backend, secrets, API keys, or required environment
variables. Pexels imagery is used under the [Pexels license](https://www.pexels.com/license/).

## Status

- Release-candidate checks cover 98 unit tests and 22 Chromium end-to-end scenarios.
- Firefox, Safari, and manual screen-reader testing are not part of the automated baseline.
- All five animation adapters are intentionally bundled together for instant comparison.

## License

[MIT](LICENSE)

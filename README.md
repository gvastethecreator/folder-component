# Folder Component

A browser playground for comparing five animation engines on the same interactive folder
component: **GSAP**, **Motion**, **Anime.js**, pure **CSS**, and native **WAAPI**.

[Open the live playground](https://gvastethecreator.github.io/folder-component/)

## Features

- Switch animation engines without changing folder geometry or content.
- Tune spring/tween behavior, stagger, shape, spacing, and click feedback live.
- Copy a reusable React configuration from the Code panel.
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

- [Architecture and engine contract](docs/architecture.md)
- [GitHub Pages deployment](docs/deployment.md)
- [Known tradeoffs](docs/technical-debt.md)

The app is fully static. It has no backend, secrets, API keys, or required environment
variables. Pexels imagery is used under the [Pexels license](https://www.pexels.com/license/).

## Status

- Release-candidate checks cover 39 unit tests and 9 Chromium end-to-end scenarios.
- Firefox, Safari, and manual screen-reader testing are not part of the automated baseline.
- All five animation adapters are intentionally bundled together for instant comparison.

## License

[MIT](LICENSE)

# Deployment

The live playground is a GitHub Project Page:

<https://gvastethecreator.github.io/folder-component/>

## GitHub Pages

`.github/workflows/pages.yml` runs on pushes to `main` and can also start manually. It:

1. Installs the pnpm-locked dependencies.
2. Runs typecheck, lint, formatting, unit tests, Chromium flows, and a dependency audit.
3. Builds with the required Vite base path `/folder-component/`.
4. Uploads `dist/` as a Pages artifact.
5. Deploys through the `github-pages` environment.

Third-party Actions are pinned to full commit SHAs. The release tag stays as an inline comment so updates remain reviewable without mutable major-version tags.

GitHub Pages must use **GitHub Actions** as its publishing source. A `gh-pages` branch is not required.

The workflow installs pnpm 12.0.0 to match `packageManager`.

## Local production checks

Build the root-hosted app:

```sh
pnpm run build
pnpm run preview
```

Build the exact GitHub Pages artifact:

```sh
pnpm run build:pages
```

The Pages artifact must reference assets below `/folder-component/assets/`. The local development server stays at `http://localhost:3000/`.

# Deployment

The live playground is a GitHub Project Page at:

<https://gvastethecreator.github.io/folder-component/>

## GitHub Pages

`.github/workflows/pages.yml` runs on pushes to `main` and can also be started manually. It:

1. installs the pinned Bun dependencies;
2. runs typecheck, lint, formatting, unit tests, and dependency audit;
3. builds with the required Vite base path `/folder-component/`;
4. uploads `dist/` as a Pages artifact;
5. deploys through the `github-pages` environment.

GitHub Pages must use **GitHub Actions** as its publishing source. No `gh-pages` branch is
required.

## Local production checks

Build the root-hosted app:

```sh
bun run build
bun run preview
```

Build the exact GitHub Pages artifact:

```sh
bun run build:pages
```

The Pages artifact must reference assets below `/folder-component/assets/`. The regular local
development server stays at `http://localhost:3000/`.

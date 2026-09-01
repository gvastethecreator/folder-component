# Contributing

Thanks for helping improve Folder Component.

## Before you start

- Search existing issues before you open a new one.
- Keep changes focused on shared folder geometry, engine adapters, playground controls, or documentation.
- Do not add engine-specific geometry. Every engine must render the same folder contract.

## Local workflow

Use Node.js 24.15.0 and pnpm 12.0.0.

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm run test:e2e
pnpm run build:pages
```

Add the smallest test that proves a changed public behavior. For animation changes, cover every engine and reduced-motion behavior when those paths apply.

## Pull requests

Describe the user-visible change, the affected engines or controls, and the exact verification you ran. Include screenshots for visual changes.

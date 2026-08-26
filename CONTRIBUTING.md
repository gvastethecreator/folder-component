# Contributing

Thanks for helping improve Folder Component.

## Before you start

- Search existing issues before opening a new one.
- Keep changes focused on the shared folder geometry, engine adapters, playground controls, or documentation.
- Do not add engine-specific geometry. Every engine must render the same folder contract.

## Local workflow

Use Node.js 24.15.0 and pnpm 11.21.0.

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm run test:e2e
pnpm run build:pages
```

Add the smallest test that proves a changed public behavior. For animation changes, verify every engine and reduced-motion behavior when applicable.

## Pull requests

Describe the user-visible change, the affected engines or controls, and the exact verification you ran. Include screenshots for visual changes.

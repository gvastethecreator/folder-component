# Agent Guide — Folder Component

Standalone static React 19 + Vite 8 (Rolldown) + Tailwind v4 multi-engine playground.
Pure frontend (no backend, no AI Studio, no API keys). Package manager/runtime: **Bun**.
See `README.md` for the public entrypoint and `docs/architecture.md` for implementation details.

## Agent skills

### Issue tracker

Issues and PRDs live as markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles map 1:1 to label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — read `CONTEXT.md` and `docs/adr/` at the repo root (created lazily by `/grill-with-docs` when terms/decisions get resolved). See `docs/agents/domain.md`.

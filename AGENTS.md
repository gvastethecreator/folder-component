# Agent Guide — Image Style Folder Playground

Standalone static React 19 + Vite 8 (Rolldown) + Tailwind v4 + Motion single-page app.
Pure frontend (no backend, no AI Studio, no API keys). Package manager/runtime: **Bun**.
See `docs/project-readiness.md` for the current baseline and `README.md` for scripts.

## Agent skills

### Issue tracker

Issues and PRDs live as markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles map 1:1 to label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — read `CONTEXT.md` and `docs/adr/` at the repo root (created lazily by `/grill-with-docs` when terms/decisions get resolved). See `docs/agents/domain.md`.

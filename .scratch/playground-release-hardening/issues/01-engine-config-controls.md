# 01 — Engine truth and shared configuration

Status: ready-for-human

Resolution: completed and verified; awaiting maintainer review/commit.

## Tasks

1. Introduce one typed engine catalog for GSAP, Motion, Anime.js, CSS, and WAAPI.
2. Drive selector labels, header subtitle, gallery status, descriptions, capability notes, and generated code from the catalog.
3. Replace scattered `App` state/reset calls with one typed playground config/default transition seam.
4. Make the copied code example self-contained enough to compile after project imports are supplied; no undefined `folders` or `sharedSettings` placeholders. If it remains illustrative, label it honestly and include the complete config literal.
5. Disable stiffness/damping/mass when curve is Tween and connect an accessible explanation.
6. Explain CSS/WAAPI spring approximation in the live UI.
7. Split engine adapters/shared helpers only where ownership becomes clearer. Preserve the controller API and interruption/reduced-motion behavior.

## Acceptance

- CSS header says `CSS engine`; WAAPI header says `WAAPI engine`.
- Every engine label/description has one source of truth.
- Reset restores the exact exported default config.
- Unit tests independently assert all five header/status mappings.
- Snippet test rejects undefined placeholders.
- Tween physics controls are disabled and described; switching back to Spring preserves prior values.
- Existing five-engine component behavior remains green.

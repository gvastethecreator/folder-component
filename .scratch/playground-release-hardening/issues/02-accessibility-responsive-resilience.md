# 02 — Accessibility, responsive density, and image recovery

Status: ready-for-human

Resolution: completed and verified; awaiting maintainer review/commit.

## Tasks

1. Adjust theme tokens/usages so normal text in both themes reaches WCAG AA 4.5:1 on its rendered background.
2. Preserve hierarchy without 8–9 px low-contrast interactive labels.
3. Give range controls a usable pointer/touch hit area while retaining a compact visual track.
4. Keep one column at 320 px and use two compact columns at 390 px when geometry remains safe; prove no horizontal overflow with expanded folders.
5. Make clipped folder titles recoverable through a title/accessible-name path.
6. Add deterministic image failure handling for cover, tab, and file images. Broken external images must render a neutral tone, not browser broken-image chrome.
7. Preserve keyboard activation, focus expansion, touch toggle, and reduced-motion behavior.

## Acceptance

- Computed contrast >= 4.5:1 for normal text sampled in dark and light themes.
- 320 px: one column, no overflow. 390 px: two columns, no overflow, materially shorter than 6,000 px.
- Range controls expose >=24 px target or a standards-valid spacing/target implementation; mobile target aims at 44 px.
- Aborted Pexels requests produce zero visible broken images and an inspectable fallback marker.
- Component tests cover error fallback and recoverable truncation.
- Dark/light/mobile/offline screenshots show coherent output.

# Architecture

Folder Component is a static React 19 single-page app built with Vite and Tailwind CSS.
`src/App.tsx` owns one typed playground configuration and renders the folder grid plus control
panel.

## Animation boundary

`src/animation/folderEngines.ts` exposes one controller contract:

- `setOpen(open, immediate)` updates folder cards and the folder front.
- `pulse()` and `flash()` provide click feedback.
- `destroy()` cancels work and removes transient styles.

GSAP, Motion, Anime.js, CSS, and WAAPI implement that contract. Geometry and deployment choice
remain engine-independent. `src/animation/engineCatalog.ts` is the source of truth for public
engine labels, capability notes, and the generated code example.

The shared geometry contract exposes nine layouts (`fan`, `skew3d`, `cascade`, `scatter`,
`horizontal_stack`, `orbit`, `staircase`, `burst`, and `deck_split`). Every engine receives the
same collapsed and expanded transform arrays, so layout behavior cannot drift between adapters.

## State and rendering

- `src/types.ts` owns the shared configuration, defaults, reducer, and stable random deployment.
- `src/config/playgroundCatalog.ts` owns palette and design/behavior preset catalogs.
- `src/components/StyleFolder.tsx` owns folder interaction and engine lifecycle.
- `src/components/PlaygroundControls.tsx` owns accessible controls and code copying.
- `src/components/ImageWithFallback.tsx` contains remote image recovery.
- `src/data/stylesData.ts` derives 20 folders with globally unique cover URLs from curated data.

The app honors `prefers-reduced-motion`, clears interrupted feedback during engine changes, and
uses an auto-fit grid capped at nine columns. The density control changes the minimum folder size;
320 px resolves to one column, 390 px to two, and ultrawide viewports to at most nine without
horizontal overflow.

Folder chrome is driven by CSS custom properties emitted by `StyleFolder`: tab width/height,
left/right alignment, matched outer/inner radii, border width/opacity, palette, and label glass.
App-level custom properties control SVG noise intensity/scale and grid density.

Every folder root is its own stacking context. Resting folders use layer `1`; the hovered,
focused, or toggle-locked folder moves to layer `50`, keeping expanded cards above adjacent
folders without changing their geometry.

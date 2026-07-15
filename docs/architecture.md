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
engine labels, capability notes, and the live single-file React export. The export embeds its demo
data and styles, contains no project-local imports or remote assets, and emits only the adapter
required by the selected engine.

`src/animation/animationTiming.ts` is the timing source of truth shared by the live adapters and
the generated export. It maps each curve to duration, native easing, GSAP easing, and Motion or
Anime.js spring profiles. Closing stagger order, reduced-motion behavior, and selected tone/image
surfaces are also preserved by the export contract.

The shared geometry contract exposes nine layouts (`fan`, `skew3d`, `cascade`, `scatter`,
`horizontal_stack`, `orbit`, `staircase`, `burst`, and `deck_split`). Every engine receives the
same collapsed and expanded transform arrays, so layout behavior cannot drift between adapters.

## State and rendering

- `src/types.ts` owns the shared configuration, defaults, reducer, and stable random deployment.
- `src/config/playgroundCatalog.ts` owns palette and design/behavior preset catalogs.
- `src/config/folderShapeGeometry.ts` derives the Windows 11 back/front SVG paths from the active
  tab and corner controls while preserving the supplied 224 x 176 reference geometry.
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

The Windows 11 silhouette uses matching SVG clip paths and outlines for its back and front
layers. Right alignment mirrors the complete geometry, so the diagonal tab transition, rounded
corners, and configurable border remain one coherent shape. Cover opacity and blur are applied to
the image layer only; folder labels and interaction feedback stay crisp. The standalone export
embeds the same computed paths and image-layer effects.

Every folder root is its own stacking context. Resting folders use layer `1`; the hovered,
focused, or toggle-locked folder moves to layer `50`, keeping expanded cards above adjacent
folders without changing their geometry.

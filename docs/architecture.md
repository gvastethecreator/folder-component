# Architecture

Folder Component is a static React 19 single-page app built with Vite and Tailwind CSS.
`src/App.tsx` owns one typed playground configuration and renders the folder grid plus control
panel.

## Animation boundary

`src/animation/folderEngines.ts` exposes one controller contract:

- `setOpen(open, immediate)` updates folder cards and the folder front.
- `pulse()` and `flash()` provide click feedback.
- `destroy()` cancels work and removes transient styles.

GSAP, Motion, Anime.js, CSS, and WAAPI implement that contract. Geometry and deployment order
remain engine-independent. `src/animation/engineCatalog.ts` is the source of truth for public
engine labels, capability notes, and the generated code example.

## State and rendering

- `src/types.ts` owns the shared configuration, defaults, reducer, and deployment cycle.
- `src/components/StyleFolder.tsx` owns folder interaction and engine lifecycle.
- `src/components/PlaygroundControls.tsx` owns accessible controls and code copying.
- `src/components/ImageWithFallback.tsx` contains remote image recovery.
- `src/data/stylesData.ts` contains the curated style data and Pexels URLs.

The app honors `prefers-reduced-motion`, clears interrupted feedback during engine changes, and
uses one column at 320 px and two columns at 390 px without horizontal overflow.

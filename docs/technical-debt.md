# Known Tradeoffs

## Eager animation adapters

GSAP, Motion, and Anime.js ship in the same initial bundle as the CSS and WAAPI adapters. This
makes engine switching instant and deterministic in the comparison playground, but increases
the initial JavaScript payload. A future split should be accepted only with a measured bundle
improvement and a green interaction gate.

## Browser coverage

Automated end-to-end coverage currently uses Chromium. Firefox, Safari, and a manual
screen-reader pass remain outside the release gate.

## External assets

The curated examples load remote Pexels images and the page requests Inter and JetBrains Mono
from Google Fonts. Image failures do not break the layout: `ImageWithFallback` renders stable
neutral surfaces instead, and font stacks include local system fallbacks. A self-hosted asset pass
would remove both network dependencies at the cost of repository and transfer size.

## Module concentration

The control panel and global stylesheet remain the largest maintenance surfaces. Their sections
are cohesive and covered by component and browser tests, so splitting them without a concrete
change seam would add indirection. Extract a section only when a feature needs independent state,
tests, or reuse.

## Dependency update cadence

Dependencies and immutable Action SHAs are verified manually; automated dependency pull requests
are not enabled. This avoids unsolicited maintenance traffic, but requires periodic `bun outdated`,
`bun audit`, and upstream Action release checks.

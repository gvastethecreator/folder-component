# Known Tradeoffs

## Eager animation adapters

GSAP, Motion, and Anime.js ship in the same initial bundle as the CSS and WAAPI adapters. This
makes engine switching instant and deterministic in the comparison playground, but increases
the initial JavaScript payload. A future split should be accepted only with a measured bundle
improvement and a green interaction gate.

## Browser coverage

Automated end-to-end coverage currently uses Chromium. Firefox, Safari, and a manual
screen-reader pass remain outside the release gate.

## External images

The curated examples load remote Pexels images. Network failures do not break the layout:
`ImageWithFallback` renders stable neutral surfaces instead. A self-hosted asset pass would
remove the network dependency at the cost of repository and transfer size.

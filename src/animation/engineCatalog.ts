import type { AnimationEngine, PlaygroundConfig } from "../types";
import { FOLDER_PALETTES } from "../config/playgroundCatalog";
import {
  getWindows11ClipTransform,
  getWindows11FolderPaths,
  getWindows11OutlineTransform,
  WINDOWS11_FOLDER_VIEWBOX,
} from "../config/folderShapeGeometry";
import { getGsapEase, getMotionDuration, getNativeEase, getSpringProfile } from "./animationTiming";

export type SpringCapability = "native" | "approximation";

export interface EngineCatalogEntry {
  id: AnimationEngine;
  label: string;
  statusLabel: string;
  description: string;
  springCapability: string;
  springMode: SpringCapability;
}

/** Single source of truth for engine labels, status copy, and capability disclosure. */
export const ENGINE_CATALOG = {
  gsap: {
    id: "gsap",
    label: "GSAP",
    statusLabel: "GSAP engine",
    description: "Timeline-driven transforms with scoped React cleanup.",
    springCapability:
      "Spring settings map to GSAP back easing and duration; stiffness and mass influence feel indirectly.",
    springMode: "approximation",
  },
  motion: {
    id: "motion",
    label: "Motion",
    statusLabel: "Motion engine",
    description: "Motion spring or tween transitions on the shared folder geometry.",
    springCapability: "Native spring physics uses stiffness, damping, and mass directly.",
    springMode: "native",
  },
  animejs: {
    id: "animejs",
    label: "Anime.js",
    statusLabel: "Anime.js engine",
    description: "Anime.js transforms with native spring and stagger timing.",
    springCapability: "Native spring physics uses stiffness, damping, and mass directly.",
    springMode: "native",
  },
  css: {
    id: "css",
    label: "CSS",
    statusLabel: "CSS engine",
    description: "CSS transitions and keyframes with no animation library runtime.",
    springCapability:
      "CSS spring is an approximation: stiffness, damping, and mass map to duration and cubic-bezier overshoot.",
    springMode: "approximation",
  },
  waapi: {
    id: "waapi",
    label: "WAAPI",
    statusLabel: "WAAPI engine",
    description: "Native Web Animations API controls through Element.animate().",
    springCapability:
      "WAAPI spring is an approximation: stiffness, damping, and mass map to duration and cubic-bezier overshoot.",
    springMode: "approximation",
  },
} as const satisfies Record<AnimationEngine, EngineCatalogEntry>;

export const ENGINE_CATALOG_LIST: readonly EngineCatalogEntry[] = [
  ENGINE_CATALOG.gsap,
  ENGINE_CATALOG.motion,
  ENGINE_CATALOG.animejs,
  ENGINE_CATALOG.css,
  ENGINE_CATALOG.waapi,
];

const quote = (value: string) => JSON.stringify(value);

function standaloneEngineImport(engine: AnimationEngine) {
  if (engine === "gsap") return 'import gsap from "gsap";';
  if (engine === "motion") return 'import { animate } from "motion";';
  if (engine === "animejs") return 'import { animate, spring } from "animejs";';
  return "";
}

function standaloneEngineAdapter(config: PlaygroundConfig) {
  const engine = config.animationEngine;
  const springProfile = getSpringProfile(config.transitionCurve, config.springSettings);

  if (engine === "gsap") {
    return `function animateFolder(root, open, immediate = false) {
  const duration = immediate ? 0 : motionDuration;
  const cards = [...root.querySelectorAll(".demo-file")];
  cards.forEach((card, index) => {
    gsap.to(card, {
      transform: open ? card.dataset.openTransform : card.dataset.closedTransform,
      duration,
      delay: immediate ? 0 : orderedDelay(index, cards.length, open),
      ease: ${quote(getGsapEase(config.transitionCurve, config.springSettings))},
      overwrite: "auto",
    });
  });
  gsap.to(root.querySelector(".demo-front"), {
    transform: coverTransform(open),
    duration,
    ease: "power3.out",
    overwrite: "auto",
  });
}`;
  }

  if (engine === "motion") {
    return `function animateFolder(root, open, immediate = false) {
  const transition = immediate
    ? { duration: 0 }
    : config.transitionCurve === "tween"
      ? { duration: motionDuration, ease: [0.16, 1, 0.3, 1] }
      : {
          type: "spring",
          stiffness: ${springProfile.stiffness},
          damping: ${springProfile.damping},
          mass: ${springProfile.mass},
        };
  const cards = [...root.querySelectorAll(".demo-file")];
  cards.forEach((card, index) => {
    animate(
      card,
      { transform: open ? card.dataset.openTransform : card.dataset.closedTransform },
      { ...transition, delay: immediate ? 0 : orderedDelay(index, cards.length, open) },
    );
  });
  animate(root.querySelector(".demo-front"), { transform: coverTransform(open) }, transition);
}`;
  }

  if (engine === "animejs") {
    return `function animateFolder(root, open, immediate = false) {
  const ease =
    config.transitionCurve === "tween"
      ? "out(4)"
      : spring({
          stiffness: ${springProfile.stiffness},
          damping: ${springProfile.damping},
          mass: ${springProfile.mass},
        });
  const cards = [...root.querySelectorAll(".demo-file")];
  cards.forEach((card, index) => {
    animate(card, {
      transform: open ? card.dataset.openTransform : card.dataset.closedTransform,
      duration: immediate ? 0 : motionDuration * 1000,
      delay: immediate ? 0 : orderedDelay(index, cards.length, open) * 1000,
      ease,
    });
  });
  animate(root.querySelector(".demo-front"), {
    transform: coverTransform(open),
    duration: immediate ? 0 : motionDuration * 1000,
    ease,
  });
}`;
  }

  if (engine === "waapi") {
    return `function animateElement(element, transform, delay = 0, immediate = false) {
  if (!element?.animate) return;
  element.getAnimations().forEach((animation) => animation.cancel());
  element.animate(
    [{ transform: getComputedStyle(element).transform }, { transform }],
    {
      duration: immediate ? 0 : motionDuration * 1000,
      delay: immediate ? 0 : delay * 1000,
      easing: ${quote(getNativeEase(config.transitionCurve, config.springSettings))},
      fill: "forwards",
    },
  );
}

function animateFolder(root, open, immediate = false) {
  const cards = [...root.querySelectorAll(".demo-file")];
  cards.forEach((card, index) => {
    animateElement(
      card,
      open ? card.dataset.openTransform : card.dataset.closedTransform,
      orderedDelay(index, cards.length, open),
      immediate,
    );
  });
  animateElement(root.querySelector(".demo-front"), coverTransform(open), 0, immediate);
}`;
  }

  return `function animateFolder(root, open, immediate = false) {
  root.dataset.immediate = String(immediate);
  root.dataset.open = String(open);
  requestAnimationFrame(() => delete root.dataset.immediate);
}`;
}

function standaloneStyles(config: PlaygroundConfig, palette: readonly string[]) {
  const light = config.theme === "light";
  const wideShape = config.folderShape === "horizontal" || config.folderShape === "windows11";
  const width = wideShape ? "180px" : `${config.gridItemSize}px`;
  const aspect =
    config.folderShape === "vertical"
      ? "9 / 13"
      : config.folderShape === "square"
        ? "1"
        : config.folderShape === "windows11"
          ? "224 / 176"
          : "7 / 5";
  const cssEase = getNativeEase(config.transitionCurve, config.springSettings);
  const motionDuration = getMotionDuration(config.transitionCurve, config.springSettings);
  const coverImageOpacity = config.visualSource === "image" ? config.coverImageOpacity : 1;
  const coverImageBlur = config.visualSource === "image" ? config.coverImageBlur : 0;
  const coverImageScale = 1 + Math.min(0.14, coverImageBlur / 160);

  return `.standalone-folders {
  --accent: ${palette[0]};
  --mid: ${palette[1]};
  --deep: ${palette[2]};
  min-height: 100vh;
  padding: 48px;
  color: ${light ? "#242321" : "#f5f5f4"};
  background: ${light ? "#f4f3ef" : "#090909"};
  font: 500 12px/1.4 Inter, ui-sans-serif, system-ui, sans-serif;
}
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${config.gridItemSize}px), 1fr));
  gap: 72px 24px;
  max-width: ${config.gridItemSize * 6 + 120}px;
  margin: 0 auto;
}
.demo-folder {
  position: relative;
  isolation: isolate;
  width: min(100%, ${width});
  aspect-ratio: ${aspect};
  justify-self: center;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
  perspective: 900px;
}
.demo-back,
.demo-front,
.demo-file {
  position: absolute;
  inset: 0;
  border: ${config.folderBorderWidth}px solid rgb(from var(--accent) r g b / ${config.folderBorderOpacity});
  border-radius: ${config.folderRadius}px;
}
.demo-back {
  z-index: 1;
  background: linear-gradient(145deg, var(--mid), var(--deep));
  box-shadow: 0 18px ${config.cardShadowBlur}px rgb(0 0 0 / ${config.cardShadowOpacity});
}
.demo-tab {
  position: absolute;
  ${config.tabAlignment}: 0;
  top: -${config.tabHeight}px;
  width: ${config.tabWidth}%;
  height: ${config.tabHeight}px;
  background: ${config.tabFill === "color" ? config.tabColor : "var(--cover-art)"};
  background-size: cover;
  background-position: top center;
  border-radius: ${Math.min(config.folderRadius, 8)}px ${Math.min(config.folderRadius, 8)}px 0 0;
}
.demo-file {
  z-index: calc(2 + var(--index));
  overflow: hidden;
  transform: var(--closed-transform);
  transform-origin: bottom center;
  background: var(--file-art);
  box-shadow: 0 10px ${config.cardShadowBlur}px rgb(0 0 0 / ${config.cardShadowOpacity});
  will-change: transform;
}
.demo-file::after {
  position: absolute;
  inset: auto 0 0;
  padding: 7px;
  content: attr(data-label);
  color: ${light ? "#242321" : "#f5f5f4"};
  background: ${light ? "rgb(246 245 241 / .88)" : "rgb(10 10 11 / .88)"};
}
.demo-front {
  z-index: 8;
  overflow: hidden;
  transform-origin: bottom center;
  background: linear-gradient(145deg, var(--mid), var(--deep));
  box-shadow: inset 0 1px rgb(255 255 255 / .18), inset 0 -18px 28px rgb(0 0 0 / .32);
  will-change: transform;
}
.demo-front::before {
  position: absolute;
  z-index: 0;
  inset: 0;
  content: "";
  background: var(--cover-art) center / cover;
  opacity: ${coverImageOpacity};
  filter: blur(${coverImageBlur}px);
  transform: scale(${coverImageScale});
  transform-origin: center;
}
.demo-label {
  position: absolute;
  z-index: 4;
  inset: auto -2px -2px;
  padding: 9px;
  color: ${light ? "#242321" : "#f5f5f4"};
  background: ${light ? `rgb(246 245 241 / ${config.labelOpacity})` : `rgb(10 10 11 / ${config.labelOpacity})`};
  backdrop-filter: blur(${config.labelBackdropBlur}px);
}
.demo-flash {
  position: absolute;
  z-index: 9;
  inset: 0;
  pointer-events: none;
  background: white;
  opacity: 0;
}
.demo-shape-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
.demo-folder[data-shape="windows11"] .demo-back,
.demo-folder[data-shape="windows11"] .demo-front {
  border-width: 0;
  border-radius: 0;
}
.demo-folder[data-shape="windows11"] .demo-back {
  clip-path: url(#demo-windows11-back);
  box-shadow: none;
  filter: drop-shadow(0 8px ${config.cardShadowBlur}px rgb(0 0 0 / ${config.cardShadowOpacity}));
}
.demo-folder[data-shape="windows11"] .demo-front {
  clip-path: url(#demo-windows11-front);
}
.demo-folder[data-shape="windows11"] .demo-tab {
  top: 0;
  height: ${config.tabHeight}px;
  border-radius: ${config.folderRadius}px ${config.folderRadius}px 0 0;
}
.demo-shape-outline {
  position: absolute;
  z-index: 7;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.demo-shape-outline path {
  fill: none;
  stroke-width: ${config.folderBorderWidth * 2}px;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
.demo-shape-outline-back path {
  stroke: rgb(from var(--mid) r g b / ${config.folderBorderOpacity});
}
.demo-shape-outline-front path {
  stroke: rgb(from var(--accent) r g b / ${config.folderBorderOpacity});
}
.standalone-folders[data-engine="css"] .demo-file,
.standalone-folders[data-engine="css"] .demo-front {
  transition: transform ${motionDuration}s ${cssEase};
}
.standalone-folders[data-engine="css"] .demo-file {
  transition-delay: calc(var(--index) * ${config.staggerDelay}s);
}
.standalone-folders[data-engine="css"] .demo-folder[data-open="false"] .demo-file {
  transition-delay: calc(var(--reverse-index) * ${config.staggerDelay}s);
}
.standalone-folders[data-engine="css"] .demo-folder[data-open="true"] .demo-file {
  transform: var(--open-transform);
}
.standalone-folders[data-engine="css"] .demo-folder[data-open="true"] .demo-front {
  transform: translateY(-4px) rotateX(${config.coverTilt}deg) scale(.98);
}
.standalone-folders[data-engine="css"] .demo-folder[data-immediate="true"] > * {
  transition-duration: 0s;
}
${
  config.textureEnabled
    ? `.demo-back::after, .demo-front::after, .demo-file::before {
  position: absolute;
  z-index: 2;
  inset: 0;
  content: "";
  pointer-events: none;
  opacity: ${config.noiseOpacity * 0.18};
  background-size: ${config.noiseScale}px ${config.noiseScale}px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
}`
    : ""
}
@media (prefers-reduced-motion: reduce) {
  .demo-file, .demo-front { transition-duration: 0s !important; }
}`;
}

/** Builds a complete single-file React demo from the current playground state. */
export function buildPlaygroundSnippet(config: PlaygroundConfig): string {
  const palette = FOLDER_PALETTES[config.paletteId].colors;
  const styles = standaloneStyles(config, palette);
  const engineImport = standaloneEngineImport(config.animationEngine);
  const engineAdapter = standaloneEngineAdapter(config);
  const windows11ClipTransform = getWindows11ClipTransform(config.tabAlignment);
  const windows11OutlineTransform = getWindows11OutlineTransform(config.tabAlignment) ?? "";
  const windows11Paths = getWindows11FolderPaths(
    config.tabWidth,
    config.tabHeight,
    config.folderRadius,
  );
  const demoFolders = [
    {
      id: "signal",
      title: "Signal Archive",
      artwork: `linear-gradient(145deg, ${palette[0]}, ${palette[2]} 72%)`,
    },
    {
      id: "field",
      title: "Field Notes",
      artwork: `linear-gradient(35deg, ${palette[2]}, ${palette[1]} 48%, ${palette[0]})`,
    },
    {
      id: "motion",
      title: "Motion Studies",
      artwork: `radial-gradient(circle at 25% 20%, ${palette[0]}, ${palette[2]} 68%)`,
    },
  ];

  return `import { useRef } from "react";
${engineImport}

const config = ${JSON.stringify(config, null, 2)};
const palette = ${JSON.stringify(palette)};
const folders = ${JSON.stringify(demoFolders, null, 2)};
const deploymentStyles = [
  "fan", "skew3d", "cascade", "scatter", "horizontal_stack",
  "orbit", "staircase", "burst", "deck_split",
];
const motionDuration = ${getMotionDuration(config.transitionCurve, config.springSettings)};

function stableDeployment(key) {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return deploymentStyles[(hash >>> 0) % deploymentStyles.length];
}

function layoutFor(style, index, total) {
  const center = (total - 1) / 2;
  const offset = index - center;
  const direction = config.fanDirection === "left" ? -1 : config.fanDirection === "right" ? 1 : 0;
  let x = offset * 28;
  let y = -18 - Math.abs(offset) * 7;
  let rotation = offset * config.fanAngle;
  let scale = 1;

  if (style === "skew3d") { x *= 0.75; y -= index * 9; rotation = offset * config.fanAngle * 0.58; scale -= index * 0.025; }
  if (style === "cascade") { x = offset * 18; y = -(index + 1) * 13; rotation = offset * config.fanAngle * 0.18; }
  if (style === "scatter") { x = ((index * 37) % 90) - 45; y = -22 - ((index * 29) % 58); rotation = (((index * 17) % 24) - 12) * (config.fanAngle / 6); }
  if (style === "horizontal_stack") { x = offset * 38; y = -22; rotation = (index % 2 === 0 ? 1 : -1) * (config.fanAngle / 3.5); }
  if (style === "orbit") { const angle = (index / Math.max(total - 1, 1)) * Math.PI; x = Math.cos(angle) * 58; y = Math.sin(angle) * -30 - 38; rotation = offset * config.fanAngle * 0.72; }
  if (style === "staircase") { x = offset * 26; y = -18 - index * 14; rotation = offset * config.fanAngle * 0.25; }
  if (style === "burst") { x = offset * 44; y = -28 - Math.abs(offset) * 16; rotation = offset * config.fanAngle; }
  if (style === "deck_split") { const side = index % 2 === 0 ? -1 : 1; x = side * (31 + Math.floor(index / 2) * 12); y = -24 - Math.floor(index / 2) * 16; rotation = side * config.fanAngle * (0.5 + Math.floor(index / 2) * 0.12); }
  if (total === 1 && rotation === 0) rotation = config.fanAngle * 0.18;

  x *= config.spacingMultiplier;
  y *= config.spacingMultiplier;
  if (config.orientation === "horizontal") [x, y] = [-y, x];
  if (direction !== 0) {
    x += direction * (34 + index * 5) * config.spacingMultiplier;
    rotation += direction * config.fanAngle * 0.15;
  }
  return { x, y, rotation, scale };
}

function transformFor(layout) {
  return "translate(" + layout.x + "px, " + layout.y + "px) rotate(" + layout.rotation + "deg) scale(" + layout.scale + ")";
}

function coverTransform(open) {
  return open
    ? "translateY(-4px) rotateX(" + config.coverTilt + "deg) scale(.98)"
    : "translateY(0) rotateX(0deg) scale(1)";
}

function orderedDelay(index, count, open) {
  return (open ? index : count - index - 1) * config.staggerDelay;
}

${engineAdapter}

function FolderShapeDefs() {
  if (config.folderShape !== "windows11") return null;

  return (
    <svg className="demo-shape-defs" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="demo-windows11-back" clipPathUnits="objectBoundingBox">
          <path d=${quote(windows11Paths.back)} transform=${quote(windows11ClipTransform)} />
        </clipPath>
        <clipPath id="demo-windows11-front" clipPathUnits="objectBoundingBox">
          <path d=${quote(windows11Paths.front)} transform=${quote(windows11ClipTransform)} />
        </clipPath>
      </defs>
    </svg>
  );
}

function DemoFolder({ folder }) {
  const rootRef = useRef(null);
  const lockedRef = useRef(false);
  const style = config.deploymentMode === "random" ? stableDeployment(folder.id) : config.deploymentMode;
  const files = Array.from({ length: config.visibleCardsCount }, (_, index) => index);
  const coverArt = config.visualSource === "image"
    ? folder.artwork
    : "linear-gradient(145deg, " + palette[0] + ", " + palette[2] + " 72%)";

  const setOpen = (open) => {
    const root = rootRef.current;
    if (!root) return;
    root.dataset.open = String(open);
    root.setAttribute("aria-expanded", String(open));
    animateFolder(root, open);
  };

  const handleClick = () => {
    const root = rootRef.current;
    if (!root) return;
    if (config.clickBehavior === "toggle") {
      lockedRef.current = !lockedRef.current;
      setOpen(lockedRef.current);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = config.clickBehavior === "flash" ? root.querySelector(".demo-flash") : root;
    if (!target?.animate) return;
    const frames = config.clickBehavior === "flash"
      ? [{ opacity: 0.28 }, { opacity: 0 }]
      : [{ transform: "scale(.975)" }, { transform: "scale(1)" }];
    target.animate(frames, { duration: 260, easing: "ease-out" });
  };

  return (
    <button
      ref={rootRef}
      type="button"
      className="demo-folder"
      data-open="false"
      data-shape={config.folderShape}
      aria-expanded="false"
      aria-label={folder.title}
      style={{ "--cover-art": coverArt }}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => !lockedRef.current && setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => !lockedRef.current && setOpen(false)}
      onClick={handleClick}
    >
      <span className="demo-back">
        {config.cardStyle === "folder" && <span className="demo-tab" />}
        {config.folderShape === "windows11" && (
          <svg className="demo-shape-outline demo-shape-outline-back" viewBox=${quote(WINDOWS11_FOLDER_VIEWBOX)} preserveAspectRatio="none" aria-hidden="true">
            <path d=${quote(windows11Paths.back)} transform=${quote(windows11OutlineTransform)} />
          </svg>
        )}
      </span>
      {files.map((fileIndex) => {
        const layout = layoutFor(style, fileIndex, files.length);
        const openTransform = transformFor(layout);
        const closedTransform = "translate(0, " + (10 + fileIndex * 2) + "px) scale(" + (0.9 + fileIndex * 0.015) + ")";
        const art = config.visualSource === "image"
          ? folder.artwork
          : "linear-gradient(145deg, " + palette[fileIndex % palette.length] + ", " + palette[2] + ")";
        return (
          <span
            key={fileIndex}
            className="demo-file"
            data-label={"FILE " + String(fileIndex + 1).padStart(2, "0")}
            data-open-transform={openTransform}
            data-closed-transform={closedTransform}
            style={{
              "--index": fileIndex,
              "--reverse-index": files.length - fileIndex - 1,
              "--open-transform": openTransform,
              "--closed-transform": closedTransform,
              "--file-art": art,
            }}
          />
        );
      })}
      <span className="demo-front">
        {config.labelVisible && <span className="demo-label">{folder.title}</span>}
        {config.folderShape === "windows11" && (
          <svg className="demo-shape-outline demo-shape-outline-front" viewBox=${quote(WINDOWS11_FOLDER_VIEWBOX)} preserveAspectRatio="none" aria-hidden="true">
            <path d=${quote(windows11Paths.front)} transform=${quote(windows11OutlineTransform)} />
          </svg>
        )}
      </span>
      <span className="demo-flash" />
    </button>
  );
}

const styles = \`${styles}\`;

export default function FolderGridDemo() {
  return (
    <section className="standalone-folders" data-engine={config.animationEngine} data-theme={config.theme}>
      <style>{styles}</style>
      <FolderShapeDefs />
      <div className="demo-grid">
        {folders.map((folder) => <DemoFolder key={folder.id} folder={folder} />)}
      </div>
    </section>
  );
}`;
}

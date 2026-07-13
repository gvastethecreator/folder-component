import type { AnimationEngine, PlaygroundConfig } from "../types";

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

/**
 * Build a copyable, illustrative component example with every shared prop defined locally.
 * Project imports remain explicit so users can adapt paths without hidden placeholders.
 */
export function buildPlaygroundSnippet(config: PlaygroundConfig): string {
  const engine = ENGINE_CATALOG[config.animationEngine];

  return `// Illustrative ${engine.label} setup. Supply these project imports in your app.
import type { CSSProperties } from "react";
import StyleFolder from "./components/StyleFolder";
import { STYLES_DATA } from "./data/stylesData";
import { deploymentForKey } from "./types";

const animationEngine = ${quote(config.animationEngine)} as const;
const deploymentMode = ${quote(config.deploymentMode)} as const;
const playgroundStyle = {
  "--noise-opacity": ${config.noiseOpacity},
  "--noise-scale": "${config.noiseScale}px",
  "--grid-item-min": "${config.gridItemSize}px",
} as CSSProperties;
const sharedConfig = {
  orientation: ${quote(config.orientation)} as const,
  springSettings: {
    stiffness: ${config.springSettings.stiffness},
    damping: ${config.springSettings.damping},
    mass: ${config.springSettings.mass},
  },
  spacingMultiplier: ${config.spacingMultiplier},
  visibleCardsCount: ${config.visibleCardsCount},
  fanDirection: ${quote(config.fanDirection)} as const,
  fanAngle: ${config.fanAngle},
  coverTilt: ${config.coverTilt},
  staggerDelay: ${config.staggerDelay},
  clickBehavior: ${quote(config.clickBehavior)} as const,
  transitionCurve: ${quote(config.transitionCurve)} as const,
  folderShape: ${quote(config.folderShape)} as const,
  cardStyle: ${quote(config.cardStyle)} as const,
  gridItemSize: ${config.gridItemSize},
  compact: true,
  textureEnabled: ${config.textureEnabled},
  tabFill: ${quote(config.tabFill)} as const,
  tabColor: ${quote(config.tabColor)},
  tabWidth: ${config.tabWidth},
  tabHeight: ${config.tabHeight},
  tabAlignment: ${quote(config.tabAlignment)} as const,
  labelVisible: ${config.labelVisible},
  labelOpacity: ${config.labelOpacity},
  labelBackdropBlur: ${config.labelBackdropBlur},
  folderBorderWidth: ${config.folderBorderWidth},
  folderBorderOpacity: ${config.folderBorderOpacity},
  folderRadius: ${config.folderRadius},
  paletteId: ${quote(config.paletteId)} as const,
  visualSource: ${quote(config.visualSource)} as const,
};

<div
  data-theme=${quote(config.theme)}
  data-texture-enabled={${config.textureEnabled}}
  className="${config.theme === "light" ? "theme-light" : "theme-dark"} app-shell"
  style={playgroundStyle}
>
  <div className="folders-grid">
    {STYLES_DATA.map((folder) => (
      <StyleFolder
        key={folder.id}
        folder={folder}
        animationEngine={animationEngine}
        deploymentStyle={
          deploymentMode === "random" ? deploymentForKey(folder.id) : deploymentMode
        }
        {...sharedConfig}
      />
    ))}
  </div>
</div>;`;
}

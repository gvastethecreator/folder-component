import { FOLDER_DEPLOYMENTS } from "../types";
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
import StyleFolder from "./components/StyleFolder";
import { STYLES_DATA } from "./data/stylesData";

const animationEngine = ${quote(config.animationEngine)} as const;
const stackDeployments = [${FOLDER_DEPLOYMENTS.map(quote).join(", ")}] as const;
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
  compact: true,
  textureEnabled: ${config.textureEnabled},
  tabFill: ${quote(config.tabFill)} as const,
  tabColor: ${quote(config.tabColor)},
  visualSource: ${quote(config.visualSource)} as const,
};

STYLES_DATA.map((folder, index) => (
  <StyleFolder
    key={folder.id}
    folder={folder}
    animationEngine={animationEngine}
    deploymentStyle={stackDeployments[index % stackDeployments.length]}
    {...sharedConfig}
  />
));`;
}

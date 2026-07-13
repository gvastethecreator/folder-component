import { DEFAULT_PLAYGROUND_CONFIG } from "../types";
import type { PaletteId, PlaygroundConfig } from "../types";

export interface FolderPalette {
  id: PaletteId;
  label: string;
  colors: readonly [string, string, string];
}

export const FOLDER_PALETTES = {
  graphite: { id: "graphite", label: "Graphite", colors: ["#737373", "#404040", "#171717"] },
  ember: { id: "ember", label: "Ember", colors: ["#fb923c", "#c2410c", "#431407"] },
  ocean: { id: "ocean", label: "Ocean", colors: ["#22d3ee", "#2563eb", "#172554"] },
  forest: { id: "forest", label: "Forest", colors: ["#4ade80", "#15803d", "#052e16"] },
  orchid: { id: "orchid", label: "Orchid", colors: ["#e879f9", "#9333ea", "#3b0764"] },
  citrus: { id: "citrus", label: "Citrus", colors: ["#facc15", "#f97316", "#422006"] },
} as const satisfies Record<PaletteId, FolderPalette>;

export const FOLDER_PALETTE_LIST: readonly FolderPalette[] = Object.values(FOLDER_PALETTES);

export type DesignPresetId = "balanced" | "editorial" | "kinetic" | "orbital" | "tactile";

export interface DesignPreset {
  id: DesignPresetId;
  label: string;
  description: string;
  config: PlaygroundConfig;
}

export const DEFAULT_PRESET_ID: DesignPresetId = "balanced";

function createPresetConfig(overrides: Partial<PlaygroundConfig>): PlaygroundConfig {
  return {
    ...DEFAULT_PLAYGROUND_CONFIG,
    ...overrides,
    springSettings: {
      ...DEFAULT_PLAYGROUND_CONFIG.springSettings,
      ...overrides.springSettings,
    },
  };
}

export const DESIGN_PRESETS = {
  balanced: {
    id: "balanced",
    label: "Balanced studio",
    description: "A flexible random layout mix with measured GSAP spring motion.",
    config: createPresetConfig({
      animationEngine: "gsap",
      deploymentMode: "random",
      transitionCurve: "spring",
      paletteId: "graphite",
      tabColor: FOLDER_PALETTES.graphite.colors[0],
      theme: "dark",
      folderShape: "vertical",
      cardStyle: "folder",
      visualSource: "image",
      springSettings: { stiffness: 185, damping: 14, mass: 1 },
      spacingMultiplier: 1,
      staggerDelay: 0.03,
    }),
  },
  editorial: {
    id: "editorial",
    label: "Editorial calm",
    description: "A light, wide composition with a restrained split deck.",
    config: createPresetConfig({
      animationEngine: "motion",
      deploymentMode: "deck_split",
      transitionCurve: "tween",
      paletteId: "citrus",
      tabFill: "color",
      tabColor: FOLDER_PALETTES.citrus.colors[0],
      theme: "light",
      folderShape: "horizontal",
      cardStyle: "classic",
      spacingMultiplier: 0.9,
      staggerDelay: 0.02,
    }),
  },
  kinetic: {
    id: "kinetic",
    label: "Kinetic burst",
    description: "Anime.js elastic energy with a vivid radial expansion.",
    config: createPresetConfig({
      animationEngine: "animejs",
      deploymentMode: "burst",
      transitionCurve: "elastic",
      paletteId: "orchid",
      tabFill: "color",
      tabColor: FOLDER_PALETTES.orchid.colors[0],
      theme: "dark",
      folderShape: "square",
      cardStyle: "folder",
      spacingMultiplier: 1.08,
      staggerDelay: 0.045,
    }),
  },
  orbital: {
    id: "orbital",
    label: "Orbital bounce",
    description: "Native WAAPI motion arranged on a compact upper arc.",
    config: createPresetConfig({
      animationEngine: "waapi",
      deploymentMode: "orbit",
      transitionCurve: "bounce",
      paletteId: "ocean",
      tabFill: "color",
      tabColor: FOLDER_PALETTES.ocean.colors[0],
      theme: "dark",
      folderShape: "square",
      cardStyle: "folder",
      spacingMultiplier: 1.05,
      staggerDelay: 0.035,
    }),
  },
  tactile: {
    id: "tactile",
    label: "Tactile steps",
    description: "Pure CSS motion with a compact staircase and natural color.",
    config: createPresetConfig({
      animationEngine: "css",
      deploymentMode: "staircase",
      transitionCurve: "spring",
      paletteId: "forest",
      tabFill: "color",
      tabColor: FOLDER_PALETTES.forest.colors[0],
      theme: "dark",
      folderShape: "vertical",
      cardStyle: "folder",
      spacingMultiplier: 0.95,
      staggerDelay: 0.04,
    }),
  },
} as const satisfies Record<DesignPresetId, DesignPreset>;

export const DESIGN_PRESET_LIST: readonly DesignPreset[] = Object.values(DESIGN_PRESETS);

export type ActivePresetId = DesignPresetId | "custom";

export function getMatchingDesignPreset(config: PlaygroundConfig): ActivePresetId {
  const match = DESIGN_PRESET_LIST.find((preset) =>
    (Object.keys(preset.config) as Array<keyof PlaygroundConfig>).every((key) => {
      const expected = preset.config[key];
      const current = config[key];

      if (key === "springSettings") {
        return JSON.stringify(current) === JSON.stringify(expected);
      }

      return Object.is(current, expected);
    }),
  );

  return match?.id ?? "custom";
}

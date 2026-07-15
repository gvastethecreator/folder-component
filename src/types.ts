export interface StyleFile {
  id: string;
  name: string;
  image: string;
  prompt: string;
  description: string;
  details: {
    artist?: string;
    lighting?: string;
    medium?: string;
    camera?: string;
    aspectRatio?: string;
  };
}

export interface FolderData {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  files: StyleFile[];
}

export interface SpringSettings {
  stiffness: number;
  damping: number;
  mass: number;
}

export type AnimationEngine = "gsap" | "motion" | "animejs" | "css" | "waapi";

export type DeploymentStyle =
  | "fan"
  | "skew3d"
  | "cascade"
  | "scatter"
  | "horizontal_stack"
  | "orbit"
  | "staircase"
  | "burst"
  | "deck_split";

export type DeploymentMode = "random" | DeploymentStyle;

export const FOLDER_DEPLOYMENTS: readonly DeploymentStyle[] = [
  "fan",
  "skew3d",
  "cascade",
  "scatter",
  "horizontal_stack",
  "orbit",
  "staircase",
  "burst",
  "deck_split",
];

export const FOLDER_DEPLOYMENT_LABELS = {
  fan: "Fan",
  skew3d: "Depth",
  cascade: "Cascade",
  scatter: "Scatter",
  horizontal_stack: "Side",
  orbit: "Orbit",
  staircase: "Steps",
  burst: "Burst",
  deck_split: "Split",
} as const satisfies Record<DeploymentStyle, string>;

/** Stable pseudo-random layout assignment: mixed grid without reshuffling on rerenders. */
export function deploymentForKey(key: string): DeploymentStyle {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return FOLDER_DEPLOYMENTS[(hash >>> 0) % FOLDER_DEPLOYMENTS.length];
}

export type Orientation = "horizontal" | "vertical";
export type FanDirection = "symmetrical" | "left" | "right";
export type ClickBehavior = "pulse" | "toggle" | "flash";
export type TransitionCurve = "spring" | "tween" | "bounce" | "elastic";
export type FolderShape = "vertical" | "square" | "horizontal" | "windows11";
export type CardStyle = "classic" | "folder";
export type Theme = "dark" | "light";
export type TabFill = "color" | "image";
export type TabAlignment = "left" | "right";
export type VisualSource = "image" | "tone";
export type PaletteId = "graphite" | "ember" | "ocean" | "forest" | "orchid" | "citrus";

export interface PlaygroundConfig {
  animationEngine: AnimationEngine;
  deploymentMode: DeploymentMode;
  orientation: Orientation;
  springSettings: SpringSettings;
  spacingMultiplier: number;
  visibleCardsCount: number;
  fanDirection: FanDirection;
  fanAngle: number;
  coverTilt: number;
  staggerDelay: number;
  clickBehavior: ClickBehavior;
  transitionCurve: TransitionCurve;
  folderShape: FolderShape;
  cardStyle: CardStyle;
  gridItemSize: number;
  theme: Theme;
  textureEnabled: boolean;
  noiseOpacity: number;
  noiseScale: number;
  tabFill: TabFill;
  tabColor: string;
  tabWidth: number;
  tabHeight: number;
  tabAlignment: TabAlignment;
  labelVisible: boolean;
  labelOpacity: number;
  labelBackdropBlur: number;
  folderBorderWidth: number;
  folderBorderOpacity: number;
  cardShadowBlur: number;
  cardShadowOpacity: number;
  folderRadius: number;
  paletteId: PaletteId;
  visualSource: VisualSource;
  coverImageOpacity: number;
  coverImageBlur: number;
}

/** Public default contract used by the playground reset action and snippets. */
export const DEFAULT_PLAYGROUND_CONFIG: PlaygroundConfig = {
  animationEngine: "gsap",
  deploymentMode: "random",
  orientation: "vertical",
  springSettings: {
    stiffness: 185,
    damping: 14,
    mass: 1,
  },
  spacingMultiplier: 1,
  visibleCardsCount: 3,
  fanDirection: "symmetrical",
  fanAngle: 6,
  coverTilt: -12,
  staggerDelay: 0.03,
  clickBehavior: "pulse",
  transitionCurve: "spring",
  folderShape: "vertical",
  cardStyle: "folder",
  gridItemSize: 128,
  theme: "dark",
  textureEnabled: false,
  noiseOpacity: 1,
  noiseScale: 180,
  tabFill: "image",
  tabColor: "#737373",
  tabWidth: 50,
  tabHeight: 12,
  tabAlignment: "left",
  labelVisible: true,
  labelOpacity: 0.9,
  labelBackdropBlur: 8,
  folderBorderWidth: 0,
  folderBorderOpacity: 0.72,
  cardShadowBlur: 18,
  cardShadowOpacity: 0.22,
  folderRadius: 12,
  paletteId: "graphite",
  visualSource: "image",
  coverImageOpacity: 1,
  coverImageBlur: 0,
};

export function createDefaultPlaygroundConfig(): PlaygroundConfig {
  return {
    ...DEFAULT_PLAYGROUND_CONFIG,
    springSettings: { ...DEFAULT_PLAYGROUND_CONFIG.springSettings },
  };
}

export type PlaygroundConfigValue<Value> = Value | ((current: Value) => Value);

export type PlaygroundConfigAction =
  | { type: "reset" }
  | { type: "apply"; value: Partial<PlaygroundConfig> }
  | {
      [Key in keyof PlaygroundConfig]: {
        type: "set";
        key: Key;
        value: PlaygroundConfigValue<PlaygroundConfig[Key]>;
      };
    }[keyof PlaygroundConfig];

export function playgroundConfigReducer(
  state: PlaygroundConfig,
  action: PlaygroundConfigAction,
): PlaygroundConfig {
  if (action.type === "reset") return createDefaultPlaygroundConfig();
  if (action.type === "apply") {
    return {
      ...state,
      ...action.value,
      springSettings: action.value.springSettings
        ? { ...state.springSettings, ...action.value.springSettings }
        : state.springSettings,
    };
  }

  const nextValue =
    typeof action.value === "function"
      ? (action.value as (current: unknown) => unknown)(state[action.key])
      : action.value;

  return {
    ...state,
    [action.key]: nextValue,
  } as PlaygroundConfig;
}

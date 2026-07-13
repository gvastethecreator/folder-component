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

export type DeploymentStyle = "fan" | "skew3d" | "cascade" | "scatter" | "horizontal_stack";

export const FOLDER_DEPLOYMENTS: readonly DeploymentStyle[] = [
  "fan",
  "skew3d",
  "cascade",
  "scatter",
  "horizontal_stack",
];

export const FOLDER_DEPLOYMENT_LABELS = {
  fan: "Fan",
  skew3d: "Depth",
  cascade: "Cascade",
  scatter: "Scatter",
  horizontal_stack: "Side",
} as const satisfies Record<DeploymentStyle, string>;

export type Orientation = "horizontal" | "vertical";
export type FanDirection = "symmetrical" | "left" | "right";
export type ClickBehavior = "pulse" | "toggle" | "flash";
export type TransitionCurve = "spring" | "tween";
export type FolderShape = "vertical" | "square" | "horizontal";
export type CardStyle = "classic" | "folder";
export type Theme = "dark" | "light";
export type TabFill = "color" | "image";
export type VisualSource = "image" | "tone";

export interface PlaygroundConfig {
  animationEngine: AnimationEngine;
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
  theme: Theme;
  textureEnabled: boolean;
  tabFill: TabFill;
  tabColor: string;
  visualSource: VisualSource;
}

/** Public default contract used by the playground reset action and snippets. */
export const DEFAULT_PLAYGROUND_CONFIG: PlaygroundConfig = {
  animationEngine: "gsap",
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
  theme: "dark",
  textureEnabled: false,
  tabFill: "image",
  tabColor: "#3f3f46",
  visualSource: "image",
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

  const nextValue =
    typeof action.value === "function"
      ? (action.value as (current: unknown) => unknown)(state[action.key])
      : action.value;

  return {
    ...state,
    [action.key]: nextValue,
  } as PlaygroundConfig;
}

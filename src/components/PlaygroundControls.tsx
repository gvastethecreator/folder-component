import { useEffect, useRef, useState } from "react";
import {
  IconActivity,
  IconAdjustmentsHorizontal,
  IconAlignLeft,
  IconAlignRight,
  IconArrowsHorizontal,
  IconArrowsMaximize,
  IconArrowsVertical,
  IconBlur,
  IconBorderRadius,
  IconBorderStyle2,
  IconBrandCss3,
  IconBrandJavascript,
  IconBrowser,
  IconCards,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconCode,
  IconColorSwatch,
  IconColumns3,
  IconCopy,
  IconDropletHalf,
  IconEye,
  IconEyeOff,
  IconFolder,
  IconGeometry,
  IconGrain,
  IconLock,
  IconMoon,
  IconPalette,
  IconPhoto,
  IconPlayerPlay,
  IconPointer,
  IconRectangle,
  IconRectangleVertical,
  IconRefresh,
  IconSettings,
  IconShadow,
  IconSparkles,
  IconSpacingHorizontal,
  IconSquare,
  IconStack2,
  IconSun,
  IconTiltShift,
  IconWaveSine,
  IconWeight,
} from "@tabler/icons-react";
import type { ComponentType, Dispatch, KeyboardEvent, ReactNode, SetStateAction } from "react";
import {
  ENGINE_CATALOG,
  ENGINE_CATALOG_LIST,
  buildPlaygroundSnippet,
} from "../animation/engineCatalog";
import {
  DESIGN_PRESETS,
  DESIGN_PRESET_LIST,
  FOLDER_PALETTE_LIST,
  type ActivePresetId,
  type DesignPresetId,
} from "../config/playgroundCatalog";
import { FOLDER_DEPLOYMENTS, FOLDER_DEPLOYMENT_LABELS } from "../types";
import type {
  AnimationEngine,
  CardStyle,
  ClickBehavior,
  DeploymentMode,
  FanDirection,
  FolderShape,
  Orientation,
  PaletteId,
  PlaygroundConfig,
  SpringSettings,
  TabAlignment,
  TabFill,
  Theme,
  TransitionCurve,
  VisualSource,
} from "../types";

async function writeClipboardText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    // Clipboard permission can be unavailable in embedded and hardened browser contexts.
  }

  const previousFocus =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  previousFocus?.focus();
  if (!copied) throw new Error("Clipboard copy was rejected");
}

interface PlaygroundControlsProps {
  animationEngine: AnimationEngine;
  setAnimationEngine: Dispatch<SetStateAction<AnimationEngine>>;
  activePresetId: ActivePresetId;
  deploymentMode: DeploymentMode;
  setDeploymentMode: Dispatch<SetStateAction<DeploymentMode>>;
  orientation: Orientation;
  setOrientation: Dispatch<SetStateAction<Orientation>>;
  springSettings: SpringSettings;
  setSpringSettings: Dispatch<SetStateAction<SpringSettings>>;
  spacingMultiplier: number;
  setSpacingMultiplier: Dispatch<SetStateAction<number>>;
  visibleCardsCount: number;
  setVisibleCardsCount: Dispatch<SetStateAction<number>>;
  fanDirection: FanDirection;
  setFanDirection: Dispatch<SetStateAction<FanDirection>>;
  fanAngle: number;
  setFanAngle: Dispatch<SetStateAction<number>>;
  coverTilt: number;
  setCoverTilt: Dispatch<SetStateAction<number>>;
  staggerDelay: number;
  setStaggerDelay: Dispatch<SetStateAction<number>>;
  clickBehavior: ClickBehavior;
  setClickBehavior: Dispatch<SetStateAction<ClickBehavior>>;
  transitionCurve: TransitionCurve;
  setTransitionCurve: Dispatch<SetStateAction<TransitionCurve>>;
  folderShape: FolderShape;
  setFolderShape: Dispatch<SetStateAction<FolderShape>>;
  cardStyle: CardStyle;
  setCardStyle: Dispatch<SetStateAction<CardStyle>>;
  gridItemSize: number;
  setGridItemSize: Dispatch<SetStateAction<number>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  textureEnabled: boolean;
  setTextureEnabled: Dispatch<SetStateAction<boolean>>;
  noiseOpacity: number;
  setNoiseOpacity: Dispatch<SetStateAction<number>>;
  noiseScale: number;
  setNoiseScale: Dispatch<SetStateAction<number>>;
  tabFill: TabFill;
  setTabFill: Dispatch<SetStateAction<TabFill>>;
  tabColor: string;
  setTabColor: Dispatch<SetStateAction<string>>;
  tabWidth: number;
  setTabWidth: Dispatch<SetStateAction<number>>;
  tabHeight: number;
  setTabHeight: Dispatch<SetStateAction<number>>;
  tabAlignment: TabAlignment;
  setTabAlignment: Dispatch<SetStateAction<TabAlignment>>;
  labelVisible: boolean;
  setLabelVisible: Dispatch<SetStateAction<boolean>>;
  labelOpacity: number;
  setLabelOpacity: Dispatch<SetStateAction<number>>;
  labelBackdropBlur: number;
  setLabelBackdropBlur: Dispatch<SetStateAction<number>>;
  folderBorderWidth: number;
  setFolderBorderWidth: Dispatch<SetStateAction<number>>;
  folderBorderOpacity: number;
  setFolderBorderOpacity: Dispatch<SetStateAction<number>>;
  cardShadowBlur: number;
  setCardShadowBlur: Dispatch<SetStateAction<number>>;
  cardShadowOpacity: number;
  setCardShadowOpacity: Dispatch<SetStateAction<number>>;
  folderRadius: number;
  setFolderRadius: Dispatch<SetStateAction<number>>;
  paletteId: PaletteId;
  setPaletteId: Dispatch<SetStateAction<PaletteId>>;
  visualSource: VisualSource;
  setVisualSource: Dispatch<SetStateAction<VisualSource>>;
  onReset: () => void;
  onApplyPreset: (presetId: DesignPresetId) => void;
}

type ControlIcon = ComponentType<{
  size?: string | number;
  stroke?: string | number;
  "aria-hidden"?: boolean;
}>;

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ControlIcon;
}

function SegmentControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: T;
  options: readonly SegmentOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <fieldset className={`min-w-0 ${className}`}>
      <legend className="control-kicker">{label}</legend>
      <div className="segment-track">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`segment-button ${value === option.value ? "is-active" : ""}`}
          >
            {option.icon && <option.icon size={12} stroke={1.7} aria-hidden />}
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function RangeControl({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  disabled = false,
  describedBy,
  icon: Icon,
}: {
  id: string;
  label: string;
  value: number;
  display?: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  describedBy?: string;
  icon?: ControlIcon;
}) {
  const animationFrame = useRef<number | null>(null);
  const pendingValue = useRef(value);
  const changeHandler = useRef(onChange);

  useEffect(() => {
    changeHandler.current = onChange;
  }, [onChange]);

  useEffect(
    () => () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    },
    [],
  );

  const scheduleChange = (nextValue: number) => {
    pendingValue.current = nextValue;
    if (animationFrame.current !== null) return;

    animationFrame.current = requestAnimationFrame(() => {
      animationFrame.current = null;
      changeHandler.current(pendingValue.current);
    });
  };

  return (
    <label htmlFor={id} className="range-control">
      <span className="control-label">
        {Icon && <Icon size={12} stroke={1.7} aria-hidden />}
        {label}
      </span>
      <output htmlFor={id}>{display ?? value}</output>
      <input
        id={id}
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(event) => scheduleChange(Number(event.target.value))}
      />
    </label>
  );
}

function ControlSection({
  title,
  description,
  children,
  defaultOpen = false,
  icon: Icon,
}: {
  title: string;
  description: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ControlIcon;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      className="control-section"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span className="control-section-heading">
          <span>
            {Icon && <Icon size={13} stroke={1.7} aria-hidden />}
            <span className="control-section-title">{title}</span>
          </span>
          <small>{description}</small>
        </span>
        <IconChevronDown size={13} stroke={1.7} aria-hidden />
      </summary>
      <div className="control-section-content">{children}</div>
    </details>
  );
}

function DeploymentPreview({ layout }: { layout: DeploymentMode }) {
  return (
    <span className="deployment-preview" data-layout={layout} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <b />
    </span>
  );
}

const ENGINE_ICONS = {
  gsap: IconBrandJavascript,
  motion: IconActivity,
  animejs: IconSparkles,
  css: IconBrandCss3,
  waapi: IconBrowser,
} satisfies Record<AnimationEngine, ControlIcon>;

export default function PlaygroundControls({
  animationEngine,
  setAnimationEngine,
  activePresetId,
  deploymentMode,
  setDeploymentMode,
  orientation,
  setOrientation,
  springSettings,
  setSpringSettings,
  spacingMultiplier,
  setSpacingMultiplier,
  visibleCardsCount,
  setVisibleCardsCount,
  fanDirection,
  setFanDirection,
  fanAngle,
  setFanAngle,
  coverTilt,
  setCoverTilt,
  staggerDelay,
  setStaggerDelay,
  clickBehavior,
  setClickBehavior,
  transitionCurve,
  setTransitionCurve,
  folderShape,
  setFolderShape,
  cardStyle,
  setCardStyle,
  gridItemSize,
  setGridItemSize,
  theme,
  setTheme,
  textureEnabled,
  setTextureEnabled,
  noiseOpacity,
  setNoiseOpacity,
  noiseScale,
  setNoiseScale,
  tabFill,
  setTabFill,
  tabColor,
  setTabColor,
  tabWidth,
  setTabWidth,
  tabHeight,
  setTabHeight,
  tabAlignment,
  setTabAlignment,
  labelVisible,
  setLabelVisible,
  labelOpacity,
  setLabelOpacity,
  labelBackdropBlur,
  setLabelBackdropBlur,
  folderBorderWidth,
  setFolderBorderWidth,
  folderBorderOpacity,
  setFolderBorderOpacity,
  cardShadowBlur,
  setCardShadowBlur,
  cardShadowOpacity,
  setCardShadowOpacity,
  folderRadius,
  setFolderRadius,
  paletteId,
  setPaletteId,
  visualSource,
  setVisualSource,
  onReset,
  onApplyPreset,
}: PlaygroundControlsProps) {
  const [activeTab, setActiveTab] = useState<"controls" | "code">("controls");
  const [copied, setCopied] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsTab = useRef<HTMLButtonElement>(null);
  const codeTab = useRef<HTMLButtonElement>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const engine = ENGINE_CATALOG[animationEngine];
  const physicsDisabled = transitionCurve !== "spring";
  const codeSnippet = buildPlaygroundSnippet({
    animationEngine,
    deploymentMode,
    orientation,
    springSettings,
    spacingMultiplier,
    visibleCardsCount,
    fanDirection,
    fanAngle,
    coverTilt,
    staggerDelay,
    clickBehavior,
    transitionCurve,
    folderShape,
    cardStyle,
    gridItemSize,
    theme,
    textureEnabled,
    noiseOpacity,
    noiseScale,
    tabFill,
    tabColor,
    tabWidth,
    tabHeight,
    tabAlignment,
    labelVisible,
    labelOpacity,
    labelBackdropBlur,
    folderBorderWidth,
    folderBorderOpacity,
    cardShadowBlur,
    cardShadowOpacity,
    folderRadius,
    paletteId,
    visualSource,
  } satisfies PlaygroundConfig);
  const runtimeLabel =
    animationEngine === "css"
      ? "CSS only"
      : animationEngine === "waapi"
        ? "Browser WAAPI"
        : engine.label;

  const copyCode = async () => {
    try {
      await writeClipboardText(codeSnippet);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let nextTab: "controls" | "code" | null = null;

    if (event.key === "ArrowRight" || event.key === "End") nextTab = "code";
    if (event.key === "ArrowLeft" || event.key === "Home") nextTab = "controls";
    if (!nextTab) return;

    event.preventDefault();
    setActiveTab(nextTab);
    (nextTab === "controls" ? controlsTab : codeTab).current?.focus();
  };

  return (
    <section className="control-panel flex h-full min-h-0 flex-col overflow-hidden">
      <header className="panel-header">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <IconAdjustmentsHorizontal size={14} stroke={1.7} aria-hidden="true" />
            <h2>Playground</h2>
          </div>
          <p>{engine.statusLabel} · shared settings</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setResetVersion((version) => version + 1);
            onReset();
          }}
          aria-label="Reset settings"
          title="Reset settings"
          className="icon-button"
        >
          <IconRefresh size={13} stroke={1.7} aria-hidden="true" />
        </button>
      </header>

      <div className="preset-select">
        <label htmlFor="design-preset">Design &amp; behavior preset</label>
        <select
          id="design-preset"
          value={activePresetId}
          onChange={(event) => {
            const presetId = event.target.value as DesignPresetId;
            onApplyPreset(presetId);
          }}
        >
          <option value="custom" disabled>
            Custom settings
          </option>
          {DESIGN_PRESET_LIST.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
        <small aria-live="polite">
          {activePresetId === "custom"
            ? "Manual settings differ from every saved preset."
            : DESIGN_PRESETS[activePresetId].description}
        </small>
      </div>

      <div
        role="tablist"
        aria-label="Configuration panel"
        className="panel-tabs"
        onKeyDown={handleTabKeyDown}
      >
        <button
          ref={controlsTab}
          id="controls-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "controls"}
          aria-controls="controls-panel"
          tabIndex={activeTab === "controls" ? 0 : -1}
          onClick={() => setActiveTab("controls")}
        >
          <IconSettings size={12} stroke={1.7} aria-hidden="true" />
          Controls
        </button>
        <button
          ref={codeTab}
          id="code-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "code"}
          aria-controls="code-panel"
          tabIndex={activeTab === "code" ? 0 : -1}
          onClick={() => setActiveTab("code")}
        >
          <IconCode size={12} stroke={1.7} aria-hidden="true" /> Code
        </button>
      </div>

      {activeTab === "controls" ? (
        <div
          key={resetVersion}
          id="controls-panel"
          role="tabpanel"
          aria-labelledby="controls-tab"
          className="controls-panel custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3"
        >
          <ControlSection
            title="Grid & expansion"
            description="Layout, density, and stack geometry"
            icon={IconGeometry}
            defaultOpen
          >
            <section className="deployment-picker" aria-labelledby="deployment-picker-title">
              <div className="deployment-picker-heading">
                <h3 id="deployment-picker-title">Expansion layout</h3>
                <span>Whole grid</span>
              </div>
              <div role="group" aria-label="Expansion layout">
                <button
                  type="button"
                  aria-pressed={deploymentMode === "random"}
                  onClick={() => setDeploymentMode("random")}
                >
                  <DeploymentPreview layout="random" />
                  <span>Random</span>
                </button>
                {FOLDER_DEPLOYMENTS.map((deployment) => (
                  <button
                    key={deployment}
                    type="button"
                    aria-pressed={deploymentMode === deployment}
                    onClick={() => setDeploymentMode(deployment)}
                  >
                    <DeploymentPreview layout={deployment} />
                    <span>{FOLDER_DEPLOYMENT_LABELS[deployment]}</span>
                  </button>
                ))}
              </div>
            </section>

            <SegmentControl
              label="Folder shape"
              value={folderShape}
              onChange={setFolderShape}
              options={[
                { value: "vertical", label: "Portrait", icon: IconRectangleVertical },
                { value: "square", label: "Square", icon: IconSquare },
                { value: "horizontal", label: "Wide", icon: IconRectangle },
              ]}
            />

            <div className="control-pair-grid">
              <RangeControl
                id="grid-item-size"
                label="Grid density"
                icon={IconColumns3}
                value={gridItemSize}
                display={`${gridItemSize}px`}
                min={96}
                max={200}
                step={4}
                onChange={setGridItemSize}
              />
              <RangeControl
                id="visible-cards"
                label="Visible cards"
                icon={IconCards}
                value={visibleCardsCount}
                min={1}
                max={5}
                step={1}
                onChange={setVisibleCardsCount}
              />
            </div>

            <div className="control-pair-grid">
              <SegmentControl
                label="Axis"
                value={orientation}
                onChange={setOrientation}
                options={[
                  { value: "vertical", label: "Vertical", icon: IconArrowsVertical },
                  { value: "horizontal", label: "Horizontal", icon: IconArrowsHorizontal },
                ]}
              />
              <SegmentControl
                label="Direction"
                value={fanDirection}
                onChange={setFanDirection}
                options={[
                  { value: "left", label: "Left", icon: IconAlignLeft },
                  { value: "symmetrical", label: "Center", icon: IconSpacingHorizontal },
                  { value: "right", label: "Right", icon: IconAlignRight },
                ]}
              />
            </div>

            <div className="control-pair-grid">
              <RangeControl
                id="spacing"
                label="Spacing"
                icon={IconSpacingHorizontal}
                value={spacingMultiplier}
                display={`${spacingMultiplier.toFixed(2)}×`}
                min={0.55}
                max={1.45}
                step={0.05}
                onChange={setSpacingMultiplier}
              />
              <RangeControl
                id="fan-angle"
                label="Fan angle"
                icon={IconWaveSine}
                value={fanAngle}
                display={`${fanAngle}°`}
                min={0}
                max={16}
                step={1}
                onChange={setFanAngle}
              />
            </div>
            <RangeControl
              id="cover-tilt"
              label="Cover depth"
              icon={IconTiltShift}
              value={coverTilt}
              display={`${Math.abs(coverTilt)}°`}
              min={-24}
              max={0}
              step={1}
              onChange={setCoverTilt}
            />
          </ControlSection>

          <ControlSection
            title="Animation & interaction"
            description="Engine, timing, and input response"
            icon={IconPlayerPlay}
          >
            <SegmentControl
              label="Engine"
              value={animationEngine}
              onChange={setAnimationEngine}
              className="engine-selector"
              options={ENGINE_CATALOG_LIST.map(({ id, label }) => ({
                value: id,
                label,
                icon: ENGINE_ICONS[id],
              }))}
            />
            <div className="engine-summary" aria-live="polite">
              <p className="engine-description">{engine.description}</p>
              <p className="engine-capability">{engine.springCapability}</p>
            </div>
            <div className="control-pair-grid">
              <SegmentControl
                label="Curve"
                value={transitionCurve}
                onChange={setTransitionCurve}
                className="curve-selector"
                options={[
                  { value: "spring", label: "Spring", icon: IconActivity },
                  { value: "tween", label: "Tween", icon: IconWaveSine },
                  { value: "bounce", label: "Bounce", icon: IconStack2 },
                  { value: "elastic", label: "Elastic", icon: IconArrowsMaximize },
                ]}
              />
              <SegmentControl
                label="Click behavior"
                value={clickBehavior}
                onChange={setClickBehavior}
                className="click-selector"
                options={[
                  { value: "pulse", label: "Pulse", icon: IconPointer },
                  { value: "toggle", label: "Lock", icon: IconLock },
                  { value: "flash", label: "Flash", icon: IconSparkles },
                ]}
              />
            </div>
            <RangeControl
              id="stagger"
              label="Stagger"
              icon={IconClock}
              value={staggerDelay}
              display={`${Math.round(staggerDelay * 1000)}ms`}
              min={0}
              max={0.12}
              step={0.005}
              onChange={setStaggerDelay}
            />
            <p
              id="spring-physics-note"
              className={`engine-capability ${physicsDisabled ? "" : "sr-only"}`}
              role={physicsDisabled ? "status" : undefined}
            >
              {physicsDisabled
                ? `${transitionCurve[0].toUpperCase()}${transitionCurve.slice(1)} uses a tuned timing profile. Spring physics controls are preserved and disabled until Spring is selected.`
                : engine.springCapability}
            </p>
            <fieldset
              className="spring-controls-grid"
              disabled={physicsDisabled}
              aria-describedby="spring-physics-note"
            >
              <legend className="control-subheading">Spring physics</legend>
              <RangeControl
                id="stiffness"
                label="Stiffness"
                icon={IconWeight}
                value={springSettings.stiffness}
                min={60}
                max={360}
                step={5}
                disabled={physicsDisabled}
                describedBy="spring-physics-note"
                onChange={(value) =>
                  setSpringSettings((current) => ({ ...current, stiffness: value }))
                }
              />
              <RangeControl
                id="damping"
                label="Damping"
                icon={IconWaveSine}
                value={springSettings.damping}
                min={6}
                max={32}
                step={1}
                disabled={physicsDisabled}
                describedBy="spring-physics-note"
                onChange={(value) =>
                  setSpringSettings((current) => ({ ...current, damping: value }))
                }
              />
              <RangeControl
                id="mass"
                label="Mass"
                icon={IconWeight}
                value={springSettings.mass}
                display={springSettings.mass.toFixed(2)}
                min={0.4}
                max={2}
                step={0.05}
                disabled={physicsDisabled}
                describedBy="spring-physics-note"
                onChange={(value) => setSpringSettings((current) => ({ ...current, mass: value }))}
              />
            </fieldset>
          </ControlSection>

          <ControlSection
            title="Folder design"
            description="Theme, artwork, palette, and tab"
            icon={IconPalette}
          >
            <div className="control-pair-grid">
              <SegmentControl
                label="Theme"
                value={theme}
                onChange={setTheme}
                options={[
                  { value: "dark", label: "Dark", icon: IconMoon },
                  { value: "light", label: "Light", icon: IconSun },
                ]}
              />
              <SegmentControl
                label="Visuals"
                value={visualSource}
                onChange={setVisualSource}
                options={[
                  { value: "image", label: "Images", icon: IconPhoto },
                  { value: "tone", label: "Tones", icon: IconColorSwatch },
                ]}
              />
            </div>

            <fieldset className="palette-control">
              <legend className="control-kicker">Palette</legend>
              <div className="palette-grid">
                {FOLDER_PALETTE_LIST.map((palette) => (
                  <button
                    key={palette.id}
                    type="button"
                    aria-pressed={paletteId === palette.id}
                    title={palette.label}
                    onClick={() => {
                      setPaletteId(palette.id);
                      setTabFill("color");
                      setTabColor(palette.colors[0]);
                    }}
                  >
                    <span aria-hidden="true">
                      {palette.colors.map((color) => (
                        <i key={color} style={{ backgroundColor: color }} />
                      ))}
                    </span>
                    {palette.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="control-pair-grid">
              <SegmentControl
                label="Cover style"
                value={cardStyle}
                onChange={setCardStyle}
                options={[
                  { value: "folder", label: "Folder", icon: IconFolder },
                  { value: "classic", label: "Clean", icon: IconSquare },
                ]}
              />
              {cardStyle === "folder" && (
                <SegmentControl
                  label="Tab fill"
                  value={tabFill}
                  onChange={setTabFill}
                  options={[
                    { value: "image", label: "Artwork", icon: IconPhoto },
                    { value: "color", label: "Color", icon: IconColorSwatch },
                  ]}
                />
              )}
            </div>

            {cardStyle === "folder" && tabFill === "color" && (
              <label className="color-control">
                <span className="control-label">
                  <IconColorSwatch size={12} stroke={1.7} aria-hidden />
                  Tab color
                </span>
                <input
                  type="color"
                  aria-label="Folder tab color"
                  value={tabColor}
                  onChange={(event) => setTabColor(event.target.value)}
                />
                <span>{tabColor}</span>
              </label>
            )}

            {cardStyle === "folder" && (
              <>
                <SegmentControl
                  label="Tab alignment"
                  value={tabAlignment}
                  onChange={setTabAlignment}
                  options={[
                    { value: "left", label: "Left", icon: IconAlignLeft },
                    { value: "right", label: "Right", icon: IconAlignRight },
                  ]}
                />
                <div className="control-pair-grid">
                  <RangeControl
                    id="tab-width"
                    label="Tab width"
                    icon={IconArrowsHorizontal}
                    value={tabWidth}
                    display={`${tabWidth}%`}
                    min={24}
                    max={78}
                    step={2}
                    onChange={setTabWidth}
                  />
                  <RangeControl
                    id="tab-height"
                    label="Tab height"
                    icon={IconArrowsVertical}
                    value={tabHeight}
                    display={`${tabHeight}px`}
                    min={6}
                    max={24}
                    step={1}
                    onChange={setTabHeight}
                  />
                </div>
              </>
            )}
          </ControlSection>

          <ControlSection
            title="Surface & label"
            description="Text, border, shadow, and grain"
            icon={IconAdjustmentsHorizontal}
          >
            <button
              type="button"
              role="switch"
              aria-checked={labelVisible}
              onClick={() => setLabelVisible((current) => !current)}
              className="switch-row"
            >
              <span className="switch-copy">
                {labelVisible ? (
                  <IconEye size={14} aria-hidden />
                ) : (
                  <IconEyeOff size={14} aria-hidden />
                )}
                <span>
                  Text container
                  <small>Title and item count overlay</small>
                </span>
              </span>
              <i aria-hidden="true">
                <span />
              </i>
            </button>

            {labelVisible && (
              <div className="control-pair-grid">
                <RangeControl
                  id="label-opacity"
                  label="Label opacity"
                  icon={IconDropletHalf}
                  value={labelOpacity}
                  display={`${Math.round(labelOpacity * 100)}%`}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={setLabelOpacity}
                />
                <RangeControl
                  id="label-blur"
                  label="Backdrop blur"
                  icon={IconBlur}
                  value={labelBackdropBlur}
                  display={`${labelBackdropBlur}px`}
                  min={0}
                  max={24}
                  step={1}
                  onChange={setLabelBackdropBlur}
                />
              </div>
            )}

            <div className="control-pair-grid">
              <RangeControl
                id="border-width"
                label="Border size"
                icon={IconBorderStyle2}
                value={folderBorderWidth}
                display={`${folderBorderWidth.toFixed(1)}px`}
                min={0}
                max={4}
                step={0.5}
                onChange={setFolderBorderWidth}
              />
              <RangeControl
                id="border-opacity"
                label="Border opacity"
                icon={IconDropletHalf}
                value={folderBorderOpacity}
                display={`${Math.round(folderBorderOpacity * 100)}%`}
                min={0}
                max={1}
                step={0.05}
                onChange={setFolderBorderOpacity}
              />
            </div>
            <div className="control-pair-grid">
              <RangeControl
                id="card-shadow-blur"
                label="Shadow blur"
                icon={IconShadow}
                value={cardShadowBlur}
                display={`${cardShadowBlur}px`}
                min={0}
                max={40}
                step={1}
                onChange={setCardShadowBlur}
              />
              <RangeControl
                id="card-shadow-opacity"
                label="Shadow opacity"
                icon={IconDropletHalf}
                value={cardShadowOpacity}
                display={`${Math.round(cardShadowOpacity * 100)}%`}
                min={0}
                max={0.6}
                step={0.02}
                onChange={setCardShadowOpacity}
              />
            </div>
            <RangeControl
              id="folder-radius"
              label="Corner radius"
              icon={IconBorderRadius}
              value={folderRadius}
              display={`${folderRadius}px`}
              min={0}
              max={24}
              step={1}
              onChange={setFolderRadius}
            />

            <button
              type="button"
              role="switch"
              aria-checked={textureEnabled}
              onClick={() => setTextureEnabled((current) => !current)}
              className="switch-row"
            >
              <span className="switch-copy">
                <IconGrain size={14} aria-hidden />
                <span>
                  Card SVG noise
                  <small>Background grain stays on; this adds texture to folders</small>
                </span>
              </span>
              <i aria-hidden="true">
                <span />
              </i>
            </button>

            {textureEnabled && (
              <div className="control-pair-grid">
                <RangeControl
                  id="noise-opacity"
                  label="Noise intensity"
                  icon={IconDropletHalf}
                  value={noiseOpacity}
                  display={`${Math.round(noiseOpacity * 100)}%`}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={setNoiseOpacity}
                />
                <RangeControl
                  id="noise-scale"
                  label="Noise scale"
                  icon={IconArrowsMaximize}
                  value={noiseScale}
                  display={`${noiseScale}px`}
                  min={80}
                  max={320}
                  step={10}
                  onChange={setNoiseScale}
                />
              </div>
            )}
          </ControlSection>
        </div>
      ) : (
        <div
          id="code-panel"
          role="tabpanel"
          aria-labelledby="code-tab"
          className="code-panel custom-scrollbar min-h-0 flex-1 overflow-y-auto"
        >
          <div className="code-panel-header">
            <div>
              <h3>Standalone component</h3>
              <p>Single-file React demo with inline styles and data. No project-local imports.</p>
            </div>
            <button type="button" onClick={copyCode} aria-label="Copy reusable code">
              {copied ? (
                <IconCheck size={12} aria-hidden="true" />
              ) : (
                <IconCopy size={12} aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="code-panel-meta" aria-label="Generated code status">
            <span>Live config</span>
            <span>{runtimeLabel}</span>
            <span>{codeSnippet.split("\n").length} lines</span>
          </div>
          <pre className="code-output" aria-label="Generated standalone code">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      )}
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Code2, Copy, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { Dispatch, KeyboardEvent, ReactNode, SetStateAction } from "react";
import {
  ENGINE_CATALOG,
  ENGINE_CATALOG_LIST,
  buildPlaygroundSnippet,
} from "../animation/engineCatalog";
import { FOLDER_DEPLOYMENTS, FOLDER_DEPLOYMENT_LABELS } from "../types";
import type {
  AnimationEngine,
  CardStyle,
  ClickBehavior,
  FanDirection,
  FolderShape,
  Orientation,
  PlaygroundConfig,
  SpringSettings,
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
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  textureEnabled: boolean;
  setTextureEnabled: Dispatch<SetStateAction<boolean>>;
  tabFill: TabFill;
  setTabFill: Dispatch<SetStateAction<TabFill>>;
  tabColor: string;
  setTabColor: Dispatch<SetStateAction<string>>;
  visualSource: VisualSource;
  setVisualSource: Dispatch<SetStateAction<VisualSource>>;
  onReset: () => void;
}

interface SegmentOption<T extends string> {
  value: T;
  label: string;
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
      <span>{label}</span>
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
  children,
  open = false,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="control-section">
      <summary>
        {title}
        <ChevronDown size={13} aria-hidden="true" />
      </summary>
      <div className="control-section-content">{children}</div>
    </details>
  );
}

const STACK_MAP = FOLDER_DEPLOYMENTS.map((deployment, index) => [
  String(index + 1).padStart(2, "0"),
  FOLDER_DEPLOYMENT_LABELS[deployment],
]);

export default function PlaygroundControls({
  animationEngine,
  setAnimationEngine,
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
  theme,
  setTheme,
  textureEnabled,
  setTextureEnabled,
  tabFill,
  setTabFill,
  tabColor,
  setTabColor,
  visualSource,
  setVisualSource,
  onReset,
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
  const physicsDisabled = transitionCurve === "tween";
  const codeSnippet = buildPlaygroundSnippet({
    animationEngine,
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
    theme,
    textureEnabled,
    tabFill,
    tabColor,
    visualSource,
  } satisfies PlaygroundConfig);

  const applyPreset = (preset: "balanced" | "cinematic" | "snappy") => {
    if (preset === "cinematic") {
      setSpringSettings({ stiffness: 115, damping: 18, mass: 1.25 });
      setSpacingMultiplier(1.12);
      setStaggerDelay(0.07);
      setTransitionCurve("spring");
      return;
    }
    if (preset === "snappy") {
      setSpringSettings({ stiffness: 310, damping: 22, mass: 0.7 });
      setSpacingMultiplier(0.92);
      setStaggerDelay(0.015);
      setTransitionCurve("spring");
      return;
    }
    setSpringSettings({ stiffness: 185, damping: 14, mass: 1 });
    setSpacingMultiplier(1);
    setStaggerDelay(0.03);
    setTransitionCurve("spring");
  };

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
            <SlidersHorizontal size={14} aria-hidden="true" />
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
          <RefreshCw size={13} aria-hidden="true" />
        </button>
      </header>

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
          <Code2 size={12} aria-hidden="true" /> Code
        </button>
      </div>

      {activeTab === "controls" ? (
        <div
          key={resetVersion}
          id="controls-panel"
          role="tabpanel"
          aria-labelledby="controls-tab"
          className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3"
        >
          <section className="stack-map" aria-labelledby="stack-map-title">
            <div className="stack-map-heading">
              <h3 id="stack-map-title">Stack map</h3>
              <span>Cycles every 5 folders</span>
            </div>
            <div aria-label="Animation order repeated every five folders">
              {STACK_MAP.map(([index, label]) => (
                <span key={index} title={label}>
                  <b>{index}</b> {label}
                </span>
              ))}
            </div>
          </section>

          <div className="preset-strip" aria-label="Shared presets">
            {(
              [
                ["balanced", "Balanced"],
                ["cinematic", "Cinematic"],
                ["snappy", "Snappy"],
              ] as const
            ).map(([value, label]) => (
              <button key={value} type="button" onClick={() => applyPreset(value)}>
                {label}
              </button>
            ))}
          </div>

          <ControlSection title="Animation engine" open>
            <SegmentControl
              label="Engine"
              value={animationEngine}
              onChange={setAnimationEngine}
              className="engine-selector"
              options={ENGINE_CATALOG_LIST.map(({ id, label }) => ({ value: id, label }))}
            />
            <p className="engine-description" aria-live="polite">
              {engine.description}
            </p>
            <p className="engine-capability" aria-live="polite">
              {engine.springCapability}
            </p>
          </ControlSection>

          <ControlSection title="Appearance" open>
            <div className="grid grid-cols-2 gap-2">
              <SegmentControl
                label="Theme"
                value={theme}
                onChange={setTheme}
                options={[
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" },
                ]}
              />
              <SegmentControl
                label="Visuals"
                value={visualSource}
                onChange={setVisualSource}
                options={[
                  { value: "image", label: "Images" },
                  { value: "tone", label: "Tones" },
                ]}
              />
            </div>

            <SegmentControl
              label="Shape"
              value={folderShape}
              onChange={setFolderShape}
              options={[
                { value: "vertical", label: "Portrait" },
                { value: "square", label: "Square" },
                { value: "horizontal", label: "Wide" },
              ]}
            />

            <div className="grid grid-cols-2 gap-2">
              <SegmentControl
                label="Cover"
                value={cardStyle}
                onChange={setCardStyle}
                options={[
                  { value: "folder", label: "Folder" },
                  { value: "classic", label: "Clean" },
                ]}
              />
              <SegmentControl
                label="Click"
                value={clickBehavior}
                onChange={setClickBehavior}
                options={[
                  { value: "pulse", label: "Pulse" },
                  { value: "toggle", label: "Lock" },
                  { value: "flash", label: "Flash" },
                ]}
              />
            </div>

            {cardStyle === "folder" && (
              <div className="grid grid-cols-[1fr_auto] items-end gap-2">
                <SegmentControl
                  label="Tab fill"
                  value={tabFill}
                  onChange={setTabFill}
                  options={[
                    { value: "image", label: "Artwork" },
                    { value: "color", label: "Color" },
                  ]}
                />
                {tabFill === "color" && (
                  <label className="color-control">
                    <span className="sr-only">Folder tab color</span>
                    <input
                      type="color"
                      aria-label="Folder tab color"
                      value={tabColor}
                      onChange={(event) => setTabColor(event.target.value)}
                    />
                    <span>{tabColor}</span>
                  </label>
                )}
              </div>
            )}

            <button
              type="button"
              role="switch"
              aria-checked={textureEnabled}
              onClick={() => setTextureEnabled((current) => !current)}
              className="switch-row"
            >
              <span>
                SVG noise
                <small>Fine texture on the app background</small>
              </span>
              <i aria-hidden="true">
                <span />
              </i>
            </button>

            <RangeControl
              id="visible-cards"
              label="Visible cards"
              value={visibleCardsCount}
              min={1}
              max={5}
              step={1}
              onChange={setVisibleCardsCount}
            />
          </ControlSection>

          <ControlSection title="Geometry" open>
            <div className="grid grid-cols-2 gap-2">
              <SegmentControl
                label="Axis"
                value={orientation}
                onChange={setOrientation}
                options={[
                  { value: "vertical", label: "Vertical" },
                  { value: "horizontal", label: "Horizontal" },
                ]}
              />
              <SegmentControl
                label="Direction"
                value={fanDirection}
                onChange={setFanDirection}
                options={[
                  { value: "left", label: "Left" },
                  { value: "symmetrical", label: "Center" },
                  { value: "right", label: "Right" },
                ]}
              />
            </div>
            <RangeControl
              id="spacing"
              label="Spacing"
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
              value={fanAngle}
              display={`${fanAngle}°`}
              min={0}
              max={16}
              step={1}
              onChange={setFanAngle}
            />
            <RangeControl
              id="cover-tilt"
              label="Cover depth"
              value={coverTilt}
              display={`${Math.abs(coverTilt)}`}
              min={-24}
              max={0}
              step={1}
              onChange={setCoverTilt}
            />
          </ControlSection>

          <ControlSection title="Motion">
            <SegmentControl
              label="Curve"
              value={transitionCurve}
              onChange={setTransitionCurve}
              options={[
                { value: "spring", label: "Spring" },
                { value: "tween", label: "Tween" },
              ]}
            />
            <RangeControl
              id="stagger"
              label="Stagger"
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
                ? "Tween uses fixed duration and easing. Stiffness, damping, and mass are disabled; switching back to Spring restores their values."
                : engine.springCapability}
            </p>
            <fieldset disabled={physicsDisabled} aria-describedby="spring-physics-note">
              <legend className="sr-only">Spring physics controls</legend>
              <RangeControl
                id="stiffness"
                label="Stiffness"
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
        </div>
      ) : (
        <div
          id="code-panel"
          role="tabpanel"
          aria-labelledby="code-tab"
          className="code-panel custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3"
        >
          <div className="code-panel-header">
            <div>
              <h3>Five-stack usage</h3>
              <p>One deployment per position in the five-folder cycle.</p>
            </div>
            <button type="button" onClick={copyCode} aria-label="Copy reusable code">
              {copied ? (
                <Check size={12} aria-hidden="true" />
              ) : (
                <Copy size={12} aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="custom-scrollbar">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      )}
    </section>
  );
}

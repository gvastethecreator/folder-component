import { useReducer, useState } from "react";
import type { CSSProperties } from "react";
import { IconChevronLeft, IconChevronRight, IconFolder, IconLayoutGrid } from "@tabler/icons-react";
import { STYLES_DATA } from "./data/stylesData";
import { ENGINE_CATALOG } from "./animation/engineCatalog";
import StyleFolder from "./components/StyleFolder";
import PlaygroundControls from "./components/PlaygroundControls";
import {
  DESIGN_PRESETS,
  getMatchingDesignPreset,
  type DesignPresetId,
} from "./config/playgroundCatalog";
import {
  createDefaultPlaygroundConfig,
  deploymentForKey,
  playgroundConfigReducer,
  type PlaygroundConfig,
  type PlaygroundConfigAction,
  type PlaygroundConfigValue,
} from "./types";

export default function App() {
  const [previewMode, setPreviewMode] = useState<"grid" | "single">("grid");
  const [previewFolderIndex, setPreviewFolderIndex] = useState(0);
  const [config, dispatch] = useReducer(
    playgroundConfigReducer,
    undefined,
    createDefaultPlaygroundConfig,
  );
  const setConfigValue = <Key extends keyof PlaygroundConfig>(
    key: Key,
    value: PlaygroundConfigValue<PlaygroundConfig[Key]>,
  ) => {
    dispatch({ type: "set", key, value } as PlaygroundConfigAction);
  };
  const handleReset = () => dispatch({ type: "reset" });
  const handleApplyPreset = (presetId: DesignPresetId) => {
    dispatch({ type: "apply", value: DESIGN_PRESETS[presetId].config });
  };
  const {
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
    coverImageOpacity,
    coverImageBlur,
  } = config;
  const engine = ENGINE_CATALOG[animationEngine];
  const activePresetId = getMatchingDesignPreset(config);
  const previewFolder = STYLES_DATA[previewFolderIndex];
  const movePreview = (offset: number) => {
    setPreviewFolderIndex(
      (current) => (current + offset + STYLES_DATA.length) % STYLES_DATA.length,
    );
  };
  const renderFolder = (folder: (typeof STYLES_DATA)[number], index: number, compact: boolean) => (
    <StyleFolder
      key={`${compact ? "grid" : "single"}-${folder.id}`}
      folder={folder}
      orientation={orientation}
      springSettings={springSettings}
      spacingMultiplier={spacingMultiplier}
      visibleCardsCount={visibleCardsCount}
      fanDirection={fanDirection}
      fanAngle={fanAngle}
      coverTilt={coverTilt}
      deploymentStyle={deploymentMode === "random" ? deploymentForKey(folder.id) : deploymentMode}
      staggerDelay={staggerDelay}
      clickBehavior={clickBehavior}
      transitionCurve={transitionCurve}
      folderShape={folderShape}
      cardStyle={cardStyle}
      gridItemSize={gridItemSize}
      priority={!compact || index < 2}
      compact={compact}
      textureEnabled={textureEnabled}
      tabFill={tabFill}
      tabColor={tabColor}
      tabWidth={tabWidth}
      tabHeight={tabHeight}
      tabAlignment={tabAlignment}
      labelVisible={labelVisible}
      labelOpacity={labelOpacity}
      labelBackdropBlur={labelBackdropBlur}
      folderBorderWidth={folderBorderWidth}
      folderBorderOpacity={folderBorderOpacity}
      cardShadowBlur={cardShadowBlur}
      cardShadowOpacity={cardShadowOpacity}
      folderRadius={folderRadius}
      paletteId={paletteId}
      visualSource={visualSource}
      coverImageOpacity={coverImageOpacity}
      coverImageBlur={coverImageBlur}
      animationEngine={animationEngine}
    />
  );

  return (
    <div
      data-theme={theme}
      data-texture-enabled={textureEnabled}
      style={
        {
          "--noise-opacity": noiseOpacity,
          "--noise-scale": `${noiseScale}px`,
        } as CSSProperties
      }
      className={`${theme === "light" ? "theme-light" : "theme-dark"} app-shell min-h-screen lg:h-screen overflow-x-clip lg:overflow-hidden bg-neutral-950 text-neutral-100 flex flex-col selection:bg-neutral-200 selection:text-neutral-950`}
    >
      {/* MAIN CONTAINER */}
      <main className="w-full h-full lg:h-screen relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* RIGHT CONTAINER: COMPACT SHARED CONTROLS */}
        <aside className="controls-rail order-first lg:order-last w-full lg:w-80 h-[min(70vh,42rem)] lg:h-full flex flex-col min-h-0 p-3 border-b lg:border-b-0 lg:border-l border-neutral-800 bg-neutral-900/20">
          <PlaygroundControls
            animationEngine={animationEngine}
            setAnimationEngine={(value) => setConfigValue("animationEngine", value)}
            activePresetId={activePresetId}
            deploymentMode={deploymentMode}
            setDeploymentMode={(value) => setConfigValue("deploymentMode", value)}
            orientation={orientation}
            setOrientation={(value) => setConfigValue("orientation", value)}
            springSettings={springSettings}
            setSpringSettings={(value) => setConfigValue("springSettings", value)}
            spacingMultiplier={spacingMultiplier}
            setSpacingMultiplier={(value) => setConfigValue("spacingMultiplier", value)}
            visibleCardsCount={visibleCardsCount}
            setVisibleCardsCount={(value) => setConfigValue("visibleCardsCount", value)}
            fanDirection={fanDirection}
            setFanDirection={(value) => setConfigValue("fanDirection", value)}
            fanAngle={fanAngle}
            setFanAngle={(value) => setConfigValue("fanAngle", value)}
            coverTilt={coverTilt}
            setCoverTilt={(value) => setConfigValue("coverTilt", value)}
            staggerDelay={staggerDelay}
            setStaggerDelay={(value) => setConfigValue("staggerDelay", value)}
            clickBehavior={clickBehavior}
            setClickBehavior={(value) => setConfigValue("clickBehavior", value)}
            transitionCurve={transitionCurve}
            setTransitionCurve={(value) => setConfigValue("transitionCurve", value)}
            folderShape={folderShape}
            setFolderShape={(value) => setConfigValue("folderShape", value)}
            cardStyle={cardStyle}
            setCardStyle={(value) => setConfigValue("cardStyle", value)}
            gridItemSize={gridItemSize}
            setGridItemSize={(value) => setConfigValue("gridItemSize", value)}
            theme={theme}
            setTheme={(value) => setConfigValue("theme", value)}
            textureEnabled={textureEnabled}
            setTextureEnabled={(value) => setConfigValue("textureEnabled", value)}
            noiseOpacity={noiseOpacity}
            setNoiseOpacity={(value) => setConfigValue("noiseOpacity", value)}
            noiseScale={noiseScale}
            setNoiseScale={(value) => setConfigValue("noiseScale", value)}
            tabFill={tabFill}
            setTabFill={(value) => setConfigValue("tabFill", value)}
            tabColor={tabColor}
            setTabColor={(value) => setConfigValue("tabColor", value)}
            tabWidth={tabWidth}
            setTabWidth={(value) => setConfigValue("tabWidth", value)}
            tabHeight={tabHeight}
            setTabHeight={(value) => setConfigValue("tabHeight", value)}
            tabAlignment={tabAlignment}
            setTabAlignment={(value) => setConfigValue("tabAlignment", value)}
            labelVisible={labelVisible}
            setLabelVisible={(value) => setConfigValue("labelVisible", value)}
            labelOpacity={labelOpacity}
            setLabelOpacity={(value) => setConfigValue("labelOpacity", value)}
            labelBackdropBlur={labelBackdropBlur}
            setLabelBackdropBlur={(value) => setConfigValue("labelBackdropBlur", value)}
            folderBorderWidth={folderBorderWidth}
            setFolderBorderWidth={(value) => setConfigValue("folderBorderWidth", value)}
            folderBorderOpacity={folderBorderOpacity}
            setFolderBorderOpacity={(value) => setConfigValue("folderBorderOpacity", value)}
            cardShadowBlur={cardShadowBlur}
            setCardShadowBlur={(value) => setConfigValue("cardShadowBlur", value)}
            cardShadowOpacity={cardShadowOpacity}
            setCardShadowOpacity={(value) => setConfigValue("cardShadowOpacity", value)}
            folderRadius={folderRadius}
            setFolderRadius={(value) => setConfigValue("folderRadius", value)}
            paletteId={paletteId}
            setPaletteId={(value) => setConfigValue("paletteId", value)}
            visualSource={visualSource}
            setVisualSource={(value) => setConfigValue("visualSource", value)}
            coverImageOpacity={coverImageOpacity}
            setCoverImageOpacity={(value) => setConfigValue("coverImageOpacity", value)}
            coverImageBlur={coverImageBlur}
            setCoverImageBlur={(value) => setConfigValue("coverImageBlur", value)}
            onReset={handleReset}
            onApplyPreset={handleApplyPreset}
          />
        </aside>

        {/* LEFT CONTAINER: INTERACTIVE CARD GRID */}
        <div className="order-last lg:order-first w-full h-full flex flex-col justify-start p-4 sm:p-6 lg:p-8 min-h-0 lg:overflow-y-auto custom-scrollbar">
          <header className="gallery-header flex items-center justify-between gap-3 border-b border-neutral-800 px-1 pb-3">
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-neutral-100">
                Folder Motion Lab
              </h1>
              <p className="mt-0.5 text-[10px] text-neutral-500">
                {engine.statusLabel} · shared rendering controls
              </p>
            </div>
            <div className="gallery-header-actions">
              <div className="preview-mode-switch" role="group" aria-label="Preview mode">
                <button
                  type="button"
                  aria-pressed={previewMode === "grid"}
                  onClick={() => setPreviewMode("grid")}
                >
                  <IconLayoutGrid size={13} stroke={1.7} aria-hidden="true" />
                  Grid
                </button>
                <button
                  type="button"
                  aria-pressed={previewMode === "single"}
                  onClick={() => setPreviewMode("single")}
                >
                  <IconFolder size={13} stroke={1.7} aria-hidden="true" />
                  Single
                </button>
              </div>
              <div className="gallery-status flex items-center gap-2 font-mono text-[9px] tabular-nums text-neutral-500">
                <span>
                  {previewMode === "grid"
                    ? `${STYLES_DATA.length} ITEMS`
                    : `${String(previewFolderIndex + 1).padStart(2, "0")} / ${STYLES_DATA.length}`}
                </span>
                <span aria-hidden="true">/</span>
                <span>{engine.statusLabel}</span>
              </div>
            </div>
          </header>
          {previewMode === "grid" ? (
            <div
              id="folders-grid"
              data-grid-size={gridItemSize}
              data-preview-mode="grid"
              className="folders-grid justify-items-center py-16 xl:pt-28 xl:pb-16 px-2 sm:px-4"
              style={
                {
                  "--grid-item-min": `${gridItemSize}px`,
                } as CSSProperties
              }
            >
              {STYLES_DATA.map((folder, index) => renderFolder(folder, index, true))}
            </div>
          ) : (
            <section
              id="single-folder-preview"
              className="single-folder-preview"
              data-preview-mode="single"
              aria-label="Single folder preview"
            >
              <nav className="single-folder-toolbar" aria-label="Folder browser">
                <button type="button" onClick={() => movePreview(-1)} aria-label="Previous folder">
                  <IconChevronLeft size={15} stroke={1.7} aria-hidden="true" />
                </button>
                <label htmlFor="preview-folder-select">Folder</label>
                <select
                  id="preview-folder-select"
                  aria-label="Preview folder"
                  value={previewFolderIndex}
                  onChange={(event) => setPreviewFolderIndex(Number(event.target.value))}
                >
                  {STYLES_DATA.map((folder, index) => (
                    <option key={folder.id} value={index}>
                      {folder.title}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => movePreview(1)} aria-label="Next folder">
                  <IconChevronRight size={15} stroke={1.7} aria-hidden="true" />
                </button>
              </nav>
              <div className="single-folder-canvas">
                {renderFolder(previewFolder, previewFolderIndex, false)}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

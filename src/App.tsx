import { useReducer } from "react";
import { STYLES_DATA } from "./data/stylesData";
import { ENGINE_CATALOG } from "./animation/engineCatalog";
import StyleFolder from "./components/StyleFolder";
import PlaygroundControls from "./components/PlaygroundControls";
import {
  createDefaultPlaygroundConfig,
  FOLDER_DEPLOYMENTS,
  playgroundConfigReducer,
  type PlaygroundConfig,
  type PlaygroundConfigAction,
  type PlaygroundConfigValue,
} from "./types";

const GRID_FOLDERS = Array.from({ length: 4 }, (_, rowIndex) =>
  STYLES_DATA.map((folder) =>
    rowIndex === 0
      ? folder
      : {
          ...folder,
          id: `${folder.id}-set-${rowIndex + 1}`,
          title: `${folder.title} · Set ${String(rowIndex + 1).padStart(2, "0")}`,
        },
  ),
).flat();

export default function App() {
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
  const {
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
  } = config;
  const engine = ENGINE_CATALOG[animationEngine];

  return (
    <div
      data-theme={theme}
      data-texture-enabled={textureEnabled}
      className={`${theme === "light" ? "theme-light" : "theme-dark"} app-shell min-h-screen lg:h-screen overflow-x-clip lg:overflow-hidden bg-neutral-950 text-neutral-100 flex flex-col selection:bg-neutral-200 selection:text-neutral-950`}
    >
      {/* MAIN CONTAINER */}
      <main className="w-full h-full lg:h-screen relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* LEFT CONTAINER: INTERACTIVE CARD GRID */}
        <div className="order-last lg:order-first w-full h-full flex flex-col justify-start p-4 sm:p-6 lg:p-8 min-h-0 lg:overflow-y-auto custom-scrollbar">
          <header className="gallery-header flex items-center justify-between border-b border-neutral-800 px-1 pb-3">
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-neutral-100">
                Folder Motion Lab
              </h1>
              <p className="mt-0.5 text-[10px] text-neutral-500">
                {engine.statusLabel} · shared rendering controls
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] tabular-nums text-neutral-500">
              <span>20 ITEMS</span>
              <span aria-hidden="true">/</span>
              <span>{engine.statusLabel}</span>
            </div>
          </header>
          {/* FOLDERS GRID CONTAINER */}
          <div
            id="folders-grid"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-14 justify-items-center py-16 xl:pt-28 xl:pb-16 px-2 sm:px-4"
          >
            {GRID_FOLDERS.map((folder, index) => (
              <StyleFolder
                key={folder.id}
                folder={folder}
                orientation={orientation}
                springSettings={springSettings}
                spacingMultiplier={spacingMultiplier}
                visibleCardsCount={visibleCardsCount}
                fanDirection={fanDirection}
                fanAngle={fanAngle}
                coverTilt={coverTilt}
                deploymentStyle={FOLDER_DEPLOYMENTS[index % FOLDER_DEPLOYMENTS.length]}
                staggerDelay={staggerDelay}
                clickBehavior={clickBehavior}
                transitionCurve={transitionCurve}
                folderShape={folderShape}
                cardStyle={cardStyle}
                priority={index < 2}
                compact
                textureEnabled={textureEnabled}
                tabFill={tabFill}
                tabColor={tabColor}
                visualSource={visualSource}
                animationEngine={animationEngine}
              />
            ))}
          </div>
        </div>

        {/* RIGHT CONTAINER: COMPACT SHARED CONTROLS */}
        <aside className="controls-rail order-first lg:order-last w-full lg:w-80 h-[min(70vh,42rem)] lg:h-full flex flex-col min-h-0 p-3 border-b lg:border-b-0 lg:border-l border-neutral-800 bg-neutral-900/20">
          <PlaygroundControls
            animationEngine={animationEngine}
            setAnimationEngine={(value) => setConfigValue("animationEngine", value)}
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
            theme={theme}
            setTheme={(value) => setConfigValue("theme", value)}
            textureEnabled={textureEnabled}
            setTextureEnabled={(value) => setConfigValue("textureEnabled", value)}
            tabFill={tabFill}
            setTabFill={(value) => setConfigValue("tabFill", value)}
            tabColor={tabColor}
            setTabColor={(value) => setConfigValue("tabColor", value)}
            visualSource={visualSource}
            setVisualSource={(value) => setConfigValue("visualSource", value)}
            onReset={handleReset}
          />
        </aside>
      </main>
    </div>
  );
}

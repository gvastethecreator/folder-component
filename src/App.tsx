import { useState } from "react";
import { STYLES_DATA } from "./data/stylesData";
import { SpringSettings } from "./types";
import StyleFolder from "./components/StyleFolder";
import PlaygroundControls from "./components/PlaygroundControls";

export default function App() {
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("vertical");
  const [springSettings, setSpringSettings] = useState<SpringSettings>({
    stiffness: 185,
    damping: 14,
    mass: 1.0,
  });
  const [spacingMultiplier, setSpacingMultiplier] = useState<number>(1.0);
  const [visibleCardsCount, setVisibleCardsCount] = useState<number>(3);
  const [fanDirection, setFanDirection] = useState<"symmetrical" | "left" | "right">("symmetrical");
  const [fanAngle, setFanAngle] = useState<number>(6);
  const [coverTilt, setCoverTilt] = useState<number>(-12);

  // New customizable options
  const [deploymentStyle, setDeploymentStyle] = useState<
    "fan" | "skew3d" | "cascade" | "scatter" | "horizontal_stack"
  >("fan");
  const [staggerDelay, setStaggerDelay] = useState<number>(0.03);
  const [clickBehavior, setClickBehavior] = useState<"pulse" | "toggle" | "flash">("pulse");
  const [transitionCurve, setTransitionCurve] = useState<"spring" | "tween">("spring");
  const [folderShape, setFolderShape] = useState<"vertical" | "square" | "horizontal">("vertical");
  const [cardStyle, setCardStyle] = useState<"classic" | "folder">("folder");

  // Default values to restore
  const handleReset = () => {
    setOrientation("vertical");
    setSpringSettings({
      stiffness: 185,
      damping: 14,
      mass: 1.0,
    });
    setSpacingMultiplier(1.0);
    setVisibleCardsCount(3);
    setFanDirection("symmetrical");
    setFanAngle(6);
    setCoverTilt(-12);
    setDeploymentStyle("fan");
    setStaggerDelay(0.03);
    setClickBehavior("pulse");
    setTransitionCurve("spring");
    setFolderShape("vertical");
    setCardStyle("folder");
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-neutral-950 text-neutral-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* MAIN CONTAINER */}
      <main className="w-full h-full lg:h-screen relative z-10 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* LEFT CONTAINER: INTERACTIVE CARD LIST (70% on large) */}
        <div className="w-full lg:w-[70%] h-full flex flex-col justify-center p-6 lg:p-10 min-h-0 lg:overflow-y-auto custom-scrollbar">
          {/* FOLDERS GRID CONTAINER */}
          <div
            id="folders-grid"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 justify-items-center py-12 px-8 border border-neutral-900/40 bg-neutral-900/10 rounded-2xl shadow-inner"
          >
            {STYLES_DATA.map((folder) => (
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
                deploymentStyle={deploymentStyle}
                staggerDelay={staggerDelay}
                clickBehavior={clickBehavior}
                transitionCurve={transitionCurve}
                folderShape={folderShape}
                cardStyle={cardStyle}
              />
            ))}
          </div>
        </div>

        {/* RIGHT CONTAINER: PLAYGROUND TUNER CONTROLS PANEL (30% on large) */}
        <div className="w-full lg:w-[30%] h-full flex flex-col min-h-0 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-900/20 backdrop-blur-md">
          <PlaygroundControls
            orientation={orientation}
            setOrientation={setOrientation}
            springSettings={springSettings}
            setSpringSettings={setSpringSettings}
            spacingMultiplier={spacingMultiplier}
            setSpacingMultiplier={setSpacingMultiplier}
            visibleCardsCount={visibleCardsCount}
            setVisibleCardsCount={setVisibleCardsCount}
            fanDirection={fanDirection}
            setFanDirection={setFanDirection}
            fanAngle={fanAngle}
            setFanAngle={setFanAngle}
            coverTilt={coverTilt}
            setCoverTilt={setCoverTilt}
            deploymentStyle={deploymentStyle}
            setDeploymentStyle={setDeploymentStyle}
            staggerDelay={staggerDelay}
            setStaggerDelay={setStaggerDelay}
            clickBehavior={clickBehavior}
            setClickBehavior={setClickBehavior}
            transitionCurve={transitionCurve}
            setTransitionCurve={setTransitionCurve}
            folderShape={folderShape}
            setFolderShape={setFolderShape}
            cardStyle={cardStyle}
            setCardStyle={setCardStyle}
            onReset={handleReset}
          />
        </div>
      </main>
    </div>
  );
}

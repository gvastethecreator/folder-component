import { useState } from "react";
import { Settings2, Copy, Check, Layout, RefreshCw, Code, Info, Sparkles } from "lucide-react";
import { SpringSettings } from "../types";

interface PlaygroundControlsProps {
  orientation: "horizontal" | "vertical";
  setOrientation: (val: "horizontal" | "vertical") => void;
  springSettings: SpringSettings;
  setSpringSettings: (val: SpringSettings) => void;
  spacingMultiplier: number;
  setSpacingMultiplier: (val: number) => void;
  visibleCardsCount: number;
  setVisibleCardsCount: (val: number) => void;
  fanDirection: "symmetrical" | "left" | "right";
  setFanDirection: (val: "symmetrical" | "left" | "right") => void;
  fanAngle: number;
  setFanAngle: (val: number) => void;
  coverTilt: number;
  setCoverTilt: (val: number) => void;
  // New customization props
  deploymentStyle: "fan" | "skew3d" | "cascade" | "scatter" | "horizontal_stack";
  setDeploymentStyle: (val: "fan" | "skew3d" | "cascade" | "scatter" | "horizontal_stack") => void;
  staggerDelay: number;
  setStaggerDelay: (val: number) => void;
  clickBehavior: "pulse" | "toggle" | "flash";
  setClickBehavior: (val: "pulse" | "toggle" | "flash") => void;
  transitionCurve: "spring" | "tween";
  setTransitionCurve: (val: "spring" | "tween") => void;
  folderShape: "vertical" | "square" | "horizontal";
  setFolderShape: (val: "vertical" | "square" | "horizontal") => void;
  cardStyle: "classic" | "folder";
  setCardStyle: (val: "classic" | "folder") => void;
  onReset: () => void;
}

export default function PlaygroundControls({
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
  deploymentStyle,
  setDeploymentStyle,
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
  onReset,
}: PlaygroundControlsProps) {
  const [activeTab, setActiveTab] = useState<"controls" | "code">("controls");
  const [copiedCode, setCopiedCode] = useState(false);

  const presets = [
    {
      name: "Bouncy Spring (Estándar)",
      settings: { stiffness: 185, damping: 13, mass: 1 },
      spacing: 1.0,
      stagger: 0.03,
      style: "fan" as const,
      curve: "spring" as const,
    },
    {
      name: "Smooth 3D Perspective",
      settings: { stiffness: 120, damping: 18, mass: 1.1 },
      spacing: 1.1,
      stagger: 0.04,
      style: "skew3d" as const,
      curve: "spring" as const,
    },
    {
      name: "Staircase Cascade",
      settings: { stiffness: 220, damping: 20, mass: 0.9 },
      spacing: 0.95,
      stagger: 0.05,
      style: "cascade" as const,
      curve: "spring" as const,
    },
    {
      name: "Organic Chaos (Scatter)",
      settings: { stiffness: 150, damping: 12, mass: 0.8 },
      spacing: 1.15,
      stagger: 0.03,
      style: "scatter" as const,
      curve: "spring" as const,
    },
    {
      name: "Pila Horizontal (Stack)",
      settings: { stiffness: 195, damping: 15, mass: 1 },
      spacing: 1.0,
      stagger: 0.04,
      style: "horizontal_stack" as const,
      curve: "spring" as const,
    },
  ];

  const handlePresetClick = (preset: (typeof presets)[0]) => {
    setSpringSettings(preset.settings);
    setSpacingMultiplier(preset.spacing);
    setStaggerDelay(preset.stagger);
    setDeploymentStyle(preset.style);
    setTransitionCurve(preset.curve);
  };

  const codeSnippet = `// Reusable StyleFolder Component Usage:
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // or 'motion/react'

export function StyleFolder({ 
  folder, 
  orientation = "${orientation}", 
  springSettings = { stiffness: ${springSettings.stiffness}, damping: ${springSettings.damping}, mass: ${springSettings.mass} }, 
  spacingMultiplier = ${spacingMultiplier}, 
  visibleCardsCount = ${visibleCardsCount}, 
  fanDirection = "${fanDirection}", 
  fanAngle = ${fanAngle}, 
  coverTilt = ${coverTilt},
  deploymentStyle = "${deploymentStyle}",
  staggerDelay = ${staggerDelay},
  clickBehavior = "${clickBehavior}",
  transitionCurve = "${transitionCurve}",
  folderShape = "${folderShape}",
  cardStyle = "${cardStyle}"
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isFlashed, setIsFlashed] = useState(false);

  const isOpen = isHovered || isLocked;
  const activeFiles = folder.files.slice(0, visibleCardsCount);

  const handleFolderClick = () => {
    if (clickBehavior === "toggle") {
      setIsLocked(!isLocked);
    } else if (clickBehavior === "flash") {
      setIsFlashed(true);
      setTimeout(() => setIsFlashed(false), 400);
    }
  };

  const shapeClasses = {
    vertical: "w-72 h-96",
    square: "w-72 h-72",
    horizontal: "w-96 h-64",
  }[folderShape];

  return (
    <div 
      className={"relative " + shapeClasses + " cursor-pointer"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleFolderClick}
      style={{ perspective: "1200px" }}
    >
      {/* Folder Back */}
      <div className="absolute inset-0 bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-none" />
      
      {/* Animated File Stack */}
      {activeFiles.map((file, idx) => {
        let x = 0; let y = 0; let rotate = 0;
        let rotateY = 0; let rotateX = 0; let z = 0;
        let scale = 0.94 + idx * 0.02;
        const count = activeFiles.length;

        const transition = {
          type: transitionCurve,
          ...(transitionCurve === "spring" ? springSettings : { duration: 0.38, ease: "easeOut" }),
          delay: isOpen ? idx * staggerDelay : (count - 1 - idx) * staggerDelay * 0.6
        };

        if (isOpen) {
          scale = 1.0;
          if (deploymentStyle === "skew3d") {
            rotateY = (idx - (count - 1) / 2) * 16;
            rotateX = -8;
            z = idx * 25;
            y = -42 * spacingMultiplier * (count - idx);
            x = (idx - (count - 1) / 2) * 28 * spacingMultiplier;
          } else if (deploymentStyle === "cascade") {
            x = (idx + 1) * 36 * spacingMultiplier;
            y = -(idx + 1) * 32 * spacingMultiplier;
          } else if (deploymentStyle === "horizontal_stack") {
            const dirMultiplier = fanDirection === "left" ? -1 : 1;
            x = (idx + 1) * 68 * spacingMultiplier * dirMultiplier;
            y = -15 * spacingMultiplier;
            rotate = (idx % 2 === 0 ? 1 : -1) * 2 * (fanAngle / 6);
          } else if (deploymentStyle === "scatter") {
            const scatterX = [-45, 50, -18, 38, -32];
            const scatterY = [-70, -85, -100, -75, -90];
            const scatterRotate = [-10, 12, -6, 8, -8];
            x = scatterX[idx % scatterX.length] * spacingMultiplier;
            y = scatterY[idx % scatterY.length] * spacingMultiplier;
            rotate = scatterRotate[idx % scatterRotate.length] * (fanAngle / 6);
          } else {
            // Standard Fan
            if (fanDirection === "symmetrical") {
              rotate = (idx - (count - 1) / 2) * fanAngle;
            } else {
              rotate = (fanDirection === "left" ? idx - count : idx + 1) * fanAngle * 0.75;
            }
            if (orientation === "vertical") {
              y = -(count - idx) * 45 * spacingMultiplier;
              x = (fanDirection === "left" ? idx - count : idx + 1) * 12 * spacingMultiplier;
            } else {
              x = (idx - (count - 1) / 2) * 55 * spacingMultiplier;
              y = Math.abs(idx - (count - 1) / 2) * 8 - 15;
            }
          }
        } else {
          y = idx * -4;
        }
          
        return (
          <motion.div
            key={file.id}
            className="absolute inset-4 rounded-xl overflow-hidden shadow-lg"
            animate={{ x, y, rotate, rotateX, rotateY, z, scale }}
            transition={transition}
          />
        );
      })}

      {/* Folder Front Cover */}
      <motion.div 
        className="absolute inset-0 bg-neutral-800 rounded-2xl"
        animate={{ 
          rotateX: isOpen ? coverTilt : 0,
          y: isOpen ? 4 : 0,
          scale: isOpen ? 0.98 : 1,
        }}
        whileTap={clickBehavior === "pulse" ? { scale: 0.94 } : {}}
        transition={{ type: transitionCurve, ...springSettings }}
      />
    </div>
  );
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      id="playground-controls-card"
      className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl lg:h-full lg:flex lg:flex-col"
    >
      {/* Tabs Selector */}
      <div className="flex border-b border-neutral-800/80 bg-neutral-900/40 shrink-0">
        <button
          onClick={() => setActiveTab("controls")}
          className={`flex-1 py-3 px-4 text-xs font-semibold font-mono tracking-wider uppercase border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "controls"
              ? "text-indigo-400 border-indigo-500 bg-indigo-500/5"
              : "text-neutral-500 border-transparent hover:text-neutral-300"
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Ajustes de Animación</span>
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`flex-1 py-3 px-4 text-xs font-semibold font-mono tracking-wider uppercase border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "code"
              ? "text-indigo-400 border-indigo-500 bg-indigo-500/5"
              : "text-neutral-500 border-transparent hover:text-neutral-300"
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Código Reusable</span>
        </button>
      </div>

      <div className="p-5 overflow-y-auto custom-scrollbar flex flex-col gap-5 lg:flex-1 lg:min-h-0">
        {activeTab === "controls" ? (
          <div className="flex flex-col gap-5">
            {/* 1. ANIMATION INTERRUPTION & INTERPOLATION STABILITY info */}
            <div className="bg-indigo-950/15 border border-indigo-500/10 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-400 tracking-wide uppercase flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Interrupción de Trayectoria (Cancelable)
              </span>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Todas las animaciones recalculan su vector instantáneamente al entrar o salir a
                mitad de camino, previniendo comportamientos bruscos o saltos robóticos.
              </p>
            </div>

            {/* 2. ESTILO DE DESPLIEGUE (DEPLOYMENT STYLE) */}
            <div>
              <label className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                Tipo de Despliegue
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setDeploymentStyle("fan")}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    deploymentStyle === "fan"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
                  }`}
                >
                  Abanico (Fan)
                </button>
                <button
                  type="button"
                  onClick={() => setDeploymentStyle("skew3d")}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    deploymentStyle === "skew3d"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
                  }`}
                >
                  Perspectiva 3D
                </button>
                <button
                  type="button"
                  onClick={() => setDeploymentStyle("cascade")}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    deploymentStyle === "cascade"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
                  }`}
                >
                  Escalera (Cascade)
                </button>
                <button
                  type="button"
                  onClick={() => setDeploymentStyle("scatter")}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    deploymentStyle === "scatter"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
                  }`}
                >
                  Orgánico (Scatter)
                </button>
                <button
                  type="button"
                  onClick={() => setDeploymentStyle("horizontal_stack")}
                  className={`col-span-2 py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    deploymentStyle === "horizontal_stack"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
                  }`}
                >
                  Pila Horizontal (Stack ➡️)
                </button>
              </div>
            </div>

            {/* FOLDER ASPECT RATIO / SHAPE */}
            <div>
              <label className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                Formato de Tarjeta (Forma)
              </label>
              <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setFolderShape("vertical")}
                  className={`py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    folderShape === "vertical"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Vertical (3:4)
                </button>
                <button
                  type="button"
                  onClick={() => setFolderShape("square")}
                  className={`py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    folderShape === "square"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Cuadrado (1:1)
                </button>
                <button
                  type="button"
                  onClick={() => setFolderShape("horizontal")}
                  className={`py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    folderShape === "horizontal"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Horizontal (3:2)
                </button>
              </div>
            </div>

            {/* ESTILO DE LA TARJETA (CLASSIC RECTANGLE VS FOLDER) */}
            <div>
              <label className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                Diseño Estructural (Estilo)
              </label>
              <div className="grid grid-cols-2 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setCardStyle("classic")}
                  className={`py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    cardStyle === "classic"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Rectángulo Clásico
                </button>
                <button
                  type="button"
                  onClick={() => setCardStyle("folder")}
                  className={`py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    cardStyle === "folder"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Carpeta con Pestaña 📁
                </button>
              </div>
            </div>

            {/* 3. CURVA DE ANIMACIÓN (SPRING VS TWEEN) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                  Curva e Interpolación
                </label>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {transitionCurve === "spring" ? "Física de Resorte" : "Lineal (Tween)"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setTransitionCurve("spring")}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    transitionCurve === "spring"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
                  }`}
                >
                  Spring (Sin saltos)
                </button>
                <button
                  type="button"
                  onClick={() => setTransitionCurve("tween")}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    transitionCurve === "tween"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
                  }`}
                >
                  Tween (Con saltos)
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1 leading-normal font-sans">
                {transitionCurve === "spring"
                  ? "✓ Las físicas de resorte conservan inercia y velocidad al interrumpirse a mitad de camino."
                  : "⚠ Los tweens pueden dar saltos visuales si el cursor entra/sale muy rápido."}
              </p>
            </div>

            {/* 4. RETRASO DE CASCADA (STAGGER DELAY) */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                <span>Efecto Cascada (Stagger)</span>
                <span className="text-indigo-400 font-semibold font-sans text-xs">
                  {(staggerDelay * 1000).toFixed(0)} ms
                </span>
              </div>
              <input
                id="stagger-range"
                type="range"
                min="0.00"
                max="0.12"
                step="0.01"
                value={staggerDelay}
                onChange={(e) => setStaggerDelay(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-neutral-950 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
                <span>Simultáneo</span>
                <span>Normal</span>
                <span>Muy Espaciado</span>
              </div>
            </div>

            {/* 5. COMPORTAMIENTO DEL CLICK (CLICK BEHAVIOR) */}
            <div>
              <label className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                Feedback Visual al Click
              </label>
              <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setClickBehavior("pulse")}
                  className={`py-1.5 px-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    clickBehavior === "pulse"
                      ? "bg-indigo-600 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                  title="Impulso de compresión (tactile press)"
                >
                  Impulso
                </button>
                <button
                  type="button"
                  onClick={() => setClickBehavior("toggle")}
                  className={`py-1.5 px-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    clickBehavior === "toggle"
                      ? "bg-indigo-600 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                  title="Bloquear desplegado / abierto"
                >
                  Fijar Abierto
                </button>
                <button
                  type="button"
                  onClick={() => setClickBehavior("flash")}
                  className={`py-1.5 px-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer text-center ${
                    clickBehavior === "flash"
                      ? "bg-indigo-600 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                  title="Destello de luz de color neon"
                >
                  Destello
                </button>
              </div>
            </div>

            {/* 6. ORIENTATION SWITCH (Only show if Fan deployment style is selected for better UX) */}
            {deploymentStyle === "fan" && (
              <div>
                <label className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-2.5">
                  Orientación del Despliegue
                </label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800/60">
                  <button
                    id="orientation-vertical-btn"
                    onClick={() => setOrientation("vertical")}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      orientation === "vertical"
                        ? "bg-indigo-600 text-white"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5 rotate-90" />
                    <span>Vertical Stack</span>
                  </button>
                  <button
                    id="orientation-horizontal-btn"
                    onClick={() => setOrientation("horizontal")}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      orientation === "horizontal"
                        ? "bg-indigo-600 text-white"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                    <span>Horizontal Fan</span>
                  </button>
                </div>
              </div>
            )}

            {/* 7. SPACING MULTIPLIER */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                <span>Distancia de Despliegue</span>
                <span className="text-indigo-400 font-semibold font-sans text-xs">
                  {(spacingMultiplier * 100).toFixed(0)}%
                </span>
              </div>
              <input
                id="spacing-range"
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={spacingMultiplier}
                onChange={(e) => setSpacingMultiplier(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-neutral-950 rounded-lg appearance-none"
              />
            </div>

            {/* 8. EXTRA PARAMETERS */}
            <div className="border-t border-neutral-800/80 pt-4 flex flex-col gap-4">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
                Geometría y Capas
              </span>

              {/* Cantidad de Cartas Visibles */}
              <div>
                <div className="flex justify-between items-center text-xs text-neutral-500 mb-1.5">
                  <span>Cartas Visibles</span>
                  <span className="text-indigo-400 font-semibold font-mono">
                    {visibleCardsCount}
                  </span>
                </div>
                <input
                  id="visible-cards-range"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={visibleCardsCount}
                  onChange={(e) => setVisibleCardsCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-neutral-950 rounded-lg appearance-none"
                />
              </div>

              {/* Dirección de Fanning (Only for Fan deployment style) */}
              {deploymentStyle === "fan" && (
                <div>
                  <span className="text-xs text-neutral-500 block mb-1.5">Dirección de Giro</span>
                  <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800/40">
                    <button
                      type="button"
                      onClick={() => setFanDirection("left")}
                      className={`py-1.2 text-[10px] font-medium rounded-md transition-all cursor-pointer text-center ${
                        fanDirection === "left"
                          ? "bg-indigo-600 text-white"
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      Izquierda
                    </button>
                    <button
                      type="button"
                      onClick={() => setFanDirection("symmetrical")}
                      className={`py-1.2 text-[10px] font-medium rounded-md transition-all cursor-pointer text-center ${
                        fanDirection === "symmetrical"
                          ? "bg-indigo-600 text-white"
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      Simétrico
                    </button>
                    <button
                      type="button"
                      onClick={() => setFanDirection("right")}
                      className={`py-1.2 text-[10px] font-medium rounded-md transition-all cursor-pointer text-center ${
                        fanDirection === "right"
                          ? "bg-indigo-600 text-white"
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      Derecha
                    </button>
                  </div>
                </div>
              )}

              {/* Ángulo / Intensidad de Rotación */}
              {deploymentStyle !== "cascade" && (
                <div>
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                    <span>Ángulo de Rotación</span>
                    <span className="text-neutral-300 font-mono text-[11px]">{fanAngle}°</span>
                  </div>
                  <input
                    id="fan-angle-range"
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={fanAngle}
                    onChange={(e) => setFanAngle(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-neutral-950 rounded-lg appearance-none"
                  />
                </div>
              )}

              {/* Inclinación de Portada (Cover Tilt) */}
              <div>
                <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                  <span>Inclinación de Portada (3D)</span>
                  <span className="text-neutral-300 font-mono text-[11px]">
                    {Math.abs(coverTilt)}°
                  </span>
                </div>
                <input
                  id="cover-tilt-range"
                  type="range"
                  min="-25"
                  max="-5"
                  step="1"
                  value={coverTilt}
                  onChange={(e) => setCoverTilt(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-neutral-950 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* 9. SPRING PARAMETERS (Only relevant when transitionCurve is spring) */}
            {transitionCurve === "spring" && (
              <div className="border-t border-neutral-800/80 pt-4 flex flex-col gap-4">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
                  Física del Resorte (Spring)
                </span>

                {/* Stiffness slider */}
                <div>
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                    <span>Stiffness (Rigidez)</span>
                    <span className="text-neutral-300 font-mono text-[11px]">
                      {springSettings.stiffness}
                    </span>
                  </div>
                  <input
                    id="spring-stiffness-range"
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={springSettings.stiffness}
                    onChange={(e) =>
                      setSpringSettings({
                        ...springSettings,
                        stiffness: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-neutral-950 rounded-lg appearance-none"
                  />
                </div>

                {/* Damping slider */}
                <div>
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                    <span>Damping (Amortiguación)</span>
                    <span className="text-neutral-300 font-mono text-[11px]">
                      {springSettings.damping}
                    </span>
                  </div>
                  <input
                    id="spring-damping-range"
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={springSettings.damping}
                    onChange={(e) =>
                      setSpringSettings({
                        ...springSettings,
                        damping: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-neutral-950 rounded-lg appearance-none"
                  />
                </div>

                {/* Mass slider */}
                <div>
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                    <span>Mass (Inercia / Masa)</span>
                    <span className="text-neutral-300 font-mono text-[11px]">
                      {springSettings.mass}
                    </span>
                  </div>
                  <input
                    id="spring-mass-range"
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={springSettings.mass}
                    onChange={(e) =>
                      setSpringSettings({
                        ...springSettings,
                        mass: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-neutral-950 rounded-lg appearance-none"
                  />
                </div>
              </div>
            )}

            {/* 10. PRESETS */}
            <div className="border-t border-neutral-800/80 pt-4">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-2.5">
                Presets de Comportamiento
              </span>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetClick(preset)}
                    className="text-left p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800/40 rounded-xl text-[10px] text-neutral-300 hover:text-white transition-all flex flex-col justify-between group cursor-pointer h-16"
                  >
                    <span className="font-semibold block leading-tight text-[11px]">
                      {preset.name}
                    </span>
                    <span className="text-neutral-500 group-hover:text-indigo-400 text-[9px] block font-mono mt-1">
                      {preset.style.toUpperCase()} • {preset.curve.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* RESET BUTTON */}
            <button
              id="reset-playground-btn"
              onClick={onReset}
              className="w-full py-2.5 mt-2 bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-450 hover:text-white transition-all flex items-center justify-center gap-1.5 font-mono cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restaurar Valores</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                React + Framer Motion Code
              </span>
              <button
                id="copy-reusable-code-btn"
                onClick={handleCopyCode}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  copiedCode
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60"
                }`}
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl text-[10px] font-mono text-neutral-300 overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
              <pre>{codeSnippet}</pre>
            </div>

            <div className="bg-indigo-950/10 border border-indigo-500/10 p-3.5 rounded-xl flex items-start gap-2 text-indigo-400 text-xs">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="leading-relaxed text-[11px] text-indigo-300/80">
                Este componente se basa en la flexibilidad de <strong>framer-motion</strong> para
                animar múltiples elementos infantiles a la vez a través de animaciones basadas en
                estados (hover de React). Puedes integrar este código directamente en tu proyecto.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

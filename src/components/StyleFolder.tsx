import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FolderData, SpringSettings } from "../types";

const EASE_OUT_QUINT: [number, number, number, number] = [0.25, 1, 0.5, 1];

interface StyleFolderProps {
  folder: FolderData;
  orientation: "horizontal" | "vertical";
  springSettings: SpringSettings;
  spacingMultiplier: number;
  visibleCardsCount: number;
  fanDirection: "symmetrical" | "left" | "right";
  fanAngle: number;
  coverTilt: number;
  // New customization props
  deploymentStyle: "fan" | "skew3d" | "cascade" | "scatter" | "horizontal_stack";
  staggerDelay: number;
  clickBehavior: "pulse" | "toggle" | "flash";
  transitionCurve: "spring" | "tween";
  folderShape: "vertical" | "square" | "horizontal";
  cardStyle: "classic" | "folder";
}

export default function StyleFolder({
  folder,
  orientation,
  springSettings,
  spacingMultiplier,
  visibleCardsCount,
  fanDirection,
  fanAngle,
  coverTilt,
  deploymentStyle,
  staggerDelay,
  clickBehavior,
  transitionCurve,
  folderShape,
  cardStyle,
}: StyleFolderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isFlashed, setIsFlashed] = useState(false);

  const { files } = folder;
  // Limit the files rendered to the visible card count configured in settings
  const activeFiles = files.slice(0, visibleCardsCount);

  // Combine hover state and toggle lock state
  const isOpen = isHovered || isLocked;

  const handleFolderClick = () => {
    if (clickBehavior === "toggle") {
      setIsLocked(!isLocked);
    } else if (clickBehavior === "flash") {
      setIsFlashed(true);
      setTimeout(() => setIsFlashed(false), 400);
    }
  };

  // Map folder shape to sizing classes with mobile-first responsiveness
  const shapeClasses = {
    vertical: "w-72 h-96 max-w-full",
    square: "w-72 h-72 max-w-full",
    horizontal: "w-80 sm:w-96 h-56 sm:h-64 max-w-full",
  }[folderShape || "vertical"];

  return (
    <div
      id={`folder-container-${folder.id}`}
      className={`relative ${shapeClasses} select-none group rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
        clickBehavior === "toggle" ? "cursor-pointer" : "cursor-pointer"
      }`}
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleFolderClick}
    >
      {/* 1. FOLDER BACK PANEL */}
      <div
        id={`folder-back-${folder.id}`}
        className={`absolute inset-0 bg-neutral-900 shadow-2xl transition-colors duration-300 overflow-hidden ${
          cardStyle === "folder" ? "rounded-2xl rounded-tl-none" : "rounded-2xl"
        }`}
        style={{
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          isolation: "isolate",
          willChange: "transform",
        }}
      >
        {/* Blurred cover image background for physical folder appearance matching style color */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={folder.coverImage}
            alt=""
            className="w-full h-full object-cover scale-150 blur-2xl opacity-40 saturate-150"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-neutral-950/60" />
        </div>

        {/* Folder tab on back - also blurred cover image */}
        {cardStyle === "folder" && (
          <div
            className="absolute -top-4 left-0 h-4 w-28 rounded-t-xl transition-colors duration-300 overflow-hidden"
            style={{
              clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
            }}
          >
            <img
              src={folder.coverImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-150 blur-lg opacity-45 saturate-150"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-neutral-950/50" />
          </div>
        )}

        {/* Grid dots visual styling inside the back folder */}
        <div className="absolute inset-4 rounded-xl opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
      </div>

      {/* 2. STYLE CARDS (FILES) IN THE MIDDLE */}
      {activeFiles.map((file, idx) => {
        // Calculate animations depending on index & orientation & custom directions
        let x = 0;
        let y = 0;
        let rotate = 0;
        let rotateY = 0;
        let rotateX = 0;
        let z = 0;
        let scale = 0.94 + idx * 0.02; // stacked scale

        const count = activeFiles.length;

        // Custom transition per card with dynamic stagger delay
        // Flipping the stagger order on exit (collapse) ensures an incredibly organic feel
        const transition = {
          type: transitionCurve,
          ...(transitionCurve === "spring"
            ? {
                stiffness: springSettings.stiffness,
                damping: springSettings.damping,
                mass: springSettings.mass,
              }
            : {
                duration: 0.38,
                ease: EASE_OUT_QUINT, // premium easeOutQuint
              }),
          delay: isOpen ? idx * staggerDelay : (count - 1 - idx) * staggerDelay * 0.6,
        };

        if (isOpen) {
          scale = 1.0;

          if (deploymentStyle === "skew3d") {
            // Elegant 3D layered stacking
            rotateY = (idx - (count - 1) / 2) * 16;
            rotateX = -8;
            z = idx * 25;
            y = -42 * spacingMultiplier * (count - idx);
            x = (idx - (count - 1) / 2) * 28 * spacingMultiplier;
          } else if (deploymentStyle === "cascade") {
            // Straight diagonal staircase cascade
            x = (idx + 1) * 36 * spacingMultiplier;
            y = -(idx + 1) * 32 * spacingMultiplier;
            rotate = 0;
          } else if (deploymentStyle === "horizontal_stack") {
            // Horizontal stack towards one side (left or right depending on fanDirection)
            const dirMultiplier = fanDirection === "left" ? -1 : 1;
            x = (idx + 1) * 68 * spacingMultiplier * dirMultiplier;
            y = -15 * spacingMultiplier; // raise slightly to clear folder front
            rotate = (idx % 2 === 0 ? 1 : -1) * 2 * (fanAngle / 6); // elegant micro-tilt
          } else if (deploymentStyle === "scatter") {
            // Organic random scatter
            const scatterX = [-45, 50, -18, 38, -32];
            const scatterY = [-70, -85, -100, -75, -90];
            const scatterRotate = [-10, 12, -6, 8, -8];
            x = scatterX[idx % scatterX.length] * spacingMultiplier;
            y = scatterY[idx % scatterY.length] * spacingMultiplier;
            rotate = scatterRotate[idx % scatterRotate.length] * (fanAngle / 6);
          } else {
            // "fan" (Standard Fan style)
            if (fanDirection === "symmetrical") {
              const midIndex = (count - 1) / 2;
              rotate = (idx - midIndex) * fanAngle;
            } else if (fanDirection === "left") {
              rotate = (idx - count) * fanAngle * 0.75;
            } else if (fanDirection === "right") {
              rotate = (idx + 1) * fanAngle * 0.75;
            }

            if (orientation === "vertical") {
              const offset = (count - idx) * 45 * spacingMultiplier;
              y = -offset;
              if (fanDirection === "left") {
                x = (idx - count) * 12 * spacingMultiplier;
              } else if (fanDirection === "right") {
                x = (idx + 1) * 12 * spacingMultiplier;
              }
            } else {
              if (fanDirection === "symmetrical") {
                const midIndex = (count - 1) / 2;
                x = (idx - midIndex) * 55 * spacingMultiplier;
                y = Math.abs(idx - midIndex) * 8 - 15;
              } else if (fanDirection === "left") {
                const offset = (count - idx) * 38 * spacingMultiplier;
                x = -offset;
                y = (idx - 1) * -4;
              } else {
                const offset = (idx + 1) * 38 * spacingMultiplier;
                x = offset;
                y = (idx - 1) * -4;
              }
            }
          }
        } else {
          // Collapsed state
          y = idx * -4;
          if (deploymentStyle !== "cascade" && deploymentStyle !== "horizontal_stack") {
            if (fanDirection === "symmetrical") {
              const midIndex = (count - 1) / 2;
              rotate = (idx - midIndex) * 1.5;
            } else if (fanDirection === "left") {
              rotate = (idx - count) * 1.0;
            } else {
              rotate = (idx + 1) * 1.0;
            }
          }
        }

        return (
          <motion.div
            key={file.id}
            id={`file-card-${folder.id}-${file.id}`}
            className="absolute inset-4 bg-neutral-950 rounded-xl overflow-hidden shadow-2xl border border-neutral-800/40"
            style={{
              zIndex: 10 + idx,
              transformOrigin: "bottom center",
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
            }}
            animate={{
              x,
              y,
              rotate,
              rotateX,
              rotateY,
              z,
              scale,
            }}
            transition={transition}
          >
            {/* Elegant pure style card - Image only */}
            <img
              src={file.image}
              alt={file.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Subtle caption of file name */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm border border-white/5 px-2 py-0.5 rounded text-[8px] text-neutral-300 font-mono">
              {file.name}
            </div>
          </motion.div>
        );
      })}

      {/* 3. FOLDER FRONT PANEL */}
      {/* Acts as the cover, tilts forward slightly in 3D on hover or toggle state */}
      <motion.div
        id={`folder-front-${folder.id}`}
        className="absolute inset-0"
        style={{
          zIndex: 30,
          transformOrigin: "bottom center",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          isolation: "isolate",
          willChange: "transform",
        }}
        animate={{
          rotateX: isOpen ? coverTilt : 0,
          y: isOpen ? 4 : 0,
          scale: isOpen ? 0.98 : 1,
        }}
        whileTap={clickBehavior === "pulse" ? { scale: 0.94, rotate: -0.5 } : {}}
        transition={{
          type: transitionCurve,
          ...(transitionCurve === "spring"
            ? {
                stiffness: springSettings.stiffness,
                damping: springSettings.damping,
                mass: springSettings.mass,
              }
            : {
                duration: 0.35,
                ease: EASE_OUT_QUINT,
              }),
        }}
      >
        {cardStyle === "folder" && (
          /* Folder tab on front cover */
          <div
            className="absolute -top-3 left-4 h-3.5 w-24 rounded-t-lg bg-neutral-800 border-t border-x border-neutral-700/30 overflow-hidden"
            style={{
              clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
            }}
          >
            <img
              src={folder.coverImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-150 blur-md opacity-45 saturate-150"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-neutral-950/45" />
          </div>
        )}

        <div
          className={`absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-2xl flex flex-col justify-end overflow-hidden border border-neutral-700/30 ${
            cardStyle === "folder" ? "rounded-2xl rounded-tl-none" : "rounded-2xl"
          }`}
          style={{
            WebkitMaskImage: "-webkit-radial-gradient(white, black)",
            isolation: "isolate",
          }}
        >
          {/* Cover Image inside the folder front - spanning full height */}
          <div className="absolute inset-0 w-full h-full bg-neutral-950 overflow-hidden">
            <img
              src={folder.coverImage}
              alt={folder.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            {/* Neon gradient mesh border matching folder theme */}
            <div
              className={`absolute inset-0 bg-gradient-to-t ${folder.themeColor} opacity-20 mix-blend-color-dodge`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-transparent opacity-95" />
          </div>

          {/* Fold reflection effect */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />

          {/* Elegant glass light sweep on hover */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-15"
            style={{ transform: isOpen ? "none" : undefined }}
          />

          {/* Flash overlay for click visual feedback */}
          <AnimatePresence>
            {isFlashed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 bg-gradient-to-tr ${folder.themeColor} mix-blend-screen pointer-events-none z-15`}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          {/* Lock open indicator icon/badge */}
          {isLocked && (
            <div className="absolute top-3 right-3 bg-indigo-500/90 text-white rounded-full p-1 text-[10px] shadow-lg flex items-center justify-center font-bold tracking-tight animate-pulse z-25">
              🔒 LOCK
            </div>
          )}

          {/* Folder Label Body - Compact overlay with elegant backdrop blur */}
          <div className="p-3.5 bg-neutral-950/70 backdrop-blur-md flex flex-col justify-between gap-1 z-20 w-full">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-100 tracking-tight flex items-center gap-2">
                  {folder.title}
                </h3>
                <span
                  className={`px-2 py-0.5 text-[9px] font-medium tracking-wide uppercase rounded-full ${folder.badgeColor} backdrop-blur-md`}
                >
                  {folder.files.length}
                </span>
              </div>
              <p className="text-[10px] text-neutral-300 line-clamp-2 mt-0.5 leading-relaxed">
                {folder.description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

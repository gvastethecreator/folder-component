import { memo, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  createFolderEngineController,
  type CardTransform,
  type FolderEngineController,
  type FolderEngineOptions,
} from "../animation/folderEngines";
import ImageWithFallback, { neutralTone } from "./ImageWithFallback";
import { FOLDER_PALETTES } from "../config/playgroundCatalog";
import type {
  AnimationEngine,
  DeploymentStyle,
  FolderData,
  PaletteId,
  SpringSettings,
  TabAlignment,
  TransitionCurve,
} from "../types";

gsap.registerPlugin(useGSAP);

const srcSetCache = new Map<string, string>();

function pexelsSrcSet(source: string) {
  const cached = srcSetCache.get(source);
  if (cached) return cached;

  const medium = source.replace("w=800&h=1000", "w=480&h=600");
  const srcSet = `${medium} 480w, ${source} 800w`;
  srcSetCache.set(source, srcSet);
  return srcSet;
}

interface StyleFolderProps {
  folder: FolderData;
  orientation: "horizontal" | "vertical";
  springSettings: SpringSettings;
  spacingMultiplier: number;
  visibleCardsCount: number;
  fanDirection: "symmetrical" | "left" | "right";
  fanAngle: number;
  coverTilt: number;
  deploymentStyle: DeploymentStyle;
  staggerDelay: number;
  clickBehavior: "pulse" | "toggle" | "flash";
  transitionCurve: TransitionCurve;
  folderShape: "vertical" | "square" | "horizontal";
  cardStyle: "classic" | "folder";
  gridItemSize?: number;
  priority?: boolean;
  compact?: boolean;
  textureEnabled?: boolean;
  tabFill?: "color" | "image";
  tabColor?: string;
  tabWidth?: number;
  tabHeight?: number;
  tabAlignment?: TabAlignment;
  labelVisible?: boolean;
  labelOpacity?: number;
  labelBackdropBlur?: number;
  folderBorderWidth?: number;
  folderBorderOpacity?: number;
  folderRadius?: number;
  paletteId?: PaletteId;
  visualSource?: "image" | "tone";
  animationEngine?: AnimationEngine;
}

const clamp = (minimum: number, maximum: number, value: number) =>
  Math.min(maximum, Math.max(minimum, value));

function collapsedTransform(
  index: number,
  count: number,
  fanDirection: StyleFolderProps["fanDirection"],
  deploymentStyle: DeploymentStyle,
  layoutScale: number,
): CardTransform {
  let rotation = 0;

  if (deploymentStyle !== "cascade" && deploymentStyle !== "horizontal_stack") {
    if (fanDirection === "symmetrical") {
      rotation = (index - (count - 1) / 2) * 1.25;
    } else if (fanDirection === "left") {
      rotation = (index - count) * 0.8;
    } else {
      rotation = (index + 1) * 0.8;
    }
  }

  return {
    x: 0,
    y: index * -4 * layoutScale,
    rotation,
    scale: 0.95 + index * 0.015,
  };
}

function expandedTransform(
  index: number,
  count: number,
  {
    deploymentStyle,
    fanDirection,
    fanAngle,
    orientation,
    spacingMultiplier,
    layoutScale,
  }: Pick<
    StyleFolderProps,
    "deploymentStyle" | "fanDirection" | "fanAngle" | "orientation" | "spacingMultiplier"
  > & { layoutScale: number },
): CardTransform {
  let x = 0;
  let y = 0;
  let rotation = 0;
  let scale = 1;

  if (deploymentStyle === "skew3d") {
    rotation = (index - (count - 1) / 2) * 3.5;
    y = -38 * layoutScale * spacingMultiplier * (count - index);
    x = (index - (count - 1) / 2) * 25 * layoutScale * spacingMultiplier;
    scale = 0.96 + index * 0.02;
  } else if (deploymentStyle === "cascade") {
    x = (index + 1) * 32 * layoutScale * spacingMultiplier;
    y = -(index + 1) * 31 * layoutScale * spacingMultiplier;
  } else if (deploymentStyle === "horizontal_stack") {
    const direction = fanDirection === "left" ? -1 : 1;
    x = (index + 1) * 32 * layoutScale * spacingMultiplier * direction;
    y = -14 * layoutScale * spacingMultiplier;
    rotation = (index % 2 === 0 ? 1 : -1) * (fanAngle / 3.5);
  } else if (deploymentStyle === "scatter") {
    const scatterX = [-42, 46, -16, 34, -28];
    const scatterY = [-68, -82, -94, -72, -86];
    const scatterRotation = [-8, 10, -5, 7, -7];
    x = scatterX[index % scatterX.length] * layoutScale * spacingMultiplier;
    y = scatterY[index % scatterY.length] * layoutScale * spacingMultiplier;
    rotation = scatterRotation[index % scatterRotation.length] * (fanAngle / 6);
  } else if (deploymentStyle === "orbit") {
    const progress = count <= 1 ? 0.5 : index / (count - 1);
    const angle = Math.PI + progress * Math.PI;
    x = Math.cos(angle) * 70 * layoutScale * spacingMultiplier;
    y = (Math.sin(angle) * 76 - 24) * layoutScale * spacingMultiplier;
    rotation = (progress - 0.5) * fanAngle * 2.2;
    scale = 0.96 + Math.sin(progress * Math.PI) * 0.04;
  } else if (deploymentStyle === "staircase") {
    const centeredIndex = index - (count - 1) / 2;
    x = centeredIndex * 46 * layoutScale * spacingMultiplier;
    y = -(index + 1) * 29 * layoutScale * spacingMultiplier;
    rotation = centeredIndex * (fanAngle / 4);
    scale = 0.97 + index * 0.008;
  } else if (deploymentStyle === "burst") {
    const burstX = [-62, -32, 0, 32, 62];
    const burstY = [-54, -84, -104, -84, -54];
    const burstRotation = [-12, -6, 0, 6, 12];
    const slot = index % burstX.length;
    x = burstX[slot] * layoutScale * spacingMultiplier;
    y = burstY[slot] * layoutScale * spacingMultiplier;
    rotation = burstRotation[slot] * (fanAngle / 6);
    scale = slot === 2 ? 1 : 0.97;
  } else if (deploymentStyle === "deck_split") {
    const level = Math.floor(index / 2) + 1;
    const direction = index % 2 === 0 ? -1 : 1;
    x = direction * (34 + level * 20) * layoutScale * spacingMultiplier;
    y = -(32 + level * 31) * layoutScale * spacingMultiplier;
    rotation = direction * (fanAngle / 2 + level * 1.5);
    scale = 1 - level * 0.012;
  } else {
    if (fanDirection === "symmetrical") {
      rotation = (index - (count - 1) / 2) * fanAngle;
    } else if (fanDirection === "left") {
      rotation = (index - count) * fanAngle * 0.75;
    } else {
      rotation = (index + 1) * fanAngle * 0.75;
    }

    if (orientation === "vertical") {
      y = -(count - index) * 43 * layoutScale * spacingMultiplier;
      if (fanDirection === "left") {
        x = (index - count) * 10 * layoutScale * spacingMultiplier;
      } else if (fanDirection === "right") {
        x = (index + 1) * 10 * layoutScale * spacingMultiplier;
      }
    } else if (fanDirection === "symmetrical") {
      const middle = (count - 1) / 2;
      x = (index - middle) * 50 * layoutScale * spacingMultiplier;
      y = (Math.abs(index - middle) * 7 - 14) * layoutScale;
    } else {
      const direction = fanDirection === "left" ? -1 : 1;
      const order = fanDirection === "left" ? count - index : index + 1;
      x = order * 35 * layoutScale * spacingMultiplier * direction;
      y = (index - 1) * -4 * layoutScale;
    }
  }

  return { x, y, rotation, scale };
}

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return reducedMotion;
}

function StyleFolder({
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
  gridItemSize = 128,
  priority = false,
  compact = false,
  textureEnabled = false,
  tabFill = "image",
  tabColor = "#737373",
  tabWidth = 50,
  tabHeight = 12,
  tabAlignment = "left",
  labelVisible = true,
  labelOpacity = 0.9,
  labelBackdropBlur = 8,
  folderBorderWidth = 1,
  folderBorderOpacity = 0.72,
  folderRadius = 12,
  paletteId = "graphite",
  visualSource = "image",
  animationEngine = "gsap",
}: StyleFolderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const engineControllerRef = useRef<FolderEngineController | null>(null);
  const isOpenRef = useRef(false);
  const reducedMotion = useReducedMotionPreference();
  const supportsVisibilityDeferral =
    typeof IntersectionObserver !== "undefined" &&
    !navigator.userAgent.toLowerCase().includes("jsdom");
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(priority || !supportsVisibilityDeferral);

  const activeFiles = folder.files.slice(0, visibleCardsCount);
  const isOpen = isHovered || isFocused || isLocked;
  isOpenRef.current = isOpen;
  const layoutScale = compact ? clamp(0.34, 0.72, gridItemSize / 288) : 1;
  const palette = FOLDER_PALETTES[paletteId];

  useEffect(() => {
    if (isNearViewport || !supportsVisibilityDeferral || !rootRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "480px 160px" },
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [isNearViewport, supportsVisibilityDeferral]);

  useEffect(() => {
    if (clickBehavior !== "toggle") setIsLocked(false);
  }, [clickBehavior]);

  const getEngineOptions = (): FolderEngineOptions | null => {
    const root = rootRef.current;
    const front = frontRef.current;
    const cards = cardRefs.current.slice(0, activeFiles.length).filter(Boolean) as HTMLDivElement[];
    if (!root || !front || cards.length === 0) return null;

    return {
      engine: animationEngine,
      root,
      cards,
      front,
      flash: flashRef.current,
      collapsed: cards.map((_, index) =>
        collapsedTransform(index, cards.length, fanDirection, deploymentStyle, layoutScale),
      ),
      expanded: cards.map((_, index) =>
        expandedTransform(index, cards.length, {
          deploymentStyle,
          fanDirection,
          fanAngle,
          orientation,
          spacingMultiplier,
          layoutScale,
        }),
      ),
      frontOpen: {
        y: clamp(2, 7, Math.abs(coverTilt) / 4),
        scale: clamp(0.95, 0.99, 1 - Math.abs(coverTilt) / 800),
      },
      initialOpen: isOpenRef.current,
      reducedMotion,
      transitionCurve,
      springSettings,
      duration:
        transitionCurve === "spring"
          ? clamp(0.34, 0.72, 0.58 + springSettings.mass * 0.08 - springSettings.stiffness / 1250)
          : transitionCurve === "bounce"
            ? 0.56
            : transitionCurve === "elastic"
              ? 0.68
              : 0.38,
      staggerDelay,
    };
  };

  useGSAP(
    (_context, contextSafe) => {
      if (animationEngine !== "gsap" || !isNearViewport) return;
      const options = getEngineOptions();
      if (!options) return;

      const controller = createFolderEngineController(options);
      const safeController: FolderEngineController = {
        setOpen: contextSafe!(controller.setOpen),
        pulse: contextSafe!(controller.pulse),
        flash: contextSafe!(controller.flash),
        destroy: controller.destroy,
      };
      engineControllerRef.current = safeController;

      return () => {
        controller.destroy();
        if (engineControllerRef.current === safeController) engineControllerRef.current = null;
      };
    },
    {
      scope: rootRef,
      dependencies: [
        animationEngine,
        isNearViewport,
        activeFiles.length,
        deploymentStyle,
        fanDirection,
        fanAngle,
        orientation,
        spacingMultiplier,
        layoutScale,
        coverTilt,
        staggerDelay,
        transitionCurve,
        springSettings.stiffness,
        springSettings.damping,
        springSettings.mass,
        reducedMotion,
      ],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    if (animationEngine === "gsap" || !isNearViewport) return;
    const options = getEngineOptions();
    if (!options) return;

    const controller = createFolderEngineController(options);
    engineControllerRef.current = controller;

    return () => {
      controller.destroy();
      if (engineControllerRef.current === controller) engineControllerRef.current = null;
    };
  }, [
    animationEngine,
    isNearViewport,
    activeFiles.length,
    deploymentStyle,
    fanDirection,
    fanAngle,
    orientation,
    spacingMultiplier,
    layoutScale,
    coverTilt,
    staggerDelay,
    transitionCurve,
    springSettings.stiffness,
    springSettings.damping,
    springSettings.mass,
    reducedMotion,
  ]);

  useEffect(() => {
    if (!isNearViewport) return;
    engineControllerRef.current?.setOpen(isOpen);
  }, [animationEngine, isOpen, isNearViewport]);

  const handleFolderClick = () => {
    if (clickBehavior === "toggle") setIsLocked((current) => !current);
    if (clickBehavior === "pulse") engineControllerRef.current?.pulse();
    if (clickBehavior === "flash") engineControllerRef.current?.flash();
  };

  const shapeClasses = compact
    ? "folder-compact"
    : {
        vertical: "h-96 w-72",
        square: "h-72 w-72",
        horizontal: "h-56 w-80 sm:h-64 sm:w-96",
      }[folderShape];

  const imageSizes = compact
    ? `${gridItemSize}px`
    : folderShape === "horizontal"
      ? "384px"
      : "288px";

  return (
    <div
      ref={rootRef}
      id={`folder-container-${folder.id}`}
      className={`style-folder group relative max-w-full cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-200 ${shapeClasses}`}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      aria-label={`${folder.title}. ${folder.files.length} style cards.`}
      data-animation-engine={animationEngine}
      data-deployment={deploymentStyle}
      data-palette={paletteId}
      data-cover-image={folder.coverImage}
      data-visual-source={visualSource}
      data-tab-fill={tabFill}
      data-tab-alignment={tabAlignment}
      data-card-style={cardStyle}
      data-folder-shape={folderShape}
      data-label-visible={labelVisible}
      data-texture-enabled={textureEnabled}
      style={
        {
          zIndex: isOpen ? 50 : 1,
          "--folder-palette-accent": palette.colors[0],
          "--folder-palette-mid": palette.colors[1],
          "--folder-palette-deep": palette.colors[2],
          "--folder-size": `${gridItemSize}px`,
          "--folder-radius": `${folderRadius}px`,
          "--folder-inner-radius": `${Math.max(0, folderRadius - 2)}px`,
          "--folder-border-width": `${folderBorderWidth}px`,
          "--folder-border-opacity": `${folderBorderOpacity * 100}%`,
          "--folder-tab-width": `${tabWidth}%`,
          "--folder-tab-height": `${tabHeight}px`,
        } as CSSProperties
      }
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={handleFolderClick}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        handleFolderClick();
      }}
    >
      <div
        id={`folder-back-${folder.id}`}
        className="folder-back folder-surface absolute inset-0 border bg-neutral-900"
        style={{ boxShadow: "0 14px 28px rgb(0 0 0 / 0.24)" }}
      >
        {cardStyle === "folder" && (
          <div
            className="folder-tab absolute overflow-hidden border-x border-t bg-neutral-800"
            aria-hidden="true"
          >
            {tabFill === "image" && visualSource === "image" ? (
              <ImageWithFallback
                src={folder.coverImage}
                srcSet={pexelsSrcSet(folder.coverImage)}
                sizes={`${Math.round((gridItemSize * tabWidth) / 100)}px`}
                alt=""
                fallbackSeed={folder.id}
                width={800}
                height={1000}
                className="h-full w-full scale-110 object-cover opacity-80 blur-[2px]"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            ) : (
              <span
                className="block h-full w-full"
                style={{
                  backgroundColor: tabFill === "color" ? tabColor : neutralTone(folder.id),
                }}
              />
            )}
          </div>
        )}

        <div className="absolute inset-x-3 top-3 flex items-center justify-between font-mono text-[7px] tracking-[0.12em] text-neutral-300">
          <span>STACK</span>
          <span>{String(folder.files.length).padStart(2, "0")}</span>
        </div>
      </div>

      {isNearViewport &&
        activeFiles.map((file, index) => (
          <div
            key={file.id}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            id={`file-card-${folder.id}-${file.id}`}
            className={`${compact ? "absolute inset-2" : "absolute inset-4"} file-card pointer-events-none overflow-hidden border bg-neutral-950`}
            style={{
              zIndex: 10 + index,
              transformOrigin: "bottom center",
              boxShadow: "0 10px 20px rgb(0 0 0 / 0.28)",
            }}
          >
            {visualSource === "image" ? (
              <ImageWithFallback
                src={file.image}
                srcSet={pexelsSrcSet(file.image)}
                sizes={
                  compact ? `${gridItemSize}px` : folderShape === "horizontal" ? "352px" : "256px"
                }
                alt={file.name}
                fallbackSeed={file.id}
                fallbackOffset={index + 1}
                width={800}
                height={1000}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            ) : (
              <div
                role="img"
                aria-label={file.name}
                className="h-full w-full"
                data-image-state="tone"
                style={{ backgroundColor: neutralTone(file.id, index + 1) }}
              />
            )}
            <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/80 px-2 py-1.5">
              <span className="block truncate font-mono text-[7px] tracking-wide text-neutral-300">
                {file.name}
              </span>
            </div>
          </div>
        ))}

      <div
        ref={frontRef}
        id={`folder-front-${folder.id}`}
        className="absolute inset-0"
        style={{
          zIndex: 30,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="folder-front folder-surface absolute inset-0 overflow-hidden border bg-neutral-900"
          style={{ boxShadow: "0 16px 32px rgb(0 0 0 / 0.3), inset 0 1px rgb(255 255 255 / 0.05)" }}
        >
          {visualSource === "image" ? (
            <ImageWithFallback
              src={folder.coverImage}
              srcSet={pexelsSrcSet(folder.coverImage)}
              sizes={imageSizes}
              alt={folder.title}
              fallbackSeed={folder.id}
              width={800}
              height={1000}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              draggable={false}
            />
          ) : (
            <div
              role="img"
              aria-label={folder.title}
              className="h-full w-full"
              data-image-state="tone"
              style={{ backgroundColor: neutralTone(folder.id, 8) }}
            />
          )}

          {labelVisible && (
            <div
              className="folder-label absolute border-t p-2.5"
              style={{
                backgroundColor: `rgb(10 10 10 / ${labelOpacity})`,
                backdropFilter: `blur(${labelBackdropBlur}px)`,
                WebkitBackdropFilter: `blur(${labelBackdropBlur}px)`,
              }}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span
                  className="min-w-0 truncate text-[10px] font-medium tracking-tight text-neutral-100"
                  title={folder.title}
                >
                  {folder.title}
                </span>
                <span className="shrink-0 font-mono text-[8px] tabular-nums text-neutral-300">
                  {String(folder.files.length).padStart(2, "0")}
                </span>
              </div>
              {!compact && (
                <p className="mt-1 line-clamp-2 text-[9px] leading-3 text-neutral-300">
                  {folder.description}
                </p>
              )}
            </div>
          )}

          <div
            ref={flashRef}
            className="pointer-events-none absolute inset-0 bg-white opacity-0"
            aria-hidden="true"
          />
        </div>
      </div>

      {isLocked && (
        <span className="folder-pinned absolute -bottom-6 left-0 z-40 font-mono text-[7px] tracking-[0.16em]">
          PINNED
        </span>
      )}
    </div>
  );
}

const MemoizedStyleFolder = memo(StyleFolder);
MemoizedStyleFolder.displayName = "StyleFolder";

export default MemoizedStyleFolder;

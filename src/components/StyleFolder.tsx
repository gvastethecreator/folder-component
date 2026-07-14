import { memo, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  createFolderEngineController,
  type FolderEngineController,
  type FolderEngineOptions,
} from "../animation/folderEngines";
import { getCollapsedTransforms, getExpandedTransforms } from "../animation/folderGeometry";
import { getMotionDuration } from "../animation/animationTiming";
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
  cardShadowBlur?: number;
  cardShadowOpacity?: number;
  folderRadius?: number;
  paletteId?: PaletteId;
  visualSource?: "image" | "tone";
  animationEngine?: AnimationEngine;
}

const clamp = (minimum: number, maximum: number, value: number) =>
  Math.min(maximum, Math.max(minimum, value));

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
  folderBorderWidth = 0,
  folderBorderOpacity = 0.72,
  cardShadowBlur = 18,
  cardShadowOpacity = 0.22,
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
      collapsed: getCollapsedTransforms(cards.length, fanDirection, deploymentStyle, layoutScale),
      expanded: getExpandedTransforms(cards.length, {
        deploymentStyle,
        fanDirection,
        fanAngle,
        orientation,
        spacingMultiplier,
        layoutScale,
      }),
      frontOpen: {
        y: clamp(2, 7, Math.abs(coverTilt) / 4),
        scale: clamp(0.95, 0.99, 1 - Math.abs(coverTilt) / 800),
      },
      initialOpen: isOpenRef.current,
      reducedMotion,
      transitionCurve,
      springSettings,
      duration: getMotionDuration(transitionCurve, springSettings),
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
          "--folder-card-shadow-blur": `${cardShadowBlur}px`,
          "--folder-card-shadow-offset": `${Math.round(cardShadowBlur * 0.34)}px`,
          "--folder-card-shadow-opacity": cardShadowOpacity,
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
      >
        {cardStyle === "folder" && (
          <div className="folder-tab absolute" aria-hidden="true">
            <div className="folder-tab-content absolute">
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
          </div>
        )}

        <div className="folder-back-meta absolute inset-x-3 top-3 flex items-center justify-between font-mono text-[7px] tracking-[0.12em] text-neutral-300">
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
            <div className="file-card-label absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/80 px-2 py-1.5">
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
        <div className="folder-front folder-surface absolute inset-0 overflow-hidden border bg-neutral-900">
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
                backgroundColor: `rgb(var(--folder-label-rgb) / ${labelOpacity})`,
                backdropFilter:
                  labelOpacity < 1 && labelBackdropBlur > 0
                    ? `blur(${labelBackdropBlur}px)`
                    : "none",
                WebkitBackdropFilter:
                  labelOpacity < 1 && labelBackdropBlur > 0
                    ? `blur(${labelBackdropBlur}px)`
                    : "none",
              }}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span
                  className="folder-label-title min-w-0 truncate text-[10px] font-medium tracking-tight text-neutral-100"
                  title={folder.title}
                >
                  {folder.title}
                </span>
                <span className="folder-label-count shrink-0 font-mono text-[8px] tabular-nums text-neutral-300">
                  {String(folder.files.length).padStart(2, "0")}
                </span>
              </div>
              {!compact && (
                <p className="folder-label-description mt-1 line-clamp-2 text-[9px] leading-3 text-neutral-300">
                  {folder.description}
                </p>
              )}
            </div>
          )}

          <div
            ref={flashRef}
            className="folder-flash pointer-events-none absolute inset-0 bg-white opacity-0"
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

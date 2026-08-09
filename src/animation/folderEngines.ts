import gsap from "gsap";
import type { AnimationEngine, SpringSettings, TransitionCurve } from "../types";
import type { CardTransform } from "./folderGeometry";
import { getGsapEase, getNativeEase } from "./animationTiming";

export interface FolderEngineController {
  setOpen: (open: boolean, immediate?: boolean) => void;
  pulse: () => void;
  flash: () => void;
  destroy: () => void;
}

export interface FolderEngineOptions {
  engine: AnimationEngine;
  root: HTMLElement;
  cards: HTMLElement[];
  front: HTMLElement;
  flash: HTMLElement | null;
  collapsed: CardTransform[];
  expanded: CardTransform[];
  frontOpen: Pick<CardTransform, "y" | "scale">;
  initialOpen: boolean;
  reducedMotion: boolean;
  transitionCurve: TransitionCurve;
  springSettings: SpringSettings;
  duration: number;
  staggerDelay: number;
}

function transformValue(transform: CardTransform) {
  return `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${transform.rotation}deg) scale(${transform.scale})`;
}

function applyTransform(target: HTMLElement, transform: CardTransform) {
  target.style.transform = transformValue(transform);
}

export function setImmediateState(options: FolderEngineOptions, open: boolean) {
  const transforms = open ? options.expanded : options.collapsed;
  options.cards.forEach((card, index) => applyTransform(card, transforms[index]));
  applyTransform(options.front, {
    x: 0,
    y: open ? options.frontOpen.y : 0,
    rotation: 0,
    scale: open ? options.frontOpen.scale : 1,
  });
}

export function setLayers(targets: HTMLElement[], active: boolean) {
  for (const target of targets) target.style.willChange = active ? "transform" : "auto";
}

export function orderedDelay(index: number, count: number, open: boolean, staggerDelay: number) {
  return (open ? index : count - index - 1) * staggerDelay;
}

export function resetFeedbackState(options: FolderEngineOptions) {
  options.root.style.removeProperty("transform");
  if (options.flash) {
    options.flash.style.removeProperty("opacity");
    options.flash.style.removeProperty("visibility");
  }
}

function stabilizeFeedbackSeam(
  options: FolderEngineOptions,
  controller: FolderEngineController,
): FolderEngineController {
  let pulseStarted = false;
  let flashStarted = false;
  const cleanupFrame = requestAnimationFrame(() => {
    if (!pulseStarted) options.root.style.removeProperty("transform");
    if (!flashStarted && options.flash) {
      options.flash.style.removeProperty("opacity");
      options.flash.style.removeProperty("visibility");
    }
  });

  return {
    setOpen: controller.setOpen,
    pulse: () => {
      pulseStarted = true;
      controller.pulse();
    },
    flash: () => {
      flashStarted = true;
      controller.flash();
    },
    destroy: () => {
      cancelAnimationFrame(cleanupFrame);
      controller.destroy();
    },
  };
}

function createCssController(options: FolderEngineOptions): FolderEngineController {
  const targets = [...options.cards, options.front];
  let completionTimer: ReturnType<typeof setTimeout> | null = null;
  const feedbackTimers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

  const clearCompletionTimer = () => {
    if (completionTimer) clearTimeout(completionTimer);
    completionTimer = null;
  };

  const configureTransition = (target: HTMLElement, delay: number) => {
    target.style.transitionProperty = "transform";
    target.style.transitionDuration = `${options.duration}s`;
    target.style.transitionTimingFunction = getNativeEase(
      options.transitionCurve,
      options.springSettings,
    );
    target.style.transitionDelay = `${delay}s`;
  };

  const clearTransitions = () => {
    for (const target of targets) {
      target.style.removeProperty("transition-property");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-timing-function");
      target.style.removeProperty("transition-delay");
    }
  };

  const setOpen = (open: boolean, immediate = false) => {
    clearCompletionTimer();

    if (immediate || options.reducedMotion) {
      clearTransitions();
      setImmediateState(options, open);
      setLayers(targets, false);
      return;
    }

    const transforms = open ? options.expanded : options.collapsed;
    options.cards.forEach((card, index) => {
      configureTransition(
        card,
        orderedDelay(index, options.cards.length, open, options.staggerDelay),
      );
      applyTransform(card, transforms[index]);
    });
    configureTransition(options.front, 0);
    applyTransform(options.front, {
      x: 0,
      y: open ? options.frontOpen.y : 0,
      rotation: 0,
      scale: open ? options.frontOpen.scale : 1,
    });
    setLayers(targets, true);

    const totalDuration =
      (options.duration + options.staggerDelay * Math.max(0, options.cards.length - 1)) * 1000;
    completionTimer = setTimeout(() => setLayers(targets, false), totalDuration + 40);
  };

  const replayClass = (target: HTMLElement, className: string, duration: number) => {
    const activeTimer = feedbackTimers.get(target);
    if (activeTimer) clearTimeout(activeTimer);
    target.classList.remove(className);
    void target.offsetWidth;
    target.classList.add(className);
    const timer = setTimeout(() => {
      target.classList.remove(className);
      feedbackTimers.delete(target);
    }, duration);
    feedbackTimers.set(target, timer);
  };

  setOpen(options.initialOpen, true);

  return {
    setOpen,
    pulse: () => {
      if (!options.reducedMotion) replayClass(options.root, "is-css-pulsing", 260);
    },
    flash: () => {
      if (!options.reducedMotion && options.flash) {
        replayClass(options.flash, "is-css-flashing", 360);
      }
    },
    destroy: () => {
      clearCompletionTimer();
      for (const timer of feedbackTimers.values()) clearTimeout(timer);
      feedbackTimers.clear();
      options.root.classList.remove("is-css-pulsing");
      options.flash?.classList.remove("is-css-flashing");
      clearTransitions();
      setLayers(targets, false);
      resetFeedbackState(options);
    },
  };
}

function stopWaapiAnimations(animations: Animation[], commit = true) {
  for (const animation of animations) {
    if (commit) {
      try {
        animation.commitStyles();
      } catch {
        // Some browsers cannot commit a detached or already-finished animation.
      }
    }
    animation.cancel();
  }
  animations.length = 0;
}

function createWaapiController(options: FolderEngineOptions): FolderEngineController {
  const targets = [...options.cards, options.front];
  let activeAnimations: Animation[] = [];
  let feedbackAnimations: Animation[] = [];
  let run = 0;

  const canAnimate = typeof options.root.animate === "function";

  const setOpen = (open: boolean, immediate = false) => {
    run += 1;
    const currentRun = run;
    stopWaapiAnimations(activeAnimations);

    if (immediate || options.reducedMotion || !canAnimate) {
      setImmediateState(options, open);
      setLayers(targets, false);
      return;
    }

    const transforms = open ? options.expanded : options.collapsed;
    const targetTransforms = [
      ...transforms,
      {
        x: 0,
        y: open ? options.frontOpen.y : 0,
        rotation: 0,
        scale: open ? options.frontOpen.scale : 1,
      },
    ];
    let pending = targets.length;
    setLayers(targets, true);

    activeAnimations = targets.map((target, index) => {
      const targetTransform = targetTransforms[index];
      const from = getComputedStyle(target).transform;
      const animation = target.animate(
        [
          { transform: from === "none" ? target.style.transform : from },
          { transform: transformValue(targetTransform) },
        ],
        {
          duration: options.duration * 1000,
          delay:
            index < options.cards.length
              ? orderedDelay(index, options.cards.length, open, options.staggerDelay) * 1000
              : 0,
          easing: getNativeEase(options.transitionCurve, options.springSettings),
          fill: "forwards",
        },
      );
      animation.onfinish = () => {
        applyTransform(target, targetTransform);
        animation.cancel();
        pending -= 1;
        if (pending === 0 && run === currentRun) setLayers(targets, false);
      };
      return animation;
    });
  };

  setOpen(options.initialOpen, true);

  return {
    setOpen,
    pulse: () => {
      if (options.reducedMotion || !canAnimate) return;
      stopWaapiAnimations(feedbackAnimations, false);
      feedbackAnimations.push(
        options.root.animate([{ transform: "scale(0.975)" }, { transform: "scale(1)" }], {
          duration: 240,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        }),
      );
    },
    flash: () => {
      if (options.reducedMotion || !canAnimate || !options.flash) return;
      stopWaapiAnimations(feedbackAnimations, false);
      feedbackAnimations.push(
        options.flash.animate([{ opacity: 0.28 }, { opacity: 0 }], {
          duration: 340,
          easing: "ease-out",
        }),
      );
    },
    destroy: () => {
      run += 1;
      stopWaapiAnimations(activeAnimations);
      stopWaapiAnimations(feedbackAnimations, false);
      setLayers(targets, false);
      resetFeedbackState(options);
    },
  };
}

function createGsapController(options: FolderEngineOptions): FolderEngineController {
  const targets = [...options.cards, options.front];
  let activeTimeline: gsap.core.Timeline | null = null;

  const pulseTween = gsap.fromTo(
    options.root,
    { scale: 0.975 },
    {
      scale: 1,
      duration: 0.24,
      ease: "power3.out",
      paused: true,
      immediateRender: false,
    },
  );
  const flashTween = options.flash
    ? gsap.fromTo(
        options.flash,
        { autoAlpha: 0.28 },
        {
          autoAlpha: 0,
          duration: 0.34,
          ease: "power2.out",
          paused: true,
          immediateRender: false,
        },
      )
    : null;

  const setOpen = (open: boolean, immediate = false) => {
    activeTimeline?.kill();

    if (immediate || options.reducedMotion) {
      setImmediateState(options, open);
      setLayers(targets, false);
      return;
    }

    const transforms = open ? options.expanded : options.collapsed;
    const ease = getGsapEase(options.transitionCurve, options.springSettings);
    setLayers(targets, true);

    activeTimeline = gsap.timeline({
      defaults: { duration: options.duration, ease, overwrite: "auto" },
      onComplete: () => setLayers(targets, false),
    });
    activeTimeline.to(
      options.cards,
      {
        x: (index) => transforms[index].x,
        y: (index) => transforms[index].y,
        rotation: (index) => transforms[index].rotation,
        scale: (index) => transforms[index].scale,
        stagger: {
          each: options.staggerDelay,
          from: open ? "start" : "end",
        },
      },
      0,
    );
    activeTimeline.to(
      options.front,
      {
        x: 0,
        y: open ? options.frontOpen.y : 0,
        rotation: 0,
        scale: open ? options.frontOpen.scale : 1,
      },
      0,
    );
  };

  setOpen(options.initialOpen, true);

  return {
    setOpen,
    pulse: () => {
      if (!options.reducedMotion) pulseTween.restart();
    },
    flash: () => {
      if (!options.reducedMotion) flashTween?.restart();
    },
    destroy: () => {
      activeTimeline?.kill();
      pulseTween.kill();
      flashTween?.kill();
      gsap.killTweensOf(targets);
      setLayers(targets, false);
      resetFeedbackState(options);
    },
  };
}

export function createFolderEngineController(options: FolderEngineOptions) {
  resetFeedbackState(options);
  const controller =
    options.engine === "css"
      ? createCssController(options)
      : options.engine === "waapi"
        ? createWaapiController(options)
        : createGsapController(options);
  return stabilizeFeedbackSeam(options, controller);
}

export async function loadFolderEngineController(options: FolderEngineOptions) {
  if (options.engine !== "motion" && options.engine !== "animejs") {
    return createFolderEngineController(options);
  }

  resetFeedbackState(options);
  const controller =
    options.engine === "motion"
      ? (await import("./motionFolderEngine")).createMotionController(options)
      : (await import("./animeFolderEngine")).createAnimeController(options);
  return stabilizeFeedbackSeam(options, controller);
}

export function preloadFolderEngine(engine: AnimationEngine) {
  if (engine === "motion") return import("./motionFolderEngine").then(() => undefined);
  if (engine === "animejs") return import("./animeFolderEngine").then(() => undefined);
  return Promise.resolve();
}

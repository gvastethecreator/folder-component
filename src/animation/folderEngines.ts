import gsap from "gsap";
import { animate as motionAnimate } from "motion";
import type { AnimationPlaybackControls } from "motion";
import { animate as animeAnimate, spring as animeSpring } from "animejs";
import type { JSAnimation } from "animejs";
import type { AnimationEngine, SpringSettings, TransitionCurve } from "../types";
import type { CardTransform } from "./folderGeometry";

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

function setImmediateState(options: FolderEngineOptions, open: boolean) {
  const transforms = open ? options.expanded : options.collapsed;
  options.cards.forEach((card, index) => applyTransform(card, transforms[index]));
  applyTransform(options.front, {
    x: 0,
    y: open ? options.frontOpen.y : 0,
    rotation: 0,
    scale: open ? options.frontOpen.scale : 1,
  });
}

function setLayers(targets: HTMLElement[], active: boolean) {
  for (const target of targets) target.style.willChange = active ? "transform" : "auto";
}

function orderedDelay(index: number, count: number, open: boolean, staggerDelay: number) {
  return (open ? index : count - index - 1) * staggerDelay;
}

function stopMotionAnimations(animations: AnimationPlaybackControls[]) {
  for (const animation of animations) animation.stop();
  animations.length = 0;
}

function cancelMotionAnimations(animations: AnimationPlaybackControls[]) {
  for (const animation of animations) animation.cancel();
  animations.length = 0;
}

function cancelAnimeAnimations(animations: JSAnimation[]) {
  for (const animation of animations) animation.cancel();
  animations.length = 0;
}

function resetFeedbackState(options: FolderEngineOptions) {
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

function nativeEase(options: FolderEngineOptions) {
  if (options.transitionCurve === "tween") return "cubic-bezier(0.16, 1, 0.3, 1)";
  if (options.transitionCurve === "bounce") return "cubic-bezier(0.34, 1.56, 0.64, 1)";
  if (options.transitionCurve === "elastic") return "cubic-bezier(0.18, 1.8, 0.35, 1)";
  const overshoot = Math.min(0.42, Math.max(0.08, 0.48 - options.springSettings.damping / 70));
  return `cubic-bezier(0.2, ${1 + overshoot}, 0.3, 1)`;
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
    target.style.transitionTimingFunction = nativeEase(options);
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
          easing: nativeEase(options),
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
    const overshoot = gsap.utils.clamp(0.15, 1.15, 1.35 - options.springSettings.damping / 18);
    const ease =
      options.transitionCurve === "spring"
        ? `back.out(${overshoot})`
        : options.transitionCurve === "bounce"
          ? "bounce.out"
          : options.transitionCurve === "elastic"
            ? "elastic.out(1, 0.35)"
            : "power4.out";
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

function createMotionController(options: FolderEngineOptions): FolderEngineController {
  const targets = [...options.cards, options.front];
  let activeAnimations: AnimationPlaybackControls[] = [];
  let feedbackAnimations: AnimationPlaybackControls[] = [];
  let run = 0;

  const setOpen = (open: boolean, immediate = false) => {
    run += 1;
    const currentRun = run;
    stopMotionAnimations(activeAnimations);

    if (immediate || options.reducedMotion) {
      setImmediateState(options, open);
      setLayers(targets, false);
      return;
    }

    const transforms = open ? options.expanded : options.collapsed;
    setLayers(targets, true);
    const springProfile =
      options.transitionCurve === "bounce"
        ? { stiffness: 260, damping: 9, mass: 0.8 }
        : options.transitionCurve === "elastic"
          ? { stiffness: 180, damping: 7, mass: 0.9 }
          : options.springSettings;
    const transition =
      options.transitionCurve === "tween"
        ? {
            type: "tween" as const,
            duration: options.duration,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }
        : {
            type: "spring" as const,
            stiffness: springProfile.stiffness,
            damping: springProfile.damping,
            mass: springProfile.mass,
          };

    activeAnimations = options.cards.map((card, index) =>
      motionAnimate(
        card,
        {
          x: transforms[index].x,
          y: transforms[index].y,
          rotate: transforms[index].rotation,
          scale: transforms[index].scale,
        },
        {
          ...transition,
          delay: orderedDelay(index, options.cards.length, open, options.staggerDelay),
        },
      ),
    );
    activeAnimations.push(
      motionAnimate(
        options.front,
        {
          x: 0,
          y: open ? options.frontOpen.y : 0,
          rotate: 0,
          scale: open ? options.frontOpen.scale : 1,
        },
        transition,
      ),
    );

    Promise.all(activeAnimations.map((animation) => animation.finished)).then(
      () => {
        if (run === currentRun) setLayers(targets, false);
      },
      () => {
        if (run === currentRun) setLayers(targets, false);
      },
    );
  };

  setOpen(options.initialOpen, true);

  return {
    setOpen,
    pulse: () => {
      if (options.reducedMotion) return;
      cancelMotionAnimations(feedbackAnimations);
      feedbackAnimations.push(
        motionAnimate(options.root, { scale: [0.975, 1] }, { duration: 0.24, ease: "easeOut" }),
      );
    },
    flash: () => {
      if (options.reducedMotion || !options.flash) return;
      cancelMotionAnimations(feedbackAnimations);
      feedbackAnimations.push(
        motionAnimate(options.flash, { opacity: [0.28, 0] }, { duration: 0.34, ease: "easeOut" }),
      );
    },
    destroy: () => {
      run += 1;
      stopMotionAnimations(activeAnimations);
      cancelMotionAnimations(feedbackAnimations);
      setLayers(targets, false);
      resetFeedbackState(options);
    },
  };
}

function createAnimeController(options: FolderEngineOptions): FolderEngineController {
  const targets = [...options.cards, options.front];
  let activeAnimations: JSAnimation[] = [];
  let feedbackAnimations: JSAnimation[] = [];
  let run = 0;

  const setOpen = (open: boolean, immediate = false) => {
    run += 1;
    const currentRun = run;
    cancelAnimeAnimations(activeAnimations);

    if (immediate || options.reducedMotion) {
      setImmediateState(options, open);
      setLayers(targets, false);
      return;
    }

    const transforms = open ? options.expanded : options.collapsed;
    const springProfile =
      options.transitionCurve === "bounce"
        ? { stiffness: 260, damping: 9, mass: 0.8 }
        : options.transitionCurve === "elastic"
          ? { stiffness: 180, damping: 7, mass: 0.9 }
          : options.springSettings;
    const ease =
      options.transitionCurve === "tween"
        ? "out(4)"
        : animeSpring({
            stiffness: springProfile.stiffness,
            damping: springProfile.damping,
            mass: springProfile.mass,
          });
    let pending = options.cards.length + 1;
    const completeOne = () => {
      pending -= 1;
      if (pending === 0 && run === currentRun) setLayers(targets, false);
    };

    setLayers(targets, true);
    activeAnimations = options.cards.map((card, index) =>
      animeAnimate(card, {
        x: transforms[index].x,
        y: transforms[index].y,
        rotate: transforms[index].rotation,
        scale: transforms[index].scale,
        duration: options.duration * 1000,
        delay: orderedDelay(index, options.cards.length, open, options.staggerDelay) * 1000,
        ease,
        onComplete: completeOne,
      }),
    );
    activeAnimations.push(
      animeAnimate(options.front, {
        x: 0,
        y: open ? options.frontOpen.y : 0,
        rotate: 0,
        scale: open ? options.frontOpen.scale : 1,
        duration: options.duration * 1000,
        ease,
        onComplete: completeOne,
      }),
    );
  };

  setOpen(options.initialOpen, true);

  return {
    setOpen,
    pulse: () => {
      if (options.reducedMotion) return;
      cancelAnimeAnimations(feedbackAnimations);
      feedbackAnimations.push(
        animeAnimate(options.root, {
          scale: [0.975, 1],
          duration: 240,
          ease: "out(3)",
        }),
      );
    },
    flash: () => {
      if (options.reducedMotion || !options.flash) return;
      cancelAnimeAnimations(feedbackAnimations);
      feedbackAnimations.push(
        animeAnimate(options.flash, {
          opacity: [0.28, 0],
          duration: 340,
          ease: "out(2)",
        }),
      );
    },
    destroy: () => {
      run += 1;
      cancelAnimeAnimations(activeAnimations);
      cancelAnimeAnimations(feedbackAnimations);
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
        : options.engine === "motion"
          ? createMotionController(options)
          : options.engine === "animejs"
            ? createAnimeController(options)
            : createGsapController(options);
  return stabilizeFeedbackSeam(options, controller);
}

import { animate as motionAnimate } from "motion";
import type { AnimationPlaybackControls } from "motion";
import { getSpringProfile } from "./animationTiming";
import {
  orderedDelay,
  resetFeedbackState,
  setImmediateState,
  setLayers,
  type FolderEngineController,
  type FolderEngineOptions,
} from "./folderEngines";

function stopAnimations(animations: AnimationPlaybackControls[]) {
  for (const animation of animations) animation.stop();
  animations.length = 0;
}

function cancelAnimations(animations: AnimationPlaybackControls[]) {
  for (const animation of animations) animation.cancel();
  animations.length = 0;
}

export function createMotionController(options: FolderEngineOptions): FolderEngineController {
  const targets = [...options.cards, options.front];
  let activeAnimations: AnimationPlaybackControls[] = [];
  let feedbackAnimations: AnimationPlaybackControls[] = [];
  let run = 0;

  const setOpen = (open: boolean, immediate = false) => {
    run += 1;
    const currentRun = run;
    stopAnimations(activeAnimations);

    if (immediate || options.reducedMotion) {
      setImmediateState(options, open);
      setLayers(targets, false);
      return;
    }

    const transforms = open ? options.expanded : options.collapsed;
    setLayers(targets, true);
    const springProfile = getSpringProfile(options.transitionCurve, options.springSettings);
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
      cancelAnimations(feedbackAnimations);
      feedbackAnimations.push(
        motionAnimate(options.root, { scale: [0.975, 1] }, { duration: 0.24, ease: "easeOut" }),
      );
    },
    flash: () => {
      if (options.reducedMotion || !options.flash) return;
      cancelAnimations(feedbackAnimations);
      feedbackAnimations.push(
        motionAnimate(options.flash, { opacity: [0.28, 0] }, { duration: 0.34, ease: "easeOut" }),
      );
    },
    destroy: () => {
      run += 1;
      stopAnimations(activeAnimations);
      cancelAnimations(feedbackAnimations);
      setLayers(targets, false);
      resetFeedbackState(options);
    },
  };
}

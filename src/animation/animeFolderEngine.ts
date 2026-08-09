import { animate as animeAnimate, spring as animeSpring } from "animejs";
import type { JSAnimation } from "animejs";
import { getSpringProfile } from "./animationTiming";
import {
  orderedDelay,
  resetFeedbackState,
  setImmediateState,
  setLayers,
  type FolderEngineController,
  type FolderEngineOptions,
} from "./folderEngines";

function cancelAnimations(animations: JSAnimation[]) {
  for (const animation of animations) animation.cancel();
  animations.length = 0;
}

export function createAnimeController(options: FolderEngineOptions): FolderEngineController {
  const targets = [...options.cards, options.front];
  let activeAnimations: JSAnimation[] = [];
  let feedbackAnimations: JSAnimation[] = [];
  let run = 0;

  const setOpen = (open: boolean, immediate = false) => {
    run += 1;
    const currentRun = run;
    cancelAnimations(activeAnimations);

    if (immediate || options.reducedMotion) {
      setImmediateState(options, open);
      setLayers(targets, false);
      return;
    }

    const transforms = open ? options.expanded : options.collapsed;
    const springProfile = getSpringProfile(options.transitionCurve, options.springSettings);
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
      cancelAnimations(feedbackAnimations);
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
      cancelAnimations(feedbackAnimations);
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
      cancelAnimations(activeAnimations);
      cancelAnimations(feedbackAnimations);
      setLayers(targets, false);
      resetFeedbackState(options);
    },
  };
}

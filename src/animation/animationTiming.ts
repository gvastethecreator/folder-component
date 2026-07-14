import type { SpringSettings, TransitionCurve } from "../types";

const clamp = (minimum: number, maximum: number, value: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function getMotionDuration(
  transitionCurve: TransitionCurve,
  springSettings: SpringSettings,
) {
  if (transitionCurve === "spring") {
    return clamp(0.34, 0.72, 0.58 + springSettings.mass * 0.08 - springSettings.stiffness / 1250);
  }
  if (transitionCurve === "bounce") return 0.56;
  if (transitionCurve === "elastic") return 0.68;
  return 0.38;
}

export function getSpringProfile(
  transitionCurve: TransitionCurve,
  springSettings: SpringSettings,
): SpringSettings {
  if (transitionCurve === "bounce") return { stiffness: 260, damping: 9, mass: 0.8 };
  if (transitionCurve === "elastic") return { stiffness: 180, damping: 7, mass: 0.9 };
  return springSettings;
}

export function getNativeEase(transitionCurve: TransitionCurve, springSettings: SpringSettings) {
  if (transitionCurve === "tween") return "cubic-bezier(0.16, 1, 0.3, 1)";
  if (transitionCurve === "bounce") return "cubic-bezier(0.34, 1.56, 0.64, 1)";
  if (transitionCurve === "elastic") return "cubic-bezier(0.18, 1.8, 0.35, 1)";
  const overshoot = clamp(0.08, 0.42, 0.48 - springSettings.damping / 70);
  return `cubic-bezier(0.2, ${1 + overshoot}, 0.3, 1)`;
}

export function getGsapEase(transitionCurve: TransitionCurve, springSettings: SpringSettings) {
  if (transitionCurve === "bounce") return "bounce.out";
  if (transitionCurve === "elastic") return "elastic.out(1, 0.35)";
  if (transitionCurve === "tween") return "power4.out";
  const overshoot = clamp(0.15, 1.15, 1.35 - springSettings.damping / 18);
  return `back.out(${overshoot})`;
}

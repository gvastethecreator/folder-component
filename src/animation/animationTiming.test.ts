import { describe, expect, it } from "vitest";
import { getGsapEase, getMotionDuration, getNativeEase, getSpringProfile } from "./animationTiming";

const spring = { stiffness: 185, damping: 14, mass: 1 };

describe("animation timing contract", () => {
  it("keeps duration profiles deterministic", () => {
    expect(getMotionDuration("spring", spring)).toBeCloseTo(0.512, 3);
    expect(getMotionDuration("tween", spring)).toBe(0.38);
    expect(getMotionDuration("bounce", spring)).toBe(0.56);
    expect(getMotionDuration("elastic", spring)).toBe(0.68);
  });

  it("maps native timing curves without losing spring damping", () => {
    expect(getNativeEase("tween", spring)).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
    expect(getNativeEase("bounce", spring)).toBe("cubic-bezier(0.34, 1.56, 0.64, 1)");
    expect(getNativeEase("elastic", spring)).toBe("cubic-bezier(0.18, 1.8, 0.35, 1)");
    expect(getNativeEase("spring", spring)).toBe("cubic-bezier(0.2, 1.28, 0.3, 1)");
  });

  it("maps GSAP and physics profiles for every public curve", () => {
    expect(getGsapEase("tween", spring)).toBe("power4.out");
    expect(getGsapEase("bounce", spring)).toBe("bounce.out");
    expect(getGsapEase("elastic", spring)).toBe("elastic.out(1, 0.35)");
    expect(getGsapEase("spring", spring)).toBe("back.out(0.5722222222222223)");
    expect(getSpringProfile("spring", spring)).toBe(spring);
    expect(getSpringProfile("bounce", spring)).toEqual({
      stiffness: 260,
      damping: 9,
      mass: 0.8,
    });
    expect(getSpringProfile("elastic", spring)).toEqual({
      stiffness: 180,
      damping: 7,
      mass: 0.9,
    });
  });
});

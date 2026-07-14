import { describe, expect, it } from "vitest";
import { FOLDER_DEPLOYMENTS } from "../types";
import { getCollapsedTransforms, getExpandedTransforms } from "./folderGeometry";

const baseOptions = {
  fanDirection: "symmetrical" as const,
  fanAngle: 8,
  orientation: "vertical" as const,
  spacingMultiplier: 1,
  layoutScale: 1,
};

describe("folder geometry", () => {
  it.each(FOLDER_DEPLOYMENTS)("makes every shared control observable for %s", (deploymentStyle) => {
    const create = (overrides = {}) =>
      getExpandedTransforms(3, { ...baseOptions, deploymentStyle, ...overrides });

    expect(create({ orientation: "horizontal" })).not.toEqual(create());
    expect(create({ fanDirection: "left" })).not.toEqual(create({ fanDirection: "right" }));
    expect(create({ fanAngle: 0 })).not.toEqual(create({ fanAngle: 16 }));
    expect(create({ spacingMultiplier: 0.55 })).not.toEqual(create({ spacingMultiplier: 1.45 }));
  });

  it.each(FOLDER_DEPLOYMENTS)("keeps extreme %s transforms finite", (deploymentStyle) => {
    for (const orientation of ["vertical", "horizontal"] as const) {
      for (const fanDirection of ["left", "symmetrical", "right"] as const) {
        for (const fanAngle of [0, 16]) {
          for (const spacingMultiplier of [0.55, 1.45]) {
            const transforms = getExpandedTransforms(5, {
              deploymentStyle,
              orientation,
              fanDirection,
              fanAngle,
              spacingMultiplier,
              layoutScale: 0.72,
            });

            expect(transforms).toHaveLength(5);
            expect(
              transforms.every(({ x, y, rotation, scale }) =>
                [x, y, rotation, scale].every(Number.isFinite),
              ),
            ).toBe(true);
          }
        }
      }
    }
  });

  it.each(FOLDER_DEPLOYMENTS)("keeps controls observable with one %s card", (deploymentStyle) => {
    const create = (overrides = {}) =>
      getExpandedTransforms(1, { ...baseOptions, deploymentStyle, ...overrides });

    expect(create({ orientation: "horizontal" })).not.toEqual(create());
    expect(create({ fanDirection: "left" })).not.toEqual(create({ fanDirection: "right" }));
    expect(create({ fanAngle: 0 })).not.toEqual(create({ fanAngle: 16 }));
    expect(create({ spacingMultiplier: 0.55 })).not.toEqual(create({ spacingMultiplier: 1.45 }));
  });

  it.each(FOLDER_DEPLOYMENTS)(
    "places directional %s stacks on the requested side",
    (deploymentStyle) => {
      const left = getExpandedTransforms(5, {
        ...baseOptions,
        deploymentStyle,
        fanDirection: "left",
      });
      const right = getExpandedTransforms(5, {
        ...baseOptions,
        deploymentStyle,
        fanDirection: "right",
      });

      expect(left.every(({ x }) => x < 0)).toBe(true);
      expect(right.every(({ x }) => x > 0)).toBe(true);
    },
  );

  it("handles empty and collapsed stacks", () => {
    expect(getExpandedTransforms(0, { ...baseOptions, deploymentStyle: "fan" })).toEqual([]);
    expect(getCollapsedTransforms(5, "symmetrical", "fan", 0.75)).toHaveLength(5);
  });
});

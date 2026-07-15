import { describe, expect, it } from "vitest";
import {
  getWindows11ClipTransform,
  getWindows11FolderPaths,
  getWindows11OutlineTransform,
  WINDOWS11_FOLDER_BACK_PATH,
  WINDOWS11_FOLDER_FRONT_PATH,
  WINDOWS11_FOLDER_VIEWBOX,
} from "./folderShapeGeometry";

describe("Windows 11 folder geometry", () => {
  it("preserves the supplied 224 by 176 back and front paths", () => {
    expect(WINDOWS11_FOLDER_VIEWBOX).toBe("0 0 224 176");
    expect(WINDOWS11_FOLDER_BACK_PATH).toContain("H100.4L87.43 8.38Z");
    expect(WINDOWS11_FOLDER_FRONT_PATH).toContain("L99.46 28H212");
  });

  it("mirrors both clipping and outlines for right-aligned tabs", () => {
    expect(getWindows11ClipTransform("left")).toContain("0.004464285714");
    expect(getWindows11ClipTransform("right")).toContain("-0.004464285714");
    expect(getWindows11OutlineTransform("left")).toBeUndefined();
    expect(getWindows11OutlineTransform("right")).toBe("matrix(-1 0 0 1 224 0)");
  });

  it("morphs the integrated tab and corners without changing the reference viewbox", () => {
    const reference = getWindows11FolderPaths(50, 12, 12);
    const customized = getWindows11FolderPaths(66, 18, 20);

    expect(customized.back).not.toBe(reference.back);
    expect(customized.front).not.toBe(reference.front);
    expect(customized.back).toContain("H20");
    expect(customized.front).toContain("H20");
  });

  it("keeps the minimum and maximum control values finite", () => {
    for (const [tabWidth, tabHeight, radius] of [
      [24, 6, 0],
      [78, 24, 32],
    ] as const) {
      const paths = getWindows11FolderPaths(tabWidth, tabHeight, radius);

      expect(`${paths.back}${paths.front}`).not.toMatch(/NaN|Infinity/);
      expect(paths.back).toMatch(/^M\d/);
      expect(paths.front).toMatch(/^M\d/);
      expect(paths.back).toMatch(/Z$/);
      expect(paths.front).toMatch(/Z$/);
    }
  });
});

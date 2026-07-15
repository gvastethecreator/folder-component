import type { TabAlignment } from "../types";

export const WINDOWS11_FOLDER_VIEWBOX = "0 0 224 176";
export const WINDOWS11_FOLDER_ASPECT_RATIO = 224 / 176;

const WIDTH = 224;
const BACK_BOTTOM = 138;
const FRONT_BOTTOM = 176;
const cornerControl = 0.4475;
const clamp = (minimum: number, maximum: number, value: number) =>
  Math.min(maximum, Math.max(minimum, value));
const n = (value: number) => Number(value.toFixed(2));

export interface Windows11FolderPaths {
  back: string;
  front: string;
}

/**
 * Default values reproduce the supplied SVG exactly. Tab size and corner radius then morph the
 * same Windows 11 geometry instead of layering a disconnected rectangular tab over it.
 */
export function getWindows11FolderPaths(
  tabWidth: number,
  tabHeight: number,
  folderRadius: number,
): Windows11FolderPaths {
  const join = clamp(58, 190, 100.4 + (tabWidth - 50) * 2.24);
  const backTop = clamp(14, 52, 24.14 + (tabHeight - 12) * 1.6);
  const radius = clamp(0, Math.min(32, (FRONT_BOTTOM - backTop) / 2), folderRadius);
  const innerControl = radius * cornerControl;

  const tabPlateauEnd = join - 30.72;
  const tabCurveEnd = join - 12.97;
  const tabCurveY = backTop * (8.38 / 24.14);
  const tabCurveControlY = backTop * (3.07 / 24.14);

  const frontTop = backTop + 3.86;
  const frontNotchStart = join - 24.61;
  const frontCurveEnd = join - 10.81;
  const frontJoin = join - 0.94;
  const frontLeftTop = frontTop + radius;
  const frontCurveY = frontTop + radius * (7.4 / 12);
  const frontCurveControlY = frontTop + radius * (10.39 / 12);

  return {
    back: [
      `M${n(tabCurveEnd)} ${n(tabCurveY)}`,
      `C${n(tabCurveEnd - 4.37)} ${n(tabCurveControlY)} ${n(tabPlateauEnd + 6.87)} 0 ${n(tabPlateauEnd)} 0`,
      `H${n(radius)}`,
      `C${n(innerControl)} 0 0 ${n(innerControl)} 0 ${n(radius)}`,
      `V${n(BACK_BOTTOM - radius)}`,
      `C0 ${n(BACK_BOTTOM - innerControl)} ${n(innerControl)} ${BACK_BOTTOM} ${n(radius)} ${BACK_BOTTOM}`,
      `H${n(WIDTH - radius)}`,
      `C${n(WIDTH - innerControl)} ${BACK_BOTTOM} ${WIDTH} ${n(BACK_BOTTOM - innerControl)} ${WIDTH} ${n(BACK_BOTTOM - radius)}`,
      `V${n(backTop + radius)}`,
      `C${WIDTH} ${n(backTop + innerControl)} ${n(WIDTH - innerControl)} ${n(backTop)} ${n(WIDTH - radius)} ${n(backTop)}`,
      `H${n(join)}`,
      `L${n(tabCurveEnd)} ${n(tabCurveY)}Z`,
    ].join(""),
    front: [
      `M${n(frontNotchStart)} ${n(frontLeftTop)}`,
      `C${n(frontNotchStart + 4.98)} ${n(frontLeftTop)} ${n(frontCurveEnd - 3.98)} ${n(frontCurveControlY)} ${n(frontCurveEnd)} ${n(frontCurveY)}`,
      `L${n(frontJoin)} ${n(frontTop)}`,
      `H${n(WIDTH - radius)}`,
      `C${n(WIDTH - innerControl)} ${n(frontTop)} ${WIDTH} ${n(frontTop + innerControl)} ${WIDTH} ${n(frontTop + radius)}`,
      `V${n(FRONT_BOTTOM - radius)}`,
      `C${WIDTH} ${n(FRONT_BOTTOM - innerControl)} ${n(WIDTH - innerControl)} ${FRONT_BOTTOM} ${n(WIDTH - radius)} ${FRONT_BOTTOM}`,
      `H${n(radius)}`,
      `C${n(innerControl)} ${FRONT_BOTTOM} 0 ${n(FRONT_BOTTOM - innerControl)} 0 ${n(FRONT_BOTTOM - radius)}`,
      `V${n(frontTop + radius)}`,
      `C0 ${n(frontTop + innerControl)} ${n(innerControl)} ${n(frontLeftTop)} ${n(radius)} ${n(frontLeftTop)}`,
      `H${n(frontNotchStart)}Z`,
    ].join(""),
  };
}

export const { back: WINDOWS11_FOLDER_BACK_PATH, front: WINDOWS11_FOLDER_FRONT_PATH } =
  getWindows11FolderPaths(50, 12, 12);

export function getWindows11ClipTransform(alignment: TabAlignment) {
  return alignment === "right"
    ? "matrix(-0.004464285714 0 0 0.005681818182 1 0)"
    : "matrix(0.004464285714 0 0 0.005681818182 0 0)";
}

export function getWindows11OutlineTransform(alignment: TabAlignment) {
  return alignment === "right" ? "matrix(-1 0 0 1 224 0)" : undefined;
}

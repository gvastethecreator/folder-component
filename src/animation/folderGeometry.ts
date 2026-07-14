import type { DeploymentStyle, FanDirection, Orientation } from "../types";

export interface CardTransform {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface FolderGeometryOptions {
  deploymentStyle: DeploymentStyle;
  fanDirection: FanDirection;
  fanAngle: number;
  orientation: Orientation;
  spacingMultiplier: number;
  layoutScale: number;
}

export function getCollapsedTransforms(
  count: number,
  fanDirection: FanDirection,
  deploymentStyle: DeploymentStyle,
  layoutScale: number,
): CardTransform[] {
  return Array.from({ length: count }, (_, index) => {
    let rotation = 0;

    if (deploymentStyle !== "cascade" && deploymentStyle !== "horizontal_stack") {
      if (fanDirection === "symmetrical") {
        rotation = (index - (count - 1) / 2) * 1.25;
      } else if (fanDirection === "left") {
        rotation = (index - count) * 0.8;
      } else {
        rotation = (index + 1) * 0.8;
      }
    }

    return {
      x: 0,
      y: index * -4 * layoutScale,
      rotation,
      scale: 0.95 + index * 0.015,
    };
  });
}

function fanTransforms(count: number, options: FolderGeometryOptions): CardTransform[] {
  const { fanDirection, fanAngle, orientation, spacingMultiplier, layoutScale } = options;

  return Array.from({ length: count }, (_, index) => {
    let x = 0;
    let y = 0;
    let rotation = 0;

    if (fanDirection === "symmetrical") {
      rotation = (index - (count - 1) / 2) * fanAngle;
    } else if (fanDirection === "left") {
      rotation = (index - count) * fanAngle * 0.75;
    } else {
      rotation = (index + 1) * fanAngle * 0.75;
    }
    if (count === 1 && fanDirection === "symmetrical") rotation = fanAngle * 0.18;

    if (orientation === "vertical") {
      y = -(count - index) * 43 * layoutScale * spacingMultiplier;
      if (fanDirection === "left") {
        x = (index - count) * 10 * layoutScale * spacingMultiplier;
      } else if (fanDirection === "right") {
        x = (index + 1) * 10 * layoutScale * spacingMultiplier;
      }
    } else if (fanDirection === "symmetrical") {
      const middle = (count - 1) / 2;
      x = (index - middle) * 50 * layoutScale * spacingMultiplier;
      y = (Math.abs(index - middle) * 7 - 14) * layoutScale;
    } else {
      const direction = fanDirection === "left" ? -1 : 1;
      const order = fanDirection === "left" ? count - index : index + 1;
      x = order * 35 * layoutScale * spacingMultiplier * direction;
      y = (index - 1) * -4 * layoutScale;
    }

    return { x, y, rotation, scale: 1 };
  });
}

function specialStackTransforms(count: number, options: FolderGeometryOptions): CardTransform[] {
  const { deploymentStyle, fanAngle, spacingMultiplier, layoutScale } = options;
  const distance = layoutScale * spacingMultiplier;

  return Array.from({ length: count }, (_, index) => {
    const centeredIndex = index - (count - 1) / 2;
    let x = 0;
    let y = 0;
    let rotation = 0;
    let scale = 1;

    if (deploymentStyle === "skew3d") {
      rotation = centeredIndex * fanAngle * 0.58;
      y = -38 * distance * (count - index);
      x = centeredIndex * 25 * distance;
      scale = 0.96 + index * 0.02;
    } else if (deploymentStyle === "cascade") {
      x = centeredIndex * 32 * distance;
      y = -(index + 1) * 31 * distance;
      rotation = centeredIndex * fanAngle * 0.18;
    } else if (deploymentStyle === "horizontal_stack") {
      x = centeredIndex * 32 * distance;
      y = -14 * distance;
      rotation = (index % 2 === 0 ? 1 : -1) * (fanAngle / 3.5);
    } else if (deploymentStyle === "scatter") {
      const scatterX = [-42, 46, -16, 34, -28];
      const scatterY = [-68, -82, -94, -72, -86];
      const scatterRotation = [-8, 10, -5, 7, -7];
      x = scatterX[index % scatterX.length] * distance;
      y = scatterY[index % scatterY.length] * distance;
      rotation = scatterRotation[index % scatterRotation.length] * (fanAngle / 6);
    } else if (deploymentStyle === "orbit") {
      const progress = count <= 1 ? 0.5 : index / (count - 1);
      const angle = Math.PI + progress * Math.PI;
      x = Math.cos(angle) * 70 * distance;
      y = (Math.sin(angle) * 76 - 24) * distance;
      rotation = (progress - 0.5) * fanAngle * 2.2;
      scale = 0.96 + Math.sin(progress * Math.PI) * 0.04;
    } else if (deploymentStyle === "staircase") {
      x = centeredIndex * 46 * distance;
      y = -(index + 1) * 29 * distance;
      rotation = centeredIndex * (fanAngle / 4);
      scale = 0.97 + index * 0.008;
    } else if (deploymentStyle === "burst") {
      const burstX = [-62, -32, 0, 32, 62];
      const burstY = [-54, -84, -104, -84, -54];
      const burstRotation = [-12, -6, 0, 6, 12];
      const slot = index % burstX.length;
      x = burstX[slot] * distance;
      y = burstY[slot] * distance;
      rotation = burstRotation[slot] * (fanAngle / 6);
      scale = slot === 2 ? 1 : 0.97;
    } else if (deploymentStyle === "deck_split") {
      const level = Math.floor(index / 2) + 1;
      const side = index % 2 === 0 ? -1 : 1;
      x = side * (34 + level * 20) * distance;
      y = -(32 + level * 31) * distance;
      rotation = side * (fanAngle / 2 + level * fanAngle * 0.12);
      scale = 1 - level * 0.012;
    }
    if (count === 1 && rotation === 0) rotation = fanAngle * 0.18;

    return { x, y, rotation, scale };
  });
}

function applyAxisAndDirection(
  transforms: CardTransform[],
  options: FolderGeometryOptions,
): CardTransform[] {
  const oriented = transforms.map((transform) =>
    options.orientation === "horizontal"
      ? { ...transform, x: -transform.y, y: transform.x }
      : { ...transform },
  );
  if (oriented.length === 0) return oriented;

  const xs = oriented.map(({ x }) => x);
  const minimum = Math.min(...xs);
  const maximum = Math.max(...xs);
  const padding = 12 * options.layoutScale;
  const offset =
    options.fanDirection === "left"
      ? -padding - maximum
      : options.fanDirection === "right"
        ? padding - minimum
        : -(minimum + maximum) / 2;
  const lean =
    options.fanDirection === "symmetrical"
      ? 0
      : (options.fanDirection === "left" ? -1 : 1) * options.fanAngle * 0.15;

  return oriented.map((transform) => ({
    ...transform,
    x: transform.x + offset,
    rotation: transform.rotation + lean,
  }));
}

export function getExpandedTransforms(
  count: number,
  options: FolderGeometryOptions,
): CardTransform[] {
  if (count <= 0) return [];
  if (options.deploymentStyle === "fan") return fanTransforms(count, options);
  return applyAxisAndDirection(specialStackTransforms(count, options), options);
}

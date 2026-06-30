import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StyleFolder from "./StyleFolder";
import { STYLES_DATA } from "../data/stylesData";
import type { SpringSettings } from "../types";

const springSettings: SpringSettings = { stiffness: 185, damping: 14, mass: 1.0 };

const baseProps = {
  orientation: "vertical" as const,
  springSettings,
  spacingMultiplier: 1.0,
  visibleCardsCount: 3,
  fanDirection: "symmetrical" as const,
  fanAngle: 6,
  coverTilt: -12,
  deploymentStyle: "fan" as const,
  staggerDelay: 0.03,
  clickBehavior: "pulse" as const,
  transitionCurve: "spring" as const,
  folderShape: "vertical" as const,
  cardStyle: "folder" as const,
};

describe("StyleFolder", () => {
  it("renders the folder title and cover image", () => {
    const folder = STYLES_DATA[0];
    render(<StyleFolder folder={folder} {...baseProps} />);

    expect(screen.getByText(folder.title)).toBeInTheDocument();
    expect(screen.getByAltText(folder.title)).toBeInTheDocument();
  });

  it("renders one card image per visible file", () => {
    const folder = STYLES_DATA[0];
    const visible = folder.files.slice(0, baseProps.visibleCardsCount);
    render(<StyleFolder folder={folder} {...baseProps} />);

    for (const file of visible) {
      expect(screen.getByAltText(file.name)).toBeInTheDocument();
    }
  });

  it("does not render files beyond visibleCardsCount", () => {
    const folder = STYLES_DATA[0];
    render(<StyleFolder folder={folder} {...baseProps} />);

    const hidden = folder.files.slice(baseProps.visibleCardsCount);
    for (const file of hidden) {
      expect(screen.queryByAltText(file.name)).not.toBeInTheDocument();
    }
  });
});

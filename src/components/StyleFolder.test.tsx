import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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
    const cover = screen.getByAltText(folder.title);
    expect(cover).toBeInTheDocument();
    expect(cover).toHaveAttribute("width", "800");
    expect(cover).toHaveAttribute("height", "1000");
    expect(cover).toHaveAttribute("srcset");
    expect(screen.getByRole("button", { name: new RegExp(folder.title, "i") })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: new RegExp(folder.title, "i") })).toHaveAttribute(
      "data-deployment",
      "fan",
    );
    expect(screen.getByRole("button", { name: new RegExp(folder.title, "i") })).toHaveAttribute(
      "data-animation-engine",
      "gsap",
    );
    expect(screen.getByText(folder.title)).toHaveAttribute("title", folder.title);
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

  it("keeps hover, focus, and toggle-lock state accessible", () => {
    const folder = STYLES_DATA[0];
    const { rerender } = render(
      <StyleFolder folder={folder} {...baseProps} clickBehavior="toggle" />,
    );
    const button = screen.getByRole("button", { name: new RegExp(folder.title, "i") });

    fireEvent.pointerEnter(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    fireEvent.pointerLeave(button);
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.focus(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    fireEvent.blur(button);
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("PINNED")).toBeInTheDocument();

    rerender(<StyleFolder folder={folder} {...baseProps} clickBehavior="pulse" />);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("PINNED")).not.toBeInTheDocument();
  });

  it("renders a deterministic image-free neutral tone variant", () => {
    const folder = STYLES_DATA[0];
    const { container } = render(
      <StyleFolder
        folder={folder}
        {...baseProps}
        visualSource="tone"
        tabFill="color"
        tabColor="#22c55e"
        textureEnabled
      />,
    );

    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(screen.getByRole("button", { name: new RegExp(folder.title, "i") })).toHaveAttribute(
      "data-visual-source",
      "tone",
    );
    expect(screen.getByRole("button", { name: new RegExp(folder.title, "i") })).toHaveAttribute(
      "data-texture-enabled",
      "true",
    );
    expect(screen.getAllByRole("img")).toHaveLength(4);
  });

  it("replaces every failed remote image with an inspectable neutral fallback", () => {
    const folder = STYLES_DATA[0];
    const { container } = render(<StyleFolder folder={folder} {...baseProps} />);
    const remoteImages = [...container.querySelectorAll("img")];

    expect(remoteImages).toHaveLength(baseProps.visibleCardsCount + 2);
    remoteImages.forEach((image) => fireEvent.error(image));

    expect(container.querySelectorAll("img")).toHaveLength(0);
    const fallbacks = container.querySelectorAll('[data-image-fallback="true"]');
    expect(fallbacks).toHaveLength(remoteImages.length);
    fallbacks.forEach((fallback) => {
      expect(fallback).toHaveAttribute("data-image-state", "fallback");
      expect(fallback).toHaveStyle({ backgroundColor: expect.stringMatching(/^hsl\(/) });
    });
    expect(screen.getByRole("img", { name: folder.title })).toHaveAttribute(
      "data-image-state",
      "fallback",
    );
  });

  it.each(["gsap", "motion", "animejs", "css", "waapi"] as const)(
    "initializes the %s engine and preserves folder interaction state",
    (animationEngine) => {
      const folder = STYLES_DATA[0];
      render(
        <StyleFolder
          folder={folder}
          {...baseProps}
          animationEngine={animationEngine}
          clickBehavior="toggle"
        />,
      );
      const button = screen.getByRole("button", { name: new RegExp(folder.title, "i") });

      expect(button).toHaveAttribute("data-animation-engine", animationEngine);
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
    },
  );

  it("uses CSS transitions and keyframe feedback in the CSS engine", () => {
    const folder = STYLES_DATA[0];
    const { container } = render(
      <StyleFolder folder={folder} {...baseProps} animationEngine="css" />,
    );
    const button = screen.getByRole("button", { name: new RegExp(folder.title, "i") });

    fireEvent.pointerEnter(button);
    expect(container.querySelector(".file-card")).toHaveStyle({
      transitionProperty: "transform",
    });

    fireEvent.click(button);
    expect(button).toHaveClass("is-css-pulsing");
  });

  it("uses Element.animate when the WAAPI engine is available", () => {
    const animation = {
      cancel: vi.fn(),
      commitStyles: vi.fn(),
      onfinish: null,
    } as unknown as Animation;
    const animate = vi.fn(
      (_keyframes: Keyframe[] | PropertyIndexedKeyframes, _options?: KeyframeAnimationOptions) =>
        animation,
    );
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: animate,
    });

    try {
      const folder = STYLES_DATA[0];
      render(<StyleFolder folder={folder} {...baseProps} animationEngine="waapi" />);
      const button = screen.getByRole("button", { name: new RegExp(folder.title, "i") });

      fireEvent.pointerEnter(button);
      expect(animate).toHaveBeenCalled();
      expect(animate.mock.calls.some((call) => call[1]?.fill === "forwards")).toBe(true);
    } finally {
      Reflect.deleteProperty(HTMLElement.prototype, "animate");
    }
  });
});

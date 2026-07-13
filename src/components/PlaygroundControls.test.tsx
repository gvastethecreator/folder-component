import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlaygroundControls from "./PlaygroundControls";
import type { SpringSettings } from "../types";

const springSettings: SpringSettings = { stiffness: 185, damping: 14, mass: 1 };

function makeProps() {
  return {
    animationEngine: "gsap" as const,
    setAnimationEngine: vi.fn(),
    orientation: "vertical" as const,
    setOrientation: vi.fn(),
    springSettings,
    setSpringSettings: vi.fn(),
    spacingMultiplier: 1,
    setSpacingMultiplier: vi.fn(),
    visibleCardsCount: 3,
    setVisibleCardsCount: vi.fn(),
    fanDirection: "symmetrical" as const,
    setFanDirection: vi.fn(),
    fanAngle: 6,
    setFanAngle: vi.fn(),
    coverTilt: -12,
    setCoverTilt: vi.fn(),
    staggerDelay: 0.03,
    setStaggerDelay: vi.fn(),
    clickBehavior: "pulse" as const,
    setClickBehavior: vi.fn(),
    transitionCurve: "spring" as const,
    setTransitionCurve: vi.fn(),
    folderShape: "vertical" as const,
    setFolderShape: vi.fn(),
    cardStyle: "folder" as const,
    setCardStyle: vi.fn(),
    theme: "dark" as const,
    setTheme: vi.fn(),
    textureEnabled: false,
    setTextureEnabled: vi.fn(),
    tabFill: "image" as const,
    setTabFill: vi.fn(),
    tabColor: "#737373",
    setTabColor: vi.fn(),
    visualSource: "image" as const,
    setVisualSource: vi.fn(),
    onReset: vi.fn(),
  };
}

describe("PlaygroundControls", () => {
  it("renders a compact shared-controls panel with five fixed stack identities", () => {
    render(<PlaygroundControls {...makeProps()} />);

    expect(screen.getByRole("tab", { name: /Controls/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText(/Animation order repeated every five folders/i)).toHaveTextContent(
      "01 Fan02 Depth03 Cascade04 Scatter05 Side",
    );
    for (const slider of screen.getAllByRole("slider")) {
      expect(slider).toHaveAccessibleName();
    }
  });

  it("changes a shared appearance setting", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<PlaygroundControls {...props} />);

    await user.click(screen.getByRole("button", { name: "Square" }));
    expect(props.setFolderShape).toHaveBeenCalledWith("square");
  });

  it("switches between library, CSS, and WAAPI animation engines", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    const { rerender } = render(<PlaygroundControls {...props} />);

    await user.click(screen.getByRole("button", { name: "Motion" }));
    expect(props.setAnimationEngine).toHaveBeenCalledWith("motion");

    rerender(<PlaygroundControls {...props} animationEngine="animejs" />);
    expect(screen.getByRole("button", { name: "Anime.js" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText(/native spring and stagger timing/i)).toBeInTheDocument();

    rerender(<PlaygroundControls {...props} animationEngine="css" />);
    expect(screen.getAllByText(/CSS spring is an approximation/i).length).toBeGreaterThan(0);

    rerender(<PlaygroundControls {...props} animationEngine="waapi" />);
    expect(screen.getAllByText(/WAAPI spring is an approximation/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "CSS" }));
    expect(props.setAnimationEngine).toHaveBeenCalledWith("css");

    await user.click(screen.getByRole("button", { name: "WAAPI" }));
    expect(props.setAnimationEngine).toHaveBeenCalledWith("waapi");
  });

  it("disables and explains spring physics in Tween without changing saved values", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    const { rerender } = render(<PlaygroundControls {...props} />);

    await user.click(screen.getByRole("button", { name: "Tween" }));
    expect(props.setTransitionCurve).toHaveBeenCalledWith("tween");

    rerender(<PlaygroundControls {...props} transitionCurve="tween" />);
    for (const name of ["Stiffness", "Damping", "Mass"]) {
      expect(screen.getByRole("slider", { name })).toBeDisabled();
    }
    expect(screen.getByText(/Tween uses fixed duration and easing.*disabled/i)).toBeInTheDocument();

    rerender(<PlaygroundControls {...props} transitionCurve="spring" />);
    expect(screen.getByRole("slider", { name: "Stiffness" })).not.toBeDisabled();
    expect(screen.getByRole("slider", { name: "Stiffness" })).toHaveValue("185");
  });

  it("exposes theme, tone, texture, and tab color controls", async () => {
    const user = userEvent.setup();
    const props = { ...makeProps(), tabFill: "color" as const };
    render(<PlaygroundControls {...props} />);

    await user.click(screen.getByRole("button", { name: "Light" }));
    await user.click(screen.getByRole("button", { name: "Tones" }));
    await user.click(screen.getByRole("switch", { name: /SVG noise/i }));

    expect(props.setTheme).toHaveBeenCalledWith("light");
    expect(props.setVisualSource).toHaveBeenCalledWith("tone");
    expect(props.setTextureEnabled).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/Folder tab color/i)).toHaveValue("#737373");
  });

  it("applies motion presets without changing the five-folder cycle", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<PlaygroundControls {...props} />);

    await user.click(screen.getByRole("button", { name: "Cinematic" }));
    expect(props.setSpringSettings).toHaveBeenCalledWith({
      stiffness: 115,
      damping: 18,
      mass: 1.25,
    });
    expect(props.setSpacingMultiplier).toHaveBeenCalledWith(1.12);
    expect(props.setTransitionCurve).toHaveBeenCalledWith("spring");
  });

  it("renders the deployment map from the shared five-folder cycle", () => {
    render(<PlaygroundControls {...makeProps()} />);

    expect(screen.getByLabelText(/Animation order repeated every five folders/i)).toHaveTextContent(
      "01 Fan02 Depth03 Cascade04 Scatter05 Side",
    );
  });

  it("coalesces range updates to one shared-state change per animation frame", () => {
    const callbacks: FrameRequestCallback[] = [];
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    const cancelFrame = vi.fn();
    vi.stubGlobal("requestAnimationFrame", requestFrame);
    vi.stubGlobal("cancelAnimationFrame", cancelFrame);

    try {
      const props = makeProps();
      render(<PlaygroundControls {...props} />);
      const spacing = screen.getByRole("slider", { name: "Spacing" });

      fireEvent.change(spacing, { target: { value: "0.8" } });
      fireEvent.change(spacing, { target: { value: "0.9" } });

      expect(requestFrame).toHaveBeenCalledTimes(1);
      expect(props.setSpacingMultiplier).not.toHaveBeenCalled();

      act(() => callbacks[0](16));
      expect(props.setSpacingMultiplier).toHaveBeenCalledOnce();
      expect(props.setSpacingMultiplier).toHaveBeenCalledWith(0.9);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("resets all shared settings", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<PlaygroundControls {...props} />);

    await user.click(screen.getByRole("button", { name: /Reset settings/i }));
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });

  it("cancels a pending range update when settings reset", async () => {
    const callbacks: FrameRequestCallback[] = [];
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    const cancelFrame = vi.fn();
    vi.stubGlobal("requestAnimationFrame", requestFrame);
    vi.stubGlobal("cancelAnimationFrame", cancelFrame);

    try {
      const user = userEvent.setup();
      const props = makeProps();
      render(<PlaygroundControls {...props} />);
      fireEvent.change(screen.getByRole("slider", { name: "Spacing" }), {
        target: { value: "0.8" },
      });
      await user.click(screen.getByRole("button", { name: /Reset settings/i }));

      expect(cancelFrame).toHaveBeenCalledWith(1);
      expect(props.setSpacingMultiplier).not.toHaveBeenCalled();
      expect(props.onReset).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("shows the reusable five-stack code example", async () => {
    const user = userEvent.setup();
    render(<PlaygroundControls {...makeProps()} />);

    await user.click(screen.getByRole("tab", { name: /Code/i }));
    expect(screen.getByText(/Five-stack usage/i)).toBeInTheDocument();
    expect(screen.getByText(/horizontal_stack/, { selector: "code" })).toBeInTheDocument();
  });

  it("supports the standard keyboard pattern for its tabs", () => {
    render(<PlaygroundControls {...makeProps()} />);
    const controlsTab = screen.getByRole("tab", { name: "Controls" });

    controlsTab.focus();
    fireEvent.keyDown(controlsTab, { key: "ArrowRight" });

    const codeTab = screen.getByRole("tab", { name: "Code" });
    expect(codeTab).toHaveFocus();
    expect(codeTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "code-tab");

    fireEvent.keyDown(codeTab, { key: "Home" });
    expect(controlsTab).toHaveFocus();
    expect(controlsTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "controls-tab");
  });
});

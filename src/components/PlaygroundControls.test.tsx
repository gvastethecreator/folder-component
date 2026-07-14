import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlaygroundControls from "./PlaygroundControls";
import type { SpringSettings } from "../types";

const springSettings: SpringSettings = { stiffness: 185, damping: 14, mass: 1 };

function makeProps() {
  return {
    animationEngine: "gsap" as const,
    setAnimationEngine: vi.fn(),
    activePresetId: "balanced" as const,
    deploymentMode: "random" as const,
    setDeploymentMode: vi.fn(),
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
    gridItemSize: 128,
    setGridItemSize: vi.fn(),
    theme: "dark" as const,
    setTheme: vi.fn(),
    textureEnabled: false,
    setTextureEnabled: vi.fn(),
    noiseOpacity: 1,
    setNoiseOpacity: vi.fn(),
    noiseScale: 180,
    setNoiseScale: vi.fn(),
    tabFill: "image" as const,
    setTabFill: vi.fn(),
    tabColor: "#737373",
    setTabColor: vi.fn(),
    tabWidth: 50,
    setTabWidth: vi.fn(),
    tabHeight: 12,
    setTabHeight: vi.fn(),
    tabAlignment: "left" as const,
    setTabAlignment: vi.fn(),
    labelVisible: true,
    setLabelVisible: vi.fn(),
    labelOpacity: 0.9,
    setLabelOpacity: vi.fn(),
    labelBackdropBlur: 8,
    setLabelBackdropBlur: vi.fn(),
    folderBorderWidth: 0,
    setFolderBorderWidth: vi.fn(),
    folderBorderOpacity: 0.72,
    setFolderBorderOpacity: vi.fn(),
    cardShadowBlur: 18,
    setCardShadowBlur: vi.fn(),
    cardShadowOpacity: 0.22,
    setCardShadowOpacity: vi.fn(),
    folderRadius: 12,
    setFolderRadius: vi.fn(),
    paletteId: "graphite" as const,
    setPaletteId: vi.fn(),
    visualSource: "image" as const,
    setVisualSource: vi.fn(),
    onReset: vi.fn(),
    onApplyPreset: vi.fn(),
  };
}

async function openControlSection(user: ReturnType<typeof userEvent.setup>, title: string) {
  const titleElement = screen.getByText(title, { selector: ".control-section-title" });
  const details = titleElement.closest("details") as HTMLDetailsElement;
  if (!details.open) await user.click(titleElement.closest("summary") as HTMLElement);
  expect(details.open).toBe(true);
}

describe("PlaygroundControls", () => {
  it("renders a compact panel with random plus nine graphical layout controls", () => {
    render(<PlaygroundControls {...makeProps()} />);

    expect(screen.getByRole("tab", { name: /Controls/i })).toHaveAttribute("aria-selected", "true");
    const layoutGroup = screen.getByRole("group", { name: "Expansion layout" });
    expect(within(layoutGroup).getAllByRole("button")).toHaveLength(10);
    expect(within(layoutGroup).getByRole("button", { name: "Random" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(layoutGroup.querySelectorAll(".deployment-preview")).toHaveLength(10);
    for (const slider of screen.getAllByRole("slider")) {
      expect(slider).toHaveAccessibleName();
    }
  });

  it("groups controls by intent and preserves disclosure state across live updates", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    const { rerender } = render(<PlaygroundControls {...props} />);

    expect(
      screen.getAllByText(
        /Grid & expansion|Animation & interaction|Folder design|Surface & label/,
        {
          selector: ".control-section-title",
        },
      ),
    ).toHaveLength(4);
    expect(document.querySelectorAll(".control-section[open]")).toHaveLength(1);

    await openControlSection(user, "Folder design");
    rerender(<PlaygroundControls {...props} gridItemSize={160} />);
    expect(
      screen.getByText("Folder design", { selector: ".control-section-title" }).closest("details"),
    ).toHaveAttribute("open");
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
    await openControlSection(user, "Animation & interaction");

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
    await openControlSection(user, "Animation & interaction");

    await user.click(screen.getByRole("button", { name: "Tween" }));
    expect(props.setTransitionCurve).toHaveBeenCalledWith("tween");

    rerender(<PlaygroundControls {...props} transitionCurve="tween" />);
    for (const name of ["Stiffness", "Damping", "Mass"]) {
      expect(screen.getByRole("slider", { name })).toBeDisabled();
    }
    expect(screen.getByText(/Tween uses a tuned timing profile.*disabled/i)).toBeInTheDocument();

    rerender(<PlaygroundControls {...props} transitionCurve="spring" />);
    expect(screen.getByRole("slider", { name: "Stiffness" })).not.toBeDisabled();
    expect(screen.getByRole("slider", { name: "Stiffness" })).toHaveValue("185");
  });

  it("exposes theme, tone, texture, and tab color controls", async () => {
    const user = userEvent.setup();
    const props = { ...makeProps(), tabFill: "color" as const };
    render(<PlaygroundControls {...props} />);
    await openControlSection(user, "Folder design");
    await openControlSection(user, "Surface & label");

    await user.click(screen.getByRole("button", { name: "Light" }));
    await user.click(screen.getByRole("button", { name: "Tones" }));
    await user.click(screen.getByRole("switch", { name: /SVG noise/i }));

    expect(props.setTheme).toHaveBeenCalledWith("light");
    expect(props.setVisualSource).toHaveBeenCalledWith("tone");
    expect(props.setTextureEnabled).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/Folder tab color/i)).toHaveValue("#737373");
  });

  it("applies complete design and behavior presets from the top dropdown", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    const { rerender } = render(<PlaygroundControls {...props} />);

    await user.selectOptions(screen.getByLabelText("Design & behavior preset"), "kinetic");
    expect(props.onApplyPreset).toHaveBeenCalledWith("kinetic");
    rerender(<PlaygroundControls {...props} activePresetId="kinetic" />);
    expect(screen.getByText(/Anime\.js elastic energy/i)).toBeInTheDocument();
  });

  it("marks manual settings as custom instead of claiming a stale preset", () => {
    render(<PlaygroundControls {...makeProps()} activePresetId="custom" />);

    expect(screen.getByLabelText("Design & behavior preset")).toHaveValue("custom");
    expect(screen.getByText(/Manual settings differ/i)).toBeInTheDocument();
  });

  it("renders miniature stack replicas for every deployment", () => {
    render(<PlaygroundControls {...makeProps()} />);

    const layoutGroup = screen.getByRole("group", { name: "Expansion layout" });
    expect(layoutGroup.querySelector('[data-layout="random"]')).toBeInTheDocument();
    expect(layoutGroup.querySelector('[data-layout="deck_split"]')).toBeInTheDocument();
  });

  it("selects a global expansion layout and a palette beside the color picker", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<PlaygroundControls {...props} />);
    await openControlSection(user, "Folder design");

    await user.click(screen.getByRole("button", { name: "Orbit" }));
    expect(props.setDeploymentMode).toHaveBeenCalledWith("orbit");

    await user.click(screen.getByRole("button", { name: "Ocean" }));
    expect(props.setPaletteId).toHaveBeenCalledWith("ocean");
    expect(props.setTabFill).toHaveBeenCalledWith("color");
    expect(props.setTabColor).toHaveBeenCalledWith("#22d3ee");
  });

  it("exposes tab, label, border, noise, and grid sizing controls", async () => {
    const user = userEvent.setup();
    const props = { ...makeProps(), textureEnabled: true };
    render(<PlaygroundControls {...props} />);
    await openControlSection(user, "Folder design");
    await openControlSection(user, "Surface & label");

    await user.click(
      within(screen.getByRole("group", { name: "Tab alignment" })).getByRole("button", {
        name: "Right",
      }),
    );
    await user.click(screen.getByRole("switch", { name: /Text container/i }));

    expect(props.setTabAlignment).toHaveBeenCalledWith("right");
    expect(props.setLabelVisible).toHaveBeenCalledTimes(1);
    for (const name of [
      "Grid density",
      "Tab width",
      "Tab height",
      "Label opacity",
      "Backdrop blur",
      "Border size",
      "Border opacity",
      "Corner radius",
      "Noise intensity",
      "Noise scale",
    ]) {
      expect(screen.getByRole("slider", { name })).toBeInTheDocument();
    }
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

  it("shows a live standalone component without project-local imports", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    const { rerender } = render(<PlaygroundControls {...props} />);

    await user.click(screen.getByRole("tab", { name: /Code/i }));
    expect(screen.getByText(/Standalone component/i)).toBeInTheDocument();
    const output = screen.getByLabelText("Generated standalone code");
    expect(output).toHaveTextContent("export default function FolderGridDemo");
    expect(output).toHaveTextContent('"animationEngine": "gsap"');
    expect(output).not.toHaveTextContent('from "./');

    rerender(<PlaygroundControls {...props} animationEngine="waapi" folderRadius={20} />);
    expect(output).toHaveTextContent('"animationEngine": "waapi"');
    expect(output).toHaveTextContent('"folderRadius": 20');
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

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlaygroundControls from "./PlaygroundControls";
import type { SpringSettings } from "../types";

const springSettings: SpringSettings = { stiffness: 185, damping: 14, mass: 1.0 };

function makeProps() {
  return {
    orientation: "vertical" as const,
    setOrientation: vi.fn(),
    springSettings,
    setSpringSettings: vi.fn(),
    spacingMultiplier: 1.0,
    setSpacingMultiplier: vi.fn(),
    visibleCardsCount: 3,
    setVisibleCardsCount: vi.fn(),
    fanDirection: "symmetrical" as const,
    setFanDirection: vi.fn(),
    fanAngle: 6,
    setFanAngle: vi.fn(),
    coverTilt: -12,
    setCoverTilt: vi.fn(),
    deploymentStyle: "fan" as const,
    setDeploymentStyle: vi.fn(),
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
    onReset: vi.fn(),
  };
}

describe("PlaygroundControls", () => {
  it("renders the animation controls tab by default", () => {
    render(<PlaygroundControls {...makeProps()} />);
    expect(screen.getByText(/Tipo de Despliegue/i)).toBeInTheDocument();
  });

  it("switches deployment style on click", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<PlaygroundControls {...props} />);

    await user.click(screen.getByRole("button", { name: /Perspectiva 3D/i }));
    expect(props.setDeploymentStyle).toHaveBeenCalledWith("skew3d");
  });

  it("applies a behavior preset on click", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<PlaygroundControls {...props} />);

    await user.click(screen.getByRole("button", { name: /Staircase Cascade/i }));
    expect(props.setDeploymentStyle).toHaveBeenCalledWith("cascade");
    expect(props.setTransitionCurve).toHaveBeenCalledWith("spring");
  });

  it("invokes onReset when restoring defaults", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<PlaygroundControls {...props} />);

    await user.click(screen.getByRole("button", { name: /Restaurar Valores/i }));
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });

  it("shows the reusable code snippet on the code tab", async () => {
    const user = userEvent.setup();
    render(<PlaygroundControls {...makeProps()} />);

    await user.click(screen.getByRole("button", { name: /Código Reusable/i }));
    expect(screen.getByText(/StyleFolder Component Usage/i)).toBeInTheDocument();
  });
});

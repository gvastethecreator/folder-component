import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { ENGINE_CATALOG_LIST, buildPlaygroundSnippet } from "./animation/engineCatalog";
import { STYLES_DATA } from "./data/stylesData";
import {
  createDefaultPlaygroundConfig,
  DEFAULT_PLAYGROUND_CONFIG,
  playgroundConfigReducer,
} from "./types";

describe("App", () => {
  it("mounts without crashing and renders the controls panel", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Playground" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Controls" })).toHaveAttribute("aria-selected", "true");
  });

  it("renders every style folder from the data", () => {
    render(<App />);

    for (const folder of STYLES_DATA) {
      expect(screen.getByText(folder.title)).toBeInTheDocument();
    }
  });

  it("renders four five-folder cycles with a stable stack order", () => {
    render(<App />);

    expect(document.querySelectorAll('[id^="folder-container-"]')).toHaveLength(20);
    expect(document.querySelector("#folder-container-cyberpunk")).toHaveAttribute(
      "data-deployment",
      "fan",
    );
    expect(document.querySelector("#folder-container-anime-ghibli")).toHaveAttribute(
      "data-deployment",
      "skew3d",
    );
    expect(document.querySelector("#folder-container-impressionism")).toHaveAttribute(
      "data-deployment",
      "cascade",
    );
    expect(document.querySelector("#folder-container-minimal-geometric")).toHaveAttribute(
      "data-deployment",
      "scatter",
    );
    expect(document.querySelector("#folder-container-cinematic-noir")).toHaveAttribute(
      "data-deployment",
      "horizontal_stack",
    );
  });

  it("switches the complete application chrome to light mode", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Light" }));
    expect(document.querySelector("[data-theme]")).toHaveAttribute("data-theme", "light");
  });

  it("switches every folder between all five animation engines", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Motion" }));
    expect(document.querySelectorAll('[data-animation-engine="motion"]')).toHaveLength(20);

    await user.click(screen.getByRole("button", { name: "Anime.js" }));
    expect(document.querySelectorAll('[data-animation-engine="animejs"]')).toHaveLength(20);

    await user.click(screen.getByRole("button", { name: "CSS" }));
    expect(document.querySelectorAll('[data-animation-engine="css"]')).toHaveLength(20);

    await user.click(screen.getByRole("button", { name: "WAAPI" }));
    expect(document.querySelectorAll('[data-animation-engine="waapi"]')).toHaveLength(20);

    await user.click(screen.getByRole("button", { name: "GSAP" }));
    expect(document.querySelectorAll('[data-animation-engine="gsap"]')).toHaveLength(20);
  });

  it("maps all five engine labels, statuses, and descriptions from one catalog", async () => {
    const user = userEvent.setup();
    render(<App />);

    for (const engine of ENGINE_CATALOG_LIST) {
      await user.click(screen.getByRole("button", { name: engine.label }));
      expect(screen.getAllByText(engine.statusLabel).length).toBeGreaterThan(0);
      expect(screen.getAllByText(engine.description).length).toBeGreaterThan(0);
    }
  });

  it("keeps reset and generated code on the exported config contract", () => {
    const changed = {
      ...createDefaultPlaygroundConfig(),
      animationEngine: "waapi" as const,
      transitionCurve: "tween" as const,
      springSettings: { stiffness: 320, damping: 20, mass: 0.7 },
    };
    expect(playgroundConfigReducer(changed, { type: "reset" })).toEqual(DEFAULT_PLAYGROUND_CONFIG);

    const snippet = buildPlaygroundSnippet(changed);
    expect(snippet).toContain('const animationEngine = "waapi"');
    expect(snippet).toContain("const sharedConfig = {");
    expect(snippet).toContain("const stackDeployments =");
    expect(snippet).not.toContain("folders.map");
    expect(snippet).not.toContain("sharedSettings");
  });

  it("disables Tween physics in the live app and restores saved Spring values", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Tween" }));
    expect(screen.getByRole("slider", { name: "Stiffness" })).toBeDisabled();
    expect(screen.getByText(/Tween uses fixed duration and easing/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Spring" }));
    expect(screen.getByRole("slider", { name: "Stiffness" })).not.toBeDisabled();
    expect(screen.getByRole("slider", { name: "Stiffness" })).toHaveValue("185");
  });

  it("clears pinned folders when shared settings are reset", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Lock" }));
    const folder = screen.getAllByRole("button", { name: /^Cyberpunk & Neon\./ })[0];
    await user.click(folder);
    expect(screen.getByText("PINNED")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset settings" }));
    expect(folder).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("PINNED")).not.toBeInTheDocument();
  });
});

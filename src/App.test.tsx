import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { build as viteBuild, transformWithOxc } from "vite";
import App from "./App";
import { ENGINE_CATALOG_LIST, buildPlaygroundSnippet } from "./animation/engineCatalog";
import { STYLES_DATA } from "./data/stylesData";
import { DESIGN_PRESETS, getMatchingDesignPreset } from "./config/playgroundCatalog";
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

  it("renders twenty unique folders with a stable random layout mix", () => {
    render(<App />);

    const folders = [...document.querySelectorAll<HTMLElement>('[id^="folder-container-"]')];
    expect(folders).toHaveLength(20);
    expect(folders.map((folder) => folder.dataset.deployment)).toEqual([
      "skew3d",
      "burst",
      "deck_split",
      "horizontal_stack",
      "skew3d",
      "fan",
      "deck_split",
      "burst",
      "skew3d",
      "horizontal_stack",
      "scatter",
      "burst",
      "cascade",
      "scatter",
      "horizontal_stack",
      "staircase",
      "skew3d",
      "fan",
      "deck_split",
      "burst",
    ]);
    expect(new Set(folders.map((folder) => folder.dataset.coverImage)).size).toBe(20);
  });

  it("switches the complete application chrome to light mode", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Light" }));
    expect(document.querySelector("[data-theme]")).toHaveAttribute("data-theme", "light");
  });

  it("switches every folder between all five animation engines", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Motion" }));
    expect(document.querySelectorAll('[data-animation-engine="motion"]')).toHaveLength(20);

    fireEvent.click(screen.getByRole("button", { name: "Anime.js" }));
    expect(document.querySelectorAll('[data-animation-engine="animejs"]')).toHaveLength(20);

    fireEvent.click(screen.getByRole("button", { name: "CSS" }));
    expect(document.querySelectorAll('[data-animation-engine="css"]')).toHaveLength(20);

    fireEvent.click(screen.getByRole("button", { name: "WAAPI" }));
    expect(document.querySelectorAll('[data-animation-engine="waapi"]')).toHaveLength(20);

    fireEvent.click(screen.getByRole("button", { name: "GSAP" }));
    expect(document.querySelectorAll('[data-animation-engine="gsap"]')).toHaveLength(20);
  }, 10_000);

  it("maps all five engine labels, statuses, and descriptions from one catalog", () => {
    render(<App />);

    for (const engine of ENGINE_CATALOG_LIST) {
      fireEvent.click(screen.getByRole("button", { name: engine.label }));
      expect(screen.getAllByText(engine.statusLabel).length).toBeGreaterThan(0);
      expect(screen.getAllByText(engine.description).length).toBeGreaterThan(0);
    }
  });

  it("keeps reset and generated code on the exported config contract", async () => {
    const changed = {
      ...createDefaultPlaygroundConfig(),
      animationEngine: "waapi" as const,
      transitionCurve: "tween" as const,
      springSettings: { stiffness: 320, damping: 20, mass: 0.7 },
    };
    expect(playgroundConfigReducer(changed, { type: "reset" })).toEqual(DEFAULT_PLAYGROUND_CONFIG);

    const snippet = buildPlaygroundSnippet(changed);
    expect(snippet).toContain('"animationEngine": "waapi"');
    expect(snippet).toContain('"transitionCurve": "tween"');
    expect(snippet).toContain('"folderBorderOpacity": 0.72');
    expect(snippet).toContain('"folderBorderWidth": 0');
    expect(snippet).toContain('"cardShadowBlur": 18');
    expect(snippet).toContain('"cardShadowOpacity": 0.22');
    expect(snippet).toContain("export default function FolderGridDemo");
    expect(snippet).toContain("element.animate(");
    expect(snippet).not.toMatch(/from ["']\.\//);
    expect(snippet).not.toContain("STYLES_DATA");
    expect(snippet).not.toContain("StyleFolder");
    await expect(
      transformWithOxc(snippet, "standalone-folder.jsx", { lang: "jsx" }),
    ).resolves.toBeDefined();
  });

  it("generates a parseable single-file adapter for every animation engine", async () => {
    const virtualEntries = new Map<string, string>();

    for (const engine of ENGINE_CATALOG_LIST) {
      const snippet = buildPlaygroundSnippet({
        ...createDefaultPlaygroundConfig(),
        animationEngine: engine.id,
      });
      virtualEntries.set(`virtual:standalone-${engine.id}.jsx`, snippet);
      expect(snippet).not.toMatch(/from ["']\.\//);
      expect(snippet).toContain(`"animationEngine": "${engine.id}"`);
      await expect(
        transformWithOxc(snippet, `standalone-${engine.id}.jsx`, { lang: "jsx" }),
      ).resolves.toBeDefined();
    }

    await expect(
      viteBuild({
        configFile: false,
        logLevel: "silent",
        plugins: [
          {
            name: "standalone-code-verification",
            resolveId(id) {
              return virtualEntries.has(id) ? `\0${id}` : undefined;
            },
            load(id) {
              return id.startsWith("\0") ? virtualEntries.get(id.slice(1)) : undefined;
            },
          },
        ],
        build: {
          write: false,
          minify: false,
          rollupOptions: {
            input: Object.fromEntries(
              [...virtualEntries.keys()].map((id) => [id.replace(/\W+/g, "-"), id]),
            ),
          },
        },
      }),
    ).resolves.toBeDefined();
  });

  it("marks any manual deviation from a complete preset as custom", () => {
    const kinetic = DESIGN_PRESETS.kinetic.config;
    expect(getMatchingDesignPreset(kinetic)).toBe("kinetic");
    expect(getMatchingDesignPreset({ ...kinetic, fanAngle: kinetic.fanAngle + 1 })).toBe("custom");
    expect(
      getMatchingDesignPreset({ ...kinetic, visibleCardsCount: kinetic.visibleCardsCount + 1 }),
    ).toBe("custom");
  });

  it("disables Tween physics in the live app and restores saved Spring values", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Tween" }));
    expect(screen.getByRole("slider", { name: "Stiffness" })).toBeDisabled();
    expect(screen.getByText(/Tween uses a tuned timing profile/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Spring" }));
    expect(screen.getByRole("slider", { name: "Stiffness" })).not.toBeDisabled();
    expect(screen.getByRole("slider", { name: "Stiffness" })).toHaveValue("185");
  });

  it("clears pinned folders when shared settings are reset", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Lock" }));
    const folder = screen.getByRole("button", { name: /^Neon Rain District\./ });
    await user.click(folder);
    expect(screen.getByText("PINNED")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset settings" }));
    expect(folder).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("PINNED")).not.toBeInTheDocument();
  });

  it("applies presets and global deployment overrides to every folder", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Design & behavior preset"), "kinetic");
    expect(document.querySelectorAll('[data-animation-engine="animejs"]')).toHaveLength(20);
    expect(document.querySelectorAll('[data-deployment="burst"]')).toHaveLength(20);
    expect(document.querySelectorAll('[data-palette="orchid"]')).toHaveLength(20);

    await user.click(screen.getByRole("button", { name: "Orbit" }));
    expect(document.querySelectorAll('[data-deployment="orbit"]')).toHaveLength(20);
    expect(screen.getByLabelText("Design & behavior preset")).toHaveValue("custom");
  });
});

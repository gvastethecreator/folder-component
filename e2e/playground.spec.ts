import { expect, test, type Page } from "@playwright/test";

const engines = [
  ["GSAP", "gsap"],
  ["Motion", "motion"],
  ["Anime.js", "animejs"],
  ["CSS", "css"],
  ["WAAPI", "waapi"],
] as const;

const folderSelector = '[role="button"][data-animation-engine]';
const localBaseURL = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? 4191}`;

async function openPlayground(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Folder Motion Lab" })).toBeVisible();
  await expect(page.locator(folderSelector).first()).toBeVisible();
}

function columnCount(page: Page) {
  return page.locator(folderSelector).evaluateAll((nodes) => {
    const boxes = nodes
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { x: Math.round(rect.x), y: Math.round(rect.y) };
      })
      .filter(({ x, y }) => Number.isFinite(x) && Number.isFinite(y));
    const firstRow = Math.min(...boxes.map(({ y }) => y));
    return new Set(boxes.filter(({ y }) => y <= firstRow + 8).map(({ x }) => x)).size;
  });
}

async function setRange(page: Page, name: string, value: number) {
  await page.getByRole("slider", { name }).evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    valueSetter?.call(input, String(nextValue));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

test.describe("animation engines and interaction", () => {
  test("switches all five engine labels and folder markers", async ({ page }) => {
    await openPlayground(page);
    const engineGroup = page.getByRole("group", { name: "Engine" });
    const folders = page.locator(folderSelector);
    await expect(folders).toHaveCount(20);

    for (const [label, marker] of engines) {
      await engineGroup.getByRole("button", { name: label, exact: true }).click();
      await expect(engineGroup.getByRole("button", { name: label, exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(page.locator(`[data-animation-engine="${marker}"]`)).toHaveCount(20);

      const folder = folders.first();
      const card = folder.locator(".file-card").first();
      const collapsedTransform = await card.evaluate(
        (element) => getComputedStyle(element).transform,
      );
      await folder.hover();
      await expect
        .poll(() => card.evaluate((element) => getComputedStyle(element).transform))
        .not.toBe(collapsedTransform);
      await expect(folder).toHaveAttribute("aria-expanded", "true");
      await page.mouse.move(1, 1);
      await expect(folder).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("opens and closes a folder on pointer hover", async ({ page }) => {
    await openPlayground(page);
    const folder = page.locator(folderSelector).first();
    const adjacentFolder = page.locator(folderSelector).nth(1);
    await expect(folder).toHaveCSS("z-index", "1");
    await expect(adjacentFolder).toHaveCSS("z-index", "1");
    await expect(folder).toHaveAttribute("aria-expanded", "false");
    await folder.hover();
    await expect(folder).toHaveAttribute("aria-expanded", "true");
    await expect(folder).toHaveCSS("z-index", "50");
    await expect(adjacentFolder).toHaveCSS("z-index", "1");
    await page.screenshot({ path: "test-results/visual-proof-active-folder.png" });
    await page.mouse.move(1, 1);
    await expect(folder).toHaveAttribute("aria-expanded", "false");
    await expect(folder).toHaveCSS("z-index", "1");
  });

  test("accepts touch tap on mobile viewport", async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: localBaseURL,
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    try {
      await openPlayground(page);
      const folder = page.locator(folderSelector).first();
      await page
        .getByRole("group", { name: "Click" })
        .getByRole("button", { name: "Lock" })
        .click();
      await folder.tap();
      await expect(folder).toHaveAttribute("aria-expanded", "true");
    } finally {
      await context.close();
    }
  });

  test("clears interrupted Pulse and Flash feedback across controller changes", async ({
    page,
  }) => {
    await openPlayground(page);
    const folder = page.locator(folderSelector).first();
    const engineGroup = page.getByRole("group", { name: "Engine" });

    for (let index = 0; index < engines.length; index += 1) {
      const [label] = engines[index];
      const [nextLabel] = engines[(index + 1) % engines.length];
      await engineGroup.getByRole("button", { name: label, exact: true }).click();
      await folder.click();
      await page.waitForTimeout(40);
      await engineGroup.getByRole("button", { name: nextLabel, exact: true }).click();
      await expect
        .poll(() => folder.evaluate((element) => getComputedStyle(element).transform))
        .toBe("none");
    }

    await page.getByRole("group", { name: "Click" }).getByRole("button", { name: "Flash" }).click();
    const flash = folder.locator('.folder-front > div[aria-hidden="true"]');
    await folder.click();
    await page.waitForTimeout(40);
    await engineGroup.getByRole("button", { name: "Motion", exact: true }).click();
    await expect
      .poll(() => flash.evaluate((element) => getComputedStyle(element).opacity))
      .toBe("0");
  });
});

test.describe("playground controls", () => {
  test("keeps every cover unique and applies presets, palettes, layouts, and curves", async ({
    page,
  }) => {
    await openPlayground(page);
    const folders = page.locator(folderSelector);
    const covers = await folders.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-cover-image")),
    );
    expect(new Set(covers).size).toBe(20);

    await page.getByLabel("Design & behavior preset").selectOption("kinetic");
    await expect(page.locator('[data-animation-engine="animejs"]')).toHaveCount(20);
    await expect(page.locator('[data-deployment="burst"]')).toHaveCount(20);
    await expect(page.locator('[data-palette="orchid"]')).toHaveCount(20);

    await page
      .getByRole("group", { name: "Palette" })
      .getByRole("button", { name: "Ocean" })
      .click();
    await expect(page.locator('[data-palette="ocean"]')).toHaveCount(20);
    await page
      .getByRole("group", { name: "Expansion layout" })
      .getByRole("button", { name: "Orbit" })
      .click();
    await expect(page.locator('[data-deployment="orbit"]')).toHaveCount(20);
    await expect(page.getByLabel("Design & behavior preset")).toHaveValue("custom");

    await page
      .locator("summary")
      .filter({ hasText: /^Motion$/ })
      .click();
    await expect(
      page.getByRole("group", { name: "Curve" }).getByRole("button", { name: "Elastic" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("slider", { name: "Stiffness" })).toBeDisabled();
  });

  test("applies tab, label, border, noise, and grid density controls", async ({ page }) => {
    await openPlayground(page);
    const folders = page.locator(folderSelector);

    await page
      .getByRole("group", { name: "Tab alignment" })
      .getByRole("button", { name: "Right" })
      .click();
    await expect(page.locator('[data-tab-alignment="right"]')).toHaveCount(20);

    await setRange(page, "Tab width", 70);
    await expect(folders.first()).toHaveCSS("--folder-tab-width", "70%");

    await setRange(page, "Border size", 3);
    await expect(folders.first()).toHaveCSS("--folder-border-width", "3px");
    await setRange(page, "Label opacity", 0.4);
    await setRange(page, "Backdrop blur", 16);
    await expect(folders.first().locator(".folder-label")).toHaveCSS(
      "background-color",
      "rgba(10, 10, 10, 0.4)",
    );
    await expect(folders.first().locator(".folder-label")).toHaveCSS(
      "backdrop-filter",
      "blur(16px)",
    );
    await expect
      .poll(() =>
        folders
          .first()
          .locator(".folder-label")
          .evaluate((label) => {
            const front = label.parentElement;
            if (!front) return false;
            const labelRect = label.getBoundingClientRect();
            const frontRect = front.getBoundingClientRect();
            return (
              labelRect.left > frontRect.left &&
              labelRect.right < frontRect.right &&
              labelRect.bottom < frontRect.bottom
            );
          }),
      )
      .toBe(true);

    await page.getByRole("switch", { name: /Text container/i }).click();
    await expect(page.locator(".folder-label")).toHaveCount(0);

    await page.getByRole("switch", { name: /SVG noise/i }).click();
    await expect(page.locator(".app-shell")).toHaveAttribute("data-texture-enabled", "true");
    await setRange(page, "Noise intensity", 0.75);
    await expect(page.locator(".app-shell")).toHaveCSS("--noise-opacity", "0.75");
    await expect
      .poll(() =>
        page
          .locator(".app-shell")
          .evaluate((element) => getComputedStyle(element, "::before").opacity),
      )
      .toBe("0.75");

    await setRange(page, "Grid density", 96);
    await expect(page.locator("#folders-grid")).toHaveAttribute("data-grid-size", "96");
  });

  test("covers code tab, theme switches, and reset", async ({ page }) => {
    await openPlayground(page);
    const app = page.locator(".app-shell");

    await page
      .getByRole("group", { name: "Engine" })
      .getByRole("button", { name: "WAAPI" })
      .click();
    await page.getByRole("button", { name: "Light", exact: true }).click();
    await expect(app).toHaveAttribute("data-theme", "light");

    await page.getByRole("tab", { name: "Code" }).click();
    const codePanel = page.getByRole("tabpanel", { name: "Code" });
    await expect(codePanel).toContainText('const animationEngine = "waapi"');
    await page.getByRole("button", { name: "Copy reusable code" }).click();
    await expect(page.getByText("Copied", { exact: true })).toBeVisible();

    await page.getByRole("tab", { name: "Controls" }).click();
    await page.getByRole("button", { name: "Reset settings" }).click();
    await expect(app).toHaveAttribute("data-theme", "dark");
    await expect(page.locator('[data-animation-engine="gsap"]')).toHaveCount(20);
    await expect(
      page.getByRole("group", { name: "Engine" }).getByRole("button", { name: "GSAP" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("honors reduced-motion media preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openPlayground(page);
    const engineGroup = page.getByRole("group", { name: "Engine" });
    await engineGroup.getByRole("button", { name: "CSS", exact: true }).click();
    const folder = page.locator(folderSelector).first();
    await folder.hover();
    await expect(folder).toHaveAttribute("aria-expanded", "true");
    await expect(folder.locator(".file-card").first()).toHaveCSS("transition-duration", "0s");
  });
});

test.describe("responsive layout", () => {
  for (const width of [320, 390]) {
    test(`${width}px viewport has no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 320 ? 800 : 844 });
      await openPlayground(page);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
        .toBe(true);
      await page.screenshot({ path: `test-results/visual-proof-responsive-${width}.png` });
      const columns = await columnCount(page);
      if (width === 320) expect(columns).toBe(1);
      else expect(columns).toBeGreaterThanOrEqual(2);

      await expect(
        page
          .getByRole("group", { name: "Expansion layout" })
          .getByRole("button", { name: "Random" }),
      ).toHaveAttribute("aria-pressed", "true");
      const assignments = await page
        .locator(folderSelector)
        .evaluateAll((folders) => folders.map((folder) => folder.getAttribute("data-deployment")));
      expect(new Set(assignments).size).toBeGreaterThanOrEqual(5);

      await page
        .getByRole("group", { name: "Click" })
        .getByRole("button", { name: "Lock" })
        .click();
      const firstFolder = page.locator(folderSelector).first();
      await firstFolder.click();
      await expect(firstFolder).toHaveAttribute("aria-expanded", "true");
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
        .toBe(true);
    });
  }

  test("ultrawide viewport caps the dynamic grid at nine columns", async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1200 });
    await openPlayground(page);
    await expect.poll(() => columnCount(page)).toBe(9);
    await page.screenshot({ path: "test-results/visual-proof-ultrawide-9-columns.png" });

    await setRange(page, "Grid density", 200);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect.poll(() => columnCount(page)).toBeLessThan(9);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
  });
});

test("renders deterministic fallback when Pexels requests fail", async ({ page }) => {
  await page.route("https://images.pexels.com/**", (route) => route.abort());
  await openPlayground(page);
  const fallback = page.locator('[data-image-fallback="true"]');
  await expect.poll(() => fallback.count()).toBeGreaterThan(0);
  await expect(fallback.first()).toBeVisible();
  await expect(fallback.first()).toHaveAttribute("data-image-state", "fallback");
});

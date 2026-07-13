import { expect, test, type Page } from "@playwright/test";

const engines = [
  ["GSAP", "gsap"],
  ["Motion", "motion"],
  ["Anime.js", "animejs"],
  ["CSS", "css"],
  ["WAAPI", "waapi"],
] as const;

const folderSelector = '[role="button"][data-animation-engine]';
const localBaseURL = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? 4173}`;

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
    await expect(folder).toHaveAttribute("aria-expanded", "false");
    await folder.hover();
    await expect(folder).toHaveAttribute("aria-expanded", "true");
    await page.mouse.move(1, 1);
    await expect(folder).toHaveAttribute("aria-expanded", "false");
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
      const columns = await columnCount(page);
      if (width === 320) expect(columns).toBe(1);
      else expect(columns).toBeGreaterThanOrEqual(2);

      await expect(page.getByText("Cycles every 5 folders", { exact: true })).toBeVisible();
      await expect
        .poll(() =>
          page
            .locator(folderSelector)
            .evaluateAll((folders) =>
              folders.slice(0, 5).map((folder) => folder.getAttribute("data-deployment")),
            ),
        )
        .toEqual(["fan", "skew3d", "cascade", "scatter", "horizontal_stack"]);

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
});

test("renders deterministic fallback when Pexels requests fail", async ({ page }) => {
  await page.route("https://images.pexels.com/**", (route) => route.abort());
  await openPlayground(page);
  const fallback = page.locator('[data-image-fallback="true"]');
  await expect.poll(() => fallback.count()).toBeGreaterThan(0);
  await expect(fallback.first()).toBeVisible();
  await expect(fallback.first()).toHaveAttribute("data-image-state", "fallback");
});

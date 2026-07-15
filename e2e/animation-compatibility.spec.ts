import { expect, test, type Locator, type Page } from "@playwright/test";

const engines = ["GSAP", "Motion", "Anime.js", "CSS", "WAAPI"] as const;
const layouts = [
  ["Fan", "fan"],
  ["Depth", "skew3d"],
  ["Cascade", "cascade"],
  ["Scatter", "scatter"],
  ["Side", "horizontal_stack"],
  ["Orbit", "orbit"],
  ["Steps", "staircase"],
  ["Burst", "burst"],
  ["Split", "deck_split"],
] as const;

const folderSelector = '[role="button"][data-animation-engine]';

async function settleReactFrame(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

async function openSection(page: Page, title: string) {
  const section = page
    .locator(".control-section")
    .filter({ has: page.locator(".control-section-title", { hasText: title }) });
  if (!(await section.evaluate((element) => (element as HTMLDetailsElement).open))) {
    await section.locator("summary").click();
  }
}

async function setRange(page: Page, name: string, value: number) {
  const slider = page.getByRole("slider", { name });
  await slider.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    valueSetter?.call(input, String(nextValue));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await expect(slider).toHaveValue(String(value));
  await settleReactFrame(page);
}

async function selectSegment(page: Page, group: string, option: string) {
  const button = page
    .getByRole("group", { name: group })
    .getByRole("button", { name: option, exact: true });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await settleReactFrame(page);
}

async function transformSignature(cards: Locator) {
  return cards.evaluateAll((elements) =>
    elements.map((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return [
        Number(matrix.m41.toFixed(3)),
        Number(matrix.m42.toFixed(3)),
        Number((Math.atan2(matrix.m12, matrix.m11) * (180 / Math.PI)).toFixed(3)),
        Number(Math.hypot(matrix.m11, matrix.m12).toFixed(3)),
      ];
    }),
  );
}

test.describe("animation compatibility matrix", () => {
  test("every explicit stack responds to every shared geometry control", async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await openSection(page, "Animation & interaction");
    const expansion = page.getByRole("group", { name: "Expansion layout" });
    const folder = page.locator(folderSelector).first();
    const cards = folder.locator(".file-card");

    await selectSegment(page, "Engine", "CSS");
    await selectSegment(page, "Click", "Lock");
    await folder.click();
    await expect(folder).toHaveAttribute("aria-expanded", "true");

    const unresponsive: string[] = [];
    const invalid: string[] = [];

    for (const [label, id] of layouts) {
      await expansion.getByRole("button", { name: label, exact: true }).click();
      await expect(page.locator(`[data-deployment="${id}"]`)).toHaveCount(20);

      await selectSegment(page, "Direction", "Center");
      await setRange(page, "Fan angle", 8);
      await setRange(page, "Spacing", 1);

      await selectSegment(page, "Axis", "Vertical");
      const vertical = await transformSignature(cards);
      await selectSegment(page, "Axis", "Horizontal");
      const horizontal = await transformSignature(cards);
      if (JSON.stringify(vertical) === JSON.stringify(horizontal)) unresponsive.push(`${id}:axis`);

      await selectSegment(page, "Axis", "Vertical");
      await selectSegment(page, "Direction", "Left");
      const left = await transformSignature(cards);
      await selectSegment(page, "Direction", "Right");
      const right = await transformSignature(cards);
      if (JSON.stringify(left) === JSON.stringify(right)) unresponsive.push(`${id}:direction`);

      await selectSegment(page, "Direction", "Center");
      await setRange(page, "Fan angle", 0);
      const flat = await transformSignature(cards);
      await setRange(page, "Fan angle", 16);
      const angled = await transformSignature(cards);
      if (JSON.stringify(flat) === JSON.stringify(angled)) unresponsive.push(`${id}:fan-angle`);

      await setRange(page, "Fan angle", 8);
      await setRange(page, "Spacing", 0.55);
      const compact = await transformSignature(cards);
      await setRange(page, "Spacing", 1.45);
      const spacious = await transformSignature(cards);
      if (JSON.stringify(compact) === JSON.stringify(spacious)) unresponsive.push(`${id}:spacing`);

      for (const [index, values] of spacious.entries()) {
        if (values.some((value) => !Number.isFinite(value))) invalid.push(`${id}:card-${index}`);
      }
    }

    expect(unresponsive).toEqual([]);
    expect(invalid).toEqual([]);
    await selectSegment(page, "Axis", "Horizontal");
    await selectSegment(page, "Direction", "Right");
    await setRange(page, "Fan angle", 14);
    await setRange(page, "Spacing", 1.2);
    await page.screenshot({ path: "test-results/visual-proof-compatibility-matrix.png" });
  });

  test("all engines render the same open geometry for every stack", async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await openSection(page, "Animation & interaction");
    const expansion = page.getByRole("group", { name: "Expansion layout" });
    const folder = page.locator(folderSelector).first();
    const cards = folder.locator(".file-card");

    await selectSegment(page, "Click", "Lock");
    await folder.click();
    await selectSegment(page, "Axis", "Horizontal");
    await selectSegment(page, "Direction", "Right");
    await setRange(page, "Fan angle", 12);
    await setRange(page, "Spacing", 1.2);

    for (const [label, id] of layouts) {
      await expansion.getByRole("button", { name: label, exact: true }).click();
      await selectSegment(page, "Engine", "CSS");
      const reference = await transformSignature(cards);

      for (const engine of engines) {
        await selectSegment(page, "Engine", engine);
        await expect(folder).toHaveAttribute("aria-expanded", "true");
        expect(await transformSignature(cards), `${engine} / ${id}`).toEqual(reference);
      }
    }
  });

  test("every engine survives live geometry changes and rapid toggle interruption", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/");
    await openSection(page, "Animation & interaction");
    const expansion = page.getByRole("group", { name: "Expansion layout" });
    const folder = page.locator(folderSelector).first();
    const cards = folder.locator(".file-card");
    const cases = [
      ["GSAP", "Depth", "skew3d"],
      ["Motion", "Cascade", "cascade"],
      ["Anime.js", "Scatter", "scatter"],
      ["CSS", "Orbit", "orbit"],
      ["WAAPI", "Split", "deck_split"],
    ] as const;

    await selectSegment(page, "Curve", "Tween");
    await setRange(page, "Stagger", 0);
    await selectSegment(page, "Click", "Lock");

    for (const [engine, layout, id] of cases) {
      await selectSegment(page, "Engine", engine);
      await expansion.getByRole("button", { name: layout, exact: true }).click();
      await expect(page.locator(`[data-deployment="${id}"]`)).toHaveCount(20);
      if ((await folder.getAttribute("aria-expanded")) !== "true") await folder.click();

      await setRange(page, "Visible cards", 2);
      await expect(cards).toHaveCount(2);
      await setRange(page, "Visible cards", 5);
      await expect(cards).toHaveCount(5);
      const front = folder.locator('[id^="folder-front-"]');
      await setRange(page, "Cover depth", 0);
      await expect
        .poll(() => front.evaluate((element) => getComputedStyle(element).transform))
        .not.toBe("none");
      const flatCover = await front.evaluate((element) => getComputedStyle(element).transform);
      await setRange(page, "Cover depth", -24);
      await expect
        .poll(() => front.evaluate((element) => getComputedStyle(element).transform), {
          message: `${engine} cover depth`,
        })
        .not.toBe(flatCover);

      await selectSegment(page, "Axis", "Vertical");
      await selectSegment(page, "Direction", "Center");
      await setRange(page, "Fan angle", 4);
      await setRange(page, "Spacing", 0.8);
      const before = await transformSignature(cards);

      await selectSegment(page, "Axis", "Horizontal");
      await selectSegment(page, "Direction", "Right");
      await setRange(page, "Fan angle", 14);
      await setRange(page, "Spacing", 1.3);
      const after = await transformSignature(cards);
      expect(after, `${engine} live reconfiguration`).not.toEqual(before);
      await expect(folder).toHaveAttribute("aria-expanded", "true");

      await folder.click();
      await page.mouse.move(1, 1);
      await page.getByRole("heading", { name: "Folder Motion Lab" }).click();
      await expect(folder).toHaveAttribute("aria-expanded", "false");
      await page.waitForTimeout(40);
      await folder.click();
      await expect(folder).toHaveAttribute("aria-expanded", "true");
      await page.waitForTimeout(650);

      const settled = await transformSignature(cards);
      expect(settled.flat().every(Number.isFinite), `${engine} settled transforms`).toBe(true);
      await expect(cards.first()).toHaveCSS("will-change", "auto");
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("all engines execute every timing curve with configurable spring and stagger", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/");
    await openSection(page, "Animation & interaction");
    const folder = page.locator(folderSelector).first();
    const cards = folder.locator(".file-card");
    const curves = ["Spring", "Tween", "Bounce", "Elastic"] as const;

    await selectSegment(page, "Curve", "Spring");
    await setRange(page, "Stiffness", 360);
    await setRange(page, "Damping", 32);
    await setRange(page, "Mass", 2);

    for (const engine of engines) {
      await selectSegment(page, "Engine", engine);

      for (const curve of curves) {
        await selectSegment(page, "Curve", curve);
        await setRange(page, "Stagger", curve === "Spring" ? 0.12 : 0);
        const collapsed = await transformSignature(cards);

        await folder.hover();
        await expect(folder).toHaveAttribute("aria-expanded", "true");
        await expect
          .poll(() => transformSignature(cards), { message: `${engine} / ${curve}` })
          .not.toEqual(collapsed);
        await page.mouse.move(1, 1);
        await expect(folder).toHaveAttribute("aria-expanded", "false");
      }
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("all engines execute and clean up flash feedback", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Animation & interaction");
    const folder = page.locator(folderSelector).first();
    const flash = folder.locator(".folder-flash");

    await selectSegment(page, "Click", "Flash");
    for (const engine of engines) {
      await selectSegment(page, "Engine", engine);

      if (engine === "CSS") {
        await flash.evaluate((element) => {
          const flashElement = element as HTMLElement;
          flashElement.dataset.observedClass = "false";
          const observer = new MutationObserver(() => {
            if (flashElement.classList.contains("is-css-flashing")) {
              flashElement.dataset.observedClass = "true";
              observer.disconnect();
            }
          });
          observer.observe(flashElement, { attributes: true, attributeFilter: ["class"] });
          window.setTimeout(() => observer.disconnect(), 2_000);
        });
      } else {
        await flash.evaluate((element) => {
          const flashElement = element as HTMLElement;
          flashElement.dataset.observedVisible = "false";
          const startedAt = performance.now();
          const sampleOpacity = () => {
            if (Number.parseFloat(getComputedStyle(flashElement).opacity) > 0) {
              flashElement.dataset.observedVisible = "true";
              return;
            }
            if (performance.now() - startedAt < 2_000) requestAnimationFrame(sampleOpacity);
          };
          requestAnimationFrame(sampleOpacity);
        });
      }

      await folder.click();

      if (engine === "CSS") {
        await expect(flash).toHaveAttribute("data-observed-class", "true");
      } else {
        await expect(flash, `${engine} flash feedback`).toHaveAttribute(
          "data-observed-visible",
          "true",
        );
      }

      await page.getByRole("heading", { name: "Folder Motion Lab" }).click();
    }

    await selectSegment(page, "Engine", "GSAP");
    await expect(flash).not.toHaveClass(/is-css-flashing/);
    await expect(flash).toHaveCSS("opacity", "0");
  });

  test("keeps an extreme mobile stack finite and inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await openSection(page, "Animation & interaction");
    const folder = page.locator(folderSelector).first();
    const cards = folder.locator(".file-card");

    await selectSegment(page, "Engine", "WAAPI");
    await page
      .getByRole("group", { name: "Expansion layout" })
      .getByRole("button", { name: "Split", exact: true })
      .click();
    await setRange(page, "Visible cards", 5);
    await selectSegment(page, "Axis", "Horizontal");
    await selectSegment(page, "Direction", "Right");
    await setRange(page, "Fan angle", 16);
    await setRange(page, "Spacing", 1.45);
    await setRange(page, "Cover depth", -24);
    await selectSegment(page, "Click", "Lock");
    await folder.click();

    await expect(folder).toHaveAttribute("aria-expanded", "true");
    expect((await transformSignature(cards)).flat().every(Number.isFinite)).toBe(true);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    await folder.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(100);
    await page.screenshot({ path: "test-results/visual-proof-compatibility-mobile-extreme.png" });
  });
});

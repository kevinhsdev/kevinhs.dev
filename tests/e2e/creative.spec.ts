import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("version B · creative", () => {
  test("name and CTAs are visible on the first frame, before any animation", async ({ page }) => {
    await page.goto("/pt", { waitUntil: "commit" });
    await expect(page.getByRole("heading", { level: 1, name: "Kevin Henrique" })).toBeVisible();
    const cv = page.locator('a[download][href$=".pdf"]').first();
    await expect(cv).toBeVisible();
    const box = await cv.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  });

  test("intro curtain plays once per session and lifts on its own", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/pt");
    const curtain = page.locator(".preloader");
    await expect(curtain).toBeAttached();
    // Prints the build log and lifts away by itself (~1.55s), so it never blocks the page.
    await expect(curtain).toBeHidden({ timeout: 3000 });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-intro-seen", "");
    await expect(curtain).toBeHidden();
  });

  test("intro curtain is skipped with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pt");
    await expect(page.locator(".preloader")).toBeHidden();
  });

  test("the hero editor types the profile out and ends fully visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/en");
    const editor = page.getByRole("figure", { name: "Profile as code (kevin.ts)" });
    await expect(editor).toContainText('role: "Software Engineering Student"');
    await expect(editor).toContainText("satisfies Engineer");
    // Every line ends unclipped once the typing is done.
    await expect
      .poll(
        () =>
          editor.locator(".type-line").evaluateAll((lines) =>
            // Any all-zero inset ("inset(0px)", "inset(0px 0% 0px 0px)") or "none" means fully visible.
            lines.every((line) =>
              /^inset\(\s*0(px|%)?(\s+0(px|%)?)*\s*\)$|^none$/.test(
                getComputedStyle(line).clipPath,
              ),
            ),
          ),
        { timeout: 8000 },
      )
      .toBe(true);
  });

  test("the journey pins and slides sideways as the page scrolls", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/pt");
    const journey = page.locator(".journey");
    await expect(journey.locator(".journey-card")).toHaveCount(11);
    await expect(journey).toContainText("GDG Cloud São Paulo na FIAP");
    await expect(journey).toHaveAttribute("data-pinned", "true");
    const track = journey.locator(".journey-track");
    // Scroll to the end of the pinned section: the track has moved and the last tick is on.
    await journey.evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top + el.getBoundingClientRect().height - window.innerHeight,
        behavior: "instant",
      });
    });
    await expect
      .poll(() => track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41))
      .toBeLessThan(-200);
    await expect(journey.locator("[data-tick]").last()).toHaveAttribute("data-on", "true");
  });

  test("with reduced motion the journey is a sideways-scrolling row", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pt");
    const journey = page.locator(".journey");
    await expect(journey).toHaveAttribute("data-pinned", "false");
    const view = journey.getByRole("region", { name: "Trajetória" });
    await expect(view).toHaveCSS("overflow-x", "auto");
  });

  test("skills explorer switches levels with the arrow keys", async ({ page }) => {
    await page.goto("/en");
    const first = page.getByRole("tab", { name: /use-every-day/ });
    await first.focus();
    await page.keyboard.press("ArrowDown");
    const second = page.getByRole("tab", { name: /have-experience-with/ });
    await expect(second).toBeFocused();
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("Docker");
  });

  test("site menu opens from the header, navigates and closes", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await drawer.getByRole("link", { name: /Skills/ }).click();
    await expect(drawer).toBeHidden();
    await expect(page.locator("#skills-title")).toBeInViewport({ timeout: 5000 });
  });

  test("the CTA dock hides over the hero and appears after it", async ({ page }) => {
    await page.goto("/pt");
    const dock = page.locator("nav.dock");
    await expect(dock).toHaveAttribute("data-visible", "false");
    await expect(dock).toHaveCSS("opacity", "0");
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await expect(dock).toHaveAttribute("data-visible", "true");
    await expect(dock).toHaveCSS("opacity", "1");
  });

  test("runs with motion on without page errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/en", { waitUntil: "networkidle" });
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(800);
    expect(errors).toEqual([]);
  });

  test("command menu navigation scrolls to the section under smooth scroll", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await page.mouse.wheel(0, 10); // wakes the lazy motion layer (Lenis)
    await expect(page.locator("html.lenis")).toHaveCount(1);
    await page.keyboard.press("Control+k");
    // Typed right away, before the lazily loaded palette has appeared: nothing is lost.
    await page.keyboard.type("Contact");
    await expect(page.getByPlaceholder("Type a command or search…")).toHaveValue("Contact");
    await page.keyboard.press("Enter");
    await expect(page.locator("#contact-title")).toBeInViewport({ timeout: 5000 });
  });

  test("with reduced motion, content is static and fully visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator("html.lenis")).toHaveCount(0);
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Let's talk" })).toBeVisible();
    const hidden = await page.$$eval(
      "[data-reveal]",
      (elements) => elements.filter((element) => getComputedStyle(element).opacity !== "1").length,
    );
    expect(hidden).toBe(0);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`has no WCAG A/AA violations (${scheme})`, async ({ page }) => {
      // Reduced motion gives axe the final, settled state of every element.
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto("/pt", { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("has no horizontal scroll at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/pt");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});

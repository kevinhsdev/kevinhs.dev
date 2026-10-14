import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("about me", () => {
  test("the home's About tiles show real facts and lead to the About me page", async ({ page }) => {
    await page.goto("/pt");
    const about = page.locator("#about");
    await expect(about.locator(".about-photo img")).toHaveCount(2);
    await expect(
      about.getByText("anos quando comecei a programar", { exact: false }),
    ).toBeVisible();
    await expect(about.getByRole("heading", { name: "Idiomas" })).toBeVisible();
    await page.getByRole("link", { name: "Mais sobre mim" }).click();
    await expect(page).toHaveURL(/\/pt\/about$/);
    await expect(page.getByRole("heading", { level: 1, name: "Sobre mim" })).toBeVisible();
  });

  test("a theme's photo enlarges, steps with the arrows and closes with Esc", async ({ page }) => {
    await page.goto("/en/about");
    const photos = page.locator("#malta .mosaic-photo");
    await expect(photos).toHaveCount(7);
    await photos.nth(1).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img")).toHaveAttribute("alt", /Malta/);
    await expect(dialog).toContainText("2 / 7");
    await page.keyboard.press("ArrowRight");
    await expect(dialog).toContainText("3 / 7");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // Focus returns to the mosaic, on the photo that was last on screen.
    await expect(photos.nth(2)).toBeFocused();
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`has no WCAG A/AA violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto("/pt/about", { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("has no horizontal scroll at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/pt/about");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});

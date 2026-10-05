import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("about me", () => {
  test("the home's polaroids lead to the About me page", async ({ page }) => {
    await page.goto("/pt");
    await expect(page.locator(".polaroid-stack .polaroid")).toHaveCount(3);
    await page.getByRole("link", { name: "Mais sobre mim" }).click();
    await expect(page).toHaveURL(/\/pt\/about$/);
    await expect(page.getByRole("heading", { level: 1, name: "Sobre mim" })).toBeVisible();
  });

  test("a photo on the wall enlarges, steps with the arrows and closes with Esc", async ({
    page,
  }) => {
    await page.goto("/en/about");
    const photos = page.locator(".mural-photo");
    await expect(photos).toHaveCount(4);
    await photos.first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img")).toHaveAttribute("alt", /Malta/);
    await expect(dialog).toContainText("1 / 4");
    await page.keyboard.press("ArrowRight");
    await expect(dialog).toContainText("2 / 4");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // Focus returns to the wall, on the photo that was last on screen.
    await expect(photos.nth(1)).toBeFocused();
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

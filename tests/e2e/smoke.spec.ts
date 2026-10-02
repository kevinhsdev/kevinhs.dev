import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("site", () => {
  test("redirects / to a locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(pt|en)$/);
  });

  test("old version URLs redirect to the home page", async ({ page }) => {
    for (const path of ["/pt/creative", "/en/terminal", "/pt/studio"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/(pt|en)$/);
    }
  });

  for (const locale of ["pt", "en"] as const) {
    test(`renders the hero and the three CTAs (${locale})`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.getByRole("heading", { level: 1, name: "Kevin Henrique" })).toBeVisible();
      await expect(page.locator('a[download][href$=".pdf"]').first()).toBeVisible();
      await expect(page.locator('a[href*="linkedin.com/in/kevinhs07"]').first()).toBeVisible();
      await expect(
        page.getByRole("button", { name: /copiar e-mail|copy email/i }).first(),
      ).toBeVisible();
    });

    test(`has no WCAG A/AA violations (${locale})`, async ({ page }) => {
      // Reduced motion gives axe the settled state (no intro curtain, no reveals in flight).
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}`, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("switches language keeping the page", async ({ page }) => {
    await page.goto("/pt/now");
    await page.getByRole("link", { name: "Read in English" }).first().click();
    await expect(page).toHaveURL(/\/en\/now$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("switching language on the home keeps the site's styles", async ({ page }) => {
    await page.goto("/pt");
    await page.getByRole("link", { name: "Read in English" }).first().click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    // The intro was already seen in this session, and the display font still applies.
    await expect(page.locator(".preloader")).toBeHidden();
    const font = await page
      .getByRole("heading", { level: 1 })
      .evaluate((h1) => getComputedStyle(h1).fontFamily);
    expect(font).toMatch(/Anton/i);
  });

  test("the theme toggle switches and remembers the theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
    await page.goto("/en");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
    // The header's toggle (the menu drawer has another one).
    await page
      .getByRole("toolbar")
      .getByRole("button", { name: /theme|tema/i })
      .click();
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });

  test("opens the command menu with Ctrl+K", async ({ page }) => {
    await page.goto("/en");
    await page.keyboard.press("Control+k");
    await expect(page.getByPlaceholder("Type a command or search…")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder("Type a command or search…")).toBeHidden();
  });

  test("unknown paths render the localized 404", async ({ page }) => {
    const response = await page.goto("/en/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  });

  test("has no horizontal scroll at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/pt");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});

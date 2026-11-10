import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// ?pronto skips the hero's assembly so the page is final at once.
const PAGES = ["/pt?pronto", "/en?pronto", "/pt/about", "/pt/projects/sek"];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

for (const path of PAGES) {
  test(`${path}: loads clean and passes axe`, async ({ page }) => {
    const errors = collectErrors(page);
    const res = await page.goto(path, { waitUntil: "load" });
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(2500);
    // the agents' bar fades out once the hero is built: scan after, not mid-fade
    await page.locator(".barra").waitFor({ state: "hidden" });
    expect(errors).toEqual([]);
    // @axe-core/playwright types a different playwright-core than @playwright/test; same object at runtime.
    const { violations } = await new AxeBuilder({ page: page as never }).analyze();
    const bad = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual(
      [],
    );
  });

  test(`${path}: CV, LinkedIn and GitHub one click away`, async ({ page }) => {
    await page.goto(path, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await expect(page.locator("a[download]:visible").first()).toBeVisible();
    await expect(page.locator('a[href*="linkedin.com"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href*="github.com"]:visible').first()).toBeVisible();
  });
}

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("/pt: no smooth scroll, every journey chapter visible", async ({ page }) => {
    await page.goto("/pt?pronto", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)lenis(\s|$)/);
    const chapters = page.locator("#journey .jr-title");
    expect(await chapters.count()).toBeGreaterThan(0);
    for (const c of await chapters.all()) await expect(c).toBeVisible();
  });
});

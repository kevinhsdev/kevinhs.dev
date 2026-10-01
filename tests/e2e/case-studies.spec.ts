import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const slugs = ["sek", "pdf-renamer", "blood-bank"];

test.describe("case studies", () => {
  for (const slug of slugs) {
    for (const locale of ["pt", "en"] as const) {
      test(`${slug} (${locale}) renders the full structure`, async ({ page }) => {
        await page.goto(`/${locale}/projects/${slug}`);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.getByText("TL;DR")).toBeVisible();
        await expect(page.getByText(/min (de leitura|read)/)).toBeVisible();
        // Context, role, constraints, decisions, architecture, highlights, results, next steps, links.
        await expect(page.locator("article h2")).toHaveCount(9);
        await expect(page.locator("article table")).toHaveCount(1);
        await expect(page.locator("article figure").first()).toBeVisible();
        await expect(page.locator("article pre").first()).toBeVisible();
      });
    }
  }

  for (const scheme of ["light", "dark"] as const) {
    test(`has no WCAG A/AA violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto("/pt/projects/sek", { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("never links the school system's repository", async ({ page }) => {
    await page.goto("/pt/projects/sek");
    await expect(page.locator('a[href*="github.com/kevinhsdev/secretaria-iel"]')).toHaveCount(0);
  });

  test("links to the next case study", async ({ page }) => {
    await page.goto("/en/projects/sek");
    await page.getByRole("link", { name: /Next\s*PDF Renamer/ }).click();
    await expect(page).toHaveURL(/\/en\/projects\/pdf-renamer$/);
  });

  test("the home links each featured project to its case study", async ({ page }) => {
    await page.goto("/pt");
    // The sticky cards overlap while scrolling (by design), so check where each link goes.
    const links = page.getByRole("link", { name: /Ler estudo de caso/ });
    await expect(links).toHaveCount(3);
    for (const [index, slug] of ["sek", "pdf-renamer", "blood-bank"].entries()) {
      await expect(links.nth(index)).toHaveAttribute("href", `/pt/projects/${slug}`);
    }
  });

  test("the old Secretaria IEL address redirects to SEK", async ({ page }) => {
    await page.goto("/en/projects/secretaria-iel");
    await expect(page).toHaveURL(/\/en\/projects\/sek$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("SEK");
  });

  test("unknown slugs are a 404", async ({ page }) => {
    const response = await page.goto("/pt/projects/nao-existe");
    expect(response?.status()).toBe(404);
  });

  test("has no horizontal scroll at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/pt/projects/pdf-renamer");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});

test.describe("now and 404", () => {
  test("/now lists what Kevin is learning and building", async ({ page }) => {
    await page.goto("/en/now");
    await expect(page.getByRole("heading", { level: 1, name: "Now" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Learning" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Building" })).toBeVisible();
  });

  for (const path of ["/pt/now", "/pt/nada-aqui"]) {
    test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("the 404 shows the git joke with the missing path", async ({ page }) => {
    const response = await page.goto("/pt/nada-aqui");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("git checkout /pt/nada-aqui")).toBeVisible();
  });
});

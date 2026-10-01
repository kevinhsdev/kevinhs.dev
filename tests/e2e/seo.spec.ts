import { expect, test } from "@playwright/test";

test.describe("seo and print", () => {
  test("the sitemap lists every page in both languages", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBe(true);
    const xml = await response.text();
    for (const path of ["/pt", "/en/now", "/pt/projects/sek", "/en/projects/blood-bank"]) {
      expect(xml).toContain(`${path}</loc>`);
    }
    expect(xml).toContain('hreflang="pt-BR"');
  });

  test("robots.txt allows crawling and points to the sitemap", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("Allow: /");
    expect(body).toContain("/sitemap.xml");
  });

  for (const path of ["/pt", "/en/projects/pdf-renamer"]) {
    test(`${path} has its own Open Graph image`, async ({ page, request }) => {
      await page.goto(path);
      const image = await page.locator('meta[property="og:image"]').first().getAttribute("content");
      expect(image).toBeTruthy();
      const response = await request.get(new URL(image!).pathname + new URL(image!).search);
      expect(response.headers()["content-type"]).toContain("image/png");
    });
  }

  test("printing the home gives the one-page summary", async ({ page }) => {
    await page.goto("/en");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".print-summary")).toBeVisible();
    await expect(page.locator("main")).toBeHidden();
    await expect(page.locator(".print-summary")).toContainText("Kevin Henrique da Silva");
  });
});

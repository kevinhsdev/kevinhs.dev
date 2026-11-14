// Writes every CV from the site's content (scripts/cv/render.ts): scripts/cv/cv-<lang>.html,
// public/cv/kevin-henrique-cv-<lang>.pdf and the .webp of its first page the site shows.
// Usage: npm run cv
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { createJiti } from "jiti";
import sharp from "sharp";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const jiti = createJiti(import.meta.url, { alias: { "@": here("../../src") } });
const { renderCv, CV_LOCALES } = await jiti.import("./render.ts");

const browser = await chromium.launch();
for (const lang of CV_LOCALES) {
  const html = here(`./cv-${lang}.html`);
  const pdf = here(`../../public/cv/kevin-henrique-cv-${lang}.pdf`);
  writeFileSync(html, renderCv(lang));

  // A4 at 96 dpi, drawn at ~220 dpi for the preview
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2.3,
  });
  await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true });
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 794, height: 1123 } });
  // the size the site's CV section expects (src/components/home/cv.tsx)
  await sharp(png)
    .resize(1818, 2573)
    .webp({ quality: 92 })
    .toFile(pdf.replace(/\.pdf$/, ".webp"));
  await page.close();
  console.log("wrote", pdf);
}
await browser.close();

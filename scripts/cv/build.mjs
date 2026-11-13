// Renders scripts/cv/cv-<lang>.html to public/cv/kevin-henrique-cv-<lang>.pdf.
// Usage: node scripts/cv/build.mjs pt   (then refresh the site preview: python scripts/cv/preview.py pt)
import { chromium } from "@playwright/test";
import { fileURLToPath, pathToFileURL } from "node:url";

const lang = process.argv[2] ?? "pt";
const src = fileURLToPath(new URL(`./cv-${lang}.html`, import.meta.url));
const out = fileURLToPath(
  new URL(`../../public/cv/kevin-henrique-cv-${lang}.pdf`, import.meta.url),
);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(src).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log("wrote", out);

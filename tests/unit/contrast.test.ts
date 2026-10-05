import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** WCAG 2.x relative luminance and contrast ratio. */
function luminance(hex: string): number {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((pair) => parseInt(pair, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

function parseBlocks(css: string) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body]) => ({
    selector: selector!.trim().replace(/\s+/g, " "),
    tokens: Object.fromEntries(
      [...body!.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, value]) => [name, value]),
    ) as Record<string, string>,
  }));
}

const TEXT = 4.5; // WCAG AA, body text

const pairs: [fg: string, bg: string, min: number][] = [
  ["foreground", "background", TEXT],
  ["foreground", "surface", TEXT],
  ["muted", "background", TEXT],
  ["muted", "surface", TEXT],
  ["accent", "background", TEXT],
  ["link", "background", TEXT],
  ["link", "surface", TEXT],
  ["accent-contrast", "accent", TEXT],
  ["danger", "background", TEXT],
  ["positive", "background", TEXT],
  ["positive", "surface", TEXT],
  ["danger", "surface", TEXT],
  ["paper-ink", "paper", TEXT],
];

const blocks = parseBlocks(readFileSync("src/styles/tokens.css", "utf8"));

describe("design tokens", () => {
  it("defines the light and dark themes", () => {
    expect(blocks).toHaveLength(2);
  });

  describe.each(blocks)("$selector", ({ tokens }) => {
    it.each(pairs)("%s on %s meets %s:1", (fg, bg, min) => {
      expect(tokens[fg], `missing --${fg}`).toBeDefined();
      expect(tokens[bg], `missing --${bg}`).toBeDefined();
      expect(contrast(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(min);
    });
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** WCAG 2.x relative luminance and contrast ratio. */
function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((pair) => parseInt(pair, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const css = readFileSync("src/styles/tokens.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const blocks = Object.fromEntries(
  [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body]) => [
    selector!.split(",")[0]!.trim().replace(/\s+/g, " "),
    Object.fromEntries(
      [...body!.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, n, v]) => [n, v]),
    ) as Record<string, string>,
  ]),
);

const light = blocks[":root"]!;
const dark = { ...light, ...blocks[".dark"] };
const themes = {
  light,
  dark,
  "light+red": { ...light, ...blocks['[data-accent="red"]'] },
  "dark+red": { ...dark, ...blocks['[data-accent="red"]'], ...blocks['.dark[data-accent="red"]'] },
};

const pairs: [string, string][] = [
  ["foreground", "background"],
  ["foreground", "surface"],
  ["muted", "background"],
  ["muted", "surface"],
  ["accent", "background"],
  ["accent-contrast", "accent"],
];

describe("design tokens", () => {
  it("has exactly the light, dark and red-accent blocks", () => {
    expect(Object.keys(blocks).sort()).toEqual(
      [".dark", '.dark[data-accent="red"]', ":root", '[data-accent="red"]'].sort(),
    );
  });

  describe.each(Object.entries(themes))("%s", (_, tokens) => {
    it.each(pairs)("%s on %s meets 4.5:1", (fg, bg) => {
      expect(tokens[fg], `missing --${fg}`).toBeDefined();
      expect(contrast(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(4.5);
    });
  });
});

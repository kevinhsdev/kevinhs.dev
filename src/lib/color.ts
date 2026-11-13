/** Canvas and WebGL take RGB in 0–1, not CSS: these read the tokens into that form. */
export type Rgb01 = [number, number, number];

const GREY: Rgb01 = [0.5, 0.5, 0.5];

export function cssColorToRgb01(value: string): Rgb01 {
  const v = value.trim();
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as Rgb01;
  }
  const rgb = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map((n) => Number(n) / 255) as Rgb01;
  return GREY;
}

/** The computed value of `--name` on `el` (default: <html>), as RGB 0–1. */
export function readToken(name: string, el: Element = document.documentElement): Rgb01 {
  return cssColorToRgb01(getComputedStyle(el).getPropertyValue(`--${name}`));
}

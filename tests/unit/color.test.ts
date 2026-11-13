import { expect, test } from "vitest";
import { cssColorToRgb01 } from "@/lib/color";

const close = (a: number[], b: number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i]!, 2));

test("parses hex colors", () => {
  close(cssColorToRgb01("#4d8dff"), [0.302, 0.553, 1]);
  close(cssColorToRgb01("#fff"), [1, 1, 1]);
});

test("parses rgb() in both syntaxes", () => {
  close(cssColorToRgb01("rgb(7 13 31)"), [0.027, 0.051, 0.122]);
  close(cssColorToRgb01("rgb(7, 13, 31)"), [0.027, 0.051, 0.122]);
});

test("unreadable input falls back to mid grey", () => {
  close(cssColorToRgb01("not-a-color"), [0.5, 0.5, 0.5]);
});

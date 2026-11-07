import { expect, test } from "vitest";
import { coverPoint } from "@/motion/cover";

test("the centre of the media lands on the centre of the box", () => {
  const p = coverPoint({ w: 1600, h: 900 }, { w: 390, h: 844 }, 0.5, 0.5);
  expect(p.x).toBeCloseTo(195);
  expect(p.y).toBeCloseTo(422);
});

test("a wide box crops the top: the corner sits at x 0 and above the box", () => {
  const p = coverPoint({ w: 1600, h: 900 }, { w: 1536, h: 702 }, 0, 0);
  expect(p.x).toBeCloseTo(0);
  expect(p.y).toBeLessThanOrEqual(0);
  expect(p.scale).toBeCloseTo(0.96);
});

test("focusX shifts the crop on a tall box", () => {
  const left = coverPoint({ w: 1600, h: 900 }, { w: 390, h: 844 }, 0.2, 0.5, 0);
  expect(left.x).toBeCloseTo(0.2 * 1600 * (844 / 900));
});

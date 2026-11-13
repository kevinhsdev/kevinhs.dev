import { expect, test } from "vitest";
import { clamp, inOutCubic, lerp, monotone, range } from "@/motion/math";

test("range maps s between a and b to 0..1, clamped", () => {
  expect(range(1.5, 1, 2)).toBe(0.5);
  expect(range(0, 1, 2)).toBe(0);
  expect(range(3, 1, 2)).toBe(1);
});

test("clamp, lerp and inOutCubic hold their ends", () => {
  expect(clamp(5, 0, 1)).toBe(1);
  expect(lerp(2, 4, 0.5)).toBe(3);
  expect(inOutCubic(0)).toBe(0);
  expect(inOutCubic(1)).toBe(1);
  expect(inOutCubic(0.5)).toBeCloseTo(0.5);
});

test("monotone never overshoots between flat points", () => {
  const f = monotone([
    [0, 0],
    [1, 10],
    [2, 10],
  ]);
  let prev = -Infinity;
  for (let x = 0; x <= 2; x += 0.01) {
    const y = f(x);
    expect(y).toBeGreaterThanOrEqual(prev - 1e-9);
    prev = y;
  }
  expect(f(1.5)).toBeCloseTo(10);
  expect(f(-1)).toBe(0);
  expect(f(5)).toBe(10);
});

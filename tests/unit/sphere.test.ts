import { describe, expect, it } from "vitest";
import { apply, toVec, viewFacing } from "@/lib/sphere";

describe("viewFacing", () => {
  it("puts the faced point at the center and north at the top", () => {
    const m = viewFacing(-50, -15);
    apply(m, toVec(-50, -15)).forEach((c, i) => expect(c).toBeCloseTo([0, 0, 1][i]!, 6));
    apply(m, toVec(40, -15)).forEach((c, i) => expect(c).toBeCloseTo([0, 1, 0][i]!, 6));
    expect(apply(m, toVec(-50, -5))[0]).toBeGreaterThan(0); // east is right
  });
});

describe("arcPath", () => {
  it("runs from a to b, lifted in the middle, and stops at t", async () => {
    const { arcPath } = await import("@/lib/sphere");
    const a = toVec(-23.55, -46.63);
    const b = toVec(35.9, 14.5);
    const full = arcPath(a, b);
    full[0]!.forEach((c, i) => expect(c).toBeCloseTo(a[i]!, 6));
    full.at(-1)!.forEach((c, i) => expect(c).toBeCloseTo(b[i]!, 6));
    expect(Math.hypot(...full[60]!)).toBeGreaterThan(1.1);
    const half = arcPath(a, b, 0.5);
    expect(half.at(-1)!).toEqual(full[60]);
  });
});

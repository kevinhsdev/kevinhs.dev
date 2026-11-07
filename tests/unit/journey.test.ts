import { describe, expect, it } from "vitest";
import { journeyState, SCREENS } from "@/lib/journey";

describe("journeyState", () => {
  it("opens on the globe, zooming in", () => {
    expect(journeyState(0).scene).toBe("globe");
    expect(journeyState(0).globe.scale).toBeLessThan(journeyState(0.8).globe.scale);
  });
  it("is in São Paulo at s=2", () => {
    expect(journeyState(2).chapter).toBe("sp");
    expect(journeyState(2).scene).toBe("sp");
  });
  it("draws the SP → Malta arc monotonically during the flight", () => {
    const mid = journeyState(4).arc.spMalta;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    let last = -1;
    for (let s = 3.4; s <= 4.6 + 1e-9; s += 0.05) {
      const v = journeyState(s).arc.spMalta;
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
  });
  it("is in Malta at s=5", () => expect(journeyState(5).scene).toBe("malta"));
  it("draws the planned arcs", () => expect(journeyState(7.5).arc.planned).toBeGreaterThan(0));
  it("zooms out for the outro", () =>
    expect(journeyState(8.9).globe.scale).toBeLessThan(journeyState(4).globe.scale));
  it("is pure and clamps s", () => {
    expect(journeyState(3.3)).toEqual(journeyState(3.3));
    expect(journeyState(-2)).toEqual(journeyState(0));
    expect(journeyState(99)).toEqual(journeyState(SCREENS));
  });
});

describe("greatCircle", () => {
  it("starts at a, ends at b, and passes north of both on SP → Malta", async () => {
    const { greatCircle, SP, MALTA } = await import("@/lib/journey");
    const near = (p: readonly number[], q: readonly number[]) =>
      expect(Math.hypot(p[0]! - q[0]!, p[1]! - q[1]!)).toBeLessThan(1e-6);
    near(greatCircle(SP, MALTA, 0), SP);
    near(greatCircle(SP, MALTA, 1), MALTA);
    const mid = greatCircle(SP, MALTA, 0.5);
    expect(mid[1]).toBeGreaterThan(SP[1]);
    expect(mid[1]).toBeLessThan(MALTA[1]);
  });
});

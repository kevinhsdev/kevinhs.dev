import { describe, expect, it } from "vitest";
import { distanceKm, journeyState, MALTA, SCREENS, SP } from "@/lib/journey";

describe("journeyState", () => {
  it("fills each photo's bar across its turn", () => {
    expect(journeyState(1.5).cardProgress).toBeCloseTo(0); // school photo, just in
    expect(journeyState(2.02).cardProgress).toBeGreaterThan(0.95);
    expect(journeyState(5).cardProgress).toBeCloseTo(0); // first Malta photo
    expect(journeyState(5.125).cardProgress).toBeCloseTo(0.5);
    expect(journeyState(6.49).cardProgress).toBeGreaterThan(0.9); // last Malta photo
    expect(journeyState(4).cardProgress).toBe(0); // no photo
  });

  it("opens on the globe, zooming in, with no photo and Malta not yet shown", () => {
    expect(journeyState(0).card).toBeNull();
    expect(journeyState(0).show.malta).toBe(false);
    expect(journeyState(0).globe.scale).toBeLessThan(journeyState(0.8).globe.scale);
  });
  it("is in São Paulo at s=2", () => {
    expect(journeyState(2).chapter).toBe("sp");
    expect(journeyState(2).card).toBe(0); // the school photo, with its title
    expect(journeyState(2.3).card).toBe(1); // UMC
    expect(journeyState(2.8).card).toBe(2); // OASE
    expect(journeyState(2).show.malta).toBe(false);
  });
  it("faces São Paulo in São Paulo", () => {
    const { lat, lon } = journeyState(2).globe;
    expect(lon).toBeCloseTo(-46.63, 1);
    expect(lat).toBeLessThan(0);
  });
  it("shows Malta only once the plane lands", () => {
    expect(journeyState(4).show.malta).toBe(false);
    expect(journeyState(4.5).show.malta).toBe(true);
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
  it("walks the six Malta photos in Malta", () => {
    expect(journeyState(5.05).card).toBe(3);
    expect(journeyState(6.45).card).toBe(8);
    expect(journeyState(7).card).toBeNull();
  });
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
  it("measures SP to Malta along the great circle", () => {
    const km = distanceKm(SP, MALTA);
    expect(km).toBeGreaterThan(9000);
    expect(km).toBeLessThan(10500);
    expect(distanceKm(SP, SP)).toBe(0);
  });
  it("pulses Malta only after landing", () => {
    expect(journeyState(4.4).landing).toBe(0);
    expect(journeyState(4.8).landing).toBeGreaterThan(0);
    expect(journeyState(5.2).landing).toBe(1);
  });
});

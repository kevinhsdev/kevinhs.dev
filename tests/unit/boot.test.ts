import { describe, expect, it } from "vitest";
import { bootMode } from "@/components/hero/boot";

describe("bootMode", () => {
  it("builds the home with the agents", () => expect(bootMode("/pt", "", false)).toBe("monta"));
  it("opens built with ?pronto", () => expect(bootMode("/pt", "?pronto", false)).toBe("pronto"));
  it("opens built under reduced motion", () => expect(bootMode("/en", "", true)).toBe("pronto"));
  it("skips other routes", () => expect(bootMode("/pt/about", "", false)).toBeNull());
  it("matches pronto as a whole word", () =>
    expect(bootMode("/pt", "?prontoX", false)).toBe("monta"));
  it("accepts the root and a trailing slash", () => {
    expect(bootMode("/", "", false)).toBe("monta");
    expect(bootMode("/en/", "?a=1&pronto", false)).toBe("pronto");
  });
});

describe("BOOT_SCRIPT", () => {
  it("is valid JS that inlines bootMode", async () => {
    const { BOOT_SCRIPT } = await import("@/components/hero/boot");
    expect(() => new Function(BOOT_SCRIPT)).not.toThrow();
    expect(BOOT_SCRIPT).toContain("pronto");
  });
});

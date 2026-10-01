import { describe, expect, it } from "vitest";
import { buildMailto, contactSchema } from "@/lib/contact-schema";
import { formatPeriod } from "@/lib/period";
import { createRateLimiter } from "@/lib/rate-limit";
import { formatPartialDate, splitLead } from "@/lib/utils";

describe("utils", () => {
  it("formats partial dates per locale", () => {
    expect(formatPartialDate("2025-08", "en")).toBe("Aug 2025");
    expect(formatPartialDate("2025-08", "pt")).toMatch(/ago\.? de 2025/);
    expect(formatPartialDate("2024", "pt")).toBe("2024");
  });

  it("splits a bold lead at the first colon", () => {
    expect(splitLead("3× more: a tool")).toEqual(["3× more", ": a tool"]);
    expect(splitLead("no colon")).toEqual(["no colon", ""]);
  });
});

describe("formatPeriod", () => {
  const labels = { present: "present", inProgress: "in progress", expected: "expected" };

  it("covers every shape of period", () => {
    expect(formatPeriod({ start: "2025-08", end: "present" }, "en", labels)).toBe(
      "Aug 2025 — present",
    );
    expect(
      formatPeriod({ start: "2024-01", end: "2028-12", endIsExpected: true }, "en", labels),
    ).toBe("Jan 2024 — Dec 2028 (expected)");
    expect(formatPeriod({ start: null, inProgress: true }, "en", labels)).toBe("in progress");
    expect(formatPeriod({ start: "2026-09" }, "en", labels)).toBe("Sep 2026");
  });
});

describe("contact", () => {
  const valid = { name: "Ana", email: "ana@example.com", message: "Olá, vi seu portfólio!" };

  it("accepts a valid message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a filled honeypot", () => {
    expect(contactSchema.safeParse({ ...valid, company: "spam inc" }).success).toBe(false);
  });

  it("builds an encoded mailto fallback", () => {
    expect(buildMailto("me@x.com", valid)).toBe(
      "mailto:me@x.com?subject=Portfolio%20%C2%B7%20Ana&body=Ol%C3%A1%2C%20vi%20seu%20portf%C3%B3lio!",
    );
  });

  it("rate-limits per key within a window", () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect([allow("ip", 0), allow("ip", 1), allow("ip", 2)]).toEqual([true, true, false]);
    expect(allow("other", 2)).toBe(true);
    expect(allow("ip", 1000)).toBe(true);
  });
});

describe("case studies", () => {
  it("estimates reading time from prose, ignoring code and JSX", async () => {
    const { estimateMinutes } = await import("@/lib/case-studies");
    const prose = Array.from({ length: 400 }, () => "palavra").join(" ");
    const code = "```js\n" + Array.from({ length: 2000 }, () => "x").join(" ") + "\n```";
    expect(estimateMinutes(prose)).toBe(2);
    expect(estimateMinutes(`${prose}\n${code}\n<Diagram label="a b c" />`)).toBe(2);
    expect(estimateMinutes("curto")).toBe(1);
  });
});

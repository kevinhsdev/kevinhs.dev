import { describe, expect, it } from "vitest";
import { certificateFolders, eventOptions } from "@/components/about/data";

describe("certificateFolders", () => {
  it("holds the 4 certificates and nothing in progress", () => {
    const files = certificateFolders("pt").flatMap((f) => f.files);
    expect(files).toHaveLength(4);
    const ids = files.map((f) => f.id);
    for (const id of ["aws-cert", "bootcamp-itau", "bootcamp-santander"])
      expect(ids).not.toContain(id);
    expect(certificateFolders("pt").map((f) => f.files.map((x) => x.meta))).toEqual([
      ["CNA · 2024", "EF · Malta · 2025"],
      ["DIO · 09/2026", "Alura · 2026"],
    ]);
  });
});

describe("eventOptions", () => {
  it("lists the 5 event photos in order", () => {
    expect(eventOptions("pt").map((e) => e.id)).toEqual([
      "gdg-cloud-sp",
      "soujava-oracle",
      "claude-oracle",
      "palestra-carreira-codigo",
      "coffee-break",
    ]);
  });
});

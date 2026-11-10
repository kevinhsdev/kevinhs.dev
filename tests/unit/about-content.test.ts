import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { aboutPhotoIds, certificateFolders } from "@/components/about/data";
import { gallery } from "@/content";

describe("certificateFolders", () => {
  it("holds the 13 finished certificates, each but CNA linked to its file", () => {
    const folders = certificateFolders("pt");
    expect(folders.map((f) => f.files.length)).toEqual([2, 2, 8, 1]);
    const files = folders.flatMap((f) => f.files);
    for (const id of ["aws-cert", "bootcamp-itau", "bootcamp-santander"])
      expect(files.map((f) => f.id)).not.toContain(id);
    expect(files.filter((f) => !f.href).map((f) => f.id)).toEqual(["cna-c1"]);
    for (const f of files.filter((f) => f.href))
      expect(existsSync(`public${f.href}`), f.href).toBe(true);
  });
});

describe("ABOUT_PHOTOS", () => {
  it("uses gallery photos only", () => {
    const ids = aboutPhotoIds();
    for (const id of ids) expect(gallery.map((g) => g.id)).toContain(id);
  });
});

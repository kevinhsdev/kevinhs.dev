import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { featuredProjects, gallery, otherProjects, projects } from "@/content";

const inPublic = (src: string) => existsSync(join("public", src));

test("featured and other projects follow the content tiers", () => {
  expect(featuredProjects.map((p) => p.slug)).toEqual(["sek", "kiri", "rumo", "blood-bank"]);
  expect(otherProjects).toHaveLength(4);
});

test("every photo and poster the content points to exists", () => {
  for (const photo of gallery) expect(inPublic(photo.src), photo.src).toBe(true);
  for (const p of projects) {
    if (p.presentation) expect(inPublic(p.presentation.poster), p.presentation.poster).toBe(true);
  }
});

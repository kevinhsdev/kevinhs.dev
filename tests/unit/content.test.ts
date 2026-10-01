import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import pt from "../../messages/pt.json";
import {
  featuredProjects,
  filterTimeline,
  getAdjacentCaseStudies,
  getProject,
  isTodo,
  pick,
  profile,
  projects,
  sortTimeline,
  timeline,
  type TimelineItem,
} from "@/content";

function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("content", () => {
  it("parses without errors (schemas run at import)", () => {
    expect(profile.fullName).toBe("Kevin Henrique da Silva");
    expect(projects.length).toBeGreaterThan(0);
  });

  it("features the three case studies in the agreed order", () => {
    expect(featuredProjects.map((p) => p.slug)).toEqual(["sek", "pdf-renamer", "blood-bank"]);
  });

  it("never links the private school systems' code", () => {
    for (const project of projects.filter((p) => p.privateCode)) {
      expect(project.links.repo, project.slug).toBeUndefined();
    }
  });

  it("does not publish a phone number anywhere", () => {
    expect(JSON.stringify(projects) + JSON.stringify(profile)).not.toMatch(
      /\(\d{2}\)\s?9?\d{4}-\d{4}/,
    );
  });

  it("finds projects and case-study neighbours", () => {
    expect(getProject("pdf-renamer")?.title).toBe("PDF Renamer");
    const { previous, next } = getAdjacentCaseStudies("pdf-renamer");
    expect(previous?.slug).toBe("sek");
    expect(next?.slug).toBe("blood-bank");
  });

  it("picks the right language", () => {
    expect(pick({ pt: "Olá", en: "Hi" }, "en")).toBe("Hi");
    expect(pick("Java", "pt")).toBe("Java");
  });

  it("flags TODO markers", () => {
    expect(isTodo("TODO(kevin): foto")).toBe(true);
    expect(isTodo("Java")).toBe(false);
  });
});

describe("timeline", () => {
  const item = (
    id: string,
    start: string | null,
    extra: Partial<TimelineItem> = {},
  ): TimelineItem => ({
    id,
    kind: "study",
    ...extra,
    title: { pt: id, en: id },
    org: "x",
    start,
    highlights: [],
  });

  it("puts ongoing items first, current work before courses", () => {
    const sorted = sortTimeline([
      item("old-course", "2024"),
      item("bootcamp", null, { inProgress: true }),
      item("job", "2025-08", { kind: "work", end: "present" }),
      item("event", "2026-09", { kind: "event" }),
    ]);
    expect(sorted.map((i) => i.id)).toEqual(["job", "bootcamp", "event", "old-course"]);
  });

  it("filters by kind", () => {
    expect(filterTimeline(timeline, "work").every((i) => i.kind === "work")).toBe(true);
    expect(filterTimeline(timeline, "all")).toHaveLength(timeline.length);
  });
});

describe("messages", () => {
  it("has the same keys in PT and EN", () => {
    expect(keys(en).sort()).toEqual(keys(pt).sort());
  });
});

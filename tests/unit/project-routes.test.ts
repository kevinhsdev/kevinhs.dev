import { describe, expect, it } from "vitest";
import { getAdjacentProjects, projectParams, projects } from "@/content";
import { splitMetric } from "@/components/project/metrics";

describe("projectParams", () => {
  it("lists every project slug once", () => {
    const slugs = projectParams().map((p) => p.slug);
    expect(slugs).toHaveLength(8);
    expect([...slugs].sort()).toEqual(projects.map((p) => p.slug).sort());
  });
});

describe("getAdjacentProjects", () => {
  it("wraps around at both ends", () => {
    const first = projects[0]!.slug;
    const last = projects.at(-1)!.slug;
    expect(getAdjacentProjects(first).previous.slug).toBe(last);
    expect(getAdjacentProjects(last).next.slug).toBe(first);
  });
});

describe("splitMetric", () => {
  it("keeps prefix, suffix and decimals", () => {
    expect(splitMetric("~535")).toEqual(["~", 535, "", 0]);
    expect(splitMetric("v5.8")).toEqual(["v", 5.8, "", 1]);
    expect(splitMetric("3×")).toEqual(["", 3, "×", 0]);
    expect(splitMetric("40%")).toEqual(["", 40, "%", 0]);
    expect(splitMetric("—")).toBeNull();
  });
});

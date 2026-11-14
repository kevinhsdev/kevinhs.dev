import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CV_LOCALES, renderCv } from "../../scripts/cv/render";
import { featuredProjects, pick, profile, skills, timeline } from "@/content";

/** The CV is written from the site's content; nothing on the site may be missing from it. */
describe.each(CV_LOCALES)("CV (%s)", (locale) => {
  const html = renderCv(locale);
  const has = (s: string) =>
    expect(html).toContain(s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));

  it("has every skill, featured project and work highlight", () => {
    skills.flatMap((g) => g.items).forEach((s) => has(pick(s, locale)));
    featuredProjects.forEach((p) => has(pick(p.title, locale)));
    timeline
      .filter((i) => i.kind === "work")
      .flatMap((i) => i.highlights)
      .forEach((h) => has(pick(h, locale)));
    has(profile.email);
    has(profile.links.site);
  });

  it("has no unfinished facts", () => {
    expect(html).not.toContain("TODO");
  });

  it("matches the committed CV (run `npm run cv` after changing the content)", () => {
    expect(readFileSync(`scripts/cv/cv-${locale}.html`, "utf8")).toBe(html);
  });
});

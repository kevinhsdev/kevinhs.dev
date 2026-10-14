import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { MDXContent } from "mdx/types";
import { projects } from "@/content";
import type { Locale } from "@/i18n/routing";
import { slugify } from "@/lib/utils";

const DIRECTORY = path.join(process.cwd(), "src/content/case-studies");

export const caseStudySlugs = projects.filter((p) => p.hasCaseStudy).map((p) => p.slug);

/** The compiled MDX body of a case study (bundled at build time). */
export async function loadCaseStudy(slug: string, locale: Locale): Promise<MDXContent> {
  const mdx = (await import(`@/content/case-studies/${slug}.${locale}.mdx`)) as {
    default: MDXContent;
  };
  return mdx.default;
}

/** Minutes to read at ~200 words per minute, ignoring code blocks and JSX props. */
export function readingMinutes(slug: string, locale: Locale): number {
  const source = readFileSync(path.join(DIRECTORY, `${slug}.${locale}.mdx`), "utf8");
  return estimateMinutes(source);
}

export type OutlineItem = { id: string; title: string };

/** The case study's sections (its `## ` headings), with the ids the MDX h2s get. */
export function caseStudyOutline(slug: string, locale: Locale): OutlineItem[] {
  const source = readFileSync(path.join(DIRECTORY, `${slug}.${locale}.mdx`), "utf8");
  return outlineOf(source);
}

export function outlineOf(source: string): OutlineItem[] {
  return [...source.replace(/```[\s\S]*?```/g, "").matchAll(/^## (.+)$/gm)].map(([, raw = ""]) => {
    const title = raw.replace(/[*`]/g, "").trim();
    return { id: slugify(title), title };
  });
}

export function estimateMinutes(source: string): number {
  const prose = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*|`>-]/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

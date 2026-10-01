import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import { now as rawNow } from "./now";
import { profile as rawProfile } from "./profile";
import { projects as rawProjects } from "./projects";
import {
  nowSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
  timelineItemSchema,
  type Localized,
  type Project,
  type TimelineItem,
  type TimelineKind,
} from "./schema";
import { skills as rawSkills } from "./skills";
import { timeline as rawTimeline } from "./timeline";

export type * from "./schema";

/** Parsed once at module load, so invalid content fails `next build`. */
export const profile = profileSchema.parse(rawProfile);
export const projects = z
  .array(projectSchema)
  .refine((list) => new Set(list.map((p) => p.slug)).size === list.length, "Duplicate slug")
  .parse(rawProjects);
export const skills = z.array(skillGroupSchema).parse(rawSkills);
export const now = nowSchema.parse(rawNow);
export const timeline = sortTimeline(z.array(timelineItemSchema).parse(rawTimeline));

export const featuredProjects = projects.filter((p) => p.tier === "featured");
export const otherProjects = projects.filter((p) => p.tier === "other");

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Previous/next navigation between case studies. */
export function getAdjacentCaseStudies(slug: string) {
  const list = projects.filter((p) => p.hasCaseStudy);
  const index = list.findIndex((p) => p.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  return { previous: list[index - 1], next: list[index + 1] };
}

export function filterTimeline(items: TimelineItem[], kind: TimelineKind | "all") {
  return kind === "all" ? items : items.filter((item) => item.kind === kind);
}

function isOngoing(item: TimelineItem): boolean {
  return (
    item.start === null || item.end === "present" || Boolean(item.endIsExpected || item.inProgress)
  );
}

/**
 * Ongoing items first (work before study before events), then everything
 * else newest first. A recruiter sees the current job before any course.
 */
export function sortTimeline(items: TimelineItem[]): TimelineItem[] {
  // Declared inside: `timeline` above is sorted at module load, before any top-level const below it.
  const KIND_ORDER: Record<TimelineKind, number> = { work: 0, study: 1, event: 2 };
  return [...items].sort((a, b) => {
    const ongoing = Number(isOngoing(b)) - Number(isOngoing(a));
    if (ongoing !== 0) return ongoing;
    if (isOngoing(a)) {
      const kind = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
      if (kind !== 0) return kind;
    }
    return (b.start ?? "").localeCompare(a.start ?? "");
  });
}

export { isTodo, TODO_PREFIX } from "./todo";

export function pick(value: Localized | string, locale: Locale): string {
  return typeof value === "string" ? value : value[locale];
}

import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import { about as rawAbout } from "./about";
import { gallery as rawGallery } from "./gallery";
import { now as rawNow } from "./now";
import { profile as rawProfile } from "./profile";
import { projects as rawProjects } from "./projects";
import {
  aboutSchema,
  gallerySchema,
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
export const gallery = z
  .array(gallerySchema)
  .min(3)
  .refine((list) => new Set(list.map((g) => g.id)).size === list.length, "Duplicate photo id")
  .parse(rawGallery);
export const timeline = sortTimeline(z.array(timelineItemSchema).parse(rawTimeline));
/** Every photo id and project slug the About page names must exist, or the build fails. */
export const about = aboutSchema
  .superRefine((page, ctx) => {
    for (const theme of page.themes) {
      for (const id of theme.photos)
        if (!gallery.some((photo) => photo.id === id))
          ctx.addIssue({ code: "custom", message: `About "${theme.id}": unknown photo "${id}"` });
      for (const slug of theme.projects)
        if (!projects.some((project) => project.slug === slug))
          ctx.addIssue({
            code: "custom",
            message: `About "${theme.id}": unknown project "${slug}"`,
          });
    }
  })
  .parse(rawAbout);

export const featuredProjects = projects.filter((p) => p.tier === "featured");
export const otherProjects = projects.filter((p) => p.tier === "other");

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Static params for /projects/[slug]: every project gets a page. */
export function projectParams(): { slug: string }[] {
  return projects.map((p) => ({ slug: p.slug }));
}

/** Previous/next project, wrapping around the list. */
export function getAdjacentProjects(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  const n = projects.length;
  return { previous: projects[(i - 1 + n) % n]!, next: projects[(i + 1) % n]! };
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

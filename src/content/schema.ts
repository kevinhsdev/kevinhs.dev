import { z } from "zod";

/**
 * Content schemas. Every piece of copy on the site lives in `src/content/*.ts`
 * and is validated here at build time, so a typo in a date or a missing
 * translation fails the build instead of shipping.
 *
 * Missing facts are written as strings that start with `TODO(kevin):` — they
 * render highlighted on the site and are listed by `npm run todos`.
 */

export const localized = z.object({
  pt: z.string().min(1),
  en: z.string().min(1),
});
export type Localized = z.infer<typeof localized>;

/** `2025`, or `2025-08`. */
const partialDate = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, "Use YYYY or YYYY-MM");

const sitePath = z.string().startsWith("/");

export const profileSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  role: localized,
  headline: localized,
  /** The headline without the role, for layouts that show the role separately. */
  tagline: localized,
  proof: localized,
  stackLine: z.string(),
  interests: localized,
  exploring: z.array(z.union([z.string(), localized])),
  status: localized,
  location: localized,
  address: z.object({
    locality: z.string(),
    region: z.string(),
    country: z.string().length(2),
  }),
  email: z.email(),
  links: z.object({
    github: z.url(),
    linkedin: z.url(),
    siteRepo: z.url(),
  }),
  cv: z.object({
    pt: sitePath,
    en: sitePath.nullable(),
  }),
  photo: z.object({ src: sitePath, alt: localized }).nullable(),
  languages: z.array(
    z.object({
      code: z.string().min(2),
      name: localized,
      level: localized,
    }),
  ),
  about: z.array(localized).min(1).max(4),
  education: z.object({ school: z.string(), schoolUrl: z.url() }),
});
export type Profile = z.infer<typeof profileSchema>;

export const timelineKinds = ["work", "study", "event"] as const;
export type TimelineKind = (typeof timelineKinds)[number];

export const timelineItemSchema = z.object({
  id: z.string(),
  kind: z.enum(timelineKinds),
  title: localized,
  org: z.string(),
  location: localized.optional(),
  /** `null` when the start date is unknown but the item is ongoing. */
  start: partialDate.nullable(),
  end: z.union([partialDate, z.literal("present")]).optional(),
  endIsExpected: z.boolean().optional(),
  inProgress: z.boolean().optional(),
  highlights: z.array(localized).default([]),
  /** Course topics, shown as a terminal in the journey card when there is no photo. */
  topics: z.array(localized).optional(),
  /** Issuer logo (single color, transparent) for that terminal's title bar. */
  logo: z.object({ src: sitePath, alt: z.string() }).optional(),
  /** Optional photo for the journey section (put the file in /public/journey). No people without consent. */
  image: z
    .object({
      src: sitePath,
      alt: localized,
      /** CSS object-position: where the photo's focus is when it gets cropped (default center). */
      focus: z.string().optional(),
    })
    .optional(),
});
export type TimelineItem = z.infer<typeof timelineItemSchema>;

export const projectStatuses = [
  "in-use",
  "live",
  "evolving",
  "in-development",
  "academic",
] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const metricSchema = z.object({
  value: z.string(),
  label: localized,
});
export type Metric = z.infer<typeof metricSchema>;

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  tier: z.enum(["featured", "other"]),
  status: z.enum(projectStatuses),
  year: z.number().int().min(2020),
  tagline: localized,
  summary: localized,
  /** One bold line for cards, e.g. "3× more documents a day". */
  impact: localized.optional(),
  role: localized.optional(),
  teamSize: z.number().int().positive().optional(),
  metrics: z.array(metricSchema).default([]),
  highlights: z.array(localized).default([]),
  stack: z.array(z.string()).min(1),
  links: z
    .object({
      repo: z.url().optional(),
      demo: z.url().optional(),
      video: z.union([z.url(), z.literal("TODO")]).optional(),
    })
    .default({}),
  /** Source code is not public (school systems). */
  privateCode: z.boolean().default(false),
  hasCaseStudy: z.boolean().default(false),
});
export type Project = z.infer<typeof projectSchema>;

export const skillTiers = ["daily", "experienced", "learning", "concepts"] as const;
export type SkillTier = (typeof skillTiers)[number];

export const skillGroupSchema = z.object({
  tier: z.enum(skillTiers),
  /** Proper names stay as plain strings; generic terms are translated. */
  items: z.array(z.union([z.string(), localized])).min(1),
});
export type SkillGroup = z.infer<typeof skillGroupSchema>;

export const nowSchema = z.object({
  updatedAt: partialDate,
  learning: z.array(localized).min(1),
  building: z.array(localized).min(1),
});
export type Now = z.infer<typeof nowSchema>;

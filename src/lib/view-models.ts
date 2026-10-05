import "server-only";
import { getTranslations } from "next-intl/server";
import { isTodo, pick, timeline, type TimelineKind } from "@/content";
import type { Locale } from "@/i18n/routing";
import { formatPeriod } from "./period";

/*
 * Content shaped for client components: localized, plain data only, so the
 * browser never downloads the content layer or Zod. Shared by all versions.
 */

export type TimelineEntry = {
  id: string;
  kind: TimelineKind;
  /** "2025-08", "2026" or null when ongoing without a known start. */
  start: string | null;
  period: string;
  title: string;
  org: string;
  location?: string;
  highlights: string[];
  isTodo: boolean;
  image?: { src: string; alt: string; focus?: string };
  topics: string[];
  logo?: { src: string; srcDark?: string; alt: string };
  /** Still in progress (no start date and flagged, or an open-ended item). */
  ongoing: boolean;
};

export async function getTimelineEntries(locale: Locale): Promise<TimelineEntry[]> {
  const t = await getTranslations({ locale, namespace: "timeline" });
  const labels = { present: t("present"), inProgress: t("inProgress"), expected: t("expected") };
  return timeline.map((item) => {
    const title = pick(item.title, locale);
    return {
      id: item.id,
      kind: item.kind,
      start: item.start,
      period: formatPeriod(item, locale, labels),
      title,
      org: item.org,
      location: item.location && pick(item.location, locale),
      highlights: item.highlights.map((highlight) => pick(highlight, locale)),
      isTodo: isTodo(title),
      image: item.image && {
        src: item.image.src,
        alt: pick(item.image.alt, locale),
        focus: item.image.focus,
      },
      topics: (item.topics ?? []).map((topic) => pick(topic, locale)),
      logo: item.logo,
      ongoing: Boolean(item.inProgress) || item.end === "present",
    };
  });
}

/**
 * The journey reads oldest → newest (git log --reverse). Ongoing items without
 * a start date (bootcamps, the AWS certification) close it, in content order.
 */
export function toJourney(entries: TimelineEntry[]): TimelineEntry[] {
  const dated = entries.filter((entry) => entry.start !== null);
  const open = entries.filter((entry) => entry.start === null);
  dated.sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));
  const order = new Map(timeline.map((item, index) => [item.id, index]));
  open.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return [...dated, ...open];
}

export async function getTimelineKindLabels(locale: Locale): Promise<Record<TimelineKind, string>> {
  const t = await getTranslations({ locale, namespace: "timeline.filters" });
  return { work: t("work"), study: t("study"), event: t("event") };
}

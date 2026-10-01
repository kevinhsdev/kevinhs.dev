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
  period: string;
  title: string;
  org: string;
  location?: string;
  highlights: string[];
  isTodo: boolean;
};

export async function getTimelineEntries(locale: Locale): Promise<TimelineEntry[]> {
  const t = await getTranslations({ locale, namespace: "timeline" });
  const labels = { present: t("present"), inProgress: t("inProgress"), expected: t("expected") };
  return timeline.map((item) => {
    const title = pick(item.title, locale);
    return {
      id: item.id,
      kind: item.kind,
      period: formatPeriod(item, locale, labels),
      title,
      org: item.org,
      location: item.location && pick(item.location, locale),
      highlights: item.highlights.map((highlight) => pick(highlight, locale)),
      isTodo: isTodo(title),
    };
  });
}

export async function getTimelineFilterLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "timeline.filters" });
  return { all: t("all"), work: t("work"), study: t("study"), event: t("event") };
}

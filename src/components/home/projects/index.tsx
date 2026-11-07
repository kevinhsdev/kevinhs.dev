import { getTranslations } from "next-intl/server";
import { featuredProjects, otherProjects, pick } from "@/content";
import type { Locale } from "@/i18n/routing";
import { ProjectsView, type Card, type Other } from "./view";
import "./projects.css";

/** The 7 projects, each exactly once: the 3 featured as film panels, then a panel with the other 4. */
export async function HomeProjects({ locale }: { locale: Locale }) {
  const t = await getTranslations("projects");
  const cards: Card[] = featuredProjects.map((p, i) => ({
    slug: p.slug,
    index: String(i + 1).padStart(2, "0"),
    title: p.title,
    meta: `${t(`status.${p.status}`)} · ${p.year}`,
    tagline: pick(p.tagline, locale),
    summary: pick(p.summary, locale),
    year: p.year,
    stack: p.stack,
    metrics: p.metrics.map((m) => ({ value: m.value, label: pick(m.label, locale) })),
    metric: p.metrics[0]
      ? { value: p.metrics[0].value, label: pick(p.metrics[0].label, locale) }
      : undefined,
    impact: p.impact ? pick(p.impact, locale) : undefined,
    // TODO(kevin): a screenshot for projects without a presentation (blood-bank).
    poster: p.presentation?.poster,
    video: p.presentation?.src,
  }));
  const others: Other[] = otherProjects.map((p) => ({
    slug: p.slug,
    title: p.title,
    tagline: pick(p.tagline, locale),
    year: p.year,
  }));
  return (
    <ProjectsView
      cards={cards}
      others={others}
      labels={{ title: t("title"), other: t("other"), open: t("open") }}
    />
  );
}

import { getTranslations } from "next-intl/server";
import { featuredProjects, otherProjects, pick } from "@/content";
import type { Locale } from "@/i18n/routing";
import { ProjectsView, type Card } from "./view";
import "./projects.css";

/** The 7 projects as media cards: featured first, the ones with a video lead the grid. */
export async function HomeProjects({ locale }: { locale: Locale }) {
  const t = await getTranslations("projects");
  const cards: Card[] = [...featuredProjects, ...otherProjects].map((p, i) => ({
    slug: p.slug,
    index: String(i + 1).padStart(2, "0"),
    title: pick(p.title, locale),
    status: t(`status.${p.status}`),
    year: p.year,
    tagline: pick(p.tagline, locale),
    stack: p.stack.slice(0, 4),
    metric: p.metrics[0]
      ? { value: p.metrics[0].value, label: pick(p.metrics[0].label, locale) }
      : undefined,
    // TODO(kevin): screenshots for blood-bank, oase-lar and finance-api.
    poster: p.teaser?.poster ?? p.presentation?.poster ?? p.cover,
    video: p.teaser?.src ?? p.presentation?.src,
  }));
  return (
    <ProjectsView
      cards={cards}
      labels={{
        title: t("title"),
        open: t("open"),
        count: t("count", { n: cards.length }),
        soon: t("soon"),
        other: t("other"),
      }}
    />
  );
}

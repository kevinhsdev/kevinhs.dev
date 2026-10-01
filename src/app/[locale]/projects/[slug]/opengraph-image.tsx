import { getTranslations } from "next-intl/server";
import { getProject, pick } from "@/content";
import { routing } from "@/i18n/routing";
import { caseStudySlugs } from "@/lib/case-studies";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Case study · Kevin Henrique";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => caseStudySlugs.map((slug) => ({ locale, slug })));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = raw === "en" ? "en" : "pt";
  const project = getProject(slug);
  const t = await getTranslations({ locale, namespace: "caseStudy" });

  return renderOgImage({
    kicker: t("kicker"),
    title: project?.title ?? "Kevin Henrique",
    subtitle: project ? pick(project.tagline, locale) : "",
    footer: project ? project.stack.slice(0, 4).join(" · ") : "",
  });
}

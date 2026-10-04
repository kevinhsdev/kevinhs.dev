import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CreativeHeader } from "@/components/creative/hero";
import { CreativeMotion } from "@/components/creative/motion";
import { CreativeFooter } from "@/components/creative/sections";
import { CreativeShell } from "@/components/creative/shell";
import { RegisterCommandNavigation } from "@/components/shared/command-menu";
import { CtaDock } from "@/components/shared/cta-dock";
import { hasMockup, mockups } from "@/components/shared/mockups";
import { SiteMenu } from "@/components/shared/site-menu";
import { getAdjacentCaseStudies, getProject, pick, profile } from "@/content";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { caseStudySlugs, loadCaseStudy, readingMinutes } from "@/lib/case-studies";
import { HOME_PATH } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const t = await getTranslations({
    locale: locale === "en" ? "en" : "pt",
    namespace: "caseStudy",
  });
  const title = `${project.title} · ${t("kicker")}`;
  const description = pick(project.tagline, locale === "en" ? "en" : "pt");
  return {
    title,
    description,
    openGraph: {
      type: "article",
      siteName: profile.fullName,
      locale: locale === "en" ? "en_US" : "pt_BR",
      title,
      description,
    },
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: { "pt-BR": `/pt/projects/${slug}`, en: `/en/projects/${slug}` },
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.hasCaseStudy) notFound();

  const t = await getTranslations();
  const Content = await loadCaseStudy(slug, locale);
  const minutes = readingMinutes(slug, locale);
  const { previous, next } = getAdjacentCaseStudies(slug);
  const index = caseStudySlugs.indexOf(slug) + 1;
  const Mockup = hasMockup(slug) ? mockups[slug] : null;

  const meta = [
    { label: t("caseStudy.role"), value: project.role ? pick(project.role, locale) : "—" },
    {
      label: t("caseStudy.team"),
      value: project.teamSize
        ? t("projects.team", { count: project.teamSize })
        : t("caseStudy.solo"),
    },
    { label: t("caseStudy.year"), value: String(project.year) },
    { label: t("caseStudy.status"), value: t(`projects.status.${project.status}`) },
  ];

  return (
    <CreativeShell>
      <CreativeMotion>
        <RegisterCommandNavigation
          items={[
            { label: t("caseStudy.back"), href: `${HOME_PATH}#projects` },
            { label: t("nav.contact"), href: `${HOME_PATH}#contact` },
          ]}
        />
        <CreativeHeader />
        <main id="main">
          <header id="hero" className="flex flex-col gap-8 px-4 pt-28 pb-12 sm:px-8 sm:pt-32">
            <Link
              href={`${HOME_PATH}#projects`}
              className="inline-flex min-h-11 items-center gap-2 self-start font-mono text-xs tracking-widest text-muted uppercase transition-colors duration-150 hover:text-foreground"
            >
              <ArrowLeft aria-hidden className="size-4" />
              {t("caseStudy.back")}
            </Link>

            <div className="flex flex-col gap-4">
              <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tracking-widest uppercase">
                <span className="text-accent">
                  {t("caseStudy.kicker")} · {String(index).padStart(2, "0")} /{" "}
                  {String(caseStudySlugs.length).padStart(2, "0")}
                </span>
                <span className="text-muted">{t("caseStudy.readingTime", { minutes })}</span>
              </p>
              <h1 className="font-display text-[clamp(3.5rem,11vw,10rem)]">{project.title}</h1>
              <p className="max-w-3xl text-xl text-pretty text-muted sm:text-2xl">
                {pick(project.tagline, locale)}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-5">
              {meta.map((item) => (
                <div key={item.label} className="flex flex-col gap-1 bg-background p-4">
                  <dt className="font-mono text-[11px] tracking-widest text-muted uppercase">
                    {item.label}
                  </dt>
                  <dd className="text-sm font-medium">{item.value}</dd>
                </div>
              ))}
              <div className="col-span-2 flex flex-col gap-1 bg-background p-4 lg:col-span-1">
                <dt className="font-mono text-[11px] tracking-widest text-muted uppercase">
                  {t("caseStudy.stack")}
                </dt>
                <dd className="text-sm font-medium">{project.stack.join(" · ")}</dd>
              </div>
            </dl>
          </header>

          {Mockup && (
            <div className="px-4 sm:px-8" data-reveal>
              <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-surface p-4 sm:p-10">
                <Mockup
                  label={t("projects.mockupAlt", { title: project.title })}
                  demoNote={t("projects.demoNote")}
                />
              </div>
            </div>
          )}

          <article className="case-study mx-auto max-w-3xl px-4 py-16 sm:py-24">
            <Content />
          </article>

          <nav
            aria-label={t("caseStudy.sections")}
            className="grid gap-px border-y border-border bg-border sm:grid-cols-2"
          >
            {[
              { item: previous, label: t("caseStudy.previous"), icon: "prev" as const },
              { item: next, label: t("caseStudy.next"), icon: "next" as const },
            ].map(({ item, label, icon }) =>
              item ? (
                <Link
                  key={icon}
                  href={`/projects/${item.slug}`}
                  className={`group flex flex-col gap-2 bg-background px-4 py-10 transition-colors duration-200 hover:bg-surface sm:px-8 ${icon === "next" ? "sm:items-end sm:text-right" : ""}`}
                >
                  <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-muted uppercase">
                    {icon === "prev" && <ArrowLeft aria-hidden className="size-4" />}
                    {label}
                    {icon === "next" && <ArrowRight aria-hidden className="size-4" />}
                  </span>
                  <span className="font-display text-4xl transition-colors duration-200 group-hover:text-accent sm:text-6xl">
                    {item.title}
                  </span>
                </Link>
              ) : (
                <span key={icon} aria-hidden className="hidden bg-background sm:block" />
              ),
            )}
          </nav>
        </main>
        <CreativeFooter locale={locale} updatedAt={new Date()} />
        <SiteMenu linkClassName="font-display text-5xl sm:text-6xl" />
        <CtaDock
          watch={["hero", "site-footer"]}
          source="case-study-dock"
          itemClassName="bg-surface text-foreground ring-1 ring-border hover:bg-accent hover:text-accent-contrast"
        />
      </CreativeMotion>
    </CreativeShell>
  );
}

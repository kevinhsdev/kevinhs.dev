import { ArrowLeft, ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Metrics } from "@/components/project/metrics";
import { loadCaseStudy } from "@/components/project/case-study";
import { SiteFooter } from "@/components/shell/footer";
import { ShaderStage } from "@/components/stage/shader-stage";
import { getAdjacentProjects, getProject, pick, projectParams } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import "@/components/project/project.css";

export const dynamicParams = false;
export const generateStaticParams = projectParams;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: `${p.title} · Kevin Henrique`, description: pick(p.tagline, locale as Locale) };
}

const pill =
  "inline-flex h-12 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:py-24">
      <h2 id={id} className="mb-8 font-mono text-sm tracking-widest text-muted uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * A project: Tipos header → presentation video → the problem → what was built (the case
 * study when there is one) → numbers → stack → links → previous/next.
 */
export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale: raw, slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  setRequestLocale(raw);
  const locale = raw as Locale;
  const t = await getTranslations("project");
  const tp = await getTranslations("projects");
  const CaseStudy = p.hasCaseStudy ? await loadCaseStudy(slug, locale) : null;
  const { previous, next } = getAdjacentProjects(slug);

  const problem = (
    <Section id="problem" title={t("problem")}>
      <p className="max-w-3xl text-2xl leading-snug text-pretty sm:text-3xl">
        {pick(p.summary, locale)}
      </p>
    </Section>
  );

  return (
    <>
      <main id="main">
        <ShaderStage kind="tipos" as="section" aria-labelledby="project-title" className="dark">
          <div className="mx-auto flex min-h-[78svh] max-w-7xl flex-col justify-end gap-6 px-5 pt-32 pb-16 sm:px-8">
            <Link
              href="/#projects"
              className="inline-flex w-fit items-center gap-2 text-sm text-[var(--stage-muted)] hover:text-accent-strong"
            >
              <ArrowLeft aria-hidden className="size-4" /> {t("back")}
            </Link>
            <p className="font-mono text-xs tracking-widest text-accent-strong uppercase">
              {tp(`status.${p.status}`)} · {p.year}
            </p>
            <h1
              id="project-title"
              className="font-display text-[clamp(3.5rem,11vw,10rem)] leading-[0.88] text-balance text-[var(--stage-ink)] uppercase"
            >
              {p.title}
            </h1>
            <p className="max-w-2xl text-lg text-[var(--stage-muted)] sm:text-xl">
              {pick(p.tagline, locale)}
            </p>
            {(p.role || p.teamSize) && (
              <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3 text-sm text-[var(--stage-muted)]">
                {p.role && (
                  <div className="max-w-md">
                    <dt className="font-mono text-xs tracking-widest uppercase">{t("role")}</dt>
                    <dd className="mt-1 text-[var(--stage-ink)]">{pick(p.role, locale)}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-mono text-xs tracking-widest uppercase">{t("year")}</dt>
                  <dd className="mt-1 text-[var(--stage-ink)]">
                    {p.year} ·{" "}
                    {p.teamSize && p.teamSize > 1 ? t("team", { count: p.teamSize }) : t("solo")}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </ShaderStage>

        {p.presentation ? (
          <figure className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 lg:pt-24">
            <video
              src={p.presentation.src}
              poster={p.presentation.poster}
              controls
              playsInline
              preload="none"
              className="aspect-video w-full rounded-3xl border border-border bg-surface object-cover"
            />
            <figcaption className="mt-3 font-mono text-xs text-muted">
              {t("video", { title: p.title })} · {p.presentation.duration} · {t("videoNote")}
            </figcaption>
          </figure>
        ) : null}

        {problem}

        {(CaseStudy || p.highlights.length > 0) && (
          <Section id="built" title={t("built")}>
            {CaseStudy ? (
              <div className="case-study max-w-3xl">
                <CaseStudy />
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {p.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="rounded-3xl border border-border bg-surface p-6 leading-relaxed"
                  >
                    <span className="mb-3 block font-mono text-xs text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {pick(h, locale)}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {p.metrics.length > 0 && (
          <Section id="metrics" title={t("metrics")}>
            <Metrics
              items={p.metrics.map((m) => ({ value: m.value, label: pick(m.label, locale) }))}
            />
          </Section>
        )}

        <Section id="stack" title={t("stack")}>
          <ul className="flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <li key={s} className="rounded-full border border-border px-4 py-2 text-sm">
                {s}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="links" title={t("links")}>
          <div className="flex flex-wrap gap-3">
            {p.links.repo && (
              <a href={p.links.repo} target="_blank" rel="noopener noreferrer" className={pill}>
                {tp("repo")} <ArrowUpRight aria-hidden className="size-4" />
              </a>
            )}
            {p.links.demo && (
              <a href={p.links.demo} target="_blank" rel="noopener noreferrer" className={pill}>
                {tp("demo")} <ArrowUpRight aria-hidden className="size-4" />
              </a>
            )}
            {p.privateCode && (
              <p className="inline-flex items-center gap-2 text-sm text-muted">
                <Lock aria-hidden className="size-4" /> {tp("privateCode")}
              </p>
            )}
          </div>
        </Section>

        <nav
          aria-label={`${t("previous")} / ${t("next")}`}
          className="mx-auto grid max-w-7xl gap-px border-y border-border bg-border sm:grid-cols-2"
        >
          {[
            { p: previous, label: t("previous"), Icon: ArrowLeft, end: false },
            { p: next, label: t("next"), Icon: ArrowRight, end: true },
          ].map(({ p: q, label, Icon, end }) => (
            <Link
              key={label}
              href={`/projects/${q.slug}`}
              className={`group flex flex-col gap-2 bg-background px-5 py-10 transition-colors hover:text-accent sm:px-8 ${end ? "sm:items-end sm:text-right" : ""}`}
            >
              <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-muted uppercase">
                {!end && <Icon aria-hidden className="size-4" />}
                {label}
                {end && <Icon aria-hidden className="size-4" />}
              </span>
              <span className="font-display text-3xl uppercase sm:text-5xl">{q.title}</span>
            </Link>
          ))}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}

import { ArrowLeft, ArrowRight, ArrowUpRight, Database, Lock, Terminal } from "lucide-react";
import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Logo } from "@/components/home/skills-view";
import { CaseToc } from "@/components/project/case-toc";
import { caseStudySections, loadCaseStudy } from "@/components/project/case-study";
import { Metrics } from "@/components/project/metrics";
import { GitHubIcon } from "@/components/shell/brand-icons";
import { SiteFooter } from "@/components/shell/footer";
import { VideoPlayer } from "@/components/project/video-player";
import { ShaderStage } from "@/components/stage/shader-stage";
import { getAdjacentProjects, getProject, pick, projectParams } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import "@/components/project/project.css";

const hand = Caveat({ variable: "--font-hand", weight: "600", subsets: ["latin"] });

export const dynamicParams = false;
export const generateStaticParams = projectParams;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: `${pick(p.title, locale as Locale)} · Kevin Henrique`,
    description: pick(p.tagline, locale as Locale),
  };
}

/** The logo of each stack item (the same files as the skills section); a plain icon when none exists. */
const STACK_LOGO: Record<string, { file: string; dark?: boolean }> = {
  "Node.js": { file: "nodejs" },
  "node:sqlite": { file: "sqlite", dark: true },
  JavaScript: { file: "javascript" },
  HTML: { file: "html" },
  CSS: { file: "css" },
  "Java 17": { file: "java" },
  "Java 25": { file: "java" },
  JDBC: { file: "jdbc" },
  "MySQL 8": { file: "mysql", dark: true },
  Maven: { file: "maven" },
  DAO: { file: "dao" },
  "Spring Boot": { file: "springboot" },
  "Spring Data JPA": { file: "spring" },
  Docker: { file: "docker", dark: true },
};
const STACK_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  PowerShell: Terminal,
  PostgreSQL: Database,
  "GitHub Pages": GitHubIcon,
};

function StackMark({ name }: { name: string }) {
  const logo = STACK_LOGO[name];
  if (logo) return <Logo logo={logo} className="pj-stack-logo" />;
  const Icon = STACK_ICON[name];
  return Icon ? <Icon aria-hidden className="pj-stack-logo text-accent" /> : null;
}

const pill =
  "inline-flex h-12 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent";

/** A numbered section with a big title that rises in as it scrolls into view. */
function Section({
  id,
  title,
  wide,
  children,
}: {
  id: string;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`pj-sec mx-auto px-5 py-20 sm:px-8 lg:py-28 ${wide ? "max-w-7xl" : "max-w-6xl"}`}
    >
      <h2 id={id} className="pj-sec-title">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * A project: Tipos header with the facts strip → the video, growing as it scrolls in → the
 * problem, lit word by word → what was built (the case study with its side index) → the
 * numbers → the stack rolling past → links → the next project, full screen.
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
  const sections = p.hasCaseStudy ? await caseStudySections(slug, locale) : [];
  const { previous, next } = getAdjacentProjects(slug);
  const title = pick(p.title, locale);
  const words = pick(p.summary, locale).split(" ");

  return (
    <>
      <div className="pj-progress" aria-hidden="true" />
      <main id="main" className="pj-main">
        <ShaderStage kind="tipos" as="section" aria-labelledby="project-title" className="dark">
          <div className="pj-hero-in mx-auto flex min-h-[86svh] max-w-7xl flex-col justify-end gap-6 px-5 pt-32 pb-12 sm:px-8">
            <Link
              href="/#projects"
              className="inline-flex w-fit items-center gap-2 text-sm text-[var(--stage-muted)] hover:text-accent-strong"
            >
              <ArrowLeft aria-hidden className="size-4" /> {t("back")}
            </Link>
            {/* the giant name, with the project's status written over it by hand */}
            <div className={`pj-title ${hand.variable}`}>
              <p className="pj-hand">{tp(`status.${p.status}`)}</p>
              <h1
                id="project-title"
                className="font-display text-[clamp(3.5rem,11vw,10rem)] leading-[0.88] text-balance text-[var(--stage-ink)] uppercase"
              >
                {title}
              </h1>
            </div>
            <p className="max-w-2xl text-lg text-[var(--stage-muted)] sm:text-xl">
              {pick(p.tagline, locale)}
            </p>
            {p.role && (
              <p className="max-w-2xl text-sm text-[var(--stage-muted)]">
                <span className="mr-2 font-mono text-xs tracking-widest uppercase">
                  {t("role")}
                </span>
                <span className="text-[var(--stage-ink)]">{pick(p.role, locale)}</span>
              </p>
            )}
            {/* the facts, in a strip like a driver's card */}
            <dl className="pj-facts">
              <div>
                <dt>{t("year")}</dt>
                <dd>{p.year}</dd>
              </div>
              <div>
                <dt>{t("teamLabel")}</dt>
                <dd>
                  {p.teamSize && p.teamSize > 1 ? t("team", { count: p.teamSize }) : t("solo")}
                </dd>
              </div>
              <div>
                <dt>{t("statusLabel")}</dt>
                <dd>{tp(`status.${p.status}`)}</dd>
              </div>
              <div>
                <dt>{t("stack")}</dt>
                <dd>{t("stackCount", { count: p.stack.length })}</dd>
              </div>
            </dl>
          </div>
        </ShaderStage>

        {(p.presentation || p.cover) && (
          <figure className="pj-media mx-auto max-w-[90rem] px-3 pt-10 sm:px-6 lg:pt-16">
            {p.presentation ? (
              <VideoPlayer
                src={p.presentation.src}
                title={title}
                duration={p.presentation.duration}
                label={t("video", { title })}
                cta={t("play")}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- static screenshot
              <img
                src={p.cover}
                alt={t("screenshot", { title })}
                className="aspect-video w-full bg-surface object-cover object-top"
              />
            )}
            {p.presentation && (
              <figcaption className="mt-3 px-2 font-mono text-xs text-muted">
                {t("video", { title })} · {p.presentation.duration} · {t("videoNote")}
              </figcaption>
            )}
          </figure>
        )}

        <Section id="problem" title={t("problem")}>
          {/* each word lights up as the paragraph scrolls past */}
          <p className="pj-lit">
            {words.map((w, i) => (
              <span key={i} style={{ "--p": i / words.length } as React.CSSProperties}>
                {w}{" "}
              </span>
            ))}
          </p>
        </Section>

        {(CaseStudy || p.highlights.length > 0) && (
          <Section id="built" title={t("built")} wide>
            {CaseStudy ? (
              <div className="pj-case">
                {sections.length > 1 && <CaseToc label={t("contents")} sections={sections} />}
                <div className="case-study max-w-3xl">
                  <CaseStudy />
                </div>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {p.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="pj-card rounded-3xl border border-border bg-surface p-6 leading-relaxed"
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
          <Section id="metrics" title={t("metrics")} wide>
            <Metrics
              items={p.metrics.map((m) => ({ value: m.value, label: pick(m.label, locale) }))}
            />
          </Section>
        )}

        <Section id="stack" title={t("stack")} wide>
          <ol className="pj-stack">
            {p.stack.map((s, i) => (
              <li key={s}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <StackMark name={s} />
                {s}
              </li>
            ))}
          </ol>
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

        {/* previous and next, side by side; the name slides and the arrow runs on hover */}
        <nav aria-label={`${t("previous")} / ${t("next")}`} className="pj-adj">
          {[
            { q: previous, k: t("previous"), dir: "prev" },
            { q: next, k: t("nextProject"), dir: "next" },
          ].map(({ q, k, dir }) => (
            <Link key={dir} href={`/projects/${q.slug}`} className="pj-adj-link" data-dir={dir}>
              <span className="pj-adj-k">
                {dir === "prev" && <ArrowLeft aria-hidden className="size-4" />}
                {k}
                {dir === "next" && <ArrowRight aria-hidden className="size-4" />}
              </span>
              <span className="pj-adj-name">{pick(q.title, locale)}</span>
              <span className="pj-adj-tag">{pick(q.tagline, locale)}</span>
            </Link>
          ))}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}

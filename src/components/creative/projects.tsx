import { ArrowRight, ArrowUpRight, Lock, PlayCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { hasMockup, mockups } from "@/components/shared/mockups";
import { Text } from "@/components/shared/text";
import { pick, type Project } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const link =
  "inline-flex min-h-11 items-center gap-1.5 font-mono text-xs tracking-widest uppercase transition-colors duration-150 hover:text-accent";

async function Links({ project }: { project: Project }) {
  const t = await getTranslations("projects");
  const readLabel = (await getTranslations("caseStudy"))("read");
  const { repo, demo, video } = project.links;
  return (
    <div className="flex flex-wrap items-center gap-x-6">
      {demo && (
        <a href={demo} target="_blank" rel="noopener noreferrer" className={link}>
          {t("demo")} <ArrowUpRight aria-hidden className="size-4" />
        </a>
      )}
      {repo && (
        <a href={repo} target="_blank" rel="noopener noreferrer" className={link}>
          {t("repo")} <ArrowUpRight aria-hidden className="size-4" />
        </a>
      )}
      {video === "TODO" && (
        <span className={cn(link, "text-muted")}>
          <PlayCircle aria-hidden className="size-4" />
          <Text>{`${t("video")} · TODO(kevin): link`}</Text>
        </span>
      )}
      {project.privateCode && (
        <span className={cn(link, "text-muted")}>
          <Lock aria-hidden className="size-3.5" />
          {t("privateCode")}
        </span>
      )}
      {project.hasCaseStudy && (
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 font-mono text-xs tracking-widest text-accent-contrast uppercase transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          {readLabel} <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  );
}

/** Featured projects as sticky cards that stack while scrolling (pure CSS; GSAP only adds the shrink). */
export async function StackedProjects({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const t = await getTranslations();

  return (
    <ol className="flex flex-col gap-6">
      {projects.map((project, index) => {
        const Mockup = hasMockup(project.slug) ? mockups[project.slug] : null;
        return (
          <li
            key={project.slug}
            data-stack-card
            className="sticky rounded-3xl border border-border bg-surface p-5 shadow-[0_-20px_60px_-30px_rgb(0_0_0/0.6)] sm:p-8 lg:min-h-[80vh]"
            style={{ top: `calc(5rem + ${index * 1.25}rem)` }}
          >
            <article className="grid h-full gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs tracking-widest text-muted uppercase">
                  <span className="text-accent">
                    {t("creative.project")} {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{t(`projects.status.${project.status}`)}</span>
                  <span>{project.year}</span>
                  {project.teamSize && (
                    <span>{t("projects.team", { count: project.teamSize })}</span>
                  )}
                </div>
                <h3 className="font-display text-6xl sm:text-8xl">{project.title}</h3>
                <p className="text-lg font-medium text-pretty">{pick(project.tagline, locale)}</p>
                {project.impact && (
                  <p className="text-xl font-semibold text-pretty text-accent">
                    {pick(project.impact, locale)}
                  </p>
                )}
                <p className="leading-relaxed text-pretty text-muted">
                  {pick(project.summary, locale)}
                </p>
                {project.metrics.length > 0 && (
                  <dl className="grid grid-cols-2 gap-4 border-y border-border py-4 sm:grid-cols-4">
                    {project.metrics.map((metric) => (
                      <div key={metric.value} className="flex flex-col gap-1">
                        <dt className="order-2 text-xs text-muted">{pick(metric.label, locale)}</dt>
                        <dd className="font-display order-1 text-4xl">{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <p className="font-mono text-xs text-muted">{project.stack.join(" · ")}</p>
                <Links project={project} />
              </div>
              {Mockup && (
                <Mockup
                  label={t("projects.mockupAlt", { title: project.title })}
                  demoNote={t("projects.demoNote")}
                  className="hidden sm:flex"
                />
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}

export async function CompactProjects({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const t = await getTranslations("projects");
  return (
    <ul className="divide-y divide-border border-y border-border">
      {projects.map((project) => (
        <li
          key={project.slug}
          data-reveal
          className="grid gap-3 py-6 lg:grid-cols-[1fr_1.4fr_auto] lg:gap-8"
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-4xl">{project.title}</h3>
            <span className="font-mono text-xs tracking-widest text-muted uppercase">
              {t(`status.${project.status}`)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">{pick(project.tagline, locale)}</p>
            <p className="text-sm leading-relaxed text-pretty text-muted">
              <Text>{pick(project.summary, locale)}</Text>
            </p>
            {project.impact && (
              <p className="text-sm font-semibold text-accent">{pick(project.impact, locale)}</p>
            )}
            <p className="font-mono text-xs text-muted">{project.stack.join(" · ")}</p>
          </div>
          <Links project={project} />
        </li>
      ))}
    </ul>
  );
}

import { ArrowRight, ArrowUpRight, FolderGit2, Lock, PlayCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { hasMockup, mockups } from "@/components/shared/mockups";
import { Text } from "@/components/shared/text";
import { pick, type Project } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { stackLogo } from "./skill-marks";
import { TechLogo } from "./tech-logo";

const link =
  "inline-flex min-h-11 items-center gap-1.5 font-mono text-xs tracking-widest uppercase transition-colors duration-150 hover:text-accent";

/** `hidePrivate`: the caller already says the code is private (the repo cards' badge). */
async function Links({ project, hidePrivate }: { project: Project; hidePrivate?: boolean }) {
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
      {project.privateCode && !hidePrivate && (
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
            className="sticky rounded-3xl border border-border bg-surface p-5 shadow-[0_-20px_60px_-30px_rgb(0_0_0/0.6)] sm:p-8 lg:flex lg:min-h-[80vh] lg:flex-col lg:justify-center lg:p-12"
            style={{ top: `calc(5rem + ${index * 1.25}rem)` }}
          >
            <article className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs tracking-widest text-muted uppercase">
                  <span className="text-accent">{t(`projects.status.${project.status}`)}</span>
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
    // One grid for the whole list (rows are subgrids), so every column lines up.
    <ul className="grid border-y border-border lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto] lg:gap-x-12">
      {projects.map((project) => (
        <li
          key={project.slug}
          data-reveal
          className="grid gap-3 border-border py-8 not-first:border-t lg:col-span-3 lg:grid-cols-subgrid lg:items-start"
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

/** "https://github.com/kevinhsdev/AMATUS" → "kevinhsdev/AMATUS". */
const repoPath = (url: string) => new URL(url).pathname.replace(/^\/|\/$/g, "");

/**
 * The other projects as GitHub-style pinned repositories: the repo path (or a
 * "private" badge for the school's systems), what it is, its stack with the
 * same logos as the Skills section, and its status and links. Two columns from
 * md, one on phones.
 */
export async function RepoCards({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const t = await getTranslations("projects");
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {projects.map((project) => {
        const live = project.status === "live" || project.status === "in-use";
        return (
          <li
            key={project.slug}
            data-reveal
            className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-6 transition-colors duration-200 hover:border-foreground/30 sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 font-mono text-xs text-muted">
              <span className="flex min-w-0 items-center gap-2">
                <FolderGit2 aria-hidden className="size-4 shrink-0 text-accent" />
                <span className="truncate">
                  {project.links.repo ? repoPath(project.links.repo) : project.slug}
                </span>
              </span>
              {project.privateCode && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-0.5">
                  <Lock aria-hidden className="size-3" />
                  {t("private")}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display text-4xl">{project.title}</h3>
              <p className="font-medium text-pretty">{pick(project.tagline, locale)}</p>
              {project.impact && (
                <p className="text-sm font-semibold text-pretty text-accent">
                  {pick(project.impact, locale)}
                </p>
              )}
            </div>

            <p className="line-clamp-4 text-sm leading-relaxed text-pretty text-muted">
              <Text>{pick(project.summary, locale)}</Text>
            </p>

            <ul className="mt-auto flex flex-wrap gap-2">
              {project.stack.map((name) => {
                const logo = stackLogo(name);
                return (
                  <li
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-mono text-xs"
                  >
                    {logo && <TechLogo logo={logo.logo} dark={logo.dark} className="size-3.5" />}
                    {name}
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-4">
              <span className="inline-flex items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className={cn("size-2 rounded-full", live ? "bg-positive" : "bg-accent")}
                />
                {t(`status.${project.status}`)}
              </span>
              <Links project={project} hidePrivate />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

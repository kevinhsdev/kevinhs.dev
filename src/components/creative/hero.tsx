import { getTranslations } from "next-intl/server";
import { LinkedInIcon } from "@/components/shared/brand-icons";
import { CommandMenuButton } from "@/components/shared/command-menu-button";
import { CopyEmailButton, CvButton, LinkedInButton } from "@/components/shared/ctas";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { KevinMark } from "@/components/shared/logo";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { getProject, pick, profile } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { HOME_PATH } from "@/lib/site";
import { cn } from "@/lib/utils";
import { HeroEditor } from "./hero-editor";
import { HeroShader } from "./hero-shader";
import { MenuButton } from "./menu-button";

export const creativeButton = {
  primary:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold tracking-wide text-accent-contrast uppercase transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97]",
  secondary:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-foreground/25 px-6 text-sm font-semibold tracking-wide uppercase transition-[scale,border-color] duration-150 ease-out hover:border-foreground active:scale-[0.97]",
};

export async function CreativeHeader() {
  const t = await getTranslations();
  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-8"
      data-print="hide"
    >
      {/* Small and discreet: the K, then "© Code by Kevin" rolling to the full name on hover. */}
      <Link
        href={HOME_PATH}
        className="roll h-11 rounded-full bg-background/70 px-4 text-sm font-medium backdrop-blur-md"
      >
        <KevinMark className="h-3.5 w-auto shrink-0 text-accent" />
        <span className="roll-text">
          <span className="roll-a flex h-11 items-center">{t("creative.codeBy")}</span>
          <span aria-hidden className="roll-b flex h-11 items-center">
            {profile.fullName}
          </span>
        </span>
        <span className="sr-only"> · {t("nav.home")}</span>
      </Link>
      <div
        className="flex items-center rounded-full bg-background/70 px-1 backdrop-blur-md"
        role="toolbar"
        aria-label={t("nav.toolbar")}
      >
        <CommandMenuButton />
        <LocaleToggle />
        <ThemeToggle />
        <MenuButton label={t("menu.title")} />
      </div>
    </header>
  );
}

const STRIP = [
  { project: "pdf-renamer", metric: 0 },
  { project: "pdf-renamer", metric: 1 },
  { project: "sek", metric: 0 },
  { project: "sek", metric: 1 },
];

/**
 * Hero: the name in giant type with the CTAs on one side, and a code editor
 * that types Kevin's profile out as a TypeScript object on the other. The name,
 * role and CTAs are in the HTML and visible on the first frame; the editor is
 * the show. The telemetry strip below carries the proof.
 */
export async function CreativeHero({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const [firstName, ...lastNames] = profile.name.split(" ");
  const strip = STRIP.flatMap(({ project: slug, metric: index }) => {
    const project = getProject(slug);
    const metric = project?.metrics[index];
    return project && metric ? [{ project, metric }] : [];
  });

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-dvh flex-col justify-between gap-10 overflow-hidden px-4 pt-24 pb-6 sm:px-8"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_80%_110%,color-mix(in_srgb,var(--accent)_28%,transparent),transparent_60%)]"
      >
        <HeroShader />
        <div className="grain absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge className="border-foreground/15 bg-background/60 backdrop-blur" />
        <span className="font-mono text-xs tracking-widest text-muted uppercase">
          {t("creative.kicker")}
        </span>
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-6 lg:col-span-6 xl:col-span-7">
          <h1
            id="hero-title"
            className="font-display text-[clamp(3.5rem,21vw,7.5rem)] lg:text-[clamp(5rem,9.5vw,10.5rem)]"
          >
            <span className="mask-line block overflow-hidden pb-[0.04em]">
              <span className="hero-rise" style={{ ["--i" as string]: 0 }}>
                {firstName}
              </span>
            </span>{" "}
            <span className="mask-line block overflow-hidden pb-[0.04em] text-accent">
              <span className="hero-rise" style={{ ["--i" as string]: 1 }}>
                {lastNames.join(" ")}
              </span>
            </span>
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold sm:text-2xl">{pick(profile.role, locale)}</p>
            <p className="max-w-xl text-lg text-pretty text-muted">
              {pick(profile.tagline, locale)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2" data-print="hide">
            <CvButton source="creative-hero" className={creativeButton.primary} />
            <LinkedInButton source="creative-hero" className={creativeButton.secondary}>
              <LinkedInIcon className="size-4" />
              {t("cta.linkedin")}
            </LinkedInButton>
            <CopyEmailButton source="creative-hero" className={creativeButton.secondary} />
          </div>
        </div>

        <div className="lg:col-span-6 xl:col-span-5">
          <HeroEditor locale={locale} />
        </div>
      </div>

      <dl
        aria-label={t("creative.telemetryStrip")}
        className="grid grid-cols-2 border-t border-foreground/15 lg:grid-cols-4"
      >
        {strip.map(({ project, metric }, index) => (
          <div
            key={`${project.slug}-${metric.value}`}
            className={cn(
              "flex flex-col gap-1 py-4 pr-4",
              index > 0 && "lg:border-l lg:border-foreground/15 lg:pl-6",
              index % 2 === 1 && "border-l border-foreground/15 pl-4 lg:pl-6",
            )}
          >
            <dt className="order-2 text-xs text-muted sm:text-sm">
              {pick(metric.label, locale)}
              <span className="block font-mono text-[10px] tracking-widest uppercase opacity-80">
                {project.title}
              </span>
            </dt>
            <dd className="font-display order-1 text-4xl text-accent sm:text-5xl">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export async function Marquee() {
  const t = await getTranslations("creative");
  const items = t.raw("marquee") as string[];
  const track = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="font-display flex items-center text-5xl sm:text-7xl">
          <span className="px-6">{item}</span>
          <span aria-hidden className="text-accent-contrast/50">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee overflow-hidden bg-accent py-5 text-accent-contrast">
      <div className="marquee-track flex w-max">
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}

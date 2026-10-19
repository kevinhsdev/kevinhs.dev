import { getTranslations } from "next-intl/server";
import { InstagramIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { CommandMenuButton } from "@/components/shared/command-menu-button";
import {
  CopyEmailButton,
  CvButton,
  InstagramButton,
  LinkedInButton,
} from "@/components/shared/ctas";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { KevinMark } from "@/components/shared/logo";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { getProject, pick, profile, skills } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { HOME_PATH } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ArcadeHud, ArcadeScene, ArcadeWalker } from "./arcade";
import { HeroEditor } from "./hero-editor";
import { HeroShader } from "./hero-shader";
import { skillMarks, type SkillMark } from "./skill-marks";
import { TechLogo } from "./tech-logo";
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
        <KevinMark className="h-3.5 w-auto shrink-0 text-accent max-[30rem]:h-4" />
        <span className="roll-text max-[30rem]:sr-only">
          <span className="roll-a flex h-11 items-center whitespace-nowrap">
            {t("creative.codeBy")}
          </span>
          <span
            aria-hidden
            className="roll-b hidden h-11 items-center whitespace-nowrap pointer-fine:flex"
          >
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
 * that types Kevin's profile out as a Java builder on the other. The name,
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
        <ArcadeScene />
        <div className="grain absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge className="border-foreground/15 bg-background/60 backdrop-blur" />
        <ArcadeHud />
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
            <InstagramButton source="creative-hero" className={creativeButton.secondary}>
              <InstagramIcon className="size-4" />
              {t("cta.instagram")}
            </InstagramButton>
            <CopyEmailButton source="creative-hero" className={creativeButton.secondary} />
          </div>
        </div>

        <div className="lg:col-span-6 xl:col-span-5">
          <HeroEditor locale={locale} />
        </div>
      </div>

      {/* under the arcade theme the strip is a platform Kevin's sprite walks on */}
      <div className="px-platform relative">
        <ArcadeWalker />
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
      </div>
    </section>
  );
}

type MarqueeItem = { key: string; label: string; mark: SkillMark };

/** Two rows from the Skills list: technologies with their logo, then concepts with an icon. */
function marqueeRows(locale: Locale): [MarqueeItem[], MarqueeItem[]] {
  const all = skills.flatMap((group) =>
    group.items.map((item) => {
      const key = typeof item === "string" ? item : item.en;
      // "MySQL / SQL" → "MySQL": the strip only needs the short name
      return { key, label: pick(item, locale).split(" / ")[0], mark: skillMarks[key] };
    }),
  );
  const marked = all.filter((item): item is MarqueeItem => Boolean(item.mark));
  return [marked.filter((i) => "logo" in i.mark), marked.filter((i) => "icon" in i.mark)];
}

function MarqueeRow({
  items,
  label,
  reverse,
}: {
  items: MarqueeItem[];
  label: string;
  reverse?: boolean;
}) {
  const track = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-3 pr-3">
      {items.map(({ key, label: name, mark }) => (
        <li
          key={key}
          className="marquee-chip flex items-center gap-2.5 rounded-full border border-border bg-surface/60 py-2 pr-4 pl-3 text-[15px] font-medium whitespace-nowrap text-muted"
        >
          {"logo" in mark ? (
            <TechLogo logo={mark.logo} dark={mark.dark} className="marquee-logo size-5" />
          ) : (
            <mark.icon aria-hidden className="marquee-logo size-4 text-accent" strokeWidth={1.75} />
          )}
          <span>{name}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee-row overflow-hidden" role="group" aria-label={label}>
      <div className={cn("marquee-track flex w-max", reverse && "marquee-track-reverse")}>
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}

export function Marquee({ locale }: { locale: Locale }) {
  const [tech, concepts] = marqueeRows(locale);
  return (
    <section aria-label="Stack" className="marquee relative grid gap-3 border-y border-border py-6">
      <MarqueeRow items={tech} label={locale === "pt" ? "Tecnologias" : "Technologies"} />
      <MarqueeRow items={concepts} label={locale === "pt" ? "Conceitos" : "Concepts"} reverse />
    </section>
  );
}

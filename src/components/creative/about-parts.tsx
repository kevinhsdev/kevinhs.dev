import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { InstagramIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { RegisterCommandNavigation } from "@/components/shared/command-menu";
import {
  CopyEmailButton,
  CvButton,
  InstagramButton,
  LinkedInButton,
} from "@/components/shared/ctas";
import { CtaDock } from "@/components/shared/cta-dock";
import { SiteMenu } from "@/components/shared/site-menu";
import { Text } from "@/components/shared/text";
import { getProject, pick, profile } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { HOME_PATH } from "@/lib/site";
import { cn } from "@/lib/utils";
import { CreativeHeader, creativeButton } from "./hero";
import { CreativeMotion } from "./motion";
import { CreativeFooter } from "./sections";
import { CreativeShell } from "./shell";

/*
 * The pieces of the About me page, each fed by src/content/about.ts or
 * profile.ts: the page frame, the portrait, the fact sheet, project links and
 * the CTA buttons.
 */

/** Links to the case studies of the given project slugs. */
export async function ProjectLinks({ slugs, locale }: { slugs: string[]; locale: Locale }) {
  const t = await getTranslations("caseStudy");
  const projects = slugs.flatMap((slug) => getProject(slug) ?? []);
  if (projects.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`/projects/${project.slug}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-accent"
        >
          <span className="flex min-w-0 flex-col gap-1">
            <span className="font-display text-2xl">{project.title}</span>
            <span className="text-sm text-muted">{pick(project.tagline, locale)}</span>
          </span>
          <span className="sr-only">{t("read")}</span>
          <ArrowRight
            aria-hidden
            className="size-5 shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      ))}
    </div>
  );
}

/** The fact sheet, straight from profile.ts. */
export async function FactSheet({ locale, className }: { locale: Locale; className?: string }) {
  const t = await getTranslations("aboutPage.facts");
  const facts = [
    {
      label: t("started"),
      value: t("startedValue", { age: profile.startedCoding.age }),
      detail: pick(profile.startedCoding.how, locale),
    },
    { label: t("study"), value: profile.education.school, detail: pick(profile.role, locale) },
    { label: t("location"), value: pick(profile.location, locale) },
    {
      label: t("languages"),
      value: profile.languages.map((language) => pick(language.name, locale)).join(", "),
      detail: profile.languages
        .map((language) => `${language.code.toUpperCase()} ${pick(language.level, locale)}`)
        .join(" / "),
    },
  ];
  return (
    <dl
      className={cn(
        "grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col gap-1.5 bg-surface p-5">
          <dt className="font-mono text-xs text-accent">{fact.label}</dt>
          <dd className="flex flex-col gap-1">
            <span className="font-semibold text-pretty">{fact.value}</span>
            {fact.detail && <span className="text-sm text-pretty text-muted">{fact.detail}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export async function CtaButtons() {
  const t = await getTranslations("cta");
  return (
    <div className="flex flex-wrap gap-2" data-print="hide">
      <CvButton source="about-next" className={creativeButton.primary} />
      <LinkedInButton source="about-next" className={creativeButton.secondary}>
        <LinkedInIcon className="size-4" />
        {t("linkedin")}
      </LinkedInButton>
      <InstagramButton source="about-next" className={creativeButton.secondary}>
        <InstagramIcon className="size-4" />
        {t("instagram")}
      </InstagramButton>
      <CopyEmailButton source="about-next" className={creativeButton.secondary} />
    </div>
  );
}

/** Kevin's own photo, or a highlighted placeholder until it exists. */
export function Portrait({ locale, className }: { locale: Locale; className?: string }) {
  if (profile.photo) {
    return (
      <figure className={cn("m-0 overflow-hidden rounded-3xl border border-border", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photo.src}
          alt={pick(profile.photo.alt, locale)}
          className="size-full object-cover"
        />
      </figure>
    );
  }
  return (
    <div
      className={cn(
        "grid place-items-center rounded-3xl border border-dashed border-border p-6 text-center",
        className,
      )}
    >
      <Text className="text-sm">TODO(kevin): sua foto (public/foto.jpg em profile.photo)</Text>
    </div>
  );
}

/** The page frame: header, back link, the layout's own hero and body, footer and dock. */
export async function AboutFrame({
  locale,
  hero,
  children,
}: {
  locale: Locale;
  hero?: ReactNode;
  children: ReactNode;
}) {
  const t = await getTranslations();
  return (
    <CreativeShell>
      <CreativeMotion>
        <RegisterCommandNavigation
          items={[
            { label: t("nav.projects"), href: `${HOME_PATH}#projects` },
            { label: t("nav.experience"), href: `${HOME_PATH}#experience` },
            { label: t("nav.contact"), href: `${HOME_PATH}#contact` },
          ]}
        />
        <CreativeHeader />
        <main id="main" className="flex flex-col gap-12 pt-28 pb-24 sm:pt-32">
          <header id="hero" className="flex flex-col gap-6">
            <Link
              href={HOME_PATH}
              className="mx-4 inline-flex min-h-11 items-center gap-2 self-start font-mono text-xs tracking-widest text-muted uppercase transition-colors duration-150 hover:text-foreground sm:mx-8"
            >
              <ArrowLeft aria-hidden className="size-4" />
              {t("aboutPage.back")}
            </Link>
            {hero}
          </header>
          {children}
        </main>
        <CreativeFooter locale={locale} updatedAt={new Date()} />
        <SiteMenu linkClassName="font-display text-5xl sm:text-6xl" />
        <CtaDock
          watch={["hero", "site-footer"]}
          source="about-dock"
          itemClassName="bg-surface text-foreground ring-1 ring-border hover:bg-accent hover:text-accent-contrast"
        />
      </CreativeMotion>
    </CreativeShell>
  );
}

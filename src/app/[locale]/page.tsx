import { getTranslations } from "next-intl/server";
import { CreativeHeader, CreativeHero, Marquee } from "@/components/creative/hero";
import { CreativeMotion } from "@/components/creative/motion";
import { PrintSummary } from "@/components/creative/print-summary";
import { AboutTeaser } from "@/components/creative/about-teaser";
import {
  ArcadeRoom,
  CharacterSheet,
  JourneyMap,
  LevelSelect,
  SavePoints,
} from "@/components/creative/arcade";
import { Journey } from "@/components/creative/journey";
import { Preloader } from "@/components/creative/preloader";
import { SkillsExplorer } from "@/components/creative/skills-explorer";
import { RepoCards, StackedProjects } from "@/components/creative/projects";
import { Block, CreativeContact, CreativeFooter } from "@/components/creative/sections";
import { CreativeShell } from "@/components/creative/shell";
import { Statement } from "@/components/creative/statement";
import { RegisterCommandNavigation } from "@/components/shared/command-menu";
import { CtaDock } from "@/components/shared/cta-dock";
import { SiteMenu } from "@/components/shared/site-menu";
import { featuredProjects, otherProjects, pick, skills } from "@/content";
import { resolveLocale } from "@/i18n/locale";
import { getTimelineEntries, getTimelineKindLabels, toJourney } from "@/lib/view-models";

/** The home page. Metadata (title, canonical, hreflang) comes from the locale layout. */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations();
  const [entries, kindLabels] = await Promise.all([
    getTimelineEntries(locale),
    getTimelineKindLabels(locale),
  ]);

  const journey = toJourney(entries);

  const nav = [
    { label: t("nav.projects"), href: "#projects" },
    { label: t("nav.experience"), href: "#experience" },
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.skills"), href: "#skills" },
    { label: t("nav.contact"), href: "#contact" },
    { label: t("aboutPage.title"), href: "/about" },
    { label: t("nav.now"), href: "/now" },
  ];

  const levels = skills.map((group) => ({
    id: group.tier,
    label: t(`skills.tiers.${group.tier}`),
    items: group.items.map((item) => ({
      key: typeof item === "string" ? item : item.en,
      label: pick(item, locale),
    })),
  }));

  return (
    <CreativeShell>
      <CreativeMotion>
        <Preloader />
        <RegisterCommandNavigation items={nav} />
        <CreativeHeader />
        <PrintSummary locale={locale} />
        <main id="main" data-print="hide">
          <CreativeHero locale={locale} />
          <Marquee locale={locale} />
          <Statement />
          <CharacterSheet locale={locale} />

          <Block id="projects" title={t("nav.projects")}>
            <LevelSelect locale={locale} />
            <div data-arcade-hide className="flex flex-col gap-24">
              <StackedProjects projects={featuredProjects} locale={locale} />
              <div className="flex flex-col gap-6">
                <h3 className="font-mono text-xs tracking-widest text-muted uppercase">
                  {t("creative.otherProjects")}
                </h3>
                <RepoCards projects={otherProjects} locale={locale} />
              </div>
            </div>
          </Block>
          <ArcadeRoom />

          <Block id="experience" title={t("nav.experience")}>
            <JourneyMap
              levels={journey.map((entry) => ({
                id: entry.id,
                type: entry.kind,
                title: entry.title,
                org: entry.org,
                period: entry.period,
                kind: kindLabels[entry.kind],
                ongoing: entry.ongoing,
                highlights: entry.highlights.slice(0, 2),
              }))}
            />
            <div data-arcade-hide>
              <Journey
                entries={journey}
                labels={{
                  kinds: kindLabels,
                  inProgress: t("timeline.inProgress"),
                  done: t("timeline.done"),
                  region: t("nav.experience"),
                }}
              />
            </div>
          </Block>

          <Block id="about" title={t("nav.about")}>
            <AboutTeaser locale={locale} />
          </Block>
          <SavePoints locale={locale} />

          <Block id="skills" title={t("nav.skills")}>
            <SkillsExplorer
              levels={levels}
              label={t("creative.skillsLabel")}
              hint={t("creative.skillsHint")}
            />
          </Block>

          <CreativeContact />
        </main>
        <CreativeFooter locale={locale} updatedAt={new Date()} />
        <SiteMenu linkClassName="font-display text-5xl sm:text-6xl" />
        <CtaDock
          watch={["hero", "contact", "site-footer"]}
          source="creative-dock"
          itemClassName="bg-surface text-foreground ring-1 ring-border hover:bg-accent hover:text-accent-contrast"
        />
      </CreativeMotion>
    </CreativeShell>
  );
}

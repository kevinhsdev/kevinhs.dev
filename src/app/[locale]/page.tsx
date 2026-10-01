import { getTranslations } from "next-intl/server";
import { CreativeHeader, CreativeHero, Marquee } from "@/components/creative/hero";
import { GitLog } from "@/components/creative/git-log";
import { CreativeMotion } from "@/components/creative/motion";
import { PrintSummary } from "@/components/creative/print-summary";
import { Preloader } from "@/components/creative/preloader";
import { SkillsExplorer } from "@/components/creative/skills-explorer";
import { CompactProjects, StackedProjects } from "@/components/creative/projects";
import {
  Block,
  CreativeAbout,
  CreativeContact,
  CreativeFooter,
} from "@/components/creative/sections";
import { CreativeShell } from "@/components/creative/shell";
import { Statement } from "@/components/creative/statement";
import { RegisterCommandNavigation } from "@/components/shared/command-menu";
import { CtaDock } from "@/components/shared/cta-dock";
import { SiteMenu } from "@/components/shared/site-menu";
import { featuredProjects, otherProjects, pick, skills } from "@/content";
import { resolveLocale } from "@/i18n/locale";
import { getTimelineEntries, getTimelineFilterLabels } from "@/lib/view-models";

/** The home page. Metadata (title, canonical, hreflang) comes from the locale layout. */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations();
  const [entries, filterLabels] = await Promise.all([
    getTimelineEntries(locale),
    getTimelineFilterLabels(locale),
  ]);

  const nav = [
    { label: t("nav.projects"), href: "#projects" },
    { label: t("nav.experience"), href: "#experience" },
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.skills"), href: "#skills" },
    { label: t("nav.contact"), href: "#contact" },
    { label: t("nav.now"), href: "/now" },
  ];

  const levels = skills.map((group) => ({
    id: group.tier,
    label: t(`skills.tiers.${group.tier}`),
    items: group.items.map((item) => pick(item, locale)),
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
          <Marquee />
          <Statement />

          <Block id="projects" kicker={t("creative.projectsKicker")} title={t("nav.projects")}>
            <div className="flex flex-col gap-24">
              <StackedProjects projects={featuredProjects} locale={locale} />
              <div className="flex flex-col gap-6">
                <h3 className="font-mono text-xs tracking-widest text-muted uppercase">
                  {t("creative.otherProjects")}
                </h3>
                <CompactProjects projects={otherProjects} locale={locale} />
              </div>
            </div>
          </Block>

          <Block
            id="experience"
            kicker={t("creative.experienceKicker")}
            title={t("nav.experience")}
          >
            <GitLog
              entries={entries}
              filterLabels={filterLabels}
              filterGroupLabel={t("nav.experience")}
            />
          </Block>

          <Block id="about" kicker={t("creative.aboutKicker")} title={t("nav.about")}>
            <CreativeAbout locale={locale} />
          </Block>

          <Block id="skills" kicker={t("creative.setupKicker")} title={t("nav.skills")}>
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
          menuClassName="bg-accent text-accent-contrast ring-0"
        />
      </CreativeMotion>
    </CreativeShell>
  );
}

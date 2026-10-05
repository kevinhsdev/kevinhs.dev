import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreativeHeader } from "@/components/creative/hero";
import { CreativeMotion } from "@/components/creative/motion";
import { Mural } from "@/components/creative/mural";
import { CreativeFooter } from "@/components/creative/sections";
import { CreativeShell } from "@/components/creative/shell";
import { RegisterCommandNavigation } from "@/components/shared/command-menu";
import { CtaDock } from "@/components/shared/cta-dock";
import { SiteMenu } from "@/components/shared/site-menu";
import { Text } from "@/components/shared/text";
import { gallery, pick, profile } from "@/content";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { HOME_PATH } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale === "en" ? "en" : "pt",
    namespace: "aboutPage",
  });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      type: "profile",
      siteName: profile.fullName,
      locale: locale === "en" ? "en_US" : "pt_BR",
      title: `${t("title")} · ${profile.name}`,
      description: t("description"),
    },
    alternates: {
      canonical: `/${locale}/about`,
      languages: { "pt-BR": "/pt/about", en: "/en/about" },
    },
  };
}

/** About me: the full story, then a wall of polaroids that enlarge on click. */
export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations();
  // The last "about" paragraph is the one about life away from the screen: it goes on the note.
  const story = profile.about.slice(0, -1);
  const offScreen = profile.about.at(-1);

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
        <main id="main" className="flex flex-col gap-20 px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
          <header id="hero" className="flex flex-col gap-6">
            <Link
              href={HOME_PATH}
              className="inline-flex min-h-11 items-center gap-2 self-start font-mono text-xs tracking-widest text-muted uppercase transition-colors duration-150 hover:text-foreground"
            >
              <ArrowLeft aria-hidden className="size-4" />
              {t("aboutPage.back")}
            </Link>
            <p className="font-mono text-xs tracking-widest text-accent uppercase">
              {t("aboutPage.kicker")}
            </p>
            <h1 className="font-display text-[clamp(4.5rem,17vw,16rem)] leading-[0.9]">
              {t("aboutPage.title")}
            </h1>
            <p className="max-w-xl text-lg text-pretty text-muted">{t("aboutPage.lead")}</p>
          </header>

          <div className="grid gap-6 text-lg leading-relaxed text-muted lg:grid-cols-3 lg:gap-10">
            {story.map((paragraph) => (
              <Text key={paragraph.en} as="p" className="text-pretty">
                {pick(paragraph, locale)}
              </Text>
            ))}
          </div>

          <section aria-labelledby="mural-title" className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs tracking-widest text-accent uppercase">
                {t("aboutPage.muralKicker")}
              </p>
              <h2 id="mural-title" className="font-display text-6xl sm:text-8xl">
                {t("aboutPage.muralTitle")}
              </h2>
              <p className="text-muted">{t("aboutPage.muralHint")}</p>
            </div>
            <Mural
              photos={gallery.map((photo) => ({
                id: photo.id,
                src: photo.src,
                alt: pick(photo.alt, locale),
                caption: pick(photo.caption, locale),
                focus: photo.focus,
              }))}
              note={{
                title: t("aboutPage.noteTitle"),
                text: offScreen ? pick(offScreen, locale) : "",
              }}
              labels={{
                zoom: t.raw("aboutPage.zoom") as string,
                close: t("aboutPage.close"),
                previous: t("aboutPage.previous"),
                next: t("aboutPage.next"),
              }}
            />
          </section>
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

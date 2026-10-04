import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreativeHeader } from "@/components/creative/hero";
import { CreativeMotion } from "@/components/creative/motion";
import { CreativeFooter } from "@/components/creative/sections";
import { CreativeShell } from "@/components/creative/shell";
import { RegisterCommandNavigation } from "@/components/shared/command-menu";
import { CtaDock } from "@/components/shared/cta-dock";
import { SiteMenu } from "@/components/shared/site-menu";
import { Text } from "@/components/shared/text";
import { now, pick, profile } from "@/content";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { HOME_PATH } from "@/lib/site";
import { formatPartialDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[locale]/now">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale === "en" ? "en" : "pt", namespace: "now" });
  return {
    title: t("title"),
    description: t("about"),
    openGraph: {
      type: "website",
      siteName: profile.fullName,
      locale: locale === "en" ? "en_US" : "pt_BR",
      title: `${t("title")} · ${profile.name}`,
      description: t("about"),
    },
    alternates: { canonical: `/${locale}/now`, languages: { "pt-BR": "/pt/now", en: "/en/now" } },
  };
}

export default async function NowPage({ params }: PageProps<"/[locale]/now">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations();
  const lists = [
    { title: t("now.learning"), items: now.learning },
    { title: t("now.building"), items: now.building },
  ];

  return (
    <CreativeShell>
      <CreativeMotion>
        <RegisterCommandNavigation
          items={[
            { label: t("nav.projects"), href: `${HOME_PATH}#projects` },
            { label: t("nav.contact"), href: `${HOME_PATH}#contact` },
          ]}
        />
        <CreativeHeader />
        <main id="main" className="flex flex-col gap-16 px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
          <header id="hero" className="flex flex-col gap-6">
            <Link
              href={HOME_PATH}
              className="inline-flex min-h-11 items-center gap-2 self-start font-mono text-xs tracking-widest text-muted uppercase transition-colors duration-150 hover:text-foreground"
            >
              <ArrowLeft aria-hidden className="size-4" />
              {t("now.back")}
            </Link>
            <p className="font-mono text-xs tracking-widest text-accent uppercase">
              {t("now.updated", { date: formatPartialDate(now.updatedAt, locale) })}
            </p>
            <h1 className="font-display text-[clamp(5rem,20vw,18rem)]">{t("now.title")}</h1>
            <p className="max-w-xl text-lg text-pretty text-muted">{t("now.about")}</p>
          </header>

          <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border lg:grid-cols-2">
            {lists.map((list) => (
              <section
                key={list.title}
                aria-label={list.title}
                className="flex flex-col gap-6 bg-background p-6 sm:p-10"
              >
                <h2 className="font-display text-4xl sm:text-5xl">{list.title}</h2>
                <ol className="flex flex-col">
                  {list.items.map((item, index) => (
                    <li
                      key={item.en}
                      data-reveal
                      className="grid grid-cols-[2.5rem_1fr] gap-3 border-t border-border py-5"
                    >
                      <span className="font-mono text-xs text-accent tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Text className="text-lg leading-snug text-pretty">{pick(item, locale)}</Text>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </main>
        <CreativeFooter locale={locale} updatedAt={new Date()} />
        <SiteMenu linkClassName="font-display text-5xl sm:text-6xl" />
        <CtaDock
          watch={["hero", "site-footer"]}
          source="now-dock"
          itemClassName="bg-surface text-foreground ring-1 ring-border hover:bg-accent hover:text-accent-contrast"
        />
      </CreativeMotion>
    </CreativeShell>
  );
}

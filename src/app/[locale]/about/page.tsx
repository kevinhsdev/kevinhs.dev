import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  AboutFrame,
  CtaButtons,
  FactSheet,
  Portrait,
  ProjectLinks,
} from "@/components/creative/about-parts";
import { Mosaic } from "@/components/creative/mosaic";
import { Text } from "@/components/shared/text";
import { about, gallery, pick, profile } from "@/content";
import { resolveLocale } from "@/i18n/locale";

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

/**
 * About me, led by photos: Kevin's portrait beside who he is, the fact sheet,
 * then the themes of his life (src/content/about.ts), each a big title, a few
 * lines in his words and a mosaic of photos that enlarge on click.
 */
export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("aboutPage");
  const labels = {
    zoom: t.raw("zoom") as string,
    close: t("close"),
    previous: t("previous"),
    next: t("next"),
  };

  return (
    <AboutFrame
      locale={locale}
      hero={
        <div className="grid gap-8 px-4 sm:px-8 lg:grid-cols-12 lg:gap-12">
          {/* On wide screens the portrait runs the full height of the text beside it. */}
          <Portrait
            locale={locale}
            className="aspect-[4/5] w-full max-w-sm lg:col-span-4 lg:aspect-auto lg:max-w-none"
          />
          <div className="flex flex-col gap-6 lg:col-span-8">
            <h1 className="font-display text-[clamp(4.5rem,13vw,11rem)] leading-[0.85]">
              {t("title")}
            </h1>
            <Text as="p" className="text-2xl leading-snug font-medium text-pretty sm:text-3xl">
              {pick(about.lede, locale)}
            </Text>
            <div className="flex max-w-2xl flex-col gap-4 text-lg leading-relaxed text-pretty">
              {about.intro.map((paragraph) => (
                <Text key={paragraph.en} as="p">
                  {pick(paragraph, locale)}
                </Text>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <FactSheet locale={locale} className="mx-4 sm:mx-8" />

      {about.themes.map((theme) => {
        const photos = theme.photos.flatMap((id) => {
          const photo = gallery.find((item) => item.id === id);
          return photo
            ? [
                {
                  id: photo.id,
                  src: photo.src,
                  alt: pick(photo.alt, locale),
                  caption: pick(photo.caption, locale),
                  width: photo.width,
                  height: photo.height,
                },
              ]
            : [];
        });
        return (
          <section
            key={theme.id}
            id={theme.id}
            aria-labelledby={`theme-${theme.id}`}
            className="flex scroll-mt-24 flex-col gap-8 border-t border-border px-4 pt-12 sm:px-8 sm:pt-16"
          >
            <div data-reveal className="flex flex-col gap-5">
              <h2
                id={`theme-${theme.id}`}
                className="font-display text-[clamp(3.5rem,9vw,8rem)] leading-[0.9] text-balance"
              >
                {pick(theme.title, locale)}
              </h2>
              <div className="flex max-w-3xl flex-col gap-4 text-lg leading-relaxed text-pretty sm:text-xl">
                {theme.text.map((paragraph) => (
                  <Text key={paragraph.en} as="p">
                    {pick(paragraph, locale)}
                  </Text>
                ))}
              </div>
              {theme.projects.length > 0 && (
                <div className="max-w-3xl">
                  <ProjectLinks slugs={theme.projects} locale={locale} />
                </div>
              )}
            </div>
            <Mosaic photos={photos} labels={labels} />
          </section>
        );
      })}

      <section
        aria-labelledby="next-title"
        className="flex flex-col gap-6 border-t border-border px-4 pt-12 sm:px-8 sm:pt-16"
      >
        <h2
          id="next-title"
          className="font-display text-[clamp(3.5rem,9vw,8rem)] leading-[0.9] text-balance"
        >
          {pick(about.next.heading, locale)}
        </h2>
        <p className="max-w-3xl text-lg leading-relaxed text-pretty sm:text-xl">
          {pick(about.next.text, locale)}
        </p>
        <CtaButtons />
      </section>
    </AboutFrame>
  );
}

import { Caveat } from "next/font/google";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { AboutTeaserView } from "./about-teaser-view";

const hand = Caveat({ variable: "--font-hand", weight: "600", subsets: ["latin"] });

/** The way into About from the home page: three lines of the story, photos landing around them. */
export async function AboutTeaser({ locale }: { locale: Locale }) {
  const t = await getTranslations("about");
  return (
    <section
      aria-labelledby="about-teaser-title"
      className={`mx-auto max-w-7xl px-5 sm:px-8 ${hand.variable}`}
    >
      <AboutTeaserView kicker={t("title")} more={t("more")} locale={locale} />
    </section>
  );
}

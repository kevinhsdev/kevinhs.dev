import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/hero";
import { Contact } from "@/components/home/contact";
import { HomeProjects } from "@/components/home/projects";
import { HomeSkills } from "@/components/home/skills";
import { Journey } from "@/components/journey/journey";
import { SiteFooter } from "@/components/shell/footer";
import type { Locale } from "@/i18n/routing";

/** Home: hero → globe journey → projects → daily skills → contact. */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  return (
    <>
      <main id="main">
        <Hero locale={l} />
        <Journey locale={l} />
        <HomeProjects locale={l} />
        <HomeSkills locale={l} />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}

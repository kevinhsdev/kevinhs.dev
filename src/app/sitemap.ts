import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { caseStudySlugs } from "@/lib/case-studies";
import { siteUrl } from "@/lib/site";

const hreflang = { pt: "pt-BR", en: "en" } as const;

/** Every page in both languages, each entry pointing at its translation. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/now", ...caseStudySlugs.map((slug) => `/projects/${slug}`)];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((other) => [hreflang[other], `${siteUrl}/${other}${path}`]),
        ),
      },
    })),
  );
}

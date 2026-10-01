import { getTranslations } from "next-intl/server";
import { pick, profile } from "@/content";
import { routing } from "@/i18n/routing";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = `${profile.fullName} · Software Engineering`;
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw === "en" ? "en" : "pt";
  const t = await getTranslations({ locale, namespace: "creative" });

  return renderOgImage({
    kicker: pick(profile.status, locale),
    title: profile.name,
    subtitle: pick(profile.tagline, locale),
    footer: `${t("kicker")} · ${profile.stackLine}`,
  });
}

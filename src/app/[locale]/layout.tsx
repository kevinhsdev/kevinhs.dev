import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CommandMenu } from "@/components/shared/command-menu";
import { PersonJsonLd } from "@/components/shared/json-ld";
import { Providers } from "@/components/shared/providers";
import { SkipLink } from "@/components/shared/skip-link";
import { profile } from "@/content";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";
import "../globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
// Only the secret arcade theme uses it, so it is never preloaded.
const pixel = VT323({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/** Sets the arcade theme before first paint, so it never flashes the normal one. */
const arcadeScript = `try{if(localStorage.getItem("kh:arcade")==="1")document.documentElement.setAttribute("data-arcade","")}catch(e){}`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef2f9" },
    { media: "(prefers-color-scheme: dark)", color: "#070d1f" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : "pt",
    namespace: "meta",
  });

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("title"), template: `%s · ${profile.name}` },
    description: t("description"),
    authors: [{ name: profile.fullName, url: profile.links.linkedin }],
    creator: profile.fullName,
    alternates: {
      canonical: `/${locale}`,
      languages: { "pt-BR": "/pt", en: "/en", "x-default": "/pt" },
    },
    openGraph: {
      type: "profile",
      siteName: profile.fullName,
      locale: locale === "en" ? "en_US" : "pt_BR",
      title: t("title"),
      description: t("description"),
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale === "pt" ? "pt-BR" : "en"}
      className={`${sans.variable} ${mono.variable} ${pixel.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: arcadeScript }} />
        <NextIntlClientProvider>
          <Providers>
            <SkipLink />
            {children}
            <CommandMenu />
          </Providers>
        </NextIntlClientProvider>
        <PersonJsonLd locale={locale} />
        {/* The scripts only exist on Vercel; elsewhere they would 404. */}
        {process.env.VERCEL && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}

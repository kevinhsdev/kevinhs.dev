import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { BOOT_SCRIPT } from "@/components/hero/boot";
import { Chrome } from "@/components/shell/chrome";
import { CtaDock } from "@/components/shell/cta-dock";
import { Curtain, CURTAIN_SCRIPT } from "@/components/shell/curtain";
import { SiteHeader } from "@/components/shell/header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { routing } from "@/i18n/routing";
import "@/styles/globals.css";

const anton = localFont({
  src: "../../assets/fonts/anton-latin.woff2",
  variable: "--font-anton",
  weight: "400",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });
  return (
    <html
      lang={{ pt: "pt-BR", en: "en", es: "es" }[locale]}
      className={`${GeistSans.variable} ${GeistMono.variable} ${anton.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="hero-boot" strategy="beforeInteractive">
          {BOOT_SCRIPT}
        </Script>
        <Script id="curtain-boot" strategy="beforeInteractive">
          {CURTAIN_SCRIPT}
        </Script>
        <NextIntlClientProvider>
          <ThemeProvider>
            <a
              href="#main"
              className="sr-only z-50 rounded-full bg-accent px-4 py-3 text-accent-contrast focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
              {t("skip")}
            </a>
            <SiteHeader />
            {children as ReactNode}
            <CtaDock />
            <Chrome />
            <Curtain
              labels={{
                "": t("home"),
                journey: t("journey"),
                projects: t("projects"),
                skills: t("skills"),
                contact: t("contact"),
                about: t("about"),
              }}
            />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

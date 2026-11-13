"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LocaleToggle() {
  const t = useTranslations("locale");
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <Link
      href={pathname}
      locale={locale === "pt" ? "en" : "pt"}
      aria-label={t("switch")}
      className="inline-flex size-11 items-center justify-center rounded-full font-mono text-xs font-semibold transition-colors hover:bg-accent-soft"
    >
      {t("short")}
    </Link>
  );
}

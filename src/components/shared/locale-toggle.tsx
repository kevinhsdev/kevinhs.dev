"use client";

import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The same page in the other language. Switching language swaps the whole
 * <html> (lang + root layout), so it is a full document navigation on purpose:
 * a client-side transition between the two root layouts dropped the page's
 * stylesheets. The middleware updates the locale cookie on arrival.
 */
export function useLocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === "pt" ? "en" : "pt";
  return { target, href: getPathname({ href: pathname, locale: target }) };
}

export function LocaleToggle({ className }: { className?: string }) {
  const t = useTranslations("locale");
  const { target, href } = useLocaleSwitch();

  return (
    <a
      href={href}
      hrefLang={target}
      aria-label={t("switchTo")}
      title={t("switchTo")}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-2 font-mono text-xs font-medium tracking-wider text-muted uppercase transition-colors duration-150 hover:text-foreground",
        className,
      )}
    >
      {target}
    </a>
  );
}

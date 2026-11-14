"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/** Each language in its own words, so a visitor finds theirs whatever the page is in. */
const NAMES: Record<Locale, string> = { pt: "Português", en: "English", es: "Español" };

/** The language picker in the top bar: the current code, opening a short list of the languages. */
export function LocaleToggle() {
  const t = useTranslations("locale");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${t("label")}: ${NAMES[locale]}`}
        className="inline-flex h-11 items-center gap-1 rounded-full px-3 font-mono text-xs font-semibold uppercase transition-colors hover:bg-accent-soft"
      >
        {locale}
        <svg
          aria-hidden
          viewBox="0 0 10 6"
          className={`size-2 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <ul
          aria-label={t("label")}
          className="glass absolute top-full right-0 z-50 mt-2 min-w-40 rounded-2xl p-1 shadow-lg"
        >
          {routing.locales.map((l) => (
            <li key={l}>
              <Link
                href={pathname}
                locale={l}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-accent-soft aria-[current]:text-accent"
              >
                <span className="w-5 font-mono text-xs font-semibold uppercase">{l}</span>
                {NAMES[l]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

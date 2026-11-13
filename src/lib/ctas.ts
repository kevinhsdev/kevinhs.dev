import type { Locale } from "@/i18n/routing";
// Raw content (no zod) keeps client bundles small; the schema validates it at build time.
import { profile } from "@/content/profile";

/** The CV in the visitor's language, falling back to the PT file until an EN one exists. */
export function cvHref(locale: Locale): { href: string; fallback: boolean } {
  if (locale === "en" && profile.cv.en) return { href: profile.cv.en, fallback: false };
  return { href: profile.cv.pt, fallback: locale === "en" };
}

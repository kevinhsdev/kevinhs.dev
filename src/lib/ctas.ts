import type { Locale } from "@/i18n/routing";
// Raw content (no zod) keeps client bundles small; the schema validates it at build time.
import { profile } from "@/content/profile";

/** The CV in the visitor's language, falling back to the PT file when that one doesn't exist. */
export function cvHref(locale: Locale): { href: string; fallback: boolean } {
  const own = profile.cv[locale];
  return own ? { href: own, fallback: false } : { href: profile.cv.pt, fallback: true };
}

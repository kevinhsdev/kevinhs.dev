import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es"],
  defaultLocale: "pt",
  // Every URL carries its locale (/pt, /en, /es) so each language gets its own
  // indexable page and hreflang pair.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

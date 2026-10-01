import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  // Every URL carries its locale (/pt, /en) so each language gets its own
  // indexable page and hreflang pair.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

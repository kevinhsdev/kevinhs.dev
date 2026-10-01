/** Absolute base URL. Falls back to Vercel's URL, then localhost. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

/** The home page (locale prefix is added by the i18n Link). */
export const HOME_PATH = "/";

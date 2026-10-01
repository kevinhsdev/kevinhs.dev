import { track } from "@vercel/analytics";

/** The only events we track: the three primary CTAs. */
export type CtaEvent = "cv_download" | "linkedin_click" | "email_copy" | "github_click";

export function trackCta(event: CtaEvent, props: { locale: string; source: string }) {
  try {
    track(event, props);
  } catch {
    // Analytics must never break a CTA.
  }
}

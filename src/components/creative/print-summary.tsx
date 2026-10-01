import { getTranslations } from "next-intl/server";
import { featuredProjects, pick, profile } from "@/content";
import type { Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";
import { getTimelineEntries } from "@/lib/view-models";

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "");

/**
 * A one-page résumé that only exists on paper: Ctrl+P on the home page prints
 * this instead of the animated sections (see the print rules in creative.css).
 */
export async function PrintSummary({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const entries = (await getTimelineEntries(locale))
    .filter((entry) => entry.kind !== "event" && !entry.isTodo)
    .slice(0, 4);

  return (
    <div className="print-summary hidden text-[10.5pt] leading-snug print:block">
      <div className="flex items-baseline justify-between gap-6 border-b border-border pb-3">
        <div>
          <p className="font-display text-[26pt] leading-none uppercase">{profile.fullName}</p>
          <p className="mt-1">
            {pick(profile.role, locale)} · {pick(profile.location, locale)}
          </p>
        </div>
        <ul className="text-right text-[9pt]">
          <li>{profile.email}</li>
          <li>{stripProtocol(profile.links.linkedin)}</li>
          <li>{stripProtocol(profile.links.github)}</li>
          <li>{stripProtocol(siteUrl)}</li>
        </ul>
      </div>

      <p className="mt-3">{pick(profile.proof, locale)}</p>
      <p className="mt-1">
        {profile.stackLine}, {pick(profile.interests, locale)}.
      </p>

      <h2 className="mt-5 font-mono text-[8.5pt] tracking-widest uppercase">{t("nav.projects")}</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {featuredProjects.map((project) => (
          <li key={project.slug}>
            <strong>{project.title}</strong>: {pick(project.tagline, locale)}
            <br />
            <span className="text-[9pt] text-muted">{project.stack.join(" · ")}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-5 font-mono text-[8.5pt] tracking-widest uppercase">
        {t("nav.experience")}
      </h2>
      <ul className="mt-2 flex flex-col gap-1.5">
        {entries.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.title}</strong>, {entry.org}{" "}
            <span className="text-[9pt] text-muted">({entry.period})</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-border pt-2 text-[9pt] text-muted">
        {stripProtocol(siteUrl)}/{locale}
      </p>
    </div>
  );
}

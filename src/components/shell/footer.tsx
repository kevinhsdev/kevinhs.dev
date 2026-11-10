import { ArrowUp } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { KevinMark } from "@/components/shell/logo";
import { featuredProjects, pick, profile } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LocalTime } from "./footer-fx";
import { FooterHorizon } from "./footer-horizon";
import "./footer.css";

const NAV = [
  { key: "home", href: "/" },
  { key: "journey", href: "/#journey" },
  { key: "projects", href: "/#projects" },
  { key: "skills", href: "/#skills" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/#contact" },
] as const;

/**
 * The footer: a scene (a stormy sea, Kevin's K in liquid metal on the horizon) with the brand, the status and the link columns over the ground. Always dark.
 */
export async function SiteFooter() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();
  const social = [
    { label: "GitHub", href: profile.links.github },
    { label: "LinkedIn", href: profile.links.linkedin },
    { label: "Instagram", href: profile.links.instagram },
    { label: "E-mail", href: `mailto:${profile.email}` },
  ];
  return (
    <footer id="site-footer" className="hz dark">
      <FooterHorizon />
      <div className="hz-info">
        <div className="hz-brand">
          <p className="hz-word">
            <KevinMark className="h-7 w-auto text-accent-strong" />
            {profile.name}
          </p>
          <p className="hz-tagline">{pick(profile.tagline, locale)}</p>
          <p className="hz-status">
            <span className="hz-dot" aria-hidden />
            {pick(profile.status, locale)}
            <span className="hz-time">
              {pick(profile.location, locale)} · <LocalTime locale={locale} />
            </span>
          </p>
        </div>
        <nav className="hz-cols" aria-label={t("footer.navigate")}>
          <div className="hz-col">
            <h2>{t("footer.navigate")}</h2>
            <ul>
              {NAV.map((n) => (
                <li key={n.key}>
                  <Link href={n.href}>{t(`nav.${n.key}`)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="hz-col">
            <h2>{t("projects.featured")}</h2>
            <ul>
              {featuredProjects.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`}>{pick(p.title, locale).split(" · ")[0]}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="hz-col">
            <h2>{t("footer.elsewhere")}</h2>
            <ul>
              {social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    {...(s.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="hz-copy">
          <span>{t("footer.rights", { year: new Date().getFullYear() })}</span>
          <a href={profile.links.siteRepo} target="_blank" rel="noopener noreferrer">
            {t("footer.built")}
          </a>
          <a href="#main" className="hz-top" aria-label={t("footer.top")}>
            <ArrowUp aria-hidden className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

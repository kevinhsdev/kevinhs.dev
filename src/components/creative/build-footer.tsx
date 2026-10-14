"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { KevinMark } from "@/components/shared/logo";
// Raw content (no Zod) keeps the client bundle small; it is validated at build time.
import { profile } from "@/content/profile";
import { Link } from "@/i18n/navigation";
import { trackCta, type CtaEvent } from "@/lib/analytics";
import { HOME_PATH } from "@/lib/site";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

// Each section "built" by the Maven run, with a made-up but plausible build time.
const modules = [
  { nav: "home", id: "hero", time: "0.8 s" },
  { nav: "projects", id: "projects", time: "2.1 s" },
  { nav: "experience", id: "experience", time: "1.7 s" },
  { nav: "skills", id: "skills", time: "1.4 s" },
] as const;

function Info({ children }: { children?: ReactNode }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="text-link">[INFO]</span>
      {children}
    </p>
  );
}

const Rule = () => (
  <Info>
    <span aria-hidden className="flex-1 border-b border-dashed border-border" />
  </Info>
);

const Dots = () => (
  <span
    aria-hidden
    className="flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-border"
  />
);

const Prompt = () => (
  <>
    <span className="text-positive">kevin@kevinhs.dev</span>:<span className="text-link">~</span>
    ${" "}
  </>
);

/**
 * The footer as a terminal: a Maven build of the site runs line by line when it
 * scrolls into view, ends in BUILD SUCCESS and leaves a prompt with clickable
 * commands (hovering one types it). Every line is server-rendered and readable;
 * the script only hides and reveals them, and skips that under reduced motion
 * or when the footer is already on screen.
 */
export function BuildFooter({ finishedAt, year }: { finishedAt: string; year: number }) {
  const t = useTranslations();
  const locale = useLocale();
  const terminal = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState("");

  const cv = (locale === "en" && profile.cv.en) || profile.cv.pt;
  const commands: { cmd: string; href: string; event?: CtaEvent; download?: boolean }[] = [
    { cmd: "open linkedin", href: profile.links.linkedin, event: "linkedin_click" },
    { cmd: "open instagram", href: profile.links.instagram, event: "instagram_click" },
    { cmd: "git clone github.com/kevinhsdev", href: profile.links.github, event: "github_click" },
    { cmd: `mail ${profile.email}`, href: `mailto:${profile.email}` },
    { cmd: `cat ${t("footer.cvFile")}`, href: cv, event: "cv_download", download: true },
  ];

  useEffect(() => {
    const el = terminal.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || el.getBoundingClientRect().top < window.innerHeight) return;

    const lines = [...el.querySelectorAll<HTMLElement>("[data-line]")];
    el.dataset.armed = "true";
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        let n = 0;
        const step = () => {
          lines[n]!.dataset.on = "true";
          n += 1;
          if (n < lines.length) timer = window.setTimeout(step, n === 1 ? 500 : 110);
        };
        step();
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <footer
      id="site-footer"
      className="flex flex-col gap-4 border-t border-border px-4 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8"
    >
      <div
        ref={terminal}
        className="build-terminal overflow-hidden rounded-2xl border border-border bg-surface font-mono text-[12px] text-foreground shadow-[0_30px_80px_-40px_color-mix(in_srgb,var(--accent)_45%,transparent)] sm:text-sm"
      >
        <div aria-hidden className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs text-muted">kevin@kevinhs.dev — mvn</span>
        </div>

        <div className="flex flex-col gap-0.5 p-5 leading-relaxed sm:p-8">
          <div data-line>
            <p>
              <Prompt />
              mvn kevin:deploy
            </p>
          </div>
          <div data-line>
            <Rule />
          </div>
          <div data-line>
            <Info>
              <span>
                Reactor Summary for <span className="text-link">kevinhs.dev</span>:
              </span>
            </Info>
          </div>
          {modules.map(({ nav, id, time }) => (
            <div key={id} data-line>
              <Info>
                <Link
                  href={`${HOME_PATH}#${id}`}
                  className="inline-flex min-h-6 items-center underline-offset-4 hover:underline"
                >
                  {t(`nav.${nav}`)}
                </Link>
                <Dots />
                <span className="text-positive">SUCCESS</span>
                <span className="hidden w-16 text-right text-muted sm:inline">[{time}]</span>
              </Info>
            </div>
          ))}
          <div data-line>
            <Info>
              <Link
                href={`${HOME_PATH}#contact`}
                className="inline-flex min-h-6 items-center underline-offset-4 hover:underline"
              >
                {t("nav.contact")}
              </Link>
              <Dots />
              <span className="build-waiting text-accent">{t("footer.waiting")}</span>
              <span className="hidden w-16 text-right text-muted sm:inline">[—]</span>
            </Info>
          </div>
          <div data-line>
            <Rule />
          </div>
          <div data-line>
            <Info>
              <span className="font-bold text-positive">BUILD SUCCESS</span>
            </Info>
          </div>
          <div data-line>
            <Info>
              <span>
                Total time: <span className="text-muted">{t("footer.thanks")}</span>
              </span>
            </Info>
          </div>
          <div data-line>
            <Info>
              <span>
                Finished at: <span className="text-muted">{finishedAt}</span>
              </span>
            </Info>
          </div>
          <div data-line>
            <Rule />
          </div>

          <div data-line className="mt-5 flex flex-col gap-3">
            <p className="text-muted">{t("footer.next")}</p>
            <div className="flex flex-wrap gap-2">
              {commands.map(({ cmd, href, event, download }) => {
                const [verb, ...rest] = cmd.split(" ");
                return (
                  <a
                    key={cmd}
                    href={href}
                    {...(download ? { download: true } : ext)}
                    onClick={() => event && trackCta(event, { locale, source: "footer" })}
                    onMouseEnter={() => setTyped(cmd)}
                    onFocus={() => setTyped(cmd)}
                    onMouseLeave={() => setTyped("")}
                    onBlur={() => setTyped("")}
                    className="inline-flex min-h-11 items-center gap-[1ch] rounded-md border border-border px-3 transition-colors duration-150 hover:border-accent hover:bg-accent/10"
                  >
                    {verb} <span className="text-muted">{rest.join(" ")}</span>
                  </a>
                );
              })}
            </div>
            <p aria-hidden>
              <Prompt />
              {typed}
              <span className="build-caret ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-accent" />
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-muted">
        <KevinMark className="h-6 w-auto shrink-0 text-accent" />
        <p>
          © {year} {profile.fullName}
        </p>
      </div>
    </footer>
  );
}

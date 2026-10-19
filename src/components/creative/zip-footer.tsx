"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { scrollToAnchor } from "@/components/shared/command-menu";
import { KevinMark } from "@/components/shared/logo";
// Raw content (no Zod) keeps the client bundle small; it is validated at build time.
import { profile } from "@/content/profile";
import { trackCta, type CtaEvent } from "@/lib/analytics";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const BAR = 24;

/**
 * The footer as a terminal where the visitor "downloads" Kevin by scrolling:
 * the progress bar follows how far the page has scrolled toward the footer's
 * bottom, the "speed" is the scroll speed, and at 100% the archive unzips into
 * the contact links. The terminal stays dark in both themes, like a real one.
 * Under reduced motion, or when the footer is already fully on screen, it
 * starts complete.
 */
export function ZipFooter({ year }: { year: number }) {
  const t = useTranslations("footer");
  const locale = useLocale();
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [screens, setScreens] = useState(1);
  const [shown, setShown] = useState(0);
  // Once downloaded it stays downloaded, even if the visitor scrolls back up.
  const [complete, setComplete] = useState(false);

  const files: {
    name: string;
    size: string;
    href: string;
    note: string;
    event?: CtaEvent;
    download?: boolean;
  }[] = [
    {
      name: t("cvFile"),
      size: "256 KB",
      href: (locale === "en" && profile.cv.en) || profile.cv.pt,
      note: t("cvNote"),
      event: "cv_download",
      download: true,
    },
    {
      name: "linkedin.url",
      size: "1 KB",
      href: profile.links.linkedin,
      note: "in/kevinhs07",
      event: "linkedin_click",
    },
    {
      name: "instagram.url",
      size: "1 KB",
      href: profile.links.instagram,
      note: "@kevinhs.zip",
      event: "instagram_click",
    },
    {
      name: "github.url",
      size: "1 KB",
      href: profile.links.github,
      note: "kevinhsdev",
      event: "github_click",
    },
    {
      name: locale === "en" ? "contact.eml" : "contato.eml",
      size: "0 KB",
      href: `mailto:${profile.email}`,
      note: t("emailNote"),
    },
  ];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Static and complete: one rAF so the state change happens outside the effect body.
      const frame = requestAnimationFrame(() => setComplete(true));
      return () => cancelAnimationFrame(frame);
    }
    let last = { y: window.scrollY, t: performance.now() };
    let frame = 0;
    const update = () => {
      frame = 0;
      const end = el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      const next = end > 1 ? Math.min(1, Math.max(0, window.scrollY / end)) : 1;
      setP(next);
      // A few pixels of slack: mobile scroll positions are fractional and can stop just short.
      if (end - window.scrollY <= 4) setComplete(true);
      setScreens(Math.max(1, Math.ceil((end - window.scrollY) / window.innerHeight)));
      const now = performance.now();
      if (now > last.t) setSpeed((Math.abs(window.scrollY - last.y) / (now - last.t)) * 1000);
      last = { y: window.scrollY, t: now };
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Once complete, the unzip lists one file at a time.
  useEffect(() => {
    if (!complete) return;
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let n = 0;
    const id = window.setInterval(
      () => {
        n = instant ? files.length + 1 : n + 1;
        setShown(n);
        if (n > files.length) window.clearInterval(id);
      },
      instant ? 0 : 180,
    );
    return () => window.clearInterval(id);
  }, [complete, files.length]);

  const unzipped = complete;
  const filled = Math.round((unzipped ? 1 : p) * BAR);
  const pct = unzipped ? 100 : Math.round(p * 100);
  // Scroll speed in px/s shown as a download rate, 1 px = 1 KB.
  const rate = speed > 1024 ? `${(speed / 1024).toFixed(1)} MB/s` : `${Math.round(speed)} KB/s`;

  return (
    <footer
      id="site-footer"
      ref={root}
      className="px-4 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8"
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#05070d] font-mono text-[12px] leading-relaxed text-[#c9d1e3] shadow-[0_30px_80px_-40px_color-mix(in_srgb,var(--accent)_55%,transparent)] sm:text-sm">
        <div aria-hidden className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs text-white/60">kevin@kevinhs.dev — ~/downloads</span>
        </div>

        <div className="p-5 sm:p-8">
          <p>
            <span className="text-[#28c840]">$</span> curl -O https://kevinhs.dev/kevin.zip
          </p>
          <p className="whitespace-pre" aria-hidden>
            <span className="text-[#5b9bff]">{"█".repeat(filled)}</span>
            <span className="text-white/15">{"░".repeat(BAR - filled)}</span>{" "}
            {String(pct).padStart(3)}%
          </p>
          <p className="text-white/50">
            {unzipped ? (
              <span className="text-[#28c840]">✓ {t("saved")}</span>
            ) : (
              <>
                {rate} · {t("remaining", { count: screens })}
              </>
            )}
          </p>

          <div className={unzipped ? "mt-4" : "mt-4 opacity-40"}>
            <p>
              <span className="text-[#28c840]">$</span> unzip kevin.zip
              {!unzipped && <span className="text-white/50"> ({t("waitingDownload")})</span>}
            </p>
            <ul>
              {files.map((file, index) => {
                const visible = index < shown;
                return (
                  <li
                    key={file.name}
                    className={`grid grid-cols-[auto_1fr_auto] items-baseline gap-x-3 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
                  >
                    <span className="text-white/50">inflating:</span>
                    <span className="min-w-0">
                      <a
                        href={file.href}
                        {...(file.download ? { download: true } : ext)}
                        tabIndex={visible ? undefined : -1}
                        onClick={() =>
                          file.event && trackCta(file.event, { locale, source: "footer" })
                        }
                        className="inline-flex min-h-6 items-center text-[#5b9bff] underline-offset-4 hover:text-white hover:underline"
                      >
                        {file.name}
                      </a>
                      <span className="hidden text-white/50 sm:inline"> → {file.note}</span>
                    </span>
                    <span className="text-right text-white/50">{file.size}</span>
                  </li>
                );
              })}
            </ul>
            {/* The last prompt is the way back up: `cd ~`, home. */}
            <p
              className={`transition-opacity duration-200 ${shown > files.length ? "opacity-100" : "opacity-0"}`}
            >
              <a
                href="#main"
                tabIndex={shown > files.length ? undefined : -1}
                onClick={(event) => {
                  if (scrollToAnchor("#main")) event.preventDefault();
                }}
                className="group inline-flex min-h-6 items-center"
              >
                <span className="text-[#28c840]">$</span>&nbsp;
                <span className="group-hover:text-white">cd ~</span>
                <span className="ml-3 text-white/60 transition-colors group-hover:text-[#5b9bff]">
                  # {t("backToTop")} ↑
                </span>
                <span
                  aria-hidden
                  className="build-caret ml-1 inline-block h-[1.1em] w-[0.55em] bg-[#5b9bff]"
                />
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted">
        <KevinMark className="h-6 w-auto shrink-0 text-accent" />
        <p>
          © {year} {profile.fullName}
        </p>
      </div>
    </footer>
  );
}

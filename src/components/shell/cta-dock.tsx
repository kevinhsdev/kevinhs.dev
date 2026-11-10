"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import { LiquidGlassDock } from "@/components/ui/liquid-glass-dock";
import { profile } from "@/content/profile";
import { GitHubIcon, InstagramIcon, LinkedInIcon } from "./brand-icons";
import { useCvLabel } from "./ctas";

/** The glyph alone on a 64 frame, so the glass reads through; accent on hover. */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      focusable="false"
      className="rounded-full text-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-contrast"
    >
      {children}
    </svg>
  );
}

/**
 * The four CTAs, one click away, small in the bottom-right corner. Hidden (and inert)
 * while any watched section, which has its own CTAs, is on screen.
 */
export function CtaDock({ watch = ["hero", "contact"] }: { watch?: string[] }) {
  const t = useTranslations("cta");
  const cv = useCvLabel();
  const [visible, setVisible] = useState(false);
  const key = watch.join(",");

  useEffect(() => {
    const seen = new Set<Element>();
    const targets = key.split(",").flatMap((id) => document.getElementById(id) ?? []);
    if (!targets.length) {
      // Nothing to watch on this page: show it once the frame paints.
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target);
        else seen.delete(e.target);
      }
      setVisible(seen.size === 0);
    });
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);

  return (
    <LiquidGlassDock
      label={t("dock")}
      inert={!visible}
      data-visible={visible}
      data-print="hide"
      className="cta-dock fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 rounded-[22px]! p-1.5! [--lgd-blur:10px] [--lgd-gap:2px] [--lgd-icon:44px] [--lgd-tint:color-mix(in_srgb,var(--foreground)_7%,transparent)] sm:right-6 sm:bottom-6"
      items={[
        {
          title: cv.label,
          href: cv.href,
          download: true,
          icon: (
            <Glyph>
              <Download x={20} y={20} width={24} height={24} />
            </Glyph>
          ),
        },
        {
          title: t("linkedin"),
          href: profile.links.linkedin,
          external: true,
          icon: (
            <Glyph>
              <LinkedInIcon x={21} y={21} width={22} height={22} />
            </Glyph>
          ),
        },
        {
          title: t("instagram"),
          href: profile.links.instagram,
          external: true,
          icon: (
            <Glyph>
              <InstagramIcon x={21} y={21} width={22} height={22} />
            </Glyph>
          ),
        },
        {
          title: t("github"),
          href: profile.links.github,
          external: true,
          icon: (
            <Glyph>
              <GitHubIcon x={21} y={21} width={22} height={22} />
            </Glyph>
          ),
        },
      ]}
    />
  );
}

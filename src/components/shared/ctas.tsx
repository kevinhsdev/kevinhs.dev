"use client";

import { Check, Copy, Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ComponentProps } from "react";
// Raw content (no Zod) keeps the client bundle small; it is validated at build time.
import { profile } from "@/content/profile";
import { trackCta } from "@/lib/analytics";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

/** `compact` keeps only the icon visible; the label stays for screen readers and as a tooltip. */
type CtaProps = { source: string; className?: string; compact?: boolean };

/** Downloads the CV in the current language, falling back to PT until the EN one exists. */
export function CvButton({ source, className, compact }: CtaProps) {
  const t = useTranslations("cta");
  const locale = useLocale();
  const href = (locale === "en" && profile.cv.en) || profile.cv.pt;
  const isFallback = locale === "en" && !profile.cv.en;
  const label = isFallback ? t("downloadCvLang", { lang: "PT" }) : t("downloadCv");

  return (
    <a
      href={href}
      download
      onClick={() => trackCta("cv_download", { locale, source })}
      className={className}
      title={compact ? label : undefined}
    >
      <Download aria-hidden className="size-4" />
      <span className={cn(compact && "sr-only")}>{label}</span>
    </a>
  );
}

export function LinkedInButton({ source, className, children }: CtaProps & ComponentProps<"a">) {
  const t = useTranslations("cta");
  const locale = useLocale();
  return (
    <a
      href={profile.links.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackCta("linkedin_click", { locale, source })}
      className={className}
    >
      {children ?? t("linkedin")}
    </a>
  );
}

export function GitHubButton({ source, className, children }: CtaProps & ComponentProps<"a">) {
  const t = useTranslations("cta");
  const locale = useLocale();
  return (
    <a
      href={profile.links.github}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackCta("github_click", { locale, source })}
      className={className}
    >
      {children ?? t("github")}
    </a>
  );
}

export async function copyEmail(
  messages: { copied: string; failed: string },
  meta: { locale: string; source: string },
): Promise<boolean> {
  trackCta("email_copy", meta);
  try {
    await navigator.clipboard.writeText(profile.email);
    void notify(messages.copied, { kind: "success", description: profile.email });
    return true;
  } catch {
    void notify(messages.failed);
    return false;
  }
}

export function CopyEmailButton({ source, className, compact }: CtaProps) {
  const t = useTranslations("cta");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const ok = await copyEmail(
      { copied: t("emailCopied"), failed: t("emailCopyFailed", { email: profile.email }) },
      { locale, source },
    );
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      title={compact ? t("copyEmail") : undefined}
    >
      <span className="relative inline-flex size-4">
        <Copy
          aria-hidden
          className={cn(
            "absolute size-4 transition-[opacity,scale] duration-200 ease-out-quint",
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <Check
          aria-hidden
          className={cn(
            "absolute size-4 transition-[opacity,scale] duration-200 ease-out-quint",
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        />
      </span>
      <span className={cn(compact && "sr-only")}>{t("copyEmail")}</span>
    </button>
  );
}

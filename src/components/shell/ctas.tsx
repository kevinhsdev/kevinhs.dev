"use client";

import { Check, Copy, Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { MetalButton } from "@/components/ui/mercurio";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { cvHref } from "@/lib/ctas";
import { cn } from "@/lib/utils";
import { GitHubIcon, InstagramIcon, LinkedInIcon } from "./brand-icons";

/** `compact` shows the icon only; the label stays for screen readers and as a tooltip. */
type CtaProps = { className?: string; compact?: boolean };

export function useCvLabel() {
  const t = useTranslations("cta");
  const { href, fallback } = cvHref(useLocale() as Locale);
  return { href, label: fallback ? t("downloadCvLang", { lang: "PT" }) : t("downloadCv") };
}

export function CvButton({ className, compact }: CtaProps) {
  const { href, label } = useCvLabel();
  return (
    <a href={href} download className={className} title={compact ? label : undefined}>
      <Download aria-hidden className="size-4" />
      <span className={cn(compact && "sr-only")}>{label}</span>
    </a>
  );
}

/** The CV download as a Mercúrio button (the hero's primary CTA). */
export function MetalCvButton({ className }: { className?: string }) {
  const { href, label } = useCvLabel();
  return (
    <MetalButton href={href} className={className}>
      {label}
    </MetalButton>
  );
}

function External({
  href,
  label,
  icon,
  className,
  compact,
}: CtaProps & { href: string; label: string; icon: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={compact ? label : undefined}
    >
      {icon}
      <span className={cn(compact && "sr-only")}>{label}</span>
    </a>
  );
}

export function LinkedInButton(props: CtaProps) {
  const t = useTranslations("cta");
  return (
    <External
      {...props}
      href={profile.links.linkedin}
      label={t("linkedin")}
      icon={<LinkedInIcon className="size-4" />}
    />
  );
}

export function InstagramButton(props: CtaProps) {
  const t = useTranslations("cta");
  return (
    <External
      {...props}
      href={profile.links.instagram}
      label={t("instagram")}
      icon={<InstagramIcon className="size-4" />}
    />
  );
}

export function GitHubButton(props: CtaProps) {
  const t = useTranslations("cta");
  return (
    <External
      {...props}
      href={profile.links.github}
      label={t("github")}
      icon={<GitHubIcon className="size-4" />}
    />
  );
}

/** Copies the e-mail; if the clipboard refuses, says the address and opens mailto. */
export function useCopyEmail() {
  const t = useTranslations("cta");
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast.success(t("emailCopied"), { description: profile.email });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast(t("emailCopyFailed", { email: profile.email }));
      window.location.href = `mailto:${profile.email}`;
    }
  }
  return { copy, copied, label: t("copyEmail") };
}

export function CopyEmailButton({ className, compact }: CtaProps) {
  const { copy, copied, label } = useCopyEmail();
  const Icon = copied ? Check : Copy;
  return (
    <button type="button" onClick={copy} className={className} title={compact ? label : undefined}>
      <Icon aria-hidden className="size-4" />
      <span className={cn(compact && "sr-only")}>{label}</span>
    </button>
  );
}

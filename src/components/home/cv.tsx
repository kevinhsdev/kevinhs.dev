"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { MetalButton } from "@/components/ui/mercurio";
import { profile } from "@/content/profile";
import "./cv.css";

const LANGS = ["pt", "en", "es"] as const;
type Lang = (typeof LANGS)[number];

/** Each CV ships with a .webp of its first page next to the .pdf (scripts/cv/preview.py). */
const previewOf = (pdf: string) => pdf.replace(/\.pdf$/, ".webp");

/** The CV on its own: pick a language (the site's by default), see the first page, download. */
export function CvSection() {
  const t = useTranslations("cv");
  const [lang, setLang] = useState<Lang>(useLocale() as Lang);
  const href = profile.cv[lang];

  return (
    <section id="cv" aria-labelledby="cv-title" className="cv">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-24 pb-24 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:pt-28">
        <div className="lg:col-span-5">
          <p className="cv-label">{t("kicker")}</p>
          <h2 id="cv-title" className="cv-title">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-md text-lg text-muted">{t("intro")}</p>

          <div className="cv-langs" role="group" aria-label={t("choose")}>
            {LANGS.map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
                <b>{l.toUpperCase()}</b>
                <span>{t(`langs.${l}`)}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <MetalButton href={href}>{t("download")}</MetalButton>
            <a href={href} target="_blank" rel="noopener" className="cv-open">
              {t("open")}
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          </div>
        </div>

        <div className="cv-preview lg:col-span-7">
          <a
            href={href}
            target="_blank"
            rel="noopener"
            className="cv-paper"
            aria-label={`${t("open")}: ${t(`langs.${lang}`)}`}
          >
            <Image
              key={href}
              src={previewOf(href)}
              alt={t("preview", { lang: t(`langs.${lang}`) })}
              width={1818}
              height={2573}
              unoptimized
            />
          </a>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Crown, Download, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PixelAvatar } from "@/components/creative/pixel-avatar";
import { readSkin, setSkin, subscribeSkin, type Skin } from "@/components/shared/arcade-state";
import {
  certificateId,
  downloadCertificatePdf,
  drawCertificate,
  type CertificateText,
} from "@/components/shared/certificate";
import {
  isLegend,
  subscribeUnlocked,
  unlockedSnapshot,
  visitorAchievements,
} from "@/components/shared/visitor-achievements-data";

/*
 * The reward for every trophy, arcade ones included: the legend skin and a
 * certificate with the visitor's name, previewed live and saved as a PDF
 * (certificate.ts). Until then it shows the legend's silhouette and how many
 * trophies are left.
 */

export function LegendReward() {
  const t = useTranslations("visitorAchievements.legend");
  const locale = useLocale();
  const snapshot = useSyncExternalStore(subscribeUnlocked, unlockedSnapshot, () => "");
  const skin = useSyncExternalStore(subscribeSkin, readSkin, (): Skin => "hacker");
  const [name, setName] = useState("");
  const got = new Set(snapshot ? snapshot.split(",") : []);
  const total = visitorAchievements.length;
  const count = visitorAchievements.filter((a) => got.has(a.id)).length;
  const done = isLegend(snapshot);

  const preview = useRef<HTMLCanvasElement>(null);
  const shown = name.trim() || t("placeholder");
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date());
  const text: CertificateText = {
    brand: t("cert.brand"),
    title: t("cert.title"),
    kicker: t("cert.kicker"),
    lead: t("cert.lead"),
    body: t("cert.body", { total }),
    body2: t("cert.body2"),
    date,
    dateLabel: t("cert.dateLabel"),
    sign: t("cert.sign"),
    role: t("cert.role"),
    id: t("cert.id", { id: certificateId(shown, date) }),
  };
  const key = JSON.stringify([shown, text]);

  // redraw the preview as the name is typed (fonts first, or the canvas falls back)
  useEffect(() => {
    if (!done) return;
    let live = true;
    const id = setTimeout(() => {
      void document.fonts.ready.then(() => {
        const [who, words] = JSON.parse(key) as [string, CertificateText];
        if (live && preview.current) drawCertificate(preview.current, 0.4, who, words);
      });
    }, 120);
    return () => {
      live = false;
      clearTimeout(id);
    };
  }, [done, key]);

  return (
    <div className={done ? "vt-legend" : "vt-legend is-locked"}>
      <span className="vt-legend-art px-live" data-skin="legend" data-mood="idle" aria-hidden>
        <span>
          <PixelAvatar />
        </span>
      </span>
      <div className="vt-legend-body">
        <h3>
          {done ? (
            <Crown aria-hidden className="size-4" />
          ) : (
            <Lock aria-hidden className="size-4" />
          )}
          {t("title")}
        </h3>
        <p>{done ? t("note") : t("lockedNote", { got: count, total })}</p>
        {done && (
          <figure className="vt-cert">
            <canvas ref={preview} role="img" aria-label={t("preview")} />
          </figure>
        )}
        {done && (
          <div className="vt-legend-actions">
            <label>
              <span>{t("name")}</span>
              <input
                value={name}
                maxLength={40}
                placeholder={t("placeholder")}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="px-start"
              onClick={() => void downloadCertificatePdf(shown, text, t("cert.file"))}
            >
              <Download aria-hidden className="size-4" />
              {t("download")}
            </button>
            <button
              type="button"
              className="px-start"
              disabled={skin === "legend"}
              onClick={() => setSkin("legend")}
            >
              <Crown aria-hidden className="size-4" />
              {skin === "legend" ? t("equipped") : t("equip")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

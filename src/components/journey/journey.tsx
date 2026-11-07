import { getTranslations } from "next-intl/server";
import { gallery, pick, timeline } from "@/content";
import type { Locale } from "@/i18n/routing";
import { JourneyStage, type JourneyData } from "./journey-stage";
import "./journey.css";

const photo = (id: string, locale: Locale) => {
  const p = gallery.find((g) => g.id === id);
  if (!p) throw new Error(`gallery photo missing: ${id}`);
  return { ...p, alt: pick(p.alt, locale), caption: pick(p.caption, locale) };
};
const item = (id: string) => {
  const i = timeline.find((x) => x.id === id);
  if (!i) throw new Error(`timeline item missing: ${id}`);
  return i;
};
const year = (date: string | null | undefined) => date?.slice(0, 4) ?? "";

/** The globe journey: facts from the timeline and gallery, laid out by JourneyStage. */
export async function Journey({ locale }: { locale: Locale }) {
  const t = await getTranslations("journey");
  const oase = item("oase-apprentice");
  const umc = item("umc");
  const malta = item("ef-malta");

  const data: JourneyData = {
    title: t("title"),
    // One per entry of TITLES in lib/journey.ts.
    titles: [
      { kicker: t("title"), heading: t("saoPaulo") },
      {
        kicker: oase.location ? pick(oase.location, locale) : "",
        heading: t("school"),
        line: `${oase.org.split(" · ").at(-1)} · ${t("schoolYears")}`,
      },
      {
        kicker: `${year(umc.start)} → ${year(umc.end)}`,
        heading: pick(umc.title, locale),
        line: umc.org,
      },
      {
        kicker: `${year(oase.start)} → ${t("present")}`,
        heading: pick(oase.title, locale),
        line: oase.org,
      },
      { kicker: year(malta.start), heading: t("flight") },
      { kicker: t("malta"), heading: pick(malta.title, locale), line: malta.org },
      { kicker: t("title"), heading: t("plans"), line: t("plansText") },
      { kicker: t("title"), heading: t("outro"), cta: t("outroCta") },
    ],
    sp: ["luterano", "umc", "notebook"].map((id) => photo(id, locale)),
    malta: ["malta", "st-julians", "malta-rotunda", "malta-rua", "malta-noite", "malta-jornal"].map(
      (id) => photo(id, locale),
    ),
    globe: {
      sp: t("saoPaulo"),
      malta: t("malta"),
      spain: t("spain"),
      usa: t("usa"),
    },
    carousel: {
      label: t("photos"),
      previous: t("previous"),
      next: t("next"),
      status: t("status", { i: "{i}", n: "{n}" }),
    },
  };

  return <JourneyStage data={data} />;
}

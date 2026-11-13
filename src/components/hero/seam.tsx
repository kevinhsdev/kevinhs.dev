import { getTranslations } from "next-intl/server";
import { pick, profile } from "@/content";
import type { Locale } from "@/i18n/routing";

/**
 * The seam under the hero: two crossed tapes running opposite ways over the line where the
 * shader ends and the page begins (the hero itself fades into the page background).
 */
export async function HeroSeam({ locale }: { locale: Locale }) {
  const t = await getTranslations("hero");
  const words = [
    t("role1"),
    ...t("role2").split(" · "),
    ...profile.stackLine.split(" · "),
    "DevOps",
    pick(profile.status, locale),
  ];
  const tape = (key: string) => (
    <ul key={key} className="seam__run">
      {words.map((w) => (
        <li key={w}>{w}</li>
      ))}
    </ul>
  );
  return (
    <div className="seam" aria-hidden>
      <div className="seam__tape seam__tape--back">
        <div className="seam__track">{["a", "b"].map(tape)}</div>
      </div>
      <div className="seam__tape seam__tape--front">
        <div className="seam__track">{["a", "b"].map(tape)}</div>
      </div>
    </div>
  );
}

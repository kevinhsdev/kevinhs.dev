import { achievements, pick, type Achievement } from "@/content";
import type { Locale } from "@/i18n/routing";

// PROTOTYPE helpers shared by the Achievements views. Once one view is chosen,
// fold what it needs into the content schema (e.g. `branch`) and drop the rest.

export type Branch = "backend" | "cloud" | "ai" | "security" | "languages" | "community" | "career";

export const branches: { id: Branch; pt: string; en: string }[] = [
  { id: "backend", pt: "Backend", en: "Backend" },
  { id: "cloud", pt: "Cloud", en: "Cloud" },
  { id: "ai", pt: "IA", en: "AI" },
  { id: "security", pt: "Segurança", en: "Security" },
  { id: "languages", pt: "Idiomas", en: "Languages" },
  { id: "community", pt: "Comunidade", en: "Community" },
  { id: "career", pt: "Carreira", en: "Career" },
];

const branchById: Record<string, Branch> = {
  alura: "backend",
  "bootcamp-itau": "backend",
  "dio-ai": "ai",
  "aws-cloud-practitioner": "cloud",
  "bootcamp-santander": "security",
  "cna-c1": "languages",
  "ef-malta": "languages",
  cambridge: "languages",
  "gdg-cloud-sp": "community",
  "soujava-oracle": "community",
  hackathon: "community",
  internship: "career",
};

export function branchOf(a: Achievement): Branch {
  return branchById[a.id] ?? "career";
}

export const unlocked = achievements.filter((a) => a.status === "unlocked");
export const score = unlocked.reduce((sum, a) => sum + a.xp, 0);
export const maxScore = achievements.reduce((sum, a) => sum + a.xp, 0);

/** Rarity tier from the XP an achievement is worth. */
export function rarity(xp: number) {
  if (xp >= 1000) return "platinum";
  if (xp >= 200) return "gold";
  if (xp >= 150) return "silver";
  return "bronze";
}

/** Every 250 XP is a level. */
export function level(xp = score) {
  const size = 250;
  return { level: Math.floor(xp / size) + 1, into: xp % size, size };
}

/** Kevin's score at the end of each year: the "vs. myself" high-score table. */
export function yearlyScores() {
  const years = [
    ...new Set(unlocked.flatMap((a) => (a.date ? [Number(a.date.slice(0, 4))] : []))),
  ].sort();
  return years.map((year) => ({
    year,
    score: unlocked
      .filter((a) => a.date && Number(a.date.slice(0, 4)) <= year)
      .reduce((sum, a) => sum + a.xp, 0),
  }));
}

export const tiers = ["bronze", "silver", "gold", "platinum"] as const;

/** Earned vs. total per rarity tier, like a console's trophy summary. */
export function rarityTiers() {
  return tiers.map((tier) => ({
    tier,
    earned: unlocked.filter((a) => rarity(a.xp) === tier).length,
    all: achievements.filter((a) => rarity(a.xp) === tier).length,
  }));
}

/** XP and unlocks gained within each year (not cumulative): one "season" per year. */
export function seasons() {
  return yearlyScores().map((y, i, all) => ({
    year: y.year,
    xp: y.score - (all[i - 1]?.score ?? 0),
    count: unlocked.filter((a) => a.date?.startsWith(String(y.year))).length,
  }));
}

/** Path order for the map: done (oldest first), then in progress, then goals by size. */
export const journeyOrder = [
  ...unlocked.slice().sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")),
  ...achievements.filter((a) => a.status === "progress"),
  ...achievements.filter((a) => a.status === "locked").sort((a, b) => a.xp - b.xp),
];

/** Points per branch, for the character sheet. */
export function attributes(locale: Locale) {
  return branches.map((b) => {
    const items = achievements.filter((a) => branchOf(a) === b.id);
    const earned = items.filter((a) => a.status === "unlocked").reduce((s, a) => s + a.xp, 0);
    const possible = items.reduce((s, a) => s + a.xp, 0);
    return { id: b.id, label: b[locale], earned, possible };
  });
}

export function formatMonth(date: string | undefined, locale: Locale) {
  if (!date) return "";
  const [year, month] = date.split("-");
  if (!month) return year;
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(`${date}-15T12:00:00Z`))
    .replace(".", "");
}

/** A plain, serializable copy for client components. */
export function plain(a: Achievement, locale: Locale) {
  return {
    id: a.id,
    status: a.status,
    kind: a.kind,
    xp: a.xp,
    title: pick(a.title, locale),
    org: a.org ?? "",
    date: formatMonth(a.date, locale),
    hint: a.hint ? pick(a.hint, locale) : "",
  };
}
export type PlainAchievement = ReturnType<typeof plain>;

import { gallery, pick, timeline } from "@/content";
import type { Locale } from "@/i18n/routing";
import type { ArtRecipe } from "@/components/ui/glass-folder";

/** Blues for the folders' back panel: a pale long exposure and a deep marble. */
const PALE_STREAK: ArtRecipe = {
  style: "streak",
  colors: ["#eef2f9", "#c9d8f3", "#8fb2ee", "#4d8dff", "#1f4fd6", "#dfe8f7"],
  scale: 0.7,
  warp: 1.3,
  angle: -0.6,
  gloss: 0.2,
  veins: 0,
};
const DEEP_MARBLE: ArtRecipe = {
  style: "marble",
  colors: ["#070d1f", "#0e1730", "#1f4fd6", "#0a1430", "#4d8dff", "#9cc0ff"],
  scale: 0.9,
  warp: 1.6,
  gloss: 0.35,
  veins: 0.3,
};

const FOLDERS = [
  {
    key: "languages",
    art: PALE_STREAK,
    files: [
      { id: "cna-c1", meta: "CNA · 2024" },
      { id: "ef-malta", meta: "EF · Malta · 2025" },
    ],
  },
  {
    key: "courses",
    art: DEEP_MARBLE,
    tone: "dark",
    files: [
      { id: "dio-ai", meta: "DIO · 09/2026" },
      { id: "alura", meta: "Alura · 2026" },
    ],
  },
] as const;

export type CertificateFolder = {
  /** about.<key> in the messages. */
  key: "languages" | "courses";
  art: ArtRecipe;
  tone?: "dark";
  files: { id: string; name: string; meta: string }[];
};

/**
 * Finished certificates only (courses in progress stay in "studying now"). Each file is named
 * after its timeline entry. TODO(kevin): the certificate PDFs, then each file gets its href.
 */
export function certificateFolders(locale: Locale): CertificateFolder[] {
  return FOLDERS.map((f) => ({
    ...f,
    files: f.files.map(({ id, meta }) => {
      const item = timeline.find((t) => t.id === id);
      if (!item) throw new Error(`certificate "${id}" is not in the timeline`);
      return { id, name: pick(item.title, locale), meta };
    }),
  }));
}

const EVENTS: { id: string; meta?: string }[] = [
  { id: "gdg-cloud-sp", meta: "FIAP · 09/2026" },
  { id: "soujava-oracle", meta: "SouJava · Oracle · 09/2026" },
  { id: "claude-oracle" },
  { id: "palestra-carreira-codigo" },
  { id: "coffee-break" },
];

/** The events strip: gallery photos with their captions. */
export function eventOptions(locale: Locale) {
  return EVENTS.map(({ id, meta }) => {
    const photo = gallery.find((g) => g.id === id);
    if (!photo) throw new Error(`event photo "${id}" is not in the gallery`);
    return {
      id,
      title: pick(photo.caption, locale),
      description: meta,
      image: photo.src,
    };
  });
}

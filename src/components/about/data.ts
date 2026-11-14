import { pick } from "@/content";
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

type L = { pt: string; en: string; es: string };
const pdf = (file: string) => `/certificates/${file}`;
/** The first page as an image (public/certificates/previews), for the belt, the grid and the viewer. */
const pv = (file: string, width: number, height: number) => ({
  src: `/certificates/previews/${file}.jpg`,
  width,
  height,
});

/**
 * Finished certificates only (courses in progress stay in "studying now"), as printed on each
 * one: name, issuer, date and hours. The files are in public/certificates. A folder shows its
 * last four, so each list runs oldest to newest.
 */
const FOLDERS = [
  {
    key: "languages",
    art: PALE_STREAK,
    files: [
      // TODO(kevin): the CNA certificate file, if you want it linked too
      {
        id: "cna-c1",
        name: {
          pt: "Inglês Avançado (C1)",
          en: "Advanced English (C1)",
          es: "Inglés Avanzado (C1)",
        },
        meta: "CNA · 2024",
      },
      {
        id: "ef-malta",
        name: {
          pt: "Inglês em tempo integral · B1-2",
          en: "Full-time English · B1-2",
          es: "Inglés a tiempo completo · B1-2",
        },
        meta: "EF · Malta · 07/2025",
        href: pdf("ef-malta.pdf"),
        preview: pv("ef-malta", 1009, 1400),
      },
    ],
  },
  {
    key: "dio",
    art: DEEP_MARBLE,
    tone: "dark",
    files: [
      {
        id: "dio-itau-welcome",
        name: "Boas vindas ao Bootcamp Itaú: Java com Inteligência Artificial",
        meta: "DIO · Itaú · 08/2026 · 1h",
        href: pdf("dio-bootcamp-itau-boas-vindas.pdf"),
        preview: pv("dio-bootcamp-itau-boas-vindas", 1400, 992),
      },
      {
        id: "dio-ai",
        name: "Fundamentos da IA Moderna: Machine Learning, LLMs, IA Generativa e Agentes",
        meta: "DIO · 09/2026 · 2h",
        href: pdf("dio-fundamentos-ia.pdf"),
        preview: pv("dio-fundamentos-ia", 1400, 992),
      },
    ],
  },
  {
    key: "alura",
    art: PALE_STREAK,
    files: [
      [
        "comecando-programacao",
        "Começando em Programação: carreira e primeiros passos",
        "05/2026 · 1h",
      ],
      [
        "logica-javascript",
        "Lógica de programação: mergulhe em programação com JavaScript",
        "05/2026 · 6h",
      ],
      ["logica-funcoes-listas", "Lógica de programação: explore funções e listas", "05/2026 · 6h"],
      ["git-github", "Git e GitHub: compartilhando e colaborando em projetos", "05/2026 · 8h"],
      ["java-primeira-aplicacao", "Java: criando a sua primeira aplicação", "05/2026 · 8h"],
      ["java-orientacao-objetos", "Java: aplicando a Orientação a Objetos", "05/2026 · 10h"],
      ["java-listas-colecoes", "Java: trabalhando com listas e coleções de dados", "05/2026 · 8h"],
      [
        "java-api-arquivos-erros",
        "Java: consumindo API, gravando arquivos e lidando com erros",
        "06/2026 · 10h",
      ],
    ].map(([slug, name, when]) => ({
      id: `alura-${slug}`,
      name: name!,
      meta: `Alura · ${when}`,
      href: pdf(`alura-${slug}.pdf`),
      preview: pv(`alura-${slug}`, 1400, 944),
    })),
  },
  {
    key: "events",
    art: DEEP_MARBLE,
    tone: "dark",
    files: [
      {
        id: "soujava-2026-09",
        name: "Encontro SouJava Setembro 2026: Parceria Oracle Brasil",
        meta: "SouJava · 09/2026 · 3h",
        href: pdf("soujava-2026-09.jpg"),
        preview: pv("soujava-2026-09", 1170, 814),
      },
    ],
  },
] as const satisfies readonly {
  key: CertificateFolder["key"];
  art: ArtRecipe;
  tone?: "dark";
  files: readonly {
    id: string;
    name: string | L;
    meta: string;
    href?: string;
    preview?: Preview;
  }[];
}[];

export type CertificateFolder = {
  /** about.<key> in the messages. */
  key: "languages" | "dio" | "alura" | "events";
  art: ArtRecipe;
  tone?: "dark";
  files: { id: string; name: string; meta: string; href?: string; preview?: Preview }[];
};
export type Preview = { src: string; width: number; height: number };

export function certificateFolders(locale: Locale): CertificateFolder[] {
  return FOLDERS.map((f) => ({
    ...f,
    files: f.files.map((file) => ({ ...file, name: pick(file.name, locale) })),
  }));
}

/**
 * Which photo goes where on About. Change the ids to choose the photos; every id must be in
 * src/content/gallery.ts (a test checks). A photo may repeat, but use repeats sparingly.
 * Available: malta, malta-rotunda, malta-rua, malta-noite, malta-jornal, st-julians, aviao,
 * notebook, adesivos, luterano, umc, cna, fiap, gdg-cloud-sp, soujava-oracle, claude-oracle,
 * palestra-carreira-codigo, coffee-break, guitarra-luz, teclado, guitarra, instrumentos, volei,
 * volei-jogo. The hero uses the portrait in src/content/profile.ts (photo).
 */
export const ABOUT_PHOTOS = {
  /** the two offset photos under the intro */
  intro: ["guitarra", "volei-jogo"],
  /** the photo floating through the statement */
  statement: "adesivos",
  /** the sideways story, one list per stop */
  story: {
    start: ["notebook", "adesivos"],
    today: ["luterano", "umc"],
    next: ["claude-oracle", "gdg-cloud-sp", "soujava-oracle", "palestra-carreira-codigo"],
    malta: ["malta", "aviao", "st-julians"],
  },
  /** hobbies, one panel each: every photo, as a mosaic that opens with the panel */
  hobbies: {
    music: ["guitarra-luz", "teclado", "guitarra", "instrumentos"],
    sport: ["volei", "volei-jogo"],
  },
};

/** Every photo id used on About, in page order. */
export function aboutPhotoIds(): string[] {
  const { intro, statement, story, hobbies } = ABOUT_PHOTOS;
  return [intro, statement, Object.values(story), Object.values(hobbies)].flat(2);
}

/** What Kevin confirmed about each event, shown after its caption. */
export const EVENT_META: Record<string, string> = {
  "gdg-cloud-sp": "09/2026",
  "soujava-oracle": "09/2026",
};

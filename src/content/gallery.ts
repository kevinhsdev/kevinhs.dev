import type { z } from "zod";
import type { gallerySchema } from "./schema";

/**
 * Photos for the "About me" wall and the polaroid stack on the home page (the
 * first three). Files live in /public. No people without their consent, and
 * nothing that identifies students; strip metadata before adding a photo.
 */
export const gallery = [
  {
    id: "malta",
    src: "/journey/malta.jpg",
    alt: {
      pt: "Bandeira da EF ao vento diante de uma baía com barcos em Malta",
      en: "An EF flag flying over a bay full of boats in Malta",
    },
    caption: { pt: "Intercâmbio em Malta, 2025", en: "Studying abroad in Malta, 2025" },
    focus: "40% 62%",
  },
  {
    id: "gdg-cloud-sp",
    src: "/journey/gdg-cloud-sp.jpg",
    alt: {
      pt: "Telão com “GDG Cloud São Paulo” numa sala de eventos",
      en: "A screen reading “GDG Cloud São Paulo” in an event room",
    },
    caption: { pt: "GDG Cloud São Paulo, na FIAP", en: "GDG Cloud São Paulo, at FIAP" },
    focus: "72% 55%",
  },
  {
    id: "luterano",
    src: "/journey/luterano.jpg",
    alt: {
      pt: "Fachada do Instituto Educacional Luterano, com o nome no prédio",
      en: "The front of the Instituto Educacional Luterano building, with its name on the wall",
    },
    caption: { pt: "Onde trabalho hoje", en: "Where I work today" },
    focus: "38% 45%",
  },
  {
    id: "soujava-oracle",
    src: "/journey/soujava-oracle.jpg",
    alt: {
      pt: "Escultura do logotipo da Oracle no saguão do escritório, à noite",
      en: "The Oracle logo sculpture in the office lobby at night",
    },
    caption: { pt: "Encontro SouJava × Oracle", en: "SouJava × Oracle meetup" },
    focus: "50% 58%",
  },
] satisfies z.input<typeof gallerySchema>[];

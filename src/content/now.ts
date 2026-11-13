import type { z } from "zod";
import type { nowSchema } from "./schema";

/**
 * The /now page. Update once a month.
 * TODO(kevin): add progress (0–100) to each learning item to fill its bar on About.
 */
export const now = {
  updatedAt: "2026-09",
  learning: [
    {
      title: { pt: "AWS Cloud Practitioner", en: "AWS Cloud Practitioner" },
      text: {
        pt: "Estudando AWS, rumo à certificação.",
        en: "Studying AWS, working toward the certification.",
      },
      status: { pt: "Prova prevista para dezembro", en: "Exam expected in December" },
    },
    {
      title: { pt: "Bootcamps", en: "Bootcamps" },
      text: {
        pt: "Santander (Cibersegurança) e Itaú (Java com IA).",
        en: "Santander (Cybersecurity) and Itaú (Java with AI).",
      },
    },
    {
      title: { pt: "Spring Data JPA", en: "Spring Data JPA" },
      text: { pt: "E testes automatizados.", en: "And automated testing." },
    },
  ],
  building: [
    {
      pt: "SEK · Gestão Escolar: evolução contínua da versão 5.8, em uso pela secretaria.",
      en: "SEK school management: ongoing work on version 5.8, in use by the school office.",
    },
    {
      pt: "OASE · Lar: sistema para um lar de idosos, em levantamento de requisitos.",
      en: "OASE · Lar: a system for an elderly care home, gathering requirements.",
    },
    {
      pt: "Este portfólio, feito do zero com Next.js.",
      en: "This portfolio, built from scratch with Next.js.",
    },
  ],
} satisfies z.input<typeof nowSchema>;

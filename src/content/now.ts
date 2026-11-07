import type { z } from "zod";
import type { nowSchema } from "./schema";

/** The /now page. Update once a month. */
export const now = {
  updatedAt: "2026-09",
  learning: [
    {
      pt: "AWS, rumo à certificação Cloud Practitioner, prevista para dezembro.",
      en: "AWS, working toward the Cloud Practitioner certification, expected in December.",
    },
    {
      pt: "Bootcamps Santander (Cibersegurança) e Itaú (Java com IA).",
      en: "Santander (Cybersecurity) and Itaú (Java with AI) bootcamps.",
    },
    {
      pt: "Spring Data JPA e testes automatizados.",
      en: "Spring Data JPA and automated testing.",
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
      pt: "Este portfólio, com código aberto no GitHub.",
      en: "This portfolio, open source on GitHub.",
    },
  ],
} satisfies z.input<typeof nowSchema>;

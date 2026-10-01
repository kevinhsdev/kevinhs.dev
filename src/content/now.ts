import type { z } from "zod";
import type { nowSchema } from "./schema";

/** The /now page. Update once a month. */
export const now = {
  updatedAt: "2026-09",
  learning: [
    {
      pt: "AWS, rumo à certificação. TODO(kevin): qual e quando.",
      en: "AWS, working toward a certification. TODO(kevin): which one and when.",
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
      pt: "Secretaria IEL: evolução contínua da versão 5.8.",
      en: "Secretaria IEL: ongoing work on version 5.8.",
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

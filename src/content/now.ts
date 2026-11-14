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
      title: {
        pt: "AWS Cloud Practitioner",
        en: "AWS Cloud Practitioner",
        es: "AWS Cloud Practitioner",
      },
      text: {
        pt: "Estudando AWS, rumo à certificação.",
        en: "Studying AWS, working toward the certification.",
        es: "Estudiando AWS, rumbo a la certificación.",
      },
      status: {
        pt: "Prova prevista para dezembro",
        en: "Exam expected in December",
        es: "Examen previsto para diciembre",
      },
    },
    {
      title: { pt: "Bootcamps", en: "Bootcamps", es: "Bootcamps" },
      text: {
        pt: "Santander (Cibersegurança) e Itaú (Java com IA).",
        en: "Santander (Cybersecurity) and Itaú (Java with AI).",
        es: "Santander (Ciberseguridad) e Itaú (Java con IA).",
      },
    },
    {
      title: { pt: "Spring Data JPA", en: "Spring Data JPA", es: "Spring Data JPA" },
      text: {
        pt: "E testes automatizados.",
        en: "And automated testing.",
        es: "Y pruebas automatizadas.",
      },
    },
  ],
  building: [
    {
      pt: "SEK · Gestão Escolar: evolução contínua da versão 5.8, em uso pela secretaria.",
      en: "SEK school management: ongoing work on version 5.8, in use by the school office.",
      es: "SEK · Gestión Escolar: evolución continua de la versión 5.8, en uso por la secretaría.",
    },
    {
      pt: "OASE · Lar: sistema para um lar de idosos, em levantamento de requisitos.",
      en: "OASE · Lar: a system for an elderly care home, gathering requirements.",
      es: "OASE · Lar: sistema para una residencia de ancianos, en levantamiento de requisitos.",
    },
    {
      pt: "Este portfólio, feito do zero com Next.js.",
      en: "This portfolio, built from scratch with Next.js.",
      es: "Este portafolio, hecho desde cero con Next.js.",
    },
  ],
} satisfies z.input<typeof nowSchema>;

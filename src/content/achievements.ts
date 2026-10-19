import type { z } from "zod";
import type { achievementSchema } from "./schema";

/**
 * The arcade Achievements section. Order does not matter: unlocked come first
 * (newest first), then in progress, then locked goals.
 * TODO(kevin): add each certificate's `credentialUrl` (from LinkedIn).
 */
export const achievements = [
  {
    id: "dio-ai",
    status: "unlocked",
    kind: "cert",
    title: { pt: "Fundamentos da IA Moderna", en: "Foundations of Modern AI" },
    org: "DIO",
    date: "2026-09",
    xp: 150,
  },
  {
    id: "gdg-cloud-sp",
    status: "unlocked",
    kind: "event",
    title: { pt: "GDG Cloud São Paulo na FIAP", en: "GDG Cloud São Paulo at FIAP" },
    org: "Google Developer Groups",
    date: "2026-09",
    xp: 50,
  },
  {
    id: "soujava-oracle",
    status: "unlocked",
    kind: "event",
    title: { pt: "Encontro SouJava × Oracle", en: "SouJava × Oracle Meetup" },
    org: "SouJava · Oracle",
    date: "2026-09",
    xp: 50,
  },
  {
    id: "alura",
    status: "unlocked",
    kind: "cert",
    title: { pt: "Formação Java e Git na Alura", en: "Java and Git track at Alura" },
    org: "Alura",
    date: "2026",
    xp: 150,
  },
  {
    id: "ef-malta",
    status: "unlocked",
    kind: "language",
    title: { pt: "Intercâmbio de inglês em Malta", en: "English study abroad in Malta" },
    org: "EF",
    date: "2025-07",
    xp: 200,
  },
  {
    id: "cna-c1",
    status: "unlocked",
    kind: "language",
    title: { pt: "Inglês Avançado (C1)", en: "Advanced English (C1)" },
    org: "CNA",
    date: "2024",
    xp: 200,
  },
  {
    id: "bootcamp-santander",
    status: "progress",
    kind: "cert",
    title: { pt: "Bootcamp de Cibersegurança", en: "Cybersecurity Bootcamp" },
    org: "Santander",
    hint: { pt: "Em andamento", en: "In progress" },
    xp: 150,
  },
  {
    id: "bootcamp-itau",
    status: "progress",
    kind: "cert",
    title: { pt: "Bootcamp Java com IA", en: "Java with AI Bootcamp" },
    org: "Itaú",
    hint: { pt: "Em andamento", en: "In progress" },
    xp: 150,
  },
  {
    id: "aws-cloud-practitioner",
    status: "locked",
    kind: "cert",
    title: { pt: "AWS Cloud Practitioner", en: "AWS Cloud Practitioner" },
    org: "AWS",
    hint: { pt: "Prova prevista para dezembro de 2026", en: "Exam planned for December 2026" },
    xp: 300,
  },
  {
    id: "cambridge",
    status: "locked",
    kind: "language",
    title: { pt: "Certificado Cambridge", en: "Cambridge Certified" },
    org: "Cambridge English",
    hint: { pt: "Passar no exame de inglês de Cambridge", en: "Pass a Cambridge English exam" },
    xp: 300,
  },
  {
    id: "hackathon",
    status: "locked",
    kind: "competition",
    title: { pt: "Primeiro hackathon", en: "First hackathon" },
    hint: { pt: "Competir em um hackathon com um time", en: "Compete in a hackathon with a team" },
    xp: 400,
  },
  {
    id: "internship",
    status: "locked",
    kind: "career",
    title: { pt: "Primeiro estágio", en: "First internship" },
    hint: {
      pt: "Backend, DevOps/Cloud ou IA aplicada. Talvez na sua empresa?",
      en: "Backend, DevOps/Cloud or applied AI. Maybe at your company?",
    },
    xp: 1000,
  },
] satisfies z.input<typeof achievementSchema>[];

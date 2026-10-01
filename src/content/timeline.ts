import type { z } from "zod";
import type { timelineItemSchema } from "./schema";

/** Work, education and events in one list. Order does not matter; it is sorted by date. */
export const timeline = [
  {
    id: "oase-apprentice",
    kind: "work",
    title: {
      pt: "Auxiliar Administrativo · Jovem Aprendiz",
      en: "Administrative Assistant · Apprentice",
    },
    org: "OASE · Instituto Educacional Luterano",
    location: { pt: "Ferraz de Vasconcelos, SP", en: "Ferraz de Vasconcelos, Brazil" },
    start: "2025-08",
    end: "present",
    highlights: [
      {
        pt: "Criei uma ferramenta web (HTML/JS, OCR) que classifica e renomeia documentos escolares: o processamento de uma turma (~200 documentos) caiu de 3 dias para até 1, com dicionário de palavras-chave editável e perfis por setor.",
        en: "Built a web tool (HTML/JS, OCR) that classifies and renames school documents: processing a class (~200 documents) went from 3 days to 1 at most, with an editable keyword dictionary and per-department profiles.",
      },
      {
        pt: "Organizei e padronizei os registros de 545 alunos com fluxos de classificação documental, reduzindo erros de arquivamento.",
        en: "Organized and standardized the records of 545 students with document-classification workflows, reducing filing errors.",
      },
      {
        pt: "Por iniciativa própria, criei um sistema de gestão completo para a secretaria.",
        en: "On my own initiative, built a full management system for the office.",
      },
      {
        pt: "Redigi comunicações institucionais para as famílias e a equipe pedagógica.",
        en: "Wrote official communications to families and the teaching staff.",
      },
    ],
  },
  {
    id: "umc",
    kind: "study",
    title: { pt: "Bacharelado em Engenharia de Software", en: "B.Sc. in Software Engineering" },
    org: "Universidade de Mogi das Cruzes (UMC)",
    start: "2024-01",
    end: "2028-12",
    endIsExpected: true,
    highlights: [{ pt: "4º período.", en: "4th semester." }],
  },
  {
    id: "bootcamp-santander",
    kind: "study",
    title: {
      pt: "Bootcamp Santander: Cibersegurança do Zero à Prática",
      en: "Santander Bootcamp: Cybersecurity from Zero to Practice",
    },
    org: "Santander",
    start: null,
    inProgress: true,
  },
  {
    id: "bootcamp-itau",
    kind: "study",
    title: {
      pt: "Bootcamp Itaú: Java com Inteligência Artificial",
      en: "Itaú Bootcamp: Java with Artificial Intelligence",
    },
    org: "Itaú",
    start: null,
    inProgress: true,
  },
  {
    id: "aws-cert",
    kind: "study",
    title: {
      pt: "Certificação AWS Cloud Practitioner (prevista para dez. 2026)",
      en: "AWS Certified Cloud Practitioner (expected Dec 2026)",
    },
    org: "AWS",
    start: null,
    inProgress: true,
  },
  {
    id: "dio-ai",
    kind: "study",
    title: {
      pt: "Fundamentos da IA Moderna: ML, LLMs, IA Generativa e Agentes",
      en: "Foundations of Modern AI: ML, LLMs, Generative AI and Agents",
    },
    org: "DIO",
    start: "2026-09",
  },
  {
    id: "soujava-oracle",
    kind: "event",
    title: { pt: "Encontro SouJava × Oracle Brasil", en: "SouJava × Oracle Brazil Meetup" },
    org: "SouJava · Oracle",
    start: "2026-09",
  },
  {
    id: "alura",
    kind: "study",
    title: {
      pt: "Lógica de Programação I e II, Java, OO com Java, Listas e Coleções, Git e GitHub",
      en: "Programming Logic I & II, Java, OOP in Java, Lists & Collections, Git and GitHub",
    },
    org: "Alura",
    start: "2026",
  },
  {
    id: "ef-malta",
    kind: "study",
    title: { pt: "Intercâmbio de inglês em Malta", en: "English study abroad in Malta" },
    org: "EF International Language Campuses",
    start: "2025-07",
  },
  {
    id: "cna-c1",
    kind: "study",
    title: { pt: "Inglês Avançado (C1)", en: "Advanced English (C1)" },
    org: "CNA",
    start: "2024",
  },
] satisfies z.input<typeof timelineItemSchema>[];

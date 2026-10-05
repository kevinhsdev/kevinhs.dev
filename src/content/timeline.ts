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
        pt: "Criei o PDF Renamer, que classifica e renomeia documentos com OCR: uma turma (~200 documentos) caiu de 3 dias para até 1.",
        en: "Built PDF Renamer, which classifies and renames documents with OCR: a class (~200 documents) went from 3 days to 1 at most.",
      },
      {
        pt: "Por iniciativa própria, criei o SEK, o sistema de gestão que hoje toda a secretaria usa.",
        en: "On my own initiative, built SEK, the management system the whole office now uses.",
      },
      {
        pt: "Padronizei os registros de 545 alunos, reduzindo erros de arquivamento.",
        en: "Standardized the records of 545 students, reducing filing errors.",
      },
      {
        pt: "Redigi comunicados para as famílias e a equipe pedagógica.",
        en: "Wrote official notices to families and the teaching staff.",
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
    topics: [
      { pt: "Cibersegurança", en: "Cybersecurity" },
      { pt: "Do zero à prática", en: "From zero to practice" },
    ],
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
    topics: [
      { pt: "Java", en: "Java" },
      { pt: "Inteligência artificial", en: "Artificial intelligence" },
    ],
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
    topics: [
      { pt: "Cloud Practitioner", en: "Cloud Practitioner" },
      { pt: "Fundamentos de nuvem", en: "Cloud fundamentals" },
    ],
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
    topics: [
      { pt: "Machine learning", en: "Machine learning" },
      { pt: "LLMs", en: "LLMs" },
      { pt: "IA generativa", en: "Generative AI" },
      { pt: "Agentes", en: "Agents" },
    ],
  },
  {
    id: "gcloud-sp-fiap",
    kind: "event",
    title: {
      pt: "GDG Cloud São Paulo na FIAP",
      en: "GDG Cloud São Paulo at FIAP",
    },
    org: "Google Developer Groups Cloud São Paulo · FIAP",
    start: "2026-09",
    image: {
      src: "/journey/gdg-cloud-sp.jpg",
      alt: {
        pt: "Telão com “GDG Cloud São Paulo” numa sala de eventos",
        en: "A screen reading “GDG Cloud São Paulo” in an event room",
      },
      focus: "72% 55%",
    },
  },
  {
    id: "soujava-oracle",
    kind: "event",
    title: { pt: "Encontro SouJava × Oracle Brasil", en: "SouJava × Oracle Brazil Meetup" },
    org: "SouJava · Oracle",
    start: "2026-09",
    image: {
      src: "/journey/soujava-oracle.jpg",
      alt: {
        pt: "Escultura do logotipo da Oracle no saguão do escritório, à noite",
        en: "The Oracle logo sculpture in the office lobby at night",
      },
      focus: "50% 58%",
    },
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
    topics: [
      { pt: "Lógica I e II", en: "Logic I & II" },
      { pt: "Java", en: "Java" },
      { pt: "OO com Java", en: "OOP in Java" },
      { pt: "Listas e coleções", en: "Lists & collections" },
      { pt: "Git e GitHub", en: "Git & GitHub" },
    ],
  },
  {
    id: "ef-malta",
    kind: "study",
    title: { pt: "Intercâmbio de inglês em Malta", en: "English study abroad in Malta" },
    org: "EF International Language Campuses",
    start: "2025-07",
    image: {
      src: "/journey/malta.jpg",
      alt: {
        pt: "Bandeira da EF ao vento diante de uma baía com barcos em Malta",
        en: "An EF flag flying over a bay full of boats in Malta",
      },
      focus: "40% 62%",
    },
  },
  {
    id: "cna-c1",
    kind: "study",
    title: { pt: "Inglês Avançado (C1)", en: "Advanced English (C1)" },
    org: "CNA",
    start: "2024",
  },
] satisfies z.input<typeof timelineItemSchema>[];

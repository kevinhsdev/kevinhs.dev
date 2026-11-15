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
      es: "Auxiliar Administrativo · Aprendiz",
    },
    org: "OASE · Instituto Educacional Luterano",
    location: {
      pt: "Ferraz de Vasconcelos, SP",
      en: "Ferraz de Vasconcelos, Brazil",
      es: "Ferraz de Vasconcelos, Brasil",
    },
    // The banner (a student's photo and name) and the street number are blurred in the file.
    image: {
      src: "/journey/luterano.jpg",
      alt: {
        pt: "Fachada do Instituto Educacional Luterano, com o nome no prédio",
        en: "The front of the Instituto Educacional Luterano building, with its name on the wall",
        es: "La fachada del Instituto Educacional Luterano, con el nombre en el edificio",
      },
      focus: "38% 45%",
    },
    start: "2025-08",
    end: "present",
    highlights: [
      {
        pt: "Criei o KIRI, ferramenta web com OCR que classifica e renomeia documentos escolares, levando a secretaria de ~100 para ~300 documentos por dia (3×) e uma turma (~200 documentos) de 3 dias para até 1.",
        en: "Built KIRI, an OCR web tool that classifies and renames school documents, taking the office from ~100 to ~300 documents a day (3×) and a class (~200 documents) from 3 days to 1 at most.",
        es: "Creé KIRI, una herramienta web con OCR que clasifica y renombra documentos escolares, llevando a la secretaría de ~100 a ~300 documentos al día (3×) y un grupo (~200 documentos) de 3 días a 1 como máximo.",
      },
      {
        pt: "Por iniciativa própria, criei o SEK, sistema de gestão escolar offline que substituiu planilhas soltas e hoje é usado por toda a secretaria, com cerca de 545 alunos no escopo.",
        en: "On my own initiative, built SEK, an offline school management system that replaced scattered spreadsheets and is now used by the whole office, with around 545 students in scope.",
        es: "Por iniciativa propia, creé SEK, un sistema de gestión escolar offline que reemplazó hojas de cálculo sueltas y hoy usa toda la secretaría, con cerca de 545 alumnos en su alcance.",
      },
      {
        pt: "Padronizei os registros de 545 alunos, reduzindo erros de arquivamento.",
        en: "Standardized the records of 545 students, reducing filing errors.",
        es: "Estandaricé los registros de 545 alumnos, reduciendo errores de archivo.",
      },
      {
        pt: "Redigi comunicados para as famílias e a equipe pedagógica.",
        en: "Wrote official notices to families and the teaching staff.",
        es: "Redacté comunicados para las familias y el equipo pedagógico.",
      },
    ],
  },
  {
    id: "umc",
    kind: "study",
    title: {
      pt: "Bacharelado em Engenharia de Software",
      en: "B.Sc. in Software Engineering",
      es: "Grado en Ingeniería de Software",
    },
    org: "Universidade de Mogi das Cruzes (UMC)",
    start: "2025-01",
    end: "2028-12",
    endIsExpected: true,
    image: {
      src: "/about/umc.jpg",
      alt: {
        pt: "Prédio azul e branco do campus da UMC entre árvores, sob céu azul",
        en: "UMC's blue and white campus building among trees under a blue sky",
        es: "Edificio azul y blanco del campus de la UMC entre árboles, bajo un cielo azul",
      },
      focus: "60% 62%",
    },
    highlights: [{ pt: "4º período.", en: "4th semester.", es: "4.º semestre." }],
  },
  {
    id: "bootcamp-santander",
    kind: "study",
    title: {
      pt: "Bootcamp Santander: Cibersegurança do Zero à Prática",
      en: "Santander Bootcamp: Cybersecurity from Zero to Practice",
      es: "Bootcamp Santander: Ciberseguridad de Cero a la Práctica",
    },
    org: "Santander",
    // Wikimedia Commons, public domain (trademark of Banco Santander).
    logo: { src: "/journey/santander.svg", alt: "Santander" },
    start: null,
    inProgress: true,
    topics: [
      { pt: "Cibersegurança", en: "Cybersecurity", es: "Ciberseguridad" },
      { pt: "Do zero à prática", en: "From zero to practice", es: "De cero a la práctica" },
    ],
  },
  {
    id: "bootcamp-itau",
    kind: "study",
    title: {
      pt: "Bootcamp Itaú: Java com Inteligência Artificial",
      en: "Itaú Bootcamp: Java with Artificial Intelligence",
      es: "Bootcamp Itaú: Java con Inteligencia Artificial",
    },
    org: "Itaú",
    // Wikimedia Commons, public domain (trademark of Itaú Unibanco).
    logo: { src: "/journey/itau.svg", alt: "Itaú" },
    start: null,
    inProgress: true,
    topics: [
      { pt: "Java", en: "Java", es: "Java" },
      {
        pt: "Inteligência artificial",
        en: "Artificial intelligence",
        es: "Inteligencia artificial",
      },
    ],
  },
  {
    id: "aws-cert",
    kind: "study",
    title: {
      pt: "Certificação AWS Cloud Practitioner (prevista para jan. 2027)",
      en: "AWS Certified Cloud Practitioner (expected Jan 2027)",
      es: "Certificación AWS Cloud Practitioner (prevista para ene. 2027)",
    },
    org: "AWS",
    // Wikimedia Commons (AWS 2025 logo); the dark-theme file has the lettering reversed to white,
    // as AWS's own reversed logo does. Trademark of Amazon Web Services.
    logo: { src: "/journey/aws.svg", srcDark: "/journey/aws-dark.svg", alt: "AWS" },
    start: null,
    inProgress: true,
    topics: [
      { pt: "Cloud Practitioner", en: "Cloud Practitioner", es: "Cloud Practitioner" },
      { pt: "Fundamentos de nuvem", en: "Cloud fundamentals", es: "Fundamentos de la nube" },
    ],
  },
  {
    id: "dio-ai",
    kind: "study",
    title: {
      pt: "Fundamentos da IA Moderna: ML, LLMs, IA Generativa e Agentes",
      en: "Foundations of Modern AI: ML, LLMs, Generative AI and Agents",
      es: "Fundamentos de la IA Moderna: ML, LLMs, IA Generativa y Agentes",
    },
    org: "DIO",
    // Official logo from dio.me (single color: white on the dark theme, navy on the light one).
    logo: { src: "/journey/dio.svg", srcDark: "/journey/dio-dark.svg", alt: "DIO" },
    start: "2026-09",
    topics: [
      { pt: "Machine learning", en: "Machine learning", es: "Machine learning" },
      { pt: "LLMs", en: "LLMs", es: "LLMs" },
      { pt: "IA generativa", en: "Generative AI", es: "IA generativa" },
      { pt: "Agentes", en: "Agents", es: "Agentes" },
    ],
  },
  {
    id: "gcloud-sp-fiap",
    kind: "event",
    title: {
      pt: "GDG Cloud São Paulo na FIAP",
      en: "GDG Cloud São Paulo at FIAP",
      es: "GDG Cloud São Paulo en FIAP",
    },
    org: "Google Developer Groups Cloud São Paulo · FIAP",
    start: "2026-09",
    image: {
      src: "/journey/gdg-cloud-sp.jpg",
      alt: {
        pt: "Telão com “GDG Cloud São Paulo” numa sala de eventos",
        en: "A screen reading “GDG Cloud São Paulo” in an event room",
        es: "Una pantalla con “GDG Cloud São Paulo” en una sala de eventos",
      },
      focus: "72% 55%",
    },
  },
  {
    id: "soujava-oracle",
    kind: "event",
    title: {
      pt: "Encontro SouJava × Oracle Brasil",
      en: "SouJava × Oracle Brazil Meetup",
      es: "Encuentro SouJava × Oracle Brasil",
    },
    org: "SouJava · Oracle",
    start: "2026-09",
    image: {
      src: "/journey/soujava-oracle.jpg",
      alt: {
        pt: "Escultura do logotipo da Oracle no saguão do escritório, à noite",
        en: "The Oracle logo sculpture in the office lobby at night",
        es: "La escultura del logotipo de Oracle en el vestíbulo de la oficina, de noche",
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
      es: "Lógica de Programación I y II, Java, POO con Java, Listas y Colecciones, Git y GitHub",
    },
    org: "Alura",
    // Official logo from alura.com.br (single color: gray, or white on the dark theme).
    logo: { src: "/journey/alura.svg", srcDark: "/journey/alura-dark.svg", alt: "Alura" },
    start: "2026",
    topics: [
      { pt: "Lógica I e II", en: "Logic I & II", es: "Lógica I y II" },
      { pt: "Java", en: "Java", es: "Java" },
      { pt: "OO com Java", en: "OOP in Java", es: "POO con Java" },
      { pt: "Listas e coleções", en: "Lists & collections", es: "Listas y colecciones" },
      { pt: "Git e GitHub", en: "Git & GitHub", es: "Git y GitHub" },
    ],
  },
  {
    id: "ef-malta",
    kind: "study",
    title: {
      pt: "Intercâmbio de inglês em Malta",
      en: "English study abroad in Malta",
      es: "Intercambio de inglés en Malta",
    },
    org: "EF International Language Campuses",
    start: "2025-07",
    image: {
      src: "/journey/malta.jpg",
      alt: {
        pt: "Bandeira da EF ao vento diante de uma baía com barcos em Malta",
        en: "An EF flag flying over a bay full of boats in Malta",
        es: "Una bandera de EF ondeando frente a una bahía llena de barcos en Malta",
      },
      focus: "40% 62%",
    },
  },
  {
    id: "cna-c1",
    kind: "study",
    title: { pt: "Inglês Avançado (C1)", en: "Advanced English (C1)", es: "Inglés Avanzado (C1)" },
    org: "CNA",
    start: "2024",
    image: {
      src: "/about/cna.jpg",
      alt: {
        pt: "Fachada de uma unidade da escola de idiomas CNA, sob céu azul",
        en: "The front of a CNA language school, under a blue sky",
        es: "La fachada de una escuela de idiomas CNA, bajo un cielo azul",
      },
      focus: "40% 62%",
    },
  },
] satisfies z.input<typeof timelineItemSchema>[];

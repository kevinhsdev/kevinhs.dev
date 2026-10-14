import type { z } from "zod";
import type { profileSchema } from "./schema";

export const profile = {
  name: "Kevin Henrique",
  fullName: "Kevin Henrique da Silva",
  role: {
    pt: "Estudante de Engenharia de Software",
    en: "Software Engineering Student",
  },
  headline: {
    pt: "Estudante de Engenharia de Software. Construo software que uma equipe real usa todos os dias.",
    en: "Software Engineering student. I build software a real team relies on every day.",
  },
  tagline: {
    pt: "Construo software que uma equipe real usa todos os dias.",
    en: "I build software a real team relies on every day.",
  },
  proof: {
    pt: "3× mais documentos por dia: ferramenta que criei e está em uso diário na secretaria da escola onde trabalho.",
    en: "3× more documents a day: a tool I built that the school office where I work uses daily.",
  },
  stackLine: "Java · Spring Boot · MySQL",
  interests: {
    pt: "com interesse em DevOps, Cloud e IA aplicada",
    en: "also exploring DevOps, Cloud and applied AI",
  },
  /** What Kevin is studying beyond the core stack (shown in the hero's code editor). */
  exploring: ["DevOps", "Cloud", { pt: "IA aplicada", en: "Applied AI" }],
  status: {
    pt: "Aberto a estágio",
    en: "Open to internships",
  },
  location: {
    pt: "São Paulo, Brasil",
    en: "São Paulo, Brazil",
  },
  address: { locality: "São Paulo", region: "SP", country: "BR" },
  email: "kevinhs07@outlook.com",
  links: {
    github: "https://github.com/kevinhsdev",
    linkedin: "https://www.linkedin.com/in/kevinhs07",
    siteRepo: "https://github.com/kevinhsdev/portfolio",
  },
  cv: {
    pt: "/cv/kevin-henrique-cv-pt.pdf",
    // No English CV yet: the English site offers the Portuguese one, labelled "(PT)".
    en: null,
  },
  photo: {
    src: "/about/kevin.jpg",
    alt: { pt: "Retrato de Kevin Henrique", en: "Portrait of Kevin Henrique" },
  },
  languages: [
    {
      code: "pt",
      name: { pt: "Português", en: "Portuguese" },
      level: { pt: "Nativo", en: "Native" },
    },
    {
      code: "en",
      name: { pt: "Inglês", en: "English" },
      level: { pt: "Avançado (C1), intercâmbio em Malta", en: "Advanced (C1), studied in Malta" },
    },
    { code: "es", name: { pt: "Espanhol", en: "Spanish" }, level: { pt: "Básico", en: "Basic" } },
  ],
  aboutShort: {
    pt: "Estudo Engenharia de Software na UMC e trabalho desde os 17. Hoje sou Jovem Aprendiz na secretaria de uma escola, onde criei o PDF Renamer e o SEK, que a equipe usa todo dia.",
    en: "I study Software Engineering at UMC and have been working since I was 17. Today I'm an apprentice in a school's office, where I built PDF Renamer and SEK, which the team uses every day.",
  },
  startedCoding: {
    age: 15,
    how: { pt: "com os cursos da OneBitCode", en: "with OneBitCode's courses" },
  },
  hobbies: [
    {
      icon: "music",
      label: {
        pt: "Música: teclado, guitarra, bateria e violão",
        en: "Music: keyboard, electric guitar, drums and acoustic guitar",
      },
    },
    { icon: "volleyball", label: { pt: "Vôlei", en: "Volleyball" } },
    { icon: "dumbbell", label: { pt: "Musculação", en: "Weight training" } },
    {
      icon: "gamepad",
      label: { pt: "Videogame, desde criança", en: "Video games, since I was a kid" },
    },
  ],
  education: {
    school: "Universidade de Mogi das Cruzes (UMC)",
    schoolUrl: "https://www.umc.br",
  },
} satisfies z.input<typeof profileSchema>;

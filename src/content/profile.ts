import type { z } from "zod";
import type { profileSchema } from "./schema";

export const profile = {
  name: "Kevin Henrique",
  fullName: "Kevin Henrique da Silva",
  role: {
    pt: "Estudante de Engenharia de Software",
    en: "Software Engineering Student",
    es: "Estudiante de Ingeniería de Software",
  },
  headline: {
    pt: "Estudante de Engenharia de Software. Construo software que uma equipe real usa todos os dias.",
    en: "Software Engineering student. I build software a real team relies on every day.",
    es: "Estudiante de Ingeniería de Software. Construyo software que un equipo real usa todos los días.",
  },
  tagline: {
    pt: "Construo software que uma equipe real usa todos os dias.",
    en: "I build software a real team relies on every day.",
    es: "Construyo software que un equipo real usa todos los días.",
  },
  proof: {
    pt: "3× mais documentos por dia: ferramenta que criei e está em uso diário na secretaria da escola onde trabalho.",
    en: "3× more documents a day: a tool I built that the school office where I work uses daily.",
    es: "3× más documentos al día: una herramienta que creé y que la secretaría de la escuela donde trabajo usa a diario.",
  },
  stackLine: "Java · Spring Boot · MySQL",
  interests: {
    pt: "com interesse em DevOps, Cloud e IA aplicada",
    en: "also exploring DevOps, Cloud and applied AI",
    es: "con interés en DevOps, Cloud e IA aplicada",
  },
  /** What Kevin is studying beyond the core stack (shown in the hero's code editor). */
  exploring: ["DevOps", "Cloud", { pt: "IA aplicada", en: "Applied AI", es: "IA aplicada" }],
  status: {
    pt: "Aberto a estágio",
    en: "Open to internships",
    es: "Abierto a prácticas",
  },
  location: {
    pt: "São Paulo, Brasil",
    en: "São Paulo, Brazil",
    es: "São Paulo, Brasil",
  },
  address: { locality: "São Paulo", region: "SP", country: "BR" },
  email: "kevinhs07@outlook.com",
  links: {
    site: "https://kevinhs.dev",
    github: "https://github.com/kevinhsdev",
    linkedin: "https://www.linkedin.com/in/kevinhs07",
    instagram: "https://www.instagram.com/kevinhs.zip",
    siteRepo: "https://github.com/kevinhsdev/kevinhs.dev",
  },
  cv: {
    pt: "/cv/kevin-henrique-cv-pt.pdf",
    en: "/cv/kevin-henrique-cv-en.pdf",
    es: "/cv/kevin-henrique-cv-es.pdf",
  },
  photo: {
    src: "/about/kevin.jpg",
    alt: {
      pt: "Retrato de Kevin Henrique",
      en: "Portrait of Kevin Henrique",
      es: "Retrato de Kevin Henrique",
    },
  },
  languages: [
    {
      code: "pt",
      name: { pt: "Português", en: "Portuguese", es: "Portugués" },
      level: { pt: "Nativo", en: "Native", es: "Nativo" },
    },
    {
      code: "en",
      name: { pt: "Inglês", en: "English", es: "Inglés" },
      level: {
        pt: "Avançado (C1), intercâmbio em Malta",
        en: "Advanced (C1), studied in Malta",
        es: "Avanzado (C1), intercambio en Malta",
      },
    },
    {
      code: "es",
      name: { pt: "Espanhol", en: "Spanish", es: "Español" },
      level: { pt: "Básico", en: "Basic", es: "Básico" },
    },
  ],
  aboutShort: {
    pt: "Estudo Engenharia de Software na UMC e trabalho desde os 17. Hoje sou Jovem Aprendiz na secretaria de uma escola, onde criei o KIRI e o SEK, que a equipe usa todo dia.",
    en: "I study Software Engineering at UMC and have been working since I was 17. Today I'm an apprentice in a school's office, where I built KIRI and SEK, which the team uses every day.",
    es: "Estudio Ingeniería de Software en la UMC y trabajo desde los 17. Hoy soy aprendiz en la secretaría de una escuela, donde creé KIRI y SEK, que el equipo usa todos los días.",
  },
  startedCoding: {
    age: 15,
    how: {
      pt: "com os cursos da OneBitCode",
      en: "with OneBitCode's courses",
      es: "con los cursos de OneBitCode",
    },
  },
  hobbies: [
    {
      icon: "music",
      label: {
        pt: "Música: teclado, guitarra, bateria e violão",
        en: "Music: keyboard, electric guitar, drums and acoustic guitar",
        es: "Música: teclado, guitarra eléctrica, batería y guitarra acústica",
      },
    },
    { icon: "volleyball", label: { pt: "Vôlei", en: "Volleyball", es: "Vóleibol" } },
    { icon: "dumbbell", label: { pt: "Musculação", en: "Weight training", es: "Musculación" } },
    {
      icon: "gamepad",
      label: {
        pt: "Videogame, desde criança",
        en: "Video games, since I was a kid",
        es: "Videojuegos, desde niño",
      },
    },
  ],
  education: {
    school: "Universidade de Mogi das Cruzes (UMC)",
    schoolUrl: "https://www.umc.br",
  },
} satisfies z.input<typeof profileSchema>;

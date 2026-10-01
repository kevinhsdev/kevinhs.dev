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
    // TODO(kevin): review the English CV before it is published here.
    en: null,
  },
  // TODO(kevin): add foto.jpg to /public and set it here.
  photo: null,
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
  about: [
    {
      pt: "Curso Engenharia de Software na UMC e trabalho desde os 17 anos. Hoje sou Jovem Aprendiz na secretaria de uma escola, e foi lá que encontrei o problema que mudou meu jeito de estudar: documentos classificados e renomeados à mão, turma por turma. Construí uma ferramenta que lê o conteúdo de cada arquivo e faz isso sozinha. Ela entrou na rotina da equipe, e uma turma que levava 3 dias passou a levar até 1.",
      en: "I study Software Engineering at UMC and have been working since I was 17. Today I'm an apprentice in a school's administrative office, and that's where I found the problem that changed how I learn: documents sorted and renamed by hand, one class at a time. I built a tool that reads each file and does it automatically. The team adopted it, and a class that took 3 days now takes 1 at most.",
    },
    {
      pt: "Depois disso, por iniciativa própria, comecei um sistema de gestão completo para a secretaria: offline, multiusuário, sem nenhuma dependência externa e com a LGPD pensada desde o primeiro dia. Uso IA no dia a dia de engenharia, com o Claude e o Claude Code como par de programação, documentos de handoff e prompts de continuidade. É daí que vem meu interesse por Harness Engineering.",
      en: "On my own initiative, I then started a full management system for the office: offline, multi-user, zero external dependencies, with data privacy built in from day one. AI is part of how I engineer. I pair with Claude and Claude Code, and I write handoff docs and continuation prompts, which is exactly why Harness Engineering interests me.",
    },
    {
      pt: "Fiz intercâmbio em Malta, o que destravou meu inglês, já liderei equipes em projetos e estudo todos os dias: desafios de lógica, AWS e dois bootcamps. TODO(kevin): como começou na programação (1–2 frases) e o que gosta de fazer fora da TI.",
      en: "I studied English in Malta, which unlocked my fluency. I've led project teams, and I study every day: coding challenges, AWS and two bootcamps. TODO(kevin): how you got into programming (1–2 sentences) and what you enjoy outside tech.",
    },
  ],
  education: {
    school: "Universidade de Mogi das Cruzes (UMC)",
    schoolUrl: "https://www.umc.br",
  },
} satisfies z.input<typeof profileSchema>;

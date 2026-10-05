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
  aboutShort: {
    pt: "Estudo Engenharia de Software na UMC e sou Jovem Aprendiz na secretaria de uma escola, onde criei o PDF Renamer e o SEK. Comecei a programar aos 15. Fora da tela: música (teclado, guitarra, bateria e violão), vôlei, musculação e videogame.",
    en: "I study Software Engineering at UMC and I'm an apprentice in a school's office, where I built PDF Renamer and SEK. I started coding at 15. Away from the screen: music (keyboard, electric guitar, drums and acoustic guitar), volleyball, weight training and video games.",
  },
  about: [
    {
      pt: "Curso Engenharia de Software na UMC e trabalho desde os 17 anos. Hoje sou Jovem Aprendiz na secretaria de uma escola, e foi lá que encontrei o problema que mudou meu jeito de estudar: documentos classificados e renomeados à mão, turma por turma. Construí uma ferramenta que lê o conteúdo de cada arquivo e faz isso sozinha. Ela entrou na rotina da equipe, e uma turma que levava 3 dias passou a levar até 1.",
      en: "I study Software Engineering at UMC and have been working since I was 17. Today I'm an apprentice in a school's administrative office, and that's where I found the problem that changed how I learn: documents sorted and renamed by hand, one class at a time. I built a tool that reads each file and does it automatically. The team adopted it, and a class that took 3 days now takes 1 at most.",
    },
    {
      pt: "Depois disso, por iniciativa própria, construí um sistema de gestão completo para a secretaria, que hoje a equipe inteira usa: offline, multiusuário, sem nenhuma dependência externa e com a LGPD pensada desde o primeiro dia. Uso IA no dia a dia de engenharia, com o Claude e o Claude Code como par de programação, documentos de handoff e prompts de continuidade. É daí que vem meu interesse por Harness Engineering.",
      en: "On my own initiative, I then built a full management system for the office, which the whole team now uses: offline, multi-user, zero external dependencies, with data privacy built in from day one. AI is part of how I engineer. I pair with Claude and Claude Code, and I write handoff docs and continuation prompts, which is exactly why Harness Engineering interests me.",
    },
    {
      pt: "Comecei a programar aos 15 anos, com os cursos da OneBitCode, e fui construindo pequenos projetos ao longo dos anos. Aos 17, quando terminei o ensino médio, mergulhei de vez na tecnologia. Fiz intercâmbio em Malta, o que destravou meu inglês, já liderei equipes em projetos e estudo todos os dias: desafios de lógica, AWS e dois bootcamps.",
      en: "I started coding at 15 with OneBitCode's courses and kept building small projects over the years. At 17, when I finished high school, I went all in on technology. I studied English in Malta, which unlocked my fluency. I've led project teams, and I study every day: coding challenges, AWS and two bootcamps.",
    },
    {
      pt: "Fora da tela, a música é um dos meus maiores hobbies: toco teclado, guitarra, bateria e violão, entre outros instrumentos. Jogo videogame desde criança, treino musculação e vôlei e quero voltar para a natação.",
      en: "Away from the screen, music is one of my biggest hobbies: I play keyboard, electric guitar, drums and acoustic guitar, among other instruments. I've played video games since I was a kid, I lift weights, I train volleyball, and I want to get back into swimming.",
    },
  ],
  education: {
    school: "Universidade de Mogi das Cruzes (UMC)",
    schoolUrl: "https://www.umc.br",
  },
} satisfies z.input<typeof profileSchema>;

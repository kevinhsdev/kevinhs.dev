import type { z } from "zod";
import type { aboutSchema } from "./schema";

/**
 * The About me page: an opening beside Kevin's portrait, then themes of his
 * life, each a few lines in his own words with a mosaic of photos. To add a
 * photo: put it in /public/about, add it to gallery.ts (with its size), then
 * list its id in a theme's `photos`. Missing text is `TODO(kevin): …`.
 */
export const about = {
  lede: {
    pt: "Estudo Engenharia de Software na UMC e trabalho desde os 17. Hoje sou Jovem Aprendiz na secretaria de uma escola, onde vi problemas reais e construí as soluções que a equipe usa todo dia.",
    en: "I study Software Engineering at UMC and have been working since I was 17. Today I'm an apprentice in a school's office, where I found real problems and built the tools the team uses every day.",
  },
  intro: [
    {
      pt: "Sou proativo: quando vejo um problema real, prefiro construir a solução a esperar por ela. Estudo todos os dias, entre desafios de lógica no Beecrowd e no LeetCode, a preparação para a AWS e dois bootcamps, e aprendo muito ouvindo quem já passou pelos mesmos erros.",
      en: "I'm proactive: when I see a real problem, I'd rather build the fix than wait for one. I study every day, from logic challenges on Beecrowd and LeetCode to AWS prep and two bootcamps, and I learn a lot from people who've already made the same mistakes.",
    },
    {
      pt: "Comecei a programar aos 15 anos, com os cursos da OneBitCode, e fui construindo pequenos projetos ao longo dos anos. Aos 17, quando terminei o ensino médio, mergulhei de vez na tecnologia.",
      en: "I started coding at 15 with OneBitCode's courses and kept building small projects over the years. At 17, when I finished high school, I went all in on technology.",
    },
    {
      pt: "O que me mantém no software é ver uma solução sair do editor e entrar no dia a dia de alguém, como aconteceu com o PDF Renamer e o SEK. Hoje, o que mais me atrai é a IA aplicada, em especial o Harness Engineering: as ferramentas, o contexto e as instruções em volta de um modelo que fazem um agente trabalhar bem. É a área em que quero crescer, e por isso estudo IA moderna, de LLMs a agentes, e uso o Claude Code todos os dias.",
      en: "What keeps me in software is watching a fix leave the editor and become part of someone's day, as it did with PDF Renamer and SEK. Today, what draws me most is applied AI, especially Harness Engineering: the tools, context and instructions around a model that make an agent work well. It's the field I want to grow in, which is why I study modern AI, from LLMs to agents, and use Claude Code every day.",
    },
  ],
  themes: [
    {
      id: "code",
      title: { pt: "No código", en: "In code" },
      photos: ["adesivos", "notebook", "umc", "cna"],
      projects: ["sek", "pdf-renamer"],
      text: [
        {
          pt: "Na secretaria, encontrei o problema que mudou meu jeito de estudar: documentos classificados e renomeados à mão, turma por turma. Construí uma ferramenta que faz isso sozinha, e ela entrou na rotina da equipe. Depois, por iniciativa própria, construí o sistema de gestão que hoje a secretaria inteira usa.",
          en: "At the office, I found the problem that changed how I learn: documents sorted and renamed by hand, one class at a time. I built a tool that does it automatically, and the team adopted it. Then, on my own initiative, I built the management system the whole office now uses.",
        },
        {
          pt: "Uso IA no dia a dia de engenharia, com o Claude e o Claude Code como par de programação, documentos de handoff e prompts de continuidade. É daí que vem meu interesse por Harness Engineering.",
          en: "AI is part of how I engineer. I pair with Claude and Claude Code, and I write handoff docs and continuation prompts, which is exactly why Harness Engineering interests me.",
        },
      ],
    },
    {
      id: "malta",
      title: { pt: "Malta", en: "Malta" },
      photos: [
        "aviao",
        "malta",
        "malta-rotunda",
        "malta-rua",
        "malta-noite",
        "st-julians",
        "malta-jornal",
      ],
      text: [
        {
          pt: "O intercâmbio em Malta foi uma forma de me adaptar a um ambiente completamente novo. Melhorei meu diálogo e minha comunicação com as pessoas, além de praticar o inglês.",
          en: "Studying in Malta meant adapting to a completely new environment. It sharpened how I talk and connect with people, on top of practicing my English.",
        },
      ],
    },
    {
      id: "music",
      title: { pt: "Na música", en: "Music" },
      photos: ["guitarra-luz", "teclado", "guitarra", "instrumentos"],
      text: [
        {
          pt: "A música é um dos meus maiores hobbies: toco teclado, guitarra, bateria e violão, entre outros instrumentos.",
          en: "Music is one of my biggest hobbies: I play keyboard, electric guitar, drums and acoustic guitar, among other instruments.",
        },
      ],
    },
    {
      id: "community",
      title: { pt: "Em equipe e em comunidade", en: "Teams and community" },
      photos: [
        "gdg-cloud-sp",
        "soujava-oracle",
        "palestra-carreira-codigo",
        "fiap",
        "coffee-break",
        "claude-oracle",
      ],
      text: [
        {
          pt: "Já liderei equipes em projetos. Foram experiências que me fizeram evoluir profissionalmente e aprender a trabalhar em grupo: dividir tarefas, ouvir opiniões diferentes e chegar juntos a uma decisão.",
          en: "I've led teams on projects. Those experiences helped me grow professionally and taught me to work as a group: splitting tasks, hearing different opinions and reaching a decision together.",
        },
        {
          pt: "Vou a vários eventos para conhecer outras visões e fazer networking. O jeito mais prático de aprender a lidar com erros, bugs e dúvidas é ouvir quem já passou pela mesma situação, e pretendo continuar indo para me manter atualizado.",
          en: "I go to a lot of tech events to hear other perspectives and to network. The fastest way to learn how to handle errors, bugs and open questions is to hear from people who've already been through them, and I plan to keep going to stay current.",
        },
      ],
    },
    {
      id: "free-time",
      title: { pt: "Tempo livre", en: "Free time" },
      photos: ["volei", "volei-jogo"],
      text: [
        {
          pt: "Treino vôlei e musculação, jogo videogame desde criança e quero voltar para a natação.",
          en: "I play volleyball and lift weights, I've played video games since I was a kid, and I want to get back into swimming.",
        },
      ],
    },
  ],
  next: {
    heading: { pt: "Para onde vou", en: "Where I'm heading" },
    text: {
      pt: "Procuro meu primeiro estágio em backend, DevOps/Cloud ou IA aplicada: remoto, híbrido ou presencial, no Brasil ou no exterior. Enquanto isso, estudo para a certificação AWS Cloud Practitioner, prevista para dezembro.",
      en: "I'm looking for my first internship in backend, DevOps/Cloud or applied AI: remote, hybrid or on-site, in Brazil or abroad. Meanwhile, I'm studying for the AWS Cloud Practitioner certification, expected in December.",
    },
  },
} satisfies z.input<typeof aboutSchema>;

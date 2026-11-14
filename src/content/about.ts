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
    es: "Estudio Ingeniería de Software en la UMC y trabajo desde los 17. Hoy soy aprendiz en la secretaría de una escuela, donde encontré problemas reales y construí las herramientas que el equipo usa todos los días.",
  },
  headline: {
    pt: "Vejo um problema de perto e construo a solução.",
    en: "I see a problem up close and build the fix.",
    es: "Veo un problema de cerca y construyo la solución.",
  },
  chapters: [
    {
      label: { pt: "O começo", en: "Where it started", es: "Dónde empezó" },
      text: {
        pt: "Comecei a programar aos 15, com os cursos da OneBitCode, e fui construindo pequenos projetos. Estudei 12 anos no Luterano e, aos 17, mergulhei de vez na tecnologia.",
        en: "I started coding at 15 with OneBitCode's courses and kept building small projects. I spent 12 years at the Luterano school, and at 17 I went all in on technology.",
        es: "Empecé a programar a los 15 con los cursos de OneBitCode y seguí construyendo pequeños proyectos. Pasé 12 años en el colegio Luterano, y a los 17 me dediqué de lleno a la tecnología.",
      },
    },
    {
      label: { pt: "Hoje", en: "Today", es: "Hoy" },
      text: {
        pt: "Estudo Engenharia de Software na UMC e sou Jovem Aprendiz na secretaria de uma escola. Lá vi problemas reais e construí o KIRI e o SEK, que a equipe usa todos os dias.",
        en: "I study Software Engineering at UMC and I'm an apprentice in a school's office. There I found real problems and built KIRI and SEK, which the team uses every day.",
        es: "Estudio Ingeniería de Software en la UMC y soy aprendiz en la secretaría de una escuela. Allí encontré problemas reales y construí KIRI y SEK, que el equipo usa todos los días.",
      },
    },
    {
      label: { pt: "O próximo passo", en: "What's next", es: "Lo que viene" },
      text: {
        pt: "Quero crescer em IA aplicada, em especial em Harness Engineering: as ferramentas, o contexto e as instruções que fazem um agente trabalhar bem. Uso o Claude Code todos os dias.",
        en: "I want to grow in applied AI, especially Harness Engineering: the tools, context and instructions that make an agent work well. I use Claude Code every day.",
        es: "Quiero crecer en IA aplicada, sobre todo en Harness Engineering: las herramientas, el contexto y las instrucciones que hacen que un agente funcione bien. Uso Claude Code todos los días.",
      },
    },
  ],
  facts: [
    {
      value: "15",
      label: {
        pt: "anos quando comecei a programar",
        en: "years old when I started coding",
        es: "años cuando empecé a programar",
      },
    },
    {
      value: "12",
      label: {
        pt: "anos como aluno do Luterano",
        en: "years as a Luterano student",
        es: "años como alumno del Luterano",
      },
    },
    {
      value: "17",
      label: {
        pt: "anos quando comecei a trabalhar",
        en: "years old when I started working",
        es: "años cuando empecé a trabajar",
      },
    },
    {
      value: "2",
      label: {
        pt: "sistemas meus em uso diário",
        en: "systems of mine in daily use",
        es: "sistemas míos en uso diario",
      },
    },
  ],
  intro: [
    {
      pt: "Sou proativo: quando vejo um problema real, prefiro construir a solução a esperar por ela. Estudo todos os dias, entre desafios de lógica no Beecrowd e no LeetCode, a preparação para a AWS e dois bootcamps, e aprendo muito ouvindo quem já passou pelos mesmos erros.",
      en: "I'm proactive: when I see a real problem, I'd rather build the fix than wait for one. I study every day, from logic challenges on Beecrowd and LeetCode to AWS prep and two bootcamps, and I learn a lot from people who've already made the same mistakes.",
      es: "Soy proactivo: cuando veo un problema real, prefiero construir la solución que esperar a que aparezca. Estudio todos los días, desde desafíos de lógica en Beecrowd y LeetCode hasta la preparación para AWS y dos bootcamps, y aprendo mucho de quienes ya cometieron los mismos errores.",
    },
    {
      pt: "Comecei a programar aos 15 anos, com os cursos da OneBitCode, e fui construindo pequenos projetos ao longo dos anos. Aos 17, quando terminei o ensino médio, mergulhei de vez na tecnologia.",
      en: "I started coding at 15 with OneBitCode's courses and kept building small projects over the years. At 17, when I finished high school, I went all in on technology.",
      es: "Empecé a programar a los 15 con los cursos de OneBitCode y seguí construyendo pequeños proyectos a lo largo de los años. A los 17, al terminar el bachillerato, me dediqué de lleno a la tecnología.",
    },
    {
      pt: "O que me mantém no software é ver uma solução sair do editor e entrar no dia a dia de alguém, como aconteceu com o KIRI e o SEK. Hoje, o que mais me atrai é a IA aplicada, em especial o Harness Engineering: as ferramentas, o contexto e as instruções em volta de um modelo que fazem um agente trabalhar bem. É a área em que quero crescer, e por isso estudo IA moderna, de LLMs a agentes, e uso o Claude Code todos os dias.",
      en: "What keeps me in software is watching a fix leave the editor and become part of someone's day, as it did with KIRI and SEK. Today, what draws me most is applied AI, especially Harness Engineering: the tools, context and instructions around a model that make an agent work well. It's the field I want to grow in, which is why I study modern AI, from LLMs to agents, and use Claude Code every day.",
      es: "Lo que me mantiene en el software es ver una solución salir del editor y pasar a formar parte del día de alguien, como pasó con KIRI y SEK. Hoy, lo que más me atrae es la IA aplicada, sobre todo Harness Engineering: las herramientas, el contexto y las instrucciones alrededor de un modelo que hacen que un agente funcione bien. Es el área en la que quiero crecer, por eso estudio IA moderna, de los LLMs a los agentes, y uso Claude Code todos los días.",
    },
  ],
  themes: [
    {
      id: "code",
      title: { pt: "No código", en: "In code", es: "En el código" },
      photos: ["adesivos", "notebook", "umc", "cna"],
      projects: ["sek", "kiri"],
      text: [
        {
          pt: "Na secretaria, encontrei o problema que mudou meu jeito de estudar: documentos classificados e renomeados à mão, turma por turma. Construí uma ferramenta que faz isso sozinha, e ela entrou na rotina da equipe. Depois, por iniciativa própria, construí o sistema de gestão que hoje a secretaria inteira usa.",
          en: "At the office, I found the problem that changed how I learn: documents sorted and renamed by hand, one class at a time. I built a tool that does it automatically, and the team adopted it. Then, on my own initiative, I built the management system the whole office now uses.",
          es: "En la secretaría encontré el problema que cambió mi forma de aprender: documentos clasificados y renombrados a mano, un grupo a la vez. Construí una herramienta que lo hace automáticamente, y el equipo la adoptó. Después, por iniciativa propia, construí el sistema de gestión que hoy usa toda la secretaría.",
        },
        {
          pt: "Uso IA no dia a dia de engenharia, com o Claude e o Claude Code como par de programação, documentos de handoff e prompts de continuidade. É daí que vem meu interesse por Harness Engineering.",
          en: "AI is part of how I engineer. I pair with Claude and Claude Code, and I write handoff docs and continuation prompts, which is exactly why Harness Engineering interests me.",
          es: "La IA es parte de mi forma de hacer ingeniería. Trabajo en pareja con Claude y Claude Code, y escribo documentos de traspaso y prompts de continuación, justamente por eso me interesa Harness Engineering.",
        },
      ],
    },
    {
      id: "malta",
      title: { pt: "Malta", en: "Malta", es: "Malta" },
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
          es: "Estudiar en Malta significó adaptarme a un entorno completamente nuevo. Mejoró mi forma de hablar y de conectar con las personas, además de practicar mi inglés.",
        },
      ],
    },
    {
      id: "music",
      title: { pt: "Na música", en: "Music", es: "Música" },
      photos: ["guitarra-luz", "teclado", "guitarra", "instrumentos"],
      text: [
        {
          pt: "A música é um dos meus maiores hobbies: toco teclado, guitarra, bateria e violão, entre outros instrumentos.",
          en: "Music is one of my biggest hobbies: I play keyboard, electric guitar, drums and acoustic guitar, among other instruments.",
          es: "La música es uno de mis mayores hobbies: toco teclado, guitarra eléctrica, batería y guitarra acústica, entre otros instrumentos.",
        },
      ],
    },
    {
      id: "community",
      title: {
        pt: "Em equipe e em comunidade",
        en: "Teams and community",
        es: "Equipos y comunidad",
      },
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
          es: "He liderado equipos en proyectos. Esas experiencias me ayudaron a crecer profesionalmente y me enseñaron a trabajar en grupo: dividir tareas, escuchar opiniones distintas y llegar juntos a una decisión.",
        },
        {
          pt: "Vou a vários eventos para conhecer outras visões e fazer networking. O jeito mais prático de aprender a lidar com erros, bugs e dúvidas é ouvir quem já passou pela mesma situação, e pretendo continuar indo para me manter atualizado.",
          en: "I go to a lot of tech events to hear other perspectives and to network. The fastest way to learn how to handle errors, bugs and open questions is to hear from people who've already been through them, and I plan to keep going to stay current.",
          es: "Voy a muchos eventos de tecnología para escuchar otras perspectivas y hacer networking. La forma más rápida de aprender a manejar errores, bugs y dudas es escuchar a quienes ya pasaron por ellos, y pienso seguir yendo para mantenerme actualizado.",
        },
      ],
    },
    {
      id: "free-time",
      title: { pt: "Tempo livre", en: "Free time", es: "Tiempo libre" },
      photos: ["volei", "volei-jogo"],
      text: [
        {
          pt: "Treino vôlei e musculação, jogo videogame desde criança e quero voltar para a natação.",
          en: "I play volleyball and lift weights, I've played video games since I was a kid, and I want to get back into swimming.",
          es: "Juego vóleibol y hago musculación, juego videojuegos desde niño y quiero volver a nadar.",
        },
      ],
    },
  ],
  next: {
    heading: { pt: "Para onde vou", en: "Where I'm heading", es: "Hacia dónde voy" },
    text: {
      pt: "Procuro meu primeiro estágio em backend, DevOps/Cloud ou IA aplicada: remoto, híbrido ou presencial, no Brasil ou no exterior. Enquanto isso, estudo para a certificação AWS Cloud Practitioner, prevista para dezembro.",
      en: "I'm looking for my first internship in backend, DevOps/Cloud or applied AI: remote, hybrid or on-site, in Brazil or abroad. Meanwhile, I'm studying for the AWS Cloud Practitioner certification, expected in December.",
      es: "Busco mis primeras prácticas en backend, DevOps/Cloud o IA aplicada: remoto, híbrido o presencial, en Brasil o en el extranjero. Mientras tanto, estudio para la certificación AWS Cloud Practitioner, prevista para diciembre.",
    },
  },
} satisfies z.input<typeof aboutSchema>;

import type { z } from "zod";
import type { gallerySchema } from "./schema";

/**
 * Every photo on the site (About me, and the home's About tiles). Files live in
 * /public, resized to 1600px at most and with metadata (GPS, camera) stripped.
 * No people without their consent, and nothing that identifies students.
 * Captions say only what the photo shows; anything Kevin hasn't confirmed
 * (where, when) stays out.
 */
export const gallery = [
  {
    id: "malta",
    src: "/journey/malta.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Bandeira da EF ao vento diante de uma baía com barcos em Malta",
      en: "An EF flag flying over a bay full of boats in Malta",
    },
    caption: { pt: "Intercâmbio em Malta, 2025", en: "Studying abroad in Malta, 2025" },
    focus: "40% 62%",
  },
  {
    id: "malta-rotunda",
    src: "/about/malta-rotunda.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Fachada de uma grande igreja com colunas e cúpula, em Malta, sob céu azul",
      en: "The columned front of a large domed church in Malta under a blue sky",
    },
    caption: { pt: "Mosta", en: "Mosta" },
  },
  {
    id: "malta-rua",
    src: "/about/malta-rua.jpg",
    width: 960,
    height: 1280,
    alt: {
      pt: "Rua estreita de prédios de pedra com varandas fechadas, em Malta, ao entardecer",
      en: "A narrow street of stone buildings with closed balconies in Malta at dusk",
    },
    caption: { pt: "Malta", en: "Malta" },
  },
  {
    id: "malta-noite",
    src: "/about/malta-noite.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Prédios antigos de pedra e a placa vertical de um hotel, à noite",
      en: "Old stone buildings and a hotel's vertical sign at night",
    },
    caption: { pt: "Valeta, à noite", en: "Valletta at night" },
  },
  {
    id: "aviao",
    src: "/about/aviao.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Vista da janela de um avião estacionado, com a turbina em primeiro plano",
      en: "A window view of a parked airplane, its engine in the foreground",
    },
    caption: { pt: "Embarque", en: "Boarding" },
  },
  {
    id: "notebook",
    src: "/about/notebook.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Notebook aberto com código no editor, ao lado de uma janela",
      en: "An open laptop with code in the editor, next to a window",
    },
    caption: { pt: "Programando", en: "Coding" },
  },
  {
    id: "adesivos",
    src: "/about/adesivos.jpg",
    focus: "50% 54%",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Tampa de notebook coberta de adesivos de tecnologia: Java, Oracle, AWS, Docker, Linux e Google Developers",
      en: "A laptop lid covered in tech stickers: Java, Oracle, AWS, Docker, Linux and Google Developers",
    },
    caption: { pt: "O notebook", en: "The laptop" },
  },
  {
    id: "luterano",
    src: "/journey/luterano.jpg",
    width: 1200,
    height: 900,
    alt: {
      pt: "Fachada do Instituto Educacional Luterano, com o nome no prédio",
      en: "The front of the Instituto Educacional Luterano building, with its name on the wall",
    },
    caption: { pt: "Onde trabalho hoje", en: "Where I work today" },
    focus: "38% 45%",
  },
  {
    id: "gdg-cloud-sp",
    src: "/journey/gdg-cloud-sp.jpg",
    width: 1000,
    height: 1333,
    alt: {
      pt: "Telão com “GDG Cloud São Paulo” numa sala de eventos",
      en: "A screen reading “GDG Cloud São Paulo” in an event room",
    },
    caption: { pt: "GDG Cloud São Paulo, na FIAP", en: "GDG Cloud São Paulo, at FIAP" },
    focus: "72% 55%",
  },
  {
    id: "soujava-oracle",
    src: "/journey/soujava-oracle.jpg",
    width: 960,
    height: 1280,
    alt: {
      pt: "Escultura do logotipo da Oracle no saguão do escritório, à noite",
      en: "The Oracle logo sculpture in the office lobby at night",
    },
    caption: { pt: "Encontro SouJava × Oracle", en: "SouJava × Oracle meetup" },
    focus: "50% 58%",
  },
  {
    id: "guitarra-luz",
    src: "/about/guitarra-luz.jpg",
    focus: "50% 45%",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Kevin tocando guitarra sob uma luz verde",
      en: "Kevin playing electric guitar under green light",
    },
    caption: { pt: "Show de Fim de Ano", en: "Year-end show" },
  },
  {
    id: "teclado",
    src: "/about/teclado.jpg",
    width: 828,
    height: 1207,
    alt: {
      pt: "Kevin tocando teclado sob uma luz roxa",
      en: "Kevin playing keyboard under purple light",
    },
    caption: { pt: "Teclado", en: "Keyboard" },
  },
  {
    id: "guitarra",
    src: "/about/guitarra.jpg",
    focus: "50% 50%",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Kevin tocando guitarra em pé, numa sala com amplificadores",
      en: "Kevin standing and playing guitar in a room with amplifiers",
    },
    caption: { pt: "Guitarra", en: "Electric guitar" },
  },
  {
    id: "instrumentos",
    src: "/about/instrumentos.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Guitarra azul-clara num suporte, com bateria e teclado ao fundo",
      en: "A light blue electric guitar on a stand, with drums and a keyboard behind it",
    },
    caption: { pt: "Os instrumentos", en: "The instruments" },
  },
  {
    id: "volei",
    src: "/about/volei.jpg",
    focus: "50% 32%",
    width: 1066,
    height: 1600,
    alt: {
      pt: "Kevin, de camisa roxa número 7, saltando para atacar a bola numa quadra de vôlei",
      en: "Kevin, in purple jersey number 7, jumping to spike the ball on a volleyball court",
    },
    caption: { pt: "Vôlei", en: "Volleyball" },
  },
  {
    id: "volei-jogo",
    src: "/about/volei-jogo.jpg",
    width: 670,
    height: 853,
    alt: {
      pt: "Kevin, de costas com a camisa roxa número 7, em quadra durante um jogo de vôlei, com a torcida na arquibancada",
      en: "Kevin, back to the camera in purple jersey number 7, on court during a volleyball game, with fans in the stands",
    },
    caption: { pt: "Em quadra", en: "On court" },
  },
  {
    id: "umc",
    src: "/about/umc.jpg",
    width: 920,
    height: 1280,
    alt: {
      pt: "Prédio azul e branco do campus da UMC entre árvores, sob céu azul",
      en: "UMC's blue and white campus building among trees under a blue sky",
    },
    caption: { pt: "UMC, onde estudo", en: "UMC, where I study" },
  },
  {
    id: "cna",
    src: "/about/cna.jpg",
    width: 960,
    height: 1280,
    alt: {
      pt: "Fachada de uma unidade da escola de idiomas CNA, sob céu azul",
      en: "The front of a CNA language school, under a blue sky",
    },
    caption: { pt: "CNA, onde fiz o inglês avançado", en: "CNA, where I took advanced English" },
  },
  {
    id: "malta-jornal",
    src: "/about/malta-jornal.jpg",
    width: 960,
    height: 1280,
    alt: {
      pt: "Página de jornal impresso “Malta Street.Press”, com a manchete “Wanted!!! For good behavior” e uma foto de Kevin com amigos numa rua de Malta à noite",
      en: "A printed “Malta Street.Press” newspaper page, headlined “Wanted!!! For good behavior”, with a photo of Kevin and friends on a street in Malta at night",
    },
    focus: "50% 41%",
    caption: { pt: "Jornal Street.Press", en: "Street.Press newspaper" },
  },
  {
    id: "st-julians",
    src: "/about/st-julians.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Rua de St. Julian's, em Malta, com palmeiras, prédios e bandeiras azuis na calçada, sob céu azul",
      en: "A street in St. Julian's, Malta, with palm trees, buildings and blue flags on the sidewalk under a blue sky",
    },
    caption: { pt: "St. Julian's Bay", en: "St. Julian's Bay" },
  },
  {
    id: "palestra-carreira-codigo",
    src: "/about/palestra-carreira-codigo.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Palestrante num palco apontando para um slide que diz “O código é parte do sistema”, com a plateia de costas",
      en: "A speaker on stage pointing at a slide reading “Code is part of the system”, with the audience seen from behind",
    },
    caption: { pt: "Palestra Carreira x Código", en: "Career x Code talk" },
  },
  {
    id: "fiap",
    src: "/about/fiap.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Vista do alto, por uma janela, de uma avenida de São Paulo entre prédios, com uma torre de antena ao fundo",
      en: "A high window view of a São Paulo avenue between buildings, with an antenna tower in the distance",
    },
    caption: { pt: "FIAP", en: "FIAP" },
  },
  {
    id: "coffee-break",
    src: "/about/coffee-break.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Salão de eventos com refletores no teto e pessoas conversando em grupos durante o intervalo",
      en: "An event hall with spotlights on the ceiling and people talking in groups during the break",
    },
    caption: { pt: "Coffee Break - Networking", en: "Coffee break and networking" },
  },
  {
    id: "claude-oracle",
    src: "/about/claude-oracle.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Auditório da Oracle com um palestrante no púlpito e um slide sobre o Claude Code, visto do fundo da plateia",
      en: "An Oracle auditorium with a speaker at the podium and a slide about Claude Code, seen from the back of the audience",
    },
    caption: { pt: "Claude AI na Oracle", en: "Claude AI at Oracle" },
  },
] satisfies z.input<typeof gallerySchema>[];

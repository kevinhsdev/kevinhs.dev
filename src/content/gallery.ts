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
      es: "Una bandera de EF ondeando frente a una bahía llena de barcos en Malta",
    },
    caption: {
      pt: "Intercâmbio em Malta, 2025",
      en: "Studying abroad in Malta, 2025",
      es: "Intercambio en Malta, 2025",
    },
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
      es: "La fachada con columnas de una gran iglesia con cúpula en Malta, bajo un cielo azul",
    },
    caption: { pt: "Mosta", en: "Mosta", es: "Mosta" },
  },
  {
    id: "malta-rua",
    src: "/about/malta-rua.jpg",
    width: 960,
    height: 1280,
    alt: {
      pt: "Rua estreita de prédios de pedra com varandas fechadas, em Malta, ao entardecer",
      en: "A narrow street of stone buildings with closed balconies in Malta at dusk",
      es: "Una calle estrecha de edificios de piedra con balcones cerrados en Malta, al atardecer",
    },
    caption: { pt: "Malta", en: "Malta", es: "Malta" },
  },
  {
    id: "malta-noite",
    src: "/about/malta-noite.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Prédios antigos de pedra e a placa vertical de um hotel, à noite",
      en: "Old stone buildings and a hotel's vertical sign at night",
      es: "Edificios antiguos de piedra y el letrero vertical de un hotel, de noche",
    },
    caption: { pt: "Valeta, à noite", en: "Valletta at night", es: "La Valeta de noche" },
  },
  {
    id: "aviao",
    src: "/about/aviao.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Vista da janela de um avião estacionado, com a turbina em primeiro plano",
      en: "A window view of a parked airplane, its engine in the foreground",
      es: "Vista desde la ventana de un avión estacionado, con la turbina en primer plano",
    },
    caption: { pt: "Embarque", en: "Boarding", es: "Embarque" },
  },
  {
    id: "notebook",
    src: "/about/notebook.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Notebook aberto com código no editor, ao lado de uma janela",
      en: "An open laptop with code in the editor, next to a window",
      es: "Una laptop abierta con código en el editor, junto a una ventana",
    },
    caption: { pt: "Programando", en: "Coding", es: "Programando" },
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
      es: "La tapa de una laptop cubierta de stickers de tecnología: Java, Oracle, AWS, Docker, Linux y Google Developers",
    },
    caption: { pt: "O notebook", en: "The laptop", es: "La laptop" },
  },
  {
    id: "luterano",
    src: "/journey/luterano.jpg",
    width: 1200,
    height: 900,
    alt: {
      pt: "Fachada do Instituto Educacional Luterano, com o nome no prédio",
      en: "The front of the Instituto Educacional Luterano building, with its name on the wall",
      es: "La fachada del Instituto Educacional Luterano, con el nombre en el edificio",
    },
    caption: { pt: "Onde trabalho hoje", en: "Where I work today", es: "Donde trabajo hoy" },
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
      es: "Una pantalla con “GDG Cloud São Paulo” en una sala de eventos",
    },
    caption: {
      pt: "GDG Cloud São Paulo, na FIAP",
      en: "GDG Cloud São Paulo, at FIAP",
      es: "GDG Cloud São Paulo, en FIAP",
    },
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
      es: "La escultura del logotipo de Oracle en el vestíbulo de la oficina, de noche",
    },
    caption: {
      pt: "Encontro SouJava × Oracle",
      en: "SouJava × Oracle meetup",
      es: "Encuentro SouJava × Oracle",
    },
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
      es: "Kevin tocando guitarra eléctrica bajo luz verde",
    },
    caption: { pt: "Show de Fim de Ano", en: "Year-end show", es: "Show de fin de año" },
  },
  {
    id: "teclado",
    src: "/about/teclado.jpg",
    width: 828,
    height: 1207,
    alt: {
      pt: "Kevin tocando teclado sob uma luz roxa",
      en: "Kevin playing keyboard under purple light",
      es: "Kevin tocando teclado bajo luz morada",
    },
    caption: { pt: "Teclado", en: "Keyboard", es: "Teclado" },
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
      es: "Kevin de pie tocando guitarra en una sala con amplificadores",
    },
    caption: { pt: "Guitarra", en: "Electric guitar", es: "Guitarra eléctrica" },
  },
  {
    id: "instrumentos",
    src: "/about/instrumentos.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Guitarra azul-clara num suporte, com bateria e teclado ao fundo",
      en: "A light blue electric guitar on a stand, with drums and a keyboard behind it",
      es: "Una guitarra eléctrica celeste en un soporte, con una batería y un teclado detrás",
    },
    caption: { pt: "Os instrumentos", en: "The instruments", es: "Los instrumentos" },
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
      es: "Kevin, con la camiseta morada número 7, saltando para rematar en una cancha de vóleibol",
    },
    caption: { pt: "Vôlei", en: "Volleyball", es: "Vóleibol" },
  },
  {
    id: "volei-jogo",
    src: "/about/volei-jogo.jpg",
    width: 670,
    height: 853,
    alt: {
      pt: "Kevin, de costas com a camisa roxa número 7, em quadra durante um jogo de vôlei, com a torcida na arquibancada",
      en: "Kevin, back to the camera in purple jersey number 7, on court during a volleyball game, with fans in the stands",
      es: "Kevin, de espaldas con la camiseta morada número 7, en la cancha durante un partido de vóleibol, con público en las gradas",
    },
    caption: { pt: "Em quadra", en: "On court", es: "En la cancha" },
  },
  {
    id: "umc",
    src: "/about/umc.jpg",
    width: 920,
    height: 1280,
    alt: {
      pt: "Prédio azul e branco do campus da UMC entre árvores, sob céu azul",
      en: "UMC's blue and white campus building among trees under a blue sky",
      es: "Edificio azul y blanco del campus de la UMC entre árboles, bajo un cielo azul",
    },
    caption: { pt: "UMC, onde estudo", en: "UMC, where I study", es: "UMC, donde estudio" },
    focus: "60% 62%",
  },
  {
    id: "cna",
    src: "/about/cna.jpg",
    width: 960,
    height: 1280,
    alt: {
      pt: "Fachada de uma unidade da escola de idiomas CNA, sob céu azul",
      en: "The front of a CNA language school, under a blue sky",
      es: "La fachada de una escuela de idiomas CNA, bajo un cielo azul",
    },
    caption: {
      pt: "CNA, onde fiz o inglês avançado",
      en: "CNA, where I took advanced English",
      es: "CNA, donde hice inglés avanzado",
    },
  },
  {
    id: "malta-jornal",
    src: "/about/malta-jornal.jpg",
    width: 960,
    height: 1280,
    alt: {
      pt: "Página de jornal impresso “Malta Street.Press”, com a manchete “Wanted!!! For good behavior” e uma foto de Kevin com amigos numa rua de Malta à noite",
      en: "A printed “Malta Street.Press” newspaper page, headlined “Wanted!!! For good behavior”, with a photo of Kevin and friends on a street in Malta at night",
      es: "Una página impresa del periódico “Malta Street.Press”, con el titular “Wanted!!! For good behavior” y una foto de Kevin y amigos en una calle de Malta, de noche",
    },
    focus: "50% 41%",
    caption: {
      pt: "Jornal Street.Press",
      en: "Street.Press newspaper",
      es: "Periódico Street.Press",
    },
  },
  {
    id: "st-julians",
    src: "/about/st-julians.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Rua de St. Julian's, em Malta, com palmeiras, prédios e bandeiras azuis na calçada, sob céu azul",
      en: "A street in St. Julian's, Malta, with palm trees, buildings and blue flags on the sidewalk under a blue sky",
      es: "Una calle de St. Julian's, Malta, con palmeras, edificios y banderas azules en la acera, bajo un cielo azul",
    },
    caption: { pt: "St. Julian's Bay", en: "St. Julian's Bay", es: "Bahía de St. Julian's" },
  },
  {
    id: "palestra-carreira-codigo",
    src: "/about/palestra-carreira-codigo.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Palestrante num palco apontando para um slide que diz “O código é parte do sistema”, com a plateia de costas",
      en: "A speaker on stage pointing at a slide reading “Code is part of the system”, with the audience seen from behind",
      es: "Un ponente en el escenario señalando una diapositiva que dice “Code is part of the system”, con el público visto de espaldas",
    },
    caption: {
      pt: "Palestra Carreira x Código",
      en: "Career x Code talk",
      es: "Charla Carrera x Código",
    },
  },
  {
    id: "fiap",
    src: "/about/fiap.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Vista do alto, por uma janela, de uma avenida de São Paulo entre prédios, com uma torre de antena ao fundo",
      en: "A high window view of a São Paulo avenue between buildings, with an antenna tower in the distance",
      es: "Vista desde una ventana alta de una avenida de São Paulo entre edificios, con una torre de antenas al fondo",
    },
    caption: { pt: "FIAP", en: "FIAP", es: "FIAP" },
  },
  {
    id: "coffee-break",
    src: "/about/coffee-break.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Salão de eventos com refletores no teto e pessoas conversando em grupos durante o intervalo",
      en: "An event hall with spotlights on the ceiling and people talking in groups during the break",
      es: "Un salón de eventos con focos en el techo y personas conversando en grupos durante el descanso",
    },
    caption: {
      pt: "Coffee Break - Networking",
      en: "Coffee break and networking",
      es: "Coffee break y networking",
    },
  },
  {
    id: "claude-oracle",
    src: "/about/claude-oracle.jpg",
    width: 1200,
    height: 1600,
    alt: {
      pt: "Auditório da Oracle com um palestrante no púlpito e um slide sobre o Claude Code, visto do fundo da plateia",
      en: "An Oracle auditorium with a speaker at the podium and a slide about Claude Code, seen from the back of the audience",
      es: "Un auditorio de Oracle con un ponente en el atril y una diapositiva sobre Claude Code, visto desde el fondo del público",
    },
    caption: { pt: "Claude AI na Oracle", en: "Claude AI at Oracle", es: "Claude AI en Oracle" },
  },
] satisfies z.input<typeof gallerySchema>[];

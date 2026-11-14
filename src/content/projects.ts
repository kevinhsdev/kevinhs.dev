import type { z } from "zod";
import type { projectSchema } from "./schema";

/** Featured first, in display order. */
export const projects = [
  {
    slug: "sek",
    title: {
      pt: "SEK · Gestão Escolar",
      en: "SEK · School Management",
      es: "SEK · Gestión Escolar",
    },
    tier: "featured",
    status: "in-use",
    year: 2026,
    tagline: {
      pt: "Sistema de gestão escolar offline, multiusuário e sem dependências",
      en: "Offline, multi-user school management system with zero dependencies",
      es: "Sistema de gestión escolar offline, multiusuario y sin dependencias",
    },
    summary: {
      pt: "A secretaria de uma escola com cerca de 535 alunos, do Maternal ao Ensino Médio, trabalhava com planilhas e documentos avulsos espalhados por vários sistemas. Por iniciativa própria, construí um app web local: um PC funciona como servidor, os outros acessam pelo navegador, e tudo funciona sem internet.",
      en: "The office of a school with around 535 students, from preschool to high school, ran on loose spreadsheets and documents spread across several systems. On my own initiative, I built a local web app: one PC acts as the server, the others connect through the browser, and everything works offline.",
      es: "La secretaría de una escuela con cerca de 535 alumnos, de preescolar a bachillerato, trabajaba con hojas de cálculo y documentos sueltos repartidos en varios sistemas. Por iniciativa propia, construí una app web local: una PC funciona como servidor, las demás acceden por el navegador y todo funciona sin internet.",
    },
    impact: {
      pt: "De planilhas soltas a um sistema único, em uso por toda a secretaria",
      en: "From scattered spreadsheets to one system the whole school office uses",
      es: "De hojas de cálculo sueltas a un sistema único que usa toda la secretaría",
    },
    role: {
      pt: "Autor único: levantamento, arquitetura, código, instalação e suporte",
      en: "Sole author: requirements, architecture, code, installation and support",
      es: "Autor único: requisitos, arquitectura, código, instalación y soporte",
    },
    metrics: [
      {
        value: "~535",
        label: { pt: "alunos no escopo", en: "students in scope", es: "alumnos en el alcance" },
      },
      {
        value: "0",
        label: {
          pt: "dependências externas",
          en: "external dependencies",
          es: "dependencias externas",
        },
      },
      {
        value: "v5.8",
        label: {
          pt: "em evolução contínua",
          en: "continuously evolving",
          es: "en evolución continua",
        },
      },
      {
        value: "4",
        label: { pt: "etapas de entrega", en: "delivery stages", es: "etapas de entrega" },
      },
    ],
    highlights: [
      {
        pt: "Node.js portátil sem npm, banco node:sqlite embutido e front-end em HTML/CSS/JS puro: roda num ambiente restrito, sem TI dedicada, e o instalador .bat baixa o runtime sozinho.",
        en: "Portable Node.js with no npm, the built-in node:sqlite database and a plain HTML/CSS/JS front end: it runs in a locked-down environment with no IT staff, and a .bat installer fetches the runtime itself.",
        es: "Node.js portátil sin npm, la base de datos node:sqlite integrada y un front-end en HTML/CSS/JS puro: funciona en un entorno restringido, sin TI dedicada, y un instalador .bat descarga el runtime por sí solo.",
      },
      {
        pt: "Matrícula e rematrícula com placar da campanha, contrato gerado a partir do modelo oficial .xlsx, documentos oficiais com 1 clique e registro de cada emissão.",
        en: "Enrollment and re-enrollment with a campaign scoreboard, contracts generated from the official .xlsx template, one-click official documents and a log of every issue.",
        es: "Matrícula y rematrícula con marcador de la campaña, contratos generados a partir de la plantilla oficial .xlsx, documentos oficiales con 1 clic y registro de cada emisión.",
      },
      {
        pt: "Segurança e LGPD: login por pessoa com perfis, auditoria, backups automáticos cifrados, bloqueio de tela, log de consultas e descarte de ex-alunos. Dados reais nunca vão para o Git.",
        en: "Security and privacy: per-person login with roles, audit trail, encrypted automatic backups, screen lock, access log and former-student data disposal. Real data never reaches Git.",
        es: "Seguridad y privacidad (LGPD): inicio de sesión por persona con perfiles, auditoría, copias de seguridad automáticas cifradas, bloqueo de pantalla, registro de consultas y eliminación de datos de exalumnos. Los datos reales nunca llegan a Git.",
      },
      {
        pt: "Atualização com 1 botão: mostra o changelog, faz backup, aplica e reinicia sozinho. Trata queda do servidor e edição simultânea.",
        en: "One-button updates: shows the changelog, backs up, applies and restarts on its own. Handles server outages and concurrent edits.",
        es: "Actualización con 1 botón: muestra el changelog, hace la copia de seguridad, aplica y se reinicia solo. Maneja caídas del servidor y ediciones simultáneas.",
      },
    ],
    stack: ["Node.js", "node:sqlite", "JavaScript", "HTML", "CSS", "PowerShell"],
    presentation: {
      src: "/projects/sek/apresentacao.mp4",
      poster: "/projects/sek/poster.jpg",
      duration: "1:05",
    },
    teaser: { src: "/projects/sek/trailer.mp4", poster: "/projects/sek/trailer-poster.jpg" },
    privateCode: true,
    hasCaseStudy: true,
  },
  {
    slug: "kiri",
    title: "KIRI",
    tier: "featured",
    status: "in-use",
    year: 2026,
    tagline: {
      pt: "Classificação automática de documentos pelo conteúdo",
      en: "Automatic, content-based document classification",
      es: "Clasificación automática de documentos por su contenido",
    },
    summary: {
      pt: "Importa PDFs em lote, classifica cada um pelo conteúdo (OCR + palavras-chave, com integração à API da Anthropic), sugere o nome padronizado e salva direto na pasta do aluno. Está em uso diário na secretaria.",
      en: "Imports PDFs in batches, classifies each one by its content (OCR + keywords, integrated with the Anthropic API), suggests a standardized name and saves it straight into the student's folder. The office uses it every day.",
      es: "Importa PDFs en lote, clasifica cada uno por su contenido (OCR + palabras clave, con integración a la API de Anthropic), sugiere el nombre estandarizado y lo guarda directo en la carpeta del alumno. La secretaría lo usa todos los días.",
    },
    impact: {
      pt: "3× mais documentos por dia",
      en: "3× more documents a day",
      es: "3× más documentos al día",
    },
    role: { pt: "Autor único", en: "Sole author", es: "Autor único" },
    metrics: [
      {
        value: "3×",
        label: {
          pt: "documentos por dia (~100 → ~300)",
          en: "documents a day (~100 → ~300)",
          es: "documentos al día (~100 → ~300)",
        },
      },
      {
        value: "3 → 1",
        label: {
          pt: "dias para processar uma turma",
          en: "days to process a class",
          es: "días para procesar un grupo",
        },
      },
    ],
    highlights: [
      {
        pt: "File System Access API: salva direto na pasta certa, sem baixar e mover arquivo por arquivo.",
        en: "File System Access API: saves straight into the right folder instead of downloading and moving files one by one.",
        es: "File System Access API: guarda directo en la carpeta correcta, sin descargar y mover archivo por archivo.",
      },
      {
        pt: "Detecção de duplicados, fila com progresso, atalhos de teclado, histórico exportável e configurações persistidas.",
        en: "Duplicate detection, a progress queue, keyboard shortcuts, exportable history and persisted settings.",
        es: "Detección de duplicados, cola con progreso, atajos de teclado, historial exportable y configuración persistente.",
      },
    ],
    stack: [
      "JavaScript",
      "HTML",
      "CSS",
      "PDF.js",
      "OCR",
      "File System Access API",
      "Anthropic API",
    ],
    links: {
      repo: "https://github.com/kevinhsdev/kiri",
      demo: "https://kevinhsdev.github.io/kiri/",
    },
    presentation: {
      src: "/projects/kiri/apresentacao.mp4",
      poster: "/projects/kiri/poster.jpg",
      duration: "1:11",
    },
    hasCaseStudy: true,
  },
  {
    slug: "rumo",
    title: "RUMO",
    tier: "featured",
    status: "live",
    year: 2026,
    tagline: {
      pt: "Landing page 3D feita inteira por agentes de IA, sem eu escrever uma linha de código",
      en: "A 3D landing page built entirely by AI agents, without me writing a line of code",
      es: "Landing page 3D hecha completamente por agentes de IA, sin que yo escribiera una línea de código",
    },
    summary: {
      pt: "Landing page conceitual de uma agência de viagens fictícia. O site é um filme preso à rolagem: a câmera atravessa a janela de um avião em 3D, desce pelas nuvens até o destino, os cards voam para um globo de pontos e o globo desenrola num cartão de embarque. Todo o código foi escrito por agentes de IA; o meu trabalho foi a direção, a revisão e o harness que guia os agentes.",
      en: "A concept landing page for a fictional travel agency. The site is a film tied to the scroll: the camera passes through a 3D airplane window, drops through the clouds to the destination, the cards fly into a dotted globe and the globe unrolls into a boarding pass. AI agents wrote all of the code; my work was the direction, the review and the harness that guides the agents.",
      es: "Landing page conceptual de una agencia de viajes ficticia. El sitio es una película atada al scroll: la cámara atraviesa la ventanilla de un avión en 3D, baja entre las nubes hasta el destino, las tarjetas vuelan hacia un globo de puntos y el globo se despliega en una tarjeta de embarque. Todo el código lo escribieron agentes de IA; mi trabajo fue la dirección, la revisión y el harness que guía a los agentes.",
    },
    impact: {
      pt: "Do zero ao ar com zero linhas de código escritas à mão",
      en: "From zero to live with zero lines of hand-written code",
      es: "De cero a publicado con cero líneas de código escritas a mano",
    },
    role: {
      pt: "Direção, revisão e harness engineering; o código é dos agentes",
      en: "Direction, review and harness engineering; the agents wrote the code",
      es: "Dirección, revisión y harness engineering; el código es de los agentes",
    },
    metrics: [
      {
        value: "0",
        label: {
          pt: "linhas escritas à mão",
          en: "hand-written lines",
          es: "líneas escritas a mano",
        },
      },
      {
        value: "60 fps",
        label: { pt: "cena 3D ao vivo", en: "live 3D scene", es: "escena 3D en vivo" },
      },
    ],
    highlights: [
      {
        pt: "Harness para os agentes: um guia do projeto (CLAUDE.md) com a identidade, as regras que não podem quebrar, onde mexer em cada coisa e um roteiro de verificação em desktop e celular.",
        en: "A harness for the agents: a project guide (CLAUDE.md) with the identity, the rules that must not break, where to change each thing and a check script for desktop and phone.",
        es: "Harness para los agentes: una guía del proyecto (CLAUDE.md) con la identidad, las reglas que no se pueden romper, dónde cambiar cada cosa y un guion de verificación en escritorio y móvil.",
      },
      {
        pt: "Cena 3D ao vivo com Three.js: janelas de avião modeladas em código, persianas com shader e um globo de pontos com rotas que desenrola num mapa plano.",
        en: "A live Three.js scene: airplane windows modeled in code, shader-driven blinds and a dotted globe with routes that unrolls into a flat map.",
        es: "Escena 3D en vivo con Three.js: ventanillas de avión modeladas en código, persianas con shader y un globo de puntos con rutas que se despliega en un mapa plano.",
      },
      {
        pt: "Um único palco preso à rolagem (GSAP ScrollTrigger + Lenis): o scroll dirige a câmera e o tempo dirige o texto.",
        en: "One stage pinned to the scroll (GSAP ScrollTrigger + Lenis): the scroll drives the camera and time drives the text.",
        es: "Un único escenario fijado al scroll (GSAP ScrollTrigger + Lenis): el scroll dirige la cámara y el tiempo dirige el texto.",
      },
      {
        pt: "Hover, foco e toque em todo elemento clicável, suporte a movimento reduzido e layout responsivo, sem framework.",
        en: "Hover, focus and touch states on every clickable element, reduced-motion support and a responsive layout, with no framework.",
        es: "Estados de hover, foco y toque en todo elemento clicable, soporte de movimiento reducido y layout responsivo, sin framework.",
      },
    ],
    stack: ["Claude Code", "Three.js", "GSAP", "Lenis", "Vite", "JavaScript", "GitHub Pages"],
    links: {
      repo: "https://github.com/kevinhsdev/rumo",
      demo: "https://kevinhsdev.github.io/rumo/",
    },
    presentation: {
      src: "/projects/rumo/apresentacao.mp4",
      poster: "/projects/rumo/poster.jpg",
      duration: "0:47",
    },
    teaser: { src: "/projects/rumo/trailer.mp4", poster: "/projects/rumo/trailer-poster.jpg" },
    hasCaseStudy: true,
  },
  {
    slug: "blood-bank",
    title: { pt: "Sistema Hemocentro", en: "Blood Bank System", es: "Sistema de Banco de Sangre" },
    tier: "featured",
    status: "academic",
    year: 2026,
    tagline: {
      pt: "Gestão de banco de sangue com estoque atualizado por trigger",
      en: "Blood bank management with trigger-driven inventory",
      es: "Gestión de banco de sangre con inventario actualizado por trigger",
    },
    summary: {
      pt: "Projeto acadêmico da UMC em equipe de 3 pessoas. Implementei a camada DAO e as triggers MySQL que atualizam o estoque por tipo sanguíneo automaticamente, em módulos de Paciente, Doador, Doação e Estoque.",
      en: "A UMC team project (3 people). I implemented the DAO layer and the MySQL triggers that keep inventory per blood type up to date automatically, across Patient, Donor, Donation and Inventory modules.",
      es: "Proyecto académico de la UMC en equipo de 3 personas. Implementé la capa DAO y los triggers de MySQL que actualizan automáticamente el inventario por tipo de sangre, en módulos de Paciente, Donante, Donación e Inventario.",
    },
    impact: {
      pt: "Estoque consistente garantido pelo próprio banco",
      en: "Inventory consistency enforced by the database itself",
      es: "Inventario consistente garantizado por la propia base de datos",
    },
    role: {
      pt: "Camada DAO e triggers MySQL",
      en: "DAO layer and MySQL triggers",
      es: "Capa DAO y triggers de MySQL",
    },
    teamSize: 3,
    highlights: [
      {
        pt: "Arquitetura em camadas: modelos, um DAO por entidade com JDBC e uma ConnectionFactory central.",
        en: "Layered architecture: models, one JDBC DAO per entity and a central ConnectionFactory.",
        es: "Arquitectura en capas: modelos, un DAO con JDBC por entidad y una ConnectionFactory central.",
      },
    ],
    stack: ["Java 17", "JDBC", "MySQL 8", "Maven", "DAO"],
    links: { repo: "https://github.com/kevinhsdev/blood-base-management" },
    hasCaseStudy: true,
  },
  {
    slug: "oase-lar",
    title: "OASE · Lar",
    tier: "other",
    status: "in-development",
    year: 2026,
    tagline: {
      pt: "Sistema para um lar de idosos, offline e sem dependências",
      en: "Offline, zero-dependency system for an elderly care home",
      es: "Sistema para una residencia de ancianos, offline y sin dependencias",
    },
    summary: {
      pt: "A pedido da gestão, um sistema para o lar de idosos mantido pela mesma instituição, onde hoje o registro é feito à mão. Reaproveita o motor do SEK (backups cifrados, atualização por botão, auditoria) e já tem módulos de residentes, diário da equipe por turno, agenda, estoque, prescrições com folha de medicação e vacinas. Os requisitos ainda estão sendo validados, e todos os testes usam dados fictícios.",
      en: "Requested by management: a system for the elderly care home run by the same institution, where records are still kept by hand. It reuses the SEK engine (encrypted backups, one-button updates, audit trail) and already covers residents, a per-shift team log, scheduling, inventory, prescriptions with a medication chart, and vaccines. Requirements are still being validated, and all testing uses fictional data.",
      es: "A pedido de la dirección, un sistema para la residencia de ancianos de la misma institución, donde hoy el registro se hace a mano. Reutiliza el motor de SEK (copias de seguridad cifradas, actualización con un botón, auditoría) y ya tiene módulos de residentes, diario del equipo por turno, agenda, inventario, prescripciones con hoja de medicación y vacunas. Los requisitos aún se están validando, y todas las pruebas usan datos ficticios.",
    },
    impact: {
      pt: "Medicação: cada horário só pode ser marcado uma vez, o que evita dose dupla",
      en: "Medication: each dose slot can only be checked once, preventing double doses",
      es: "Medicación: cada horario solo puede marcarse una vez, lo que evita la dosis doble",
    },
    stack: ["Node.js", "node:sqlite", "JavaScript", "HTML", "CSS"],
    privateCode: true,
  },
  {
    slug: "amatus",
    title: "AMATUS",
    tier: "other",
    status: "live",
    year: 2026,
    tagline: {
      pt: "Site oficial de um grupo jovem missionário",
      en: "Official website for a youth missionary group",
      es: "Sitio oficial de un grupo juvenil misionero",
    },
    summary: {
      pt: "Tema escuro com partículas “ember”, bilíngue PT/EN, JavaScript puro, publicado no GitHub Pages e usado pelo grupo.",
      en: "Dark theme with “ember” particles, bilingual PT/EN, vanilla JavaScript, hosted on GitHub Pages and used by the group.",
      es: "Tema oscuro con partículas “ember”, bilingüe PT/EN, JavaScript puro, publicado en GitHub Pages y usado por el grupo.",
    },
    stack: ["JavaScript", "HTML", "CSS", "GitHub Pages"],
    links: {
      repo: "https://github.com/kevinhsdev/AMATUS",
      demo: "https://kevinhsdev.github.io/AMATUS/",
    },
    cover: "/projects/amatus/cover.webp",
  },
  {
    slug: "site-lut",
    cover: "/projects/site-lut/cover.webp",
    title: "I. E. Luterano",
    tier: "other",
    status: "in-development",
    year: 2026,
    tagline: {
      pt: "Protótipo do novo site da escola onde trabalho",
      en: "A prototype for the new website of the school where I work",
      es: "Prototipo del nuevo sitio de la escuela donde trabajo",
    },
    summary: {
      pt: "Site institucional em HTML, CSS e JavaScript puros, com ensino, estrutura, intercâmbio, matrículas 2027 (editais e listas de materiais), atividades e contato. Ainda não foi adotado pela escola: é um protótipo que vou propor.",
      en: "An institutional website in plain HTML, CSS and JavaScript, covering teaching, facilities, exchange programs, 2027 enrollment (notices and supply lists), activities and contact. Not adopted by the school yet: it's a prototype I'm going to propose.",
      es: "Sitio institucional en HTML, CSS y JavaScript puros, con enseñanza, instalaciones, intercambio, matrículas 2027 (convocatorias y listas de materiales), actividades y contacto. La escuela aún no lo adoptó: es un prototipo que voy a proponer.",
    },
    stack: ["HTML", "CSS", "JavaScript"],
    links: {
      repo: "https://github.com/kevinhsdev/site-lut",
      demo: "https://kevinhsdev.github.io/site-lut/",
    },
  },
  {
    slug: "finance-api",
    // TODO(kevin): final name; "in development" until then.
    title: { pt: "Em desenvolvimento", en: "In development", es: "En desarrollo" },
    tier: "other",
    status: "in-development",
    year: 2026,
    tagline: {
      pt: "API REST de finanças pessoais com Spring Boot",
      en: "A personal finance REST API with Spring Boot",
      es: "API REST de finanzas personales con Spring Boot",
    },
    summary: {
      pt: "Receitas e despesas organizadas por categoria, com um resumo do mês (saldo e gastos por categoria). Em desenvolvimento, etapa por etapa, com um guia de estudo que explica cada parte do código.",
      en: "Income and expenses organized by category, with a monthly summary (balance and spending per category). Built step by step, with a study guide that explains every part of the code.",
      es: "Ingresos y gastos organizados por categoría, con un resumen del mes (saldo y gastos por categoría). En desarrollo, paso a paso, con una guía de estudio que explica cada parte del código.",
    },
    stack: ["Java 25", "Spring Boot", "Spring Data JPA", "PostgreSQL", "Docker"],
    links: { repo: "https://github.com/kevinhsdev/studying-spring-boot-api-rest" },
  },
] satisfies z.input<typeof projectSchema>[];

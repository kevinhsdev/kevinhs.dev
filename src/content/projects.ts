import type { z } from "zod";
import type { projectSchema } from "./schema";

/** Featured first, in display order. */
export const projects = [
  {
    slug: "sek",
    title: "SEK · Gestão Escolar",
    tier: "featured",
    status: "in-use",
    year: 2026,
    tagline: {
      pt: "Sistema de gestão escolar offline, multiusuário e sem dependências",
      en: "Offline, multi-user school management system with zero dependencies",
    },
    summary: {
      pt: "A secretaria de uma escola com cerca de 535 alunos, do Maternal ao Ensino Médio, trabalhava com planilhas e documentos avulsos espalhados por vários sistemas. Por iniciativa própria, construí um app web local: um PC funciona como servidor, os outros acessam pelo navegador, e tudo funciona sem internet.",
      en: "The office of a school with around 535 students, from preschool to high school, ran on loose spreadsheets and documents spread across several systems. On my own initiative, I built a local web app: one PC acts as the server, the others connect through the browser, and everything works offline.",
    },
    impact: {
      pt: "De planilhas soltas a um sistema único, em uso por toda a secretaria",
      en: "From scattered spreadsheets to one system the whole school office uses",
    },
    role: {
      pt: "Autor único: levantamento, arquitetura, código, instalação e suporte",
      en: "Sole author: requirements, architecture, code, installation and support",
    },
    metrics: [
      { value: "~535", label: { pt: "alunos no escopo", en: "students in scope" } },
      { value: "0", label: { pt: "dependências externas", en: "external dependencies" } },
      { value: "v5.8", label: { pt: "em evolução contínua", en: "continuously evolving" } },
      { value: "4", label: { pt: "etapas de entrega", en: "delivery stages" } },
    ],
    highlights: [
      {
        pt: "Node.js portátil sem npm, banco node:sqlite embutido e front-end em HTML/CSS/JS puro: roda num ambiente restrito, sem TI dedicada, e o instalador .bat baixa o runtime sozinho.",
        en: "Portable Node.js with no npm, the built-in node:sqlite database and a plain HTML/CSS/JS front end: it runs in a locked-down environment with no IT staff, and a .bat installer fetches the runtime itself.",
      },
      {
        pt: "Matrícula e rematrícula com placar da campanha, contrato gerado a partir do modelo oficial .xlsx, documentos oficiais com 1 clique e registro de cada emissão.",
        en: "Enrollment and re-enrollment with a campaign scoreboard, contracts generated from the official .xlsx template, one-click official documents and a log of every issue.",
      },
      {
        pt: "Segurança e LGPD: login por pessoa com perfis, auditoria, backups automáticos cifrados, bloqueio de tela, log de consultas e descarte de ex-alunos. Dados reais nunca vão para o Git.",
        en: "Security and privacy: per-person login with roles, audit trail, encrypted automatic backups, screen lock, access log and former-student data disposal. Real data never reaches Git.",
      },
      {
        pt: "Atualização com 1 botão: mostra o changelog, faz backup, aplica e reinicia sozinho. Trata queda do servidor e edição simultânea.",
        en: "One-button updates: shows the changelog, backs up, applies and restarts on its own. Handles server outages and concurrent edits.",
      },
    ],
    stack: ["Node.js", "node:sqlite", "JavaScript", "HTML", "CSS", "PowerShell"],
    privateCode: true,
    hasCaseStudy: true,
  },
  {
    slug: "pdf-renamer",
    title: "PDF Renamer",
    tier: "featured",
    status: "in-use",
    year: 2026,
    tagline: {
      pt: "Classificação automática de documentos pelo conteúdo",
      en: "Automatic, content-based document classification",
    },
    summary: {
      pt: "Importa PDFs em lote, classifica cada um pelo conteúdo (OCR + palavras-chave, com integração à API da Anthropic), sugere o nome padronizado e salva direto na pasta do aluno. Está em uso diário na secretaria.",
      en: "Imports PDFs in batches, classifies each one by its content (OCR + keywords, integrated with the Anthropic API), suggests a standardized name and saves it straight into the student's folder. The office uses it every day.",
    },
    impact: { pt: "3× mais documentos por dia", en: "3× more documents a day" },
    role: { pt: "Autor único", en: "Sole author" },
    metrics: [
      {
        value: "3×",
        label: { pt: "documentos por dia (~100 → ~300)", en: "documents a day (~100 → ~300)" },
      },
      {
        value: "3 → 1",
        label: { pt: "dias para processar uma turma", en: "days to process a class" },
      },
    ],
    highlights: [
      {
        pt: "File System Access API: salva direto na pasta certa, sem baixar e mover arquivo por arquivo.",
        en: "File System Access API: saves straight into the right folder instead of downloading and moving files one by one.",
      },
      {
        pt: "Detecção de duplicados, fila com progresso, atalhos de teclado, histórico exportável e configurações persistidas.",
        en: "Duplicate detection, a progress queue, keyboard shortcuts, exportable history and persisted settings.",
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
      repo: "https://github.com/kevinhsdev/pdf-renamer",
      demo: "https://kevinhsdev.github.io/pdf-renamer/",
    },
    hasCaseStudy: true,
  },
  {
    slug: "blood-bank",
    title: "Sistema Hemocentro",
    tier: "featured",
    status: "academic",
    year: 2026,
    tagline: {
      pt: "Gestão de banco de sangue com estoque atualizado por trigger",
      en: "Blood bank management with trigger-driven inventory",
    },
    summary: {
      pt: "Projeto acadêmico da UMC em equipe de 3 pessoas. Implementei a camada DAO e as triggers MySQL que atualizam o estoque por tipo sanguíneo automaticamente, em módulos de Paciente, Doador, Doação e Estoque.",
      en: "A UMC team project (3 people). I implemented the DAO layer and the MySQL triggers that keep inventory per blood type up to date automatically, across Patient, Donor, Donation and Inventory modules.",
    },
    impact: {
      pt: "Estoque consistente garantido pelo próprio banco",
      en: "Inventory consistency enforced by the database itself",
    },
    role: { pt: "Camada DAO e triggers MySQL", en: "DAO layer and MySQL triggers" },
    teamSize: 3,
    highlights: [
      {
        pt: "Arquitetura em camadas: modelos, um DAO por entidade com JDBC e uma ConnectionFactory central.",
        en: "Layered architecture: models, one JDBC DAO per entity and a central ConnectionFactory.",
      },
    ],
    stack: ["Java 17", "Spring Boot", "JDBC", "MySQL 8", "Maven", "DAO"],
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
    },
    summary: {
      pt: "A pedido da gestão, um sistema para o lar de idosos mantido pela mesma instituição, onde hoje o registro é feito à mão. Reaproveita o motor do SEK (backups cifrados, atualização por botão, auditoria) e já tem módulos de residentes, diário da equipe por turno, agenda, estoque, prescrições com folha de medicação e vacinas. Os requisitos ainda estão sendo validados, e todos os testes usam dados fictícios.",
      en: "Requested by management: a system for the elderly care home run by the same institution, where records are still kept by hand. It reuses the SEK engine (encrypted backups, one-button updates, audit trail) and already covers residents, a per-shift team log, scheduling, inventory, prescriptions with a medication chart, and vaccines. Requirements are still being validated, and all testing uses fictional data.",
    },
    impact: {
      pt: "Medicação: cada horário só pode ser marcado uma vez, o que evita dose dupla",
      en: "Medication: each dose slot can only be checked once, preventing double doses",
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
    },
    summary: {
      pt: "Tema escuro com partículas “ember”, bilíngue PT/EN, JavaScript puro, publicado no GitHub Pages e usado pelo grupo.",
      en: "Dark theme with “ember” particles, bilingual PT/EN, vanilla JavaScript, hosted on GitHub Pages and used by the group.",
    },
    stack: ["JavaScript", "HTML", "CSS", "GitHub Pages"],
    links: {
      repo: "https://github.com/kevinhsdev/AMATUS",
      demo: "https://kevinhsdev.github.io/AMATUS/",
    },
  },
  {
    slug: "spring-boot-essentials",
    title: "Spring Boot Essentials",
    tier: "other",
    status: "in-development",
    year: 2026,
    tagline: { pt: "API REST em evolução com Spring Boot", en: "An evolving Spring Boot REST API" },
    summary: {
      pt: "API REST documentada com Swagger/OpenAPI e Lombok. Próximos passos: JPA, tratamento global de exceções e testes.",
      en: "REST API documented with Swagger/OpenAPI, using Lombok. Next up: JPA, global exception handling and tests.",
    },
    stack: ["Java", "Spring Boot", "Swagger/OpenAPI", "Lombok"],
    links: { repo: "https://github.com/kevinhsdev/spring-boot-essentials" },
  },
  {
    slug: "student-api",
    title: "API REST de Cadastro de Alunos",
    tier: "other",
    status: "in-development",
    year: 2026,
    tagline: {
      pt: "CRUD de alunos com Spring Data JPA",
      en: "Student CRUD API with Spring Data JPA",
    },
    summary: {
      pt: "Endpoints CRUD para cadastro e consulta de alunos, organizados em Controller → Service → Repository. Em desenvolvimento; o código será publicado quando estiver pronto.",
      en: "CRUD endpoints to register and query students, organized as Controller → Service → Repository. In development; the code will be published when it's ready.",
    },
    stack: ["Java", "Spring Boot", "Spring Data JPA", "H2"],
  },
] satisfies z.input<typeof projectSchema>[];

import type { z } from "zod";
import type { skillGroupSchema } from "./schema";

export const skills = [
  {
    tier: "daily",
    items: [
      "Java",
      "Spring Boot",
      "MySQL / SQL",
      "Git / GitHub",
      "JavaScript",
      "Dart",
      "Claude / Claude Code",
    ],
  },
  {
    tier: "experienced",
    items: [
      "HTML",
      "CSS",
      "Python",
      "Flutter",
      "Node.js",
      "SQLite",
      "Supabase",
      "Docker",
      "Linux",
      "Postman",
      "Insomnia",
      "JDBC",
      "Maven",
      "IntelliJ",
      "Eclipse",
      "VS Code",
      "Cursor",
      "v0",
      "Obsidian",
    ],
  },
  {
    tier: "learning",
    items: [
      "AWS",
      "Spring Data JPA",
      "n8n",
      { pt: "Testes automatizados", en: "Automated testing", es: "Pruebas automatizadas" },
      { pt: "Cibersegurança", en: "Cybersecurity", es: "Ciberseguridad" },
      { pt: "IA aplicada ao Java", en: "AI applied to Java", es: "IA aplicada a Java" },
    ],
  },
  {
    tier: "concepts",
    items: [
      {
        pt: "Orientação a Objetos",
        en: "Object-oriented programming",
        es: "Programación orientada a objetos",
      },
      { pt: "Padrão DAO", en: "DAO pattern", es: "Patrón DAO" },
      "REST APIs",
      { pt: "Arquitetura em camadas", en: "Layered architecture", es: "Arquitectura en capas" },
      "UML",
      { pt: "Versionamento", en: "Version control", es: "Control de versiones" },
      {
        pt: "LGPD aplicada a software",
        en: "Privacy by design (LGPD)",
        es: "Privacidad desde el diseño (LGPD)",
      },
    ],
  },
] satisfies z.input<typeof skillGroupSchema>[];

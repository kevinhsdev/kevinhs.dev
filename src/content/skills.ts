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
      "Docker",
      "Postman",
      "JDBC",
      "Maven",
      "IntelliJ",
      "VS Code",
    ],
  },
  {
    tier: "learning",
    items: [
      "AWS",
      "Spring Data JPA",
      { pt: "Testes automatizados", en: "Automated testing" },
      { pt: "Cibersegurança", en: "Cybersecurity" },
      { pt: "IA aplicada ao Java", en: "AI applied to Java" },
    ],
  },
  {
    tier: "concepts",
    items: [
      { pt: "Orientação a Objetos", en: "Object-oriented programming" },
      { pt: "Padrão DAO", en: "DAO pattern" },
      "REST APIs",
      { pt: "Arquitetura em camadas", en: "Layered architecture" },
      "UML",
      { pt: "Versionamento", en: "Version control" },
      { pt: "LGPD aplicada a software", en: "Privacy by design (LGPD)" },
    ],
  },
] satisfies z.input<typeof skillGroupSchema>[];

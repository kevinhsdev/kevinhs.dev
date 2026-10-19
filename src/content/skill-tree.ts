import type { z } from "zod";
import type { skillBranchSchema } from "./schema";

/**
 * The arcade theme's skill tree: the Skills list regrouped into branches, each
 * read top to bottom as "learned this, then this". Only the grouping is new;
 * every node is an existing skill and its status is its tier in skills.ts.
 */
export const skillTree = [
  {
    id: "backend",
    label: { pt: "Back-end", en: "Back-end" },
    nodes: ["Java", "Spring Boot", "Spring Data JPA"],
  },
  {
    id: "data",
    label: { pt: "Dados", en: "Data" },
    nodes: ["MySQL / SQL", "JDBC", "SQLite"],
  },
  {
    id: "web",
    label: { pt: "Web", en: "Web" },
    nodes: ["HTML", "CSS", "JavaScript", "Node.js"],
  },
  {
    id: "mobile",
    label: { pt: "Mobile", en: "Mobile" },
    nodes: ["Dart", "Flutter"],
  },
  {
    id: "ops",
    label: { pt: "DevOps e Cloud", en: "DevOps & Cloud" },
    nodes: ["Git / GitHub", "Docker", "AWS"],
  },
  {
    id: "ai",
    label: { pt: "IA", en: "AI" },
    nodes: ["Claude / Claude Code", "AI applied to Java"],
  },
] satisfies z.input<typeof skillBranchSchema>[];

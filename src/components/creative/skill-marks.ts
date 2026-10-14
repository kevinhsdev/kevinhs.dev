import {
  Boxes,
  Cable,
  DatabaseZap,
  FlaskConical,
  GitBranch,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Webhook,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/**
 * How each skill is marked in the Skills section, keyed by its English name
 * (src/content/skills.ts). Technologies get their real, full-color logo
 * (public/skills/<logo>.svg); `dark` means a <logo>-dark.svg exists, with the
 * one color that would vanish on the navy theme lightened. Concepts get a
 * stroke icon from the site's icon set instead, so the two read differently.
 * Logo sources and licenses: public/skills/NOTICE.txt.
 */
export type SkillMark = { logo: string; dark?: true } | { icon: LucideIcon };

export const skillMarks: Record<string, SkillMark> = {
  Java: { logo: "java" },
  "Spring Boot": { logo: "springboot" },
  "Spring Data JPA": { logo: "spring" },
  "MySQL / SQL": { logo: "mysql", dark: true },
  "Git / GitHub": { logo: "git" },
  JavaScript: { logo: "javascript" },
  Dart: { logo: "dart" },
  "Claude / Claude Code": { logo: "claude" },
  HTML: { logo: "html" },
  CSS: { logo: "css" },
  Python: { logo: "python" },
  Flutter: { logo: "flutter", dark: true },
  "Node.js": { logo: "nodejs" },
  SQLite: { logo: "sqlite", dark: true },
  Docker: { logo: "docker", dark: true },
  Postman: { logo: "postman" },
  Maven: { logo: "maven" },
  IntelliJ: { logo: "intellij" },
  "VS Code": { logo: "vscode" },
  AWS: { logo: "aws", dark: true },

  JDBC: { icon: Cable },
  "Automated testing": { icon: FlaskConical },
  Cybersecurity: { icon: ShieldCheck },
  "AI applied to Java": { icon: Sparkles },
  "Object-oriented programming": { icon: Boxes },
  "DAO pattern": { icon: DatabaseZap },
  "REST APIs": { icon: Webhook },
  "Layered architecture": { icon: Layers },
  UML: { icon: Workflow },
  "Version control": { icon: GitBranch },
  "Privacy by design (LGPD)": { icon: Lock },
};

/** Stack names used in projects.ts that are written differently from the skill names. */
const stackAliases: Record<string, string> = {
  "node:sqlite": "SQLite",
  "Java 17": "Java",
  "Java 25": "Java",
  "MySQL 8": "MySQL / SQL",
};

/** The logo for a project's stack entry, if that technology has one. */
export function stackLogo(name: string): Extract<SkillMark, { logo: string }> | undefined {
  const mark = skillMarks[stackAliases[name] ?? name];
  return mark && "logo" in mark ? mark : undefined;
}

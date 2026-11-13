import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { pick, skills } from "@/content";
import type { Locale } from "@/i18n/routing";
import { SkillsView, type Skill } from "./skills-view";

/** Logo file in public/skills, keyed by the pt name; `dark` when a dark-theme variant exists. */
const LOGOS: Record<string, { file: string; dark?: boolean }> = {
  Java: { file: "java" },
  "Spring Boot": { file: "springboot" },
  "MySQL / SQL": { file: "mysql", dark: true },
  "Git / GitHub": { file: "git" },
  JavaScript: { file: "javascript" },
  Dart: { file: "dart" },
  "Claude / Claude Code": { file: "claude" },
  HTML: { file: "html" },
  CSS: { file: "css" },
  Python: { file: "python" },
  Flutter: { file: "flutter", dark: true },
  "Node.js": { file: "nodejs" },
  SQLite: { file: "sqlite", dark: true },
  Docker: { file: "docker", dark: true },
  Postman: { file: "postman" },
  Maven: { file: "maven" },
  IntelliJ: { file: "intellij" },
  "VS Code": { file: "vscode" },
  AWS: { file: "aws", dark: true },
  "Spring Data JPA": { file: "spring" },
  JDBC: { file: "jdbc" },
  Supabase: { file: "supabase" },
  Linux: { file: "linux" },
  Insomnia: { file: "insomnia", dark: true },
  Eclipse: { file: "eclipse", dark: true },
  Obsidian: { file: "obsidian" },
  "Testes automatizados": { file: "testing" },
  Cibersegurança: { file: "security" },
  "IA aplicada ao Java": { file: "ai-java" },
  "Orientação a Objetos": { file: "oop" },
  "Padrão DAO": { file: "dao" },
  "REST APIs": { file: "rest" },
  "Arquitetura em camadas": { file: "layers" },
  UML: { file: "uml" },
  Versionamento: { file: "versioning" },
  "LGPD aplicada a software": { file: "lgpd" },
};

/** Skills: every skill with its tier and logo: a belt of logos, then an accordion by tier. */
export async function HomeSkills({ locale }: { locale: Locale }) {
  const t = await getTranslations("skills");
  const items: Skill[] = skills.flatMap((g) =>
    g.items.map((i) => {
      return { name: pick(i, locale), tier: g.tier, logo: LOGOS[pick(i, "pt")] };
    }),
  );
  const tiers = Object.fromEntries(skills.map((g) => [g.tier, t(`tiers.${g.tier}`)])) as Record<
    Skill["tier"],
    string
  >;

  return (
    <section id="skills" aria-labelledby="skills-title" className="pt-16 pb-28 lg:pt-24 lg:pb-40">
      <Reveal className="mx-auto mb-14 max-w-7xl px-5 sm:px-8">
        <p className="mb-4 font-mono text-xs tracking-widest text-accent uppercase" data-line>
          {t("title")}
        </p>
        <h2 id="skills-title" className="font-display text-6xl uppercase sm:text-8xl" data-line>
          {t("all")}
        </h2>
      </Reveal>
      <SkillsView items={items} tiers={tiers} label={t("all")} />
    </section>
  );
}

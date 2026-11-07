import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { Esteira } from "@/components/ui/esteira";
import { pick, projects, skills } from "@/content";
import type { Locale } from "@/i18n/routing";

/** Logo file in public/skills for each daily skill; `dark` when a dark-theme variant exists. */
const LOGOS: Record<string, { file: string; dark?: boolean }> = {
  Java: { file: "java" },
  "Spring Boot": { file: "springboot" },
  "MySQL / SQL": { file: "mysql", dark: true },
  "Git / GitHub": { file: "git" },
  JavaScript: { file: "javascript" },
  Dart: { file: "dart" },
  "Claude / Claude Code": { file: "claude" },
};

/** Projects whose stack names this skill: any part of "A / B" as a whole word ("Java 17" yes, "JavaScript" no). */
function usedIn(name: string) {
  const parts = name.toLowerCase().split(" / ");
  const names = (stack: string) => {
    const s = stack.toLowerCase();
    return parts.some((part) => s === part || s.startsWith(`${part} `));
  };
  return projects.filter((p) => p.stack.some(names)).map((p) => p.title);
}

/** The short daily list (the full list lives on About), as the Esteira's two rows. */
export async function HomeSkills({ locale }: { locale: Locale }) {
  const t = await getTranslations("skills");
  const names = (skills.find((g) => g.tier === "daily")?.items ?? []).map((i) => pick(i, locale));

  const cards = names.map((name) => {
    const logo = LOGOS[name];
    const used = usedIn(name);
    return (
      <article key={name} className="esteira-card">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
            {t("tiers.daily")}
          </span>
          {logo && (
            <span className="relative size-10">
              {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG logos */}
              <img
                src={`/skills/${logo.file}.svg`}
                alt=""
                className={`size-10 object-contain ${logo.dark ? "dark:hidden" : ""}`}
              />
              {logo.dark && (
                // eslint-disable-next-line @next/next/no-img-element -- dark-theme variant
                <img
                  src={`/skills/${logo.file}-dark.svg`}
                  alt=""
                  className="absolute inset-0 hidden size-10 object-contain dark:block"
                />
              )}
            </span>
          )}
        </div>
        <h3 className="mt-auto font-display text-5xl uppercase max-[900px]:text-4xl">{name}</h3>
        {used.length > 0 && (
          <p className="mt-3 line-clamp-2 font-mono text-xs text-muted">{used.join(" · ")}</p>
        )}
      </article>
    );
  });
  const half = Math.ceil(cards.length / 2);

  return (
    <section id="skills" aria-labelledby="skills-title" className="py-28 lg:py-40">
      <Reveal className="mx-auto mb-14 max-w-7xl px-5 sm:px-8">
        <p className="mb-4 font-mono text-xs tracking-widest text-accent uppercase" data-line>
          {t("title")}
        </p>
        <h2 id="skills-title" className="font-display text-6xl uppercase sm:text-8xl" data-line>
          {t("daily")}
        </h2>
      </Reveal>
      <Esteira label={t("daily")} rows={[cards.slice(0, half), cards.slice(half)]} />
    </section>
  );
}

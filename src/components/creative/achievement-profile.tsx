import { ArrowBigUpDash, CalendarRange, Hexagon, ScrollText, type LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { achievements, pick } from "@/content";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { AchievementIcon } from "./achievement-icon";
import { Radar } from "./achievement-views";
import { attributes, level, rarityTiers, score, seasons, unlocked } from "./achievements-model";

// PROTOTYPE: the player profile, a mix of the character sheet, trophy list,
// plus attributes, quests and seasons.

const L = (locale: Locale, pt: string, en: string) => (locale === "pt" ? pt : en);
const vars = (v: Record<string, string | number>) => v as CSSProperties;
const tierLabel = {
  bronze: ["Bronze", "Bronze"],
  silver: ["Prata", "Silver"],
  gold: ["Ouro", "Gold"],
  platinum: ["Platina", "Platinum"],
} as const;

/** A titled panel: what it is, one line on how to read it, then the content. */
function Panel({
  icon: Icon,
  title,
  note,
  meta,
  className,
  i,
  children,
}: {
  icon: LucideIcon;
  title: string;
  note: string;
  meta?: ReactNode;
  className: string;
  i: number;
  children: ReactNode;
}) {
  return (
    <section className={cn("lp-panel lab-rise", className)} style={vars({ "--i": i })}>
      <header className="lp-head">
        <span className="lp-head-icon">
          <Icon aria-hidden className="size-4" />
        </span>
        <div>
          <h4>{title}</h4>
          <p>{note}</p>
        </div>
        {meta && <span className="lp-head-meta">{meta}</span>}
      </header>
      {children}
    </section>
  );
}

export function ProfileView({ locale }: { locale: Locale }) {
  const lv = level();
  const need = lv.size - lv.into;
  const percent = Math.round((unlocked.length / achievements.length) * 100);
  const main = attributes(locale).reduce((best, a) => (a.earned > best.earned ? a : best));
  const years = seasons();
  const best = years.reduce((b, y) => (y.xp > b.xp ? y : b), {
    year: 0,
    xp: 1,
    count: 0,
  });
  const now = years.at(-1);
  const prev = years.at(-2);
  const growth = now && prev ? Math.round((now.xp / prev.xp) * 10) / 10 : 0;
  const quests = [
    ...achievements.filter((a) => a.status === "progress"),
    ...achievements.filter((a) => a.status === "locked").sort((a, b) => a.xp - b.xp),
  ];

  return (
    <div className="lp">
      {/* who: the character sheet, with the trophy summary on the right */}
      <section className="lp-hero lab-rise" style={vars({ "--i": 0 })}>
        <div className="lp-hero-main">
          <div
            className="lab-avatar-ring"
            style={vars({ "--pct": Math.round((lv.into / lv.size) * 100) })}
          >
            <span className="lab-avatar">K</span>
            <span className="lab-avatar-level">{lv.level}</span>
          </div>
          <div className="lp-id">
            <p className="lab-sheet-kicker">{L(locale, "Jogador 1", "Player 1")}</p>
            <h3 className="lab-sheet-name">Kevin Henrique</h3>
            <p className="lab-sheet-class">
              {L(locale, "Dev Backend · Júnior", "Backend Dev · Junior")}
            </p>
            <div className="lp-xp">
              <span style={vars({ "--w": lv.into / lv.size })}>
                <i />
              </span>
              <small>
                <b>{lv.into}</b>/{lv.size} XP ·{" "}
                {L(
                  locale,
                  `faltam ${need} para o nível ${lv.level + 1}`,
                  `${need} to level ${lv.level + 1}`,
                )}
              </small>
            </div>
          </div>
          <div className="lp-trophies">
            <span className="arcade-ring" style={vars({ "--pct": percent })}>
              <b>{percent}%</b>
            </span>
            <ul className="lp-medals">
              {rarityTiers().map((t) => (
                <li key={t.tier} data-rarity={t.tier}>
                  <i className="arcade-medal" />
                  <b>
                    {t.earned}/{t.all}
                  </b>
                  <span>{tierLabel[t.tier][locale === "pt" ? 0 : 1]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <dl className="lp-stats">
          <div>
            <dt>{L(locale, "Pontos", "Score")}</dt>
            <dd>{score} XP</dd>
          </div>
          <div>
            <dt>{L(locale, "Conquistas", "Achievements")}</dt>
            <dd>
              {unlocked.length}
              <small>/{achievements.length}</small>
            </dd>
          </div>
          <div>
            <dt>{L(locale, "Atributo principal", "Main attribute")}</dt>
            <dd>{main.label}</dd>
          </div>
          <div>
            <dt>{L(locale, "Melhor temporada", "Best season")}</dt>
            <dd>
              {best.year} <small>+{best.xp} XP</small>
            </dd>
          </div>
        </dl>
      </section>

      <Panel
        icon={Hexagon}
        title={L(locale, "Atributos", "Attributes")}
        note={L(
          locale,
          `XP por área. O pico é o atributo principal: ${main.label}.`,
          `XP per area. The peak is the main attribute: ${main.label}.`,
        )}
        className="lp-radar"
        i={1}
      >
        <Radar locale={locale} />
      </Panel>

      <Panel
        icon={ScrollText}
        title={L(locale, "Missões ativas", "Active quests")}
        note={L(
          locale,
          "O que estou fazendo agora e as próximas metas.",
          "What I'm doing now and the goals ahead.",
        )}
        meta={quests.length}
        className="lp-quests"
        i={2}
      >
        <ol>
          {quests.map((a) => (
            <li key={a.id} className={`is-${a.status}`}>
              <span className="lp-quest-icon">
                <AchievementIcon kind={a.kind} status={a.status} className="size-4" />
              </span>
              <span className="lp-quest-text">
                <b>{pick(a.title, locale)}</b>
                <small>
                  {a.status === "progress"
                    ? [a.org, L(locale, "em andamento", "in progress")].filter(Boolean).join(" · ")
                    : a.hint && pick(a.hint, locale)}
                </small>
                {a.status === "progress" && <span className="lp-quest-bar" aria-hidden />}
              </span>
              <span className="lp-quest-reward">
                +{a.xp} XP
                {a.xp >= need && (
                  <em title={L(locale, "Esta missão sobe meu nível", "This quest levels me up")}>
                    <ArrowBigUpDash aria-hidden className="size-3.5" />
                    {L(locale, `Nível ${lv.level + 1}`, `Level ${lv.level + 1}`)}
                  </em>
                )}
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel
        icon={CalendarRange}
        title={L(locale, "Temporadas", "Seasons")}
        note={
          now && growth > 1
            ? L(
                locale,
                `XP ganho por ano. ${now.year} rendeu ${growth}× o ano anterior.`,
                `XP earned per year. ${now.year} gave ${growth}× the year before.`,
              )
            : L(locale, "XP ganho por ano.", "XP earned per year.")
        }
        className="lp-seasons"
        i={3}
      >
        <ul className="lp-season-bars">
          {years.map((y, i) => (
            <li
              key={y.year}
              className={cn(y.year === best.year && "is-best")}
              style={vars({ "--h": y.xp / best.xp, "--i": i })}
            >
              <b>+{y.xp}</b>
              <i />
              <span>{y.year}</span>
              <small>
                {y.count}{" "}
                {y.count === 1
                  ? L(locale, "conquista", "unlock")
                  : L(locale, "conquistas", "unlocks")}
              </small>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

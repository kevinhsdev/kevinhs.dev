import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import { VT323 } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { achievements, pick, type Achievement, type AchievementKind } from "@/content";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import "@/styles/achievements-lab.css";
import { ClawView, NotificationsView } from "./achievement-play";
import { ProfileView } from "./achievement-profile";
import { CharacterView, HighScoreView, MapView, ShelfView, TreeView } from "./achievement-views";
import { AchievementsLab } from "./achievements-frame";
import { plain } from "./achievements-model";

// Pixel face for the arcade labels. VT323 keeps Portuguese accents, which most
// pixel fonts drop; card titles stay in the site's text face so they read easily.
const pixel = VT323({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/** 11×11 pixel-art icons, one string per row ("X" = lit pixel). */
const sprites: Record<AchievementKind | "lock", string[]> = {
  cert: [
    "..X.....X..",
    "...X...X...",
    "....X.X....",
    "...XXXXX...",
    "..XX...XX..",
    ".XX.XXX.XX.",
    ".XX.XXX.XX.",
    ".XX.XXX.XX.",
    "..XX...XX..",
    "...XXXXX...",
    "...........",
  ],
  event: [
    ".....X.....",
    "....XXX....",
    "....XXX....",
    "XXXXXXXXXXX",
    ".XXXXXXXXX.",
    "..XXXXXXX..",
    "..XXXXXXX..",
    ".XXXX.XXXX.",
    ".XXX...XXX.",
    "XX.......XX",
    "...........",
  ],
  language: [
    ".XXXXXXXXX.",
    "X.........X",
    "X.XX.XX.X.X",
    "X.........X",
    "X.XXXX.XX.X",
    "X.........X",
    ".XXXXXXXXX.",
    "...XX......",
    "..XX.......",
    ".X.........",
    "...........",
  ],
  career: [
    "...XXXXX...",
    "...X...X...",
    "XXXXXXXXXXX",
    "X.........X",
    "X.........X",
    "XXXXX.XXXXX",
    "X...XXX...X",
    "X.........X",
    "X.........X",
    "XXXXXXXXXXX",
    "...........",
  ],
  competition: [
    "..XXXXXXX..",
    "XXXXXXXXXXX",
    "X.XXXXXXX.X",
    "X.XXXXXXX.X",
    ".XXXXXXXXX.",
    "..XXXXXXX..",
    "...XXXXX...",
    "....XXX....",
    "....XXX....",
    "..XXXXXXX..",
    "..XXXXXXX..",
  ],
  lock: [
    "...XXXXX...",
    "..XX...XX..",
    "..X.....X..",
    "..X.....X..",
    ".XXXXXXXXX.",
    ".XXXXXXXXX.",
    ".XXXX.XXXX.",
    ".XXXX.XXXX.",
    ".XXXXXXXXX.",
    ".XXXXXXXXX.",
    "...........",
  ],
};

function Sprite({ name, className }: { name: keyof typeof sprites; className?: string }) {
  const rows = sprites[name];
  return (
    <svg
      aria-hidden
      viewBox="0 0 11 11"
      shapeRendering="crispEdges"
      fill="currentColor"
      className={className}
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null,
        ),
      )}
    </svg>
  );
}

function formatDate(date: string, locale: Locale) {
  const [year, month] = date.split("-");
  if (!month) return year;
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(`${date}-15T12:00:00Z`))
    .replace(".", "");
}

/** Rarity tier for the trophy-list and card looks, from the XP the goal is worth. */
function rarity(xp: number) {
  if (xp >= 1000) return "platinum";
  if (xp >= 200) return "gold";
  if (xp >= 150) return "silver";
  return "bronze";
}

function Card({
  item,
  index,
  locale,
  labels,
}: {
  item: Achievement;
  index: number;
  locale: Locale;
  labels: Record<string, string>;
}) {
  const status = {
    unlocked: labels.statusUnlocked,
    progress: labels.statusProgress,
    locked: labels.statusLocked,
  }[item.status];
  const meta = [item.org, item.date && formatDate(item.date, locale)].filter(Boolean).join(" · ");
  return (
    <li
      className={cn("arcade-card lab-rise", `is-${item.status}`)}
      data-rarity={rarity(item.xp)}
      data-tilt
      style={{ "--i": index } as CSSProperties}
    >
      <span className="arcade-glare" aria-hidden />
      <div className="flex items-start justify-between gap-4">
        <span className="arcade-sprite">
          <Sprite name={item.status === "locked" ? "lock" : item.kind} className="size-full" />
        </span>
        <span className="arcade-xp font-pixel">+{item.xp} XP</span>
      </div>
      <p className="arcade-status font-pixel">{status}</p>
      <h3 className="text-lg leading-snug font-semibold text-balance">
        {pick(item.title, locale)}
      </h3>
      {meta && <p className="arcade-meta font-pixel">{meta}</p>}
      {item.status === "locked" && item.hint && (
        <p className="arcade-hint">
          <span className="font-pixel">{labels.goal}:</span> {pick(item.hint, locale)}
        </p>
      )}
      {item.status === "progress" && (
        <div className="arcade-loading" aria-label={labels.statusProgress}>
          <span className="font-pixel">{labels.loading}</span>
          <span className="arcade-segments" aria-hidden>
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} style={{ "--i": i } as CSSProperties} />
            ))}
          </span>
        </div>
      )}
      {item.status === "unlocked" && item.credentialUrl && (
        <a
          className="arcade-link font-pixel"
          href={item.credentialUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {labels.credential} <ArrowUpRight aria-hidden className="size-4" />
        </a>
      )}
    </li>
  );
}

/** The arcade cabinet: a scoreboard on top, then one card per achievement. */
async function ArcadeCabinet({ locale, variant }: { locale: Locale; variant: string }) {
  const t = await getTranslations("achievements");
  const labels = {
    statusUnlocked: t("statusUnlocked"),
    statusProgress: t("statusProgress"),
    statusLocked: t("statusLocked"),
    goal: t("goal"),
    loading: t("loading"),
    credential: t("credential"),
  };
  const unlocked = achievements.filter((a) => a.status === "unlocked");
  const score = unlocked.reduce((sum, a) => sum + a.xp, 0);
  const total = achievements.length;
  const tiers = (["bronze", "silver", "gold", "platinum"] as const).map((tier) => ({
    tier,
    earned: unlocked.filter((a) => rarity(a.xp) === tier).length,
    all: achievements.filter((a) => rarity(a.xp) === tier).length,
  }));
  const percent = Math.round((unlocked.length / total) * 100);

  const cabinet = (
    <div className="arcade" data-variant={variant}>
      {/* only the trophy-list look shows this summary */}
      <div className="arcade-summary" aria-hidden>
        <span className="arcade-ring" style={{ "--pct": percent } as CSSProperties}>
          <b>{percent}%</b>
        </span>
        <ul>
          {tiers.map((t) => (
            <li key={t.tier} data-rarity={t.tier}>
              <i className="arcade-medal" />
              <b>
                {t.earned}/{t.all}
              </b>
              <span>{t.tier}</span>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="arcade-hud"
        role="group"
        aria-label={t("legend", { unlocked: unlocked.length, total, score })}
      >
        <span className="font-pixel arcade-player" aria-hidden>
          {t("player")} · KEVIN
        </span>
        <span className="font-pixel" aria-hidden>
          {t("unlocked")}{" "}
          <b>
            {unlocked.length}/{total}
          </b>
        </span>
        <span className="font-pixel" aria-hidden>
          {t("score")} <b className="arcade-score">{String(score).padStart(6, "0")}</b>
        </span>
        <span className="arcade-bar" aria-hidden>
          {achievements.map((a) => (
            <i key={a.id} className={`is-${a.status}`} />
          ))}
        </span>
      </div>

      <ul className="arcade-grid">
        {achievements.map((item, i) => (
          <Card key={item.id} item={item} index={i} locale={locale} labels={labels} />
        ))}
      </ul>

      <a href="#contact" className="arcade-continue font-pixel">
        <span className="arcade-blink">{t("continue")}</span> {t("continueCta")}
        <ArrowUpRight aria-hidden className="size-5" />
      </a>
    </div>
  );

  if (variant !== "gameboy") return cabinet;
  // the handheld around the screen: bezel with power LED, brand, d-pad, A/B, start/select, speaker
  return (
    <div className="gb-body">
      <div className="gb-bezel">
        <span className="gb-led" aria-hidden>
          <i /> BATTERY
        </span>
        {cabinet}
      </div>
      <p className="gb-brand" aria-hidden>
        KEVIN <b>boy</b>
      </p>
      <div className="gb-controls" aria-hidden>
        <span className="gb-dpad">
          <i />
        </span>
        <span className="gb-ab">
          <i>B</i>
          <i>A</i>
        </span>
      </div>
      <div className="gb-bottom" aria-hidden>
        <span className="gb-pill">SELECT</span>
        <span className="gb-pill">START</span>
        <span className="gb-speaker">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      </div>
    </div>
  );
}

/** PROTOTYPE: every look side by side, behind a picker. */
export async function Achievements({ locale }: { locale: Locale }) {
  const items = achievements.map((a) => plain(a, locale));
  const views = [
    { id: "profile", label: "★ Perfil do jogador", node: <ProfileView locale={locale} /> },
    { id: "arcade", label: "Arcade", node: <ArcadeCabinet locale={locale} variant="arcade" /> },
    { id: "gameboy", label: "Game Boy", node: <ArcadeCabinet locale={locale} variant="gameboy" /> },
    {
      id: "trophies",
      label: "Troféus",
      node: <ArcadeCabinet locale={locale} variant="trophies" />,
    },
    {
      id: "holo",
      label: "Cartas holográficas",
      node: <ArcadeCabinet locale={locale} variant="holo" />,
    },
    { id: "shelf", label: "Estante 3D", node: <ShelfView locale={locale} /> },
    {
      id: "notify",
      label: "Notificações",
      node: <NotificationsView items={items} locale={locale} />,
    },
    { id: "map", label: "Mapa de fases", node: <MapView locale={locale} /> },
    { id: "tree", label: "Árvore de habilidades", node: <TreeView locale={locale} /> },
    { id: "sheet", label: "Ficha de personagem", node: <CharacterView locale={locale} /> },
    { id: "claw", label: "Máquina de garra", node: <ClawView items={items} locale={locale} /> },
    { id: "hiscore", label: "Kevin vs Kevin", node: <HighScoreView locale={locale} /> },
  ];
  return <AchievementsLab views={views} className={pixel.variable} />;
}

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pixels, type Palette } from "@/components/creative/pixel-art";
import {
  collectCoin,
  COINS,
  coinsSnapshot,
  emitAvatar,
  onFormProgress,
  readSkin,
  setSkin,
  SKINS,
  subscribeCoins,
  subscribeSkin,
  type CoinId,
  type Skin,
} from "@/components/shared/arcade-state";
import {
  earnAchievement,
  isLegend,
  subscribeUnlocked,
  unlockedSnapshot,
} from "@/components/shared/visitor-achievements-data";
import { cn } from "@/lib/utils";
import { LiveAvatar } from "./live-avatar";
import { PixelAvatar, PixelGuitar } from "./pixel-avatar";

/*
 * The arcade theme's interactive extras: hidden coins, the guitar and skins
 * they unlock, the boss guarding the contact form and the journey's world map.
 * Shared state lives in arcade-state.ts; styles are `px-*` in arcade.css.
 */

const useCoins = () => {
  const snapshot = useSyncExternalStore(subscribeCoins, coinsSnapshot, () => "");
  return new Set(snapshot ? snapshot.split(",") : []);
};

/** A coin hidden somewhere on the page; click it to collect. */
export function CoinSpot({ id, className }: { id: CoinId; className?: string }) {
  const t = useTranslations("arcade.coins");
  const got = useCoins();
  // server render and first paint show nothing, so a collected coin never flashes
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  if (!mounted || got.has(id)) return null;
  return (
    <button
      type="button"
      className={cn("px-coin", className)}
      aria-label={t("label")}
      onClick={() => {
        collectCoin(id);
        emitAvatar("happy", { jump: true });
      }}
    >
      <span aria-hidden />
    </button>
  );
}

/** "COINS 3/8" for the hero's HUD. */
export function CoinCounter() {
  const t = useTranslations("arcade.coins");
  const got = useCoins();
  return (
    <span>
      {t("hud")} <b>{`${got.size}/${COINS.length}`}</b>
    </span>
  );
}

/**
 * The coins' reward in the inventory: a blue superstrat and a wardrobe to
 * pick the avatar's skin. Rock comes with the guitar; legend needs every
 * trophy and shows as a locked silhouette until then. Locked, the whole slot
 * is a mystery with a hint.
 */
export function GuitarSlot() {
  const t = useTranslations("arcade.guitar");
  const ts = useTranslations("arcade.skins");
  const unlocked = useSyncExternalStore(subscribeUnlocked, unlockedSnapshot, () => "");
  const skin = useSyncExternalStore(subscribeSkin, readSkin, (): Skin => "hacker");
  const got = useCoins();
  const owned = unlocked.split(",").includes("collector");
  const legend = isLegend(unlocked);
  if (!owned)
    return (
      <div className="px-reward is-locked">
        <span className="px-reward-art" aria-hidden>
          ?
        </span>
        <div>
          <b>{t("lockedTitle")}</b>
          <p>{t("lockedHint", { got: got.size, total: COINS.length })}</p>
        </div>
      </div>
    );
  return (
    <div className="px-reward">
      <PixelGuitar className="px-reward-art" />
      <div>
        <b>{t("title")}</b>
        <p>{t("desc")}</p>
      </div>
      <div role="radiogroup" aria-label={ts("label")} className="px-wardrobe">
        {SKINS.map((id) => {
          const locked = id === "legend" && !legend;
          const on = skin === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={locked}
              className="px-skin"
              onClick={() => {
                if (on) return;
                setSkin(id);
                emitAvatar("happy", { jump: true });
              }}
            >
              <span className="px-live" data-skin={id} data-mood="idle">
                <span>
                  <PixelAvatar />
                </span>
              </span>
              <b>{locked ? "???" : ts(id)}</b>
              <small>{locked ? ts("locked") : on ? ts("equipped") : ts("equip")}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The Bug King: 16×14. */
const KING = [
  "....a..aa..a....",
  "....aaaaaaaa....",
  "..b.ffffffff.b..",
  "...bffffffffb...",
  "...fpkffffkpf...",
  "...ffffffffff...",
  "bb.fkpkpkpkpf.bb",
  "..bffffffffffb..",
  "...ffffffffff...",
  "bb.ffffffffff.bb",
  "..bffffffffffb..",
  "...ffffffffff...",
  "....ffffffff....",
  "..b..b....b..b..",
];
const KING_PALETTE: Palette = { a: "ti-a", b: "ti-b", f: "ti-f", p: "ti-p", k: "ti-k" };

/**
 * The boss guarding the contact form. Its health is the required fields still
 * empty or invalid (reported by the form, see reportForm); filling the last
 * one beats it and earns the "boss" trophy. Sending stays the visitor's call.
 */
export function BossFight() {
  const t = useTranslations("arcade.boss");
  const [progress, setProgress] = useState({ valid: 0, total: 3 });
  const [hit, setHit] = useState(0);
  const hp = progress.total - progress.valid;
  const beaten = hp === 0;

  const before = useRef(0);

  useEffect(
    () =>
      onFormProgress((next) => {
        if (next.valid > before.current) {
          setHit((n) => n + 1);
          emitAvatar(next.valid === next.total ? "happy" : "angry", { jump: true });
          if (next.valid === next.total) earnAchievement("boss");
        }
        before.current = next.valid;
        setProgress(next);
      }),
    [],
  );

  return (
    <div className={cn("px-boss", beaten && "is-beaten")} data-arcade-only>
      <svg
        key={hit}
        viewBox="0 0 16 14"
        shapeRendering="crispEdges"
        aria-hidden
        className={cn("px-king", hit > 0 && "is-hit")}
      >
        <Pixels rows={KING} palette={KING_PALETTE} />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="px-boss-name">{t("name")}</p>
        <span
          className="px-hp"
          role="meter"
          aria-label={t("hp")}
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={hp}
        >
          {Array.from({ length: progress.total }, (_, i) => (
            <i key={i} className={i < hp ? "is-full" : undefined} />
          ))}
        </span>
        <p className="px-boss-say" aria-live="polite">
          {beaten ? t("beaten") : progress.valid === 0 ? t("intro") : t("hurt", { hp })}
        </p>
      </div>
    </div>
  );
}

export type MapLevel = {
  id: string;
  type: "work" | "study" | "event";
  title: string;
  org: string;
  period: string;
  kind: string;
  ongoing: boolean;
  highlights: string[];
};

export type MapLabels = {
  current: string;
  level: string;
  progress: string;
  hint: string;
  goalTitle: string;
  goalText: string;
  goalCta: string;
  goalLabel: string;
};

/* 7×7 glyphs on the level tiles: a book for study, a briefcase for work, a star for events, a flag once visited */
const GLYPHS: Record<MapLevel["type"] | "flag" | "goal", string[]> = {
  study: [".......", "bbb.bbb", "bab.bab", "bab.bab", "bab.bab", "bbbbbbb", "......."],
  work: ["..bbb..", "..b.b..", "bbbbbbb", "baaaaab", "bbbabbb", "baaaaab", "bbbbbbb"],
  event: ["...a...", "...a...", "aaaaaaa", ".aaaaa.", "..aaa..", ".aa.aa.", "a.....a"],
  flag: ["baaa...", "baaaaa.", "baaa...", "b......", "b......", "b......", "bb....."],
  goal: ["a.a.a.a", "aaaaaaa", "a.aaa.a", "aaaaaaa", "aa...aa", "aa...aa", "aa...aa"],
};
const GLYPH_PALETTE: Palette = { a: "ti-a", b: "ti-b" };

const MAP_GAP = 150;
const MAP_H = 280;
const nodeX = (i: number) => 80 + i * MAP_GAP;
/** The road's height at stop `i`, in px: a gentle wave. */
const nodeY = (i: number) => 140 + Math.round(Math.sin(i * 1.1) * 52);

/** The road through every stop, as smooth S-curves. */
function road(count: number) {
  let d = `M${nodeX(0) - 60} ${nodeY(0)} L${nodeX(0)} ${nodeY(0)}`;
  for (let i = 1; i < count; i++) {
    const mid = (nodeX(i - 1) + nodeX(i)) / 2;
    d += ` C${mid} ${nodeY(i - 1)} ${mid} ${nodeY(i)} ${nodeX(i)} ${nodeY(i)}`;
  }
  return d;
}

/** Hills, trees, two rivers and clouds, laid out from the map's width so every journey gets scenery. */
function Terrain({ width, stops }: { width: number; stops: number }) {
  const trees: { x: number; y: number }[] = [];
  for (let i = 0; i < stops - 1; i++) {
    const x = (nodeX(i) + nodeX(i + 1)) / 2;
    const y = (nodeY(i) + nodeY(i + 1)) / 2;
    trees.push({ x: x - 22, y: y + (i % 2 ? 48 : -70) }, { x: x + 14, y: y + (i % 2 ? 62 : -58) });
  }
  const rivers = [1, 4].filter((i) => i < stops - 1).map((i) => (nodeX(i) + nodeX(i + 1)) / 2);
  return (
    <svg
      className="px-map-land"
      width={width}
      height={MAP_H}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {Array.from({ length: Math.ceil(width / 140) }, (_, i) => (
        <g key={i} className="px-map-hill">
          <rect x={i * 140} y={MAP_H - 36 - (i % 3) * 10} width={96} height={60} />
          <rect x={i * 140 + 12} y={MAP_H - 48 - (i % 3) * 10} width={72} height={12} />
          <rect x={i * 140 + 28} y={MAP_H - 58 - (i % 3) * 10} width={40} height={10} />
        </g>
      ))}
      {rivers.map((x) => (
        <g key={x}>
          <path
            className="px-map-water"
            d={`M${x - 14} 0 h28 l-10 ${MAP_H / 2} l14 ${MAP_H / 2} h-28 l-14 -${MAP_H / 2}z`}
          />
          <path
            className="px-map-wave"
            d={`M${x - 6} 30 h8 M${x + 2} 90 h8 M${x - 8} 190 h8 M${x + 4} 240 h8`}
          />
        </g>
      ))}
      {trees.map(({ x, y }) => (
        <g key={`${x}-${y}`} className="px-map-tree">
          <rect className="px-map-trunk" x={x + 6} y={y + 18} width={6} height={8} />
          <rect x={x + 3} y={y} width={12} height={6} />
          <rect x={x} y={y + 6} width={18} height={12} />
        </g>
      ))}
    </svg>
  );
}

/**
 * The journey as a Mario-style world map: stops along a road over hills and
 * rivers, the hacker walking from one to the next, and a castle at the end,
 * the next level (the internship). Arrow keys walk along the road. Opening
 * every stop earns the "cartographer" trophy.
 */
export function WorldMap({ levels, labels }: { levels: MapLevel[]; labels: MapLabels }) {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(() => new Set([0]));
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [walking, setWalking] = useState(false);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const walk = useRef<ReturnType<typeof setTimeout>>(undefined);
  const goal = levels.length; // the castle is one stop past the last level
  const stops = levels.length + 1;
  const width = nodeX(goal) + 110;
  const level = levels[active];

  useEffect(() => () => clearTimeout(walk.current), []);

  function go(index: number, focus = false) {
    if (index < 0 || index > goal || index === active) return;
    setFacing(index < active ? "left" : "right");
    setActive(index);
    setWalking(true);
    clearTimeout(walk.current);
    walk.current = setTimeout(() => setWalking(false), 600);
    const button = buttons.current[index];
    if (focus) button?.focus({ preventScroll: true });
    button?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    if (index === goal) return emitAvatar("wow", { ms: 1400, jump: true });
    emitAvatar("happy", { jump: true });
    const next = new Set(seen).add(index);
    setSeen(next);
    if (next.size === levels.length) earnAchievement("cartographer");
  }

  return (
    <div>
      <div
        className="px-map"
        role="group"
        aria-label={labels.level}
        onKeyDown={(event) => {
          const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
          const jump = { Home: 0, End: goal }[event.key];
          if (step === undefined && jump === undefined) return;
          event.preventDefault();
          go(jump ?? active + (step ?? 0), true);
        }}
      >
        <div className="px-map-track" style={{ width, height: MAP_H }}>
          <span className="px-map-clouds" aria-hidden />
          <Terrain width={width} stops={stops} />
          <svg className="px-map-trail" width={width} height={MAP_H} aria-hidden>
            <path className="px-map-road" d={road(stops)} />
            <path className="px-map-dash" d={road(stops)} />
          </svg>
          {levels.map((item, i) => (
            <button
              key={item.id}
              ref={(node) => {
                buttons.current[i] = node;
              }}
              type="button"
              tabIndex={i === active ? 0 : -1}
              className={cn(
                "px-level",
                i === active && "is-active",
                seen.has(i) && "is-seen",
                item.ongoing && "is-ongoing",
              )}
              style={{ left: nodeX(i) - 28, top: nodeY(i) - 28 }}
              onClick={() => go(i)}
              aria-pressed={i === active}
              aria-label={`${labels.level} 1-${i + 1}: ${item.title}`}
            >
              <svg
                viewBox="0 0 7 7"
                shapeRendering="crispEdges"
                aria-hidden
                className="px-level-glyph"
              >
                <Pixels
                  rows={GLYPHS[seen.has(i) && i !== active ? "flag" : item.type]}
                  palette={GLYPH_PALETTE}
                />
              </svg>
              <span aria-hidden>{`1-${i + 1}`}</span>
            </button>
          ))}
          <button
            ref={(node) => {
              buttons.current[goal] = node;
            }}
            type="button"
            tabIndex={active === goal ? 0 : -1}
            className={cn("px-level px-castle", active === goal && "is-active")}
            style={{ left: nodeX(goal) - 36, top: nodeY(goal) - 66 }}
            onClick={() => go(goal)}
            aria-pressed={active === goal}
            aria-label={labels.goalLabel}
          >
            <svg
              viewBox="0 0 7 7"
              shapeRendering="crispEdges"
              aria-hidden
              className="px-castle-art"
            >
              <Pixels rows={GLYPHS.goal} palette={GLYPH_PALETTE} />
            </svg>
            <span className="px-castle-flag" aria-hidden />
          </button>
          <span
            className={cn("px-map-hero", facing === "left" && "is-left")}
            style={{ left: nodeX(active) - 24, top: nodeY(active) - (active === goal ? 123 : 97) }}
            aria-hidden
          >
            <LiveAvatar walking={walking} />
          </span>
        </div>
      </div>
      <p className="px-map-hint">
        <span>{labels.hint}</span>
        <span>
          {labels.progress} <b>{`${seen.size}/${levels.length}`}</b>
        </span>
      </p>
      <div className="px-window px-level-card" aria-live="polite">
        {level ? (
          <>
            <p className="px-panel-note">
              {`${labels.level} 1-${active + 1}`} · {level.kind}
              {level.ongoing && <b className="px-level-now"> · {labels.current}</b>}
            </p>
            <h3 className="font-display text-3xl sm:text-5xl">{level.title}</h3>
            <p className="text-lg text-muted">
              {level.org} · {level.period}
            </p>
            {level.highlights.length > 0 && (
              <ul className="px-list mt-3">
                {level.highlights.map((text) => (
                  <li key={text}>
                    <span aria-hidden className="text-accent">
                      ▶
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <p className="px-panel-note">{labels.goalLabel}</p>
            <h3 className="font-display text-3xl sm:text-5xl">{labels.goalTitle}</h3>
            <p className="mt-2 max-w-2xl text-lg text-muted">{labels.goalText}</p>
            <a href="#contact" className="px-start mt-5">
              ▶ {labels.goalCta}
            </a>
          </>
        )}
      </div>
    </div>
  );
}

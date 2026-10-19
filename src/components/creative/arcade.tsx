import { getImageProps } from "next/image";
import { getTranslations } from "next-intl/server";
import { gallery, pick, profile, projects, skills, skillTree } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { hobbyIcons } from "./about-teaser";
import {
  BossFight,
  CoinCounter,
  CoinSpot,
  GuitarSlot,
  WorldMap,
  type MapLevel,
} from "./arcade-extras";
import { AvatarDirector, LiveAvatar, NpcPortrait } from "./live-avatar";
import { Pixels, type Palette } from "./pixel-art";
import { skillMarks } from "./skill-marks";
import { TechLogo } from "./tech-logo";
import { TerminalInvaders } from "./terminal-invaders";
import { TerminalSnake } from "./terminal-snake";

/*
 * The sections that only exist under the secret arcade theme. They are in the
 * HTML for everyone but `[data-arcade-only]` keeps them display:none until
 * `data-arcade` is on <html> (creative.css), so they never flash, their images
 * never load for normal visitors, and switching the theme needs no re-render.
 * Every fact comes from src/content; only the game framing is new. Styles live
 * in styles/arcade.css (`px-*`).
 */

/** A photo shrunk to a few dozen pixels by the image optimizer; CSS scales it up crisp. */
function tinySrc(src: string, width: number, height: number, target: number) {
  return getImageProps({
    src,
    alt: "",
    width: target,
    height: Math.round((target * height) / width),
  }).props.src;
}

/**
 * The 4-colour palettes the pixel photos are snapped to: the light side's
 * Game Boy greens and a posterized neon for the dark side. These are filter
 * tables (0–1 per channel), the only colours this file holds; they mirror the
 * arcade tokens in tokens.css.
 */
function PixelFilters() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="px-gb" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0.11 0.45 0.82 1" />
          <feFuncG type="discrete" tableValues="0.11 0.36 0.74 0.98" />
          <feFuncB type="discrete" tableValues="0.24 0.5 0.72 0.94" />
        </feComponentTransfer>
      </filter>
      <filter id="px-neon" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="1.6" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0.04 0.36 0.72 1" />
          <feFuncG type="discrete" tableValues="0.04 0.3 0.62 0.94" />
          <feFuncB type="discrete" tableValues="0.12 0.4 0.75 1" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

/*
 * The hero scene is drawn as one-colour SVG shapes used as CSS masks, so each
 * layer takes its colour from the theme (night city, or Game Boy day) and
 * scrolls sideways at its own speed for a parallax side-scroller.
 */
const svgMask = (width: number, height: number, shapes: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" shape-rendering="crispEdges">${shapes}</svg>`,
  )}")`;

/** A deterministic random sequence, so the skyline is the same on every render. */
function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * A tileable row of pixel buildings, plus masks for what lights up on them:
 * steady windows, windows that switch on and off, and the antennas' beacons.
 */
function skyline(seed: number, width: number, height: number, min: number, max: number) {
  const r = seeded(seed);
  let buildings = "";
  let windows = "";
  let flicker = "";
  let beacons = "";
  for (let x = 0; x < width;) {
    const w = 32 + Math.floor(r() * 5) * 8;
    const h = min + Math.floor((r() * (max - min)) / 8) * 8;
    buildings += `<rect x="${x}" y="${height - h}" width="${w}" height="${h}"/>`;
    if (r() < 0.3) {
      buildings += `<rect x="${x + w / 2 - 2}" y="${height - h - 16}" width="4" height="16"/>`;
      beacons += `<rect x="${x + w / 2 - 2}" y="${height - h - 20}" width="4" height="4"/>`;
    } else if (r() < 0.4) {
      // a water tank on the roof
      buildings += `<rect x="${x + 6}" y="${height - h - 12}" width="12" height="8"/><rect x="${x + 8}" y="${height - h - 4}" width="2" height="4"/><rect x="${x + 14}" y="${height - h - 4}" width="2" height="4"/>`;
    }
    for (let y = height - h + 10; y < height - 12; y += 14)
      for (let wx = x + 6; wx < x + w - 8; wx += 10) {
        const roll = r();
        if (roll < 0.28) windows += `<rect x="${wx}" y="${y}" width="4" height="6"/>`;
        else if (roll < 0.36) flicker += `<rect x="${wx}" y="${y}" width="4" height="6"/>`;
      }
    x += w + (r() < 0.35 ? 8 : 0);
  }
  return {
    buildings: svgMask(width, height, buildings),
    windows: svgMask(width, height, windows),
    flicker: svgMask(width, height, flicker),
    beacons: svgMask(width, height, beacons),
  };
}

/** Rects for every pixel of a circle `r` pixels wide, scaled by `px`. */
function pixelCircle(radius: number, px: number) {
  let rects = "";
  for (let y = -radius; y < radius; y++) {
    const half = Math.round(Math.sqrt(radius * radius - (y + 0.5) ** 2));
    rects += `<rect x="${(radius - half) * px}" y="${(y + radius) * px}" width="${half * 2 * px}" height="${px}"/>`;
  }
  return svgMask(radius * 2 * px, radius * 2 * px, rects);
}

const CLOUD = (x: number, y: number) =>
  `<rect x="${x + 16}" y="${y}" width="32" height="8"/><rect x="${x + 8}" y="${y + 8}" width="64" height="8"/><rect x="${x}" y="${y + 16}" width="88" height="8"/>`;

const FAR = skyline(7, 640, 300, 120, 280);
const NEAR = skyline(42, 560, 220, 64, 200);
const CLOUDS = svgMask(720, 120, CLOUD(20, 10) + CLOUD(300, 60) + CLOUD(540, 24));
const MOON = pixelCircle(10, 6);

/* an elevated highway between the two rows of buildings: railing, deck and pillars */
const VIADUCT = svgMask(
  320,
  100,
  `<rect x="0" y="12" width="320" height="2"/>${Array.from(
    { length: 20 },
    (_, i) => `<rect x="${i * 16}" y="12" width="2" height="8"/>`,
  ).join(
    "",
  )}<rect x="0" y="20" width="320" height="8"/><rect x="56" y="28" width="16" height="72"/><rect x="216" y="28" width="16" height="72"/>`,
);

const PALETTE: Palette = {
  R: "pc-body",
  w: "pc-glass",
  k: "pc-ink",
  y: "pc-light",
  r: "pc-tail",
  W: "pc-wing",
  B: "pc-banner",
};
const CAR = [
  "....RRRRRRR.....",
  "...RwwwRwwwR....",
  ".RRRRRRRRRRRRRR.",
  "rRRRRRRRRRRRRRRy",
  "RRkkRRRRRRRkkRRR",
  "..kk.......kk...",
];
const VAN = [
  ".RRRRRRRRRRR....",
  ".RwwRwwRwwRww...",
  ".RwwRwwRwwRwwR..",
  "rRRRRRRRRRRRRRRy",
  "RRkkRRRRRRRRkkRR",
  "..kk........kk..",
];
const PLANE = [
  "..W.................",
  "..WW.......WW.......",
  "RRRRRRRRRRRRRRRRRR..",
  "RwRwRwRwRwRwRwRwRRRk",
  ".RRRRRRRRRRRRRRRRRR.",
  "......WWWW..........",
];
const BIRD_UP = ["k.....k", ".k...k.", "..kkk.."];
const BIRD_DOWN = [".......", "..kkk..", ".k...k."];

function Sprite({ rows, className }: { rows: string[]; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${rows[0]!.length} ${rows.length}`}
      shapeRendering="crispEdges"
      className={className}
    >
      <Pixels rows={rows} palette={PALETTE} />
    </svg>
  );
}

/** The city's traffic and sky life: cars on the highway, a plane with a banner, birds. */
function CityLife() {
  return (
    <>
      <span className="px-traffic">
        <Sprite rows={CAR} className="px-car pc-a" />
        <Sprite rows={VAN} className="px-car pc-b" />
        <Sprite rows={CAR} className="px-car pc-c is-back" />
        <Sprite rows={CAR} className="px-car pc-d" />
        <Sprite rows={VAN} className="px-car pc-e is-back" />
      </span>
      <span className="px-plane">
        <span className="px-banner">KEVINHS.DEV ★</span>
        <span className="px-rope" />
        <Sprite rows={PLANE} />
      </span>
      <span className="px-birds">
        {[0, 1, 2].map((i) => (
          <svg key={i} viewBox="0 0 7 3" shapeRendering="crispEdges" className="px-bird">
            <g className="px-bird-up">
              <Pixels rows={BIRD_UP} palette={PALETTE} />
            </g>
            <g className="px-bird-down">
              <Pixels rows={BIRD_DOWN} palette={PALETTE} />
            </g>
          </svg>
        ))}
      </span>
      <span className="px-shoot" />
    </>
  );
}

/** The hero's backdrop: a night city side-scroller (dark) or a sunny 8-bit day (light). */
export function ArcadeScene() {
  const mask = (image: string) => ({ maskImage: image, WebkitMaskImage: image });
  return (
    <div data-arcade-only aria-hidden className="px-scene">
      <span className="px-stars" />
      <span className="px-moon" style={mask(MOON)} />
      <span className="px-layer px-clouds" style={mask(CLOUDS)} />
      <span className="px-layer px-far" style={mask(FAR.buildings)} />
      <span className="px-layer px-far px-lit" style={mask(FAR.windows)} />
      <span className="px-layer px-far px-lit px-flicker" style={mask(FAR.flicker)} />
      <span className="px-layer px-far px-beacon" style={mask(FAR.beacons)} />
      <span className="px-layer px-viaduct" style={mask(VIADUCT)} />
      <CityLife />
      <span className="px-layer px-near" style={mask(NEAR.buildings)} />
      <span className="px-layer px-near px-lit" style={mask(NEAR.windows)} />
      <span className="px-layer px-near px-lit px-flicker" style={mask(NEAR.flicker)} />
      <span className="px-layer px-near px-beacon" style={mask(NEAR.beacons)} />
    </div>
  );
}

/**
 * The hacker walking along the hero's metrics strip, as if it were a platform,
 * under a coin floating like a "?" block. Also mounts the avatars' reactions.
 */
export function ArcadeWalker() {
  return (
    <>
      <span data-arcade-only aria-hidden className="px-walker">
        <LiveAvatar walking />
      </span>
      <span data-arcade-only className="px-hero-coin">
        <CoinSpot id="hero" />
      </span>
      <AvatarDirector />
    </>
  );
}

/** The coin-op HUD across the top of the hero. */
export async function ArcadeHud() {
  const t = await getTranslations("arcade.hud");
  return (
    <p data-arcade-only aria-hidden className="px-hud">
      <span>
        1UP <b>{profile.name.split(" ")[0]}</b>
      </span>
      <span className="px-blink">{t("coin")}</span>
      <CoinCounter />
      <span>
        {t("credit")} <b>01</b>
      </span>
    </p>
  );
}

function SectionTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="font-display mb-12 text-6xl sm:mb-16 sm:text-8xl">
      {children}
    </h2>
  );
}

/** Skills as an RPG talent tree: one branch per area, each node marked by its tier. */
async function SkillTree({ locale }: { locale: Locale }) {
  const t = await getTranslations("arcade.character.tree");
  const status = { daily: "max", experienced: "unlocked", learning: "training" } as const;
  return (
    <div className="px-tree-wrap">
      <h3 className="px-subtitle">{t("title")}</h3>
      <ul className="px-legend" aria-label={t("legend")}>
        {Object.values(status).map((s) => (
          <li key={s} className={`is-${s}`}>
            <i aria-hidden />
            {t(s)}
          </li>
        ))}
      </ul>
      <div className="px-tree">
        {skillTree.map((branch) => (
          <section key={branch.id} className="px-branch" aria-label={pick(branch.label, locale)}>
            <h4>{pick(branch.label, locale)}</h4>
            <ol>
              {branch.nodes.map((node) => {
                const mark = skillMarks[node.key];
                const s = node.tier in status ? status[node.tier as keyof typeof status] : null;
                return (
                  <li key={node.key} className={s ? `is-${s}` : undefined}>
                    <span className="px-node" aria-hidden>
                      {mark && "logo" in mark ? (
                        <TechLogo logo={mark.logo} dark={mark.dark} className="size-6" />
                      ) : mark ? (
                        <mark.icon className="size-5" />
                      ) : null}
                    </span>
                    <span className="px-node-name">
                      {pick(node.item, locale)}
                      {s && <small>{t(s)}</small>}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

/** Kevin as an RPG character sheet: sprite, class, skill tree, inventory, languages, side quests. */
export async function CharacterSheet({ locale }: { locale: Locale }) {
  const t = await getTranslations("arcade.character");
  const tiers = await getTranslations("skills.tiers");
  const key = (item: (typeof skills)[number]["items"][number]) =>
    typeof item === "string" ? item : item.en;
  // the inventory holds the tools the skill tree doesn't already show
  const inTree = new Set(skillTree.flatMap((branch) => branch.nodes.map((node) => node.key)));
  const experienced = (skills.find((g) => g.tier === "experienced")?.items ?? []).filter(
    (item) => !inTree.has(key(item)),
  );

  return (
    <section
      id="character"
      data-arcade-only
      aria-labelledby="character-title"
      className="scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28"
    >
      <PixelFilters />
      <SectionTitle id="character-title">{t("title")}</SectionTitle>
      <div className="px-window">
        <CoinSpot id="character" className="px-coin-corner" />
        <div className="px-profile">
          <NpcPortrait label={t("talkTo")} />
          <div className="flex min-w-0 flex-col gap-5">
            <p className="font-display text-4xl sm:text-6xl">{profile.name}</p>
            <dl className="px-stats">
              <div>
                <dt>{t("class")}</dt>
                <dd>{pick(profile.role, locale)}</dd>
              </div>
              <div>
                <dt>{t("guild")}</dt>
                <dd>{profile.education.school}</dd>
              </div>
              <div>
                <dt>{t("base")}</dt>
                <dd>{pick(profile.location, locale)}</dd>
              </div>
              <div>
                <dt>{t("quest")}</dt>
                <dd className="text-accent">{pick(profile.status, locale)}</dd>
              </div>
              <div>
                <dt>{t("origin")}</dt>
                <dd>
                  {t("originText", {
                    age: profile.startedCoding.age,
                    how: pick(profile.startedCoding.how, locale),
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <SkillTree locale={locale} />

        <div className="px-panels">
          <div className="px-panel">
            <h3>{t("inventory")}</h3>
            <p className="px-panel-note">{tiers("experienced")}</p>
            <ul className="px-slots">
              {experienced.map((item) => {
                const mark = skillMarks[key(item)];
                return (
                  <li key={key(item)}>
                    {mark && "logo" in mark ? (
                      <TechLogo logo={mark.logo} dark={mark.dark} className="size-6" />
                    ) : null}
                    <span>{pick(item, locale)}</span>
                  </li>
                );
              })}
            </ul>
            <GuitarSlot />
          </div>

          <div className="px-panel">
            <h3>{t("languages")}</h3>
            <ul className="px-list">
              {profile.languages.map((language) => (
                <li key={language.code}>
                  <b>{pick(language.name, locale)}</b>
                  <span>{pick(language.level, locale)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-panel">
            <h3>{t("sideQuests")}</h3>
            <ul className="px-list">
              {profile.hobbies.map((hobby) => {
                const Icon = hobbyIcons[hobby.icon];
                return (
                  <li key={hobby.icon}>
                    <Icon aria-hidden className="size-4 shrink-0 text-accent" />
                    <span>{pick(hobby.label, locale)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The arcade room, in the middle of the page: Snake in a terminal. */
export async function ArcadeRoom() {
  const t = await getTranslations("arcade.games");
  return (
    <section
      id="arcade-room"
      data-arcade-only
      aria-labelledby="arcade-room-title"
      className="scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28"
    >
      <SectionTitle id="arcade-room-title">{t("title")}</SectionTitle>
      <p className="-mt-6 mb-10 max-w-xl text-lg text-muted sm:-mt-10">{t("note")}</p>
      <div className="px-cabinets">
        <div className="px-terminal">
          <CoinSpot id="arcade" className="px-coin-corner" />
          <TerminalSnake />
        </div>
        <div className="px-terminal">
          <TerminalInvaders />
        </div>
      </div>
    </section>
  );
}

const SAVE_POINTS = [
  "malta",
  "notebook",
  "adesivos",
  "gdg-cloud-sp",
  "soujava-oracle",
  "claude-oracle",
  "guitarra-luz",
  "volei",
];

/** Photos as 8-bit save points; hovering (or tapping) one "loads" it in full resolution. */
export async function SavePoints({ locale }: { locale: Locale }) {
  const t = await getTranslations("arcade.saves");
  const photos = SAVE_POINTS.flatMap((id) => gallery.filter((photo) => photo.id === id));
  return (
    <section
      id="savepoints"
      data-arcade-only
      aria-labelledby="savepoints-title"
      className="scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28"
    >
      <SectionTitle id="savepoints-title">{t("title")}</SectionTitle>
      <p className="-mt-6 mb-10 max-w-xl text-lg text-muted sm:-mt-10">{t("note")}</p>
      <CoinSpot id="saves" className="px-coin-inline" />
      <ul className="px-saves">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            {/* focusable so a tap (or Tab) reveals it like a hover does */}
            <figure className="px-shot" tabIndex={0}>
              <span className="px-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={pick(photo.alt, locale)}
                  loading="lazy"
                  style={{ objectPosition: photo.focus }}
                />
                {/* coarsest on top: it is the first to go */}
                {[48, 16].map((size) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={size}
                    src={tinySrc(photo.src, photo.width, photo.height, size)}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className={`px-img px-step-${size}`}
                    style={{ objectPosition: photo.focus }}
                  />
                ))}
              </span>
              <figcaption>
                <b>{t("slot", { n: String(index + 1).padStart(2, "0") })}</b>
                {pick(photo.caption, locale)}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The projects as a level select: one cartridge per project. */
export async function LevelSelect({ locale }: { locale: Locale }) {
  const t = await getTranslations("arcade.levels");
  const status = await getTranslations("projects.status");
  return (
    <div data-arcade-only className="relative">
      <CoinSpot id="projects" className="px-coin-corner" />
      <p className="mb-8 max-w-xl pr-10 text-lg text-muted">{t("note")}</p>
      <ul className="px-carts">
        {projects.map((project, index) => {
          const href = project.hasCaseStudy ? `/projects/${project.slug}` : project.links?.repo;
          return (
            <li key={project.slug} className="px-cart">
              <p className="px-cart-label">{t("world", { n: index + 1 })}</p>
              <h3 className="font-display text-3xl">{project.title}</h3>
              <p className="text-muted">{pick(project.tagline, locale)}</p>
              <p className="px-cart-meta">
                <span>{status(project.status)}</span>
                <span>{project.year}</span>
              </p>
              <ul className="px-powerups" aria-label={t("powerups")}>
                {project.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
              {href &&
                (href.startsWith("/") ? (
                  <Link href={href} className="px-start px-cart-play">
                    ▶ {t("play")}
                  </Link>
                ) : (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-start px-cart-play"
                  >
                    ▶ {t("code")}
                  </a>
                ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The journey as a world map (arcade-extras.tsx). */
export async function JourneyMap({ levels }: { levels: MapLevel[] }) {
  const t = await getTranslations("arcade.map");
  return (
    <div data-arcade-only className="relative">
      <CoinSpot id="map" className="px-coin-corner" />
      <p className="mb-8 max-w-xl pr-10 text-lg text-muted">{t("note")}</p>
      <WorldMap
        levels={levels}
        labels={{
          current: t("current"),
          level: t("level"),
          progress: t("progress"),
          hint: t("hint"),
          goalTitle: t("goalTitle"),
          goalText: t("goalText"),
          goalCta: t("goalCta"),
          goalLabel: t("goalLabel"),
        }}
      />
    </div>
  );
}

/** The boss panel above the contact form, with its coin. */
export function ContactBoss() {
  return (
    <div data-arcade-only className="relative">
      <CoinSpot id="boss" className="px-coin-corner" />
      <BossFight />
    </div>
  );
}

/** End credits rolling above the footer, like the end of a game. */
export async function Credits() {
  const t = await getTranslations("arcade.credits");
  const roles = t.raw("roles") as { role: string; name: string }[];
  return (
    <section data-arcade-only aria-labelledby="credits-title" className="px-credits">
      <CoinSpot id="credits" className="px-coin-corner" />
      <h2 id="credits-title" className="sr-only">
        {t("title")}
      </h2>
      <div className="px-credits-roll">
        <p className="font-display text-5xl text-accent">{t("title")}</p>
        <dl>
          {roles.map(({ role, name }) => (
            <div key={role}>
              <dt>{role}</dt>
              <dd>{name === "{name}" ? profile.fullName : name}</dd>
            </div>
          ))}
        </dl>
        <p className="font-display text-4xl">{t("thanks")}</p>
        <a href="#main" className="px-start">
          ▶ {t("top")}
        </a>
      </div>
    </section>
  );
}

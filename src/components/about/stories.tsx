import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Fragment } from "react";
import { ABOUT_PHOTOS, EVENT_META } from "@/components/about/data";
import { Desk } from "@/components/about/desk";
import { StripReveal } from "@/components/about/strip-reveal";
import { ShaderStage } from "@/components/stage/shader-stage";
import { about, gallery, pick, profile } from "@/content";
import type { Locale } from "@/i18n/routing";

/*
 * The top half of About: Leclerc's opening and grid, then Lando's sideways story strip. Which
 * photo goes where is chosen in data.ts (ABOUT_PHOTOS).
 */

type Props = { locale: Locale };

export function photo(id: string) {
  const p = gallery.find((g) => g.id === id);
  if (!p) throw new Error(`about: unknown photo "${id}"`);
  return p;
}

/** A gallery photo with its own alt text, size and focus point. */
function Shot({ id, locale, sizes }: { id: string; locale: Locale; sizes: string }) {
  const p = photo(id);
  return (
    <Image
      src={p.src}
      alt={pick(p.alt, locale)}
      width={p.width}
      height={p.height}
      sizes={sizes}
      style={{ objectPosition: p.focus }}
    />
  );
}

/** A label with a dot and a rule that draws itself. */
export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="ax-kicker">
      <span className="ax-kicker-dot" aria-hidden="true" />
      {children}
    </p>
  );
}

/** The story, left to right: three chapters, then what he does off the screen. */
const { story } = ABOUT_PHOTOS;
const STRIP = [
  { kind: "chapter", n: 0, text: "ch1", photos: story.start },
  { kind: "chapter", n: 1, text: "ch2", photos: story.today },
  { kind: "chapter", n: 2, text: "ch3", photos: story.next },
  { kind: "off", key: "malta", photos: story.malta },
] as const;

/** Hobbies: a line each (from the matching theme), then every photo as a print on a desk. */
const HOBBIES = [
  { key: "music", theme: "music" },
  { key: "sport", theme: "free-time" },
] as const;
const themeText = (id: string, locale: Locale) =>
  pick(about.themes.find((x) => x.id === id)!.text[0]!, locale);
/** Where each print lies, in order: x and y as a share of the room left on the desk, r tilt. */
const SPOTS = [
  { x: 0, y: 0.06, r: -7 },
  { x: 0.2, y: 0.95, r: 5 },
  { x: 0.4, y: 0, r: -3 },
  { x: 0.6, y: 0.9, r: 6 },
  { x: 0.8, y: 0.08, r: -5 },
  { x: 1, y: 0.85, r: 4 },
];

/**
 * The opening is his name across the whole screen with the portrait in front; on scroll the
 * words part and the portrait opens to the full screen. A short intro with two offset photos, a
 * statement with a photo floating through it, and the story on a strip that runs sideways.
 */
export async function AboutStory({ locale }: Props) {
  const t = await getTranslations("about");
  const statement = t("statementE").split(" ");
  const items = STRIP.reduce((n, g) => n + g.photos.length + 1, 0);
  const [storyA, ...storyB] = t("story").split(" ");
  return (
    <div className="ax-light">
      <section aria-labelledby="about-title" className="ax-d-hero">
        <div className="ax-d-stage">
          {/* after Leclerc: the moving "fluxo" in an inset panel with a notch for the logo and one
              for the dock, the name across it in white; on scroll the panel breaks into slanted
              bands that slide away, taking the name with them */}
          <div className="ax-d-panel">
            <ShaderStage kind="fluxo" className="ax-d-bands dark">
              <h1 id="about-title" className="ax-d-name">
                <span className="ax-d-hello">{t("heroHello")}</span>
                <span className="ax-d-full">
                  <span className="sr-only">{profile.name}</span>
                  {/* letter by letter: they rise in on load and fly off in a cascade on scroll */}
                  <span aria-hidden="true">
                    {[...profile.name].map((ch, i) => (
                      <span
                        key={i}
                        className="ax-d-ch"
                        style={
                          { "--c": i, "--m": i - profile.name.length / 2 } as React.CSSProperties
                        }
                      >
                        {ch === " " ? " " : ch}
                      </span>
                    ))}
                  </span>
                </span>
              </h1>
              <span className="ax-d-cue">{t("scroll")}</span>
            </ShaderStage>
          </div>
        </div>
      </section>

      <section aria-label={t("title")} className="ax-d-intro">
        <Kicker>{t("title")}</Kicker>
        <p className="ax-d-lede">{pick(about.lede, locale)}</p>
        <div className="ax-d-pair">
          {ABOUT_PHOTOS.intro.map((id) => (
            <figure key={id} className="ax-d-pair-fig">
              <Shot id={id} locale={locale} sizes="(min-width: 768px) 22rem, 45vw" />
            </figure>
          ))}
        </div>
      </section>

      <section aria-label={t("title")} className="ax-st">
        <p className="ax-st-text">
          {statement.map((w, i) => (
            <Fragment key={i}>
              <span className={w.includes("*") ? "ax-st-soft" : undefined}>
                {w.replaceAll("*", "")}
              </span>{" "}
            </Fragment>
          ))}
        </p>
        <figure className="ax-st-float" aria-hidden="true">
          <Shot id={ABOUT_PHOTOS.statement} locale={locale} sizes="16rem" />
        </figure>
      </section>

      <section
        id="story"
        aria-labelledby="story-title"
        className="ax-s"
        style={{ "--len": items } as React.CSSProperties}
      >
        <div className="ax-s-pin">
          <div className="ax-s-track">
            <h2 id="story-title" className="ax-s-title">
              <span>{storyA}</span>
              <span className="ax-serif">{storyB.join(" ")}</span>
            </h2>
            {STRIP.map((g, gi) => (
              <div key={gi} className="ax-s-group">
                <div className="ax-s-head">
                  <span className="ax-s-num" aria-hidden="true">
                    0{gi + 1}
                  </span>
                  <Kicker>
                    {g.kind === "chapter" ? `${t("chapter")} 0${g.n + 1}` : t("photos")}
                  </Kicker>
                  <h3 className="ax-s-h3">
                    {g.kind === "chapter" ? pick(about.chapters[g.n]!.label, locale) : t(g.key)}
                  </h3>
                  <p className="ax-s-text">
                    {g.kind === "chapter" ? t(g.text) : t(`${g.key}Text`)}
                  </p>
                </div>
                {g.photos.map((id, k) => (
                  <figure key={id} className="ax-s-fig" data-k={k % 3}>
                    <div
                      className="ax-s-img"
                      style={{ "--ar": photo(id).width / photo(id).height } as React.CSSProperties}
                    >
                      <Shot id={id} locale={locale} sizes="(min-width: 768px) 28rem, 70vw" />
                    </div>
                    <figcaption className="ax-s-cap">
                      <span className="ax-s-cap-n" aria-hidden="true">
                        {String(k + 1).padStart(2, "0")}/{String(g.photos.length).padStart(2, "0")}
                      </span>
                      {pick(photo(id).caption, locale)}
                      {EVENT_META[id] && <span> · {EVENT_META[id]}</span>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
          <span className="ax-s-progress" aria-hidden="true" />
        </div>
        <StripReveal />
      </section>

      {/* hobbies, after Lando's "Off track": a line on each, then the photos as prints lying
          on a desk; they drop in as it scrolls into view and can be picked up and moved */}
      <section id="off-screen" aria-labelledby="hobbies-title" className="ax-pm">
        <div className="ax-pm-head">
          <div>
            <Kicker>{t("hobbies")}</Kicker>
            <h2 id="hobbies-title" className="ax-h2 mt-6">
              {t("photos")}
            </h2>
          </div>
          <ul className="ax-pm-notes">
            {HOBBIES.map((h) => (
              <li key={h.key}>
                <span className="ax-pm-hand">{t(h.key)}</span>
                <p>{themeText(h.theme, locale)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="ax-pm-desk">
          {[...ABOUT_PHOTOS.hobbies.music, ...ABOUT_PHOTOS.hobbies.sport].map((id, i) => {
            const s = SPOTS[i % SPOTS.length]!;
            const cap = photo(id).caption;
            return (
              <figure
                key={id}
                className="ax-pm-card"
                style={
                  { "--x": s.x, "--y": s.y, "--r": `${s.r}deg`, "--i": i } as React.CSSProperties
                }
              >
                <div className="ax-pm-ph">
                  <Shot id={id} locale={locale} sizes="(min-width: 768px) 18vw, 45vw" />
                </div>
                {cap && <figcaption>{pick(cap, locale)}</figcaption>}
              </figure>
            );
          })}
          <p className="ax-pm-hint" aria-hidden="true">
            {t("dragHint")}
          </p>
          <Desk />
        </div>
      </section>
    </div>
  );
}

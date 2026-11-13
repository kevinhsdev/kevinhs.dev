import { ArrowUpRight } from "lucide-react";
import { Caveat } from "next/font/google";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { certificateFolders } from "@/components/about/data";
import { AboutEmailCard, AboutGlobe } from "@/components/home/about-teaser-client";
import { about, gallery, now, pick, profile } from "@/content";
import { MetalButton } from "@/components/ui/mercurio";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import "./about-teaser.css";

const hand = Caveat({ variable: "--font-hand", weight: "600", subsets: ["latin"] });

const photo = (id: string) => gallery.find((g) => g.id === id)!;

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** A gallery photo filling its frame. */
function Shot({ id, locale, sizes }: { id: string; locale: Locale; sizes: string }) {
  const p = photo(id);
  return (
    <Image
      src={p.src}
      alt={pick(p.alt, locale)}
      width={p.width}
      height={p.height}
      sizes={sizes}
      style={p.focus ? { objectPosition: p.focus } : undefined}
    />
  );
}

/** The story's chapters, each with its photo and its one line from About. */
const CHAPTERS = [
  { photo: "notebook", text: "ch1" },
  { photo: "umc", text: "ch2" },
  { photo: "claude-oracle", text: "ch3" },
] as const;

/** Off the screen, as a scrapbook page: one taped print per hobby. */
const PRINTS = [
  { photo: "guitarra-luz", word: "music" },
  { photo: "volei-jogo", word: "sport" },
] as const;

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

/**
 * The way into About from the home page: a bento where every card is a preview of one part of
 * the About page (the story, life off the screen, the certificates, what he's studying), and
 * each one jumps straight to it; plus a globe to spin, the portrait and the e-mail to copy.
 */
export async function AboutTeaser({ locale }: { locale: Locale }) {
  const t = await getTranslations("about");
  const folders = certificateFolders(locale);
  const certs = folders.reduce((n, f) => n + f.files.length, 0);
  // the folders' names, round the seal
  const ring = folders.map((f) => t(f.key)).join(" · ") + " · ";
  const me = profile.photo;
  return (
    <section aria-labelledby="about-teaser-title" className={`abt ${hand.variable}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="abt-head">
          <div>
            <p className="abt-kicker">{t("title")}</p>
            <h2 id="about-teaser-title" className="abt-title">
              {t("teaserTitle")}
            </h2>
          </div>
          <MetalButton href={`/${locale}/about`} download={false} className="abt-cta">
            {t("more")}
          </MetalButton>
        </header>

        <ul className="abt-grid">
          {/* the story: its three chapters as a timeline, a photo for each */}
          <li className="abt-card abt-story" style={i(0)}>
            <Link href="/about#story" className="abt-link">
              <span className="abt-label">{t("story")}</span>
              <ol className="abt-tl">
                {CHAPTERS.map((c, n) => (
                  <li key={c.photo} className="abt-tl-item">
                    <span className="abt-tl-ph">
                      <Shot id={c.photo} locale={locale} sizes="8rem" />
                    </span>
                    <span className="abt-tl-body">
                      <span className="abt-num">0{n + 1}</span>
                      <span className="abt-tl-h">{pick(about.chapters[n]!.label, locale)}</span>
                      <span className="abt-tl-p">{t(c.text)}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <ArrowUpRight aria-hidden className="abt-arrow" />
            </Link>
          </li>

          {/* where he's from and where he's been: a globe you can spin, São Paulo to Malta */}
          <li className="abt-card abt-world" style={i(1)}>
            <div className="abt-link">
              <span className="abt-label">{t("teaserWorld")}</span>
              <AboutGlobe labels={{ home: "São Paulo", malta: "Malta" }} />
              <span className="abt-world-line">
                São Paulo <span className="abt-dim">→</span> Malta
              </span>
              <span className="abt-hint">{t("teaserSpin")}</span>
            </div>
          </li>

          {/* the portrait, with what he's open to */}
          {me && (
            <li className="abt-card abt-me" style={i(2)}>
              <Link href="/about" className="abt-link">
                <span className="abt-bg">
                  <Image
                    src={me.src}
                    alt={pick(me.alt, locale)}
                    fill
                    sizes="(min-width: 1000px) 20rem, 100vw"
                  />
                </span>
                <span className="abt-status">
                  <span className="abt-pulse" aria-hidden="true" />
                  {pick(profile.status, locale)}
                </span>
                <ArrowUpRight aria-hidden className="abt-arrow" />
              </Link>
            </li>
          )}

          {/* the e-mail, one click to copy */}
          <li className="abt-card abt-mail" style={i(3)}>
            <AboutEmailCard
              labels={{
                title: t("teaserMail"),
                to: t("teaserTo"),
                subject: t("teaserSubject"),
                subjectText: t("teaserSubjectText"),
              }}
            />
          </li>

          {/* off the screen, as a scrapbook page: two taped prints with handwritten captions */}
          <li className="abt-card abt-off" style={i(4)}>
            <Link href="/about#off-screen" className="abt-link">
              <span className="abt-label">{t("photos")}</span>
              <span className="abt-off-note">{t("teaserOff")}</span>
              <span className="abt-prints" aria-hidden="true">
                {PRINTS.map((pr) => (
                  <span key={pr.photo} className="abt-print">
                    <span className="abt-tape" />
                    <span className="abt-print-ph">
                      <Shot id={pr.photo} locale={locale} sizes="14rem" />
                    </span>
                    <span className="abt-print-cap">{t(pr.word)}</span>
                  </span>
                ))}
              </span>
              <span className="abt-doodle abt-doodle--note" aria-hidden="true">
                ♪
              </span>
              <span className="abt-doodle abt-doodle--star" aria-hidden="true">
                ✶
              </span>
              <ArrowUpRight aria-hidden className="abt-arrow" />
            </Link>
          </li>

          {/* studying now: the terminal from About, in miniature */}
          <li className="abt-card abt-now" style={i(5)}>
            <Link href="/about#now" className="abt-link">
              <span className="abt-lights" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="abt-label">{t("studying")}</span>
              <span className="abt-term" aria-hidden="true">
                <span className="abt-term-cmd">
                  <span className="abt-dim">%</span> {t("termCommand")}
                </span>
                {now.learning.map((l) => (
                  <span key={l.title.en} className="abt-term-row">
                    <span className="abt-spin" />
                    {slug(pick(l.title, locale))}
                  </span>
                ))}
              </span>
              <span className="sr-only">
                {now.learning.map((l) => pick(l.title, locale)).join(", ")}
              </span>
              <ArrowUpRight aria-hidden className="abt-arrow" />
            </Link>
          </li>

          {/* certificates: a seal, the count in the middle and the folders' names turning round it */}
          <li className="abt-card abt-certs" style={i(6)}>
            <Link href="/about#certificates" className="abt-link">
              <span className="abt-label">{t("certificates")}</span>
              <span className="abt-seal" aria-hidden="true">
                <svg viewBox="0 0 200 200" className="abt-seal-ring">
                  <defs>
                    <path
                      id="abt-ring"
                      d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0"
                    />
                  </defs>
                  <text>
                    <textPath href="#abt-ring" textLength="500" lengthAdjust="spacing">
                      {ring + ring}
                    </textPath>
                  </text>
                </svg>
                <span className="abt-seal-core">
                  <span className="abt-big">{certs}</span>
                </span>
              </span>
              <span className="sr-only">
                {certs} · {t("teaserCerts", { n: folders.length })}
              </span>
              <ArrowUpRight aria-hidden className="abt-arrow" />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

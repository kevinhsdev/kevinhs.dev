import type { Metadata } from "next";
import { Caveat, Gloock, League_Gothic } from "next/font/google";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CertificatesView } from "@/components/about/certificates-view";
import { certificateFolders } from "@/components/about/data";
import { AboutStory, Kicker } from "@/components/about/stories";
import { BrandLente } from "@/components/shell/brand-lente";
import { MetalCvButton } from "@/components/shell/ctas";
import { SiteFooter } from "@/components/shell/footer";
import { Esteira } from "@/components/ui/esteira";
import { now, pick, profile } from "@/content";
import type { Locale } from "@/i18n/routing";
import "@/components/about/about.css";

/** Tall condensed capitals for titles, a high-contrast serif for the soft words. */
const tall = League_Gothic({ variable: "--font-tall", subsets: ["latin"] });
const serif = Gloock({ variable: "--font-serif", weight: "400", subsets: ["latin"] });
/** The handwriting from the home hero, over the name in the opening. */
const hand = Caveat({ variable: "--font-hand", weight: "600", subsets: ["latin"] });

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: `${t("title")} · Kevin Henrique`, description: t("description") };
}

/**
 * About, after Leclerc's "The man" and Lando's "Off track". The top half is in stories.tsx;
 * below it, on night blue: the certificate belt with its glass folders and the grid of every
 * certificate, what he's studying and building as a timing tower, and the K in glass.
 */
export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const t = await getTranslations("about");

  const folders = certificateFolders(locale);
  // dealt from each folder in turn, so the belt mixes them instead of eight Alura blues in a row
  const groups = folders.map((f) => f.files.map((file) => ({ ...file, group: t(f.key) })));
  const certs = Array.from({ length: Math.max(...groups.map((g) => g.length)) }, (_, i) =>
    groups.flatMap((g) => g[i] ?? []),
  ).flat();
  // the real first page where there is one; a paper card for the one without a file
  const certCards = certs.map((c) =>
    c.preview ? (
      <article key={c.id} className="cert cert--img">
        <Image
          src={c.preview.src}
          alt=""
          width={c.preview.width}
          height={c.preview.height}
          sizes="360px"
        />
      </article>
    ) : (
      <article key={c.id} className="cert">
        <div className="flex items-start justify-between gap-4">
          <span className="cert-kicker">{t("certificate")}</span>
          <span className="cert-group">{c.group}</span>
        </div>
        <p className="cert-name">{c.name}</p>
        <div className="flex items-end justify-between">
          <span className="cert-meta">{c.meta}</span>
          <span className="cert-seal" aria-hidden="true">
            K
          </span>
        </div>
      </article>
    ),
  );

  return (
    <>
      <main id="main" className={`about ax ${tall.variable} ${serif.variable} ${hand.variable}`}>
        <AboutStory locale={locale} />

        <div className="dark ax-night ax-tail">
          {/* certificates riding a conveyor behind the title, the glass folders in front */}
          <section aria-labelledby="certs-title" className="about-certs">
            <div className="about-certs-belt" aria-hidden="true">
              {/* the second row starts halfway down the list, so the rows never line up */}
              <Esteira
                rows={[certCards, [...certCards.slice(6), ...certCards.slice(0, 6)].reverse()]}
                label={t("certificates")}
              />
            </div>
            <div className="about-certs-front">
              <h2 id="certs-title" className="ax-h2">
                {t("certificates")}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-lg text-muted">{t("certificatesIntro")}</p>
              <CertificatesView
                folders={folders.map((f) => ({
                  ...f,
                  label: t(f.key),
                  count: t("items", { n: f.files.length }),
                }))}
                labels={{
                  open: t("certOpen"),
                  prev: t("certPrev"),
                  next: t("certNext"),
                  close: t("certClose"),
                  noPreview: t("certNoPreview"),
                }}
              />
            </div>
          </section>

          {/* studying now, after the drivers' sites: a live timing tower. On track, what he's
              studying, P1 down, with sectors lighting up while it runs; in the garage, what
              he's building */}
          <section aria-labelledby="now-title" className="ax-tt">
            <div className="ax-tt-head">
              <div>
                <Kicker>{t("nowKicker")}</Kicker>
                <h2 id="now-title" className="ax-h2 mt-6">
                  {t("studying")}
                </h2>
              </div>
              <p className="ax-tt-live">
                <span className="ahd-dot" aria-hidden="true" />
                {t("live")} · {t("updated", { date: now.updatedAt.split("-").reverse().join("/") })}
              </p>
            </div>
            <div className="ax-tt-boards">
              <div className="ax-tt-board">
                <p className="ax-tt-label">
                  <span>{t("track")}</span>
                  <span>{now.learning.length}</span>
                </p>
                <ol>
                  {now.learning.map((item, i) => {
                    const p = item.progress;
                    return (
                      <li key={i} className="ax-tt-row" style={{ "--i": i } as React.CSSProperties}>
                        <span className="ax-tt-pos">P{i + 1}</span>
                        <div className="ax-tt-main">
                          <h3 className="ax-tt-name">{pick(item.title, locale)}</h3>
                          <p className="ax-tt-text">{pick(item.text, locale)}</p>
                        </div>
                        {/* sectors: with a number they fill to it, without one they keep lapping */}
                        <span
                          className="ax-tt-sectors"
                          data-lap={p == null || undefined}
                          style={
                            p == null ? undefined : ({ "--p": p / 100 } as React.CSSProperties)
                          }
                          aria-hidden="true"
                        >
                          <i />
                          <i />
                          <i />
                        </span>
                        <span className="ax-tt-status">
                          {item.status ? pick(item.status, locale) : t("inProgress")}
                          {p != null && ` · ${p}%`}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
              <div className="ax-tt-board">
                <p className="ax-tt-label">
                  <span>{t("garage")}</span>
                  <span>{now.building.length}</span>
                </p>
                <ul>
                  {now.building.map((b, i) => {
                    const [name, text] = pick(b, locale).split(/[:,]\s(.*)/s);
                    return (
                      <li key={i} className="ax-tt-row" style={{ "--i": i } as React.CSSProperties}>
                        <span className="ax-tt-pos">G{i + 1}</span>
                        <div className="ax-tt-main">
                          <h3 className="ax-tt-name">{text ? name : name!.replace(/\.$/, "")}</h3>
                          {text && <p className="ax-tt-text">{text}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </section>

          {/* closing call: the K in glass, then a fade into the footer's black */}
          <section aria-labelledby="about-end-title" className="about-end">
            <div className="mx-auto max-w-7xl px-5 pt-10 pb-36 text-center sm:px-8 lg:pb-48">
              <BrandLente label={profile.name} className="about-lente mx-auto" />
              <h2 id="about-end-title" className="ax-h2">
                {t("endTitle")}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-lg text-muted">{t("endText")}</p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
                <MetalCvButton />
                <a href={`/${locale}#contact`} className="about-end-link">
                  {t("endContact")} →
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

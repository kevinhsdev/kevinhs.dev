import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { certificateFolders, eventOptions } from "@/components/about/data";
import { Reveal } from "@/components/motion/reveal";
import { SiteFooter } from "@/components/shell/footer";
import { CardFanCarousel } from "@/components/ui/card-fan-carousel";
import GlassFolder from "@/components/ui/glass-folder";
import { HoloCard } from "@/components/ui/holo-card";
import { InteractiveSelector } from "@/components/ui/interactive-selector";
import { about, gallery, now, pick, profile, skills } from "@/content";
import type { Locale } from "@/i18n/routing";
import "@/components/about/about.css";

const FAN = [
  "guitarra-luz",
  "teclado",
  "guitarra",
  "instrumentos",
  "volei",
  "volei-jogo",
  "aviao",
  "adesivos",
];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: `${t("title")} · Kevin Henrique`, description: t("description") };
}

function Heading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-5xl leading-none uppercase sm:text-7xl">
      {children}
    </h2>
  );
}

/**
 * About: who Kevin is (with the Holo Card) → off-screen photos (Card Fan) → certificates
 * (Glass Folders) → events (Interactive Selector) → studying now → every skill by tier.
 */
export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const t = await getTranslations("about");
  const ts = await getTranslations("skills");

  const fan = FAN.map((id) => {
    const photo = gallery.find((g) => g.id === id);
    if (!photo) throw new Error(`about: unknown photo "${id}"`);
    return { imgUrl: photo.src, alt: pick(photo.alt, locale) };
  });

  return (
    <>
      <main id="main" className="about">
        {/* who */}
        <section
          aria-labelledby="about-title"
          className="mx-auto grid max-w-7xl gap-14 px-5 pt-36 pb-20 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:pt-44"
        >
          <div className="lg:col-span-7">
            <Reveal>
              <h1
                id="about-title"
                data-line
                className="font-display text-7xl leading-[0.9] uppercase sm:text-9xl"
              >
                {t("title")}
              </h1>
            </Reveal>
            <p className="mt-8 max-w-2xl text-xl leading-snug text-pretty sm:text-2xl">
              {pick(about.lede, locale)}
            </p>
            <div className="mt-8 flex max-w-2xl flex-col gap-4 leading-relaxed text-muted">
              {about.intro.map((p, i) => (
                <p key={i}>{pick(p, locale)}</p>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-8 lg:col-span-5">
            {profile.photo && (
              <Image
                src={profile.photo.src}
                alt={pick(profile.photo.alt, locale)}
                width={480}
                height={600}
                priority
                className="aspect-[4/5] w-full max-w-sm rounded-3xl border border-border object-cover"
              />
            )}
            {/* The foil barely shows on a white card, so the card keeps the dark tokens. */}
            <div className="dark w-full max-w-sm">
              <HoloCard className="about-holo" maxTilt={16} label={t("card")}>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--hc-muted)] uppercase">
                    kevinhs.dev
                  </span>
                  <span className="rounded-full border border-[var(--hc-border)] px-2 py-0.5 text-[10px] text-[var(--hc-accent-text)]">
                    {pick(profile.status, locale)}
                  </span>
                </div>
                <div>
                  <p className="font-display text-3xl leading-none text-[var(--hc-fg)] uppercase">
                    {profile.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--hc-muted)]">
                    {pick(profile.role, locale)}
                  </p>
                </div>
                <div className="flex items-end justify-between gap-4 font-mono text-[11px] text-[var(--hc-muted)]">
                  <span>{pick(profile.location, locale)}</span>
                  <span className="flex gap-3">
                    <a
                      href={profile.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--hc-accent-text)]"
                    >
                      GitHub
                    </a>
                    <a
                      href={profile.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--hc-accent-text)]"
                    >
                      LinkedIn
                    </a>
                  </span>
                </div>
              </HoloCard>
            </div>
          </div>
        </section>

        {/* off screen */}
        <section aria-labelledby="photos-title" className="about-photos py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Heading id="photos-title">{t("photos")}</Heading>
          </div>
          <CardFanCarousel cards={fan} className="about-fan mt-10" />
        </section>

        {/* certificates */}
        <section
          aria-labelledby="certs-title"
          className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"
        >
          <Heading id="certs-title">{t("certificates")}</Heading>
          <p className="mt-4 max-w-xl text-muted">{t("certificatesIntro")}</p>
          <div className="mt-12 flex flex-wrap justify-center gap-10 sm:justify-start">
            {certificateFolders(locale).map((f, i) => (
              <GlassFolder
                key={f.key}
                label={t(f.key)}
                meta={t("items", { n: f.files.length })}
                art={f.art}
                tone={f.tone}
                action="none"
                appearDelay={i * 120}
                files={f.files.map(({ name, meta }) => ({ name, meta }))}
              />
            ))}
          </div>
        </section>

        {/* events */}
        <section
          aria-labelledby="events-title"
          className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"
        >
          <Heading id="events-title">{t("events")}</Heading>
          <p className="mt-4 max-w-xl text-muted">{t("eventsIntro")}</p>
          <InteractiveSelector
            className="about-events mt-12"
            label={t("events")}
            options={eventOptions(locale)}
          />
        </section>

        {/* studying now */}
        <section
          aria-labelledby="now-title"
          className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"
        >
          <Heading id="now-title">{t("studying")}</Heading>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {now.learning.map((item, i) => (
              <li
                key={i}
                className="rounded-3xl border border-border bg-surface p-6 leading-relaxed"
              >
                <span className="mb-3 block font-mono text-xs text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {pick(item, locale)}
              </li>
            ))}
          </ol>
        </section>

        {/* every skill */}
        <section
          aria-labelledby="skills-title"
          className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"
        >
          <Heading id="skills-title">{t("skills")}</Heading>
          <dl className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2">
            {skills.map((group) => (
              <div key={group.tier} className="bg-background p-6 sm:p-8">
                <dt className="font-mono text-xs tracking-widest text-muted uppercase">
                  {ts(`tiers.${group.tier}`)}
                </dt>
                <dd className="mt-5">
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => {
                      const name = pick(item, locale);
                      return (
                        <li
                          key={name}
                          className="rounded-full border border-border px-4 py-2 text-sm"
                        >
                          {name}
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

import { Caveat } from "next/font/google";
import { getTranslations } from "next-intl/server";
import {
  CopyEmailButton,
  CvButton,
  InstagramButton,
  LinkedInButton,
} from "@/components/shell/ctas";
import { getProject, pick, profile } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ShaderStage } from "@/components/stage/shader-stage";
import { Swarm } from "./swarm";
import "./hero.css";

const hand = Caveat({ variable: "--font-hand", weight: "600", subsets: ["latin"] });

/** The three real numbers on the right: project metrics, never invented. */
const NUMBERS = [
  { project: "pdf-renamer", metric: 0 },
  { project: "pdf-renamer", metric: 1 },
  { project: "sek", metric: 0 },
] as const;

/**
 * Hero in the Kairo layout (ProfitizeBuild): the name and CTAs on the left, the
 * Fluxo waves full-bleed behind, the real numbers on a glass card on the right. Every [data-camada] is a layer
 * the swarm of cursors assembles; the agents leave once it is built.
 */
export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations("hero");
  const numbers = NUMBERS.flatMap(({ project: slug, metric: index }) => {
    const project = getProject(slug);
    const metric = project?.metrics[index];
    return project && metric ? [{ slug, metric }] : [];
  });

  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <symbol id="u-ne" viewBox="0 0 24 24">
          <path d="M7 17 17 7M8.5 7H17v8.5" />
        </symbol>
        <symbol id="u-local" viewBox="0 0 24 24">
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
          <circle cx="12" cy="10" r="2.3" />
        </symbol>
      </svg>

      <section
        id="hero"
        aria-labelledby="hero-title"
        className={`hero dark ${hand.variable}`}
        data-montagem="hero"
      >
        <div className="hero__quadro" data-camada="quadro" aria-hidden>
          <ShaderStage kind="fluxo" />
        </div>

        <div className="hero__a" data-parte>
          <p className="hero__papel">
            <span className="hero__papel-1" data-camada="texto">
              {t("role1")}
            </span>
            <span className="hero__papel-2" data-camada="texto">
              {t("role2")}
            </span>
          </p>
          <p className="hero__status" data-camada="texto">
            <i className="ponto" aria-hidden />
            {pick(profile.status, locale)}
          </p>

          <div className="hero__esq">
            <h1 id="hero-title" className="hero__quem">
              <span className="hero__ola" data-camada="texto">
                {t("hello")}
              </span>
              <span className="hero__nome" data-camada="texto">
                {profile.name.split(" ")[0]!.toUpperCase()}
                <span className="pq">.</span>
              </span>
            </h1>
            <p className="hero__cargo" data-camada="texto">
              {t.rich("cargo", { br: () => <br /> })}
            </p>
            <p className="hero__texto" data-camada="texto">
              {pick(profile.tagline, locale)} {profile.stackLine}, {pick(profile.interests, locale)}
              .
            </p>
            <div className="hero__ctas">
              <span data-camada="bloco">
                <CvButton className="hero__botao hero__botao--cv sel" />
              </span>
              <ul className="hero__redes" data-duplica aria-label={t("links")}>
                <li data-camada="bloco">
                  <LinkedInButton className="anel sel" compact />
                </li>
                <li data-camada="bloco">
                  <InstagramButton className="anel sel" compact />
                </li>
                <li data-camada="bloco">
                  <CopyEmailButton className="anel sel" compact />
                </li>
              </ul>
            </div>
            <p className="hero__local" data-camada="texto">
              <svg className="ico" aria-hidden>
                <use href="#u-local" />
              </svg>
              <span>
                {pick(profile.location, locale)} · {t("availability")}
              </span>
            </p>
          </div>
        </div>

        <div className="hero__dir" data-parte>
          <ul className="hero__numeros" data-duplica aria-label={t("numbers")}>
            {numbers.map(({ slug, metric }, i) =>
              i < numbers.length - 1 ? (
                <li key={`${slug}-${metric.value}`}>
                  <strong data-camada="texto">{metric.value}</strong>
                  <span data-camada="texto">{pick(metric.label, locale)}</span>
                </li>
              ) : (
                <li key={`${slug}-${metric.value}`}>
                  <Link className="hero__num-link sel" href={`/projects/${slug}`}>
                    <strong data-camada="texto">{metric.value}</strong>
                    <span data-camada="texto">
                      {pick(metric.label, locale)}
                      <svg className="ico" aria-hidden>
                        <use href="#u-ne" />
                      </svg>
                    </span>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      </section>

      <Swarm
        labels={{
          group: t("bar.group"),
          scanning: t("bar.scanning"),
          agents: t("bar.agents"),
          layers: t("bar.layers"),
          builtBy: t("bar.builtBy"),
          agentsIn: t("bar.agentsIn"),
          tour: t("bar.tour"),
          touring: t("bar.touring"),
          speed: t("bar.speed", { v: "{v}" }),
          redo: t("bar.redo"),
          locale: locale === "en" ? "en-US" : "pt-BR",
        }}
      />
    </>
  );
}

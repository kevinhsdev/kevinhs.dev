import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";

/**
 * Runs before the curtain is parsed, so returning visitors never see a flash:
 * the intro plays once per browser session, and any click or key skips it.
 * Kept tiny and dependency-free on purpose (it executes during HTML parsing).
 */
const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem("intro-seen")){d.setAttribute("data-intro-seen","")}else{sessionStorage.setItem("intro-seen","1")}}catch(e){}function s(){d.setAttribute("data-intro-skip","");removeEventListener("pointerdown",s);removeEventListener("keydown",s)}addEventListener("pointerdown",s);addEventListener("keydown",s)})();`;

const order = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Intro curtain styled as a build log: the command, a few ✓ steps printed one
 * by one and a progress bar counting to 100%, then the curtain lifts away.
 * Pure CSS, so it leaves on its own even if JavaScript fails, and the page
 * underneath is already rendered. Hidden for reduced motion and from
 * assistive tech (decorative).
 */
export async function Preloader() {
  const t = await getTranslations("creative");
  const steps = t.raw("buildSteps") as string[];

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <div aria-hidden className="preloader" data-print="hide">
        <div className="flex items-start justify-between font-mono text-xs tracking-widest text-muted uppercase">
          <span>{t("codeBy")}</span>
          <span>{t("intro")}</span>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 font-mono text-sm sm:text-lg">
          <ol className="flex flex-col gap-2">
            <li className="build-line" style={order(0)}>
              <span className="text-accent">~/kevin $</span> npm run build
            </li>
            {steps.map((step, index) => (
              <li key={step} className="build-line text-muted" style={order(index + 1)}>
                <span className="text-positive">✓</span> {step}
              </li>
            ))}
            <li className="build-line font-semibold text-accent" style={order(steps.length + 1)}>
              → {t("buildDone")}
            </li>
          </ol>

          <div className="flex items-center gap-4">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
              <div className="preloader-bar h-full bg-accent" />
            </div>
            <span className="preloader-count w-[4ch] text-right tabular-nums" />
          </div>
        </div>

        <span className="self-end font-mono text-xs tracking-widest text-muted uppercase">
          {t("skip")} ↵
        </span>
      </div>
    </>
  );
}

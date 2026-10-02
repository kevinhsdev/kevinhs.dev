import { getTranslations } from "next-intl/server";
import { KEVIN_MARK_PATH } from "@/components/shared/logo";

/**
 * Runs before the curtain is parsed, so returning visitors never see a flash:
 * the intro plays once per browser session, and any click or key skips it.
 * Kept tiny and dependency-free on purpose (it executes during HTML parsing).
 */
const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem("intro-seen")){d.setAttribute("data-intro-seen","")}else{sessionStorage.setItem("intro-seen","1")}}catch(e){}function s(){d.setAttribute("data-intro-skip","");removeEventListener("pointerdown",s);removeEventListener("keydown",s)}addEventListener("pointerdown",s);addEventListener("keydown",s)})();`;

// The K (118×107) at a quarter size, centered in the 160×100 scene.
const MARK = { d: KEVIN_MARK_PATH, transform: "translate(65.25 36.6) scale(0.25)" };

/**
 * Intro curtain: the K's outline draws itself in blue, the K turns into a
 * window onto the site, and the screen zooms through it. Pure CSS (timeline in
 * creative.css), so it leaves on its own even if JavaScript fails, and the
 * page underneath is already rendered. Hidden for reduced motion and from
 * assistive tech (decorative).
 */
export async function Preloader() {
  const t = await getTranslations("creative");

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <div aria-hidden className="preloader" data-print="hide">
        <svg className="preloader-scene" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <mask
              id="intro-window"
              maskUnits="userSpaceOnUse"
              x="-400"
              y="-400"
              width="960"
              height="900"
            >
              <rect x="-400" y="-400" width="960" height="900" fill="#fff" />
              <path {...MARK} fill="#000" />
            </mask>
          </defs>
          <g className="preloader-zoom">
            {/* The curtain, with a K-shaped window cut out of it… */}
            <rect
              x="-400"
              y="-400"
              width="960"
              height="900"
              className="preloader-curtain"
              mask="url(#intro-window)"
            />
            {/* …covered at first, until the outline is drawn. */}
            <path {...MARK} className="preloader-cover" />
            <path {...MARK} className="preloader-outline" pathLength={1} />
          </g>
        </svg>
        <span className="preloader-skip font-mono text-xs tracking-widest text-muted uppercase">
          {t("skip")} ↵
        </span>
      </div>
    </>
  );
}

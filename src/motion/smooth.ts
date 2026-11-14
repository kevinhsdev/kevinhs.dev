import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReduced } from "./reduced";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
const raf = (time: number) => lenis?.raf(time * 1000);

/** Lenis on the GSAP ticker, feeding ScrollTrigger. Null with reduced motion. */
export function startSmooth(): Lenis | null {
  if (prefersReduced()) return null;
  if (lenis) return lenis;
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopSmooth() {
  gsap.ticker.remove(raf);
  lenis?.destroy();
  lenis = null;
}

export const getSmooth = () => lenis;

/**
 * Where a section really starts on the page. A pinned section is position: fixed while pinned,
 * so its own box says "top of the screen"; GSAP's pin-spacer around it keeps the real place.
 */
export function sectionTop(el: HTMLElement) {
  const box = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
  return box.getBoundingClientRect().top + scrollY;
}

/**
 * Jumps to the section with this id and keeps it there while the page settles: pins add their
 * spacers, images and fonts load, and everything below moves down. Re-aims every 100 ms until
 * the target holds still for 300 ms (or 3 s pass), then resolves.
 */
export function jumpTo(id: string): Promise<void> {
  return new Promise((done) => {
    let last = NaN;
    let still = 0;
    let tries = 0;
    const aim = () => {
      const el = document.getElementById(id);
      if (el) {
        const top = Math.round(sectionTop(el));
        scrollToTarget(top, true);
        still = Math.abs(top - last) < 2 ? still + 1 : 0;
        last = top;
      }
      if (still >= 3 || ++tries >= 30) return done();
      window.setTimeout(aim, 100);
    };
    aim();
  });
}

/** Scrolls to an element or y through Lenis when it runs, natively otherwise. */
export function scrollToTarget(target: HTMLElement | number, immediate = false) {
  if (lenis) return lenis.scrollTo(target, { immediate });
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + scrollY;
  window.scrollTo({ top, behavior: immediate || prefersReduced() ? "auto" : "smooth" });
}

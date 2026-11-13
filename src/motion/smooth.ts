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

/** Scrolls to an element or y through Lenis when it runs, natively otherwise. */
export function scrollToTarget(target: HTMLElement | number, immediate = false) {
  if (lenis) return lenis.scrollTo(target, { immediate });
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + scrollY;
  window.scrollTo({ top, behavior: immediate || prefersReduced() ? "auto" : "smooth" });
}

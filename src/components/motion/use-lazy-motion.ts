"use client";

import "lenis/dist/lenis.css";
import { useEffect, useRef } from "react";
import { SCROLL_EVENT } from "@/components/shared/command-menu";

type Gsap = typeof import("gsap").gsap;
type ScrollTriggerType = typeof import("gsap/ScrollTrigger").ScrollTrigger;
type SplitTextType = typeof import("gsap/SplitText").SplitText;
type LenisInstance = InstanceType<typeof import("lenis").default>;

export type MotionKit = {
  gsap: Gsap;
  ScrollTrigger: ScrollTriggerType;
  SplitText: SplitTextType;
  lenis: LenisInstance;
  /** Same curve as the --ease-out-quint token, so CSS and GSAP motion feel alike. */
  out: string;
  /** Mouse/trackpad with hover: gate every pointer-driven effect on this. */
  finePointer: boolean;
  /** True when the element starts below ~88% of the viewport (safe to hide and reveal). */
  belowFold: (element: Element) => boolean;
};

/**
 * Loads GSAP + Lenis only after the page is idle (or on the first scroll/key),
 * so the hero paints without competing JavaScript. `setup` runs inside a GSAP
 * context that is reverted on unmount; it may return extra cleanup.
 * Nothing runs under prefers-reduced-motion: the page stays static and complete.
 */
export function useLazyMotion(setup: (kit: MotionKit) => void | (() => void)) {
  const setupRef = useRef(setup);

  useEffect(() => {
    setupRef.current = setup;
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let started = false;
    let cleanup = () => {};

    const start = async () => {
      window.removeEventListener("wheel", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("keydown", start);
      if (disposed || started) return;
      started = true;

      const [{ gsap }, { ScrollTrigger }, { SplitText }, { CustomEase }, { default: Lenis }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("gsap/SplitText"),
          import("gsap/CustomEase"),
          import("lenis"),
        ]);
      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
      CustomEase.create("outQuint", "0.23,1,0.32,1");

      const lenis = new Lenis({
        anchors: true,
        autoRaf: false,
        // Let the command palette scroll natively.
        prevent: (node) => Boolean(node.closest("[cmdk-dialog], [cmdk-overlay]")),
      });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Command-palette navigation goes through Lenis so the two never fight.
      const onScrollTo = (event: Event) => {
        event.preventDefault();
        lenis.scrollTo((event as CustomEvent<HTMLElement>).detail, { offset: -64 });
      };
      window.addEventListener(SCROLL_EVENT, onScrollTo);

      const kit: MotionKit = {
        gsap,
        ScrollTrigger,
        SplitText,
        lenis,
        out: "outQuint",
        finePointer: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
        belowFold: (element) => element.getBoundingClientRect().top > window.innerHeight * 0.88,
      };

      let extra: void | (() => void);
      const context = gsap.context(() => {
        extra = setupRef.current(kit);
      });
      void document.fonts.ready.then(() => ScrollTrigger.refresh());

      cleanup = () => {
        extra?.();
        window.removeEventListener(SCROLL_EVENT, onScrollTo);
        context.revert();
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    };

    // Whichever comes first: the page going idle, or the user starting to interact.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle
      ? window.requestIdleCallback(() => void start(), { timeout: 2500 })
      : window.setTimeout(() => void start(), 1500);
    const options = { once: true, passive: true } as const;
    window.addEventListener("wheel", start, options);
    window.addEventListener("touchstart", start, options);
    window.addEventListener("keydown", start, { once: true });

    return () => {
      disposed = true;
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      window.removeEventListener("wheel", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("keydown", start);
      cleanup();
    };
  }, []);
}

/**
 * Reveals shared by the creative versions, declared with data attributes:
 *   [data-reveal]  fade + rise on enter
 *   [data-split]   lines rise out of a mask
 *   [data-count]   integer counts up from 0 (the HTML already holds the final value)
 * Elements already on screen are left alone: content is never hidden to be re-shown.
 */
export function applyReveals({ gsap, SplitText, out, belowFold }: MotionKit) {
  gsap.utils
    .toArray<HTMLElement>("[data-reveal]")
    .filter(belowFold)
    .forEach((element) => {
      gsap.from(element, {
        y: 32,
        opacity: 0,
        duration: 0.9,
        ease: out,
        scrollTrigger: { trigger: element, start: "top 88%", once: true },
      });
    });

  gsap.utils
    .toArray<HTMLElement>("[data-split]")
    .filter(belowFold)
    .forEach((element) => {
      SplitText.create(element, {
        type: "lines",
        mask: "lines",
        // Masks become .split-line-mask (see globals.css: headroom for accents like Ó, Ã).
        linesClass: "split-line",
        // Only whole lines are split, so the text still reads naturally: no ARIA rewrite.
        aria: "none",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 105,
            duration: 1,
            stagger: 0.08,
            ease: out,
            scrollTrigger: { trigger: element, start: "top 85%", once: true },
          }),
      });
    });

  gsap.utils
    .toArray<HTMLElement>("[data-count]")
    .filter(belowFold)
    .forEach((element) => {
      const target = Number(element.dataset.count);
      if (!Number.isFinite(target)) return;
      const counter = { value: 0 };
      element.textContent = "0";
      gsap.to(counter, {
        value: target,
        duration: 1.4,
        ease: out,
        onUpdate: () => {
          element.textContent = String(Math.round(counter.value));
        },
        scrollTrigger: { trigger: element, start: "top 85%", once: true },
      });
    });
}

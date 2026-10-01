"use client";

import type { ReactNode } from "react";
import { applyReveals, useLazyMotion } from "@/components/motion/use-lazy-motion";

/**
 * Site choreography (on top of the shared reveals):
 *   [data-stack-card]  sticky project cards shrink as the next one covers them
 */
export function CreativeMotion({ children }: { children: ReactNode }) {
  useLazyMotion((kit) => {
    const { gsap } = kit;
    applyReveals(kit);

    const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
    cards.slice(0, -1).forEach((card, index) => {
      gsap.to(card, {
        scale: 0.94,
        transformOrigin: "50% 0%",
        ease: "none",
        scrollTrigger: {
          trigger: cards[index + 1],
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      });
    });
  });

  return children;
}

"use client";

import { useEffect } from "react";

/** Room kept under a tall card for the CTA dock (matches the pinned Journey's bottom padding). */
const DOCK_GAP = 88;

/**
 * A sticky card taller than the screen would stick by its top, and the next
 * card would cover its bottom before anyone could read it (phones). Such a card
 * sticks by its bottom instead: it scrolls until its end is visible, then stays.
 */
export function StackFit() {
  useEffect(() => {
    const cards = [...document.querySelectorAll<HTMLElement>("[data-stack-card]")];
    const fit = () => {
      for (const card of cards) {
        const top = Number(card.dataset.stackTop);
        card.style.top = `${Math.min(top, window.innerHeight - card.offsetHeight - DOCK_GAP)}px`;
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    cards.forEach((card) => observer.observe(card));
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return null;
}

"use client";

import { useEffect, useRef } from "react";

/**
 * Reveals each photo of the sideways story as it slides into view. The strip moves by transform,
 * which scroll timelines can't see, so an IntersectionObserver marks each figure (data-in).
 * Until this runs (or without JS, or with reduced motion) the photos simply show. Everything
 * before the item coming in is marked too, so a fast scroll that jumps past a photo never
 * leaves it hidden.
 */
export function StripReveal() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const strip = ref.current?.closest<HTMLElement>(".ax-s");
    if (!strip || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    strip.dataset.reveal = "true";
    const items = [...strip.querySelectorAll<HTMLElement>(".ax-s-fig, .ax-s-head")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          for (const el of items.slice(0, items.indexOf(e.target as HTMLElement) + 1)) {
            if (el.dataset.in) continue;
            el.dataset.in = "true";
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.2 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return <span ref={ref} hidden />;
}

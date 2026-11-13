"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./esteira.css";

/**
 * Esteira (ProfitizeBuild): two rows of cards that run in opposite directions with the
 * scroll (0.3 px sideways per px scrolled, 0.2 on narrow screens) plus a slow drift.
 * mountEsteira is the prompt's motion code, unchanged; the cards come from the caller.
 */
export function Esteira({ rows, label }: { rows: [ReactNode[], ReactNode[]]; label: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => (ref.current ? mountEsteira(ref.current) : undefined), []);
  return (
    <section ref={ref} className="esteira" aria-label={label}>
      {rows.map((cards, r) => (
        <div key={r} className="esteira__row">
          {[0, 1, 2].map((copy) =>
            cards.map((card, i) => (
              <div key={`${copy}-${i}`} className="esteira__slot" aria-hidden={copy > 0 || undefined}>
                {card}
              </div>
            )),
          )}
        </div>
      ))}
    </section>
  );
}

function mountEsteira(section: HTMLElement): () => void {
  const rows = Array.from(section.querySelectorAll<HTMLElement>(".esteira__row"));
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = matchMedia("(max-width: 900px)");
  const DRIFT = 18; // px per second while the page is still (0 = scroll only)
  // period of ONE copy: (width of the three copies + the missing gap) / 3
  let sets = [0, 0];
  const measure = () => {
    sets = rows.map((r) => (r.scrollWidth + parseFloat(getComputedStyle(r).columnGap)) / 3);
  };
  let drift = 0;
  let last = performance.now();
  let raf = 0;
  let visible = false;
  const frame = (now: number) => {
    raf = 0;
    if (!still) drift += Math.min(64, now - last) * (DRIFT / 1000);
    last = now;
    const speed = narrow.matches ? 0.2 : 0.3;
    const scrolled = still ? 0 : (innerHeight - section.getBoundingClientRect().top) * speed;
    const off = scrolled + drift;
    const m = sets.map((w) => (w ? ((off % w) + w) % w : 0));
    rows[0]!.style.transform = `translate3d(${m[0]! - sets[0]!}px, 0, 0)`; // to the right
    rows[1]!.style.transform = `translate3d(${-m[1]!}px, 0, 0)`; // to the left
    if (visible && !still) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  measure();
  frame(performance.now());
  const io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    last = performance.now();
    if (visible) kick();
  });
  io.observe(section);
  const ro = new ResizeObserver(() => {
    measure();
    kick();
  });
  rows.forEach((r) => ro.observe(r));
  return () => {
    io.disconnect();
    ro.disconnect();
    cancelAnimationFrame(raf);
  };
}

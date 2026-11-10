"use client";

import { useEffect, useRef } from "react";
import { outExpo } from "@/motion/math";
import { prefersReduced } from "@/motion/reduced";

/** "~535" → ["~", 535, "", 0]; values with no number (rare) don't count. */
export function splitMetric(value: string): [string, number, string, number] | null {
  const m = /^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/.exec(value);
  if (!m) return null;
  const [, pre = "", num = "0", post = ""] = m;
  const decimals = num.split(/[.,]/)[1]?.length ?? 0;
  return [pre, Number(num.replace(",", ".")), post, decimals];
}

/** Counts every `[data-value]` inside the element up from 0 the first time it enters the screen. */
export function useCountUp<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const nodes = [...el.querySelectorAll<HTMLElement>("[data-value]")];
    const parts = nodes.map((n) => splitMetric(n.dataset.value!));
    const paint = (t: number) =>
      nodes.forEach((n, i) => {
        const p = parts[i];
        if (!p) return;
        const [pre, num, post, dec] = p;
        n.textContent = `${pre}${(num * t).toFixed(dec)}${post}`;
      });
    paint(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / 1400);
          paint(outExpo(t));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      paint(1);
    };
  }, []);
  return ref;
}

/** The project's numbers; each counts up from 0 the first time the list enters the screen. */
export function Metrics({ items }: { items: { value: string; label: string }[] }) {
  const ref = useCountUp<HTMLDListElement>();
  return (
    <dl
      ref={ref}
      className="pj-metrics grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((m) => (
        <div key={m.label} className="flex flex-col gap-4 bg-background p-6 sm:p-10">
          <dt className="order-2 text-sm text-muted">{m.label}</dt>
          <dd
            data-value={m.value}
            aria-label={m.value}
            className="order-1 font-display text-[clamp(4rem,8vw,8rem)] leading-[0.85] text-accent tabular-nums"
          >
            {m.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

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

/** The project's numbers; each counts up from 0 the first time the list enters the screen. */
export function Metrics({ items }: { items: { value: string; label: string }[] }) {
  const ref = useRef<HTMLDListElement>(null);
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
  return (
    <dl
      ref={ref}
      className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((m) => (
        <div key={m.label} className="flex flex-col gap-3 bg-background p-6 sm:p-8">
          <dt className="order-2 text-sm text-muted">{m.label}</dt>
          <dd
            data-value={m.value}
            aria-label={m.value}
            className="order-1 font-display text-6xl leading-none text-accent tabular-nums sm:text-7xl"
          >
            {m.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

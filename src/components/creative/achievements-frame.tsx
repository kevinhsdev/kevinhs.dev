"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

// PROTOTYPE: lets Kevin compare looks for the Achievements section. Once one is
// chosen, drop this picker and render that view directly.

/**
 * Pointer light for every `[data-tilt]` element in the lab: writes the pointer
 * position (--mx/--my, in %) and a tilt (--rx/--ry, in deg) that CSS eases with
 * a transition. One delegated listener instead of one per card.
 */
function usePointerLight(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce), (hover: none)").matches) return;
    const reset = (card: HTMLElement) => {
      for (const p of ["--mx", "--my", "--rx", "--ry", "--hover"]) card.style.removeProperty(p);
    };
    const move = (e: PointerEvent) => {
      const card = (e.target as Element).closest<HTMLElement>("[data-tilt]");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      card.style.setProperty("--rx", `${((0.5 - y) * 14).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${((x - 0.5) * 18).toFixed(2)}deg`);
      card.style.setProperty("--hover", "1");
    };
    const out = (e: PointerEvent) => {
      const card = (e.target as Element).closest<HTMLElement>("[data-tilt]");
      if (card && !card.contains(e.relatedTarget as Node | null)) reset(card);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerout", out);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerout", out);
    };
  }, [root]);
}

export function AchievementsLab({
  views,
  className,
}: {
  views: { id: string; label: string; node: ReactNode }[];
  className?: string;
}) {
  const [current, setCurrent] = useState(views[0]?.id ?? "");
  const root = useRef<HTMLDivElement>(null);
  usePointerLight(root);
  return (
    <div className={className} ref={root}>
      <div
        role="group"
        aria-label="Visual"
        className="achievements-picker mb-8 flex flex-wrap gap-2"
      >
        {views.map((v, i) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={current === v.id}
            onClick={() => setCurrent(v.id)}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-[color,background-color,border-color,transform] duration-200 hover:text-foreground active:scale-[0.97] aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          >
            <span className="mr-1.5 tabular-nums opacity-50">{i + 1}</span>
            {v.label}
          </button>
        ))}
      </div>
      {/* keyed: switching views remounts it, which replays the entrance */}
      <div key={current} className="lab-view">
        {views.find((v) => v.id === current)?.node}
      </div>
    </div>
  );
}

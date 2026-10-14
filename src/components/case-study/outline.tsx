"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { OutlineItem } from "@/lib/case-studies";

/**
 * The case study's sections as an editor's outline panel, numbered like the
 * h2s. Sticky beside the article on wide screens; the section being read is
 * highlighted (IntersectionObserver, no scroll listener). The current section
 * is the last heading above the top fifth of the screen, or the last one once
 * the article's end ([data-outline-end]) is in view, since the final sections
 * can't scroll up that far. A clicked item stays current until the reader
 * scrolls again, so the smooth scroll on the way can't flip it.
 */
export function CaseOutline({ items, label }: { items: OutlineItem[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const clicked = useRef(false);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    const end = document.querySelector("[data-outline-end]");
    let atEnd = false;

    const recompute = () => {
      if (clicked.current || headings.length === 0) return;
      if (atEnd) return setActive(headings.at(-1)!.id);
      const line = window.innerHeight * 0.2;
      const above = headings.filter((heading) => heading.getBoundingClientRect().top <= line);
      setActive((above.at(-1) ?? headings[0]!).id);
    };

    // Fires whenever a heading crosses the top fifth of the screen.
    const observer = new IntersectionObserver(recompute, { rootMargin: "0px 0px -80% 0px" });
    headings.forEach((heading) => observer.observe(heading));
    const endObserver = new IntersectionObserver(([entry]) => {
      atEnd = Boolean(entry?.isIntersecting);
      recompute();
    });
    if (end) endObserver.observe(end);

    // The reader scrolling again hands the highlight back to the observers.
    const release = () => {
      if (!clicked.current) return;
      clicked.current = false;
      recompute();
    };
    const options = { passive: true } as const;
    window.addEventListener("wheel", release, options);
    window.addEventListener("touchstart", release, options);
    window.addEventListener("keydown", release);
    return () => {
      observer.disconnect();
      endObserver.disconnect();
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", release);
    };
  }, [items]);

  return (
    <nav aria-label={label} className="case-outline">
      <p className="mb-3 px-3 font-mono text-xs tracking-widest text-muted uppercase">{label}</p>
      <ol className="flex flex-col">
        {items.map((item, index) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                onClick={() => {
                  clicked.current = true;
                  setActive(item.id);
                }}
                className={cn(
                  "relative flex min-h-9 items-baseline gap-3 rounded-lg px-3 py-1.5 text-sm leading-snug transition-colors duration-150",
                  current
                    ? "bg-accent/10 text-foreground"
                    : "text-muted hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                {current && (
                  <span
                    aria-hidden
                    className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent"
                  />
                )}
                <span
                  aria-hidden
                  className={cn(
                    "font-mono text-[11px] tabular-nums",
                    current ? "text-accent" : "text-muted",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

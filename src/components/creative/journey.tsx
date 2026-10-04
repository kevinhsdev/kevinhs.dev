"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "@/lib/view-models";

type Labels = {
  kinds: Record<TimelineEntry["kind"], string>;
  inProgress: string;
  /** Accessible name of the trail when it scrolls sideways. */
  region: string;
};

const year = (entry: TimelineEntry) => entry.start?.slice(0, 4) ?? null;

/**
 * The journey (oldest → newest) as a horizontal trail. Server-rendered as a
 * row that scrolls sideways; on the client, unless reduced motion is on, the
 * section pins to the screen and vertical scrolling moves the trail, while the
 * axis below fills up to "now". Only transforms change, so it stays smooth.
 */
export function Journey({ entries, labels }: { entries: TimelineEntry[]; labels: Labels }) {
  const root = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    const viewEl = view.current;
    const trackEl = track.current;
    if (!rootEl || !viewEl || !trackEl) return;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let travel = 0;
    let frame = 0;

    const setProgress = (p: number) => {
      rootEl.style.setProperty("--p", String(p));
      const last = entries.length - 1;
      rootEl.querySelectorAll<HTMLElement>("[data-tick]").forEach((tick, index) => {
        tick.dataset.on = String(p >= index / last - 0.01);
      });
    };

    const unpin = () => {
      rootEl.dataset.pinned = "false";
      rootEl.style.height = "";
      trackEl.style.transform = "";
    };

    const measure = () => {
      unpin();
      if (!motion.matches) return update();
      // Pinned, each card is as tall as the screen allows and its photo shrinks to fit.
      // If even the text of some card doesn't fit (a very short window), stay a sideways row.
      rootEl.dataset.pinned = "true";
      const cards = [...trackEl.children] as HTMLElement[];
      if (cards.some((card) => card.scrollHeight > card.clientHeight + 1)) {
        unpin();
        return update();
      }
      travel = Math.max(0, trackEl.scrollWidth - viewEl.clientWidth);
      rootEl.style.height = `${viewEl.clientHeight + travel}px`;
      update();
    };

    const update = () => {
      frame = 0;
      if (rootEl.dataset.pinned === "true") {
        const p = travel
          ? Math.min(1, Math.max(0, -rootEl.getBoundingClientRect().top / travel))
          : 0;
        trackEl.style.transform = `translate3d(${-p * travel}px, 0, 0)`;
        setProgress(p);
      } else {
        const max = viewEl.scrollWidth - viewEl.clientWidth;
        setProgress(max > 0 ? viewEl.scrollLeft / max : 0);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    viewEl.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    motion.addEventListener("change", measure);
    const fonts = document.fonts;
    void fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      viewEl.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      motion.removeEventListener("change", measure);
    };
  }, [entries.length]);

  return (
    <div ref={root} className="journey -mx-4 sm:-mx-8" data-pinned="false">
      <div
        ref={view}
        className="journey-view"
        tabIndex={0}
        role="region"
        aria-label={labels.region}
      >
        <ol ref={track} className="journey-track">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="journey-card"
              data-kind={entry.kind}
              data-wide={entry.highlights.length >= 3 || undefined}
            >
              <div className="journey-media">
                {entry.image ? (
                  // Local files of known size; next/image is not needed for a handful of photos.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.image.src} alt={entry.image.alt} loading="lazy" />
                ) : (
                  <div aria-hidden className="journey-plate">
                    <span className="font-display">{year(entry) ?? "→"}</span>
                    <span className="font-mono text-xs tracking-widest uppercase">
                      {labels.kinds[entry.kind]}
                    </span>
                  </div>
                )}
              </div>
              <div className="journey-text flex flex-col gap-2">
                <span className="font-mono text-xs tracking-widest text-accent uppercase">
                  {entry.period}
                </span>
                <h3 className="font-display text-3xl leading-[1.05] text-balance uppercase">
                  <span className={cn(entry.isTodo && "todo")}>{entry.title}</span>
                </h3>
                <p className="text-sm font-medium">
                  {entry.org}
                  {entry.location && <span className="text-muted"> · {entry.location}</span>}
                </p>
                {entry.highlights.length > 0 && (
                  <ul className="journey-highlights text-sm leading-relaxed text-muted">
                    {entry.highlights.map((highlight) => (
                      <li key={highlight} className="text-pretty">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div aria-hidden className="journey-axis">
          <span className="journey-axis-base" />
          <span className="journey-axis-fill" />
          {entries.map((entry, index) => {
            const label = year(entry) ?? labels.inProgress;
            const previous = index > 0 ? (year(entries[index - 1]!) ?? labels.inProgress) : null;
            return (
              <span
                key={entry.id}
                data-tick
                className="journey-tick"
                style={{ left: `${(index / Math.max(1, entries.length - 1)) * 100}%` }}
              >
                {label !== previous && <span className="journey-tick-label">{label}</span>}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

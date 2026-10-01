"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "@/lib/view-models";

type Filter = TimelineEntry["kind"] | "all";

/** The timeline as a git log: newest entry has the highest number. Filtering is instant. */
export function GitLog({
  entries,
  filterLabels,
  filterGroupLabel,
}: {
  entries: TimelineEntry[];
  filterLabels: Record<Filter, string>;
  filterGroupLabel: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? entries : entries.filter((entry) => entry.kind === filter);

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label={filterGroupLabel} className="flex flex-wrap gap-2">
        {(["all", "work", "study", "event"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              "h-11 rounded-full border px-5 font-mono text-xs tracking-widest uppercase transition-[background-color,color,border-color,scale] duration-150 active:scale-[0.97]",
              filter === value
                ? "border-accent bg-accent text-accent-contrast"
                : "border-border text-muted hover:border-foreground hover:text-foreground",
            )}
          >
            {filterLabels[value]}
          </button>
        ))}
      </div>

      <ol className="border-t border-border">
        {visible.map((entry, index) => (
          <li
            key={entry.id}
            className="enter-fade group grid gap-2 border-b border-border py-6 sm:grid-cols-[5rem_12rem_1fr] sm:gap-8"
          >
            <span className="font-display text-4xl whitespace-nowrap text-muted transition-colors duration-200 group-hover:text-accent">
              #{String(visible.length - index).padStart(2, "0")}
            </span>
            <span className="pt-1 font-mono text-xs tracking-wide text-muted uppercase">
              {entry.period}
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg leading-snug font-semibold">
                <span className={cn(entry.isTodo && "todo")}>{entry.title}</span>
                <span className="font-normal text-muted"> · {entry.org}</span>
              </h3>
              {entry.highlights.length > 0 && (
                <ul className="flex flex-col gap-1.5 text-sm leading-relaxed text-muted">
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
    </div>
  );
}

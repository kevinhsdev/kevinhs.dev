"use client";

import { ChevronDown, FileCode2, Folder } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type SkillLevel = { id: string; label: string; items: string[] };

/** "Uso no dia a dia" → "uso-no-dia-a-dia": reads like a file in the explorer. */
function toFileName(label: string) {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ROW = 52; // px, one explorer row (≥44px touch target)

/**
 * Skills as an editor's file explorer (tabs pattern): a `skills/` folder with
 * one file per level. The highlight slides to the open file and its skills
 * cascade in. Arrow keys move between files.
 */
export function SkillsExplorer({
  levels,
  label,
  hint,
}: {
  levels: SkillLevel[];
  label: string;
  hint: string;
}) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = levels[active];

  function onKeyDown(event: KeyboardEvent) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (active + step + levels.length) % levels.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="grid overflow-hidden rounded-3xl border border-border bg-surface lg:grid-cols-[20rem_1fr]">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:border-r lg:border-b-0">
        <p className="flex items-center gap-2 px-2 font-mono text-xs tracking-widest text-muted uppercase">
          <ChevronDown aria-hidden className="size-3.5" />
          <Folder aria-hidden className="size-3.5" />
          skills/
        </p>
        <div
          role="tablist"
          aria-label={label}
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          className="relative flex flex-col"
        >
          {/* Sliding highlight (transform only) under the open file. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 rounded-xl bg-accent/12 transition-transform duration-500 ease-out-quint"
            style={{ height: ROW, transform: `translateY(${active * ROW}px)` }}
          >
            <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-accent" />
          </span>
          {levels.map((level, index) => {
            const selected = index === active;
            return (
              <button
                key={level.id}
                ref={(element) => {
                  tabs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`skills-${level.id}`}
                aria-selected={selected}
                aria-controls={`skills-panel-${level.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                style={{ height: ROW }}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-4 text-left font-mono text-sm transition-colors duration-200",
                  selected ? "text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                <FileCode2
                  aria-hidden
                  className={cn("size-4 shrink-0", selected ? "text-accent" : "text-muted")}
                />
                <span className="min-w-0 flex-1 truncate">{toFileName(level.label)}</span>
                <span className="text-xs text-muted tabular-nums">{level.items.length}</span>
              </button>
            );
          })}
        </div>
        <p className="px-2 pt-2 text-xs text-muted">{hint}</p>
      </div>

      {current && (
        <div
          key={current.id}
          role="tabpanel"
          id={`skills-panel-${current.id}`}
          aria-labelledby={`skills-${current.id}`}
          className="flex flex-col gap-8 p-6 sm:p-10"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-xs tracking-wide text-muted">
              skills / <span className="text-accent">{toFileName(current.label)}</span>
            </p>
            <p className="text-sm font-semibold">{current.label}</p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {current.items.map((item, index) => (
              <li
                key={item}
                className="cascade-item font-display text-4xl sm:text-6xl"
                style={{ ["--i" as string]: index }}
              >
                {item}
                {index < current.items.length - 1 && (
                  <span aria-hidden className="ml-5 text-accent">
                    ·
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

"use client";

import { ChevronDown, FileText, Folder } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { earnAchievement } from "@/components/shared/visitor-achievements-data";
import { cn } from "@/lib/utils";
import { skillMarks, type SkillMark } from "./skill-marks";
import { TechLogo } from "./tech-logo";

/** `key` is the skill's English name (it looks up the mark); `label` is what's shown. */
export type SkillLevel = { id: string; label: string; items: { key: string; label: string }[] };

/** A technology's full-color logo, or a concept's stroke icon. */
function SkillMarkView({ mark }: { mark: SkillMark | undefined }) {
  if (!mark) return <span aria-hidden className="skills-mark" />;
  if ("icon" in mark) return <mark.icon aria-hidden className="skills-mark skills-icon" />;
  return <TechLogo logo={mark.logo} dark={mark.dark} className="skills-mark" />;
}

/** "Uso no dia a dia" → "uso-no-dia-a-dia.md": reads like a file in the explorer. */
function toFileName(label: string) {
  const slug = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug}.md`;
}

const ROW = 52; // px, one explorer row (≥44px touch target)

/**
 * Skills as an editor (tabs pattern): a `skills/` folder with one file per
 * level on the left, and the open file on the right, one skill per numbered
 * line in display type. Same window chrome as the hero editor. The highlight
 * slides to the open file and its lines cascade in. Arrow keys move between files.
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
  // every file opened at least once earns the "stack" trophy
  const opened = useRef(new Set([0]));
  const current = levels[active];
  // The longest file sets the editor's height, so switching files never moves the page.
  const longest = Math.max(...levels.map((level) => level.items.length));

  function onKeyDown(event: KeyboardEvent) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (active + step + levels.length) % levels.length;
    open(next);
    tabs.current[next]?.focus();
  }

  function open(index: number) {
    setActive(index);
    opened.current.add(index);
    if (opened.current.size === levels.length) earnAchievement("stack");
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_80px_-40px_color-mix(in_srgb,var(--accent)_40%,transparent)]">
      <div
        aria-hidden
        className="flex items-center gap-4 border-b border-border px-4 font-mono text-xs text-muted"
      >
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </span>
        {current && (
          <span className="-mb-px border-b-2 border-accent py-3 text-foreground">
            {toFileName(current.label)}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)]">
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
                  onClick={() => open(index)}
                  style={{ height: ROW }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-4 text-left font-mono text-sm transition-colors duration-200",
                    selected ? "text-foreground" : "text-muted hover:text-foreground",
                  )}
                >
                  <FileText
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
            className="skills-file py-4 sm:py-6"
            style={{
              ["--rows" as string]: longest,
              ["--rows-2" as string]: Math.ceil(longest / 2),
            }}
          >
            <h3 className="sr-only">{current.label}</h3>
            <ol
              className="skills-lines"
              style={{ ["--lines-2" as string]: Math.ceil(current.items.length / 2) }}
            >
              {current.items.map((item, index) => (
                <li key={item.key} className="cascade-item" style={{ ["--i" as string]: index }}>
                  <span aria-hidden className="skills-ln">
                    {index + 1}
                  </span>
                  <SkillMarkView mark={skillMarks[item.key]} />
                  <span className="font-display">{item.label}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div
        aria-hidden
        className="flex justify-between gap-4 border-t border-border px-4 py-2 font-mono text-[10px] tracking-wider text-muted uppercase"
      >
        <span className="truncate">{current?.label}</span>
        <span className="shrink-0">Markdown · UTF-8</span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { Esteira } from "@/components/ui/esteira";
import type { SkillTier } from "@/content";
import "./skills.css";

export type Skill = {
  name: string;
  tier: SkillTier;
  logo?: { file: string; dark?: boolean };
};
type Props = { items: Skill[]; tiers: Record<SkillTier, string>; label: string };
const ORDER: SkillTier[] = ["daily", "experienced", "learning", "concepts"];

export function Logo({ logo, className }: { logo: NonNullable<Skill["logo"]>; className: string }) {
  return (
    <span className={`relative shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG logos */}
      <img
        src={`/skills/${logo.file}.svg`}
        alt=""
        className={`size-full object-contain ${logo.dark ? "dark:hidden" : ""}`}
      />
      {logo.dark && (
        // eslint-disable-next-line @next/next/no-img-element -- dark-theme variant
        <img
          src={`/skills/${logo.file}-dark.svg`}
          alt=""
          className="absolute inset-0 hidden size-full object-contain dark:block"
        />
      )}
    </span>
  );
}

/** The skill's logo, or its initials if it has none. */
function Mark({ s, size }: { s: Skill; size: string }) {
  if (s.logo) return <Logo logo={s.logo} className={size} />;
  const initials = s.name
    .split(/[\s/]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return <b className="ska-initials">{initials}</b>;
}

/** A tool on the belt: its logo and name. */
function Chip({ s }: { s: Skill & { logo: NonNullable<Skill["logo"]> } }) {
  return (
    <span className="sk-chip">
      <Logo logo={s.logo} className="size-6" />
      {s.name}
    </span>
  );
}

/** Every tool on a thin belt, then a row per tier that opens by itself as it scrolls into view. */
export function SkillsView({ items, tiers, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLDetailsElement).open = true;
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    ref.current!.querySelectorAll("details").forEach((d) => io.observe(d));
    return () => io.disconnect();
  }, []);

  const chips = items
    .filter((s): s is Skill & { logo: NonNullable<Skill["logo"]> } => !!s.logo)
    .map((s) => <Chip key={s.name} s={s} />);
  const half = Math.ceil(chips.length / 2);
  return (
    <>
      <Esteira label={label} rows={[chips.slice(0, half), chips.slice(half)]} />
      <div ref={ref} className="ska mx-auto mt-16 max-w-7xl px-5 sm:px-8 lg:mt-24">
        {ORDER.map((k, i) => {
          const list = items.filter((s) => s.tier === k);
          return (
            <details key={k} className="ska-item" data-tier={k}>
              <summary className="ska-head">
                <span className="ska-num">0{i + 1}</span>
                <span className="ska-name">{tiers[k]}</span>
                <span className="ska-peek" aria-hidden>
                  {list.slice(0, 6).map((s) => (
                    <span key={s.name}>
                      <Mark s={s} size="size-4" />
                    </span>
                  ))}
                </span>
                <span className="ska-count">{list.length}</span>
                <span className="ska-chev" aria-hidden />
              </summary>
              <div className="ska-body" data-num={`0${i + 1}`}>
                <ul className="ska-tiles">
                  {list.map((s, j) => (
                    <li
                      key={s.name}
                      className="ska-tile"
                      style={{ "--i": j } as React.CSSProperties}
                    >
                      <Mark s={s} size="size-9" />
                      <span className="ska-tile__name">{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}

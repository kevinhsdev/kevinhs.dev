import { Award, Briefcase, Languages, Lock, Trophy, Users, type LucideProps } from "lucide-react";
import type { AchievementKind, AchievementStatus } from "@/content";

const icons = {
  cert: Award,
  event: Users,
  language: Languages,
  career: Briefcase,
  competition: Trophy,
} as const;

/** The stroke icon for an achievement; locked goals show a padlock. */
export function AchievementIcon({
  kind,
  status,
  ...props
}: { kind: AchievementKind; status: AchievementStatus } & LucideProps) {
  const Icon = status === "locked" ? Lock : icons[kind];
  return <Icon aria-hidden {...props} />;
}

const metals = {
  unlocked: { light: "#fff6d2", mid: "#f6c443", dark: "#b67c12", deep: "#7a4f07" },
  progress: { light: "#ffffff", mid: "#cfd8e8", dark: "#8794b0", deep: "#55607a" },
  locked: {
    light: "rgba(220,235,255,.45)",
    mid: "rgba(200,220,255,.16)",
    dark: "rgba(170,195,240,.10)",
    deep: "rgba(150,175,230,.08)",
  },
} as const;

const bowl = "M24 12H76V36C76 58 64 72 50 74C36 72 24 58 24 36Z";

/**
 * A trophy drawn so its state reads at a glance: polished gold, silver for in
 * progress, clear glass with an engraved "?" for a goal. `uid` keeps gradient
 * ids unique when many trophies share a page.
 */
export function TrophyCup({
  status,
  uid,
  className,
}: {
  status: AchievementStatus;
  uid: string;
  className?: string;
}) {
  const m = metals[status];
  const g = `tc-${uid}`;
  const glass = status === "locked";
  const stroke = glass ? "rgba(210,228,255,.55)" : "rgba(60,35,0,.25)";
  return (
    <svg viewBox="0 0 100 124" aria-hidden className={className}>
      <defs>
        <linearGradient id={`${g}-body`} x1="0" x2="1">
          <stop offset="0" stopColor={m.dark} />
          <stop offset=".28" stopColor={m.light} />
          <stop offset=".55" stopColor={m.mid} />
          <stop offset="1" stopColor={m.deep} />
        </linearGradient>
        <linearGradient id={`${g}-rim`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={m.light} />
          <stop offset="1" stopColor={m.dark} />
        </linearGradient>
        <linearGradient id={`${g}-shine`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity={glass ? 0.35 : 0.75} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${g}-clip`}>
          <path d={bowl} />
        </clipPath>
      </defs>

      {/* handles */}
      <g fill="none" stroke={`url(#${g}-body)`} strokeWidth="5" strokeLinecap="round">
        <path d="M25 20C10 19 8 42 27 48" />
        <path d="M75 20C90 19 92 42 73 48" />
      </g>
      {/* bowl, rim, stem, base */}
      <path d={bowl} fill={`url(#${g}-body)`} stroke={stroke} />
      <ellipse cx="50" cy="12" rx="26" ry="4.5" fill={`url(#${g}-rim)`} stroke={stroke} />
      <path d="M44 73H56L54 88H46Z" fill={`url(#${g}-body)`} stroke={stroke} />
      <rect x="39" y="86" width="22" height="6" rx="2" fill={`url(#${g}-rim)`} stroke={stroke} />
      <path d="M31 94H69L73 106H27Z" fill={`url(#${g}-body)`} stroke={stroke} />
      {/* plinth with a small plate */}
      <rect
        x="22"
        y="105"
        width="56"
        height="15"
        rx="2.5"
        fill={glass ? "rgba(160,180,220,.12)" : "#211812"}
      />
      <rect
        x="38"
        y="109"
        width="24"
        height="6"
        rx="1"
        fill={glass ? "rgba(210,228,255,.25)" : m.mid}
      />

      {glass ? (
        <>
          <text
            x="50"
            y="49"
            textAnchor="middle"
            fontSize="22"
            fontWeight="800"
            fill="rgba(225,238,255,.7)"
          >
            ?
          </text>
          <path
            d="M33 18C32 34 36 50 44 60"
            fill="none"
            stroke="rgba(255,255,255,.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <path
          d="M50 26l3.5 7.2 7.9 1.1-5.7 5.6 1.4 7.9-7.1-3.8-7.1 3.8 1.4-7.9-5.7-5.6 7.9-1.1z"
          fill={m.dark}
          opacity=".55"
        />
      )}
      {/* a band of light that sweeps across the bowl */}
      <g clipPath={`url(#${g}-clip)`}>
        <rect className="tc-shine" x="-30" y="0" width="22" height="80" fill={`url(#${g}-shine)`} />
      </g>
    </svg>
  );
}

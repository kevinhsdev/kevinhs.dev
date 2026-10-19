import { useId, type ReactNode } from "react";
import type { VisitorAchievementId } from "@/components/shared/visitor-achievements-data";

/*
 * The trophies' icons on the normal theme: small vector illustrations with
 * soft gradients, each with its own loop (the globe turns under a plane, a
 * page flips, the terminal types…). Animations are `tm-*` classes in
 * visitor-achievements.css; under reduced motion they hold still. The arcade
 * theme shows the pixel versions instead (trophy-icons.tsx).
 */

type Draw = (id: (name: string) => string) => ReactNode;

/** Land masses for the globe; drawn twice, 30 apart, so the loop is seamless. */
const LAND =
  "M2 15c2-3 6-4 8-2s0 5-3 6-6 0-5-4zM13 24c3-1 6 1 6 4s-2 7-5 6-3-7-1-10zM20 12c2-2 5-1 6 1s-1 4-3 4-4-3-3-5z";

const ICONS: Record<VisitorAchievementId, Draw> = {
  tourist: (id) => (
    <>
      <defs>
        <radialGradient id={id("sea")} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset=".55" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e3a8a" />
        </radialGradient>
        <clipPath id={id("ball")}>
          <circle cx="24" cy="25" r="14" />
        </clipPath>
      </defs>
      <circle cx="24" cy="25" r="14" fill={`url(#${id("sea")})`} />
      <g clipPath={`url(#${id("ball")})`}>
        <g className="tm-drift" fill="#4ade80">
          <path d={LAND} transform="translate(8 6)" />
          <path d={LAND} transform="translate(38 6)" />
        </g>
        <circle cx="19" cy="19" r="9" fill="#fff" opacity=".18" />
      </g>
      <g className="tm-orbit">
        <path
          d="M21 6.5h6l2.5-1.6h1.2l-1.3 2.1 1.3 2.1h-1.2L27 7.5h-6z M23.5 6.5l-1.8-3h1.4l3.2 3zM23.5 7.5l-1.8 3h1.4l3.2-3z"
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth=".5"
        />
      </g>
    </>
  ),
  reader: (id) => (
    <>
      <defs>
        <linearGradient id={id("cover")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id={id("page")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <path
        d="M24 15c-6-4-13-4-18-2v26c5-2 12-2 18 2 6-4 13-4 18-2V13c-5-2-12-2-18 2z"
        fill={`url(#${id("cover")})`}
      />
      <path d="M24 15c-5-3-11-3-16-2v23c5-1 11-1 16 2z" fill="#fff" />
      <path d="M24 15c5-3 11-3 16-2v23c-5-1-11-1-16 2z" fill="#f1f5f9" />
      <g stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round">
        <path d="M11 19h9M11 23h9M11 27h7M28 19h9M28 23h9M28 27h7" />
      </g>
      <path
        className="tm-flip"
        d="M24 15c5-3 11-3 16-2v23c-5-1-11-1-16 2z"
        fill={`url(#${id("page")})`}
        stroke="#cbd5e1"
        strokeWidth=".6"
      />
    </>
  ),
  hacker: (id) => (
    <>
      <defs>
        <linearGradient id={id("screen")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e293b" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
      </defs>
      <rect x="5" y="9" width="38" height="30" rx="5" fill={`url(#${id("screen")})`} />
      <path d="M10 9h28a5 5 0 0 1 5 5H5a5 5 0 0 1 5-5z" fill="#334155" />
      <circle cx="9.5" cy="11.6" r="1.1" fill="#f87171" />
      <circle cx="13" cy="11.6" r="1.1" fill="#fbbf24" />
      <circle cx="16.5" cy="11.6" r="1.1" fill="#4ade80" />
      <path
        d="M10 20l3.5 2.5L10 25"
        fill="none"
        stroke="#4ade80"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="17" y="21.4" width="14" height="2.4" rx="1.2" fill="#38bdf8" opacity=".85" />
      <rect className="tm-type" x="10" y="29" width="22" height="2.4" rx="1.2" fill="#4ade80" />
      <rect className="tm-caret" x="33.5" y="28.4" width="2" height="3.6" fill="#e2e8f0" />
    </>
  ),
  stack: () => (
    <>
      <g>
        <path d="M24 30l16 6-16 6-16-6z" fill="#1d4ed8" />
        <path d="M24 28l16 6-16 6-16-6z" fill="#3b82f6" />
      </g>
      <g>
        <path d="M24 22l16 6-16 6-16-6z" fill="#6d28d9" />
        <path d="M24 20l16 6-16 6-16-6z" fill="#8b5cf6" />
      </g>
      <g className="tm-drop">
        <path d="M24 14l16 6-16 6-16-6z" fill="#d97706" />
        <path d="M24 12l16 6-16 6-16-6z" fill="#fbbf24" />
      </g>
    </>
  ),
  konami: (id) => (
    <>
      <defs>
        <linearGradient id={id("pad")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#64748b" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <path
        d="M15 15h18c5 0 8 4 9 10l1.2 6.5c.8 4.6-4.4 6.8-7.4 3.2L32 31H16l-3.8 3.7c-3 3.6-8.2 1.4-7.4-3.2L6 25c1-6 4-10 9-10z"
        fill={`url(#${id("pad")})`}
      />
      <path className="tm-dpad" d="M13 21h3v3h3v3h-3v3h-3v-3h-3v-3h3z" fill="#e2e8f0" />
      <circle className="tm-press" cx="33" cy="21.5" r="2" fill="#f87171" />
      <circle
        className="tm-press"
        cx="37"
        cy="25.5"
        r="2"
        fill="#60a5fa"
        style={{ animationDelay: ".25s" }}
      />
      <circle
        className="tm-press"
        cx="33"
        cy="29.5"
        r="2"
        fill="#4ade80"
        style={{ animationDelay: ".5s" }}
      />
      <circle
        className="tm-press"
        cx="29"
        cy="25.5"
        r="2"
        fill="#fbbf24"
        style={{ animationDelay: ".75s" }}
      />
    </>
  ),
  duality: (id) => (
    <>
      <defs>
        <radialGradient id={id("sun")} cx="40%" cy="35%">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset=".6" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
        <linearGradient id={id("moon")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0e7ff" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <g className="tm-day">
        <g className="tm-rays" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round">
          <path d="M24 5v4M24 39v4M5 24h4M39 24h4M10.6 10.6l2.8 2.8M34.6 34.6l2.8 2.8M10.6 37.4l2.8-2.8M34.6 13.4l2.8-2.8" />
        </g>
        <circle cx="24" cy="24" r="9" fill={`url(#${id("sun")})`} />
      </g>
      <g className="tm-night">
        <path d="M27 10a14 14 0 1 0 11 22A12 12 0 0 1 27 10z" fill={`url(#${id("moon")})`} />
        <path
          d="M36 11l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8zM40 20l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z"
          fill="#fde68a"
        />
      </g>
    </>
  ),
  polyglot: () => (
    <>
      <g className="tm-say">
        <path
          d="M10 8h18a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5H17l-5 4v-4h-2a5 5 0 0 1-5-5v-7a5 5 0 0 1 5-5z"
          fill="#3b82f6"
        />
        <text
          x="19"
          y="20.5"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="#fff"
          fontFamily="system-ui, sans-serif"
        >
          Oi
        </text>
      </g>
      <g className="tm-say" style={{ animationDelay: "-.8s" }}>
        <path
          d="M38 21H20a5 5 0 0 0-5 5v7a5 5 0 0 0 5 5h11l5 4v-4h2a5 5 0 0 0 5-5v-7a5 5 0 0 0-5-5z"
          fill="#10b981"
        />
        <text
          x="29"
          y="33.5"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="#fff"
          fontFamily="system-ui, sans-serif"
        >
          Hi
        </text>
      </g>
    </>
  ),
  collector: (id) => (
    <>
      <defs>
        <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fef08a" />
          <stop offset=".5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="41" rx="10" ry="2" fill="#000" opacity=".15" className="tm-shadow" />
      <g className="tm-coin">
        <circle cx="24" cy="23" r="14" fill={`url(#${id("gold")})`} />
        <circle
          cx="24"
          cy="23"
          r="10.5"
          fill="none"
          stroke="#fde68a"
          strokeWidth="1.4"
          opacity=".8"
        />
        <text
          x="24"
          y="27.5"
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fill="#92400e"
          fontFamily="system-ui, sans-serif"
        >
          K
        </text>
      </g>
    </>
  ),
  boss: (id) => (
    <>
      <defs>
        <radialGradient id={id("bug")} cx="40%" cy="35%">
          <stop offset="0" stopColor="#fca5a5" />
          <stop offset=".6" stopColor="#ef4444" />
          <stop offset="1" stopColor="#991b1b" />
        </radialGradient>
      </defs>
      <g stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round">
        <path className="tm-leg" d="M14 25l-6-3M14 30H7M15 35l-6 3" />
        <path
          className="tm-leg"
          d="M34 25l6-3M34 30h7M33 35l6 3"
          style={{ animationDelay: "-.2s" }}
        />
      </g>
      <ellipse cx="24" cy="30" rx="11" ry="10" fill={`url(#${id("bug")})`} />
      <path d="M24 21v19" stroke="#7f1d1d" strokeWidth="1.2" opacity=".6" />
      <circle cx="24" cy="19" r="6" fill="#991b1b" />
      <circle cx="21.6" cy="18.6" r="1.6" fill="#fff" />
      <circle cx="26.4" cy="18.6" r="1.6" fill="#fff" />
      <circle cx="21.9" cy="18.9" r=".7" fill="#111" />
      <circle cx="26.7" cy="18.9" r=".7" fill="#111" />
      <path
        className="tm-crown"
        d="M18 13l2-6 4 4 4-4 2 6z"
        fill="#fbbf24"
        stroke="#b45309"
        strokeWidth=".8"
        strokeLinejoin="round"
      />
    </>
  ),
  snaker: (id) => (
    <>
      <defs>
        <linearGradient id={id("scale")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#86efac" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
        <clipPath id={id("box")}>
          <rect x="2" y="0" width="34" height="48" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id("box")})`}>
        <path
          className="tm-slither"
          d="M-28 26c4-8 8-8 12 0s8 8 12 0 8-8 12 0 8 8 12 0 8-8 12 0 8 8 12 0"
          fill="none"
          stroke={`url(#${id("scale")})`}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
      <g className="tm-head">
        <ellipse cx="39" cy="26" rx="5" ry="4" fill="#16a34a" />
        <circle cx="40.5" cy="24.5" r="1" fill="#fff" />
        <path d="M44 26h2.5l1 -1M46.5 26l1 1" stroke="#ef4444" strokeWidth=".8" fill="none" />
      </g>
    </>
  ),
  cartographer: () => (
    <>
      <path d="M6 12l11-4 14 4 11-4v28l-11 4-14-4-11 4z" fill="#fde68a" />
      <path d="M17 8v28l14 4V12z" fill="#fcd34d" />
      <path
        className="tm-route"
        d="M10 33c4-2 4-8 9-9s6 4 10 1 4-9 8-11"
        fill="none"
        stroke="#b45309"
        strokeWidth="1.6"
        strokeDasharray="2.5 2.5"
        strokeLinecap="round"
      />
      <g className="tm-pin">
        <path
          d="M37 6a4.5 4.5 0 0 1 4.5 4.5C41.5 14 37 18 37 18s-4.5-4-4.5-7.5A4.5 4.5 0 0 1 37 6z"
          fill="#ef4444"
        />
        <circle cx="37" cy="10.5" r="1.6" fill="#fff" />
      </g>
    </>
  ),
  chatter: (id) => (
    <>
      <defs>
        <linearGradient id={id("bubble")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <path
        d="M12 10h24a7 7 0 0 1 7 7v10a7 7 0 0 1-7 7H20l-8 6v-6a7 7 0 0 1-7-7V17a7 7 0 0 1 7-7z"
        fill={`url(#${id("bubble")})`}
      />
      <circle className="tm-dot" cx="16" cy="22" r="2.4" fill="#fff" />
      <circle
        className="tm-dot"
        cx="24"
        cy="22"
        r="2.4"
        fill="#fff"
        style={{ animationDelay: ".15s" }}
      />
      <circle
        className="tm-dot"
        cx="32"
        cy="22"
        r="2.4"
        fill="#fff"
        style={{ animationDelay: ".3s" }}
      />
    </>
  ),
  invader: (id) => (
    <>
      <defs>
        <linearGradient id={id("ship")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <g className="tm-hover">
        <path d="M19 5l2 3M29 5l-2 3" stroke="#65a30d" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="16" y="8" width="16" height="9" rx="4" fill="#a3e635" />
        <path
          d="M17 17l-2 3M22 17v3M26 17v3M31 17l2 3"
          stroke="#65a30d"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="21" cy="12" r="1.6" fill="#1a2e05" />
        <circle cx="27" cy="12" r="1.6" fill="#1a2e05" />
      </g>
      <rect className="tm-shot" x="23" y="20" width="2" height="5" rx="1" fill="#facc15" />
      <path
        d="M24 26l4 7 7 3v3H13v-3l7-3z"
        fill={`url(#${id("ship")})`}
        stroke="#0369a1"
        strokeWidth=".8"
      />
      <path className="tm-flame" d="M21 39h6l-3 5z" fill="#fb923c" />
    </>
  ),
};

export function ModernTrophyIcon({ id }: { id: VisitorAchievementId }) {
  // useId has colons or guillemets, which url(#…) references don't accept
  const base = useId().replace(/[^\w-]/g, "");
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="tm">
      {ICONS[id]((name) => `${base}${name}`)}
    </svg>
  );
}

/**
 * The platinum trophy: a polished cup on a marble-and-ebony base, with a
 * light sweep across the metal and a few twinkles. `locked` greys it out for
 * the reward preview while the hunt is still on.
 */
export function PlatinumTrophy({ locked = false }: { locked?: boolean }) {
  const base = useId().replace(/[^\w-]/g, "");
  const id = (name: string) => `${base}${name}`;
  return (
    <svg viewBox="0 0 64 72" aria-hidden className={locked ? "pt is-locked" : "pt"}>
      <defs>
        <linearGradient id={id("metal")} x1="0" x2="1">
          <stop offset="0" stopColor="#8a93a6" />
          <stop offset=".22" stopColor="#f4f7fb" />
          <stop offset=".45" stopColor="#b9c1d0" />
          <stop offset=".7" stopColor="#ffffff" />
          <stop offset="1" stopColor="#6f7889" />
        </linearGradient>
        <linearGradient id={id("inner")} x1="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5d6577" />
          <stop offset="1" stopColor="#c7cedb" />
        </linearGradient>
        <linearGradient id={id("wood")} x1="0" x2="1">
          <stop offset="0" stopColor="#1b1a24" />
          <stop offset=".5" stopColor="#3b3948" />
          <stop offset="1" stopColor="#14131b" />
        </linearGradient>
        <linearGradient id={id("plate")} x1="0" x2="1">
          <stop offset="0" stopColor="#b0811f" />
          <stop offset=".5" stopColor="#ffe08a" />
          <stop offset="1" stopColor="#a8700f" />
        </linearGradient>
        <linearGradient id={id("sweep")} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id("cup")}>
          <path d="M14 6h36v6c0 12-7 21-18 22C21 33 14 24 14 12z" />
        </clipPath>
      </defs>
      {/* handles */}
      <path
        d="M15 10H8c-3 0-4 3-3 6 2 6 7 9 12 10M49 10h7c3 0 4 3 3 6-2 6-7 9-12 10"
        fill="none"
        stroke={`url(#${id("metal")})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* cup */}
      <path d="M14 6h36v6c0 12-7 21-18 22C21 33 14 24 14 12z" fill={`url(#${id("metal")})`} />
      <ellipse cx="32" cy="6" rx="18" ry="2.6" fill={`url(#${id("inner")})`} />
      <path
        d="M32 13l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"
        fill="#7b8396"
      />
      <path
        d="M32 12l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"
        fill="#fff"
      />
      <g clipPath={`url(#${id("cup")})`}>
        <rect
          className="pt-sweep"
          x="-14"
          y="0"
          width="12"
          height="40"
          fill={`url(#${id("sweep")})`}
        />
      </g>
      {/* stem and base */}
      <path d="M28 34h8l-1 8c3 1 5 3 5 5H24c0-2 2-4 5-5z" fill={`url(#${id("metal")})`} />
      <rect x="18" y="47" width="28" height="3" rx="1" fill={`url(#${id("metal")})`} />
      <path d="M15 50h34l2 16H13z" fill={`url(#${id("wood")})`} />
      <rect x="22" y="54" width="20" height="7" rx="1" fill={`url(#${id("plate")})`} />
      <rect x="25" y="57" width="14" height="1.2" rx=".6" fill="#7a5208" />
      <rect x="11" y="66" width="42" height="3" rx="1" fill="#0d0c12" />
      {/* twinkles */}
      <path className="pt-spark" d="M9 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#fff" />
      <path
        className="pt-spark"
        d="M56 26l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"
        fill="#fff"
      />
      <path
        className="pt-spark"
        d="M52 1l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"
        fill="#ffe08a"
      />
    </svg>
  );
}

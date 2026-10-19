import { ArrowUpRight, Flag } from "lucide-react";
import type { CSSProperties } from "react";
import { achievements, pick, type Achievement } from "@/content";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { AchievementIcon, TrophyCup } from "./achievement-icon";
import {
  attributes,
  branches,
  branchOf,
  formatMonth,
  journeyOrder,
  level,
  maxScore,
  rarity,
  score,
  unlocked,
  yearlyScores,
} from "./achievements-model";

// PROTOTYPE: alternative Achievements views, to compare. Copy is inline PT/EN
// on purpose until one is chosen; then it moves to messages/*.json.

const L = (locale: Locale, pt: string, en: string) => (locale === "pt" ? pt : en);
const vars = (v: Record<string, string | number>) => v as CSSProperties;
const statusLabel = (a: Achievement, locale: Locale) =>
  a.status === "unlocked"
    ? L(locale, "Desbloqueada", "Unlocked")
    : a.status === "progress"
      ? L(locale, "Em andamento", "In progress")
      : L(locale, "Objetivo", "Goal");
const detail = (a: Achievement, locale: Locale) =>
  a.status === "locked" && a.hint
    ? pick(a.hint, locale)
    : [a.org, formatMonth(a.date, locale)].filter(Boolean).join(" · ");

/* ---------- 5. Trophy shelf: a lit glass cabinet ---------- */
export function ShelfView({ locale, perRow = 4 }: { locale: Locale; perRow?: number }) {
  const rows: Achievement[][] = [];
  for (let i = 0; i < achievements.length; i += perRow)
    rows.push(achievements.slice(i, i + perRow));
  let n = 0;
  return (
    <div className="lab-cabinet" style={vars({ "--cols": perRow })}>
      <span className="lab-cabinet-led" aria-hidden />
      {rows.map((row, r) => (
        <div key={r} className="lab-shelf-level">
          <ul className="lab-shelf-row">
            {row.map((a) => (
              <li
                key={a.id}
                className={cn("lab-trophy lab-rise", `is-${a.status}`)}
                style={vars({ "--i": n++ })}
                tabIndex={0}
                data-tilt
              >
                <span className="lab-beam" aria-hidden />
                <span className="lab-cup-wrap">
                  <TrophyCup status={a.status} uid={a.id} className="lab-cup" />
                  <TrophyCup status={a.status} uid={`${a.id}-r`} className="lab-cup-reflection" />
                </span>
                <span className="lab-plaque">{pick(a.title, locale)}</span>
                <span className="lab-card-tip" role="tooltip">
                  <span className={cn("lab-pill", `is-${a.status}`)}>{statusLabel(a, locale)}</span>
                  <b>{pick(a.title, locale)}</b>
                  <span>{detail(a, locale)}</span>
                  <em>+{a.xp} XP</em>
                </span>
              </li>
            ))}
          </ul>
          <div className="lab-glass-shelf" aria-hidden />
        </div>
      ))}
    </div>
  );
}

/* ---------- 7. World map: an illustrated path of stages; goals sit in the fog ---------- */
function curve(list: { x: number; y: number }[]) {
  return list
    .map((p, i) => {
      const prev = list[i - 1];
      if (!prev) return `M${p.x} ${p.y}`;
      const mid = (prev.x + p.x) / 2;
      return `C${mid} ${prev.y} ${mid} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");
}

export function MapView({ locale }: { locale: Locale }) {
  const step = 180;
  const H = 360;
  const pts = journeyOrder.map((a, i) => ({ a, x: 90 + i * step, y: i % 2 ? 230 : 120 }));
  const width = (pts.at(-1)?.x ?? 0) + 140;
  const current = pts.reduce((last, p, i) => (p.a.status !== "locked" ? i : last), 0);
  const firstLocked = pts.findIndex((p) => p.a.status === "locked");
  const hills = (base: number, amp: number, period: number, phase: number) => {
    let d = `M0 ${H}L0 ${base}`;
    for (let x = 0; x <= width + period; x += period / 8) {
      const y = base + Math.sin((x / period) * Math.PI * 2 + phase) * amp;
      d += `L${x.toFixed(0)} ${y.toFixed(1)}`;
    }
    return `${d}L${width + period} ${H}Z`;
  };
  const trees = Array.from({ length: Math.floor(width / 110) }, (_, i) => ({
    x: 30 + i * 110 + (i % 3) * 24,
    y: 312 + (i % 2) * 18,
    s: 0.75 + (i % 3) * 0.2,
  }));
  return (
    <div className="lab-map" data-lenis-prevent>
      <div className="lab-map-world" style={{ width, height: H }}>
        <span className="lab-sun" aria-hidden />
        <span className="lab-cloud" style={vars({ "--t": "0s", top: "26px" })} aria-hidden />
        <span
          className="lab-cloud is-small"
          style={vars({ "--t": "-16s", top: "74px" })}
          aria-hidden
        />
        <span className="lab-cloud" style={vars({ "--t": "-32s", top: "44px" })} aria-hidden />
        <svg className="lab-map-art" width={width} height={H} aria-hidden>
          <path d={hills(236, 20, 520, 0)} className="lab-hill is-back" />
          <path d={hills(280, 14, 360, 1.4)} className="lab-hill is-mid" />
          <path d={hills(322, 9, 260, 2.2)} className="lab-hill is-front" />
          {trees.map((t, i) => (
            <g
              key={i}
              transform={`translate(${t.x} ${t.y}) scale(${t.s})`}
              className="lab-tree-icon"
            >
              <rect x="-3" y="0" width="6" height="14" rx="2" className="trunk" />
              <circle cx="0" cy="-9" r="13" />
              <circle cx="-9" cy="-1" r="9" />
              <circle cx="9" cy="-1" r="9" />
            </g>
          ))}
          <path d={curve(pts)} className="lab-road" />
          <path d={curve(pts)} className="lab-road-dash" pathLength={100} />
          <path d={curve(pts.slice(0, current + 1))} className="lab-road-done" pathLength={1} />
        </svg>
        {pts[firstLocked] && (
          <div className="lab-map-fog" style={{ left: pts[firstLocked].x - 90 }} aria-hidden>
            <i />
            <i />
            <i />
          </div>
        )}
        {pts.map(({ a, x, y }, i) => {
          const castle = a.kind === "career";
          return (
            <div
              key={a.id}
              className={cn("lab-stage", `is-${a.status}`, castle && "is-castle")}
              style={vars({ left: x, top: y, "--i": i })}
            >
              {i === current && (
                <svg
                  className="lab-hero"
                  viewBox="0 0 32 40"
                  role="img"
                  aria-label={L(locale, "Você está aqui", "You are here")}
                >
                  <ellipse cx="16" cy="38" rx="9" ry="2.5" fill="rgba(0,0,0,.25)" />
                  <rect x="8" y="16" width="16" height="16" rx="5" fill="#1d4ed8" />
                  <text
                    x="16"
                    y="28"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="800"
                    fill="#fff"
                  >
                    K
                  </text>
                  <circle cx="16" cy="10" r="8" fill="#f2c9a0" />
                  <path d="M8 9c0-6 16-7 16 0-3-2-12-2-16 0Z" fill="#2b1d14" />
                  <rect x="10" y="31" width="4" height="6" rx="2" fill="#1e293b" />
                  <rect x="18" y="31" width="4" height="6" rx="2" fill="#1e293b" />
                </svg>
              )}
              {castle ? (
                <svg className="lab-castle" viewBox="0 0 80 80" aria-hidden>
                  <path d="M12 34h56v40H12z" fill="#8f7ad8" />
                  <path d="M8 28h16v46H8zM56 28h16v46H56z" fill="#7a63c9" />
                  <path d="M8 28l8-14 8 14zM56 28l8-14 8 14z" fill="#e2564c" />
                  <path d="M28 34V18h24v16z" fill="#a08ee3" />
                  <path d="M28 18l12-14 12 14z" fill="#e2564c" />
                  <path d="M40 4V0" stroke="#333" />
                  <path d="M40 0l10 3-10 3z" fill="#ffd23f" className="lab-castle-flag" />
                  <path d="M34 74V58a6 6 0 0 1 12 0v16z" fill="#3b2a6b" />
                  <circle cx="16" cy="44" r="3" fill="#3b2a6b" />
                  <circle cx="64" cy="44" r="3" fill="#3b2a6b" />
                </svg>
              ) : (
                <span className="lab-stage-dot">
                  {a.status === "unlocked" ? (
                    <Flag aria-hidden className="size-5" />
                  ) : (
                    <AchievementIcon kind={a.kind} status={a.status} className="size-5" />
                  )}
                </span>
              )}
              <span className="lab-stage-label">
                <small>
                  {castle
                    ? L(locale, "Chefão final", "Final boss")
                    : `${L(locale, "Fase", "Stage")} ${i + 1}`}
                </small>
                {pick(a.title, locale)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- 8. Skill tree: orbits, branches that draw themselves, sparks along the lit ones ---------- */
export function TreeView({ locale }: { locale: Locale }) {
  const size = 980;
  const c = size / 2;
  type TreeNode = { a: Achievement; x: number; y: number; px: number; py: number; order: number };
  const nodes: TreeNode[] = [];
  const labels: { text: string; x: number; y: number }[] = [];
  const rank = (s: Achievement["status"]) => ["unlocked", "progress", "locked"].indexOf(s);
  branches.forEach((b, bi) => {
    const angle = (bi / branches.length) * Math.PI * 2 - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    labels.push({ text: b[locale], x: c + cos * 126, y: c + sin * 126 });
    let px = c + cos * 66;
    let py = c + sin * 66;
    achievements
      .filter((a) => branchOf(a) === b.id)
      .sort((x, y) => rank(x.status) - rank(y.status))
      .forEach((a, i) => {
        const r = 220 + i * 100;
        const x = c + cos * r;
        const y = c + sin * r;
        nodes.push({ a, x, y, px, py, order: nodes.length });
        px = x;
        py = y;
      });
  });
  const wrap = (text: string) => {
    const lines = [""];
    for (const w of text.split(" ")) {
      const next = `${lines.at(-1)} ${w}`.trim();
      if (next.length > 16 && lines.at(-1)) lines.push(w);
      else lines[lines.length - 1] = next;
    }
    return lines;
  };
  const lv = level();
  // labels sit on the outer side of each node: above it on the upper branches, below on the lower
  const labelYs = (n: { a: Achievement; y: number }) => {
    const lines = wrap(pick(n.a.title, locale));
    const up = n.y < c - 1;
    return lines.map((_, i) => (up ? n.y - 42 - (lines.length - 1 - i) * 15 : n.y + 52 + i * 15));
  };
  return (
    <div className="lab-tree">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={L(locale, "Árvore de conquistas", "Achievement tree")}
      >
        <defs>
          <radialGradient id="lt-core" cx=".35" cy=".3">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
            <stop offset=".35" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity=".85" />
          </radialGradient>
        </defs>
        {[150, 270, 370].map((r, i) => (
          <circle
            key={r}
            cx={c}
            cy={c}
            r={r}
            className="lt-orbit"
            style={vars({ "--d": `${70 + i * 30}s`, transformOrigin: `${c}px ${c}px` })}
          />
        ))}
        {nodes.map(({ a, x, y, px, py, order }) => (
          <line
            key={`l-${a.id}`}
            x1={px}
            y1={py}
            x2={x}
            y2={y}
            pathLength={1}
            className={cn("lt-edge", `is-${a.status}`)}
            style={vars({ "--i": order })}
          />
        ))}
        {nodes
          .filter((n) => n.a.status === "unlocked")
          .map(({ a, x, y, px, py }, i) => (
            <circle key={`p-${a.id}`} r="3.5" className="lt-spark">
              <animateMotion
                dur={`${2.2 + (i % 3) * 0.4}s`}
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
                path={`M${px} ${py}L${x} ${y}`}
              />
            </circle>
          ))}
        <circle cx={c} cy={c} r="76" className="lt-core-halo" />
        <circle cx={c} cy={c} r="60" fill="url(#lt-core)" />
        <g className="lt-moon" style={vars({ transformOrigin: `${c}px ${c}px` })}>
          <circle cx={c + 76} cy={c} r="5" />
        </g>
        <text x={c} y={c - 4} textAnchor="middle" className="lt-core-name">
          KEVIN
        </text>
        <text x={c} y={c + 20} textAnchor="middle" className="lt-core-level">
          {L(locale, "Nível", "Level")} {lv.level}
        </text>
        {labels.map((l) => (
          <text key={l.text} x={l.x} y={l.y + 4} textAnchor="middle" className="lt-branch">
            {l.text}
          </text>
        ))}
        {nodes.map(({ a, x, y, order }) => (
          <g
            key={a.id}
            className={cn("lt-node", `is-${a.status}`)}
            style={vars({ "--i": order, transformOrigin: `${x}px ${y}px` })}
            tabIndex={0}
          >
            {/* one string: React hydrates a <title> with several text children as a mismatch */}
            <title>
              {`${pick(a.title, locale)} · ${statusLabel(a, locale)}${
                a.status === "locked" && a.hint ? ` · ${pick(a.hint, locale)}` : ""
              }`}
            </title>
            {a.status === "unlocked" && (
              <circle
                cx={x}
                cy={y}
                r="30"
                className="lt-pulse"
                style={vars({ transformOrigin: `${x}px ${y}px` })}
              />
            )}
            <circle cx={x} cy={y} r="28" className="lt-disc" />
            {a.status === "progress" && (
              <circle
                cx={x}
                cy={y}
                r="34"
                className="lt-arc"
                pathLength={100}
                style={vars({ transformOrigin: `${x}px ${y}px` })}
              />
            )}
            <AchievementIcon
              kind={a.kind}
              status={a.status}
              x={x - 11}
              y={y - 11}
              width={22}
              height={22}
            />
            {wrap(pick(a.title, locale)).map((line, i) => (
              <text key={i} x={x} y={labelYs({ a, y })[i]} textAnchor="middle" className="lt-label">
                {line}
              </text>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ---------- 9. Character sheet: XP ring, radar of attributes, inventory ---------- */
export function Radar({ locale }: { locale: Locale }) {
  const attrs = attributes(locale);
  const R = 110;
  const cx = 170;
  const cy = 165;
  const point = (i: number, v: number) => {
    const ang = (i / attrs.length) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(ang) * R * v, cy + Math.sin(ang) * R * v] as const;
  };
  const poly = (fn: (i: number) => number) =>
    attrs
      .map((_, i) =>
        point(i, fn(i))
          .map((n) => n.toFixed(1))
          .join(","),
      )
      .join(" ");
  // scaled to the strongest branch, so the peak is the profile's main attribute
  const top = Math.max(...attrs.map((a) => a.earned), 1);
  const values = attrs.map((a) => Math.max(0.06, a.earned / top));
  return (
    <svg
      viewBox="0 0 340 330"
      role="img"
      aria-label={L(locale, "Gráfico de atributos", "Attribute chart")}
    >
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon key={s} points={poly(() => s)} className="lr-grid" />
      ))}
      {attrs.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="lr-axis" />;
      })}
      <polygon
        points={poly((i) => values[i] ?? 0)}
        className="lr-shape"
        style={vars({ transformOrigin: `${cx}px ${cy}px` })}
      />
      {attrs.map((a, i) => {
        const [x, y] = point(i, values[i] ?? 0);
        return (
          <circle key={a.id} cx={x} cy={y} r="4.5" className="lr-dot" style={vars({ "--i": i })} />
        );
      })}
      {attrs.map((a, i) => {
        const [x, y] = point(i, 1.24);
        return (
          <text key={a.id} x={x} y={y + 4} textAnchor="middle" className="lr-label">
            {a.label}
            <tspan className="lr-value" x={x} dy="14">
              {a.earned} XP
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

export function CharacterView({ locale }: { locale: Locale }) {
  const lv = level();
  return (
    <div className="lab-sheet">
      <section className="lab-sheet-hero lab-rise" style={vars({ "--i": 0 })}>
        <div
          className="lab-avatar-ring"
          style={vars({ "--pct": Math.round((lv.into / lv.size) * 100) })}
        >
          <span className="lab-avatar">K</span>
          <span className="lab-avatar-level">{lv.level}</span>
        </div>
        <div className="lab-sheet-id">
          <p className="lab-sheet-kicker">{L(locale, "Jogador 1", "Player 1")}</p>
          <h3 className="lab-sheet-name">Kevin Henrique</h3>
          <p className="lab-sheet-class">
            {L(locale, "Dev Backend · Júnior", "Backend Dev · Junior")}
          </p>
          <p className="lab-sheet-xp">
            <b>{lv.into}</b>/{lv.size} XP{" "}
            {L(locale, `até o nível ${lv.level + 1}`, `to level ${lv.level + 1}`)}
          </p>
        </div>
        <dl className="lab-sheet-stats">
          <div>
            <dt>{L(locale, "Pontos", "Score")}</dt>
            <dd>{score}</dd>
          </div>
          <div>
            <dt>{L(locale, "Conquistas", "Achievements")}</dt>
            <dd>
              {unlocked.length}/{achievements.length}
            </dd>
          </div>
          <div>
            <dt>{L(locale, "Melhor ano", "Best year")}</dt>
            <dd>{yearlyScores().at(-1)?.year}</dd>
          </div>
        </dl>
      </section>

      <section className="lab-radar lab-rise" style={vars({ "--i": 1 })}>
        <h4>{L(locale, "Atributos", "Attributes")}</h4>
        <Radar locale={locale} />
      </section>

      <section className="lab-inventory lab-rise" style={vars({ "--i": 2 })}>
        <h4>
          {L(locale, "Inventário", "Inventory")}{" "}
          <span>
            {unlocked.length}/{achievements.length}
          </span>
        </h4>
        <ul>
          {achievements.map((a, i) => (
            <li
              key={a.id}
              className={cn("lab-slot lab-rise", `is-${a.status}`)}
              data-rarity={rarity(a.xp)}
              data-tilt
              tabIndex={0}
              style={vars({ "--i": i + 3 })}
            >
              <span className="lab-slot-icon">
                <AchievementIcon
                  kind={a.kind}
                  status={a.status}
                  className="size-7"
                  strokeWidth={1.6}
                />
              </span>
              <span className="lab-card-tip" role="tooltip">
                <span className={cn("lab-pill", `is-${a.status}`)}>{statusLabel(a, locale)}</span>
                <b>{pick(a.title, locale)}</b>
                <span>{detail(a, locale) || L(locale, "Em andamento", "In progress")}</span>
                <em>+{a.xp} XP</em>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------- 11. High scores, Kevin vs Kevin: every past year is a rival ---------- */
export function HighScoreView({ locale }: { locale: Locale }) {
  const years = yearlyScores();
  const now = years.at(-1) ?? { year: 2026, score: 0 };
  const last = years.at(-2);
  const gain = last ? Math.round(((now.score - last.score) / last.score) * 100) : 0;
  const rows = [...years].sort((a, b) => b.score - a.score);
  const ordinal = (n: number) =>
    locale === "pt" ? `${n}º` : (["1ST", "2ND", "3RD"][n - 1] ?? `${n}TH`);
  const thisYear = unlocked.filter((a) => a.date?.startsWith(String(now.year)));
  const top = Math.max(maxScore, 1);
  return (
    <div className="lab-crt">
      <div className="lab-crt-screen">
        <span className="lab-stars" aria-hidden />
        <p className="lab-hi-title font-pixel lab-rise" style={vars({ "--i": 0 })}>
          High scores
        </p>
        <p className="lab-hi-sub font-pixel lab-rise" style={vars({ "--i": 1 })}>
          Kevin vs. Kevin
        </p>

        <div className="lab-hi-grid">
          <table className="lab-hi-table font-pixel">
            <thead>
              <tr>
                <th>{L(locale, "Pos", "Rank")}</th>
                <th>{L(locale, "Nome", "Name")}</th>
                <th>{L(locale, "Pontos", "Score")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.year}
                  className={cn("lab-type", r.year === now.year && "is-now")}
                  style={vars({ "--i": i + 2 })}
                >
                  <td>{ordinal(i + 1)}</td>
                  <td>
                    KEV {r.year}
                    {r.year === now.year && (
                      <span className="lab-new">{L(locale, "Recorde!", "Record!")}</span>
                    )}
                  </td>
                  <td>{String(r.score).padStart(6, "0")}</td>
                </tr>
              ))}
              <tr className="lab-type is-ghost" style={vars({ "--i": rows.length + 2 })}>
                <td>???</td>
                <td>KEV {now.year + 1}</td>
                <td>{String(maxScore).padStart(6, "0")}</td>
              </tr>
            </tbody>
          </table>

          <figure
            className="lab-hi-chart"
            aria-label={L(locale, "Pontos por ano", "Score by year")}
          >
            {years.map((y, i) => (
              <span
                key={y.year}
                style={vars({ "--h": y.score / top, "--i": i })}
                className={cn("lab-bar", y.year === now.year && "is-now")}
              >
                <b className="font-pixel">{y.score}</b>
                <i />
                <small className="font-pixel">{y.year}</small>
              </span>
            ))}
            <span className="lab-bar is-ghost" style={vars({ "--h": 1, "--i": years.length })}>
              <b className="font-pixel">{maxScore}</b>
              <i />
              <small className="font-pixel">{now.year + 1}</small>
            </span>
          </figure>
        </div>

        {last && (
          <p className="lab-hi-vs font-pixel">
            {L(locale, `Você vs. Kevin ${last.year}:`, `You vs. Kevin ${last.year}:`)}{" "}
            <b>+{now.score - last.score}</b> <span>(+{gain}%)</span>
          </p>
        )}

        <div className="lab-hi-bonus">
          <p className="font-pixel">{L(locale, `Bônus de ${now.year}`, `${now.year} bonus`)}</p>
          <ul>
            {thisYear.map((a, i) => (
              <li key={a.id} className="lab-type" style={vars({ "--i": i + 6 })}>
                <span>{pick(a.title, locale)}</span>
                <b className="font-pixel">+{a.xp}</b>
              </li>
            ))}
          </ul>
        </div>

        <a href="#contact" className="lab-hi-enter font-pixel">
          {L(locale, "Insira seu nome", "Enter your name")} <span className="lab-caret">_</span>
          <ArrowUpRight aria-hidden className="size-5" />
        </a>
      </div>
    </div>
  );
}

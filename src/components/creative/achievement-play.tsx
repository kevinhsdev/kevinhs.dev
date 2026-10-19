"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { AchievementIcon } from "./achievement-icon";
import type { PlainAchievement } from "./achievements-model";

// PROTOTYPE: the two interactive Achievements views.

const L = (locale: Locale, pt: string, en: string) => (locale === "pt" ? pt : en);
const vars = (v: Record<string, string | number>) => v as CSSProperties;
/** Random capsule for the claw: outside the component, so render stays pure. */
const randomIndex = (n: number) => Math.floor(Math.random() * n);
const calm = () =>
  typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 6. Notifications: console toasts that pop, expand and stack ---------- */
export function NotificationsView({
  items,
  locale,
}: {
  items: PlainAchievement[];
  locale: Locale;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || timer) return;
        if (calm()) return setShown(items.length);
        setShown(1);
        timer = setInterval(() => {
          setShown((n) => {
            if (n + 1 >= items.length) clearInterval(timer);
            return Math.min(n + 1, items.length);
          });
        }, 1500);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [items.length, run]);

  const arrived = items.slice(0, shown);
  const gamerscore = arrived.filter((a) => a.status === "unlocked").reduce((s, a) => s + a.xp, 0);
  // the newest three float on screen; the rest drop into the notification center
  const live = arrived.slice(-3).reverse();
  const history = arrived.slice(0, -3).reverse();

  return (
    <div ref={box} className="lab-notify">
      <div className="lab-notify-screen">
        <span className="lab-blob is-a" aria-hidden />
        <span className="lab-blob is-b" aria-hidden />
        <div className="lab-notify-top">
          <p>
            {shown < items.length
              ? L(locale, "Sincronizando conquistas", "Syncing achievements")
              : L(locale, "Tudo sincronizado", "All synced")}
            {shown < items.length && <span className="lab-dots" aria-hidden />}
          </p>
          <p className="lab-gamerscore" style={vars({ "--n": gamerscore })}>
            <span className="sr-only">{gamerscore}</span>G
          </p>
        </div>
        <ol className="lab-toasts" aria-live="polite">
          {live.map((a, k) => (
            <li
              key={`${run}-${a.id}`}
              className={cn("lab-toast", `is-${a.status}`)}
              style={vars({ "--k": k })}
            >
              <span className="lab-toast-icon">
                <AchievementIcon kind={a.kind} status={a.status} className="size-6" />
              </span>
              <span className="lab-toast-text">
                <small>
                  {a.status === "unlocked"
                    ? L(locale, "Conquista desbloqueada", "Achievement unlocked")
                    : a.status === "progress"
                      ? L(locale, "Conquista em andamento", "Achievement in progress")
                      : L(locale, "Conquista bloqueada", "Locked achievement")}
                </small>
                <b>{a.status === "locked" ? `??? · ${a.hint}` : a.title}</b>
              </span>
              <span className="lab-toast-xp">{a.status === "locked" ? "" : `${a.xp}G`}</span>
            </li>
          ))}
        </ol>
      </div>
      <aside className="lab-notify-center">
        <div className="lab-notify-head">
          <h3>{L(locale, "Central de notificações", "Notification center")}</h3>
          <button
            type="button"
            className="lab-replay"
            onClick={() => {
              setShown(0);
              setRun((r) => r + 1);
            }}
          >
            <RotateCcw aria-hidden className="size-4" /> {L(locale, "Repetir", "Replay")}
          </button>
        </div>
        <ul className="lab-timeline">
          {history.map((a) => (
            <li key={a.id} className={`is-${a.status}`}>
              <span className="lab-timeline-dot">
                <AchievementIcon kind={a.kind} status={a.status} className="size-3.5" />
              </span>
              <span>
                <b>{a.status === "locked" ? "???" : a.title}</b>
                <small>
                  {a.date ||
                    (a.status === "progress" ? L(locale, "Em andamento", "In progress") : "")}
                </small>
              </span>
              <em>{a.status === "unlocked" ? `+${a.xp}G` : ""}</em>
            </li>
          ))}
          {history.length === 0 && (
            <li className="lab-empty">
              {L(locale, "As antigas aparecem aqui.", "Older ones land here.")}
            </li>
          )}
        </ul>
      </aside>
    </div>
  );
}

/* ---------- 10. Claw machine: prizes won sit in the tray; the goals are still inside ---------- */
export function ClawView({ items, locale }: { items: PlainAchievement[]; locale: Locale }) {
  const won = items.filter((a) => a.status === "unlocked");
  const inside = items.filter((a) => a.status !== "unlocked");
  const [pos, setPos] = useState({ x: 50, down: false, closed: false, lifted: -1 });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<PlainAchievement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // capsules piled in two rows on the floor of the glass, in % of its width/height
  const spots = inside.map((_, i) => ({
    x: 14 + (i % 3) * 26 + (i >= 3 ? 13 : 0),
    y: i < 3 ? 82 : 64,
  }));

  const play = () => {
    if (busy || inside.length === 0) return;
    const i = randomIndex(inside.length);
    const target = spots[i];
    const prize = inside[i];
    if (!target || !prize) return;
    setMessage(null);
    if (calm()) return setMessage(prize);
    setBusy(true);
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    setPos({ x: target.x, down: false, closed: false, lifted: -1 });
    at(850, () => setPos({ x: target.x, down: true, closed: false, lifted: -1 }));
    at(1600, () => setPos({ x: target.x, down: true, closed: true, lifted: -1 }));
    at(1950, () => setPos({ x: target.x, down: false, closed: true, lifted: i }));
    // a goal always slips out of the claw: it is not won yet
    at(2750, () => setPos({ x: target.x, down: false, closed: false, lifted: -1 }));
    at(3150, () => {
      setMessage(prize);
      setPos({ x: 50, down: false, closed: false, lifted: -1 });
      setBusy(false);
    });
  };

  return (
    <div className="lab-claw">
      <div className="lab-claw-machine">
        <div className="lab-claw-marquee">
          <span className="lab-bulbs" aria-hidden>
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} style={vars({ "--i": i })} />
            ))}
          </span>
          <p className="font-pixel">{L(locale, "Pegue uma conquista", "Grab an achievement")}</p>
        </div>
        <div className="lab-claw-glass">
          <span className="lab-claw-rail" aria-hidden />
          <div
            className={cn("lab-claw-arm", pos.down && "is-down", pos.closed && "is-closed")}
            style={{ left: `${pos.x}%` }}
            aria-hidden
          >
            <span className="lab-claw-carriage" />
            <span className="lab-claw-rope" />
            <svg className="lab-claw-head" viewBox="0 0 60 56">
              <rect x="18" y="0" width="24" height="14" rx="4" fill="#9aa3b5" />
              <rect x="22" y="12" width="16" height="8" rx="2" fill="#6b7386" />
              <g className="prong is-left">
                <path
                  d="M26 18 L10 34 L14 52"
                  fill="none"
                  stroke="#8b93a6"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <g className="prong is-mid">
                <path
                  d="M30 18 L30 50"
                  fill="none"
                  stroke="#7a8296"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
              <g className="prong is-right">
                <path
                  d="M34 18 L50 34 L46 52"
                  fill="none"
                  stroke="#8b93a6"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>
          {inside.map((a, i) => (
            <span
              key={a.id}
              className={cn("lab-capsule", `is-${a.status}`, pos.lifted === i && "is-lifted")}
              style={vars({
                left: `${spots[i]?.x ?? 50}%`,
                top: `${spots[i]?.y ?? 50}%`,
                "--i": i,
              })}
              title={a.title}
            >
              <AchievementIcon kind={a.kind} status={a.status} className="size-5" />
            </span>
          ))}
          <span className="lab-claw-chute" aria-hidden />
          <span className="lab-claw-reflect" aria-hidden />
        </div>
        <div className="lab-claw-panel">
          <div className="lab-claw-screen font-pixel" aria-live="polite">
            {message ? (
              <>
                <b>{message.title}</b>
                <span>
                  {message.status === "progress"
                    ? L(locale, "Quase! Ainda em andamento.", "Almost! Still in progress.")
                    : L(
                        locale,
                        `Escorregou! Objetivo: ${message.hint}`,
                        `It slipped! Goal: ${message.hint}`,
                      )}
                </span>
              </>
            ) : (
              <span className="lab-claw-insert">
                {busy
                  ? L(locale, "Pegando...", "Grabbing...")
                  : L(locale, "Aperte para jogar", "Press to play")}
              </span>
            )}
          </div>
          <span className="lab-joystick" aria-hidden>
            <i />
          </span>
          <button
            type="button"
            className="lab-claw-button font-pixel"
            onClick={play}
            disabled={busy}
          >
            {L(locale, "Pegar", "Grab")}
          </button>
        </div>
      </div>
      <div className="lab-claw-tray">
        <p>
          {L(locale, "Prêmios ganhos", "Prizes won")} <b>{won.length}</b>
        </p>
        <ul>
          {won.map((a, i) => (
            <li key={a.id} className="lab-rise" style={vars({ "--i": i })}>
              <span className="lab-capsule is-unlocked">
                <AchievementIcon kind={a.kind} status={a.status} className="size-5" />
              </span>
              <span>
                <b>{a.title}</b>
                <small>{[a.org, a.date].filter(Boolean).join(" · ")}</small>
              </span>
              <em>+{a.xp}</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { TrophyIcon } from "@/components/shared/trophy-icons";
import { PlatinumTrophy } from "@/components/shared/trophy-icons-modern";
import {
  LOCALES_KEY,
  onEarn,
  onReset,
  PAGES_KEY,
  readList,
  readUnlocked,
  saveUnlocked,
  TOURIST_PAGES,
  visitorAchievements as defs,
  writeList,
  type VisitorAchievementId as Id,
} from "@/components/shared/visitor-achievements-data";
import "@/styles/arcade.css";
import "@/styles/visitor-achievements.css";

/*
 * Achievements for the visitor: small challenges (finish a case study, visit
 * every page, use the palette, type the Konami code…) that each pop a
 * console-style toast in the top corner. Each one
 * unlocks once per browser, and the page works the same without storage.
 * The last one also brings the platinum: a gold toast and a burst of confetti,
 * pointing to the reward in the trophy case.
 */

/** ↑ ↑ ↓ ↓ ← → ← → B A */
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
/** The touch version of the code: this many taps on the hero name, each within TAP_GAP_MS. */
const TAPS = 7;
const TAP_GAP_MS = 600;
/** Theme flips needed in one visit: over to the other side and back. */
const FLIPS = 2;
const LIFE_MS = 5200;
const PLATINUM_LIFE_MS = 9000;
/** Let the page intro (preloader, first paint) finish before anything pops. */
const SETTLE_MS = 1400;
/** The platinum lands just after the toast of the trophy that earned it. */
const PLATINUM_DELAY_MS = 1100;

type Toast =
  | { kind: "unlock"; id: Id; count: number; total: number; key: number }
  | { kind: "platinum"; key: number };

const defOf = (id: Id) => defs.find((d) => d.id === id);

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A short burst of confetti over the whole page, drawn on one canvas. */
function Confetti({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    const colors = ["#ffd23f", "#f4bd33", "#fff3c4", "#5ef0ff", "#ff4fd8", "#ffffff"];
    // two cannons from the top corners, aimed down toward the middle
    const bits = Array.from({ length: 170 }, (_, i) => {
      const left = i % 2 === 0;
      const angle = (left ? 0.15 : Math.PI - 0.15) + (Math.random() - 0.5) * 0.9;
      const speed = 7 + Math.random() * 9;
      return {
        x: left ? 0 : w,
        y: h * 0.12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 5 + Math.random() * 6,
        spin: Math.random() * Math.PI,
        vspin: (Math.random() - 0.5) * 0.3,
        color: colors[i % colors.length] ?? "#ffd23f",
      };
    });
    const start = performance.now();
    const LIFE = 2600;
    let frame = 0;
    const tick = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - LIFE * 0.6) / (LIFE * 0.4));
      for (const b of bits) {
        b.vy += 0.28;
        b.vx *= 0.985;
        b.x += b.vx;
        b.y += b.vy;
        b.spin += b.vspin;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.spin);
        ctx.fillStyle = b.color;
        // a flat strip that flips as it spins
        ctx.fillRect(
          -b.size / 2,
          (-b.size / 4) * Math.abs(Math.cos(b.spin * 2)),
          b.size,
          b.size / 2,
        );
        ctx.restore();
      }
      if (t < LIFE) frame = requestAnimationFrame(tick);
      else onDone();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);
  return <canvas ref={ref} className="va-confetti" aria-hidden />;
}

export function VisitorAchievements() {
  const t = useTranslations("visitorAchievements");
  const locale = useLocale();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [party, setParty] = useState(0);
  // the session set covers browsers where storage is unavailable
  const session = useRef(new Set<string>());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((key: number) => {
    setToasts((list) => list.filter((x) => x.key !== key));
  }, []);
  const endParty = useCallback(() => setParty(0), []);

  const push = useCallback(
    (toast: Toast, life: number) => {
      setToasts((list) => [...list, toast].slice(-3));
      timers.current.push(setTimeout(() => dismiss(toast.key), life));
    },
    [dismiss],
  );

  const unlock = useCallback(
    (id: Id) => {
      const got = new Set([...readUnlocked(), ...session.current]);
      if (got.has(id)) return;
      got.add(id);
      session.current.add(id);
      saveUnlocked([...got]);
      // arcade trophies count among themselves and never toward the platinum
      const group = defs.filter((d) => Boolean(d.arcade) === Boolean(defOf(id)?.arcade));
      const count = group.filter((d) => got.has(d.id)).length;
      push({ kind: "unlock", id, count, total: group.length, key: ++seq.current }, LIFE_MS);
      if (defOf(id)?.arcade || count < group.length) return;
      timers.current.push(
        setTimeout(() => {
          push({ kind: "platinum", key: ++seq.current }, PLATINUM_LIFE_MS);
          if (!calm()) setParty((n) => n + 1);
        }, PLATINUM_DELAY_MS),
      );
    },
    [push],
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // "start over" in the trophy case: forget this visit's unlocks too
  useEffect(() => onReset(() => session.current.clear()), []);

  // the layout's inline script doesn't run when React renders the page on the
  // client (the 404 does), so the saved arcade theme is reapplied here
  useEffect(() => {
    try {
      if (localStorage.getItem("kh:arcade") === "1")
        document.documentElement.setAttribute("data-arcade", "");
    } catch {
      // storage blocked: the normal theme stays
    }
  }, []);

  // elements on this page (the end of a case study), and the pages the tourist collects
  useEffect(() => {
    // fires once the element's top passes the middle of the screen
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const d = defs.find((x) => x.section === entry.target.id);
          if (d) unlock(d.id);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -45% 0px" },
    );
    const start = setTimeout(() => {
      const page = TOURIST_PAGES.find((p) => pathname.includes(p));
      if (page) {
        const seen = new Set([...readList(PAGES_KEY), page]);
        writeList(PAGES_KEY, [...seen]);
        if (TOURIST_PAGES.every((p) => seen.has(p))) unlock("tourist");
      }
      for (const d of defs) {
        const el = d.section && document.getElementById(d.section);
        if (el) io.observe(el);
      }
    }, SETTLE_MS);
    return () => {
      clearTimeout(start);
      io.disconnect();
    };
  }, [pathname, unlock]);

  // trophies handed out by other components (palette, skills files)
  useEffect(() => onEarn(unlock), [unlock]);

  // the Konami code on a keyboard, or a burst of taps on the hero name
  useEffect(() => {
    let step = 0;
    let taps = 0;
    let lastTap = 0;
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      // a wrong key restarts the code, unless it is the code's own first key
      step = key === KONAMI[step] ? step + 1 : key === KONAMI[0] ? 1 : 0;
      if (step === KONAMI.length) {
        step = 0;
        unlock("konami");
      }
    };
    const onTap = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest("#hero-title")) return;
      const now = performance.now();
      taps = now - lastTap < TAP_GAP_MS ? taps + 1 : 1;
      lastTap = now;
      if (taps >= TAPS) unlock("konami");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onTap);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onTap);
    };
  }, [unlock]);

  // read in both languages
  useEffect(() => {
    const seen = new Set([...readList(LOCALES_KEY), locale]);
    writeList(LOCALES_KEY, [...seen]);
    if (seen.size < 2) return;
    const timer = setTimeout(() => unlock("polyglot"), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [locale, unlock]);

  // theme switched there and back: next-themes toggles the "dark" class on <html>
  useEffect(() => {
    const html = document.documentElement;
    let dark = html.classList.contains("dark");
    let flips = 0;
    const mo = new MutationObserver(() => {
      const now = html.classList.contains("dark");
      if (now === dark) return;
      dark = now;
      if (++flips >= FLIPS) unlock("duality");
    });
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [unlock]);

  const close = (key: number) => (
    <button
      type="button"
      className="va-close"
      aria-label={t("dismiss")}
      onClick={() => dismiss(key)}
    >
      ×
    </button>
  );

  return (
    <>
      {party > 0 && <Confetti key={party} onDone={endParty} />}
      <ol className="va-stack" aria-live="polite" data-print="hide">
        {toasts.map((toast) => {
          if (toast.kind === "platinum") {
            return (
              <li
                key={toast.key}
                className="va-toast is-platinum"
                style={{ "--life": `${PLATINUM_LIFE_MS}ms` } as CSSProperties}
              >
                <span className="va-icon">
                  <PlatinumTrophy />
                </span>
                <span className="va-text">
                  <small>{t("platinum.kicker")}</small>
                  <b>{t("platinum.title")}</b>
                  <span>{t("platinum.desc")}</span>
                  <a href={`/${locale}#trophies`} className="va-cta">
                    {t("platinum.cta")}
                  </a>
                </span>
                {close(toast.key)}
                <span className="va-life" aria-hidden />
              </li>
            );
          }
          return (
            <li
              key={toast.key}
              className="va-toast"
              style={{ "--life": `${LIFE_MS}ms` } as CSSProperties}
            >
              <span className="va-icon">
                <TrophyIcon id={toast.id} />
              </span>
              <span className="va-text">
                <small>
                  {t("unlocked")}{" "}
                  <em>
                    {toast.count}/{toast.total}
                  </em>
                </small>
                <b>{t(`items.${toast.id}.title`)}</b>
                <span>{t(`items.${toast.id}.desc`)}</span>
              </span>
              {close(toast.key)}
              <span className="va-life" aria-hidden />
            </li>
          );
        })}
      </ol>
    </>
  );
}

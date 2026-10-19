"use client";

import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { earnAchievement } from "@/components/shared/visitor-achievements-data";

/*
 * `./invaders.exe`: bugs march down the screen and the ship fires code at
 * them, Space Invaders style, next to Snake in the arcade room. The ship fires
 * on its own; you only steer it: arrows/A-D on a keyboard, or drag across the
 * board on a phone. Clearing a wave earns the arcade trophy and brings a
 * faster one. Same terminal styles as Snake (`.snake-*` in arcade.css).
 */

const W = 384;
const H = 240;
const COLS = 8;
const ROWS = 3;
const SHIP_Y = H - 22;
const BEST_KEY = "kh:invaders-best";

/** 11×8 sprites, two frames for the bugs' legs. */
const BUG = [
  [
    "..x.....x..",
    "...x...x...",
    "..xxxxxxx..",
    ".xx.xxx.xx.",
    "xxxxxxxxxxx",
    "x.xxxxxxx.x",
    "x.x.....x.x",
    "...xx.xx...",
  ],
  [
    "..x.....x..",
    "x..x...x..x",
    "x.xxxxxxx.x",
    "xxx.xxx.xxx",
    "xxxxxxxxxxx",
    ".xxxxxxxxx.",
    "..x.....x..",
    ".x.......x.",
  ],
];
const SHIP = ["....x....", "...xxx...", "...xxx...", ".xxxxxxx.", "xxxxxxxxx", "xx.xxx.xx"];
const BUG_COLORS = ["#ff5f57", "#febc2e", "#a78bfa"];

type Shot = { x: number; y: number };
type Status = "idle" | "playing" | "over";

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function sprite(ctx: CanvasRenderingContext2D, rows: string[], x: number, y: number, px = 2) {
  rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++)
      if (row[rx] === "x") ctx.fillRect(x + rx * px, y + ry * px, px, px);
  });
}

function newWave(wave: number) {
  const bugs = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      bugs.push({ x: 40 + c * 36, y: 26 + r * 24, row: r, alive: true });
  return { bugs, dir: 1, speed: 0.35 + wave * 0.12 };
}

export function TerminalInvaders() {
  const t = useTranslations("arcade.invaders");
  const board = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [hud, setHud] = useState({ score: 0, lives: 3, wave: 1 });
  const [best, setBest] = useState(readBest);
  const [record, setRecord] = useState(false);

  // the game lives in refs and runs on requestAnimationFrame; React only shows the HUD
  const game = useRef({
    ship: W / 2,
    target: null as number | null,
    keys: { left: false, right: false },
    shots: [] as Shot[],
    drops: [] as Shot[],
    ...newWave(1),
    wave: 1,
    score: 0,
    lives: 3,
    reload: 0,
    fire: 0,
    hurt: 0,
    frame: 0,
  });

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const g = game.current;
    ctx.fillStyle = "#05070d";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    for (let i = 0; i < 40; i++) ctx.fillRect((i * 97) % W, (i * 53 + g.frame / 4) % H, 1, 1);
    const legs = Math.floor(g.frame / 24) % 2;
    for (const bug of g.bugs) {
      if (!bug.alive) continue;
      ctx.fillStyle = BUG_COLORS[bug.row] ?? "#fff";
      sprite(ctx, BUG[legs] ?? [], bug.x, bug.y);
    }
    ctx.fillStyle = "#8dff9c";
    for (const s of g.shots) ctx.fillRect(s.x - 1, s.y, 2, 7);
    ctx.fillStyle = "#ff5f57";
    for (const d of g.drops) ctx.fillRect(d.x - 1, d.y, 3, 6);
    // blink while hurt
    if (g.hurt === 0 || Math.floor(g.hurt / 6) % 2) {
      ctx.fillStyle = "#38bdf8";
      sprite(ctx, SHIP, g.ship - 9, SHIP_Y);
    }
  }, []);

  const end = useCallback(() => {
    setStatus("over");
    const score = game.current.score;
    if (score > readBest()) {
      try {
        localStorage.setItem(BEST_KEY, String(score));
      } catch {
        // the record just lasts for this visit
      }
      setBest(score);
      setRecord(true);
    }
  }, []);

  /** One frame of the game. Returns false when the run ends. */
  const step = useCallback(() => {
    const g = game.current;
    g.frame++;
    if (g.hurt > 0) g.hurt--;

    // steer: keys, or glide toward the finger
    const move = 3.2;
    if (g.keys.left) g.ship -= move;
    if (g.keys.right) g.ship += move;
    if (g.target !== null) g.ship += Math.max(-move, Math.min(move, g.target - g.ship));
    g.ship = Math.max(12, Math.min(W - 12, g.ship));

    // the ship fires on its own
    if (--g.reload <= 0) {
      g.shots.push({ x: g.ship, y: SHIP_Y - 6 });
      g.reload = 22;
    }
    for (const s of g.shots) s.y -= 5;
    g.shots = g.shots.filter((s) => s.y > -8);

    // the swarm marches, and steps down at the edges
    const alive = g.bugs.filter((b) => b.alive);
    const speed = g.speed + (COLS * ROWS - alive.length) * 0.03;
    const edge = alive.some((b) => (g.dir > 0 ? b.x + 22 + speed > W - 6 : b.x - speed < 6));
    if (edge) {
      g.dir *= -1;
      for (const b of alive) b.y += 10;
    } else for (const b of alive) b.x += g.dir * speed;

    // now and then a random bug drops one back
    if (--g.fire <= 0 && alive.length) {
      const shooter = alive[Math.floor(Math.random() * alive.length)];
      if (shooter) g.drops.push({ x: shooter.x + 11, y: shooter.y + 16 });
      g.fire = Math.max(24, 70 - g.wave * 8);
    }
    for (const d of g.drops) d.y += 2.6;
    g.drops = g.drops.filter((d) => d.y < H);

    // hits on bugs
    for (const s of g.shots)
      for (const b of alive)
        if (b.alive && s.x >= b.x && s.x <= b.x + 22 && s.y <= b.y + 16 && s.y + 7 >= b.y) {
          b.alive = false;
          s.y = -99;
          g.score += 10 * (ROWS - b.row);
        }

    // hits on the ship
    if (g.hurt === 0)
      for (const d of g.drops)
        if (Math.abs(d.x - g.ship) < 10 && d.y + 6 >= SHIP_Y && d.y <= SHIP_Y + 12) {
          d.y = H;
          g.lives--;
          g.hurt = 60;
        }

    if (g.bugs.every((b) => !b.alive)) {
      earnAchievement("invader");
      g.wave++;
      Object.assign(g, newWave(g.wave), { shots: [], drops: [] });
    }
    setHud((h) =>
      h.score === g.score && h.lives === g.lives && h.wave === g.wave
        ? h
        : { score: g.score, lives: g.lives, wave: g.wave },
    );
    draw();
    const landed = alive.some((b) => b.alive && b.y + 16 >= SHIP_Y);
    return g.lives > 0 && !landed;
  }, [draw]);

  useEffect(() => {
    if (status !== "playing") return;
    let frame = requestAnimationFrame(function loop() {
      if (step()) frame = requestAnimationFrame(loop);
      else end();
    });
    return () => cancelAnimationFrame(frame);
  }, [status, step, end]);

  useEffect(() => {
    draw();
  }, [draw]);

  const start = useCallback(() => {
    Object.assign(game.current, newWave(1), {
      ship: W / 2,
      target: null,
      shots: [],
      drops: [],
      wave: 1,
      score: 0,
      lives: 3,
      reload: 10,
      fire: 60,
      hurt: 0,
    });
    setHud({ score: 0, lives: 3, wave: 1 });
    setRecord(false);
    setStatus("playing");
    board.current?.focus({ preventScroll: true });
  }, []);

  const onKey = (down: boolean) => (e: KeyboardEvent) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (down && status !== "playing" && (key === "Enter" || key === " ")) {
      e.preventDefault();
      start();
      return;
    }
    const keys = game.current.keys;
    if (key === "ArrowLeft" || key === "a") keys.left = down;
    else if (key === "ArrowRight" || key === "d") keys.right = down;
    else return;
    e.preventDefault();
    game.current.target = null;
  };

  /** The board's x in game pixels, from a pointer. */
  const toGame = (e: PointerEvent) => {
    const rect = canvas.current?.getBoundingClientRect();
    return rect ? ((e.clientX - rect.left) / rect.width) * W : null;
  };

  return (
    <div className="snake mt-4">
      <p>
        <span className="text-[#28c840]">$</span> ./invaders.exe
      </p>
      <p className="snake-hud" aria-live="polite">
        <span>
          {t("score")} <b>{String(hud.score).padStart(4, "0")}</b>
        </span>
        <span>
          {t("wave")} <b>{hud.wave}</b>
        </span>
        <span>
          {t("lives")} <b>{"♥".repeat(Math.max(0, hud.lives))}</b>
        </span>
        <span>
          {t("best")} <b>{String(best).padStart(4, "0")}</b>
        </span>
      </p>
      <div
        ref={board}
        className="snake-board"
        tabIndex={0}
        role="application"
        aria-label={t("label")}
        onKeyDown={onKey(true)}
        onKeyUp={onKey(false)}
        onBlur={() => Object.assign(game.current.keys, { left: false, right: false })}
        onPointerDown={(e) => {
          if (status !== "playing") return start();
          game.current.target = toGame(e);
        }}
        onPointerMove={(e) => (game.current.target = toGame(e))}
        onPointerLeave={() => (game.current.target = null)}
      >
        <canvas ref={canvas} width={W} height={H} aria-hidden />
        {status !== "playing" && (
          <div className="snake-overlay">
            {status === "over" && (
              <p className="snake-over">
                GAME OVER · {String(hud.score).padStart(4, "0")}
                {record && <span className="snake-record"> {t("record")}</span>}
              </p>
            )}
            <p className="snake-start">{t("start")}</p>
            <p className="snake-hint">{t("hint")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

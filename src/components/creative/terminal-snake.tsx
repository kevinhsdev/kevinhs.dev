"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { earnAchievement } from "@/components/shared/visitor-achievements-data";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

/*
 * `./snake.exe`: a tiny Snake in a terminal, in the arcade theme's arcade room. Arrows/WASD on a keyboard; swipe on the board or the d-pad on a
 * phone. Walls and your own tail end the run; the best score stays in this
 * browser. It only takes the arrow keys while the board has focus, so the page
 * still scrolls normally around it.
 */

const COLS = 24;
const ROWS = 13;
const CELL = 16; // canvas pixels per cell; CSS scales it up crisp
const BEST_KEY = "kh:snake-best";
/** Score that earns the arcade trophy. */
const SNAKE_TROPHY = 100;

type Cell = { x: number; y: number };
type Status = "idle" | "playing" | "over";

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
} as const;
type Dir = keyof typeof DIRS;

const KEYS: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(score: number) {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // the record just lasts for this visit
  }
}

/** A free cell for the food, anywhere the snake is not. */
function spawn(snake: Cell[]): Cell {
  const free: Cell[] = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y });
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

export function TerminalSnake() {
  const t = useTranslations("footer.snake");
  const board = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  // rendered only on the client (under the arcade theme), so storage is safe here
  const [best, setBest] = useState(readBest);
  const [record, setRecord] = useState(false);

  // the game itself lives in refs: it changes every tick, React only shows the score
  const game = useRef({
    snake: [] as Cell[],
    dir: DIRS.right as Cell,
    queue: [] as Cell[],
    food: { x: 0, y: 0 } as Cell,
    score: 0,
  });
  const swipe = useRef<Cell | null>(null);

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const g = game.current;
    ctx.fillStyle = "#05070d";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    // a faint dot grid, like a phosphor screen
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) ctx.fillRect(x * CELL + 7, y * CELL + 7, 2, 2);
    ctx.fillStyle = "#febc2e";
    ctx.fillRect(g.food.x * CELL + 3, g.food.y * CELL + 3, CELL - 6, CELL - 6);
    g.snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#8dff9c" : "#28c840";
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  /** One step of the snake. Returns false when the run ends. */
  const advance = useCallback(() => {
    const g = game.current;
    g.dir = g.queue.shift() ?? g.dir;
    const head = g.snake[0];
    if (!head) return false;
    const next = { x: head.x + g.dir.x, y: head.y + g.dir.y };
    const hitWall = next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS;
    // the tail moves out of the way this tick, so it doesn't count
    const hitSelf = g.snake.slice(0, -1).some((s) => s.x === next.x && s.y === next.y);
    if (hitWall || hitSelf) {
      setStatus("over");
      if (g.score > readBest()) {
        writeBest(g.score);
        setBest(g.score);
        setRecord(true);
      }
      return false;
    }
    g.snake.unshift(next);
    if (next.x === g.food.x && next.y === g.food.y) {
      g.score += 10;
      setScore(g.score);
      if (g.score === SNAKE_TROPHY) earnAchievement("snaker");
      g.food = spawn(g.snake);
    } else {
      g.snake.pop();
    }
    draw();
    return true;
  }, [draw]);

  // the loop runs only while playing; a little faster with every bite
  useEffect(() => {
    if (status !== "playing") return;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (advance()) timer = setTimeout(step, Math.max(60, 130 - game.current.score / 2));
    };
    timer = setTimeout(step, 150);
    return () => clearTimeout(timer);
  }, [status, advance]);

  const start = useCallback(() => {
    const g = game.current;
    g.snake = [
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
    ];
    g.dir = DIRS.right;
    g.queue = [];
    g.food = spawn(g.snake);
    g.score = 0;
    setScore(0);
    setRecord(false);
    setStatus("playing");
    board.current?.focus({ preventScroll: true });
    draw();
  }, [draw]);

  const turn = useCallback((d: Dir) => {
    const g = game.current;
    const last = g.queue.at(-1) ?? g.dir;
    const want = DIRS[d];
    // no turning back on yourself; keep at most two quick turns queued
    if (want.x === -last.x && want.y === -last.y) return;
    if (want.x === last.x && want.y === last.y) return;
    if (g.queue.length < 2) g.queue.push(want);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const onKey = (e: KeyboardEvent) => {
    const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (status !== "playing") {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        start();
      }
      return;
    }
    if (dir) {
      e.preventDefault();
      turn(dir);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const from = swipe.current;
    swipe.current = null;
    if (status !== "playing") {
      start();
      return;
    }
    if (!from) return;
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  };

  const pad = (d: Dir, Icon: typeof ChevronUp) => (
    <button
      type="button"
      aria-label={t(d)}
      className="snake-pad-btn"
      onClick={() => (status === "playing" ? turn(d) : start())}
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );

  return (
    <div className="snake mt-4">
      <p>
        <span className="text-[#28c840]">$</span> ./snake.exe
      </p>
      <p className="snake-hud" aria-live="polite">
        <span>
          {t("score")} <b>{String(score).padStart(4, "0")}</b>
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
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <canvas ref={canvas} width={COLS * CELL} height={ROWS * CELL} aria-hidden />
        {status !== "playing" && (
          <div className="snake-overlay">
            {status === "over" && (
              <p className="snake-over">
                GAME OVER · {String(score).padStart(4, "0")}
                {record && <span className="snake-record"> {t("record")}</span>}
              </p>
            )}
            <p className="snake-start">{t("start")}</p>
            <p className="snake-hint">{t("hint")}</p>
          </div>
        )}
      </div>
      <div className="snake-pad" aria-label={t("pad")}>
        {pad("up", ChevronUp)}
        {pad("left", ChevronLeft)}
        {pad("down", ChevronDown)}
        {pad("right", ChevronRight)}
      </div>
    </div>
  );
}

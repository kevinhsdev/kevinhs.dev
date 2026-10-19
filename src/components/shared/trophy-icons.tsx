import type { CSSProperties } from "react";
import { Pixels, type Palette } from "@/components/creative/pixel-art";
import { ModernTrophyIcon } from "@/components/shared/trophy-icons-modern";
import type { VisitorAchievementId } from "@/components/shared/visitor-achievements-data";

/*
 * One animated 12×12 pixel icon per trophy: a spinning globe for the tourist,
 * a book turning its pages, a terminal typing, a coin spinning… Each icon is
 * a few frames (character maps, see pixel-art.tsx) laid side by side and
 * slid by CSS (`.ti-strip` in visitor-achievements.css); colours are theme tokens, so they
 * work on every theme. Under reduced motion only the first frame shows.
 * These are the arcade theme's; the normal theme shows the vector ones from
 * trophy-icons-modern.tsx (CSS picks one, see visitor-achievements.css).
 */

const S = 12;
type Rows = string[];

/** A 12×12 map from a function of each pixel. */
const grid = (fn: (x: number, y: number) => string): Rows =>
  Array.from({ length: S }, (_, y) => Array.from({ length: S }, (_, x) => fn(x, y)).join(""));

/** `top` drawn over `base` wherever it isn't empty. */
const over = (base: Rows, top: Rows): Rows =>
  base.map((row, y) =>
    [...row].map((c, x) => (top[y]?.[x] && top[y][x] !== "." ? top[y][x] : c)).join(""),
  );

const inCircle = (x: number, y: number, cx: number, cy: number, r: number) =>
  (x - cx) ** 2 + (y - cy) ** 2 <= r * r;

const swap = (rows: Rows, map: Record<string, string>) =>
  rows.map((row) => [...row].map((c) => map[c] ?? c).join(""));

/* the globe: land drifts across the ocean */
const LAND = [
  "..ee........",
  ".eeee...ee..",
  ".eee...eeee.",
  "..e....eee..",
  ".......ee...",
  "...ee...e...",
  "..eeee......",
  "..eeeee.....",
  "...eee...ee.",
  "....e...eee.",
  ".........e..",
  "............",
];
const globe = [0, 3, 6, 9].map((shift) =>
  grid((x, y) =>
    !inCircle(x, y, 5.5, 5.5, 5.8) ? "." : LAND[y]?.[(x - shift + S) % S] === "e" ? "e" : "d",
  ),
);

/* the book: a page lifts, stands and lands on the other side */
const BOOK = [
  "............",
  "............",
  "............",
  ".ppppaapppp.",
  ".pkkpaapkkp.",
  ".ppppaapppp.",
  ".pkkpaapkkp.",
  ".ppppaapppp.",
  ".pkkpaapkkp.",
  "aaaaaaaaaaaa",
  ".aaaaaaaaaa.",
  "............",
];
const book = [
  BOOK,
  over(BOOK, ["", "", "......pppp..", "......pkkp.."]),
  over(BOOK, ["", "......p.....", "......p.....", "......p.....", "......p....."]),
  over(BOOK, ["", "", "..pppp......", "..pkkp......"]),
];

/* the terminal: a prompt, a line of code, and a line being typed */
const TERM = [
  "............",
  "aaaaaaaaaaaa",
  "akkkkkkkkkka",
  "akekkkkkkkka",
  "akkekkkkkkka",
  "akekkeeeekka",
  "akkkkkkkkkka",
  "akeeekeekkka",
  "akkkkkkkkkka",
  "akkkkkkkkkka",
  "aaaaaaaaaaaa",
  "............",
];
const terminal = ["akeeakkkkkka", "akeeeeakkkka", "akeeeeeeakka"].map((line) =>
  over(TERM, ["", "", "", "", "", "", "", "", "", line]),
);

/* the stack: a block drops onto the other two */
const BASE_STACK = over(
  grid(() => "."),
  ["", "", "", "", "", "", "", "", ".eeeeeeeeee.", ".eeeeeeeeee.", ".dddddddddd.", ".dddddddddd."],
);
const stack = [0, 3, 6].map((y) =>
  over(BASE_STACK, [...Array<string>(y).fill(""), ".aaaaaaaaaa.", ".aaaaaaaaaa."]),
);

/* the gamepad: buttons and d-pad being pressed */
const PAD = [
  "............",
  "............",
  "............",
  "..bbbbbbbb..",
  ".bbnbbbbbbb.",
  "bbnnnbbbfbbb",
  "bbbnbbbbbbab",
  "bbbbbbbbbbbb",
  "bbbb....bbbb",
  ".bb......bb.",
  "............",
  "............",
];
const gamepad = [
  PAD,
  over(PAD, ["", "", "", "", "", "........n...", "...b......n."]),
  over(PAD, ["", "", "", "", "...b........", "..b.........", "..........a."]),
];

/* sun and moon taking turns */
const sun = grid((x, y) => {
  if (inCircle(x, y, 5.5, 5.5, 3)) return "a";
  const ray =
    (x === 5 || x === 6 || y === 5 || y === 6 || x === y || x === 11 - y) &&
    inCircle(x, y, 5.5, 5.5, 5.8) &&
    !inCircle(x, y, 5.5, 5.5, 4.2);
  return ray ? "a" : ".";
});
const moon = grid((x, y) =>
  inCircle(x, y, 5.5, 5.5, 4.6) && !inCircle(x, y, 7.8, 4.2, 3.9) ? "c" : ".",
);
const duality = [sun, sun, moon, moon];

/* two speech bubbles talking in turn */
const BUBBLES = [
  "............",
  "XXXXXXXX....",
  "XpppppXX....",
  "XppppXXX....",
  "XXXXXXXX....",
  ".XX.........",
  "....YYYYYYYY",
  "....YYpppppY",
  "....YYYppppY",
  "....YYYYYYYY",
  "..........YY",
  "............",
];
const polyglot = [swap(BUBBLES, { X: "a", Y: "c" }), swap(BUBBLES, { X: "c", Y: "a" })];

/* a coin spinning on its edge */
const coin = [5, 3.4, 1, 3.4].map((w) =>
  grid((x, y) => {
    if ((x - 5.5) ** 2 / (w * w) + (y - 5.5) ** 2 / 25 > 1) return ".";
    return w > 2 && Math.abs(x - 5.5) < w * 0.35 && y > 2 && y < 9 ? "p" : "a";
  }),
);

/* the bug boss, crowned, wriggling its legs */
const BOSS = [
  "..a..aa..a..",
  "..aaaaaaaa..",
  ".bffffffffb.",
  "..fpkffkpf..",
  "..ffffffff..",
  "bbffffffffbb",
  "..fkkkkkkf..",
  "bbffffffffbb",
  "..ffffffff..",
  ".b..f..f..b.",
  "............",
  "............",
];
const boss = [
  BOSS,
  over(
    BOSS.map((row, y) => (y === 5 || y === 7 ? "..ffffffff.." : y === 9 ? "............" : row)),
    ["", "", "", "", "", ".b........b.", "", ".b........b.", "", "b...f..f...b"],
  ),
];

/* the snake, slithering */
const snake = [0, 1.6, 3.2].map((phase) =>
  grid((x, y) => {
    if (x > 10) return ".";
    const mid = 6 + Math.round(2 * Math.sin((x + phase) / 1.6));
    if (x === 10 && y === mid - 1) return "k";
    if (x === 10 && y === mid + 1) return "f";
    return y === mid || y === mid + 1 ? "e" : ".";
  }),
);

/* the treasure map: the X blinks at the end of the trail */
const MAP = [
  "............",
  "ppppcpppcppp",
  "pkppcpppcppp",
  "ppkpcpppcppp",
  "pppkckppcppp",
  "ppppckkpcppp",
  "ppppcppkcppp",
  "ppppcpppkkpp",
  "ppppcpppcpkp",
  "ppppcpppcppp",
  "ppppcpppcppp",
  "............",
];
const cartographer = [
  over(MAP, ["", "", "", "", "", "", "", ".........f.f", "..........f.", ".........f.f"]),
  MAP,
];

/* an NPC's speech bubble, typing */
const SAY = [
  "............",
  "............",
  ".dddddddddd.",
  "dddddddddddd",
  "dddddddddddd",
  "dddddddddddd",
  "dddddddddddd",
  ".dddddddddd.",
  "..dd........",
  ".d..........",
  "............",
  "............",
];
const chatter = [3, 6, 9].map((raised) =>
  over(
    SAY,
    grid((x, y) => ([3, 6, 9].includes(x) && y === (x === raised ? 4 : 5) ? "p" : ".")),
  ),
);

/* a bug invader dropping toward the ship, which fires back */
const INVADER = [
  "...f....f...",
  "....ffff....",
  "...fkffkf...",
  "...ffffff...",
  "....f..f....",
  "............",
  "............",
  "............",
  "............",
  ".....dd.....",
  "...dddddd...",
  "..dddddddd..",
];
const invader = [8, 6].map((y) => over(INVADER, [...Array<string>(y).fill(""), ".....a......"]));

const ICONS: Record<VisitorAchievementId, { frames: Rows[]; ms: number }> = {
  tourist: { frames: globe, ms: 1600 },
  reader: { frames: book, ms: 1400 },
  hacker: { frames: terminal, ms: 1200 },
  stack: { frames: stack, ms: 1200 },
  konami: { frames: gamepad, ms: 900 },
  duality: { frames: duality, ms: 2400 },
  polyglot: { frames: polyglot, ms: 1600 },
  collector: { frames: coin, ms: 800 },
  boss: { frames: boss, ms: 600 },
  snaker: { frames: snake, ms: 900 },
  cartographer: { frames: cartographer, ms: 1000 },
  chatter: { frames: chatter, ms: 1200 },
  invader: { frames: invader, ms: 500 },
};

const PALETTE: Palette = {
  a: "ti-a",
  b: "ti-b",
  c: "ti-c",
  d: "ti-d",
  e: "ti-e",
  f: "ti-f",
  k: "ti-k",
  n: "ti-n",
  p: "ti-p",
};

export function TrophyIcon({ id, className }: { id: VisitorAchievementId; className?: string }) {
  const { frames, ms } = ICONS[id];
  return (
    <>
      <ModernTrophyIcon id={id} />
      <svg
        viewBox="0 0 12 12"
        shapeRendering="crispEdges"
        aria-hidden
        className={`ti ${className ?? ""}`}
        style={{ "--ti-ms": `${ms}ms`, "--ti-n": frames.length } as CSSProperties}
      >
        {/* a filmstrip: the frames side by side, slid one frame at a time */}
        <g className="ti-strip">
          {frames.map((rows, index) => (
            <Pixels key={index} rows={rows} palette={PALETTE} left={index * S} />
          ))}
        </g>
      </svg>
    </>
  );
}

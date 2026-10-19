/*
 * The arcade theme's switch transition: a "virus" of pixels spreads from the
 * point the visitor clicked until it owns the whole screen, the theme flips
 * underneath while nothing shows through, and the pixels then crumble away to
 * reveal the new look. Same effect both ways, with the palette and the message
 * of the side it is heading to. One canvas, one rAF loop, removed at the end.
 */

type Point = { x: number; y: number };

const INFECT_MS = 950;
const HOLD_MS = 380;
const CLEAR_MS = 750;

/** The colours of the side the switch is heading to: base fills the screen, glitch lights it up. */
/**
 * The colours of the side the switch is heading to: base fills the screen,
 * glitch lights cells up, text and split colour the message.
 */
const palettes = {
  // into the dark arcade: gold and amber embers over deep indigo
  arcadeDark: {
    base: "#0a0b1e",
    text: "#ffd23f",
    split: ["#3a1b6b", "#f6a623"],
    glitch: ["#ffd23f", "#f6a623", "#fff3c4", "#c98a12", "#2a2d66", "#3a1b6b"],
  },
  // into the light arcade: the four greens of a Game Boy screen
  arcadeLight: {
    base: "#0f2a0f",
    text: "#d4dcb4",
    split: ["#18471a", "#8bac0f"],
    glitch: ["#d4dcb4", "#a9b787", "#4f7a3a", "#18471a", "#e4ead0", "#8bac0f"],
  },
  // back to the normal site, in either theme: its own blues
  normal: {
    base: "#070d1f",
    text: "#eef2fb",
    split: ["#1f4fd6", "#8e9ab5"],
    glitch: ["#4d8dff", "#7aa8ff", "#eef2fb", "#1f4fd6", "#1c2847", "#8e9ab5"],
  },
};

const messages = {
  on: ["> ARCADE.EXE DETECTED", "> INFECTING SYSTEM... 100%"],
  off: ["> CLEANING ARCADE.EXE", "> SYSTEM RESTORED"],
};

let running = false;

export function pixelTakeover(on: boolean, origin: Point | undefined, swap: () => void) {
  if (running) return;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    swap();
    return;
  }
  running = true;
  canvas.className = "arcade-virus";
  canvas.setAttribute("aria-hidden", "true");

  const w = window.innerWidth;
  const h = window.innerHeight;
  const cell = w < 640 ? 16 : 24;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  // drawn at one canvas pixel per cell, then scaled up crisp by CSS
  canvas.width = cols;
  canvas.height = rows;
  document.body.append(canvas);

  const dark = document.documentElement.classList.contains("dark");
  const { base, text, split, glitch } =
    palettes[on ? (dark ? "arcadeDark" : "arcadeLight") : "normal"];
  const pick = () => glitch[Math.floor(Math.random() * glitch.length)] ?? base;
  const o = origin ?? { x: w / 2, y: h / 2 };
  const ox = o.x / cell;
  const oy = o.y / cell;
  const far = Math.hypot(Math.max(ox, cols - ox), Math.max(oy, rows - oy));

  const n = cols * rows;
  const arrive = new Float32Array(n); // 0..1 within the infection
  const leave = new Float32Array(n); // 0..1 within the clearing
  const color: string[] = new Array<string>(n);
  for (let i = 0; i < n; i++) {
    const x = i % cols;
    const y = Math.floor(i / cols);
    // a ragged front: distance from the click, plus noise so it spreads like a stain
    arrive[i] = Math.min(1, (Math.hypot(x - ox, y - oy) / far) * 0.82 + Math.random() * 0.18);
    leave[i] = Math.random();
    // most of the infected screen is dark; a share of cells stay lit like dead pixels
    color[i] = Math.random() < 0.3 ? pick() : base;
  }

  // the message is real text over the canvas, so it stays crisp at any cell size
  const msg = document.createElement("div");
  msg.className = "arcade-virus-msg";
  msg.style.color = text;
  msg.style.textShadow = `-2px 0 0 ${split[0]}, 2px 0 0 ${split[1]}`;
  msg.setAttribute("aria-hidden", "true");
  for (const line of messages[on ? "on" : "off"]) {
    const p = document.createElement("p");
    p.textContent = line;
    msg.append(p);
  }
  msg.style.opacity = "0";
  document.body.append(msg);

  const start = performance.now();
  let swapped = false;

  const frame = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, cols, rows);

    if (t < INFECT_MS + HOLD_MS) {
      const p = Math.min(1, t / INFECT_MS);
      for (let i = 0; i < n; i++) {
        const a = arrive[i] ?? 1;
        if (a > p) continue;
        // the leading edge flickers through the palette; behind it, the cells settle
        const fresh = p - a < 0.07;
        ctx.fillStyle = fresh || Math.random() < 0.015 ? pick() : (color[i] ?? base);
        ctx.fillRect(i % cols, Math.floor(i / cols), 1, 1);
      }
      if (t >= INFECT_MS) {
        if (!swapped) {
          swapped = true;
          swap();
        }
        msg.style.opacity = String(Math.min(1, (t - INFECT_MS) / 120));
      }
    } else {
      const q = (t - INFECT_MS - HOLD_MS) / CLEAR_MS;
      for (let i = 0; i < n; i++) {
        if ((leave[i] ?? 0) < q) continue;
        ctx.fillStyle = Math.random() < 0.03 ? pick() : (color[i] ?? base);
        ctx.fillRect(i % cols, Math.floor(i / cols), 1, 1);
      }
      msg.style.opacity = String(Math.max(0, 1 - q / 0.35));
    }

    if (t < INFECT_MS + HOLD_MS + CLEAR_MS) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
      msg.remove();
      running = false;
    }
  };
  requestAnimationFrame(frame);
}

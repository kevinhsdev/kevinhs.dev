"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReduced } from "@/motion/reduced";

export type NowItem = { name: string; text?: string; status?: string; progress?: number };

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const CELLS = 20;
const BLOCK = 5;
const SPIN = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";

/** A CLI progress bar as text: filled to `p`, or (no number yet) a block bouncing end to end. */
function bar(p: number | undefined, tick: number) {
  if (p != null) {
    const full = Math.round((p / 100) * CELLS);
    return "█".repeat(full) + "░".repeat(CELLS - full);
  }
  const span = CELLS - BLOCK;
  const k = tick % (span * 2);
  const at = k <= span ? k : span * 2 - k;
  return "░".repeat(at) + "█".repeat(BLOCK) + "░".repeat(span - at);
}

/**
 * "Studying now" as a real terminal: the command is typed key by key the first time the window
 * comes on screen, then the output prints at once, like a CLI would. What he's studying shows a
 * progress bar (a bouncing one with a spinner while there's no number, so nothing is faked);
 * what he's building is listed as running processes. Without JS or with reduced motion,
 * everything is simply there and still.
 */
export function NowTerminal({
  learning,
  building,
  labels,
}: {
  learning: NowItem[];
  building: NowItem[];
  labels: {
    title: string;
    prompt: string;
    command: string;
    learning: string;
    building: string;
    processes: string;
    inProgress: string;
  };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(labels.command.length);
  const [out, setOut] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (prefersReduced()) return;
    const el = ref.current!;
    // hide the command and its output until the window is on screen (CSS reads this)
    el.dataset.armed = "";
    let timer = 0;
    let spin = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        setTyped(0);
        setOut(false);
        el.dataset.started = "";
        let i = 0;
        timer = window.setInterval(() => {
          i++;
          setTyped(i);
          if (i >= labels.command.length) {
            window.clearInterval(timer);
            timer = window.setTimeout(() => {
              setOut(true);
              spin = window.setInterval(() => setTick((t) => t + 1), 90);
            }, 350);
          }
        }, 70);
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
      window.clearTimeout(timer);
      window.clearInterval(spin);
    };
  }, [labels.command.length]);

  const done = typed >= labels.command.length;

  return (
    <div ref={ref} className="nt dark" data-out={out || undefined}>
      <div className="nt-bar" aria-hidden="true">
        <span className="nt-lights">
          <i />
          <i />
          <i />
        </span>
        <span className="nt-tab">{labels.title}</span>
      </div>

      <div className="nt-body">
        <p className="nt-cmd">
          <span className="nt-prompt" aria-hidden="true">
            {labels.prompt}
          </span>
          <span className="sr-only">{labels.command}</span>
          <span className="nt-typed" aria-hidden="true">
            {labels.command.slice(0, typed)}
          </span>
          {!done && <span className="nt-cursor" aria-hidden="true" />}
        </p>

        <div className="nt-out">
          <p className="nt-head">
            <span aria-hidden="true">==&gt; </span>
            {labels.learning}
          </p>
          <ul className="nt-rows">
            {learning.map((item, i) => (
              <li key={item.name} className="nt-row">
                <span className="nt-icon" aria-hidden="true">
                  {item.progress != null && item.progress >= 100 ? "✔" : SPIN[(tick + i * 3) % 10]}
                </span>
                <span className="nt-name">{slug(item.name)}</span>
                <span
                  className="nt-meter"
                  role={item.progress == null ? undefined : "img"}
                  aria-label={item.progress == null ? undefined : `${item.progress}%`}
                  aria-hidden={item.progress == null || undefined}
                >
                  [<span className="nt-fill">{bar(item.progress, tick + i * 4)}</span>]
                  {item.progress != null && <span className="nt-pct"> {item.progress}%</span>}
                </span>
                <span className="nt-status">{item.status ?? labels.inProgress}</span>
                {item.text && <span className="nt-note"># {item.text}</span>}
              </li>
            ))}
          </ul>

          <p className="nt-head">
            <span aria-hidden="true">==&gt; </span>
            {labels.building} <span className="nt-dim">· {labels.processes}</span>
          </p>
          <ul className="nt-rows">
            {building.map((item) => (
              <li key={item.name} className="nt-row nt-proc">
                <span className="nt-icon nt-live" aria-hidden="true">
                  ●
                </span>
                <span className="nt-name">{slug(item.name)}</span>
                {item.text && <span className="nt-status nt-wide">{item.text}</span>}
              </li>
            ))}
          </ul>

          <p className="nt-cmd" aria-hidden="true">
            <span className="nt-prompt">{labels.prompt}</span>
            <span className="nt-cursor nt-blink" />
          </p>
        </div>
      </div>
    </div>
  );
}

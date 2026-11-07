"use client";

/*
 * Four more ideas for the projects section, to compare with the film (the picker at the top,
 * or ?projetos=antes | mesa | problema | commits). Temporary: once Kevin picks one, it becomes
 * the section and this file goes.
 */
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@/i18n/navigation";
import { Metric, OthersList, Visual, type Card, type ViewProps } from "./view";
import "./variants.css";

function Head({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-12 flex flex-wrap items-end justify-between gap-4">
      <h2 id="projects-title" className="font-display text-5xl uppercase sm:text-7xl">
        {title}
      </h2>
      {children}
    </header>
  );
}

function Open({ slug, label }: { slug: string; label: string }) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="group inline-flex items-center gap-2 text-sm font-semibold hover:text-accent"
    >
      {label}
      <ArrowUpRight
        aria-hidden
        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

/* ------------------------------------------------------------------ Antes → Depois */

/** Each project as a before/after split: drag (or arrow-key) the divider to reveal the result. */
export function BeforeAfter({ cards, others, labels }: ViewProps) {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="mx-auto max-w-7xl px-5 py-28 sm:px-8 lg:py-40"
    >
      <Head title={labels.title}>
        <p className="font-mono text-xs tracking-widest text-muted uppercase">
          ← arraste o divisor →
        </p>
      </Head>
      <ol className="grid gap-16">
        {cards.map((card) => (
          <li key={card.slug} data-project={card.slug}>
            <Split card={card} />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="font-mono text-xs tracking-widest text-accent uppercase">
                {card.index} · {card.meta}
              </p>
              <Open slug={card.slug} label={labels.open} />
            </div>
          </li>
        ))}
      </ol>
      <h3 className="mt-28 mb-6 font-mono text-sm tracking-widest text-muted uppercase">
        {labels.other}
      </h3>
      <OthersList others={others} />
    </section>
  );
}

function Split({ card }: { card: Card }) {
  const [x, setX] = useState(62);
  return (
    <div className="ba" style={{ "--x": `${x}%` } as React.CSSProperties}>
      {/* after: the result */}
      <div className="ba-after">
        <div className="ba-after__img">
          <Visual card={card} />
        </div>
        <div className="ba-after__text">
          <span className="ba-tag ba-tag--after">Depois</span>
          <h3 className="mt-4 font-display text-5xl leading-[0.95] uppercase sm:text-6xl">
            {card.title}
          </h3>
          {card.impact && <p className="mt-4 max-w-sm text-lg">{card.impact}</p>}
          <div className="mt-6">
            <Metric card={card} />
          </div>
        </div>
      </div>
      {/* before: the problem, on a spreadsheet grid */}
      <div className="ba-before" aria-hidden={x < 8}>
        <div className="ba-before__text">
          <span className="ba-tag">Antes</span>
          {/* TODO(kevin): a short "before" line per project; the summary stands in. */}
          <p className="mt-4 max-w-md font-mono text-sm leading-relaxed sm:text-base">
            {card.summary}
          </p>
        </div>
      </div>
      <span className="ba-handle" aria-hidden>
        <i />
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={x}
        onChange={(e) => setX(Number(e.target.value))}
        aria-label={`Antes e depois: ${card.title}`}
        className="ba-range"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ Área de trabalho */

type App = { id: string; title: string; card?: Card };

/** A desktop: project icons, draggable windows, a dock. Click an icon to open its window. */
export function Desktop({ cards, others, labels }: ViewProps) {
  const apps: App[] = [
    ...cards.map((c) => ({ id: c.slug, title: c.title, card: c })),
    { id: "others", title: labels.other },
  ];
  // open windows, back to front
  const [stack, setStack] = useState<string[]>(() => apps.slice(0, 2).map((a) => a.id));
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const area = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const focus = (id: string) => setStack((s) => [...s.filter((w) => w !== id), id]);
  const close = (id: string) => setStack((s) => s.filter((w) => w !== id));
  const toggle = (id: string) => (stack.at(-1) === id ? close(id) : focus(id));

  const drag = (id: string, e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    const win = e.currentTarget.parentElement!;
    const box = area.current!.getBoundingClientRect();
    const start = { px: e.clientX, py: e.clientY, x: win.offsetLeft, y: win.offsetTop };
    focus(id);
    const move = (ev: PointerEvent) => {
      const x = Math.min(Math.max(start.x + ev.clientX - start.px, 0), box.width - 120);
      const y = Math.min(Math.max(start.y + ev.clientY - start.py, 0), box.height - 48);
      setPos((p) => ({ ...p, [id]: { x, y } }));
    };
    const up = () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
  };

  // where each window opens, in % of the desktop, until it is dragged
  const START = [
    { l: 20, t: 6 },
    { l: 44, t: 22 },
    { l: 30, t: 34 },
    { l: 52, t: 10 },
  ];

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="mx-auto max-w-7xl px-5 py-28 sm:px-8 lg:py-40"
    >
      <Head title={labels.title}>
        <p className="font-mono text-xs tracking-widest text-muted uppercase">
          clique nos ícones · arraste as janelas
        </p>
      </Head>
      <div className="dk">
        <div className="dk-bar">
          <span className="font-semibold">Kevin OS</span>
          <span className="max-sm:hidden">{labels.title}</span>
          <span className="ml-auto font-mono tabular-nums">{clock}</span>
        </div>

        <div ref={area} className="dk-area">
          <ul className="dk-icons">
            {apps.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className="dk-icon"
                  data-open={stack.includes(a.id)}
                  onClick={() => focus(a.id)}
                >
                  <span className="dk-icon__art">
                    {a.card?.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element -- tiny icon art
                      <img src={a.card.poster} alt="" />
                    ) : (
                      <span className="font-display text-2xl">{a.card ? a.title[0] : "+"}</span>
                    )}
                  </span>
                  <span className="dk-icon__label">{a.title.split(" · ")[0]}</span>
                </button>
              </li>
            ))}
          </ul>

          {apps.map((a, i) => {
            const z = stack.indexOf(a.id);
            if (z === -1) return null;
            const p = pos[a.id];
            const s = START[i] ?? START[0]!;
            return (
              <article
                key={a.id}
                className="dk-win"
                data-front={z === stack.length - 1}
                aria-label={a.title}
                onPointerDown={() => focus(a.id)}
                style={{
                  zIndex: 10 + z,
                  left: p ? `${p.x}px` : `${s.l}%`,
                  top: p ? `${p.y}px` : `${s.t}%`,
                }}
              >
                <header className="dk-win__bar" onPointerDown={(e) => drag(a.id, e)}>
                  <button
                    type="button"
                    className="dk-dot dk-dot--close"
                    aria-label={`Fechar ${a.title}`}
                    onClick={() => close(a.id)}
                  />
                  <i className="dk-dot" />
                  <i className="dk-dot" />
                  <span className="dk-win__title">{a.title}</span>
                </header>
                {a.card ? (
                  <div>
                    <div className="aspect-[16/9] overflow-hidden">
                      <Visual card={a.card} />
                    </div>
                    <div className="grid gap-4 p-5">
                      <p className="text-sm text-muted">{a.card.tagline}</p>
                      <Metric card={a.card} />
                      <Open slug={a.card.slug} label={labels.open} />
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[22rem] overflow-y-auto px-5 pb-3">
                    <OthersList others={others} />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <nav className="dk-dock" aria-label="Dock">
          {apps.map((a) => (
            <button
              key={a.id}
              type="button"
              className="dk-dock__app"
              data-open={stack.includes(a.id)}
              aria-label={a.title}
              title={a.title}
              onClick={() => toggle(a.id)}
            >
              {a.card?.poster ? (
                // eslint-disable-next-line @next/next/no-img-element -- tiny dock art
                <img src={a.card.poster} alt="" />
              ) : (
                <span className="font-display text-lg">{a.card ? a.title[0] : "+"}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Problema primeiro */

/** Giant type: the impact line lights up word by word as it scrolls in, then the number. */
export function ProblemFirst({ cards, others, labels }: ViewProps) {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="mx-auto max-w-7xl px-5 py-28 sm:px-8 lg:py-40"
    >
      <Head title={labels.title} />
      <ol>
        {cards.map((card) => {
          const words = (card.impact ?? card.tagline).split(" ");
          return (
            <li key={card.slug} data-project={card.slug} className="pb-block">
              <p className="font-mono text-xs tracking-widest text-accent uppercase">
                {card.index} · {card.meta}
              </p>
              <p className="pb-line" aria-label={card.impact ?? card.tagline}>
                {words.map((w, i) => (
                  <span
                    key={i}
                    aria-hidden
                    style={{ "--i": i, "--n": words.length } as React.CSSProperties}
                  >
                    {w}{" "}
                  </span>
                ))}
              </p>
              <div className="pb-result">
                <div className="pb-result__img">
                  <Visual card={card} />
                </div>
                <div>
                  {card.metric && (
                    <p className="font-display text-[clamp(4rem,12vw,9rem)] leading-none text-accent">
                      {card.metric.value}
                    </p>
                  )}
                  {card.metric && <p className="mt-2 text-muted">{card.metric.label}</p>}
                  <h3 className="mt-8 font-display text-4xl uppercase sm:text-5xl">{card.title}</h3>
                  <p className="mt-3 max-w-md text-muted">{card.tagline}</p>
                  <div className="mt-6">
                    <Open slug={card.slug} label={labels.open} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <h3 className="mt-16 mb-6 font-mono text-sm tracking-widest text-muted uppercase">
        {labels.other}
      </h3>
      <OthersList others={others} />
    </section>
  );
}

/* ------------------------------------------------------------------ Log de commits */

/** A short hex from the slug: decoration for the commit line, same on server and client. */
function hash(s: string) {
  let h = 0x811c9dc5;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

/** The projects as a git log: each commit opens into its project (native <details>). */
export function Commits({ cards, others, labels }: ViewProps) {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="mx-auto max-w-5xl px-5 py-28 sm:px-8 lg:py-40"
    >
      <Head title={labels.title} />
      <div className="gl">
        <p className="gl-cmd">
          <span className="text-accent">kevin@portfolio</span>:~$ git log --graph projetos
        </p>
        <ol className="gl-list">
          {cards.map((card, i) => (
            <li key={card.slug} data-project={card.slug} className="gl-item">
              <details open={i === 0} name="commit">
                <summary className="gl-summary">
                  <span className="gl-node" aria-hidden />
                  <span className="gl-hash">{hash(card.slug)}</span>
                  <span className="gl-msg">
                    <span className="text-accent">feat:</span> {card.title}
                  </span>
                  <span className="gl-date">{card.year}</span>
                </summary>
                <div className="gl-body">
                  <div className="gl-body__img">
                    <Visual card={card} />
                  </div>
                  <div className="grid content-start gap-4">
                    <p className="text-muted">{card.tagline}</p>
                    {card.metrics.length > 0 && (
                      <dl className="grid grid-cols-2 gap-4">
                        {card.metrics.slice(0, 4).map((m) => (
                          <div key={m.label} className="flex flex-col">
                            <dt className="order-2 text-xs text-muted">{m.label}</dt>
                            <dd className="font-display text-4xl text-accent">{m.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <ul className="flex flex-wrap gap-1.5">
                      {card.stack.map((s) => (
                        <li
                          key={s}
                          className="rounded-full border border-border px-3 py-1 font-mono text-[11px]"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                    <Open slug={card.slug} label={labels.open} />
                  </div>
                </div>
              </details>
            </li>
          ))}
          <li className="gl-item">
            <details name="commit">
              <summary className="gl-summary">
                <span className="gl-node gl-node--hollow" aria-hidden />
                <span className="gl-hash">{hash("others")}</span>
                <span className="gl-msg">
                  <span className="text-muted">chore:</span> {labels.other} ({others.length})
                </span>
              </summary>
              <div className="gl-body gl-body--list">
                <OthersList others={others} />
              </div>
            </details>
          </li>
        </ol>
      </div>
    </section>
  );
}

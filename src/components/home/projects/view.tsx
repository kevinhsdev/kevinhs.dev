"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { clamp } from "@/motion/math";
import { createPin } from "@/motion/pin";
import { prefersReduced } from "@/motion/reduced";
import { BeforeAfter, Commits, Desktop, ProblemFirst } from "./variants";

export type Card = {
  slug: string;
  index: string;
  title: string;
  meta: string;
  tagline: string;
  summary: string;
  year: number;
  stack: string[];
  metrics: { value: string; label: string }[];
  metric?: { value: string; label: string };
  impact?: string;
  poster?: string;
  video?: string;
};
export type Other = { slug: string; title: string; tagline: string; year: number };
export type Labels = { title: string; other: string; open: string };
export type ViewProps = { cards: Card[]; others: Other[]; labels: Labels };

const VARIANTS = {
  filme: "Filme",
  antes: "Antes → Depois",
  mesa: "Área de trabalho",
  problema: "Problema primeiro",
  commits: "Log de commits",
};

/**
 * Picks the layout. The film is the section; ?projetos=antes|mesa|problema|commits shows the
 * other ideas Kevin asked to see. ponytail: delete variants.tsx and this switch once he decides.
 */
export function ProjectsView(props: ViewProps) {
  const [variant, setVariant] = useState<string | null>(null);
  useEffect(() => {
    const v = new URLSearchParams(location.search).get("projetos");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once after hydration
    if (v) setVariant(v);
  }, []);
  const View =
    variant === "antes"
      ? BeforeAfter
      : variant === "mesa"
        ? Desktop
        : variant === "problema"
          ? ProblemFirst
          : variant === "commits"
            ? Commits
            : Film;
  const pick = (v: string) => {
    setVariant(v === "filme" ? null : v);
    history.replaceState(null, "", v === "filme" ? location.pathname : `?projetos=${v}`);
  };
  return (
    <>
      {/* ponytail: temporary picker so Kevin can compare; delete with variants.tsx */}
      <div
        role="group"
        aria-label="Variantes da seção de projetos"
        className="fixed top-5 left-1/2 z-50 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-full border border-border bg-surface/90 p-1 text-xs font-semibold shadow-2xl backdrop-blur max-md:top-20"
      >
        {Object.entries(VARIANTS).map(([v, name]) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              pick(v);
              requestAnimationFrame(() => document.getElementById("projects")?.scrollIntoView());
            }}
            aria-pressed={(variant ?? "filme") === v}
            className="rounded-full px-3 py-2 whitespace-nowrap aria-pressed:bg-accent aria-pressed:text-accent-contrast"
          >
            {name}
          </button>
        ))}
      </div>
      <View key={variant ?? "film"} {...props} />
    </>
  );
}

/** The poster, or (no screenshot yet) the title on an accent glow. */
export function Visual({ card, className = "" }: { card: Card; className?: string }) {
  return card.poster ? (
    // eslint-disable-next-line @next/next/no-img-element -- moved by transforms every frame
    <img src={card.poster} alt="" className={`size-full object-cover ${className}`} />
  ) : (
    <div
      className={`grid size-full place-items-center bg-[radial-gradient(80%_90%_at_70%_20%,var(--accent-soft),var(--surface)_75%)] ${className}`}
    >
      <span className="px-6 text-center font-display text-5xl text-accent uppercase sm:text-7xl">
        {card.title}
      </span>
    </div>
  );
}

export function Metric({ card }: { card: Card }) {
  if (card.metric)
    return (
      <p className="flex items-baseline gap-4">
        <strong className="font-display text-6xl leading-none text-accent sm:text-7xl">
          {card.metric.value}
        </strong>
        <span className="max-w-[13rem] text-sm text-muted">{card.metric.label}</span>
      </p>
    );
  return card.impact ? (
    <p className="max-w-sm border-l-2 border-accent pl-4 text-sm">{card.impact}</p>
  ) : null;
}

export function OthersList({ others }: { others: Other[] }) {
  return (
    <ul className="border-t border-border">
      {others.map((p) => (
        <li key={p.slug} data-project={p.slug} className="border-b border-border">
          <Link
            href={`/projects/${p.slug}`}
            className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-5 transition-colors hover:text-accent"
          >
            <span className="font-display text-2xl uppercase sm:text-3xl">{p.title}</span>
            <ArrowUpRight
              aria-hidden
              className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
            <span className="col-span-2 text-sm text-muted">{p.tagline}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Filme horizontal: the section pins and the vertical scroll runs a horizontal track of wide
 * panels (poster in parallax, the big number); the last panel holds the other 4 projects.
 */
function Film({ cards, others, labels }: ViewProps) {
  const root = useRef<HTMLElement>(null);
  const total = cards.length + 1;

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) {
      if (el) el.dataset.static = "true";
      return;
    }
    const track = el.querySelector<HTMLElement>(".pf-track")!;
    const panels = [...el.querySelectorAll<HTMLElement>(".pf-panel")];
    const imgs = panels.map((p) => p.querySelector<HTMLElement>(".pf-parallax"));
    const bar = el.querySelector<HTMLElement>(".pf-bar > i")!;
    const count = el.querySelector<HTMLElement>(".pf-count b")!;
    const run = total - 1; // screens of horizontal travel; the rest is a hold at the end

    const render = (s: number) => {
      const p = clamp(s / run, 0, 1);
      const distance = track.scrollWidth - el.clientWidth;
      const x = -p * distance;
      track.style.transform = `translate3d(${x}px,0,0)`;
      const vw = el.clientWidth;
      panels.forEach((panel, i) => {
        const center = panel.offsetLeft + panel.offsetWidth / 2 + x;
        const off = (center - vw / 2) / vw; // -1..1 around the screen center
        const img = imgs[i];
        if (img) img.style.transform = `translate3d(${off * -9}%,0,0) scale(1.18)`;
        panel.dataset.active = String(Math.abs(off) < 0.3);
      });
      bar.style.transform = `scaleX(${p})`;
      count.textContent = String(Math.round(p * run) + 1).padStart(2, "0");
    };
    const pin = createPin({ el, screens: run + 0.4, render });
    return () => pin.kill();
  }, [total]);

  return (
    // Pinned: the root is a React-owned div, since ScrollTrigger wraps the section in a spacer.
    <div>
      <section ref={root} id="projects" aria-labelledby="projects-title" className="pf">
        <header className="pf-head">
          <h2 id="projects-title" className="font-display text-5xl uppercase sm:text-7xl">
            {labels.title}
          </h2>
          <p className="pf-count font-mono text-sm text-muted" aria-hidden>
            <b className="font-normal text-foreground">01</b> / {String(total).padStart(2, "0")}
          </p>
        </header>

        <div className="pf-viewport">
          <ol className="pf-track">
            {cards.map((card) => (
              <li key={card.slug} className="pf-panel" data-project={card.slug}>
                <Link href={`/projects/${card.slug}`} className="pf-card group">
                  <div className="pf-visual">
                    <div className="pf-parallax">
                      <Visual card={card} />
                    </div>
                  </div>
                  <div className="pf-text">
                    <p className="font-mono text-xs tracking-widest text-accent uppercase">
                      {card.index} · {card.meta}
                    </p>
                    <h3 className="mt-3 font-display text-5xl leading-[0.95] uppercase sm:text-6xl">
                      {card.title}
                    </h3>
                    <p className="mt-4 max-w-md text-muted">{card.tagline}</p>
                    <div className="mt-8">
                      <Metric card={card} />
                    </div>
                    <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
                      {labels.open}
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
            <li className="pf-panel pf-panel--others">
              <div className="pf-card pf-card--others">
                <h3 className="mb-6 font-mono text-sm tracking-widest text-muted uppercase">
                  {labels.other}
                </h3>
                <OthersList others={others} />
              </div>
            </li>
          </ol>
        </div>

        <div className="pf-bar" aria-hidden>
          <i />
        </div>
      </section>
    </div>
  );
}

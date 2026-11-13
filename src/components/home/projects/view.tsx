"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { prefersReduced } from "@/motion/reduced";

export type Card = {
  slug: string;
  index: string;
  title: string;
  status: string;
  year: number;
  tagline: string;
  stack: string[];
  metric?: { value: string; label: string };
  poster?: string;
  video?: string;
};
type Props = {
  cards: Card[];
  labels: { title: string; open: string; count: string; soon: string; other: string };
};

/** "Coming soon" where a screenshot will go: the words outlined, a light sweeping, the dots. */
function Soon({ label }: { label: string }) {
  return (
    <div className="pc-cover" aria-hidden>
      <span className="pc-soon">
        {label}
        <span className="pc-soon__dots">
          <i />
          <i />
          <i />
        </span>
      </span>
    </div>
  );
}

/**
 * The featured projects with a video as media cards (the video plays only while on screen), then the
 * rest as a list whose rows show their picture floating by the cursor. Everything rises in.
 */
export function ProjectsView({ cards, labels }: Props) {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const featured = cards.filter((c) => c.video);
  const others = cards.filter((c) => !c.video);

  useEffect(() => {
    const el = root.current!;
    const reduced = prefersReduced();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const item = e.target as HTMLElement;
          if (e.isIntersecting) item.dataset.in = "true";
          const video = item.querySelector("video");
          if (!video || reduced) continue;
          if (e.intersectionRatio > 0.35) void video.play().catch(() => {});
          else video.pause();
        }
      },
      { threshold: [0, 0.15, 0.35, 0.6] },
    );
    el.querySelectorAll(".pc, .pl-item").forEach((c) => io.observe(c));

    // the preview trails the cursor over the list (eased, so it floats rather than sticks)
    const ol = list.current!;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const tick = () => {
      x += (tx - x) * (reduced ? 1 : 0.18);
      y += (ty - y) * (reduced ? 1 : 0.18);
      ol.style.setProperty("--px", `${x}px`);
      ol.style.setProperty("--py", `${y}px`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = ol.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (e.type === "pointerenter") {
        x = tx;
        y = ty;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    ol.addEventListener("pointerenter", move);
    ol.addEventListener("pointermove", move);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      ol.removeEventListener("pointerenter", move);
      ol.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <section
      ref={root}
      id="projects"
      aria-labelledby="projects-title"
      className="mx-auto max-w-7xl px-5 pt-28 pb-12 sm:px-8 lg:pt-36 lg:pb-16"
    >
      <header className="mb-12 flex items-end justify-between gap-6">
        <h2 id="projects-title" className="font-display text-5xl uppercase sm:text-7xl">
          {labels.title}
        </h2>
        <p className="flex items-baseline gap-2 pb-1 sm:pb-2" aria-hidden>
          <span className="font-display text-4xl text-accent-strong sm:text-5xl">
            {String(cards.length).padStart(2, "0")}
          </span>
          <span className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
            {labels.count}
          </span>
        </p>
      </header>

      <ol className="pc-grid">
        {featured.map((card) => (
          <li key={card.slug} className="pc" data-project={card.slug}>
            <Link href={`/projects/${card.slug}`} className="pc-link group">
              <div className="pc-media">
                {card.video ? (
                  <video
                    src={card.video}
                    poster={card.poster}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-hidden
                  />
                ) : card.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static poster
                  <img src={card.poster} alt="" />
                ) : (
                  <Soon label={labels.soon} />
                )}
              </div>
              <span className="pc-arrow" aria-hidden>
                <ArrowUpRight className="size-5" />
              </span>
              <div className="pc-body">
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-80">
                  {card.index} · {card.status} · {card.year}
                </p>
                <h3 className="pc-title">{card.title}</h3>
                <p className="pc-tag">{card.tagline}</p>
                <div className="pc-foot">
                  {card.metric && (
                    <p className="pc-metric">
                      <b>{card.metric.value}</b>
                      <span>{card.metric.label}</span>
                    </p>
                  )}
                  <ul className="pc-stack">
                    {card.stack.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <span className="sr-only">{labels.open}</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-20 mb-4 font-mono text-xs tracking-widest text-accent uppercase">
        {labels.other}
      </p>
      <ol ref={list} className="pl-list">
        {others.map((card) => (
          <li key={card.slug} className="pl-item" data-project={card.slug}>
            <Link href={`/projects/${card.slug}`} className="pl-row group">
              <span className="pl-num" aria-hidden>
                {card.index}
              </span>
              <span className="pl-main">
                <h3 className="pl-title">{card.title}</h3>
                <span className="pl-tag">{card.tagline}</span>
              </span>
              <span className="pl-stack">{card.stack.slice(0, 3).join(" · ")}</span>
              <span className="pl-status">
                {card.status} · {card.year}
              </span>
              <span className="pl-arrow" aria-hidden>
                <ArrowUpRight className="size-5" />
              </span>
              <span className="pl-thumb" aria-hidden>
                {card.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static screenshot
                  <img src={card.poster} alt="" />
                ) : (
                  <Soon label={labels.soon} />
                )}
              </span>
              <span className="sr-only">{labels.open}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

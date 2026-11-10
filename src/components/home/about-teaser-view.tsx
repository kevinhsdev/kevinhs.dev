"use client";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { ShaderStage } from "@/components/stage/shader-stage";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { clamp } from "@/motion/math";
import { prefersReduced } from "@/motion/reduced";
import "./about-teaser.css";

type L = { pt: string; en: string };
const css = (v: Record<string, string | number>) => v as React.CSSProperties;

/** Three beats: each line lights up in turn, its number gets a stroke, its photos land. */
const LINES: { before: L; num: L; after: L }[] = [
  {
    before: { pt: "Comecei a programar aos ", en: "I started coding at " },
    num: { pt: "15", en: "15" },
    after: { pt: ".", en: "." },
  },
  {
    before: { pt: "Trabalho desde os ", en: "I've been working since " },
    num: { pt: "17", en: "17" },
    after: {
      pt: " e estudo Engenharia de Software na UMC.",
      en: " and study Software Engineering at UMC.",
    },
  },
  {
    before: { pt: "Hoje, a secretaria da escola usa ", en: "Today, the school office uses " },
    num: { pt: "dois", en: "two" },
    after: { pt: " sistemas meus todo dia.", en: " systems of mine every day." },
  },
];

/** b: the line it lands with, j: its turn within that line; x/y/r: where it rests on the desk. */
const PRINTS = [
  {
    src: "/about/adesivos.jpg",
    cap: { pt: "aos 15", en: "at 15" },
    b: 0,
    j: 0,
    x: "3%",
    y: "0%",
    r: -8,
    w: 400,
    h: 500,
  },
  {
    src: "/about/notebook.jpg",
    cap: { pt: "no código", en: "in code" },
    b: 0,
    j: 1,
    x: "4%",
    y: "64%",
    r: 5,
    w: 400,
    h: 500,
  },
  {
    src: "/about/umc.jpg",
    cap: { pt: "UMC", en: "UMC" },
    b: 1,
    j: 0,
    x: "84%",
    y: "4%",
    r: 6,
    w: 400,
    h: 500,
  },
  {
    src: "/about/teclado.jpg",
    cap: { pt: "na música", en: "music" },
    b: 2,
    j: 0,
    x: "13%",
    y: "33%",
    r: -5,
    w: 400,
    h: 500,
  },
  {
    src: "/about/malta-rua.jpg",
    cap: { pt: "Malta", en: "Malta" },
    b: 2,
    j: 1,
    x: "79%",
    y: "52%",
    r: 4,
    w: 400,
    h: 500,
  },
];

/**
 * --p (0..1) on the wrapper as it scrolls: on wide screens the wrapper is tall and its stage
 * sticks, so p runs while the stage holds still; on phones it runs as the block rises.
 * --w (1..0..1) is how shut the window is: it opens as the block comes up the screen and
 * closes again as it leaves.
 */
function useProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current!;
    if (prefersReduced()) {
      el.style.setProperty("--p", "1");
      el.style.setProperty("--w", "0");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = innerHeight;
      const p = innerWidth >= 1024 ? -r.top / (r.height - vh) : (vh - r.top) / (vh * 0.9);
      el.style.setProperty("--p", clamp(p, 0, 1).toFixed(4));
      const shut = Math.max(1 - (vh - r.top) / vh, (vh - r.bottom) / vh);
      el.style.setProperty("--w", clamp(shut, 0, 1).toFixed(4));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
    };
  }, []);
  return ref;
}

export function AboutTeaserView({
  kicker,
  more,
  locale,
}: {
  kicker: string;
  more: string;
  locale: Locale;
}) {
  const ref = useProgress<HTMLDivElement>();
  return (
    <>
      <div ref={ref} className="abv">
        <ShaderStage kind="nebulosa" className="abv-stage">
          <div className="abv-inner">
            <div className="abc-prints" aria-hidden>
              {PRINTS.map((p) => (
                <span
                  key={p.src}
                  style={css({
                    "--x": p.x,
                    "--y": p.y,
                    "--r": `${p.r}deg`,
                    "--b": p.b,
                    "--j": p.j,
                  })}
                >
                  <Image src={p.src} alt="" width={p.w} height={p.h} />
                  <em>{p.cap[locale]}</em>
                </span>
              ))}
            </div>
            <div className="abc-center">
              <p className="abv-kicker">{kicker}</p>
              <h2 id="about-teaser-title" className="abv-headline">
                {LINES.map((l, i) => (
                  <span key={i} style={css({ "--b": i })}>
                    {l.before[locale]}
                    <mark>{l.num[locale]}</mark>
                    {l.after[locale]}{" "}
                  </span>
                ))}
              </h2>
              <Link href="/about" className="abv-cta">
                {more}
                <ArrowRight aria-hidden className="size-5" />
              </Link>
            </div>
          </div>
        </ShaderStage>
      </div>
    </>
  );
}

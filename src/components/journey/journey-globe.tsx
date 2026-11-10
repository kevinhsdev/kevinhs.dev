"use client";

import { useEffect, useRef, type RefObject } from "react";
import { readToken } from "@/lib/color";
import { createEarth } from "@/lib/earth-gl";
import { MALTA, type LatLon } from "@/lib/journey";
import { apply, arcPath, seen, toVec, viewFacing, type Vec3 } from "@/lib/sphere";

/**
 * The journey's globe: the Earth at night (lib/earth-gl.ts) turned and zoomed by the scroll
 * through `view`, with the arcs, the markers, the city labels and the photo cards pinned to
 * their places, all placed from the same projection every frame.
 */
export type GlobeView = {
  /** The point facing the viewer, in degrees, and cobe-style zoom (1 ≈ the globe in view). */
  lat: number;
  lon: number;
  zoom: number;
  /** Reduced motion: one still frame, the cards laid out as a gallery. */
  still: boolean;
  /** `live` places breathe; the plane is the bright one. */
  markers: { at: LatLon; size: number; plane?: boolean; live?: boolean }[];
  /** `trail`: the arc's head glows behind the plane. */
  arcs: { from: LatLon; to: LatLon; t: number; trail?: boolean }[];
  labels: Record<string, boolean>;
  card: number | null;
  /** How far the shown card is through its turn, 0 to 1 (the bar on top of it). */
  cardProgress: number;
  /** Malta's landing ring, 0 to 1 (0 = none). */
  landing: number;
  /** Distance flown so far, shown by the plane (null = not flying). */
  km: number | null;
};

export type GlobeLabel = { id: string; text: string; at: LatLon; side: "top" | "left" | "right" };
export type GlobeCard = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  focus?: string;
  at: LatLon;
};

const big = (maxTexture: number) => maxTexture >= 8192 && innerWidth > 760;
const rgba = (c: Vec3, a: number) => `rgba(${c.map((x) => Math.round(x * 255)).join(",")},${a})`;

export function JourneyGlobe({
  view,
  labels,
  cards,
}: {
  view: RefObject<GlobeView>;
  labels: GlobeLabel[];
  cards: GlobeCard[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const arcRef = useRef<HTMLCanvasElement>(null);
  const cardsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = root.current!;
    const arcCanvas = arcRef.current!;
    const ctx = arcCanvas.getContext("2d");
    const earth =
      ctx &&
      createEarth(glRef.current!, {
        // 8k where the GPU and the screen can use it, 4k elsewhere (phones)
        night: { src: (max) => `/earth-${big(max) ? "8k" : "4k"}.webp` },
        day: { src: (max) => `/earth-day-${big(max) ? "8k" : "4k"}.webp` },
        // the night's colours are dim: the light 4k is plenty
        tint: { src: "/earth-day-4k.webp" },
      });
    if (!ctx || !earth) return;
    const labelEls = [...el.querySelectorAll<HTMLElement>(".jg-label:not(.jg-km)")];
    const cardEls = [...cardsRef.current!.querySelectorAll<HTMLElement>(".jg-card")];
    const kmEl = el.querySelector<HTMLElement>(".jg-km")!;
    const kmFormat = new Intl.NumberFormat(document.documentElement.lang || undefined, {
      maximumFractionDigits: 0,
    });
    let day = false;

    let accent: Vec3 = [0.3, 0.55, 1];
    let strong: Vec3 = accent;
    let cxFrac = 0.62;
    let w = 0;
    let h = 0;
    const measure = () => {
      accent = readToken("accent", el) as Vec3;
      strong = readToken("accent-strong", el) as Vec3;
      cxFrac = (parseFloat(getComputedStyle(el).getPropertyValue("--cx")) || 62) / 100;
      day = !document.documentElement.classList.contains("dark");
      w = el.clientWidth;
      h = el.clientHeight;
    };
    measure();

    const draw = () => {
      const v = view.current;
      if (!v || !w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // the globe's size follows the layout: --g in journey.css, zoomed by the scroll
      const g =
        innerWidth <= 760 ? 0.9 * innerWidth : Math.min(0.78 * innerHeight, 0.46 * innerWidth);
      const cx = v.still ? w / 2 : cxFrac * w;
      const cy = h / 2;
      const R = v.still ? 0.45 * Math.min(w, h) : 0.4 * g * v.zoom;
      const m = viewFacing(v.lat, v.lon);
      earth.draw({ w, h, dpr, cx, cy, R, m, accent, day });
      const now = performance.now();
      const at = (ll: LatLon) => {
        const p = apply(m, toVec(...ll));
        return { x: cx + R * p[0], y: cy - R * p[1], z: p[2] };
      };

      if (arcCanvas.width !== Math.round(w * dpr) || arcCanvas.height !== Math.round(h * dpr)) {
        arcCanvas.width = Math.round(w * dpr);
        arcCanvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // the arcs so far
      for (const arc of v.arcs) {
        const pts = arcPath(toVec(...arc.from), toVec(...arc.to), arc.t).map((p) => {
          const q = apply(m, p);
          return seen(q) ? ([cx + R * q[0], cy - R * q[1]] as const) : null;
        });
        ctx.beginPath();
        let pen = false;
        for (const p of pts) {
          if (p && pen) ctx.lineTo(...p);
          else if (p) ctx.moveTo(...p);
          pen = !!p;
        }
        ctx.lineWidth = 1.75;
        ctx.strokeStyle = rgba(strong, 0.9);
        ctx.shadowColor = rgba(strong, 0.8);
        ctx.shadowBlur = 8;
        ctx.stroke();
        // the trail: the last stretch, brightening and widening up to the plane
        if (arc.trail) {
          const tail = pts.slice(-28);
          ctx.lineCap = "round";
          ctx.shadowColor = rgba(strong, 1);
          ctx.shadowBlur = 14;
          for (let k = 1; k < tail.length; k++) {
            const a = tail[k - 1];
            const b = tail[k];
            if (!a || !b) continue;
            const f = k / tail.length;
            ctx.beginPath();
            ctx.moveTo(...a);
            ctx.lineTo(...b);
            ctx.lineWidth = 1.75 + f * 2.25;
            ctx.strokeStyle = `rgba(255,255,255,${f * f * 0.9})`;
            ctx.stroke();
          }
          ctx.lineCap = "butt";
        }
        ctx.shadowBlur = 0;
      }
      // the markers (the plane is the bright one); live places send out a slow ring
      for (const mk of v.markers) {
        const p = at(mk.at);
        if (p.z <= 0.04) continue;
        ctx.globalAlpha = Math.min(1, p.z * 6);
        if (mk.live && !v.still) {
          const f = (now / 2400 + mk.at[1] / 90) % 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, mk.size + 4 + f * 18, 0, Math.PI * 2);
          ctx.lineWidth = 1.25;
          ctx.strokeStyle = rgba(strong, 0.6 * (1 - f));
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, mk.size + 5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(strong, 0.22);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, mk.size, 0, Math.PI * 2);
        ctx.fillStyle = mk.plane ? "#fff" : rgba(strong, 1);
        ctx.shadowColor = rgba(strong, 1);
        ctx.shadowBlur = mk.plane ? 16 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      // Malta's landing: one wide ring as the plane touches down
      if (v.landing > 0 && v.landing < 1) {
        const p = at(MALTA);
        if (p.z > 0.04) {
          const f = 1 - (1 - v.landing) ** 3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 + f * 70, 0, Math.PI * 2);
          ctx.lineWidth = 2.5 * (1 - v.landing) + 0.5;
          ctx.strokeStyle = rgba(strong, 0.85 * (1 - v.landing));
          ctx.shadowColor = rgba(strong, 1);
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
      // the distance flown, riding next to the plane
      const plane = v.km !== null ? v.markers.find((mk) => mk.plane) : undefined;
      const pp = plane && at(plane.at);
      const kmOn = !!pp && pp.z > 0.08;
      if (kmEl.dataset.on !== String(kmOn)) kmEl.dataset.on = String(kmOn);
      if (pp && kmOn) {
        const text = `${kmFormat.format(Math.round(v.km! / 10) * 10)} km`;
        if (kmEl.textContent !== text) kmEl.textContent = text;
        kmEl.style.translate = `${pp.x}px ${pp.y}px`;
      }
      // the labels, on their side of the point
      labels.forEach((l, i) => {
        const e = labelEls[i]!;
        const p = at(l.at);
        const on = !!v.labels[l.id] && p.z > 0.08;
        if (e.dataset.on !== String(on)) e.dataset.on = String(on);
        if (on) e.style.translate = `${p.x}px ${p.y}px`;
      });
      // the photo card: next to its place, on the side with room, tied to it by a line
      if (v.still) return;
      cardEls.forEach((e, i) => {
        const p = at(cards[i]!.at);
        const on = v.card === i && p.z > 0.15;
        if (e.dataset.on !== String(on)) e.dataset.on = String(on);
        if (!on) return;
        e.style.setProperty("--p", v.cardProgress.toFixed(3));
        const cw = e.offsetWidth;
        const ch = e.offsetHeight;
        // clear of the place's own label, which sits centered above the point
        const li = labels.findIndex((l) => l.at === cards[i]!.at);
        const gap = Math.max(28, (labelEls[li]?.offsetWidth ?? 0) / 2 + 16);
        const right = p.x + gap + cw <= w - 16;
        const x = right ? p.x + gap : p.x - gap - cw;
        const y = Math.min(Math.max(p.y - 28 - ch, 72), h - ch - 16);
        e.style.translate = `${x}px ${y}px`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(right ? x : x + cw, Math.min(y + ch, Math.max(y, p.y)));
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(strong, 0.7);
        ctx.stroke();
      });
    };

    let raf = 0;
    let visible = false;
    const loop = () => {
      raf = visible ? requestAnimationFrame(loop) : 0;
      draw();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    const ro = new ResizeObserver(() => {
      measure();
      draw();
    });
    ro.observe(el);
    const mo = new MutationObserver(() => {
      measure();
      draw();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-accent", "class"],
    });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      earth.destroy();
    };
  }, [view, labels, cards]);

  return (
    <>
      <div ref={root} className="jr-globe">
        <canvas ref={glRef} className="jg-canvas" aria-hidden />
        <canvas ref={arcRef} className="jg-canvas" aria-hidden />
        {labels.map((l) => (
          <div key={l.id} className="jg-label" data-side={l.side} data-on="false" aria-hidden>
            {l.text}
          </div>
        ))}
        <div className="jg-label jg-km" data-on="false" aria-hidden />
      </div>
      <ul ref={cardsRef} className="jr-cards">
        {cards.map((c, i) => (
          <li key={c.src} className="jg-card" data-on="false" data-i={i}>
            {/* story-style bars: one per photo of this place, the current one filling with the scroll */}
            <span className="jg-bars" aria-hidden>
              {cards
                .filter((x) => x.at === c.at)
                .map((x) => (
                  <i
                    key={x.src}
                    data-state={x === c ? "now" : cards.indexOf(x) < i ? "done" : undefined}
                  />
                ))}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element -- small fixed-size cards */}
            <img
              src={c.src}
              alt={c.alt}
              width={c.width}
              height={c.height}
              loading="lazy"
              style={{ objectPosition: c.focus }}
            />
            <span className="jg-cap">
              <i aria-hidden />
              {c.caption}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

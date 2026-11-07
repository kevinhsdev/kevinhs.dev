"use client";

import createGlobe from "cobe";
import { useEffect, useRef, type RefObject } from "react";
import { readToken } from "@/lib/color";
import type { LatLon } from "@/lib/journey";

/**
 * The journey's globe: cobe 2.0.1 set up as in the Cobe Globe prompt (map dots, markers, arcs,
 * labels on CSS anchors that blur away behind the globe), but phi/theta and what is drawn
 * come from `view` every frame instead of auto-spin and drag: the scroll drives it.
 */
export type GlobeView = {
  phi: number;
  theta: number;
  markers: { id: string; location: LatLon; size: number }[];
  arcs: { id: string; from: LatLon; to: LatLon }[];
};

export type GlobeLabel = { id: string; text: string; arc?: boolean };

function colors() {
  const dark = document.documentElement.classList.contains("dark");
  return {
    dark: dark ? 1 : 0,
    baseColor: (dark ? [0.32, 0.36, 0.46] : [1, 1, 1]) as [number, number, number],
    markerColor: readToken("accent"),
    arcColor: readToken("accent"),
    glowColor: readToken(dark ? "accent-soft" : "surface"),
    mapBrightness: dark ? 5 : 10,
  };
}

export function JourneyGlobe({
  view,
  labels,
}: {
  view: RefObject<GlobeView>;
  labels: GlobeLabel[];
}) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const canvas = document.createElement("canvas");
    canvas.className = "jg-canvas";
    stage.append(canvas);

    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;
    let size = 0;
    let visible = true;
    let palette = colors();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const v = view.current;
      if (!globe || !visible || !v) return;
      globe.update({ phi: v.phi, theta: v.theta, ...palette, markers: v.markers, arcs: v.arcs });
    };

    const init = () => {
      size = canvas.offsetWidth;
      if (!size) return;
      const v = view.current;
      globe = createGlobe(canvas, {
        // The canvas is drawn at its zoomed-in size and scaled down, so 1× is already crisp.
        devicePixelRatio: 1,
        width: size,
        height: size,
        phi: v?.phi ?? 0,
        theta: v?.theta ?? 0,
        diffuse: 1.5,
        mapSamples: 16000,
        markerElevation: 0.01,
        markers: v?.markers ?? [],
        arcs: v?.arcs ?? [],
        arcWidth: 0.6,
        arcHeight: 0.3,
        opacity: 0.8,
        ...palette,
      });
      raf = requestAnimationFrame(frame);
      setTimeout(() => (canvas.style.opacity = "1"));
    };

    const ro = new ResizeObserver(() => {
      if (!globe) return init();
      const width = canvas.offsetWidth;
      if (width && width !== size) {
        size = width;
        globe.update({ width, height: width });
      }
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
    });
    io.observe(stage);
    // Lenis toggles classes on <html> too; re-reading the tokens is cheap.
    const mo = new MutationObserver(() => (palette = colors()));
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-accent"],
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      if (globe) {
        globe.destroy();
        const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      }
      stage.replaceChildren();
    };
  }, [view]);

  return (
    <div className="jg-root" aria-hidden>
      <div ref={stageRef} className="jg-stage" />
      {labels.map((l) => {
        const name = (l.arc ? "arc-" : "") + l.id;
        return (
          <div
            key={name}
            data-id={name}
            className={l.arc ? "jg-label jg-label--arc" : "jg-label"}
            style={
              {
                positionAnchor: `--cobe-${name}`,
                opacity: `var(--cobe-visible-${name}, 0)`,
                filter: `blur(calc((1 - var(--cobe-visible-${name}, 0)) * 8px))`,
              } as React.CSSProperties
            }
          >
            {l.text}
          </div>
        );
      })}
    </div>
  );
}

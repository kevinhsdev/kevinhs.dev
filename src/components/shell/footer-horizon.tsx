"use client";

import { useEffect, useRef } from "react";
import { BASE, monumentMask, mountMetalWord } from "./footer-metal";

/**
 * The footer scene (Campo, ProfitizeBuild, made Kevin's): dusk over the Earth at night (NASA
 * Black Marble, footer-globe.ts), its arcs from São Paulo rising past the horizon, and Kevin's K in liquid metal
 * standing on the limb, its base sinking into the atmosphere.
 */
export function FooterHorizon() {
  const view = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const arcs = useRef<HTMLCanvasElement>(null);
  const monument = useRef<HTMLDivElement>(null);
  const metal = useRef<HTMLSpanElement>(null);

  // the globe (heavy: only near the screen)
  useEffect(() => {
    const el = view.current!;
    let off: (() => void) | undefined;
    let alive = true;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const { mountFooterGlobe } = await import("./footer-globe");
        if (alive) off = mountFooterGlobe(el, canvas.current!, arcs.current!);
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
      off?.();
    };
  }, []);

  // the monument (heavy: only near the screen, fades in when ready)
  useEffect(() => {
    const root = view.current!;
    const m = metal.current!;
    let unmount: (() => void) | undefined;
    let maskUrl = "";
    let alive = true;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const mask = monumentMask();
        maskUrl = URL.createObjectURL(await mask.convertToBlob({ type: "image/png" }));
        if (!alive) return;
        root.style.setProperty("--ar", String(mask.width / mask.height));
        root.style.setProperty("--mask", `url(${maskUrl})`);
        root.classList.add("has-mask");
        const off = await mountMetalWord(m, mask);
        if (alive) unmount = off;
        else off();
      },
      { rootMargin: "400px" },
    );
    io.observe(monument.current!);
    return () => {
      alive = false;
      io.disconnect();
      unmount?.();
      if (maskUrl) URL.revokeObjectURL(maskUrl);
    };
  }, []);

  return (
    <div
      ref={view}
      className="hz-view"
      aria-hidden
      style={{ "--base": BASE } as React.CSSProperties}
    >
      <div className="hz-sky" />
      <canvas ref={canvas} className="hz-globe" />
      <canvas ref={arcs} className="hz-globe hz-arcs is-ready" />
      <div ref={monument} className="hz-monument">
        <span ref={metal} className="hz-metal" />
        <span className="hz-reflect" />
      </div>
      <span className="hz-mist" />
    </div>
  );
}

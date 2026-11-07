"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { mountMetalRing } from "./metal-ring";
import "./mercurio.css";

/** Mercúrio: the pill CTA with the liquid-metal ring; the tint is the site's light accent. */
export function MetalButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const metalRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = metalRef.current!;
    let off: (() => void) | undefined;
    let alive = true;
    const tint = getComputedStyle(el).getPropertyValue("--accent-strong").trim() || undefined;
    const timer = setTimeout(() => {
      mountMetalRing(el, tint)
        .then((d) => (alive ? (off = d) : d()))
        .catch((err) => console.warn("metal: ficou o anel liso", err));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
      off?.();
    };
  }, []);
  return (
    <button className="metal-btn" type="button" onClick={onClick}>
      <span ref={metalRef} className="metal-btn__metal" aria-hidden="true" />
      <span className="metal-btn__label">{children}</span>
      <span className="metal-btn__orb" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 16 16">
          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

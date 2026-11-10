"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { mountMetalRing } from "./metal-ring";
import "./mercurio.css";

/** Mercúrio: the pill CTA with the liquid-metal ring; the tint is the site's light accent. */
export function MetalButton({
  children,
  onClick,
  href,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  /** Renders a download link instead of a button. */
  href?: string;
  className?: string;
}) {
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
  // a download link points down and slides down; a button points right and slides right
  const arrow = href ? "M8 3v10M4 9l4 4 4-4" : "M3 8h10M9 4l4 4-4 4";
  const inner = (
    <>
      <span ref={metalRef} className="metal-btn__metal" aria-hidden="true" />
      <span className="metal-btn__label">{children}</span>
      <span className="metal-btn__orb" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d={arrow} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 16 16">
          <path d={arrow} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </>
  );
  return href ? (
    <a className={`metal-btn metal-btn--down ${className}`} href={href} download>
      {inner}
    </a>
  ) : (
    <button className={`metal-btn ${className}`} type="button" onClick={onClick}>
      {inner}
    </button>
  );
}

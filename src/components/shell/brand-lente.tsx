"use client";

import { useEffect, useRef, useState } from "react";
import { Lente } from "@/components/ui/lente/lente";
import { KEVIN_MARK_PATH } from "./logo";

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 118 107"><path d="${KEVIN_MARK_PATH}"/></svg>`;

/**
 * Kevin's K revealed by a drop of glass (Lente). The canvas paints a solid colour, so it takes the
 * page's --background and --accent from where it sits, and re-reads them when the theme or the
 * accent changes. Click to play it again.
 */
export function BrandLente({ label, className }: { label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<{ bg: string; ink: string } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const s = getComputedStyle(el);
      setColors({
        bg: s.getPropertyValue("--background").trim(),
        ink: s.getPropertyValue("--accent").trim(),
      });
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-accent"],
    });
    return () => mo.disconnect();
  }, []);

  return (
    // the edges fade out, so the canvas never shows as a box over a gradient
    <div
      ref={ref}
      className={className}
      style={{
        maskImage: "radial-gradient(ellipse 50% 50% at center, #000 80%, transparent)",
        WebkitMaskImage: "radial-gradient(ellipse 50% 50% at center, #000 80%, transparent)",
      }}
    >
      {colors && (
        <Lente
          logo={MARK}
          label={label}
          look="light"
          background={colors.bg}
          logoColor={colors.ink}
          logoScale={0.55}
          hold={2.4}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}

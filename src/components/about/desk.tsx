"use client";

import { useEffect, useRef } from "react";

/**
 * The hobby prints on the desk: they drop onto it as it scrolls into view (data-in), and with a
 * mouse or pen each one can be picked up and moved, coming to the top. Touch keeps scrolling,
 * so the prints stay put there. Without JS (or with reduced motion) they just lie there.
 */
export function Desk() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const desk = ref.current?.closest<HTMLElement>(".ax-pm-desk");
    if (!desk) return;
    const cards = [...desk.querySelectorAll<HTMLElement>(".ax-pm-card")];

    let io: IntersectionObserver | undefined;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      desk.dataset.drop = "true";
      io = new IntersectionObserver(
        ([e]) => {
          if (!e?.isIntersecting) return;
          desk.dataset.in = "true";
          io!.disconnect();
        },
        { threshold: 0.25 },
      );
      io.observe(desk);
    }

    let top = cards.length;
    const offs = cards.map((card) => {
      let x = 0;
      let y = 0;
      const down = (e: PointerEvent) => {
        if (e.pointerType === "touch" || e.button !== 0) return;
        e.preventDefault();
        card.setPointerCapture(e.pointerId);
        card.dataset.held = "true";
        card.style.zIndex = String(++top);
        const sx = e.clientX - x;
        const sy = e.clientY - y;
        const move = (m: PointerEvent) => {
          x = m.clientX - sx;
          y = m.clientY - sy;
          card.style.translate = `${x}px ${y}px`;
        };
        const up = () => {
          delete card.dataset.held;
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerup", up);
          card.removeEventListener("pointercancel", up);
        };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerup", up);
        card.addEventListener("pointercancel", up);
      };
      card.addEventListener("pointerdown", down);
      return () => card.removeEventListener("pointerdown", down);
    });

    return () => {
      io?.disconnect();
      offs.forEach((off) => off());
    };
  }, []);

  return <span ref={ref} hidden />;
}

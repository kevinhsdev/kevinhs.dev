"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { prefersReduced } from "@/motion/reduced";
import { Title } from "@/motion/title";

/**
 * Plays a Title reveal (its [data-line] children, on its own clock) the first time the block
 * enters the screen. Reduced motion: shown as is.
 */
export function Reveal(props: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const title = new Title(el);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        title.show();
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} {...props} />;
}

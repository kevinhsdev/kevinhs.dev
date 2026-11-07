"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type ShaderKind = "nebulosa" | "fluxo" | "tipos";

export function supportsWebgl(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

async function mount(kind: ShaderKind, el: HTMLElement): Promise<(() => void) | null> {
  if (kind === "nebulosa") {
    const { mountNebulosa } = await import("@/lib/shaders/nebulosa");
    return mountNebulosa(el);
  }
  const [{ mountWebglStage }, shader] = await Promise.all([
    import("@/lib/webgl-stage"),
    kind === "fluxo"
      ? import("@/lib/shaders/fluxo").then((m) => m.fluxo)
      : import("@/lib/shaders/tipos").then((m) => m.tipos),
  ]);
  return mountWebglStage(el, shader);
}

/**
 * A stage with a decorative WebGL background and its children on top. Shader code loads
 * after mount; colors come from the tokens and are re-read when the theme or accent
 * changes (remount). Without WebGL the stage shows a token gradient (data-fallback).
 */
export function ShaderStage({
  kind,
  as: Tag = "div",
  className,
  children,
  ...props
}: { kind: ShaderKind; as?: "div" | "section" } & ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!supportsWebgl()) {
      el.dataset.fallback = "true";
      return;
    }
    let dispose: (() => void) | null = null;
    let run = 0;

    const start = () => {
      const id = ++run;
      dispose?.();
      dispose = null;
      void mount(kind, el)
        .then((d) => {
          if (id !== run) return d?.();
          if (!d) el.dataset.fallback = "true";
          dispose = d;
        })
        .catch(() => {
          el.dataset.fallback = "true";
        });
    };
    start();

    // The browser can drop a WebGL context (too many on the page, GPU reset): show the token
    // gradient instead of a blank canvas. Capture phase: the event doesn't bubble.
    const lost = (e: Event) => {
      el.dataset.fallback = "true";
      (e.target as HTMLElement).style.display = "none";
    };
    el.addEventListener("webglcontextlost", lost, true);

    // Theme (class) or accent (data-accent) flips change the tokens the shader read.
    // Lenis also toggles classes on <html>, so only a real change remounts.
    const html = document.documentElement;
    const look = () => `${html.classList.contains("dark")}|${html.dataset.accent ?? ""}`;
    let last = look();
    const mo = new MutationObserver(() => {
      if (look() === last) return;
      last = look();
      start();
    });
    mo.observe(html, {
      attributes: true,
      attributeFilter: ["class", "data-accent"],
    });

    return () => {
      run++;
      el.removeEventListener("webglcontextlost", lost, true);
      mo.disconnect();
      dispose?.();
    };
  }, [kind]);

  return (
    <Tag ref={ref} data-stage={kind} className={cn("stage", className)} {...props}>
      {children}
    </Tag>
  );
}

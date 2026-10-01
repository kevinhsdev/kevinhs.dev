import type { ReactNode } from "react";

/** The one-line summary at the top of every case study. */
export function Tldr({ children }: { children: ReactNode }) {
  return (
    <div className="mb-14 rounded-3xl border border-accent/40 bg-accent/10 p-6 sm:p-8">
      <p className="mb-2 font-mono text-xs tracking-widest text-accent uppercase">TL;DR</p>
      <div className="text-xl leading-snug font-medium text-pretty sm:text-2xl">{children}</div>
    </div>
  );
}

/** Marks text Kevin still has to confirm; styled like every other TODO(kevin). */
export function Review({ children }: { children: ReactNode }) {
  return (
    <aside className="review-box my-6 rounded-2xl p-4 text-sm leading-relaxed">
      <p className="mb-1 font-mono text-xs tracking-widest uppercase">TODO(kevin): revisar</p>
      <div className="text-foreground">{children}</div>
    </aside>
  );
}

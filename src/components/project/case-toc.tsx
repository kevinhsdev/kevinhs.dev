"use client";

import { useEffect, useState } from "react";

/** The case study's sections, fixed at the side while it is read; the one on screen is lit. */
export function CaseToc({
  label,
  sections,
}: {
  label: string;
  sections: { id: string; title: string }[];
}) {
  const [on, setOn] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const heads = sections.flatMap((s) => document.getElementById(s.id) ?? []);
    // the last heading past the upper third of the screen is the current section
    const update = () => {
      const passed = heads.filter((h) => h.getBoundingClientRect().top < innerHeight * 0.35);
      setOn((passed.at(-1) ?? heads[0])?.id ?? "");
    };
    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [sections]);

  return (
    <nav aria-label={label} className="pj-toc">
      <p className="pj-toc-k">{label}</p>
      <ol>
        {sections.map((s) => (
          <li key={s.id}>
            {/* numbered by CSS, the same 02.1, 02.2… as the headings */}
            <a href={`#${s.id}`} aria-current={on === s.id ? "location" : undefined}>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LocaleToggle } from "./locale-toggle";
import { KevinMark } from "./logo";
import "./site-menu.css";

export type MenuItem = { name: string; href: string; photo: string };
type Props = {
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  items: MenuItem[];
  active: number;
  labels: { navigation: string; close: string; where: string; status: string; find: string };
  links: { label: string; href: string }[];
};

const OUT_MS = 550;

/**
 * The full-screen menu: two columns of muted photos on the left, one per section, drifting
 * up and down after the pointer, and the sections
 * stacked in the middle of the right half. The one under the pointer rolls its word over in the
 * accent and brings its photo to full colour; the current page is struck through with a wavy line.
 * A native modal dialog, so focus stays inside, Esc closes it and the page behind is inert.
 */
export function SiteMenu({ open, onClose, onNavigate, items, active, labels, links }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const columns = [0, 1].map((c) =>
    items.map((item, i) => ({ ...item, i })).filter(({ i }) => i % 2 === c),
  );

  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) {
      delete d.dataset.closing;
      setHover(null);
      d.showModal();
    }
    if (!open && d.open) {
      d.dataset.closing = "";
      const id = window.setTimeout(() => d.close(), OUT_MS);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="sm dark"
      aria-label={labels.navigation}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const el = e.currentTarget;
        el.style.setProperty("--mx", String((e.clientX / innerWidth) * 2 - 1));
        el.style.setProperty("--my", String((e.clientY / innerHeight) * 2 - 1));
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="sm-panel">
        <div className="sm-top">
          <span className="sm-brand" aria-hidden="true">
            <KevinMark className="sm-brand-mark" />
            Kevin Henrique
          </span>
          <div className="sm-actions">
            <div className="sm-toggles">
              <LocaleToggle />
              <ThemeToggle />
            </div>
            <button type="button" className="sm-close" onClick={onClose} aria-label={labels.close}>
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>

        {/* the section photos in two columns that drift, at two depths, after the pointer */}
        <div className="sm-photos" aria-hidden="true">
          {columns.map((col, c) => (
            <div key={c} className="sm-col">
              {col.map(({ photo, i }) => (
                <div key={photo} className="sm-ph" data-on={i === hover || undefined}>
                  <Image
                    src={photo}
                    alt=""
                    width={0}
                    height={0}
                    sizes="(min-width: 900px) 24vw, 1px"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="sm-side">
          <nav aria-label={labels.navigation}>
            <ul className="sm-list" onMouseLeave={() => setHover(null)}>
              {items.map((item, i) => (
                <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
                  <a
                    href={item.href}
                    className="sm-link"
                    aria-current={i === active ? "page" : undefined}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      window.setTimeout(() => onNavigate(i), OUT_MS - 150);
                    }}
                  >
                    <span className="sm-roll">
                      <span>{item.name}</span>
                      <span aria-hidden="true">{item.name}</span>
                    </span>
                    {i === active && (
                      <svg
                        className="sm-wave"
                        viewBox="0 0 200 20"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path d="M0 10 Q 12.5 0 25 10 T 50 10 T 75 10 T 100 10 T 125 10 T 150 10 T 175 10 T 200 10" />
                      </svg>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm-badge">
            <KevinMark className="sm-mark" />
            <p>
              <span className="sm-dot" aria-hidden="true" />
              {labels.status}
            </p>
          </div>

          <div className="sm-foot">
            <p className="sm-find">{labels.find}</p>
            <ul className="sm-socials">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="sm-where">{labels.where}</p>
          </div>
        </div>
      </div>
    </dialog>
  );
}

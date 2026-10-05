"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";

export type MuralPhoto = { id: string; src: string; alt: string; caption: string; focus?: string };

type Labels = { zoom: string; close: string; previous: string; next: string };

// A slight, fixed tilt per position: scattered, but the same on every visit.
const TILT = [-4, 3, -2, 5, -5, 2, -3, 4];

/**
 * The "About me" wall: a pinned note and the photos as polaroids. Clicking a
 * photo enlarges it in a dialog (Radix: focus trap, Esc, focus returns), where
 * the arrows (or ← →) move through the wall.
 */
export function Mural({
  photos,
  note,
  labels,
}: {
  photos: MuralPhoto[];
  note: { title: string; text: string };
  labels: Labels;
}) {
  const [open, setOpen] = useState<number | null>(null);
  // Which photo was on screen when the dialog closed: focus goes back to it on the wall.
  const last = useRef(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = open === null ? null : photos[open];
  const step = (by: number) =>
    setOpen((index) => (index === null ? index : (index + by + photos.length) % photos.length));

  return (
    <>
      <ul className="mural">
        <li className="mural-note" style={{ "--r": "-2deg" } as CSSProperties}>
          <span aria-hidden className="mural-pin" />
          <p className="font-display text-3xl uppercase">{note.title}</p>
          <p className="text-pretty">{note.text}</p>
        </li>
        {photos.map((photo, index) => (
          <li key={photo.id} style={{ "--r": `${TILT[index % TILT.length]}deg` } as CSSProperties}>
            <button
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              className="mural-photo"
              onClick={() => setOpen(index)}
              aria-label={labels.zoom.replace("{caption}", photo.caption)}
            >
              <span aria-hidden className="mural-pin" />
              <figure className="polaroid-paper">
                {/* Local, already-resized photos; next/image adds nothing here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: photo.focus }}
                />
                <figcaption>{photo.caption}</figcaption>
              </figure>
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root
        open={open !== null}
        onOpenChange={(next) => {
          if (next) return;
          last.current = open ?? 0;
          setOpen(null);
        }}
      >
        {/* No portal, so the dialog stays inside the themed shell. */}
        <Dialog.Overlay className="zoom-overlay fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            buttons.current[last.current]?.focus();
          }}
          className="zoom-content fixed inset-0 z-50 grid place-items-center p-4 sm:p-10"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
          }}
        >
          {current && (
            <div className="flex w-full max-w-4xl flex-col items-center gap-4">
              <figure className="polaroid-paper zoom-paper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.src} alt={current.alt} />
                <Dialog.Title asChild>
                  <figcaption>{current.caption}</figcaption>
                </Dialog.Title>
              </figure>
              <div className="flex items-center gap-2">
                <button type="button" className="zoom-button" onClick={() => step(-1)}>
                  <ArrowLeft aria-hidden className="size-4" />
                  <span className="sr-only">{labels.previous}</span>
                </button>
                <span className="px-2 font-mono text-xs text-white/80 tabular-nums">
                  {(open ?? 0) + 1} / {photos.length}
                </span>
                <button type="button" className="zoom-button" onClick={() => step(1)}>
                  <ArrowRight aria-hidden className="size-4" />
                  <span className="sr-only">{labels.next}</span>
                </button>
                <Dialog.Close className="zoom-button ml-2">
                  <X aria-hidden className="size-4" />
                  <span className="sr-only">{labels.close}</span>
                </Dialog.Close>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

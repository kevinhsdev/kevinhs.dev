"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { type CSSProperties, useRef, useState } from "react";

export type MosaicPhoto = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

type Labels = { zoom: string; close: string; previous: string; next: string };

/**
 * A theme's photos in a row at one height and their natural shapes, captions
 * below (never over the image). Clicking one enlarges it in a dialog (Radix:
 * focus trap, Esc, focus returns to the photo), where the arrows (or ← →) step
 * through this theme's photos.
 */
export function Mosaic({ photos, labels }: { photos: MosaicPhoto[]; labels: Labels }) {
  const [open, setOpen] = useState<number | null>(null);
  // Which photo was on screen when the dialog closed: focus goes back to it.
  const last = useRef(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = open === null ? null : photos[open];
  const step = (by: number) =>
    setOpen((index) => (index === null ? index : (index + by + photos.length) % photos.length));

  return (
    <>
      <ul className="mosaic">
        {photos.map((photo, index) => (
          <li key={photo.id} style={{ "--ratio": photo.width / photo.height } as CSSProperties}>
            <button
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              className="mosaic-photo"
              onClick={() => setOpen(index)}
              aria-label={labels.zoom.replace("{caption}", photo.caption)}
            >
              {/* Local, already-resized photos; next/image adds nothing here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
              />
            </button>
            <p aria-hidden className="mosaic-caption">
              {photo.caption}
            </p>
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
        <Dialog.Overlay className="zoom-overlay fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
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
            <div className="flex w-full max-w-5xl flex-col items-center gap-4">
              <figure className="zoom-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.src} alt={current.alt} />
                <Dialog.Title asChild>
                  <figcaption>{current.caption}</figcaption>
                </Dialog.Title>
              </figure>
              {photos.length > 1 && (
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
                </div>
              )}
              <Dialog.Close className="zoom-button absolute top-4 right-4 sm:top-6 sm:right-6">
                <X aria-hidden className="size-4" />
                <span className="sr-only">{labels.close}</span>
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

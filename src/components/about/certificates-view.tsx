"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CertificateFolder } from "@/components/about/data";
import GlassFolder from "@/components/ui/glass-folder";

type Folder = CertificateFolder & { label: string; count: string };
type Labels = {
  open: string;
  prev: string;
  next: string;
  close: string;
  noPreview: string;
};

/**
 * The folders, one open at a time. Opening one lays its certificates out below as cards with
 * their first page (nothing shows until then); a card, or a sheet in the open folder, opens the
 * viewer, which shows it big, steps through that folder with the arrows and links the file.
 */
export function CertificatesView({ folders, labels }: { folders: Folder[]; labels: Labels }) {
  const all = folders.flatMap((f) =>
    f.files.map((file) => ({ ...file, group: f.key, label: f.label })),
  );
  const [filter, setFilter] = useState<string | null>(null);
  // the last folder opened stays laid out while the panel closes, so it folds away with its cards
  const [last, setLast] = useState<string | null>(null);
  if (filter && filter !== last) setLast(filter);
  const [active, setActive] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const open = folders.find((f) => f.key === (filter ?? last));
  const shown = all.filter((c) => c.group === open?.key);
  const list = shown.some((c) => c.id === active) ? shown : all;
  const at = list.findIndex((c) => c.id === active);
  const cur = at >= 0 ? list[at]! : null;
  const step = (d: number) => setActive(list[(at + d + list.length) % list.length]!.id);

  useEffect(() => {
    const d = dialog.current!;
    if (active && !d.open) d.showModal();
    if (!active && d.open) d.close();
  }, [active]);

  return (
    <>
      <div className="about-certs-folders">
        {folders.map((f, i) => (
          <GlassFolder
            key={f.key}
            label={f.label}
            meta={f.count}
            art={f.art}
            tone={f.tone}
            action="none"
            width={230}
            appearDelay={i * 140}
            files={f.files.map(({ name, meta, preview }) => ({ name, meta, image: preview?.src }))}
            open={filter === f.key}
            onOpenChange={(o) => setFilter(o ? f.key : null)}
            onFileSelect={(_, j) => setActive(f.files[j]!.id)}
          />
        ))}
      </div>

      {open && (
        <div className="cvw-wrap" data-open={!!filter || undefined} inert={!filter}>
          <div className="cvw" key={open.key}>
            <div className="cvw-bar">
              <h3 className="cvw-title">
                {open.label} <span>{open.count}</span>
              </h3>
              <button type="button" className="cvw-x" onClick={() => setFilter(null)}>
                {labels.close} ✕
              </button>
            </div>
            <ul className="cvw-grid">
              {shown.map((c, i) => (
                <li key={c.id} style={{ "--i": i } as React.CSSProperties}>
                  <button type="button" className="cvw-card" onClick={() => setActive(c.id)}>
                    <span className="cvw-thumb">
                      {c.preview ? (
                        <Image
                          src={c.preview.src}
                          alt=""
                          width={c.preview.width}
                          height={c.preview.height}
                          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
                        />
                      ) : (
                        <span className="cvw-none">{labels.noPreview}</span>
                      )}
                    </span>
                    <span className="cvw-group">{c.label}</span>
                    <span className="cvw-name">{c.name}</span>
                    <span className="cvw-meta">{c.meta}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <dialog
        ref={dialog}
        className="cvw-dlg"
        aria-label={cur?.name}
        onClose={() => setActive(null)}
        onClick={(e) => e.target === e.currentTarget && setActive(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {cur && (
          <div className="cvw-dlg-box">
            <div className="cvw-dlg-img">
              {cur.preview ? (
                <Image
                  src={cur.preview.src}
                  alt={cur.name}
                  width={cur.preview.width}
                  height={cur.preview.height}
                  sizes="90vw"
                />
              ) : (
                <span className="cvw-none">{labels.noPreview}</span>
              )}
            </div>
            <div className="cvw-dlg-foot">
              <div>
                <p className="cvw-group">
                  {cur.label} · {at + 1}/{list.length}
                </p>
                <p className="cvw-dlg-name">{cur.name}</p>
                <p className="cvw-meta">{cur.meta}</p>
              </div>
              <div className="cvw-dlg-actions">
                <button type="button" onClick={() => step(-1)} aria-label={labels.prev}>
                  ←
                </button>
                <button type="button" onClick={() => step(1)} aria-label={labels.next}>
                  →
                </button>
                {cur.href && (
                  <a href={cur.href} target="_blank" rel="noopener" className="cvw-open">
                    {labels.open} ↗
                  </a>
                )}
                <button type="button" onClick={() => setActive(null)} aria-label={labels.close}>
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

import { ArrowDown, ArrowRight } from "lucide-react";
import { Fragment } from "react";

export type DiagramNode = { title: string; detail?: string };

/**
 * Architecture diagram as real markup: an ordered list of boxes joined by
 * arrows (horizontal on wide screens, vertical on phones), plus side systems.
 * Readable by screen readers, themable, and it never goes blurry.
 */
export function Diagram({
  label,
  flow,
  aside = [],
  asideLabel,
}: {
  label: string;
  flow: DiagramNode[];
  aside?: DiagramNode[];
  asideLabel?: string;
}) {
  return (
    <figure className="my-10 flex flex-col gap-6 rounded-3xl border border-border bg-surface p-5 sm:p-8 lg:-mx-24 xl:-mx-40">
      <figcaption className="font-mono text-xs tracking-widest text-muted uppercase">
        {label}
      </figcaption>
      <ol className="flex flex-col items-stretch gap-2 lg:flex-row">
        {flow.map((node, index) => (
          <Fragment key={node.title}>
            <li className="flex flex-1 flex-col gap-1 rounded-2xl border border-accent/40 bg-background p-4">
              <span className="font-mono text-[11px] text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="leading-snug font-semibold">{node.title}</span>
              {node.detail && <span className="text-sm text-muted">{node.detail}</span>}
            </li>
            {index < flow.length - 1 && (
              <li aria-hidden className="flex items-center justify-center text-accent">
                <ArrowDown className="size-5 lg:hidden" />
                <ArrowRight className="hidden size-5 lg:block" />
              </li>
            )}
          </Fragment>
        ))}
      </ol>
      {aside.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-dashed border-border pt-5">
          {asideLabel && (
            <p className="font-mono text-xs tracking-widest text-muted uppercase">{asideLabel}</p>
          )}
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {aside.map((node) => (
              <li
                key={node.title}
                className="flex flex-col gap-1 rounded-2xl border border-dashed border-border p-4"
              >
                <span className="leading-snug font-semibold">{node.title}</span>
                {node.detail && <span className="text-sm text-muted">{node.detail}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
}

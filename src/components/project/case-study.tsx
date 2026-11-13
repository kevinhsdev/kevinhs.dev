import { ArrowDown, ArrowRight } from "lucide-react";
import type { MDXComponents, MDXContent } from "mdx/types";
import { Fragment, type ComponentProps, type ReactNode } from "react";
import type { Locale } from "@/i18n/routing";

/** "Decisões técnicas e trade-offs" → "decisoes-tecnicas-e-trade-offs": the id of a section. */
export function sectionId(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The case study's sections (its "## " headings), read from the source for the side index. */
export async function caseStudySections(slug: string, locale: Locale) {
  const { readFile } = await import("node:fs/promises");
  const src = await readFile(
    `${process.cwd()}/src/content/case-studies/${slug}.${locale}.mdx`,
    "utf8",
  );
  return [...src.matchAll(/^## (.+)$/gm)].map(([, title = ""]) => ({
    id: sectionId(title.trim()),
    title: title.trim(),
  }));
}

/** The compiled MDX body of a case study (bundled at build time). */
export async function loadCaseStudy(slug: string, locale: Locale): Promise<MDXContent> {
  const mdx = (await import(`@/content/case-studies/${slug}.${locale}.mdx`)) as {
    default: MDXContent;
  };
  return mdx.default;
}

/** The one-line summary at the top of every case study. */
function Tldr({ children }: { children: ReactNode }) {
  return (
    <div className="mb-14 rounded-3xl border border-accent/40 bg-accent-soft p-6 sm:p-8">
      <p className="mb-2 font-mono text-xs tracking-widest text-accent uppercase">TL;DR</p>
      <div className="text-xl leading-snug font-medium text-pretty sm:text-2xl">{children}</div>
    </div>
  );
}

type Node = { title: string; detail?: string };

/** Architecture as real markup: boxes joined by arrows, plus side systems. */
function Diagram({
  label,
  flow,
  aside = [],
  asideLabel,
}: {
  label: string;
  flow: Node[];
  aside?: Node[];
  asideLabel?: string;
}) {
  return (
    <figure className="my-10 flex flex-col gap-6 rounded-3xl border border-border bg-surface p-5 sm:p-8">
      <figcaption className="font-mono text-xs tracking-widest text-muted uppercase">
        {label}
      </figcaption>
      <ol className="flex flex-col items-stretch gap-2 lg:flex-row">
        {flow.map((node, i) => (
          <Fragment key={node.title}>
            <li className="flex flex-1 flex-col gap-1 rounded-2xl border border-accent/40 bg-background p-4">
              <span className="font-mono text-[11px] text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-snug font-semibold">{node.title}</span>
              {node.detail && <span className="text-sm text-muted">{node.detail}</span>}
            </li>
            {i < flow.length - 1 && (
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

/** Case-study typography; sections (h2) are numbered by a CSS counter in project.css. */
export const mdxComponents: MDXComponents = {
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="case-h2"
      id={typeof props.children === "string" ? sectionId(props.children) : undefined}
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-10 mb-3 text-xl font-semibold tracking-tight" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-4 leading-relaxed text-pretty text-muted" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      className="my-4 flex list-disc flex-col gap-2 pl-5 text-muted marker:text-accent"
      {...props}
    />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className="my-4 flex list-decimal flex-col gap-2 pl-5 text-muted marker:text-accent"
      {...props}
    />
  ),
  li: (props: ComponentProps<"li">) => (
    <li className="pl-1 leading-relaxed text-pretty" {...props} />
  ),
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
      {...(props.href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  ),
  // Scrollable on phones, so it must be reachable by keyboard.
  table: (props: ComponentProps<"table">) => (
    <div tabIndex={0} className="my-8 overflow-x-auto rounded-2xl border border-border">
      <table className="w-full border-collapse text-left text-sm sm:min-w-[40rem]" {...props} />
    </div>
  ),
  th: (props: ComponentProps<"th">) => (
    <th
      className="border-b border-border bg-surface px-4 py-3 font-mono text-xs font-medium tracking-wide text-muted uppercase"
      {...props}
    />
  ),
  td: (props: ComponentProps<"td">) => (
    <td className="border-b border-border px-4 py-3 align-top leading-relaxed" {...props} />
  ),
  pre: (props: ComponentProps<"pre">) => <pre tabIndex={0} {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote className="my-6 border-l-2 border-accent pl-5 text-lg italic" {...props} />
  ),
  Tldr,
  Diagram,
};

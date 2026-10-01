import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";
import { Review, Tldr } from "@/components/case-study/callouts";
import { Diagram } from "@/components/case-study/diagram";

/*
 * Case-study typography. Sections (h2) are numbered automatically with a CSS
 * counter (see .case-study in creative.css), so the MDX stays plain markdown.
 */
const components: MDXComponents = {
  h2: (props: ComponentProps<"h2">) => <h2 className="case-h2" {...props} />,
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
      className="text-link underline decoration-link/40 underline-offset-4 transition-colors duration-150 hover:decoration-link"
      {...(props.href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  ),
  // Scrollable on phones, so it must be reachable by keyboard (WCAG 2.1.1).
  table: (props: ComponentProps<"table">) => (
    <div tabIndex={0} className="my-8 overflow-x-auto rounded-2xl border border-border">
      <table className="w-full border-collapse text-left text-sm sm:min-w-[40rem]" {...props} />
    </div>
  ),
  pre: (props: ComponentProps<"pre">) => <pre tabIndex={0} {...props} />,
  th: (props: ComponentProps<"th">) => (
    <th
      className="border-b border-border bg-surface px-4 py-3 font-mono text-xs font-medium tracking-wide text-muted uppercase"
      {...props}
    />
  ),
  td: (props: ComponentProps<"td">) => (
    <td className="border-b border-border px-4 py-3 align-top leading-relaxed" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-6 border-l-2 border-accent pl-5 text-lg text-foreground italic"
      {...props}
    />
  ),
  Diagram,
  Tldr,
  Review,
};

export function useMDXComponents(): MDXComponents {
  return components;
}

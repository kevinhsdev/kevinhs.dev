import { TODO_PREFIX } from "@/content/todo";

/**
 * Renders content copy. The part still marked `TODO(kevin)` (from the marker
 * to the end of the string) is highlighted so it can't slip into production
 * unnoticed; the rest of the sentence renders normally.
 */
export function Text({
  children,
  as: Tag = "span",
  className,
}: {
  children: string;
  as?: "span" | "p" | "h2" | "h3" | "li";
  className?: string;
}) {
  const index = children.indexOf(TODO_PREFIX);
  if (index === -1) return <Tag className={className}>{children}</Tag>;

  return (
    <Tag className={className} data-todo>
      {children.slice(0, index)}
      <span className="todo">{children.slice(index)}</span>
    </Tag>
  );
}

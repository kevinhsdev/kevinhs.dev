/** Marker for facts still missing from Kevin. Kept tiny so client code can import it. */
export const TODO_PREFIX = "TODO(kevin)";

export function isTodo(text: string): boolean {
  return text.includes(TODO_PREFIX);
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "3× more documents: a tool…" → ["3× more documents", ": a tool…"], for a bold lead. */
export function splitLead(text: string): [lead: string, rest: string] {
  const index = text.indexOf(":");
  return index === -1 ? [text, ""] : [text.slice(0, index), text.slice(index)];
}

/** "2025-08" → "ago. 2025" / "Aug 2025"; "2024" stays "2024". */
export function formatPartialDate(value: string, locale: string): string {
  const [year, month] = value.split("-");
  if (!month) return value;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

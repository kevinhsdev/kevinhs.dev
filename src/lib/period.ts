import type { TimelineItem } from "@/content/schema";
import { formatPartialDate } from "./utils";

export type PeriodLabels = { present: string; inProgress: string; expected: string };

/** "ago. 2025 — atual", "2024 — dez. 2028 (previsto)", "em andamento", "set. 2026". */
export function formatPeriod(
  item: Pick<TimelineItem, "start" | "end" | "endIsExpected" | "inProgress">,
  locale: string,
  labels: PeriodLabels,
): string {
  if (item.start === null) return labels.inProgress;
  const start = formatPartialDate(item.start, locale);
  if (!item.end) return item.inProgress ? `${start} — ${labels.inProgress}` : start;
  const end = item.end === "present" ? labels.present : formatPartialDate(item.end, locale);
  return `${start} — ${end}${item.endIsExpected ? ` (${labels.expected})` : ""}`;
}

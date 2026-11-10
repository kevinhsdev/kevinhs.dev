"use client";

import { useSyncExternalStore } from "react";

const every30s = (cb: () => void) => {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
};

/** Kevin's local time (São Paulo), ticking by the minute; empty until hydration. */
export function LocalTime({ locale }: { locale: string }) {
  const time = useSyncExternalStore(
    every30s,
    () =>
      new Intl.DateTimeFormat(locale, {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    () => "",
  );
  return <time suppressHydrationWarning>{time}</time>;
}

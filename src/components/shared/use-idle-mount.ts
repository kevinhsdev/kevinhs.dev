"use client";

import { useEffect, useState } from "react";

/**
 * True once the page has gone idle, or as soon as `triggerEvent` fires on window.
 * Used to keep non-critical UI (palette, toasts) out of the first load.
 */
export function useIdleMount(triggerEvent?: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const go = () => setReady(true);
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle
      ? window.requestIdleCallback(go, { timeout: 3000 })
      : window.setTimeout(go, 1500);
    if (triggerEvent) window.addEventListener(triggerEvent, go);
    return () => {
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      if (triggerEvent) window.removeEventListener(triggerEvent, go);
    };
  }, [ready, triggerEvent]);

  return ready;
}

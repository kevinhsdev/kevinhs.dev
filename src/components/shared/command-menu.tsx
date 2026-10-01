"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useIdleMount } from "@/components/shared/use-idle-mount";

export const OPEN_EVENT = "command-menu:open";
/** Dispatched with the target element; cancel it if you handle the scroll yourself. */
export const SCROLL_EVENT = "app:scroll-to";

/** Lets any button (in any version) open the palette. */
export function openCommandMenu() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** `href` is either an in-page anchor ("#projects") or a path ("/now"). */
export type CommandNavItem = { label: string; href: string };

// The palette lives in the root layout; each page registers its own sections.
let navigationItems: CommandNavItem[] = [];
const listeners = new Set<() => void>();
const navigationStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => navigationItems,
  set(items: CommandNavItem[]) {
    navigationItems = items;
    listeners.forEach((listener) => listener());
  },
};
const EMPTY: CommandNavItem[] = [];

export function RegisterCommandNavigation({ items }: { items: CommandNavItem[] }) {
  useEffect(() => {
    navigationStore.set(items);
    return () => navigationStore.set(EMPTY);
  }, [items]);
  return null;
}

/** Sections registered by the current page (for the palette and the site menu). */
export function useRegisteredNavigation() {
  return useSyncExternalStore(navigationStore.subscribe, navigationStore.get, () => EMPTY);
}

/**
 * Scrolls to an in-page anchor. A smooth-scroll engine (Lenis) may claim the
 * event; otherwise the browser scrolls natively. Returns false for non-anchors.
 */
export function scrollToAnchor(href: string): boolean {
  if (!href.startsWith("#")) return false;
  const target = document.getElementById(href.slice(1));
  if (!target) return true;
  history.replaceState(null, "", href);
  const event = new CustomEvent(SCROLL_EVENT, { detail: target, cancelable: true });
  if (!window.dispatchEvent(event)) return true;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  return true;
}

const CommandPalette = dynamic(
  () => import("@/components/shared/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

/**
 * Mounts the palette once the page is idle. If ⌘K / Ctrl+K (or a button) asks
 * for it earlier, it loads right away and opens. After that it handles its own keys.
 */
export function CommandMenu() {
  const idle = useIdleMount();
  const [requested, setRequested] = useState(false);
  const mounted = idle || requested;

  useEffect(() => {
    if (mounted) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setRequested(true);
      }
    }
    const onOpen = () => setRequested(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [mounted]);

  return mounted ? <CommandPalette initialOpen={requested} /> : null;
}

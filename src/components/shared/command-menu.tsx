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

/*
 * Opening the palette must never lose keys. Two gaps exist: the palette's code
 * may still be loading (it is lazy), and even once open, its search field gets
 * focus a frame later. So from ⌘K until the field is focused, typed keys are
 * buffered here and the field picks them up on focus (`takeBufferedKeys`).
 */
let buffered = "";
let buffering = false;
function bufferKeys(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key.length === 1) buffered += event.key;
  else if (event.key === "Backspace") buffered = buffered.slice(0, -1);
}
/** Starts buffering; a no-op if already buffering (e.g. ⌘K pressed while the palette loads). */
export function startBufferingKeys() {
  if (buffering) return;
  buffering = true;
  buffered = "";
  window.addEventListener("keydown", bufferKeys);
}
/** Stops buffering and returns what was typed since ⌘K. */
export function takeBufferedKeys(): string {
  window.removeEventListener("keydown", bufferKeys);
  buffering = false;
  const keys = buffered;
  buffered = "";
  return keys;
}

// Set by the palette once its own listeners are attached.
let paletteReady = false;
let openWhenReady = false;
/** Called by the palette after it attaches its listeners; replays an early ⌘K. */
export function markPaletteReady(ready: boolean) {
  paletteReady = ready;
  if (ready && openWhenReady) {
    openWhenReady = false;
    window.dispatchEvent(new Event(OPEN_EVENT));
  }
}

/**
 * Mounts the palette once the page is idle, or right away when ⌘K / Ctrl+K (or
 * a button) asks for it first. Until the palette is ready, this listens in its
 * place and remembers the request, so an early ⌘K is never dropped.
 */
export function CommandMenu() {
  const idle = useIdleMount();
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    function request() {
      if (paletteReady) return;
      openWhenReady = true;
      startBufferingKeys();
      setRequested(true);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (paletteReady) return;
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        request();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, request);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, request);
    };
  }, []);

  return idle || requested ? <CommandPalette /> : null;
}

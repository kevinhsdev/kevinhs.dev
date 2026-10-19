import {
  Clock,
  Compass,
  Eye,
  Flag,
  Languages,
  Route,
  SunMoon,
  type LucideIcon,
} from "lucide-react";
import { pixelTakeover } from "@/components/shared/arcade-takeover";

/*
 * The visitor's achievements, shared by the toasts that unlock them
 * (visitor-achievements.tsx) and the trophy case that counts them
 * (visitor-trophies.tsx). Unlocks live in localStorage; every access is
 * guarded so the site works the same where storage is blocked.
 */

export type VisitorAchievementId =
  "explorer" | "traveler" | "curious" | "endgame" | "present" | "theme" | "polyglot";

export const visitorAchievements: {
  id: VisitorAchievementId;
  icon: LucideIcon;
  /** unlocks when this section's top passes the middle of the screen */
  section?: string;
  /** unlocks on a page whose path ends with this */
  page?: string;
}[] = [
  { id: "explorer", icon: Compass, section: "projects" },
  { id: "traveler", icon: Route, section: "experience" },
  { id: "curious", icon: Eye, section: "about", page: "/about" },
  { id: "endgame", icon: Flag, section: "contact" },
  { id: "present", icon: Clock, page: "/now" },
  { id: "theme", icon: SunMoon },
  { id: "polyglot", icon: Languages },
];

const KEY = "kh:visitor-achievements";
/** Fired on window after every unlock, so the trophy case updates live. */
const EVENT = "kh:visitor-achievement";

export function readList(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

export function writeList(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // private mode or blocked storage: unlocks just last for this visit
  }
}

const known = new Set<string>(visitorAchievements.map((a) => a.id));

/** Unlocked ids, ignoring anything stale left in storage by older versions. */
export function readUnlocked(): string[] {
  return readList(KEY).filter((id) => known.has(id));
}

export function saveUnlocked(ids: string[]) {
  writeList(KEY, ids);
  window.dispatchEvent(new Event(EVENT));
}

/** For useSyncExternalStore: re-read on our own unlocks and on other tabs' writes. */
export function subscribeUnlocked(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** A string snapshot, so React can compare it by value. */
export function unlockedSnapshot() {
  return readUnlocked().join(",");
}

/*
 * The secret arcade theme, the platinum reward. The layout's inline script
 * sets `data-arcade` on <html> before first paint; this keeps it in sync.
 */
const ARCADE_KEY = "kh:arcade";
const ARCADE_EVENT = "kh:arcade";

function applyArcade(on: boolean) {
  document.documentElement.toggleAttribute("data-arcade", on);
  try {
    if (on) localStorage.setItem(ARCADE_KEY, "1");
    else localStorage.removeItem(ARCADE_KEY);
  } catch {
    // still applies for this visit
  }
  window.dispatchEvent(new Event(ARCADE_EVENT));
}

/**
 * Turns the arcade theme on or off. Pixels take the screen over from `origin`
 * (where the switch was clicked) and the theme flips while it is covered;
 * under reduced motion it just switches.
 */
export function setArcade(on: boolean, origin?: { x: number; y: number }) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyArcade(on);
    return;
  }
  pixelTakeover(on, origin, () => applyArcade(on));
}

export function subscribeArcade(onChange: () => void) {
  window.addEventListener(ARCADE_EVENT, onChange);
  return () => window.removeEventListener(ARCADE_EVENT, onChange);
}

export function arcadeSnapshot() {
  return document.documentElement.hasAttribute("data-arcade");
}

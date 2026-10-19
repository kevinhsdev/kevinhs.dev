import { pixelTakeover } from "@/components/shared/arcade-takeover";

/*
 * The visitor's achievements, shared by the toasts that unlock them
 * (visitor-achievements.tsx) and the trophy case that counts them
 * (visitor-trophies.tsx). Unlocks live in localStorage; every access is
 * guarded so the site works the same where storage is blocked.
 *
 * They are small challenges, not "scrolled past it": each one asks the visitor
 * to do something (finish a case study, use the palette, find a cheat code).
 * The `arcade` ones only exist inside the secret arcade theme and don't count
 * toward the platinum that unlocks it. Their icons are in trophy-icons.tsx.
 */

export type VisitorAchievementId =
  | "tourist"
  | "reader"
  | "hacker"
  | "stack"
  | "konami"
  | "duality"
  | "polyglot"
  | "collector"
  | "boss"
  | "snaker"
  | "cartographer"
  | "chatter"
  | "invader";

export const visitorAchievements: {
  id: VisitorAchievementId;
  /** unlocks when this element's top passes the middle of the screen */
  section?: string;
  arcade?: true;
}[] = [
  { id: "tourist" },
  { id: "reader", section: "case-end" },
  { id: "hacker" },
  { id: "stack" },
  { id: "konami" },
  { id: "duality" },
  { id: "polyglot" },
  { id: "collector", arcade: true },
  { id: "boss", arcade: true },
  { id: "snaker", arcade: true },
  { id: "cartographer", arcade: true },
  { id: "chatter", arcade: true },
  { id: "invader", arcade: true },
];

/** The ones that count toward the platinum. */
export const mainAchievements = visitorAchievements.filter((a) => !a.arcade);
export const arcadeAchievements = visitorAchievements.filter((a) => a.arcade);

export const LOCALES_KEY = "kh:seen-locales";
export const PAGES_KEY = "kh:seen-pages";

/** Pages the tourist has to visit; a case study counts as one. */
export const TOURIST_PAGES = ["/about", "/now", "/projects/"];

/** Fired by any component that hands out a trophy (the palette, the skills files…). */
const EARN_EVENT = "kh:earn";

export function earnAchievement(id: VisitorAchievementId) {
  window.dispatchEvent(new CustomEvent<VisitorAchievementId>(EARN_EVENT, { detail: id }));
}

export function onEarn(handler: (id: VisitorAchievementId) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<VisitorAchievementId>).detail);
  window.addEventListener(EARN_EVENT, listener);
  return () => window.removeEventListener(EARN_EVENT, listener);
}

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

/** Every trophy, arcade ones included: the legend skin and the certificate. */
export function isLegend(snapshot: string) {
  const got = new Set(snapshot.split(","));
  return visitorAchievements.every((a) => got.has(a.id));
}

/**
 * Starts the hunt over: every trophy, the pages and languages seen, the coins
 * and the skin they unlocked. The arcade theme switches off too (it is the
 * platinum's reward, and some trophies live outside it); best scores are kept.
 */
export function resetAchievements() {
  if (arcadeSnapshot()) setArcade(false);
  for (const key of [KEY, LOCALES_KEY, PAGES_KEY, "kh:coins", "kh:skin"])
    try {
      localStorage.removeItem(key);
    } catch {
      // nothing stored, nothing to clear
    }
  for (const event of [RESET_EVENT, EVENT, "kh:coins", "kh:skin"])
    window.dispatchEvent(new Event(event));
}

const RESET_EVENT = "kh:reset";

export function onReset(handler: () => void) {
  window.addEventListener(RESET_EVENT, handler);
  return () => window.removeEventListener(RESET_EVENT, handler);
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

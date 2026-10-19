import {
  earnAchievement,
  readList,
  writeList,
} from "@/components/shared/visitor-achievements-data";

/*
 * Small shared state for the arcade theme's extras, kept in localStorage
 * (guarded) and broadcast with window events: the coins hidden around the
 * page, the avatar skin they unlock, the avatar's mood, and the contact boss.
 */

/* ---------- coins: collect them all to unlock the rock skin and the guitar ---------- */

export const COINS = [
  "hero",
  "character",
  "projects",
  "map",
  "arcade",
  "saves",
  "boss",
  "credits",
] as const;
export type CoinId = (typeof COINS)[number];

export const COINS_KEY = "kh:coins";
const COINS_EVENT = "kh:coins";

export function readCoins(): string[] {
  return readList(COINS_KEY).filter((id) => (COINS as readonly string[]).includes(id));
}

export function collectCoin(id: CoinId) {
  const got = new Set([...readCoins(), id]);
  writeList(COINS_KEY, [...got]);
  window.dispatchEvent(new Event(COINS_EVENT));
  if (got.size === COINS.length) earnAchievement("collector");
}

export function subscribeCoins(onChange: () => void) {
  window.addEventListener(COINS_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COINS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export const coinsSnapshot = () => readCoins().join(",");

/* ---------- the avatar's skin ---------- */

export const SKINS = ["hacker", "rock", "legend"] as const;
export type Skin = (typeof SKINS)[number];
export const SKIN_KEY = "kh:skin";
const SKIN_EVENT = "kh:skin";

export function readSkin(): Skin {
  try {
    const skin = localStorage.getItem(SKIN_KEY);
    return (SKINS as readonly string[]).includes(skin ?? "") ? (skin as Skin) : "hacker";
  } catch {
    return "hacker";
  }
}

export function setSkin(skin: Skin) {
  try {
    localStorage.setItem(SKIN_KEY, skin);
  } catch {
    // lasts for this visit
  }
  window.dispatchEvent(new Event(SKIN_EVENT));
}

export function subscribeSkin(onChange: () => void) {
  window.addEventListener(SKIN_EVENT, onChange);
  return () => window.removeEventListener(SKIN_EVENT, onChange);
}

/* ---------- the avatar's mood: what its screen-face shows for a moment ---------- */

export type Mood = "idle" | "happy" | "wow" | "angry" | "talk";
const MOOD_EVENT = "kh:avatar";

/** Every avatar on the page shows `mood` (and hops, if `jump`) for `ms`, then goes idle. */
export function emitAvatar(mood: Mood, { ms = 900, jump = false } = {}) {
  window.dispatchEvent(new CustomEvent(MOOD_EVENT, { detail: { mood, ms, jump } }));
}

export function onAvatar(handler: (detail: { mood: Mood; ms: number; jump: boolean }) => void) {
  const listener = (event: Event) =>
    handler((event as CustomEvent<{ mood: Mood; ms: number; jump: boolean }>).detail);
  window.addEventListener(MOOD_EVENT, listener);
  return () => window.removeEventListener(MOOD_EVENT, listener);
}

/* ---------- the contact boss: its health is the form fields still missing ---------- */

const FORM_EVENT = "kh:form-progress";

/** How many of a form's required fields are valid, broadcast to the boss. */
export function reportForm(form: HTMLFormElement) {
  const fields = [...form.querySelectorAll<HTMLInputElement>("[required]")];
  const valid = fields.filter((field) => field.value.trim() && field.checkValidity()).length;
  window.dispatchEvent(new CustomEvent(FORM_EVENT, { detail: { valid, total: fields.length } }));
}

export function onFormProgress(handler: (progress: { valid: number; total: number }) => void) {
  const listener = (event: Event) =>
    handler((event as CustomEvent<{ valid: number; total: number }>).detail);
  window.addEventListener(FORM_EVENT, listener);
  return () => window.removeEventListener(FORM_EVENT, listener);
}

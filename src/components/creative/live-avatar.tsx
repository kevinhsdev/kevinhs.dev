"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  emitAvatar,
  onAvatar,
  readSkin,
  subscribeSkin,
  type Mood,
  type Skin,
} from "@/components/shared/arcade-state";
import { arcadeSnapshot, earnAchievement } from "@/components/shared/visitor-achievements-data";
import { cn } from "@/lib/utils";
import { PixelAvatar } from "./pixel-avatar";

/*
 * The hacker sprite brought to life: it wears the skin picked in the inventory,
 * shows the mood other parts of the page send it (arcade-state.ts) and hops
 * when asked. The CSS reads the data attributes set here.
 */
export function LiveAvatar({ walking, className }: { walking?: boolean; className?: string }) {
  const skin = useSyncExternalStore(subscribeSkin, readSkin, (): Skin => "hacker");
  const [mood, setMood] = useState<Mood>("idle");
  const [hops, setHops] = useState(0);
  const [morphs, setMorphs] = useState(0);
  const t = useTranslations("arcade.skins");
  // a new skin plays a flash and a burst with its name, so the change is seen
  useEffect(() => subscribeSkin(() => setMorphs((n) => n + 1)), []);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const off = onAvatar(({ mood: next, ms, jump }) => {
      setMood(next);
      if (jump) setHops((n) => n + 1);
      clearTimeout(timer);
      timer = setTimeout(() => setMood("idle"), ms);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);
  return (
    <span className={cn("px-live", className)} data-mood={mood} data-skin={skin}>
      {/* a new key restarts the hop and flash animations */}
      <span
        key={`${hops}-${morphs}`}
        className={cn(hops > 0 && "px-hop", morphs > 0 && "px-flash")}
      >
        <PixelAvatar walking={walking} />
      </span>
      {morphs > 0 && (
        <span key={morphs} aria-hidden className="px-morph" data-label={`${t(skin)}!`} />
      )}
    </span>
  );
}

/**
 * Makes the avatars react to the page: a happy hop when the pointer reaches a
 * button or link, and surprise when the contact section comes into view.
 * Mounted once; does nothing outside the arcade theme.
 */
export function AvatarDirector() {
  useEffect(() => {
    let last = 0;
    const onOver = (event: PointerEvent) => {
      if (!arcadeSnapshot() || event.pointerType !== "mouse") return;
      if (!(event.target as HTMLElement).closest("a, button")) return;
      const now = event.timeStamp;
      if (now - last < 1200) return;
      last = now;
      emitAvatar("happy", { jump: true });
    };
    const contact = document.getElementById("contact");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && arcadeSnapshot()) emitAvatar("wow", { ms: 1600, jump: true });
      },
      { threshold: 0.35 },
    );
    if (contact) io.observe(contact);
    window.addEventListener("pointerover", onOver);
    return () => {
      window.removeEventListener("pointerover", onOver);
      io.disconnect();
    };
  }, []);
  return null;
}

const TYPE_MS = 28;

/**
 * The character sheet's portrait: click the hacker and it talks, RPG style,
 * one typed line at a time. Hearing it to the end earns the "chatter" trophy.
 */
export function NpcPortrait({ label }: { label: string }) {
  const t = useTranslations("arcade.npc");
  const lines = t.raw("lines") as string[];
  const [line, setLine] = useState<number | null>(null);
  const [typed, setTyped] = useState(0);
  const next = useRef<HTMLButtonElement>(null);
  const text = line === null ? "" : (lines[line] ?? "");
  const done = typed >= text.length;

  // type the current line out, keeping the avatar's mouth moving meanwhile
  useEffect(() => {
    if (line === null) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    emitAvatar("talk", { ms: calm ? 600 : text.length * TYPE_MS + 300 });
    if (calm) {
      const frame = requestAnimationFrame(() => setTyped(text.length));
      return () => cancelAnimationFrame(frame);
    }
    const id = setInterval(() => setTyped((n) => (n >= text.length ? n : n + 1)), TYPE_MS);
    return () => clearInterval(id);
  }, [line, text]);

  useEffect(() => {
    if (line !== null) next.current?.focus({ preventScroll: true });
  }, [line]);

  function open() {
    setTyped(0);
    setLine(0);
  }

  function advance() {
    if (line === null) return;
    if (!done) return setTyped(text.length);
    if (line + 1 >= lines.length) {
      setLine(null);
      earnAchievement("chatter");
      emitAvatar("happy", { jump: true });
      return;
    }
    setTyped(0);
    setLine(line + 1);
  }

  return (
    <>
      <button type="button" className="px-portrait" onClick={open} aria-label={label}>
        <LiveAvatar />
        <span className="px-portrait-tag" aria-hidden>
          P1
        </span>
        <span className="px-portrait-hint" aria-hidden>
          ▶ {t("talk")}
        </span>
      </button>
      {line !== null && (
        <div
          className="px-dialog"
          role="dialog"
          aria-label={t("title")}
          onKeyDown={(event) => event.key === "Escape" && setLine(null)}
        >
          <span className="px-dialog-face" aria-hidden>
            <LiveAvatar />
          </span>
          <div className="min-w-0 flex-1">
            <p className="px-dialog-name">{t("name")}</p>
            <p aria-live="polite">
              {text.slice(0, typed)}
              <span className="sr-only">{text.slice(typed)}</span>
            </p>
          </div>
          <button ref={next} type="button" className="px-dialog-next" onClick={advance}>
            {line + 1 >= lines.length && done ? t("close") : t("next")}
            <span aria-hidden>
              {" "}
              {line + 1}/{lines.length}
            </span>
          </button>
        </div>
      )}
    </>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { jumpTo } from "@/motion/smooth";
import { KevinMark } from "./logo";
import "./curtain.css";

/** Runs before paint: no entrance screen on a repeat visit, with reduced motion or with ?pronto. */
export const CURTAIN_SCRIPT = `try{if(sessionStorage.getItem('pl')||matchMedia('(prefers-reduced-motion: reduce)').matches||/[?&]pronto\\b/.test(location.search))document.documentElement.classList.add('pl-skip')}catch(e){}`;

/**
 * A page to go to, or something to do on this page (a jump to a section) behind the curtain;
 * if it returns a promise, the curtain waits for it.
 */
type Action = string | (() => void | Promise<void>);
let cover: ((action: Action, label?: string) => void) | null = null;
let seq = 0;

/** Drops the curtain with `label` (or the destination's name), does `action` behind it, lifts it. */
export function curtainTo(action: Action, label?: string) {
  if (cover) cover(action, label);
  else if (typeof action === "function") action();
  else location.assign(action);
}

const bare = (path: string) => path.replace(/^\/(pt|en)(?=\/|$)/, "") || "/";

/**
 * One accent-coloured curtain for two jobs. On the first visit of a session it covers the page
 * while it loads ("kevin.load()") and lifts once it has; afterwards, a link to another page (or
 * a menu jump to a section) drops it over the screen with the destination's name, goes there
 * behind it and lifts it again.
 */
export function Curtain({ labels }: { labels: Record<string, string> }) {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  // the id of the navigation waiting behind the curtain (0: none)
  const pending = useRef(0);
  const [label, setLabel] = useState("");

  // the entrance: lift once the page has loaded, never before ~0.9 s
  useEffect(() => {
    const el = ref.current!;
    if (document.documentElement.classList.contains("pl-skip")) {
      el.dataset.state = "idle";
      return;
    }
    const lift = () =>
      window.setTimeout(
        () => {
          el.dataset.state = "reveal";
          try {
            sessionStorage.setItem("pl", "1");
          } catch {}
        },
        Math.max(0, 900 - performance.now()),
      );
    if (document.readyState === "complete") lift();
    else window.addEventListener("load", lift, { once: true });
  }, []);

  useEffect(() => {
    cover = (action, name) => {
      const el = ref.current!;
      if (name === undefined && typeof action === "string") {
        const url = new URL(action, location.href);
        const key = url.hash.slice(1) || (bare(url.pathname).split("/")[1] ?? "");
        name = labels[key] ?? labels[""];
      }
      setLabel(name ?? "");
      el.dataset.state = "cover";
      const id = (pending.current = ++seq);
      const lift = () => {
        if (pending.current !== id) return;
        pending.current = 0;
        el.dataset.state = "reveal";
      };
      window.setTimeout(() => {
        if (typeof action === "string") router.push(action);
        else Promise.resolve(action()).then(() => window.setTimeout(lift, 200));
      }, 600);
      // never leave the page covered if the navigation goes nowhere
      window.setTimeout(lift, 8000);
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target || a.hasAttribute("download") || a.closest(".sm")) return;
      const url = new URL(a.href);
      if (url.origin !== location.origin || /\.\w+$/.test(url.pathname)) return;
      // same page (a hash, or the same page in the other language): no curtain; a section of
      // this page is reached with jumpTo, which knows where pinned sections really are
      if (bare(url.pathname) === bare(location.pathname)) {
        if (url.hash && url.pathname === location.pathname) {
          e.preventDefault();
          history.replaceState(null, "", url.hash);
          void jumpTo(url.hash.slice(1));
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      cover!(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      cover = null;
    };
  }, [router, labels]);

  // the new page is in: go to its section if the address names one (the browser's own jump
  // comes before the pinned sections add their height), then lift
  useEffect(() => {
    const hash = location.hash.slice(1);
    const settled = hash ? jumpTo(hash) : Promise.resolve();
    if (!pending.current) return;
    pending.current = 0;
    void settled.then(() =>
      requestAnimationFrame(() => {
        if (ref.current) ref.current.dataset.state = "reveal";
      }),
    );
  }, [pathname]);

  return (
    <div
      ref={ref}
      className="cur"
      data-state="boot"
      aria-hidden="true"
      onAnimationEnd={(e) => {
        const el = e.currentTarget;
        if (e.target === el && el.dataset.state === "reveal") el.dataset.state = "idle";
      }}
    >
      <KevinMark className="cur-mark" />
      <p className="cur-label">{label}</p>
      <p className="cur-load">
        kevin.load()
        <span className="cur-caret" />
      </p>
    </div>
  );
}

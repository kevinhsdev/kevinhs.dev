"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

// Strong ease-in-out: the circle is on-screen movement, not an entrance.
const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";

/**
 * Light/dark toggle. The new theme spreads from the button in a growing circle
 * (View Transitions API) while the icon spins in. Without View Transitions, or
 * with reduced motion, the switch is instant. Both icons are rendered and
 * swapped with CSS, so there is no hydration flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("theme");
  const { resolvedTheme, setTheme } = useTheme();
  const icons = useRef<HTMLSpanElement>(null);

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const apply = () => {
      // Set the class ourselves so the new snapshot already has the new theme;
      // next-themes then stores the choice and keeps the class in sync.
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
      setTheme(next);
    };

    if (reduceMotion || typeof document.startViewTransition !== "function") {
      apply();
      return;
    }

    // From the click point (or the button's center when activated by keyboard).
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          { duration: 650, easing: EASE_IN_OUT, pseudoElement: "::view-transition-new(root)" },
        );
        icons.current?.animate(
          { rotate: ["-120deg", "0deg"], scale: [0.4, 1], opacity: [0, 1] },
          { duration: 500, easing: "cubic-bezier(0.23, 1, 0.32, 1)", delay: 120 },
        );
      })
      .catch(() => {});
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggle")}
      title={t("toggle")}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:text-foreground",
        className,
      )}
    >
      <span ref={icons} className="inline-flex">
        <Sun aria-hidden className="hidden size-[18px] dark:block" />
        <Moon aria-hidden className="size-[18px] dark:hidden" />
      </span>
    </button>
  );
}

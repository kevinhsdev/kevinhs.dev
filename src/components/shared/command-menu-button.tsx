"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { openCommandMenu } from "./command-menu";

const isApple = () => /Mac|iPhone|iPad/.test(navigator.userAgent);

export function CommandMenuButton({ className }: { className?: string }) {
  const t = useTranslations("command");
  // "Ctrl K" on the server and on Windows/Linux; "⌘K" on Apple devices.
  const apple = useSyncExternalStore(
    () => () => {},
    isApple,
    () => false,
  );

  return (
    <button
      type="button"
      onClick={openCommandMenu}
      aria-label={t("open")}
      aria-keyshortcuts={apple ? "Meta+K" : "Control+K"}
      className={cn(
        "inline-flex h-11 items-center gap-1 rounded-full border-border px-3 font-mono text-xs text-muted transition-colors duration-150 hover:text-foreground pointer-fine:border",
        className,
      )}
    >
      {/* Touch devices get an icon; a keyboard shortcut means nothing there. */}
      <Search aria-hidden className="size-[18px] pointer-fine:hidden" />
      <span className="hidden gap-1 pointer-fine:inline-flex">
        <kbd className="font-mono">{apple ? "⌘" : "Ctrl"}</kbd>
        <kbd className="font-mono">K</kbd>
      </span>
    </button>
  );
}

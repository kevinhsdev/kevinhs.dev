"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("theme");
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label={t("toggle")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-accent-soft",
        className,
      )}
    >
      <Sun aria-hidden className="size-[18px] dark:hidden" />
      <Moon aria-hidden className="hidden size-[18px] dark:block" />
    </button>
  );
}

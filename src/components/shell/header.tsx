"use client";

import { FolderKanban, House, Mail, Route, UserRound, Wrench, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import CircularNavigation from "@/components/ui/circular-navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { scrollToTarget } from "@/motion/smooth";
import { LocaleToggle } from "./locale-toggle";
import { KevinMark } from "./logo";

type Item = { key: string; href: string; icon: LucideIcon };

// Sections of the home are anchors; About is its own page.
const ITEMS: Item[] = [
  { key: "home", href: "/", icon: House },
  { key: "journey", href: "/#journey", icon: Route },
  { key: "projects", href: "/#projects", icon: FolderKanban },
  { key: "skills", href: "/#skills", icon: Wrench },
  { key: "contact", href: "/#contact", icon: Mail },
  { key: "about", href: "/about", icon: UserRound },
];

/** Fixed header: the mark, then language, theme and the menu (a glass circle). */
export function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function go(href: string) {
    const [path, hash] = href.split("#");
    const onPage = (path || "/") === pathname;
    if (onPage && hash) {
      const el = document.getElementById(hash);
      if (el) return scrollToTarget(el);
    }
    if (onPage && !hash) return scrollToTarget(0);
    router.push(href);
  }

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6"
        data-print="hide"
      >
        <Link
          href="/"
          className="glass pointer-events-auto flex h-11 items-center gap-2.5 rounded-full px-4 text-sm font-semibold"
        >
          <KevinMark className="h-4 w-auto text-accent" />
          <span className="max-sm:sr-only">Kevin Henrique</span>
        </Link>
        <div className="glass pointer-events-auto flex items-center gap-0.5 rounded-full p-0.5">
          <LocaleToggle />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            {t("menu.label")}
            <span aria-hidden className="flex w-4 flex-col gap-[4px]">
              <span className="h-[1.5px] rounded-full bg-current" />
              <span className="h-[1.5px] rounded-full bg-current" />
            </span>
          </button>
        </div>
      </header>
      <CircularNavigation
        isOpen={open}
        toggleMenu={() => setOpen((v) => !v)}
        label={t("menu.navigation")}
        closeLabel={t("menu.close")}
        activeHref={`/${locale}${pathname === "/" ? "" : pathname}`}
        navItems={ITEMS.map((item) => ({
          name: t(`nav.${item.key}`),
          href: `/${locale}${item.href === "/" ? "" : item.href}`,
          icon: item.icon,
        }))}
        onNavigate={(item, event) => {
          event.preventDefault();
          const href = ITEMS.find((i) => t(`nav.${i.key}`) === item.name)?.href ?? "/";
          // Let the circle start closing so the scroll doesn't fight the focus return.
          window.setTimeout(() => go(href), 60);
        }}
      />
    </>
  );
}

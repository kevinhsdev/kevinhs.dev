"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import {
  openCommandMenu,
  scrollToAnchor,
  useRegisteredNavigation,
} from "@/components/shared/command-menu";
import { CopyEmailButton, CvButton, GitHubButton, LinkedInButton } from "@/components/shared/ctas";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const OPEN_EVENT = "site-menu:open";

/**
 * Opens the site menu if the page has one; otherwise falls back to the command
 * palette. The menu claims the (cancelable) event to signal it is there.
 */
export function openSiteMenu() {
  const claimed = !window.dispatchEvent(new Event(OPEN_EVENT, { cancelable: true }));
  if (!claimed) openCommandMenu();
}

/** Two bars that read as "menu"; the drawer's close button shows the X. */
export function MenuIcon({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex w-5 flex-col gap-[5px]", className)}>
      <span className="h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-out-quint group-hover:-translate-y-px" />
      <span className="h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-out-quint group-hover:translate-y-px" />
    </span>
  );
}

/**
 * Side drawer menu: slides in from the right, links cascade in. Rendered inline
 * (no portal) so it inherits the version's palette tokens. Radix handles focus
 * trapping, Escape and screen-reader semantics. Opened by click, so it may
 * animate; the keyboard palette (⌘K) stays instant.
 */
export function SiteMenu({ linkClassName }: { linkClassName?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const navigation = useRegisteredNavigation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = (event: Event) => {
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  function go(href: string) {
    setOpen(false);
    // Wait for the drawer to start leaving so the scroll isn't fighting the focus return.
    window.setTimeout(() => {
      if (!scrollToAnchor(href)) router.push(href);
    }, 60);
  }

  const chip =
    "inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-[border-color,background-color,color] duration-200 hover:border-foreground";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Overlay className="site-menu-overlay fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" />
      <Dialog.Content
        aria-describedby={undefined}
        className="site-menu fixed inset-y-0 right-0 z-50 flex w-[min(36rem,100vw)] flex-col overflow-y-auto bg-surface pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-foreground shadow-[-40px_0_80px_-40px_rgb(0_0_0/0.6)] outline-none"
      >
        <div className="flex items-center justify-between px-6 pt-5 sm:px-10">
          <Dialog.Title className="font-mono text-xs tracking-widest text-muted uppercase">
            {t("menu.navigation")}
          </Dialog.Title>
          <Dialog.Close
            aria-label={t("menu.close")}
            className="group inline-flex size-12 items-center justify-center rounded-full border border-border transition-[border-color,rotate] duration-300 ease-out-quint hover:rotate-90 hover:border-foreground"
          >
            <X aria-hidden className="size-5" />
          </Dialog.Close>
        </div>

        <nav aria-label={t("menu.navigation")} className="flex-1 px-6 pt-8 sm:px-10">
          <ul className="flex flex-col border-t border-border">
            {navigation.map((item, index) => (
              <li
                key={item.href}
                className="site-menu-item border-b border-border"
                style={{ ["--i" as string]: index }}
              >
                <a
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    go(item.href);
                  }}
                  className="group flex min-h-16 items-center gap-5 py-3"
                >
                  <span className="w-6 font-mono text-xs text-muted tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "flex-1 transition-[translate,color] duration-300 ease-out-quint group-hover:translate-x-2 group-hover:text-accent",
                      // A version may bring its own display face (and weight); default otherwise.
                      linkClassName ?? "text-4xl font-semibold tracking-tight",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    aria-hidden
                    className="size-2 scale-0 rounded-full bg-accent transition-transform duration-300 ease-out-quint group-hover:scale-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="site-menu-item grid gap-8 px-6 py-8 sm:grid-cols-2 sm:px-10"
          style={{ ["--i" as string]: navigation.length }}
        >
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">
              {t("menu.socials")}
            </p>
            <div className="flex flex-wrap gap-2">
              <LinkedInButton source="site-menu" className={chip}>
                <LinkedInIcon className="size-4" /> LinkedIn
              </LinkedInButton>
              <GitHubButton source="site-menu" className={chip}>
                <GitHubIcon className="size-4" /> GitHub
                <ArrowUpRight aria-hidden className="size-3.5" />
              </GitHubButton>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">
              {t("nav.contact")}
            </p>
            <div className="flex flex-wrap gap-2">
              <CvButton
                source="site-menu"
                className={cn(
                  chip,
                  "border-accent bg-accent text-accent-contrast hover:opacity-90",
                )}
              />
              <CopyEmailButton source="site-menu" className={chip} />
            </div>
          </div>
        </div>

        <div
          className="site-menu-item flex items-center justify-between gap-2 border-t border-border px-6 py-4 sm:px-10"
          style={{ ["--i" as string]: navigation.length + 1 }}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              window.setTimeout(openCommandMenu, 60);
            }}
            className="inline-flex h-11 items-center gap-2 rounded-full px-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            <Search aria-hidden className="size-4" />
            {t("menu.search")}
            <kbd className="rounded border border-border px-1.5 font-mono text-[11px]">⌘K</kbd>
          </button>
          <div className="flex items-center">
            <LocaleToggle />
            <ThemeToggle />
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

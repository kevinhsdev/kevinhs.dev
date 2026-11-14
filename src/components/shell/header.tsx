"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { pick, profile } from "@/content";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { Locale } from "@/i18n/routing";
import { Link, usePathname } from "@/i18n/navigation";
import { jumpTo, scrollToTarget } from "@/motion/smooth";
import { curtainTo } from "./curtain";
import { LocaleToggle } from "./locale-toggle";
import { KevinMark } from "./logo";
import { SiteMenu } from "./site-menu";

type Item = { key: string; href: string; photo: string };

// Sections of the home are anchors; About is its own page.
const ITEMS: Item[] = [
  { key: "home", href: "/", photo: "/about/adesivos.jpg" },
  { key: "journey", href: "/#journey", photo: "/about/aviao.jpg" },
  { key: "projects", href: "/#projects", photo: "/about/notebook.jpg" },
  { key: "skills", href: "/#skills", photo: "/about/guitarra.jpg" },
  { key: "contact", href: "/#contact", photo: "/about/volei-jogo.jpg" },
  { key: "about", href: "/about", photo: "/about/teclado.jpg" },
];

/** Fixed header: the mark, then language, theme and the full-screen menu. */
export function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // every menu jump goes behind the curtain with the section's name; on this page, it just
  // scrolls there while covered
  function go(href: string, label: string) {
    const [path, hash] = href.split("#");
    if ((path || "/") === pathname) {
      return curtainTo(() => {
        if (!hash) return scrollToTarget(0, true);
        history.replaceState(null, "", `#${hash}`);
        return jumpTo(hash);
      }, label);
    }
    curtainTo(`/${locale}${path === "/" || !path ? "" : path}${hash ? `#${hash}` : ""}`, label);
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
          <span className="roll-text max-sm:sr-only">
            <span className="flex h-11 items-center whitespace-nowrap">{t("brand.codeBy")}</span>
            <span aria-hidden className="flex h-11 items-center whitespace-nowrap">
              {profile.name}
            </span>
          </span>
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
      <SiteMenu
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={(i) => go(ITEMS[i]!.href, t(`nav.${ITEMS[i]!.key}`))}
        active={ITEMS.findIndex((i) => i.href === pathname)}
        items={ITEMS.map((item) => ({
          name: t(`nav.${item.key}`),
          href: `/${locale}${item.href === "/" ? "" : item.href}`,
          photo: item.photo,
        }))}
        labels={{
          brand: t("brand.codeBy"),
          navigation: t("menu.navigation"),
          close: t("menu.close"),
          closeShort: t("menu.closeShort"),
          status: pick(profile.status, locale as Locale),
          find: t("menu.find"),
          where: `${pick(profile.location, locale as Locale)} · ${t("hero.availability")}`,
        }}
        links={[
          { label: "LinkedIn", href: profile.links.linkedin },
          { label: "GitHub", href: profile.links.github },
          { label: "Instagram", href: profile.links.instagram },
        ]}
      />
    </>
  );
}

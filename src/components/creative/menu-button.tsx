"use client";

import { MenuIcon, openSiteMenu } from "@/components/shared/site-menu";

/** "Menu" pill in the header; opens the side drawer. */
export function MenuButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openSiteMenu}
      className="group ml-1 inline-flex h-11 items-center gap-2.5 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-accent hover:text-accent-contrast active:scale-[0.97]"
    >
      <span className="sr-only sm:not-sr-only">{label}</span>
      <MenuIcon className="w-4" />
    </button>
  );
}

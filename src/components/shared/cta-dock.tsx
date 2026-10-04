"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LinkedInIcon } from "@/components/shared/brand-icons";
import { CopyEmailButton, CvButton, LinkedInButton } from "@/components/shared/ctas";
import { cn } from "@/lib/utils";

/**
 * Keeps the three primary CTAs one click away after the hero scrolls out of
 * view (the hero has its own). The menu lives in the fixed header only. Hidden docks are `inert`, so they can't be
 * tabbed into while invisible.
 */
export function CtaDock({
  watch,
  source,
  className,
  itemClassName,
}: {
  /** ids of elements that, while visible, hide the dock (the hero, a footer with its own CTAs). */
  watch: string[];
  source: string;
  className?: string;
  itemClassName?: string;
}) {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  const watchKey = watch.join(",");
  useEffect(() => {
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setVisible(onScreen.size === 0);
    });
    watchKey.split(",").forEach((id) => {
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    });
    return () => observer.disconnect();
  }, [watchKey]);

  const item = cn(
    "inline-flex size-12 items-center justify-center rounded-full transition-[background-color,color,scale] duration-150 active:scale-[0.95]",
    itemClassName,
  );

  return (
    <nav
      aria-label={t("nav.toolbar")}
      data-visible={visible}
      inert={!visible}
      className={cn(
        "dock fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-2 sm:right-6 sm:bottom-6",
        className,
      )}
      data-print="hide"
    >
      <span className="inline-flex">
        <CvButton source={source} compact className={item} />
      </span>
      <span className="inline-flex">
        <LinkedInButton source={source} className={item}>
          <LinkedInIcon className="size-4" />
          <span className="sr-only">{t("cta.linkedin")}</span>
        </LinkedInButton>
      </span>
      <span className="inline-flex">
        <CopyEmailButton source={source} compact className={item} />
      </span>
    </nav>
  );
}

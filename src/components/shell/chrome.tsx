"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { startSmooth, stopSmooth } from "@/motion/smooth";

/**
 * Site-wide client pieces: the toaster and Lenis. While the agents build the hero
 * (html.monta), Lenis waits for the end of the build, or for the page to drop
 * "monta" (5 s safeguard, client navigation away).
 */
export function Chrome() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("monta")) {
      startSmooth();
      return () => stopSmooth();
    }
    const go = () => {
      done();
      startSmooth();
    };
    const mo = new MutationObserver(() => {
      if (!html.classList.contains("monta")) go();
    });
    const done = () => {
      mo.disconnect();
      window.removeEventListener("enxame:fim", go);
    };
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("enxame:fim", go);
    return () => {
      done();
      stopSmooth();
    };
  }, []);
  return <Toaster theme={resolvedTheme === "light" ? "light" : "dark"} position="bottom-left" />;
}

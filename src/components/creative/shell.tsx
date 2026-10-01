import { Anton } from "next/font/google";
import type { ReactNode } from "react";
import "@/styles/creative.css";

// Condensed display face for the giant type. A single static weight keeps the
// file small, which matters because the hero headline is the LCP candidate.
const display = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The site's look (display font and styles) for any route: the home, case
 * studies, /now and the 404 all render inside it.
 */
export function CreativeShell({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} min-h-dvh bg-background text-foreground`}>{children}</div>
  );
}

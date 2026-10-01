"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { useIdleMount } from "@/components/shared/use-idle-mount";
import { TOASTER_EVENT } from "@/lib/toast";

// sonner is only needed after an action (copy email, send form): load it after idle.
const ThemedToaster = dynamic(
  () => import("@/components/shared/toaster").then((m) => m.ThemedToaster),
  { ssr: false },
);

function LazyToaster() {
  return useIdleMount(TOASTER_EVENT) ? <ThemedToaster /> : null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <LazyToaster />
    </ThemeProvider>
  );
}

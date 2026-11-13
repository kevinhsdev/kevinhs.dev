"use client";

import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useCopyEmail } from "@/components/shell/ctas";
import { Globe } from "@/components/ui/cobe-globe";
import { profile } from "@/content";

const SAO_PAULO: [number, number] = [-23.5505, -46.6333];
const MALTA: [number, number] = [35.9184, 14.4897];

/** The dotted globe with São Paulo and Malta, coloured for the current theme. */
export function AboutGlobe({ labels }: { labels: { home: string; malta: string } }) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  // the theme is only known in the browser; until then the card keeps the space empty
  if (!mounted || !resolvedTheme) return <div className="abt-globe" aria-hidden="true" />;
  const dark = resolvedTheme === "dark";
  return (
    <div className="abt-globe">
      <Globe
        // glow is set once, when the globe is made: a new one per theme
        key={resolvedTheme}
        markers={[
          { id: "sp", location: SAO_PAULO, label: labels.home },
          { id: "mt", location: MALTA, label: labels.malta },
        ]}
        arcs={[{ id: "sp-mt", from: SAO_PAULO, to: MALTA }]}
        baseColor={dark ? [0.12, 0.17, 0.32] : [1, 1, 1]}
        markerColor={dark ? [0.3, 0.55, 1] : [0.12, 0.31, 0.84]}
        arcColor={dark ? [0.3, 0.55, 1] : [0.12, 0.31, 0.84]}
        glowColor={dark ? [0.08, 0.13, 0.3] : [0.85, 0.89, 0.97]}
        dark={dark ? 1 : 0}
        mapBrightness={dark ? 5 : 10}
        markerSize={0.04}
        theta={0.25}
        arcHeight={0.35}
      />
    </div>
  );
}

/** A small "new message" window: to, subject with a blinking caret, and send copies the e-mail. */
export function AboutEmailCard({
  labels,
}: {
  labels: { title: string; to: string; subject: string; subjectText: string };
}) {
  const { copy, copied, label: action } = useCopyEmail();
  const Icon = copied ? Check : Copy;
  return (
    <button
      type="button"
      onClick={copy}
      className="abt-link abt-email-btn"
      data-copied={copied || undefined}
    >
      <span className="abt-label">{labels.title}</span>
      <span className="abt-compose">
        <span className="abt-compose-row">
          <span className="abt-k">{labels.to}</span>
          <span className="abt-email">{profile.email}</span>
        </span>
        <span className="abt-compose-row">
          <span className="abt-k">{labels.subject}</span>
          <span className="abt-subject">
            {labels.subjectText}
            <i className="abt-caret" aria-hidden="true" />
          </span>
        </span>
      </span>
      <span className="abt-send">
        <Icon aria-hidden className="size-4" />
        {action}
      </span>
    </button>
  );
}

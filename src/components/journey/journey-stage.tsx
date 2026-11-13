"use client";

import { useEffect, useMemo, useRef } from "react";
import type { GalleryPhoto } from "@/content";
import {
  distanceKm,
  greatCircle,
  journeyState,
  MALTA,
  SCREENS,
  SP,
  SPAIN,
  USA,
  type JourneyState,
} from "@/lib/journey";
import { createPin } from "@/motion/pin";
import { prefersReduced } from "@/motion/reduced";
import { scrollToTarget } from "@/motion/smooth";
import { Title, switcher } from "@/motion/title";
import { JourneyGlobe, type GlobeCard, type GlobeLabel, type GlobeView } from "./journey-globe";

type Photo = Omit<GalleryPhoto, "alt" | "caption"> & { alt: string; caption: string };

export type JourneyData = {
  title: string;
  titles: { kicker: string; heading: string; line?: string; cta?: string }[];
  sp: Photo[];
  malta: Photo[];
  globe: { sp: string; malta: string; spain: string; usa: string };
};

const SP_MALTA_KM = distanceKm(SP, MALTA);

/** What the globe shows for a state: where it faces, the cities, the arcs so far, the card. */
function globeView(st: JourneyState, still = false): GlobeView {
  const { spMalta, planned } = st.arc;
  const late = st.chapter === "plans" || st.chapter === "outro";
  const flying = spMalta > 0 && spMalta < 1;
  const markers: GlobeView["markers"] = [{ at: SP, size: 4, live: true }];
  if (st.show.malta) markers.push({ at: MALTA, size: 4, live: true });
  if (flying) markers.push({ at: greatCircle(SP, MALTA, spMalta), size: 5, plane: true });
  const arcs: GlobeView["arcs"] = [];
  if (spMalta > 0) arcs.push({ from: SP, to: MALTA, t: spMalta, trail: flying });
  if (planned > 0) {
    markers.push({ at: SPAIN, size: 3.5 }, { at: USA, size: 3.5 });
    arcs.push({ from: MALTA, to: SPAIN, t: planned }, { from: MALTA, to: USA, t: planned });
  }
  return {
    lat: st.globe.lat,
    lon: st.globe.lon,
    zoom: st.globe.scale,
    still,
    markers,
    arcs,
    labels: {
      sp: true,
      malta: st.show.malta && !late,
      spain: planned > 0.6,
      usa: planned > 0.6,
    },
    card: st.card,
    cardProgress: st.cardProgress,
    landing: st.landing,
    km: flying ? SP_MALTA_KM * spMalta : null,
  };
}

export function JourneyStage({ data }: { data: JourneyData }) {
  const root = useRef<HTMLElement>(null);
  const view = useRef<GlobeView>(globeView(journeyState(0)));

  // Madrid and Cambridge sit close in the last frames: one label each side, never on top.
  const labels = useMemo<GlobeLabel[]>(
    () => [
      { id: "sp", text: data.globe.sp, at: SP, side: "top" },
      { id: "malta", text: data.globe.malta, at: MALTA, side: "top" },
      { id: "spain", text: data.globe.spain, at: SPAIN, side: "right" },
      { id: "usa", text: data.globe.usa, at: USA, side: "left" },
    ],
    [data.globe],
  );
  // SP's three photos come out of São Paulo, Malta's six out of Malta (see journeyState.card)
  const cards = useMemo<GlobeCard[]>(
    () => [
      ...data.sp.map((p) => ({ ...p, at: SP })),
      ...data.malta.map((p) => ({ ...p, at: MALTA })),
    ],
    [data.sp, data.malta],
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (prefersReduced()) {
      // Reduced motion: no pin; the chapters stack, the globe holds one frame with the arc drawn.
      el.dataset.static = "true";
      view.current = globeView(journeyState(4.6), true);
      return;
    }

    const show = switcher(
      [...el.querySelectorAll<HTMLElement>(".jr-title")].map((t) => new Title(t)),
    );
    const render = (s: number) => {
      const st = journeyState(s);
      view.current = globeView(st);
      el.dataset.chapter = st.chapter;
      el.style.setProperty("--s", String(s));
      show(st.titleIndex);
    };
    const pin = createPin({ el, screens: SCREENS, render });
    return () => pin.kill();
  }, []);

  return (
    // The wrapper is React's: ScrollTrigger wraps the pinned section in a spacer div.
    <div>
      <section ref={root} id="journey" className="jr dark" aria-labelledby="journey-title">
        <h2 id="journey-title" className="sr-only">
          {data.title}
        </h2>
        {/* how far through the journey: fills with the scroll (--s, 0..SCREENS) */}
        <div
          className="jr-progress"
          aria-hidden
          style={{ "--screens": SCREENS } as React.CSSProperties}
        />
        <JourneyGlobe view={view} labels={labels} cards={cards} />

        <div className="jr-titles">
          {data.titles.map((t, i) => (
            <div key={i} className="jr-title">
              <p className="jr-kicker" data-line>
                {t.kicker}
              </p>
              <h3 className="jr-heading" data-line>
                {t.heading}
              </h3>
              {t.line && (
                <p className="jr-line" data-line>
                  {t.line}
                </p>
              )}
              {t.cta && (
                <a
                  className="jr-cta"
                  data-line
                  href="#contact"
                  onClick={(e) => {
                    const target = document.getElementById("contact");
                    if (!target) return;
                    e.preventDefault();
                    scrollToTarget(target);
                  }}
                >
                  {t.cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import PolaroidLineCarousel from "@/components/ui/polaroid-line-carousel";
import type { GalleryPhoto } from "@/content";
import {
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
import { JourneyGlobe, type GlobeView } from "./journey-globe";

type Photo = Omit<GalleryPhoto, "alt" | "caption"> & { alt: string; caption: string };

export type JourneyData = {
  title: string;
  titles: { kicker: string; heading: string; line?: string; cta?: string }[];
  sp: Photo[];
  malta: Photo[];
  globe: { sp: string; malta: string; spain: string; usa: string };
  carousel: { label: string; previous: string; next: string; status: string };
};

/** What the globe draws for a state: the cities, the arcs so far, and the travelling dot. */
function globeView(st: JourneyState): GlobeView {
  const markers: GlobeView["markers"] = [
    { id: "sp", location: SP, size: 0.04 },
    { id: "malta", location: MALTA, size: 0.04 },
  ];
  const arcs: GlobeView["arcs"] = [];
  const { spMalta, planned } = st.arc;
  if (spMalta > 0) {
    arcs.push({ id: "sp-malta", from: SP, to: MALTA });
    if (spMalta < 1)
      markers.push({ id: "plane", location: greatCircle(SP, MALTA, spMalta), size: 0.06 });
  }
  if (planned > 0) {
    markers.push(
      { id: "spain", location: SPAIN, size: 0.03 },
      { id: "usa", location: USA, size: 0.03 },
    );
    arcs.push(
      { id: "malta-spain", from: MALTA, to: SPAIN },
      { id: "malta-usa", from: MALTA, to: USA },
    );
  }
  return { phi: st.globe.phi, theta: st.globe.theta, markers, arcs };
}

export function JourneyStage({ data }: { data: JourneyData }) {
  const root = useRef<HTMLElement>(null);
  const view = useRef<GlobeView>(globeView(journeyState(0)));

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const globe = el.querySelector<HTMLElement>(".jr-globe")!;
    const scenes = {
      sp: el.querySelector<HTMLElement>(".jr-scene--sp")!,
      malta: el.querySelector<HTMLElement>(".jr-scene--malta")!,
    };
    const photos = [...el.querySelectorAll<HTMLElement>(".jr-photo")];

    if (prefersReduced()) {
      // Reduced motion: no pin; the chapters stack, the globe holds one frame with the arc drawn.
      el.dataset.static = "true";
      view.current = globeView(journeyState(4.6));
      return;
    }

    const show = switcher(
      [...el.querySelectorAll<HTMLElement>(".jr-title")].map((t) => new Title(t)),
    );

    const render = (s: number) => {
      const st = journeyState(s);
      view.current = globeView(st);
      globe.style.scale = String(st.globe.scale / 2.4);
      globe.style.setProperty("--gz", String(st.globe.scale));
      for (const key of ["sp", "malta"] as const) {
        const on = st.scene === key ? st.iris : 0;
        scenes[key].style.clipPath = `circle(${on * 75}% at var(--cx) 50%)`;
        scenes[key].style.visibility = on > 0 ? "visible" : "hidden";
      }
      // SP photos: the one the current title is about is lit (titles 1–3 → photos 0–2).
      const active = st.titleIndex !== null ? st.titleIndex - 1 : -1;
      photos.forEach((p, i) => (p.dataset.active = String(i === active)));
      el.dataset.chapter = st.chapter;
      show(st.titleIndex);
    };

    const pin = createPin({ el, screens: SCREENS, render });
    return () => pin.kill();
  }, []);

  const statusTpl = data.carousel.status;
  return (
    // The wrapper is React's: ScrollTrigger wraps the pinned section in a spacer div.
    <div>
      <section ref={root} id="journey" className="jr" aria-labelledby="journey-title">
        <h2 id="journey-title" className="sr-only">
          {data.title}
        </h2>
        <div className="jr-globe">
          <JourneyGlobe
            view={view}
            labels={[
              { id: "sp", text: data.globe.sp },
              { id: "malta", text: data.globe.malta },
              { id: "spain", text: data.globe.spain },
              { id: "usa", text: data.globe.usa },
            ]}
          />
        </div>

        <div className="jr-scene jr-scene--sp">
          <ul className="jr-photos">
            {data.sp.map((p, i) => (
              <li key={p.id} className="jr-photo" data-i={i} data-active="false">
                {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size collage tiles */}
                <img
                  src={p.src}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  loading="lazy"
                  style={{ objectPosition: p.focus }}
                />
                <span className="jr-pin">
                  <i aria-hidden />
                  {p.caption}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="jr-scene jr-scene--malta">
          <div className="jr-polaroid">
            <PolaroidLineCarousel
              slides={data.malta.map((p) => ({ image: p.src, title: p.caption, alt: p.alt }))}
              height="100%"
              autoplay={0}
              string="var(--muted)"
              background="transparent"
              ink="var(--foreground)"
              ariaLabel={data.carousel.label}
              labels={{
                previous: data.carousel.previous,
                next: data.carousel.next,
                status: (i, n, title) =>
                  statusTpl.replace("{i}", String(i)).replace("{n}", String(n)) +
                  (title ? `: ${title}` : ""),
              }}
            />
          </div>
        </div>

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

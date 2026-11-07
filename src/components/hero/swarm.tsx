"use client";

import { useEffect } from "react";

type Labels = {
  group: string;
  scanning: string;
  agents: string;
  layers: string;
  builtBy: string;
  agentsIn: string;
  tour: string;
  touring: string;
  speed: string;
  redo: string;
  locale: string;
};

/**
 * The agents' bar (fixed at the bottom) and the swarm engine from the Kairo
 * bundle, started once after hydration. The engine is plain DOM + GSAP and
 * reads the [data-camada] layers of the hero.
 */
export function Swarm({ labels }: { labels: Labels }) {
  useEffect(() => {
    const w = window as Window & { __enxame?: boolean };
    let cancelled = false;
    // Strict Mode mounts effects twice in dev: the first run is cancelled before the import resolves.
    if (!w.__enxame) {
      void Promise.all([import("./engine/enxame.js"), import("./engine/barra.js")]).then(
        ([{ enxame }, { barra }]) => {
          if (!cancelled && !w.__enxame) enxame(barra());
        },
      );
    }
    return () => {
      cancelled = true;
      if (!w.__enxame) return;
      // Really leaving the page (client navigation): drop the agents' stage and open the hero
      // built next time, since the boot script only runs on a full page load.
      document.querySelector(".enxame")?.remove();
      document.documentElement.classList.replace("monta", "pronto");
      w.__enxame = false;
    };
  }, []);

  return (
    <div
      className="barra dark"
      data-estado="escaneando"
      role="group"
      aria-label={labels.group}
      data-print="hide"
      data-tour={labels.tour}
      data-touring={labels.touring}
      data-speed={labels.speed}
      data-locale={labels.locale}
    >
      <div className="barra__scan" aria-hidden>
        <span>{labels.scanning}</span>
        <i className="barra__trilho">
          <i />
        </i>
      </div>
      <div className="barra__info">
        <span className="barra__avatares" aria-hidden>
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="barra__agentes">
          <b>18</b> {labels.agents}
        </span>
        <span className="barra__camadas">
          <b className="barra__feitas">0</b> / <span className="barra__total">0</span>
          <span className="barra__palavra"> {labels.layers}</span>
        </span>
        <span className="barra__fim">
          <span className="barra__palavra">{labels.builtBy} </span>
          <b className="barra__fim-n">18</b> {labels.agentsIn} <b className="barra__fim-t">0 s</b>
        </span>
        <i className="barra__trilho barra__progresso" aria-hidden>
          <i />
        </i>
      </div>
      <span className="barra__acoes">
        <button className="barra__btn barra__tour" type="button" aria-pressed="false">
          {labels.tour}
        </button>
        <button
          className="barra__btn barra__vel"
          type="button"
          aria-label={labels.speed.replace("{v}", "1")}
        >
          1×
        </button>
        <button className="barra__btn barra__refaz" type="button" aria-label={labels.redo}>
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M15.6 10.4a5.6 5.6 0 1 1-1.7-4.6" />
            <path d="M14.4 2.9v3.4H11" />
          </svg>
        </button>
      </span>
    </div>
  );
}
